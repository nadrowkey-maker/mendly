export type PlanTier = "free" | "starter" | "pro";

/**
 * Le plan gratuit ouvre droit à UN débat en salle de réunion, une seule fois.
 * C'est une dégustation, pas un rythme de croisière : un débat par semaine à
 * vie coûte des appels modèle en continu sans jamais créer de raison de payer.
 */

export const PLANS = {
  free: {
    name: "Free",
    priceId: null,
    dailyMessageLimit: 10,
    projectLimit: 1,
    agentsAvailable: ["CEO", "CTO", "CMO", "MENDLY"] as const,
    // Un seul débat en salle de réunion, à vie. Le fondateur voit ce que ça
    // donne, puis choisit.
    debateEnabled: true,
    debates: "once" as const,
    // Specialists (non-CEO) Mendly can assign to a project's permanent team.
    teamSize: 2,
  },
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_PRICE_STARTER ?? null,
    dailyMessageLimit: 100,
    projectLimit: 3,
    agentsAvailable: ["CEO", "CTO", "CMO", "CPO", "CFO", "CDO", "DEV", "CCO", "MENDLY"] as const,
    debateEnabled: true,
    debates: "unlimited" as const,
    weeklyMemos: true,
    teamSize: 7,
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO ?? null,
    dailyMessageLimit: 500,
    projectLimit: 10,
    agentsAvailable: ["CEO", "CTO", "CMO", "CPO", "CFO", "CDO", "DEV", "CCO", "MENDLY"] as const,
    debateEnabled: true,
    debates: "unlimited" as const,
    weeklyMemos: true,
    weeklyMemosEnriched: true,
    teamSize: 7,
  },
} as const;

export function getPlanFromPriceId(priceId: string): PlanTier | null {
  if (priceId === PLANS.starter.priceId) return "starter";
  if (priceId === PLANS.pro.priceId) return "pro";
  return null;
}

/**
 * Le plan qui ouvre RÉELLEMENT des droits.
 *
 * Chaque point de contrôle lisait la colonne `plan` telle quelle, sans regarder
 * `status`. Un abonnement impayé (`unpaid`), expiré (`incomplete_expired`) ou
 * annulé mais pas encore nettoyé gardait donc tous les avantages payants. Et
 * une valeur hors liste — un « premium » saisi à la main — faisait planter les
 * écrans qui indexent `PLANS[plan]` sans vérification.
 *
 * - valeur inconnue → gratuit ;
 * - `active`, `trialing` → le plan ;
 * - `past_due` → le plan : Stripe relance le paiement pendant plusieurs jours,
 *   couper au premier échec de carte punirait un client qui paie ;
 * - statut absent → le plan : c'est une ligne posée à la main par un
 *   administrateur (les fondateurs n'ont pas le droit d'écrire dans cette
 *   table), pas un abonnement Stripe ;
 * - tout le reste → gratuit.
 */
const ENTITLED_STATUSES = new Set(["active", "trialing", "past_due"]);

export function resolvePlan(
  plan: string | null | undefined,
  status: string | null | undefined
): PlanTier {
  if (plan !== "starter" && plan !== "pro") return "free";
  if (!status) return plan;
  return ENTITLED_STATUSES.has(status) ? plan : "free";
}
