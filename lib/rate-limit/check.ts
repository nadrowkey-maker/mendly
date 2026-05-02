import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanTier } from "@/lib/stripe/plans";

export interface RateLimitResult {
  allowed: boolean;
  used: number;
  remaining: number;
  limit: number;
  resetsAt: Date;
  plan: PlanTier;
  unlimited: boolean;
}

/**
 * Counts user messages in the last 24h and returns the rate limit info,
 * adjusted for the user's current plan.
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const supabase = await createClient();

  // Fetch user's plan
  const { data: subData } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();

  const rawPlan = subData?.plan as string;
  const plan: PlanTier = (rawPlan in PLANS) ? (rawPlan as PlanTier) : "free";
  const limit = PLANS[plan].dailyMessageLimit;
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);

  // Count user messages in last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", since);

  if (error) {
    console.error("Rate limit check error:", error);
    return {
      allowed: true,
      used: 0,
      remaining: limit,
      limit,
      resetsAt: tomorrow,
      plan,
      unlimited: false,
    };
  }

  const used = count ?? 0;
  const remaining = Math.max(0, limit - used);
  const allowed = used < limit;

  return {
    allowed,
    used,
    remaining,
    limit,
    resetsAt: tomorrow,
    plan,
    unlimited: false,
  };
}

export async function getUsageInfo(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(userId);
}

// Legacy export for backwards compat
export const FREE_DAILY_LIMIT = 10;