/**
 * La nappe musicale de fond, par synthèse.
 *
 * L'analyse de la première bande-son, effets seuls, montrait 115 images
 * silencieuses sur les 240 de la démo : entre deux sons, l'oreille décrochait.
 * La nappe comble ces trous sans rien raconter à la place des effets — des
 * accords filtrés et une pulsation douce, en retrait.
 *
 * Elle suit l'arc de la vidéo :
 *   accroche    bourdon grave et battement de cœur, filtre fermé (tension)
 *   problème    la mineur puis fa majeur 7, toujours sombre
 *   révélation  do majeur add9, le filtre s'ouvre d'un coup (la lumière)
 *   démo        la – fa – do – sol, pulsation à 150 BPM qui fait respirer les nappes
 *   salle/nuit  même boucle, puis ré mineur : la nuit est plus sombre
 *   récap       fa – sol, montée
 *   appel       do majeur add9, résolution, la pulsation s'arrête
 *
 * Elle appartient au projet, comme les effets : aucune licence à vérifier.
 * Si un morceau sous licence est posé dans src/audio/music.ts, elle se tait.
 *
 * Usage : node scripts/synth-bed.mjs → public/sfx/bed.wav
 */
import { mkdirSync, writeFileSync } from "node:fs";

const SR = 44100;
const DUR = 27.8;
const N = Math.round(DUR * SR);
const TAU = Math.PI * 2;
const OUT = new URL("../public/sfx/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const S = { hook: 0, problem: 2.4, reveal: 6.8, demo: 9.4, room: 17.4, night: 19.667, benefits: 21.667, cta: 24.067, end: 27.667 };
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

let seed = 0x2545f491;
const noise = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) / 4294967296) * 2 - 1;
};

function svf() {
  let low = 0;
  let band = 0;
  return (x, fc, damp) => {
    const f = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6.5)) / SR);
    low += f * band;
    const high = x - low - damp * band;
    band += f * high;
    return { low, band, high };
  };
}

/** [début en secondes, notes MIDI, fréquence de coupure du filtre]. */
const CHORDS = [
  [S.hook, [33, 45, 52], 340],
  [S.problem, [45, 52, 60], 520],
  [4.6, [41, 48, 57, 64], 580],
  [S.reveal, [48, 55, 64, 74], 2600],
  [S.demo, [45, 52, 60, 64], 1600],
  [11.4, [41, 48, 57, 60], 1600],
  [13.4, [48, 55, 60, 64], 1800],
  [15.4, [43, 50, 59, 62], 1800],
  [S.room, [45, 52, 60, 64], 1600],
  [18.6, [41, 48, 57, 60], 1600],
  [S.night, [38, 50, 57, 62], 1000],
  [20.7, [45, 52, 57, 60], 1000],
  [S.benefits, [41, 53, 57, 60], 2200],
  [22.9, [43, 55, 59, 62], 2400],
  [S.cta, [48, 55, 64, 67, 74], 2700],
];

const padL = new Float32Array(N);
const padR = new Float32Array(N);
const cutoff = new Float32Array(N);

// ---- Les nappes : trois dents de scie légèrement désaccordées par note.
CHORDS.forEach(([start, notes, fc], ci) => {
  const end = ci + 1 < CHORDS.length ? CHORDS[ci + 1][0] : S.end + 0.2;
  const s0 = Math.round(start * SR);
  const s1 = Math.min(N, Math.round((end + 0.6) * SR));
  for (let i = s0; i < N; i++) cutoff[i] = fc;
  for (const note of notes) {
    const f = midi(note);
    const detune = [-0.006, 0, 0.006];
    const phases = [Math.random(), Math.random(), Math.random()];
    for (let i = s0; i < s1; i++) {
      const t = (i - s0) / SR;
      const tail = end - start;
      const env = Math.min(1, t / 0.3) * (t > tail ? Math.max(0, 1 - (t - tail) / 0.6) : 1);
      let l = 0;
      let r = 0;
      detune.forEach((d, k) => {
        phases[k] = (phases[k] + (f * (1 + d)) / SR) % 1;
        const saw = 2 * phases[k] - 1;
        if (k !== 2) l += saw;
        if (k !== 0) r += saw;
      });
      const amp = 0.1 * env * (note < 40 ? 1.4 : 1);
      padL[i] += l * amp;
      padR[i] += r * amp;
    }
  }
});

// ---- Filtre : la coupure glisse d'un accord à l'autre au lieu de sauter.
{
  const fl = svf();
  const fr = svf();
  let fc = cutoff[0];
  const glide = Math.exp(-1 / (0.35 * SR));
  for (let i = 0; i < N; i++) {
    fc = cutoff[i] + (fc - cutoff[i]) * glide;
    const lfo = 1 + 0.12 * Math.sin((TAU * 0.25 * i) / SR);
    padL[i] = fl(padL[i], fc * lfo, 0.9).low;
    padR[i] = fr(padR[i], fc * lfo * 1.02, 0.9).low;
  }
}

const L = new Float32Array(N);
const R = new Float32Array(N);

// ---- Pulsation (150 BPM, une noire = 0,4 s), de la démo à la fin de l'appel.
const BEAT = 0.4;
const grooveStart = S.demo;
const grooveEnd = S.cta + 2.5;
const kickTimes = [];
for (let t = grooveStart; t < grooveEnd; t += BEAT) kickTimes.push(t);

for (let i = 0; i < N; i++) {
  const t = i / SR;
  // Respiration : la nappe se creuse à chaque temps et remonte en 150 ms.
  let pump = 1;
  if (t >= grooveStart && t < grooveEnd + 0.3) {
    const since = (t - grooveStart) % BEAT;
    pump = 1 - 0.38 * Math.exp(-since / 0.12);
  }
  L[i] = padL[i] * pump;
  R[i] = padR[i] * pump;
}

const addAt = (time, fn, dur) => {
  const s0 = Math.round(time * SR);
  for (let i = s0; i < Math.min(N, s0 + dur * SR); i++) {
    const [l, r] = fn((i - s0) / SR);
    L[i] += l;
    R[i] += r;
  }
};

// Grosse caisse douce : sinusoïde qui chute, aucune attaque sèche.
for (const t0 of kickTimes) {
  let ph = 0;
  addAt(t0, (t) => {
    ph += (TAU * (45 + 60 * Math.exp(-t / 0.03))) / SR;
    const v = Math.sin(ph) * Math.exp(-t / 0.16) * 0.42;
    return [v, v];
  }, 0.35);
}

// Charleston très bas, sur les croches, sauf la nuit (plus nue, plus sombre).
{
  const hp = svf();
  for (let t0 = grooveStart; t0 < grooveEnd; t0 += BEAT / 2) {
    if (t0 >= S.night && t0 < S.benefits) continue;
    const accent = Math.round((t0 - grooveStart) / (BEAT / 2)) % 2 ? 0.05 : 0.028;
    addAt(t0, (t) => {
      const v = hp(noise(), 8000, 0.5).high * Math.exp(-t / 0.02) * accent;
      return [v * 0.8, v];
    }, 0.08);
  }
}

// Battement de cœur de l'accroche et du problème : deux pulsations graves.
for (let t0 = 0.15; t0 < S.reveal - 0.3; t0 += 0.8) {
  for (const [offset, amp] of [[0, 0.34], [0.19, 0.22]]) {
    addAt(t0 + offset, (t) => {
      const v = Math.sin(TAU * 52 * t) * Math.min(1, t / 0.006) * Math.exp(-t / 0.11) * amp;
      return [v, v];
    }, 0.4);
  }
}

// Chute de sous-basse sous la révélation.
addAt(S.reveal, (t) => {
  const v = Math.sin(TAU * (38 + 30 * Math.exp(-t / 0.2)) * t) * Math.exp(-t / 1.4) * 0.45;
  return [v, v];
}, 3);

// ---- Réverbération commune et fondus d'entrée et de sortie.
function comb(x, delays, decay) {
  const out = new Float32Array(x.length);
  const cb = delays.map((d) => ({ b: new Float32Array(d), i: 0, lp: 0 }));
  for (let i = 0; i < x.length; i++) {
    let s = 0;
    for (const c of cb) {
      const y = c.b[c.i];
      c.lp = y * 0.55 + c.lp * 0.45;
      c.b[c.i] = x[i] + c.lp * decay;
      c.i = (c.i + 1) % c.b.length;
      s += y;
    }
    out[i] = s / cb.length;
  }
  return out;
}
const wetL = comb(L, [1116, 1188, 1277, 1356], 0.8);
const wetR = comb(R, [1139, 1211, 1300, 1379], 0.8);

let peak = 1e-9;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = Math.min(1, t / 0.08) * Math.min(1, Math.max(0, (DUR - t) / 0.8));
  L[i] = (L[i] * 0.8 + wetL[i] * 0.3) * fade;
  R[i] = (R[i] * 0.8 + wetR[i] * 0.3) * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}

const k = 0.89 / peak;
const data = Buffer.alloc(44 + N * 4);
data.write("RIFF", 0);
data.writeUInt32LE(36 + N * 4, 4);
data.write("WAVEfmt ", 8);
data.writeUInt32LE(16, 16);
data.writeUInt16LE(1, 20);
data.writeUInt16LE(2, 22);
data.writeUInt32LE(SR, 24);
data.writeUInt32LE(SR * 4, 28);
data.writeUInt16LE(4, 32);
data.writeUInt16LE(16, 34);
data.write("data", 36);
data.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * k)) * 32767), 44 + i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * k)) * 32767), 46 + i * 4);
}
writeFileSync(new URL("bed.wav", OUT), data);
console.log(`bed.wav  ${DUR.toFixed(1)} s`);
