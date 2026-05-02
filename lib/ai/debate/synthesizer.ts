import type { Project } from "@/lib/types/project";

interface SynthInput {
  question: string;
  project: Project;
  transcript: { agent: string; round: 1 | 2; content: string }[];
  locale: "fr" | "en";
}

export function buildSynthesisPrompt({
  question,
  project,
  transcript,
  locale,
}: SynthInput): string {
  const transcriptStr = transcript
    .map((m) => `[${m.agent} — Round ${m.round}]\n${m.content}`)
    .join("\n\n");

  const projectCtx = `${project.name} | ${project.stage} | ${project.sector ?? ""}`;

  if (locale === "en") {
    return `You are the CEO synthesizing a board debate for a solo founder.

PROJECT: ${projectCtx}
QUESTION: "${question}"

DEBATE TRANSCRIPT:
${transcriptStr}

YOUR JOB: Write the final synthesis. 200 words MAX.
Follow this structure (no headers, flow naturally):
1. Where the team agrees — 1 sentence
2. Where they disagree — 1–2 sentences, cite what each side actually said
3. Your CEO call — clear recommendation, pick a side or merge decisively
4. 3 concrete action items — bullet list, max 3

Be decisive. The founder pays you to decide, not to hedge.
If the question itself is poorly framed, reframe it.

CEO synthesis:`;
  }

  return `Tu es le CEO qui synthétise un débat d'équipe pour un fondateur solo.

PROJET : ${projectCtx}
QUESTION : "${question}"

TRANSCRIPT DU DÉBAT :
${transcriptStr}

TON JOB : Synthèse finale. 200 mots MAX.
Suis cette structure (pas de titres, fais couler naturellement) :
1. Sur quoi l'équipe est d'accord — 1 phrase
2. Sur quoi ils divergent — 1–2 phrases, cite précisément ce que chaque camp a dit
3. Ton arbitrage CEO — recommandation claire, tranche ou fusionne de manière décisive
4. 3 actions concrètes — bullets, max 3

Sois décisif. Le fondateur te paye pour décider, pas pour nuancer à l'infini.
Si la question est mal posée, reformule-la.
Tutoie le fondateur.

Synthèse CEO :`;
}
