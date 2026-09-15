/**
 * Transcrit une voix off avec l'horodatage de chaque mot, en local.
 *
 * whisper.cpp tourne sur la machine : l'audio ne part chez aucun service. Les
 * horodatages servent à caler le montage sur la voix — une image qui arrive
 * sur le mot qu'elle illustre, pas une demi-seconde avant ou après.
 *
 * Usage : node scripts/transcribe.mjs out/vo/take.wav [langue=fr]
 *   → out/vo/take.words.json
 * L'entrée doit être un WAV mono 16 kHz (voir la conversion dans le README).
 */
import path from "node:path";
import { writeFileSync } from "node:fs";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const [input, language = "fr"] = process.argv.slice(2);
if (!input) {
  console.error("Usage : node scripts/transcribe.mjs <audio-16k.wav> [langue]");
  process.exit(1);
}

const WHISPER = path.join(process.cwd(), "whisper.cpp");
const VERSION = "1.5.5";
// « small » : assez juste pour le français et des horodatages au mot près,
// pour un téléchargement d'un demi-gigaoctet au lieu d'un et demi (« medium »).
const MODEL = "small";

await installWhisperCpp({ to: WHISPER, version: VERSION });
await downloadWhisperModel({ model: MODEL, folder: WHISPER });

const result = await transcribe({
  inputPath: path.resolve(input),
  whisperPath: WHISPER,
  whisperCppVersion: VERSION,
  model: MODEL,
  tokenLevelTimestamps: true,
  language,
});

const { captions } = toCaptions({ whisperCppOutput: result });
const out = input.replace(/\.wav$/, ".words.json");
writeFileSync(out, JSON.stringify(captions, null, 2));

console.log(captions.map((c) => c.text).join("").trim());
console.log(`\n${captions.length} mots → ${out}`);
