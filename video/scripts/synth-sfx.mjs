/**
 * Fabrique les effets sonores de la publicité, par synthèse.
 *
 * Aucun échantillon importé : chaque son est calculé ici, à partir de bruit,
 * de sinusoïdes et de filtres. Ils appartiennent donc au projet, sans licence
 * à vérifier ni plateforme à créditer — ce qui compte pour une publicité payante.
 *
 * Direction : « smooth ». Attaques adoucies, aigus filtrés, une réverbération
 * commune qui soude les sons entre eux au lieu de les empiler. Rien de
 * strident : l'oreille doit être relancée en permanence, jamais agressée.
 *
 * Usage : node scripts/synth-sfx.mjs → public/sfx/*.wav
 */
import { mkdirSync, writeFileSync } from "node:fs";

const SR = 44100;
const OUT = new URL("../public/sfx/", import.meta.url);
mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- outils
let seed = 0x9e3779b9;
const noise = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) / 4294967296) * 2 - 1;
};

/** Filtre à variables d'état (Chamberlin) : passe-bas, passe-bande, passe-haut. */
function svf() {
  let low = 0;
  let band = 0;
  return (x, fc, damp = 0.7) => {
    const f = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6.5)) / SR);
    low += f * band;
    const high = x - low - damp * band;
    band += f * high;
    return { low, band, high };
  };
}

const TAU = Math.PI * 2;
const expo = (a, b, t) => a * Math.pow(b / a, t);

/** Réverbération de Schroeder : quatre peignes et deux passe-tout, décalés en stéréo. */
function reverb(mono, { decay = 0.8, damp = 0.4, seconds = 1.4 } = {}) {
  const n = mono.length + Math.round(SR * seconds);
  const side = (combs, aps) => {
    const out = new Float32Array(n);
    const cb = combs.map((d) => ({ b: new Float32Array(d), i: 0, lp: 0 }));
    const ab = aps.map((d) => ({ b: new Float32Array(d), i: 0 }));
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
      out[i] = s;
    }
    return out;
  };
  return [side([1116, 1188, 1277, 1356], [556, 441]), side([1139, 1211, 1300, 1379], [579, 464])];
}

/** Mélange sec + réverbération ; accepte un son mono ou stéréo. */
function space(L, R, wet) {
  const mono = L.map((v, i) => (v + R[i]) / 2);
  const [rl, rr] = reverb(mono);
  const n = rl.length;
  const oL = new Float32Array(n);
  const oR = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    oL[i] = (i < L.length ? L[i] : 0) * (1 - wet * 0.5) + rl[i] * wet;
    oR[i] = (i < R.length ? R[i] : 0) * (1 - wet * 0.5) + rr[i] * wet;
  }
  return [oL, oR];
}

/** Écrit un WAV 16 bits stéréo, crête à -1 dBFS × gain, silence final rogné. */
function wav(name, L, R = L, gain = 1) {
  let peak = 1e-9;
  for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const k = (0.89 / peak) * gain;
  let end = L.length;
  while (end > SR * 0.02 && Math.abs(L[end - 1] * k) < 0.0008 && Math.abs(R[end - 1] * k) < 0.0008) end--;
  const fade = Math.round(SR * 0.004);
  const data = Buffer.alloc(44 + end * 4);
  data.write("RIFF", 0);
  data.writeUInt32LE(36 + end * 4, 4);
  data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(2, 22);
  data.writeUInt32LE(SR, 24);
  data.writeUInt32LE(SR * 4, 28);
  data.writeUInt16LE(4, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(end * 4, 40);
  for (let i = 0; i < end; i++) {
    const f = i > end - fade ? (end - i) / fade : 1;
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * k * f)) * 32767), 44 + i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * k * f)) * 32767), 46 + i * 4);
  }
  writeFileSync(new URL(`${name}.wav`, OUT), data);
  console.log(`${name}.wav  ${(end / SR).toFixed(2)} s`);
}

const make = (sec) => new Float32Array(Math.round(sec * SR));

// ---------------------------------------------------------------- les sons

/** Souffle de transition : bruit filtré qui monte, culmine sur la coupe, retombe. */
function whoosh(name, { T = 0.5, f0 = 250, f1 = 2800, f2 = 900, peakAt = 0.65, wet = 0.25, gain = 1 } = {}) {
  const L = make(T);
  const R = make(T);
  const fl = svf();
  const fr = svf();
  for (let i = 0; i < L.length; i++) {
    const t = i / L.length;
    const fc = t < peakAt ? expo(f0, f1, t / peakAt) : expo(f1, f2, (t - peakAt) / (1 - peakAt));
    const a = t < peakAt ? Math.pow(t / peakAt, 2.2) : Math.pow(1 - (t - peakAt) / (1 - peakAt), 1.5);
    L[i] = fl(noise(), fc, 0.45).band * a;
    R[i] = fr(noise(), fc * 1.08, 0.45).band * a;
  }
  wav(name, ...space(L, R, wet), gain);
}

/** Pop de bulle : sinusoïde qui glisse vers le bas, attaque ronde. */
function pop(name, f, { T = 0.16, wet = 0.14 } = {}) {
  const L = make(T);
  let ph = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const fr = f + f * 0.9 * Math.exp(-t / 0.018);
    ph += (TAU * fr) / SR;
    const a = Math.min(1, t / 0.003) * Math.exp(-t / 0.045);
    L[i] = (Math.sin(ph) + 0.12 * Math.sin(ph * 2)) * a;
  }
  wav(name, ...space(L, L, wet));
}

/** Frappe de clavier : souffle bref et petit coup sourd. */
function key(name, fc) {
  const L = make(0.06);
  const f = svf();
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    L[i] = f(noise(), fc, 0.3).band * Math.exp(-t / 0.007) + 0.6 * Math.sin(TAU * 170 * t) * Math.exp(-t / 0.012);
  }
  wav(name, ...space(L, L, 0.06));
}

/** Tic d'horloge, net mais doux. */
function tick(name, f) {
  const L = make(0.09);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    L[i] = (Math.sin(TAU * f * t) + 0.2 * Math.sin(TAU * f * 2 * t)) * Math.min(1, t / 0.001) * Math.exp(-t / 0.014);
  }
  wav(name, ...space(L, L, 0.12));
}

/** Coup grave : sous-basse qui chute, bruit filtré, léger souffle de salle. */
function hit(name, { T = 1.4, f0 = 95, f1 = 42, body = 0.35, noiseAmt = 0.5, lp = 900, wet = 0.25, beat = 0 } = {}) {
  const L = make(T);
  const f = svf();
  let ph = 0;
  let ph2 = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const fr = expo(f0, f1, Math.min(1, t / 0.5));
    ph += (TAU * fr) / SR;
    ph2 += (TAU * (fr * 1.06 + beat)) / SR;
    const sub = (Math.sin(ph) + (beat ? Math.sin(ph2) : 0)) * Math.exp(-t / body);
    const n = f(noise(), lp, 0.9).low * Math.exp(-t / 0.06) * noiseAmt;
    L[i] = Math.tanh(1.6 * (sub + n));
  }
  wav(name, ...space(L, L, wet));
}

/** Montée : bruit qui s'ouvre vers l'aigu et note qui grimpe, coupure nette. */
function riser(name, T) {
  const L = make(T);
  const R = make(T);
  const fl = svf();
  const fr = svf();
  let ph = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / L.length;
    const fc = expo(300, 7000, t);
    const a = Math.pow(t, 2.5);
    ph += (TAU * expo(180, 720, t)) / SR;
    const tone = Math.sin(ph) * Math.pow(t, 2) * 0.35;
    L[i] = fl(noise(), fc, 0.5).band * a + tone;
    R[i] = fr(noise(), fc * 1.05, 0.5).band * a + tone;
  }
  wav(name, ...space(L, R, 0.2));
}

/** Cloche douce (synthèse FM), la brique des sons de résolution. */
function bell(buf, f, start, { amp = 1, decay = 0.9, index = 1.8 } = {}) {
  const s0 = Math.round(start * SR);
  for (let i = s0; i < buf.length; i++) {
    const t = (i - s0) / SR;
    const mod = index * Math.exp(-t / 0.4) * Math.sin(TAU * f * 2.01 * t);
    buf[i] += Math.sin(TAU * f * t + mod) * Math.min(1, t / 0.005) * Math.exp(-t / decay) * amp;
  }
}

function shimmer(name) {
  const L = make(2.2);
  const R = make(2.2);
  [659.3, 830.6, 987.8, 1244.5].forEach((f, i) => {
    bell(L, f, i * 0.06, { amp: 0.5, decay: 0.8 });
    bell(R, f * 1.003, i * 0.06 + 0.012, { amp: 0.5, decay: 0.8 });
  });
  wav(name, ...space(L, R, 0.5));
}

function chime(name) {
  const L = make(1.3);
  const R = make(1.3);
  bell(L, 1046.5, 0, { amp: 0.7, decay: 0.45, index: 1.2 });
  bell(R, 1046.5, 0.008, { amp: 0.7, decay: 0.45, index: 1.2 });
  bell(L, 1318.5, 0.09, { amp: 0.6, decay: 0.55, index: 1.2 });
  bell(R, 1318.5, 0.1, { amp: 0.6, decay: 0.55, index: 1.2 });
  wav(name, ...space(L, R, 0.38));
}

/** Balayage latéral : le son traverse l'image dans le sens où la carte arrive. */
function swipe(name, fromLeft) {
  const T = 0.3;
  const L = make(T);
  const R = make(T);
  const f = svf();
  for (let i = 0; i < L.length; i++) {
    const t = i / L.length;
    const v = f(noise(), expo(900, 3500, t), 0.45).band * Math.sin(Math.PI * Math.pow(t, 0.7));
    const th = (fromLeft ? 0.08 + 0.22 * t : 0.42 - 0.22 * t) * Math.PI;
    L[i] = v * Math.cos(th);
    R[i] = v * Math.sin(th);
  }
  wav(name, ...space(L, R, 0.15));
}

/** Trait de stylo : grattement bref, pour les constats barrés. */
function strike(name) {
  const L = make(0.22);
  const f = svf();
  for (let i = 0; i < L.length; i++) {
    const t = i / L.length;
    L[i] = f(noise(), expo(2500, 6000, t), 0.6).high * Math.min(1, t * 40) * (1 - t);
  }
  wav(name, ...space(L, L, 0.1), 0.8);
}

function blip(name, f) {
  const L = make(0.11);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    L[i] = (Math.sin(TAU * f * t) + 0.2 * Math.sin(TAU * f * 3 * t)) * Math.min(1, t / 0.002) * Math.exp(-t / 0.03);
  }
  wav(name, ...space(L, L, 0.12));
}

function click(name) {
  const L = make(0.14);
  const f = svf();
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    L[i] = Math.sin(TAU * 130 * t) * Math.exp(-t / 0.025) + f(noise(), 2000, 0.4).band * Math.exp(-t / 0.006) * 0.6;
  }
  wav(name, ...space(L, L, 0.1));
}

// ---------------------------------------------------------------- génération
whoosh("whoosh");
whoosh("whoosh_in", { T: 0.4, f0: 200, f1: 1600, f2: 700, peakAt: 0.85, wet: 0.2, gain: 0.8 });
riser("riser", 1.0);
riser("riser_short", 0.32);
hit("impact");
hit("boom", { T: 2.4, f0: 70, f1: 32, body: 0.8, noiseAmt: 0.3, lp: 500, wet: 0.35 });
hit("thud", { T: 0.4, f0: 150, f1: 70, body: 0.09, noiseAmt: 0.5, lp: 1200, wet: 0.15 });
hit("tension", { T: 1.1, f0: 98, f1: 92, body: 0.45, noiseAmt: 0.4, lp: 300, wet: 0.22, beat: 5.8 });
shimmer("shimmer");
chime("chime");
swipe("swipe_l", true);
swipe("swipe_r", false);
strike("strike");
click("click");
tick("tick", 1800);
tick("tick_hi", 2400);
[2800, 3200, 3600, 3000].forEach((fc, i) => key(`key_${i}`, fc));
for (let i = 0; i < 10; i++) pop(`pop_${i}`, 520 * Math.pow(2, i / 12));
[660, 784, 988, 1175].forEach((f, i) => blip(`blip_${i}`, f));
