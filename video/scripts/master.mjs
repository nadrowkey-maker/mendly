/**
 * Mastering : -14 LUFS intégrés, crêtes sous -1,5 dB.
 *
 * -14 LUFS est le niveau vers lequel TikTok, Instagram et YouTube normalisent.
 * Livrer plus fort ne rend pas la pub plus forte — la plateforme la baisse, en
 * écrasant au passage les coups qu'on a travaillés. Livrer au bon niveau garde
 * la dynamique intacte.
 *
 * Pourquoi le calcul est fait ici, et pas par ffmpeg : le ffmpeg fourni avec
 * Remotion ne contient ni limiteur ni compresseur, seulement `loudnorm`. Et
 * `loudnorm` seul, en une passe, livrait -15,6 LUFS avec une crête à
 * -1,4 dB — trop bas et trop haut à la fois. On mesure donc la sonie selon la
 * norme BS.1770, on applique un gain unique, et un limiteur à anticipation
 * rabote les seules crêtes qui dépassent. Le mixage reste celui qu'on a réglé.
 *
 * L'image est copiée telle quelle : aucun réencodage vidéo.
 *
 * Usage : node scripts/master.mjs out/mendly-ad-fr.mp4 [out/mendly-ad-en.mp4 …]
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";

const TARGET_LUFS = -14;
// Plafond d'échantillon à -2,5 dB : l'encodage AAC recrée des crêtes entre les
// échantillons. Mesuré sur la version française, un plafond à -2 dB ressortait
// à -1,28 dBTP après encodage — au-dessus de la cible. D'où le demi-décibel
// de marge supplémentaire.
const CEILING = Math.pow(10, -2.5 / 20);
const SR = 48000;

function ffmpeg(args) {
  const cmd = ["npx", "remotion", "ffmpeg", ...args.map((a) => (/[\s;,]/.test(a) ? `"${a}"` : a))].join(" ");
  const res = spawnSync(cmd, { shell: true, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (res.status !== 0) throw new Error(res.stderr);
  return res;
}

function readWav(path) {
  const file = readFileSync(path);
  let offset = 12;
  while (file.toString("ascii", offset, offset + 4) !== "data") {
    offset += 8 + file.readUInt32LE(offset + 4);
  }
  const data = file.subarray(offset + 8);
  const frames = Math.floor(data.length / 4);
  const L = new Float32Array(frames);
  const R = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    L[i] = data.readInt16LE(i * 4) / 32768;
    R[i] = data.readInt16LE(i * 4 + 2) / 32768;
  }
  return [L, R];
}

function writeWav(path, L, R) {
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  writeFileSync(path, buf);
}

/** Sonie intégrée BS.1770 : pondération K, blocs de 400 ms, double seuil. */
function lufs(L, R) {
  const kweight = (x) => {
    const stages = [
      { b: [1.53512485958697, -2.69169618940638, 1.19839281085285], a: [-1.69065929318241, 0.73248077421585] },
      { b: [1, -2, 1], a: [-1.99004745483398, 0.99007225036621] },
    ];
    let y = x;
    for (const { b, a } of stages) {
      const out = new Float32Array(y.length);
      let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
      for (let i = 0; i < y.length; i++) {
        const v = b[0] * y[i] + b[1] * x1 + b[2] * x2 - a[0] * y1 - a[1] * y2;
        x2 = x1; x1 = y[i]; y2 = y1; y1 = v;
        out[i] = v;
      }
      y = out;
    }
    return y;
  };
  const kl = kweight(L);
  const kr = kweight(R);
  const block = Math.round(0.4 * SR);
  const hop = Math.round(0.1 * SR);
  const powers = [];
  for (let s = 0; s + block <= kl.length; s += hop) {
    let e = 0;
    for (let i = s; i < s + block; i++) e += kl[i] * kl[i] + kr[i] * kr[i];
    powers.push(e / block);
  }
  const loud = (p) => -0.691 + 10 * Math.log10(p);
  const abs = powers.filter((p) => loud(p) > -70);
  const mean = (arr) => arr.reduce((s, p) => s + p, 0) / arr.length;
  const rel = loud(mean(abs)) - 10;
  return loud(mean(abs.filter((p) => loud(p) > rel)));
}

/** Limiteur à anticipation de 5 ms, relâchement de 80 ms. */
function limit(L, R) {
  const n = L.length;
  const look = Math.round(0.005 * SR);
  const release = Math.exp(-1 / (0.08 * SR));
  const need = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = Math.max(Math.abs(L[i]), Math.abs(R[i]));
    need[i] = p > CEILING ? CEILING / p : 1;
  }
  // Le gain requis est anticipé : il doit être déjà baissé quand la crête arrive.
  const target = new Float32Array(n).fill(1);
  for (let i = 0; i < n; i++) {
    if (need[i] < 1) for (let j = Math.max(0, i - look); j <= i; j++) target[j] = Math.min(target[j], need[i]);
  }
  let g = 1;
  for (let i = 0; i < n; i++) {
    g = target[i] < g ? target[i] : target[i] + (g - target[i]) * release;
    L[i] *= g;
    R[i] *= g;
  }
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage : node scripts/master.mjs <video.mp4> [...]");
  process.exit(1);
}

for (const input of files) {
  const raw = input.replace(/\.mp4$/, ".master-tmp.wav");
  const processed = input.replace(/\.mp4$/, ".master-out.wav");
  const output = input.replace(/\.mp4$/, "-master.mp4");

  ffmpeg(["-hide_banner", "-loglevel", "error", "-y", "-i", input, "-vn", "-ac", "2", "-ar", String(SR), "-c:a", "pcm_s16le", raw]);
  const [L, R] = readWav(raw);
  const before = lufs(L, R);

  // Deux tours : le limiteur retire un peu de sonie, le second gain la rend.
  let measured = before;
  for (let pass = 0; pass < 3; pass++) {
    const gain = Math.pow(10, (TARGET_LUFS - measured) / 20);
    for (let i = 0; i < L.length; i++) {
      L[i] *= gain;
      R[i] *= gain;
    }
    limit(L, R);
    measured = lufs(L, R);
    if (Math.abs(measured - TARGET_LUFS) < 0.15) break;
  }

  let peak = 0;
  for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  writeWav(processed, L, R);

  ffmpeg([
    "-hide_banner", "-loglevel", "error", "-y", "-i", input, "-i", processed,
    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest",
    output,
  ]);
  rmSync(raw);
  rmSync(processed);
  console.log(
    `→ ${output}  ${before.toFixed(1)} → ${measured.toFixed(1)} LUFS, crête ${(20 * Math.log10(peak)).toFixed(1)} dB`
  );
}
