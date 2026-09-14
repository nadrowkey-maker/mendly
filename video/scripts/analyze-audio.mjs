/**
 * Contrôle de la bande-son sans l'écouter.
 *
 * Lit l'audio décodé (PCM 16 bits mono, 48 kHz) et produit :
 * — une image : forme d'onde image par image, coupes de scène en blanc,
 *   coups majeurs en ambre, et en bas une bande qui rougit quand l'aigu
 *   (> ~5 kHz) domine — le signe d'un son strident ;
 * — un relevé : niveau par scène, trous de silence, attaques détectées au
 *   voisinage de chaque coup attendu.
 *
 * Usage : node scripts/analyze-audio.mjs out/analysis/fr.pcm out/analysis/fr.png
 */
import { readFileSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const [input, output] = process.argv.slice(2);
const SR = 48000;
const FPS = 30;
const PER_FRAME = SR / FPS;

// Le ffmpeg fourni par Remotion n'exporte pas de PCM brut : on lit un WAV et
// on cherche son bloc « data », dont la position varie selon les métadonnées.
const file = readFileSync(input);
let offset = 12;
let dataStart = 44;
let dataLength = file.length - 44;
while (offset + 8 <= file.length) {
  const id = file.toString("ascii", offset, offset + 4);
  const size = file.readUInt32LE(offset + 4);
  if (id === "data") {
    dataStart = offset + 8;
    dataLength = Math.min(size, file.length - dataStart);
    break;
  }
  offset += 8 + size + (size % 2);
}
const raw = file.subarray(dataStart, dataStart + dataLength);
const n = Math.floor(raw.length / 2);
const x = new Float32Array(n);
for (let i = 0; i < n; i++) x[i] = raw.readInt16LE(i * 2) / 32768;

const frames = Math.floor(n / PER_FRAME);
const rms = new Float32Array(frames);
const hf = new Float32Array(frames);
const peak = new Float32Array(frames * 3);

// L'aigu est estimé par la différence entre échantillons successifs : un
// filtre passe-haut du premier ordre, grossier mais suffisant pour repérer
// un son dont l'énergie est surtout au-dessus de quelques kilohertz.
for (let f = 0; f < frames; f++) {
  let e = 0;
  let eh = 0;
  const s0 = f * PER_FRAME;
  for (let i = s0; i < s0 + PER_FRAME; i++) {
    e += x[i] * x[i];
    const d = x[i] - (i > 0 ? x[i - 1] : 0);
    eh += d * d * 0.25;
    const col = Math.floor(((i - s0) / PER_FRAME) * 3);
    peak[f * 3 + col] = Math.max(peak[f * 3 + col], Math.abs(x[i]));
  }
  rms[f] = Math.sqrt(e / PER_FRAME);
  hf[f] = e > 1e-9 ? eh / e : 0;
}

const db = (v) => (v > 1e-6 ? 20 * Math.log10(v) : -120);

// ---------------------------------------------------------------- image
const W = frames * 3;
const H = 420;
const img = Buffer.alloc((W * 3 + 1) * H);
const put = (px, py, r, g, b) => {
  if (px < 0 || px >= W || py < 0 || py >= H) return;
  const o = py * (W * 3 + 1) + 1 + px * 3;
  img[o] = r;
  img[o + 1] = g;
  img[o + 2] = b;
};
for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) put(px, py, 14, 14, 16);

const MID = 170;
for (let px = 0; px < W; px++) {
  const h = Math.round(Math.sqrt(peak[px]) * 160);
  for (let dy = -h; dy <= h; dy++) put(px, MID + dy, 58, 168, 255);
}
const CUTS = [72, 204, 282, 522, 590, 650, 722];
const HITS = [51, 205, 219, 386, 446, 568, 782];
for (const c of CUTS) for (let py = 0; py < 340; py++) put(c * 3, py, 255, 255, 255);
for (const h of HITS) for (let py = 0; py < 24; py++) put(h * 3, py, 255, 180, 84);
for (let f = 0; f < frames; f++) {
  const t = Math.min(1, hf[f] / 0.35);
  for (let px = f * 3; px < f * 3 + 3; px++) {
    for (let py = 360; py < H; py++) put(px, py, Math.round(40 + 215 * t), Math.round(60 * (1 - t)), 40);
  }
}

const crcTable = Array.from({ length: 256 }, (_, k) => {
  let c = k;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;
ihdr[9] = 2;
writeFileSync(
  output,
  Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(img)),
    chunk("IEND", Buffer.alloc(0)),
  ])
);

// ---------------------------------------------------------------- relevé
const SCENES = [["Accroche", 0], ["Problème", 72], ["Révélation", 204], ["Démo", 282], ["Salle", 522], ["Nuit", 590], ["Récap", 650], ["Appel", 722]];
console.log("scène        niveau moyen   crête    aigu moyen   images silencieuses (< -45 dB)");
SCENES.forEach(([name, from], i) => {
  const to = i + 1 < SCENES.length ? SCENES[i + 1][1] : frames;
  let e = 0, p = 0, h = 0, silent = 0;
  for (let f = from; f < to; f++) {
    e += rms[f] * rms[f];
    p = Math.max(p, peak[f * 3], peak[f * 3 + 1], peak[f * 3 + 2]);
    h += hf[f];
    if (db(rms[f]) < -45) silent++;
  }
  const count = to - from;
  console.log(
    `${name.padEnd(12)} ${db(Math.sqrt(e / count)).toFixed(1).padStart(7)} dB  ${db(p).toFixed(1).padStart(6)} dB  ${(h / count).toFixed(3).padStart(8)}    ${silent}/${count}`
  );
});

console.log("\ncoup attendu → attaque la plus forte à ±3 images");
for (const hit of HITS) {
  let best = hit;
  let jump = -Infinity;
  for (let f = hit - 3; f <= hit + 3; f++) {
    const d = db(rms[f]) - db(rms[f - 1]);
    if (d > jump) {
      jump = d;
      best = f;
    }
  }
  console.log(`image ${String(hit).padStart(3)} → ${String(best).padStart(3)} (${best - hit >= 0 ? "+" : ""}${best - hit}), saut de ${jump.toFixed(1)} dB`);
}
