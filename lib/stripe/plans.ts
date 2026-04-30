export type PlanTier = "free" | "starter" | "pro" | "team";

export interface PlanConfig {
  tier: PlanTier;
  name: string;
  priceId: string | null;
  monthlyPrice: number; // EUR
  dailyMessageLimit: number; // -1 = unlimited
  maxProjects: number; // -1 = unlimited
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  free: {
    tier: "free",
    name: "Free",
    priceId: null,
    monthlyPrice: 0,
    dailyMessageLimit: 10,
    maxProjects: 1,
  },
  starter: {
    tier: "starter",
    name: "Starter",
    priceId: process.env.STRIPE_PRICE_STARTER ?? null,
    monthlyPrice: 19,
    dailyMessageLimit: 100,
    maxProjects: 3,
  },
  pro: {
    tier: "pro",
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO ?? null,
    monthlyPrice: 49,
    dailyMessageLimit: -1, // unlimited
    maxProjects: 10,
  },
  team: {
    tier: "team",
    name: "Team",
    priceId: process.env.STRIPE_PRICE_TEAM ?? null,
    monthlyPrice: 149,
    dailyMessageLimit: -1,
    maxProjects: -1,
  },
};

/**
 * Returns the plan tier from a Stripe Price ID.
 */
export function getPlanFromPriceId(priceId: string): PlanTier | null {
  for (const [tier, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return tier as PlanTier;
  }
  return null;
}

export function getPlanLimit(tier: PlanTier): number {
  return PLANS[tier].dailyMessageLimit;
}