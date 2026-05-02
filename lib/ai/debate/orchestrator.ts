import type { Project } from "@/lib/types/project";
import type { DebateAgentRole } from "@/lib/types/debate";

interface Round1Input {
  agent: DebateAgentRole;
  question: string;
  otherAgents: DebateAgentRole[];
  project: Project;
  locale: "fr" | "en";
}

interface Round2Input {
  agent: DebateAgentRole;
  question: string;
  round1Content: { agent: DebateAgentRole; content: string }[];
  project: Project;
  locale: "fr" | "en";
}

export function buildRound1Prompt({
  agent,
  question,
  otherAgents,
  project,
  locale,
}: Round1Input): string {
  const others = otherAgents.filter((a) => a !== agent).join(", ");
  const projectCtx =
    `${project.name} | ${project.stage} | ${project.sector ?? ""}` +
    (project.description ? `\n${project.description}` : "");

  if (locale === "en") {
    return `You are the ${agent} in a board debate. Your role: give your expert perspective.

PROJECT CONTEXT:
${projectCtx}

DEBATE — ROUND 1
The founder asked: "${question}"

Other specialists (${others}) are answering simultaneously. You'll see their answers in Round 2.

RULES:
- Be specific to your ${agent} domain. Don't cover everything.
- 150 words MAX. Be sharp and direct.
- Take a clear stance. No hedging.
- Don't introduce yourself or say "as the ${agent}". Just answer.
- Use markdown sparingly (bold for key points, short bullets if needed).

Answer now:`;
  }

  return `Tu es le ${agent} dans un débat d'équipe. Ton rôle : donner ta perspective d'expert.

CONTEXTE DU PROJET :
${projectCtx}

DÉBAT — ROUND 1
Le fondateur demande : "${question}"

D'autres spécialistes (${others}) répondent en même temps. Tu verras leurs réponses au Round 2.

RÈGLES :
- Spécifique à ton domaine ${agent}. Ne couvre pas tout.
- 150 mots MAX. Sois tranchant et direct.
- Prends position clairement. Pas de "ça dépend".
- Ne te présente pas et ne dis pas "en tant que ${agent}". Direct dans le vif.
- Markdown léger (gras pour les points clés, bullets courts si nécessaire).
- Tutoie le fondateur.

Réponds maintenant :`;
}

export function buildRound2Prompt({
  agent,
  question,
  round1Content,
  project,
  locale,
}: Round2Input): string {
  const ownRound1 = round1Content.find((m) => m.agent === agent)?.content ?? "";
  const peers = round1Content
    .filter((m) => m.agent !== agent)
    .map((m) => `[${m.agent}]\n${m.content}`)
    .join("\n\n");

  if (locale === "en") {
    return `You are the ${agent} continuing a board debate.

PROJECT: ${project.name} | ${project.stage}
Original question: "${question}"

YOUR ROUND 1 ANSWER:
${ownRound1}

YOUR PEERS' ROUND 1 ANSWERS:
${peers}

DEBATE — ROUND 2
React to your peers' answers. Rules:
- Find ONE point you AGREE with and build on it briefly.
- Find ONE point you DISAGREE with or want to NUANCE — be specific about what they said.
- 150 words MAX. Reference what they actually said.
- No hedging. Stay in ${agent} character.

Answer now (Round 2):`;
  }

  return `Tu es le ${agent} qui continue un débat d'équipe.

PROJET : ${project.name} | ${project.stage}
Question d'origine : "${question}"

TON ROUND 1 :
${ownRound1}

ROUND 1 DE TES PAIRS :
${peers}

DÉBAT — ROUND 2
Réagis aux réponses de tes pairs. Règles :
- Trouve UN point sur lequel tu ES D'ACCORD et rebondis brièvement.
- Trouve UN point sur lequel tu N'ES PAS D'ACCORD ou que tu veux NUANCER — cite précisément ce qu'ils ont dit.
- 150 mots MAX. Référence ce qu'ils ont vraiment dit.
- Pas de "ça dépend". Reste dans ton rôle ${agent}.
- Tutoie le fondateur.

Réponds maintenant (Round 2) :`;
}
