// Test autonome de Mendly — sans DB, sans auth, sans serveur Next.
// Appelle directement Gemini avec le prompt système généré par buildMendlySystemPrompt,
// pour itérer vite sur le comportement avant de tester dans l'UI réelle.
//
// Prérequis : un fichier .env.local à la racine avec GEMINI_API_KEY=...
//
// Usage :
//   node --experimental-strip-types scripts/test-mendly.mts
//   node --experimental-strip-types scripts/test-mendly.mts "ta question" fr
//   node --experimental-strip-types scripts/test-mendly.mts "your question" en

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  let raw: string;
  try {
    raw = readFileSync(join(root, ".env.local"), "utf8");
  } catch {
    console.error(
      "Aucun .env.local trouvé à la racine du projet.\n" +
        "Ajoute une ligne GEMINI_API_KEY=ta_clé dans .env.local avant de relancer ce script."
    );
    process.exit(1);
  }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

loadEnv();

const { buildMendlySystemPrompt } = await import(
  pathToFileURL(join(root, "lib/ai/agents/mendly.ts")).href
);
const { streamGeminiResponse } = await import(
  pathToFileURL(join(root, "lib/ai/gemini.ts")).href
);

const locale = process.argv[3] === "en" ? "en" : "fr";
const question =
  process.argv[2] ??
  "Je veux ajouter un système de recommandation IA à mon app avant même d'avoir eu mon premier client payant.";

// Projet fictif pour le test — mêmes champs que lit buildMendlySystemPrompt.
const fakeProject = {
  name: "Test Project",
  description: "Un SaaS B2B qui aide les équipes support à répondre plus vite grâce à l'IA.",
  stage: "mvp",
  sector: "b2b",
  time_commitment: "20h/semaine",
  priority: "trouver les 10 premiers clients payants",
};

const systemPrompt = buildMendlySystemPrompt(fakeProject, locale);

console.log("=".repeat(70));
console.log("QUESTION:", question);
console.log("=".repeat(70), "\n");

for await (const chunk of streamGeminiResponse(systemPrompt, [], question)) {
  process.stdout.write(chunk);
}
console.log("\n");
