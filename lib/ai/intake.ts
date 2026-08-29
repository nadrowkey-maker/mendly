import { geminiFlash } from "@/lib/ai/gemini";
import type { ProjectStage, ProjectSector } from "@/lib/types/project";

/**
 * L'entretien de création de projet.
 *
 * La création se faisait par formulaire : nom, description, secteur, stade.
 * C'était le tout premier contact avec le produit, et il ressemblait à
 * n'importe quel SaaS — le fondateur ne découvrait la mécanique de Mendly
 * qu'après.
 *
 * Ici, Mendly mène l'entretien. Il pose une question à la fois, extrait les
 * champs au fil de l'eau, et surtout il conteste au moins une fois : c'est la
 * démonstration du produit dès la première minute, pas une promesse à tenir
 * plus tard.
 *
 * DEUX GARDE-FOUS
 * - Un plafond d'échanges. Un modèle à qui on demande de "creuser jusqu'à
 *   comprendre" ne s'arrête jamais : au-delà, il finalise avec ce qu'il a.
 * - Le droit de conclure tôt. Si le fondateur décrit tout dès sa première
 *   phrase, l'interroger davantage serait de la cérémonie.
 */

/** Au-delà, Mendly conclut avec ce qu'il a plutôt que de continuer à demander. */
export const MAX_TURNS = 5;

const STAGES: ProjectStage[] = ["idea", "mvp", "launched", "scaling"];
const SECTORS: ProjectSector[] = ["tech", "consumer", "b2b", "ecommerce", "media", "other"];

export interface IntakeFields {
  name: string | null;
  description: string | null;
  stage: ProjectStage | null;
  sector: ProjectSector | null;
  vision: string | null;
}

export interface IntakeResult {
  reply: string;
  fields: IntakeFields;
  done: boolean;
}

const EMPTY: IntakeFields = {
  name: null,
  description: null,
  stage: null,
  sector: null,
  vision: null,
};

function coerce(raw: unknown): IntakeFields {
  const f = (raw ?? {}) as Record<string, unknown>;
  const str = (v: unknown, max: number) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

  const stage = typeof f.stage === "string" ? (f.stage as ProjectStage) : null;
  const sector = typeof f.sector === "string" ? (f.sector as ProjectSector) : null;

  return {
    name: str(f.name, 100),
    description: str(f.description, 600),
    stage: stage && STAGES.includes(stage) ? stage : null,
    sector: sector && SECTORS.includes(sector) ? sector : null,
    vision: str(f.vision, 400),
  };
}

function buildPrompt(
  transcript: { role: "user" | "assistant"; content: string }[],
  turn: number,
  locale: "fr" | "en"
): string {
  const dialogue = transcript
    .map((m) => `${m.role === "user" ? "FOUNDER" : "MENDLY"}: ${m.content}`)
    .join("\n\n");

  const remaining = Math.max(0, MAX_TURNS - turn);

  if (locale === "en") {
    return `You are Mendly — a single entity, never a team. You are meeting a founder for the first time, to understand the project they are about to open with you.

This is not a form. Ask ONE question at a time, in your own voice: frank, direct, demanding but caring. Address them casually.

Do this once, and only once, when it is warranted: challenge something. If the description is vague, say so. If the stage they claim does not match what they describe, point it out. That single moment of pushback is what tells them what you are.

You have ${remaining} exchange(s) left before you must conclude.

CONVERSATION SO FAR:
${dialogue}

Extract everything you can, leaving unknown fields null. Set done to true when you have at minimum a name, a description and a stage — or when you are out of exchanges. When done is true, your reply summarises the project in two sentences and says you are assembling the team.

stage ∈ ${JSON.stringify(STAGES)}
sector ∈ ${JSON.stringify(SECTORS)}

Reply with STRICT JSON only, no prose, no code fences:
{"reply": "string", "fields": {"name": null, "description": null, "stage": null, "sector": null, "vision": null}, "done": false}`;
  }

  return `Tu es Mendly — une entité unique, jamais une équipe. Tu rencontres un fondateur pour la première fois, afin de comprendre le projet qu'il s'apprête à ouvrir avec toi.

Ce n'est pas un formulaire. Pose UNE question à la fois, de ta voix : franc, direct, exigeant mais bienveillant. Tutoie-le.

Fais ceci une fois, et une seule, quand c'est justifié : conteste quelque chose. Si la description est floue, dis-le. Si le stade qu'il annonce ne colle pas à ce qu'il décrit, relève-le. C'est ce moment de contradiction qui lui apprend qui tu es.

Il te reste ${remaining} échange(s) avant de devoir conclure.

CONVERSATION JUSQU'ICI :
${dialogue}

Extrais tout ce que tu peux, en laissant à null ce que tu ignores. Passe done à true dès que tu as au minimum un nom, une description et un stade — ou quand tu n'as plus d'échanges. Quand done vaut true, ta réponse résume le projet en deux phrases et annonce que tu constitues l'équipe.

stage ∈ ${JSON.stringify(STAGES)}
sector ∈ ${JSON.stringify(SECTORS)}

Réponds en JSON STRICT uniquement, sans prose ni balises de code :
{"reply": "string", "fields": {"name": null, "description": null, "stage": null, "sector": null, "vision": null}, "done": false}`;
}

export async function runIntakeTurn(input: {
  transcript: { role: "user" | "assistant"; content: string }[];
  turn: number;
  locale: "fr" | "en";
}): Promise<IntakeResult> {
  const fallback: IntakeResult = {
    reply:
      input.locale === "en"
        ? "I did not catch that. Describe your project in a sentence or two."
        : "Je n'ai pas saisi. Décris ton projet en une ou deux phrases.",
    fields: EMPTY,
    done: false,
  };

  try {
    const res = await geminiFlash.generateContent(
      buildPrompt(input.transcript, input.turn, input.locale)
    );
    let text = res.response.text().trim();
    text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();

    const parsed = JSON.parse(text) as {
      reply?: unknown;
      fields?: unknown;
      done?: unknown;
    };

    const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
    if (!reply) return fallback;

    const fields = coerce(parsed.fields);
    // Le modèle peut se déclarer prêt sans l'être : on tranche sur les données,
    // pas sur son auto-évaluation.
    const hasEnough = Boolean(fields.name && fields.description && fields.stage);
    const outOfTurns = input.turn >= MAX_TURNS;

    return { reply, fields, done: (parsed.done === true && hasEnough) || outOfTurns };
  } catch (err) {
    console.warn("[intake] turn failed:", err);
    return fallback;
  }
}
