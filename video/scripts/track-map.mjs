/**
 * Cartographie d'un morceau : tempo, puis énergie mesure par mesure.
 *
 * Sert à deux décisions de montage qu'on ne peut pas prendre à l'oreille ici :
 * — le tempo, pour que chaque coupe tombe sur un temps fort ;
 * — la courbe d'énergie, pour choisir la fenêtre de 28 secondes du morceau qui
 *   monte au bon moment (la révélation) et se résout à la fin (le logo).
 *
 * Usage : node scripts/track-map.mjs out/music/zone-mono.wav
 * Entrée : WAV mono 16 bits, fréquence quelconque.
 */
import { readFileSync } from "node:fs";

const file = readFileSync(process.argv[2]);
const SR = file.readUInt32LE(24);
let off = 12;
while (file.toString("ascii", off, off + 4) !== "data") off += 8 + file.readUInt32LE(off + 4);
const data = file.subarray(off + 8);
const n = Math.floor(data.length / 2);
const x = new Float32Array(n);
for (let i = 0; i < n; i++) x[i] = data.readInt16LE(i * 2) / 32768;

// ---- Enveloppe d'attaques : hausse d'énergie par tranche de 10 ms.
const hop = Math.round(SR * 0.01);
const frames = Math.floor(n / hop);
const energy = new Float32Array(frames);
for (let f = 0; f < frames; f++) {
  let e = 0;
  for (let i = f * hop; i < (f + 1) * hop; i++) e += x[i] * x[i];
  energy[f] = Math.log10(1e-9 + e / hop);
}
const onset = new Float32Array(frames);
for (let f = 1; f < frames; f++) onset[f] = Math.max(0, energy[f] - energy[f - 1]);

// ---- Tempo par autocorrélation des attaques, entre 70 et 180 BPM.
let bestLag = 0;
let bestScore = -Infinity;
for (let bpm = 70; bpm <= 180; bpm += 0.25) {
  const lag = 6000 / bpm; // en tranches de 10 ms
  let s = 0;
  for (let f = 0; f + lag * 4 < frames; f++) {
    const a = onset[f];
    s += a * (onset[Math.round(f + lag)] + 0.5 * onset[Math.round(f + lag * 2)] + 0.25 * onset[Math.round(f + lag * 4)]);
  }
  if (s > bestScore) {
    bestScore = s;
    bestLag = lag;
  }
}
const bpm = 6000 / bestLag;

// ---- Phase : décalage qui aligne le plus d'attaques sur la grille.
let bestPhase = 0;
let phaseScore = -Infinity;
for (let p = 0; p < bestLag; p++) {
  let s = 0;
  for (let k = 0; p + k * bestLag < frames; k++) s += onset[Math.round(p + k * bestLag)];
  if (s > phaseScore) {
    phaseScore = s;
    bestPhase = p;
  }
}

console.log(`tempo ≈ ${bpm.toFixed(1)} BPM — un temps = ${(60 / bpm).toFixed(3)} s, une mesure (4 temps) = ${((4 * 60) / bpm).toFixed(3)} s`);
console.log(`premier temps fort ≈ ${(bestPhase / 100).toFixed(2)} s\n`);

// ---- Énergie par mesure, en barres.
const bar = (4 * 60) / bpm;
const start = bestPhase / 100;
const rows = [];
for (let b = 0; start + (b + 1) * bar <= n / SR; b++) {
  const s0 = Math.round((start + b * bar) * SR);
  const s1 = Math.round((start + (b + 1) * bar) * SR);
  let e = 0;
  for (let i = s0; i < s1; i++) e += x[i] * x[i];
  rows.push({ b, t: start + b * bar, db: 10 * Math.log10(1e-9 + e / (s1 - s0)) });
}
const max = Math.max(...rows.map((r) => r.db));
for (const r of rows) {
  const len = Math.max(0, Math.round((r.db - (max - 24)) * 2));
  console.log(`mesure ${String(r.b).padStart(3)}  ${r.t.toFixed(2).padStart(7)} s  ${r.db.toFixed(1).padStart(6)} dB  ${"█".repeat(len)}`);
}
