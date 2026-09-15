/**
 * Les sons du film, par synthèse — texture « crème ».
 *
 * La première bande-son était sèche et aiguë : sinusoïdes à 1–2 kHz, attaques
 * de 1 ms, bips. Tout ici suit la règle inverse :
 * — le corps du son est grave ou médium, jamais au-dessus de 5 kHz ;
 * — les attaques durent au moins 4 ms, ce qui retire le « clic » ;
 * — une réverbération courte et sombre soude chaque son à la pièce.
 *
 * Le clavier est modélisé comme un vrai clavier mécanique « thock » : une
 * impulsion étouffée qui excite quatre résonances de boîtier (180, 410, 920,
 * 2100 Hz), puis le relâchement de la touche, plus faible, 55 ms plus tard.
 * C'est la résonance du boîtier, pas l'impact, qui donne le son crémeux.
 *
 * Usage : node scripts/synth-film-sfx.mjs → public/sfx-film/*.wav
 */
import { mkdirSync, writeFileSync } from "node:fs";

const SR = 48000;
const TAU = Math.PI * 2;
const OUT = new URL("../public/sfx-film/", import.meta.url);
mkdirSync(OUT, { recursive: true });

let seed = 0x1234567;
const white = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) / 4294967296) * 2 - 1;
};
/** Bruit rose (Kellet) : l'énergie baisse vers l'aigu, comme l'air réel. */
function pinkSource() {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  return () => {
    const w = white();
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    const v = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
    b6 = w * 0.115926;
    return v * 0.11;
  };
}

/** Résonateur à deux pôles (passe-bande à gain constant au pic). */
function resonator(f, q) {
  const w = (TAU * f) / SR;
  const r = Math.exp(-w / (2 * q));
  const a1 = -2 * r * Math.cos(w);
  const a2 = r * r;
  const g = 1 - r;
  let y1 = 0, y2 = 0;
  return (x) => {
    const y = g * x - a1 * y1 - a2 * y2;
    y2 = y1;
    y1 = y;
    return y;
  };
}

function lowpass(fc) {
  let s1 = 0, s2 = 0;
  const a = 1 - Math.exp((-TAU * fc) / SR);
  return (x) => {
    s1 += a * (x - s1);
    s2 += a * (s1 - s2);
    return s2;
  };
}

function svf() {
  let low = 0, band = 0;
  return (x, fc, damp = 0.7) => {
    const f = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6.5)) / SR);
    low += f * band;
    const high = x - low - damp * band;
    band += f * high;
    return { low, band, high };
  };
}

/** Pièce sombre et courte : peignes filtrés + passe-tout, légèrement décorrélés. */
function room(mono, wet, decay = 0.72, damp = 0.55) {
  const tail = Math.round(SR * 0.9);
  const n = mono.length + tail;
  const side = (combs, aps) => {
    const out = new Float32Array(n);
    const cb = combs.map((d) => ({ b: new Float32Array(Math.round((d * SR) / 44100)), i: 0, lp: 0 }));
    const ab = aps.map((d) => ({ b: new Float32Array(Math.round((d * SR) / 44100)), i: 0 }));
    for (let i = 0; i < n; i++) {
      const x = i < mono.length ? mono[i] : 0;
      let s = 0;
      for (const c of cb) {
        const y = c.b[c.i];
        c.lp = y * (1 - damp) + c.lp * damp;
        c.b[c.i] = x + c.lp * decay;
        c.i = (c.i + 1) % c.b.length;
        s += y;
      }
      s /= cb.length;
      for (const a of ab) {
        const y = a.b[a.i];
        const v = s + y * 0.5;
        a.b[a.i] = v;
        s = y - v * 0.5;
        a.i = (a.i + 1) % a.b.length;
      }
      out[i] = (i < mono.length ? mono[i] : 0) * (1 - wet * 0.4) + s * wet;
    }
    return out;
  };
  return [side([1116, 1188, 1277, 1356], [556, 441]), side([1139, 1211, 1300, 1379], [579, 464])];
}

function wav(name, [L, R], gain = 1) {
  let peak = 1e-9;
  for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const k = (0.89 / peak) * gain;
  let end = L.length;
  while (end > SR * 0.02 && Math.abs(L[end - 1] * k) < 0.0006 && Math.abs(R[end - 1] * k) < 0.0006) end--;
  const fade = Math.round(SR * 0.006);
  const buf = Buffer.alloc(44 + end * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + end * 4, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(end * 4, 40);
  for (let i = 0; i < end; i++) {
    const f = i > end - fade ? (end - i) / fade : 1;
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * k * f)) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * k * f)) * 32767), 46 + i * 4);
  }
  writeFileSync(new URL(`${name}.wav`, OUT), buf);
  console.log(`${name}.wav  ${(end / SR).toFixed(2)} s`);
}

const make = (s) => new Float32Array(Math.round(s * SR));

// ---------------------------------------------------------------- clavier
function thock(name, { tune = 1, depth = 1, body = 0.035 } = {}) {
  const x = make(0.2);
  const modes = [
    [180 * tune * depth, 7, 1.0],
    [410 * tune, 6, 0.7],
    [920 * tune, 4, 0.32],
    [2100 * tune, 3, 0.1],
  ].map(([f, q, g]) => ({ r: resonator(f, q), g }));
  const lp = lowpass(3800);
  const hit = (t0, amp) => {
    const s0 = Math.round(t0 * SR);
    for (let i = s0; i < x.length; i++) {
      const t = (i - s0) / SR;
      // Impulsion étouffée : 4 ms de montée, pas de front raide.
      const ex = t < 0.012 ? white() * Math.sin((Math.PI * t) / 0.012) * amp : 0;
      let y = 0;
      for (const m of modes) y += m.r(ex) * m.g;
      x[i] += lp(y) * Math.exp(-t / body) * 40;
    }
  };
  hit(0, 1);
  hit(0.055, 0.28);
  wav(name, room(x, 0.12), 0.9);
}

[1, 1.05, 0.96, 1.08, 0.93, 1.02].forEach((tune, i) => thock(`thock_${i}`, { tune }));
thock("space", { tune: 0.82, depth: 0.7, body: 0.06 });
thock("press", { tune: 0.74, depth: 0.8, body: 0.07 });

// ---------------------------------------------------------------- verre effleuré
function tap(name, f) {
  const L = make(1.2);
  const lp = lowpass(4200);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.006) * Math.exp(-t / 0.18);
    const v = Math.sin(TAU * f * t) + 0.18 * Math.sin(TAU * f * 2.76 * t) * Math.exp(-t / 0.05) + 0.1 * Math.sin(TAU * f * 0.5 * t);
    L[i] = lp(v * env);
  }
  wav(name, room(L, 0.38, 0.8, 0.5), 0.8);
}
[523.3, 587.3, 659.3, 783.99].forEach((f, i) => tap(`tap_${i}`, f));

// ---------------------------------------------------------------- air
function air(name, T, f0, f1, f2, peakAt = 0.6) {
  const pinkL = pinkSource();
  const pinkR = pinkSource();
  const fl = svf();
  const fr = svf();
  const L = make(T);
  const R = make(T);
  for (let i = 0; i < L.length; i++) {
    const t = i / L.length;
    const fc = t < peakAt ? f0 * Math.pow(f1 / f0, t / peakAt) : f1 * Math.pow(f2 / f1, (t - peakAt) / (1 - peakAt));
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, t / peakAt / 2 + (t > peakAt ? (t - peakAt) / (1 - peakAt) / 2 : 0))), 1.6);
    L[i] = fl(pinkL(), fc, 0.6).band * env;
    R[i] = fr(pinkR(), fc * 1.06, 0.6).band * env;
  }
  const mono = L.map((v, i) => (v + R[i]) / 2);
  const [rl, rr] = room(mono, 1, 0.75, 0.6);
  wav(name, [rl.map((v, i) => (i < L.length ? L[i] : 0) * 0.8 + v * 0.3), rr.map((v, i) => (i < R.length ? R[i] : 0) * 0.8 + v * 0.3)]);
}
air("air", 0.9, 280, 1500, 500);
air("air_long", 1.6, 220, 1200, 420, 0.55);

// ---------------------------------------------------------------- inspiration avant le décollage
{
  const T = 2.1;
  const pink = pinkSource();
  const f = svf();
  const L = make(T);
  let ph = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / L.length;
    const env = Math.pow(t, 2.2) * (t > 0.97 ? (1 - t) / 0.03 : 1);
    ph += (TAU * (110 * Math.pow(2, t))) / SR;
    L[i] = f(pink(), 300 * Math.pow(12, t), 0.7).band * env + Math.sin(ph) * env * 0.25;
  }
  wav("inhale", room(L, 0.3), 0.85);
}

// ---------------------------------------------------------------- impact doux
function impact(name, { f0 = 62, f1 = 36, body = 0.7, air = 0.3, wet = 0.35 } = {}) {
  const L = make(2.6);
  const lp = lowpass(420);
  let ph = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    ph += (TAU * (f1 + (f0 - f1) * Math.exp(-t / 0.18))) / SR;
    const sub = Math.sin(ph) * Math.min(1, t / 0.008) * Math.exp(-t / body);
    const n = lp(white()) * Math.exp(-t / 0.07) * air * 6;
    L[i] = Math.tanh(1.3 * (sub + n));
  }
  wav(name, room(L, wet, 0.8, 0.6));
}
impact("impact");
impact("impact_soft", { f0: 80, f1: 48, body: 0.35, air: 0.18, wet: 0.25 });

// ---------------------------------------------------------------- résolution chaude
function bells(name, notes, { decay = 1.2, spread = 0.07, wet = 0.5 } = {}) {
  const L = make(3.2);
  const R = make(3.2);
  const lpl = lowpass(3600);
  const lpr = lowpass(3600);
  notes.forEach((f, k) => {
    const s0 = Math.round(k * spread * SR);
    for (let i = s0; i < L.length; i++) {
      const t = (i - s0) / SR;
      const mod = 0.9 * Math.exp(-t / 0.5) * Math.sin(TAU * f * 2 * t);
      const v = Math.sin(TAU * f * t + mod) * Math.min(1, t / 0.012) * Math.exp(-t / decay) * 0.4;
      L[i] += v;
      R[i] += v * (0.85 + 0.15 * ((k % 2) * 2 - 1));
    }
  });
  const fl = L.map((v) => lpl(v));
  const fr = R.map((v) => lpr(v));
  const mono = fl.map((v, i) => (v + fr[i]) / 2);
  const [rl, rr] = room(mono, 1, 0.84, 0.5);
  wav(name, [rl.map((v, i) => (i < fl.length ? fl[i] : 0) * 0.7 + v * wet), rr.map((v, i) => (i < fr.length ? fr[i] : 0) * 0.7 + v * wet)], 0.9);
}
bells("resolve", [261.6, 329.6, 392.0, 523.3]);
bells("halo", [523.3, 659.3, 783.99, 987.8], { decay: 1.6, spread: 0.11, wet: 0.65 });
