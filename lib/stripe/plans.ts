export type PlanTier = "free" | "starter" | "pro";

/** Days for the free plan's sliding debate recharge (1 debate / 7 days). */
export const DEBATE_RECHARGE_DAYS = 7;

export const PLANS = {
  free: {
    name: "Free",
    priceId: null,
    dailyMessageLimit: 10,
    projectLimit: 1,
    agentsAvailable: ["CEO", "CTO", "CMO"] as const,
    // Free gets one real team debate per sliding 7-day window (enforced in the
    // debate route via getDebateAccess()). Debates only use the 3 free agents.
    debateEnabled: true,
    debates: "weekly" as const,
  },
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_PRICE_STARTER ?? null,
    dailyMessageLimit: 100,
    projectLimit: 3,
    agentsAvailable: ["CEO", "CTO", "CMO", "CPO", "CFO", "CDO", "DEV", "CCO"] as const,
    debateEnabled: true,
    debates: "unlimited" as const,
    weeklyMemos: true,
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO ?? null,
    dailyMessageLimit: 500,
    projectLimit: 10,
    agentsAvailable: ["CEO", "CTO", "CMO", "CPO", "CFO", "CDO", "DEV", "CCO"] as const,
    debateEnabled: true,
    debates: "unlimited" as const,
    weeklyMemos: true,
    weeklyMemosEnriched: true,
  },
} as const;

export function getPlanFromPriceId(priceId: string): PlanTier | null {
  if (priceId === PLANS.starter.priceId) return "starter";
  if (priceId === PLANS.pro.priceId) return "pro";
  return null;
}
