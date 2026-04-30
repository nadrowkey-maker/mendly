import { createClient } from "@/lib/supabase/server";

export const FREE_DAILY_LIMIT = 10;

export interface RateLimitResult {
  allowed: boolean;
  used: number;
  remaining: number;
  limit: number;
  resetsAt: Date;
}

/**
 * Counts how many user messages were sent in the last 24h
 * across all conversations of the current user.
 *
 * Returns rate limit info. allowed = false means user hit the cap.
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const supabase = await createClient();

  // Count user messages in the last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", since);

  if (error) {
    console.error("Rate limit check error:", error);
    // Fail open — don't block users if our own check fails
    return {
      allowed: true,
      used: 0,
      remaining: FREE_DAILY_LIMIT,
      limit: FREE_DAILY_LIMIT,
      resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  const used = count ?? 0;
  const remaining = Math.max(0, FREE_DAILY_LIMIT - used);
  const allowed = used < FREE_DAILY_LIMIT;

  // resetsAt = the time when the oldest message in window will exit the rolling 24h
  // Simpler: midnight tonight (close enough for UX)
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);

  return {
    allowed,
    used,
    remaining,
    limit: FREE_DAILY_LIMIT,
    resetsAt: tomorrow,
  };
}

/**
 * Same check but returns just the count for UI display.
 * Use this in server components to show "X/10 messages today".
 */
export async function getUsageInfo(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(userId);
}