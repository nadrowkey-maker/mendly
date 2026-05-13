import type { Project } from "@/lib/types/project";
import type { DebateAgentRole } from "@/lib/types/debate";

interface ThreadTurnInput {
  agent: DebateAgentRole;
  question: string;
  previousTurns: { agent: DebateAgentRole; content: string }[];
  project: Project;
  locale: "fr" | "en";
  pass: number;       // 1 = opener, 2 = rebound, 3 = final jab
  totalPasses: number;
}

export function buildThreadTurnPrompt({
  agent,
  question,
  previousTurns,
  project,
  locale,
  pass,
  totalPasses,
}: ThreadTurnInput): string {
  const projectCtx =
    `${project.name} | ${project.stage}` +
    (project.sector ? ` | ${project.sector}` : "") +
    (project.description ? `\n${project.description}` : "");

  const threadStr = previousTurns
    .map((t) => `${t.agent}: ${t.content}`)
    .join("\n\n");

  const isFirst = previousTurns.length === 0;
  const isFinal = pass === totalPasses;

  if (locale === "en") {
    if (isFirst) {
      return `You are the ${agent} in a live board meeting.

PROJECT: ${projectCtx}
TOPIC: "${question}"

You open the debate. State your position.

RULES:
- 60 words MAX. No more.
- Sharp, direct. One clear stance.
- Don't introduce yourself. Just talk.
- No hedging.

Speak:`;
    }

    if (isFinal) {
      return `You are the ${agent} in a board meeting. This is your last word.

PROJECT: ${projectCtx}
TOPIC: "${question}"

THE DEBATE SO FAR:
${threadStr}

Last chance to speak. 40 words MAX.

RULES:
- Either hold your position or concede one specific point — not both.
- Address whoever you're responding to directly by role.
- No new arguments. Close your position.

Final word:`;
    }

    return `You are the ${agent} in a board meeting.

PROJECT: ${projectCtx}
TOPIC: "${question}"

THE DEBATE SO FAR:
${threadStr}

Respond to what was just said. 50 words MAX.

RULES:
- Address someone directly: "CTO, you're wrong on X" or "CMO, yes but..."
- React to one specific thing they said. Don't cover everything.
- No introduction. No summary. Jump straight in.
- Stay in your ${agent} lane.

Respond:`;
  }

  // French
  if (isFirst) {
    return `Tu es le ${agent} dans une réunion de direction en direct.

PROJET : ${projectCtx}
SUJET : "${question}"

Tu ouvres le débat. Donne ta position.

RÈGLES :
- 60 mots MAX. Pas un de plus.
- Tranchant, direct. Une position claire.
- Ne te présente pas. Parle, c'est tout.
- Tutoie tout le monde.
- Pas de nuance molle.

Prends la parole :`;
  }

  if (isFinal) {
    return `Tu es le ${agent} dans une réunion de direction. C'est ta dernière prise de parole.

PROJET : ${projectCtx}
SUJET : "${question}"

LE DÉBAT JUSQU'ICI :
${threadStr}

Dernière chance de parler. 40 mots MAX.

RÈGLES :
- Soit tu tiens ta position, soit tu concèdes un point précis — pas les deux.
- Interpelle directement celui à qui tu réponds.
- Pas de nouveaux arguments. Ferme ta position.
- Tutoie tout le monde.

Dernier mot :`;
  }

  return `Tu es le ${agent} dans une réunion de direction.

PROJET : ${projectCtx}
SUJET : "${question}"

LE DÉBAT JUSQU'ICI :
${threadStr}

Réponds à ce qui vient d'être dit. 50 mots MAX.

RÈGLES :
- Interpelle quelqu'un directement : "CTO, tu te trompes sur X" ou "CMO, ok mais..."
- Réagis à une chose précise qu'ils ont dite. Ne couvre pas tout.
- Pas d'introduction. Pas de résumé. Plonge directement.
- Reste dans ton domaine ${agent}.
- Tutoie tout le monde.

Réponds :`;
}
