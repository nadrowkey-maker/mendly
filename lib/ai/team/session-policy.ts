import { geminiFlash } from "@/lib/ai/gemini";
import type { PlanTier } from "@/lib/stripe/plans";

/**
 * Décide SI une session autonome doit avoir lieu, et SUR QUOI.
 *
 * Séparé du cron volontairement : la question "faut-il faire travailler
 * l'équipe maintenant, et sur quel sujet" est un jugement produit, pas de la
 * plomberie. Isolée ici, elle se lit, se discute et se teste sans démêler une
 * boucle de cron.
 *
 * Le principe directeur : ne rien produire vaut mieux que produire du
 * remplissage. Une session déclenchée parce que le calendrier le dit accouche
 * d'un débat générique ; le fondateur ouvre la salle, trouve du blabla, et n'y
 * revient plus. La fréquence est un plafond, jamais une obligation.
 */

/** Intervalle minimal entre deux sessions autonomes, en jours. */
export const CADENCE_DAYS: Record<PlanTier, number> = {
  // Le gratuit y a droit : "ton équipe a bossé sans toi" est le moment de
  // conversion le plus fort du produit. Le supprimer aux gratuits supprime
  // l'envie d'payer. Mais espacé, pour que le coût reste borné.
  free: 14,
  starter: 7,
  pro: 3,
};

/** Une action non terminée depuis ce délai compte comme un signal d'enlisement. */
const STALLED_ACTION_DAYS = 5;

/** En deçà, le projet vient d'être créé : rien à débattre encore. */
const MIN_PROJECT_AGE_DAYS = 2;

export interface SessionSignals {
  plan: PlanTier;
  projectCreatedAt: string;
  /** Dernière session autonome, toutes lues ou non. */
  lastSessionAt: string | null;
  /** Une session autonome déjà produite et jamais ouverte par le fondateur. */
  hasUnseenSession: boolean;
  /** Événements de mémoire créés depuis la dernière session. */
  newMemoryEvents: number;
  /** Actions ouvertes plus vieilles que STALLED_ACTION_DAYS. */
  stalledActions: number;
  /** Messages du fondateur sur les 14 derniers jours — le projet est-il vivant. */
  recentFounderMessages: number;
}

export type SessionDecision =
  | { run: true }
  | { run: false; reason: string };

function daysSince(iso: string, now: Date): number {
  return (now.getTime() - new Date(iso).getTime()) / 86_400_000;
}

export function decideSession(s: SessionSignals, now: Date = new Date()): SessionDecision {
  if (daysSince(s.projectCreatedAt, now) < MIN_PROJECT_AGE_DAYS) {
    return { run: false, reason: "projet trop récent" };
  }

  // Prime sur tout le reste : empiler du travail non lu transforme la salle de
  // réunion en boîte de spam, et dévalue la session précédente au passage.
  if (s.hasUnseenSession) {
    return { run: false, reason: "session précédente pas encore lue" };
  }

  if (s.lastSessionAt && daysSince(s.lastSessionAt, now) < CADENCE_DAYS[s.plan]) {
    return { run: false, reason: "cadence non atteinte" };
  }

  // Filtre de pertinence. Sans matière neuve, l'équipe ne ferait que
  // reformuler ce qu'elle a déjà dit.
  const hasSignal =
    s.newMemoryEvents > 0 || s.stalledActions > 0 || s.recentFounderMessages > 0;
  if (!hasSignal) {
    return { run: false, reason: "aucun signal neuf" };
  }

  return { run: true };
}

/**
 * Fabrique le sujet de la session à partir de l'état réel du projet.
 *
 * Renvoie null quand rien ne mérite un débat — et le prompt le dit
 * explicitement au modèle. Un modèle sommé de toujours trouver un sujet en
 * trouvera un, et ce sera un faux sujet.
 */
export async function generateSessionTopic(input: {
  projectName: string;
  projectDescription: string | null;
  stage: string;
  memory: string;
  openActions: string;
  locale: "fr" | "en";
}): Promise<string | null> {
  const prompt =
    input.locale === "en"
      ? `A founder's advisory team is about to meet WITHOUT the founder present, to work on their behalf.

PROJECT: ${input.projectName} (${input.stage})
${input.projectDescription ?? ""}

PROJECT MEMORY (decisions, risks, assumptions, milestones):
${input.memory || "(empty)"}

OPEN ACTIONS:
${input.openActions || "(none)"}

Find the ONE question worth debating in the founder's absence. It must be:
- specific to this project, never generic startup advice;
- something the founder has NOT already settled — look at the memory;
- worth their time to read when they come back.

If nothing genuinely warrants a debate right now, return null. Returning null is a perfectly good answer — a pointless session is worse than no session.

Reply with STRICT JSON only, no prose, no code fences:
{"topic": "string or null"}`
      : `L'équipe de conseil d'un fondateur va se réunir SANS lui, pour travailler en son nom.

PROJET : ${input.projectName} (${input.stage})
${input.projectDescription ?? ""}

MÉMOIRE DU PROJET (décisions, risques, hypothèses, jalons) :
${input.memory || "(vide)"}

ACTIONS EN COURS :
${input.openActions || "(aucune)"}

Trouve LA question qui mérite d'être débattue en l'absence du fondateur. Elle doit être :
- spécifique à ce projet, jamais un conseil startup générique ;
- non déjà tranchée par le fondateur — regarde la mémoire ;
- digne du temps qu'il passera à lire le résultat.

Si rien ne mérite vraiment un débat maintenant, renvoie null. Renvoyer null est une très bonne réponse — une session inutile est pire que pas de session.

Réponds en JSON STRICT uniquement, sans prose ni balises de code :
{"topic": "string ou null"}`;

  try {
    const res = await geminiFlash.generateContent(prompt);
    let text = res.response.text().trim();
    text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(text) as { topic?: string | null };
    const topic = typeof parsed.topic === "string" ? parsed.topic.trim() : "";
    if (!topic || topic.toLowerCase() === "null") return null;
    return topic.slice(0, 500);
  } catch (err) {
    console.warn("[session-policy] topic generation failed:", err);
    return null;
  }
}
