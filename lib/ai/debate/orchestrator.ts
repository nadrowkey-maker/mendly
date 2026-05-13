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
    .map((t) => `${t.agent}: ${t.content}`)
    .join("\n\n");

  if (locale === "en") {
    if (isFirst) {
      return `You are the ${agent} in a live board meeting. You're talking to your team (other executives) and indirectly informing the founder.

PROJECT: ${projectCtx}
TOPIC ON THE TABLE: "${question}"

You're opening the discussion. Give your position.

RULES:
- Talk like you're in a room with your co-executives. Direct, no corporate speak.
- Stay in your ${agent} domain. Don't try to cover everything.
- 100 words MAX. Be sharp.
- No "as the ${agent}". Just talk.
- Take a clear stance.

Speak:`;
    }

    const previousAgents = previousTurns.map((t) => t.agent).join(", ");

    return `You are the ${agent} in a live board meeting. You're talking directly to your team.

PROJECT: ${projectCtx}
TOPIC: "${question}"

WHAT'S BEEN SAID:
${threadStr}

Now you respond — directly to ${previousAgents}.

RULES:
- Address them by role. "CTO, you're wrong on X because..." or "CMO, I agree on Y but..."
- You can completely disagree. No need to find common ground.
- React to what was JUST said. Be specific — quote or reference what they said.
- Stay in your ${agent} lane. Only add what only you would see.
- 100 words MAX. Conversational, not a presentation.
- No hedging.

Speak:`;
  }

  // French
  if (isFirst) {
    return `Tu es le ${agent} dans une réunion de direction en direct. Tu parles à tes co-executives — et indirectement au fondateur qui écoute.

PROJET : ${projectCtx}
SUJET SUR LA TABLE : "${question}"

Tu ouvres la discussion. Donne ta position.

RÈGLES :
- Parle comme si tu étais dans une salle avec tes collègues. Direct, pas de langue de bois.
- Reste dans ton domaine ${agent}. Ne couvre pas tout.
- 100 mots MAX. Sois tranchant.
- Pas de "en tant que ${agent}". Parle, c'est tout.
- Prends position clairement.
- Tutoie tout le monde.

Prends la parole :`;
  }

  const previousAgents = previousTurns.map((t) => t.agent).join(", ");

  return `Tu es le ${agent} dans une réunion de direction en direct. Tu parles directement à tes collègues.

PROJET : ${projectCtx}
SUJET : "${question}"

CE QUI A ÉTÉ DIT :
${threadStr}

Tu réponds maintenant — directement à ${previousAgents}.

RÈGLES :
- Interpelle-les par leur rôle. "CTO, tu te trompes sur X parce que..." ou "CMO, ok sur Y mais..."
- Tu peux être en désaccord total. Pas besoin de trouver un terrain commun.
- Réagis à ce qui VIENT D'ÊTRE DIT. Sois précis — cite ou fais référence à ce qu'ils ont dit.
- Reste dans ton domaine ${agent}. N'ajoute que ce que toi seul vois.
- 100 mots MAX. Conversationnel, pas une présentation.
- Tutoie tout le monde, y compris le fondateur si tu t'adresses à lui.
- Pas de nuance molle.

Prends la parole :`;
}
