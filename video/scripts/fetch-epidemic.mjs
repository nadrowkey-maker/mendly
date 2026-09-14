/**
 * Cherche et télécharge la musique de fond via l'API Epidemic Sound.
 *
 * ⚠️ Licence : la formule gratuite de l'API sert uniquement à tester. Epidemic
 * l'écrit sans ambiguïté — « You can't sublicense or go live with anything on
 * the Epidemic Sound API Free tier ». Une publicité diffusée exige une formule
 * payante. Ce script ne vérifie pas la formule : c'est au titulaire du compte
 * de s'en assurer avant de publier.
 *
 * Usage :
 *   node scripts/fetch-epidemic.mjs search "smooth electronic confident" 110 130
 *   node scripts/fetch-epidemic.mjs get <trackId>
 *
 * La clé est lue dans video/.env (EPIDEMIC_API_KEY), jamais dans le code.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const BASE = "https://partner-content-api.epidemicsound.com";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);
const KEY = env.EPIDEMIC_API_KEY;
if (!KEY) throw new Error("EPIDEMIC_API_KEY absente de video/.env");

async function api(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${KEY}`, Accept: "application/json" },
  });
  if (res.status === 401) {
    throw new Error(
      "401 : clé refusée. Vérifie qu'elle est active dans l'espace développeur Epidemic Sound, puis recopie-la dans video/.env."
    );
  }
  if (!res.ok) throw new Error(`${res.status} sur ${path} : ${await res.text()}`);
  return res.json();
}

const [cmd, ...args] = process.argv.slice(2);

if (cmd === "search") {
  const [term = "smooth electronic confident", bpmMin = "100", bpmMax = "130"] = args;
  const q = new URLSearchParams({ term, bpmMin, bpmMax, limit: "15", vocalType: "NONE" });
  const data = await api(`/v0/tracks/search?${q}`);
  for (const t of data.tracks ?? data.items ?? []) {
    console.log(`${t.id}  ${String(t.bpm).padStart(3)} bpm  ${(t.length / 1000).toFixed(0).padStart(4)} s  ${t.title}`);
  }
} else if (cmd === "get") {
  const [trackId] = args;
  if (!trackId) throw new Error("Donne l'identifiant du morceau.");
  const { url } = await api(`/v0/tracks/${trackId}/download?format=mp3&quality=high`);
  const audio = Buffer.from(await (await fetch(url)).arrayBuffer());
  mkdirSync(new URL("../public/audio/", import.meta.url), { recursive: true });
  writeFileSync(new URL("../public/audio/music.mp3", import.meta.url), audio);
  console.log("→ public/audio/music.mp3 — renseigne ensuite src/audio/music.ts");
} else {
  console.log('Usage : search "<termes>" [bpmMin] [bpmMax]  |  get <trackId>');
}
