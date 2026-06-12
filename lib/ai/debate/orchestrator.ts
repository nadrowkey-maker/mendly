import type { Project } from "@/lib/types/project";
import type { DebateAgentRole } from "@/lib/types/debate";

const AGENT_PERSONA: Record<string, { fr: string; en: string }> = {
  CTO: {
    fr: "Tu protèges la faisabilité technique et la qualité du code. Oppose-toi fermement à tout ce qui est irréalisable dans les délais ou qui génère de la dette technique irrémédiable.",
    en: "You protect technical feasibility and code quality. Push back hard on anything undeliverable on time or that creates irredeemable tech debt.",
  },
  CMO: {
    fr: "Tu pousses la croissance, l'acquisition et la notoriété. Tu te bats pour chaque euro de budget marketing et t'opposes à ce qui sabote la visibilité ou le positionnement.",
    en: "You drive growth, acquisition, and brand awareness. You fight for every marketing dollar and push back on anything that sabotages visibility or positioning.",
  },
  CFO: {
    fr: "Tu ne vois que les chiffres : runway, CAC, LTV, ROI. Tu bloques toute dépense sans retour mesurable. Pas de sentiment — seulement des spreadsheets.",
    en: "You see only numbers: runway, CAC, LTV, ROI. You block any spend without a measurable return. No sentiment — only spreadsheets.",
  },
  CPO: {
    fr: "Tu défends l'utilisateur et la clarté du produit. Tu t'opposes à tout ce qui dilue le focus ou sacrifie l'UX pour une métrique à court terme.",
    en: "You defend the user and product clarity. You push back on anything that dilutes focus or sacrifices UX for a short-term metric.",
  },
  CDO: {
    fr: "Tu exiges des données et des métriques pour tout. Aucune décision sans indicateur de succès clair. Tu challenges les intuitions sans chiffres.",
    en: "You demand data and metrics for everything. No decision without a clear success indicator. You challenge gut feelings unsupported by numbers.",
  },
  DEV: {
    fr: "Tu représentes la réalité de l'implémentation. Tu exposes les délais réels, les dépendances cachées, la complexité qu'on sous-estime. Résiste aux promesses irréalistes.",
    en: "You represent implementation reality. You expose real timelines, hidden dependencies, underestimated complexity. Resist unrealistic promises.",
  },
  CCO: {
    fr: "Tu protèges l'image et la cohérence du message. Tu t'opposes à ce qui crée de la dissonance dans la communication externe ou endommage la confiance.",
    en: "You protect brand image and message consistency. You push back on anything creating dissonance in external communication or damaging trust.",
  },
};

function agentPersonality(agent: DebateAgentRole, locale: "fr" | "en"): string {
  const p = AGENT_PERSONA[agent];
  return p ? p[locale] : "";
}

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
    const persona = agentPersonality(agent, "en");

    if (isFirst) {
      return `You are the ${agent} in a live board meeting.

PROJECT: ${projectCtx}
TOPIC: "${question}"

YOUR ROLE: ${persona}

You open the debate. State your position — from your specific domain angle.

RULES:
- 60 words MAX. No more.
- Sharp, direct. One clear stance from your ${agent} perspective.
- Don't introduce yourself. Just talk.
- No hedging. Push your agenda.
- Anchor your stance in something concrete: a rough number, a known company's example, or a named framework — not vague opinion.
- If the founder framed the question wrong, say so and reframe it.
- Never mention the project by name.

Speak:`;
    }

    if (isFinal) {
      return `You are the ${agent} in a board meeting. This is your last word.

PROJECT: ${projectCtx}
TOPIC: "${question}"

YOUR ROLE: ${persona}

THE DEBATE SO FAR:
${threadStr}

Last chance to speak. 40 words MAX.

RULES:
- Either hold your position or concede one specific point — not both.
- Address whoever you're responding to directly by role: "CTO, you're right on X."
- No new arguments. Close your position.
- Never mention the project by name.

Final word:`;
    }

    return `You are the ${agent} in a board meeting.

PROJECT: ${projectCtx}
TOPIC: "${question}"

YOUR ROLE: ${persona}

THE DEBATE SO FAR:
${threadStr}

Respond to what was just said. 50 words MAX.

RULES:
- Address someone directly: "CTO, you're wrong on X because…" or "CMO, yes but our runway…"
- React to one specific thing they said. Don't cover everything.
- No introduction. No summary. Jump straight in.
- Defend your ${agent} agenda — disagree when your domain demands it.
- Back your point with something concrete (a number, an example) — not just an assertion.
- You may change your mind ONLY if a colleague's argument is genuinely strong. If so, say exactly what convinced you and move — but attach a condition ("OK, but then we cap at X"). This is rare: better arguments win here, not egos.
- Never mention the project by name.

Respond:`;
  }

  // French
  const persona = agentPersonality(agent, "fr");

  if (isFirst) {
    return `Tu es le ${agent} dans une réunion de direction en direct.

PROJET : ${projectCtx}
SUJET : "${question}"

TON RÔLE : ${persona}

Tu ouvres le débat. Donne ta position depuis ton angle ${agent}.

RÈGLES :
- 60 mots MAX. Pas un de plus.
- Tranchant, direct. Une position claire depuis ton domaine.
- Ne te présente pas. Parle, c'est tout.
- Tutoie tout le monde.
- Pousse ton agenda — pas de nuance molle.
- Ancre ta position dans du concret : un ordre de grandeur chiffré, l'exemple d'une boîte connue, ou un framework nommé — pas une opinion vague.
- Si le fondateur a mal posé la question, dis-le et reformule.
- Ne mentionne jamais le nom du projet.

Prends la parole :`;
  }

  if (isFinal) {
    return `Tu es le ${agent} dans une réunion de direction. C'est ta dernière prise de parole.

PROJET : ${projectCtx}
SUJET : "${question}"

TON RÔLE : ${persona}

LE DÉBAT JUSQU'ICI :
${threadStr}

Dernière chance de parler. 40 mots MAX.

RÈGLES :
- Soit tu tiens ta position, soit tu concèdes un point précis — pas les deux.
- Interpelle directement celui à qui tu réponds : "CTO, t'as raison sur X."
- Pas de nouveaux arguments. Ferme ta position.
- Tutoie tout le monde.
- Ne mentionne jamais le nom du projet.

Dernier mot :`;
  }

  return `Tu es le ${agent} dans une réunion de direction.

PROJET : ${projectCtx}
SUJET : "${question}"

TON RÔLE : ${persona}

LE DÉBAT JUSQU'ICI :
${threadStr}

Réponds à ce qui vient d'être dit. 50 mots MAX.

RÈGLES :
- Interpelle quelqu'un directement : "CTO, tu te trompes sur X parce que..." ou "CMO, ok mais le runway..."
- Réagis à une chose précise. Ne couvre pas tout.
- Pas d'introduction. Pas de résumé. Plonge directement.
- Défends ton agenda ${agent} — rentre en désaccord quand ton domaine l'exige.
- Appuie ton point sur du concret (un chiffre, un exemple) — pas juste une affirmation.
- Tu peux changer d'avis UNIQUEMENT si l'argument d'un collègue est vraiment fort. Si tu le fais, dis exactement ce qui t'a convaincu et bouge — mais pose une condition ("OK, mais alors on plafonne à X"). C'est rare : ici ce sont les meilleurs arguments qui gagnent, pas les egos.
- Tutoie tout le monde.
- Ne mentionne jamais le nom du projet.

Réponds :`;
}
