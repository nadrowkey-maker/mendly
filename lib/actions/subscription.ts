"use server";

import { createClient } from "@/lib/supabase/server";
import { PLANS, resolvePlan, type PlanTier } from "@/lib/stripe/plans";

export interface UserSubscription {
  plan: PlanTier;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
}

/**
 * Returns the user's current subscription. Defaults to "free" if none exists.
 */
export async function getUserSubscription(): Promise<UserSubscription> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      plan: "free",
      status: "active",
      current_period_end: null,
      cancel_at_period_end: false,
      stripe_customer_id: null,
    };
  }

  const { data } = await supabase
    .from("subscriptions")
    .select(
      "plan, status, current_period_end, cancel_at_period_end, stripe_customer_id"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    return {
      plan: "free",
      status: "active",
      current_period_end: null,
      cancel_at_period_end: false,
      stripe_customer_id: null,
    };
  }

  // Le plan renvoyé est le plan effectif, statut compris : c'est lui que
  // l'interface affiche et que les contrôles appliquent.
  const row = data as UserSubscription;
  return { ...row, plan: resolvePlan(row.plan, row.status) };
}

export async function getUserPlan(): Promise<PlanTier> {
  const sub = await getUserSubscription();
  return sub.plan;
}

export async function getUserDailyLimit(): Promise<number> {
  const plan = await getUserPlan();
  return PLANS[plan].dailyMessageLimit;
}