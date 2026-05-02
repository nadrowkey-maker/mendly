export type PlanTier = "free" | "starter" | "pro";

export const PLANS = {
  free: {
    name: "Free",
    priceId: null,
    dailyMessageLimit: 10,
    projectLimit: 1,
    agentsAvailable: ["CEO", "CTO", "CMO"] as const,
    debateEnabled: false,
  },
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_PRICE_STARTER ?? null,
    dailyMessageLimit: 100,
    projectLimit: 3,
    agentsAvailable: ["CEO", "CTO", "CMO", "CPO", "CFO", "CDO", "DEV", "CCO"] as const,
    debateEnabled: true,
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO ?? null,
    dailyMessageLimit: 500,
    projectLimit: 10,
    agentsAvailable: ["CEO", "CTO", "CMO", "CPO", "CFO", "CDO", "DEV", "CCO"] as const,
    debateEnabled: true,
    weeklyMemos: true,
  },
} as const;

export function getPlanFromPriceId(priceId: string): PlanTier | null {
  if (priceId === PLANS.starter.priceId) return "starter";
  if (priceId === PLANS.pro.priceId) return "pro";
  return null;
}
