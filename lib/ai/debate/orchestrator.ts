import type { Project } from "@/lib/types/project";
import type { DebateAgentRole } from "@/lib/types/debate";

interface ThreadTurnInput {
  agent: DebateAgentRole;
  question: string;
  previousTurns: { agent: DebateAgentRole; content: string }[];
  project: Project;
  locale: "fr" | "en";
}

export function buildThreadTurnPrompt({
  agent,
  question,
  previousTurns,
  project,
  locale,
}: ThreadTurnInput): string {
  const projectCtx =
    `${project.name} | ${project.stage}` +
    (project.sector ? ` | ${project.sector}` : "") +
    (project.description ? `\n${project.description}` : "");

  const isFirst = previousTurns.length === 0;

  const threadStr = previousTurns
    .map((t) => `[${t.agent}]: ${t.content}`)
    .join("\n\n");

  if (locale === "en") {
    if (isFirst) {
      return `You are the ${agent} in a live board debate.

PROJECT:
${projectCtx}

FOUNDER'S QUESTION: "${question}"

You speak first. Give your expert take.

RULES:
- Stay strictly in your ${agent} domain. Don't try to cover everything.
- 120 words MAX. No padding.
- Take a hard stance. "It depends" is not an answer.
- Do NOT introduce yourself. Jump straight into substance.
- Bold for key claims only.

Answer:`;
    }

    return `You are the ${agent} in a live board debate.

PROJECT:
${projectCtx}

FOUNDER'S QUESTION: "${question}"

THREAD SO FAR:
${threadStr}

Your turn. You've read what was said above.

RULES:
- Engage with what was actually said. Name who you're challenging and what specifically.
- You can disagree with everything. You don't have to find common ground.
- If something is wrong, say it: "${agent} disagrees with [agent] on [point] because..."
- Only add what your ${agent} expertise uniquely sees — not what's already been said.
- 120 words MAX. Sharp and direct.
- No diplomacy. No hedging.

Your turn:`;
  }

  if (isFirst) {
    return `Tu es le ${agent} dans un débat d'équipe en direct.

PROJET :
${projectCtx}

QUESTION DU FONDATEUR : "${question}"

Tu parles en premier. Donne ton analyse d'expert.

RÈGLES :
- Reste strictement dans ton domaine ${agent}. Ne couvre pas tout.
- 120 mots MAX. Pas de remplissage.
- Prends position fermement. "Ça dépend" n'est pas une réponse.
- Ne te présente pas. Plonge directement dans le sujet.
- Gras uniquement pour les affirmations clés.
- Tutoie le fondateur.

Réponds :`;
  }

  return `Tu es le ${agent} dans un débat d'équipe en direct.

PROJET :
${projectCtx}

QUESTION DU FONDATEUR : "${question}"

FIL DE DISCUSSION :
${threadStr}

C'est ton tour. Tu as lu ce qui a été dit plus haut.

RÈGLES :
- Engage-toi avec ce qui a vraiment été dit. Nomme qui tu remets en question et sur quoi précisément.
- Tu peux être en désaccord total. Pas besoin de trouver un terrain commun.
- Si quelque chose est faux, dis-le : "Le ${agent} conteste [agent] sur [point] parce que..."
- N'apporte que ce que ton expertise ${agent} voit uniquement — pas ce qui a déjà été dit.
- 120 mots MAX. Tranchant et direct.
- Pas de diplomatie. Pas de nuance molle.
- Tutoie le fondateur.

Ton tour :`;
}
