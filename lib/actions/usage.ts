"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, type RateLimitResult } from "@/lib/rate-limit/check";

/**
 * Server action callable from client components to refresh the usage counter.
 */
export async function fetchUserUsage(): Promise<RateLimitResult | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return checkRateLimit(user.id);
}