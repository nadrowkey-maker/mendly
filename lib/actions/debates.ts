"use server";

import { createClient } from "@/lib/supabase/server";
import { PLANS, DEBATE_RECHARGE_DAYS } from "@/lib/stripe/plans";
import { getUserPlan } from "@/lib/actions/subscription";
import type { DebateRecord, DebateAccess } from "@/lib/types/tracking";

/** Record a launched debate (history + sliding-recharge tracking). */
export async function recordDebate(input: {
  projectId: string;
  conversationId?: string | null;
  question: string;
  verdict?: string | null;
  agents?: string[];
}): Promise<{ success: boolean; error?: string; debateId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("debates")
    .insert({
      project_id: input.projectId,
      user_id: user.id,
      conversation_id: input.conversationId ?? null,
      question: input.question.trim().slice(0, 2000),
      verdict: input.verdict?.trim() || null,
      agents: input.agents ?? [],
    })
    .select("id")
    .single();

  if (error) {
    console.error("recordDebate error:", error);
    return { success: false, error: "Could not record debate" };
  }
  return { success: true, debateId: (data as { id: string }).id };
}

/** Most recent debate for the user, or null. */
export async function getLastDebate(): Promise<DebateRecord | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("debates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getLastDebate error:", error);
    return null;
  }
  return (data as DebateRecord) ?? null;
}

/**
 * Whether the user can launch a debate now.
 * Paid plans: unlimited. Free: one debate per sliding 7-day window.
 */
export async function getDebateAccess(): Promise<DebateAccess> {
  const plan = await getUserPlan();
  const cadence = PLANS[plan].debates;

  if (cadence === "unlimited") {
    return { canLaunch: true, cadence, nextAvailableAt: null, lastDebateAt: null };
  }

  const last = await getLastDebate();
  if (!last) {
    return { canLaunch: true, cadence, nextAvailableAt: null, lastDebateAt: null };
  }

  const lastMs = new Date(last.created_at).getTime();
  const nextMs = lastMs + DEBATE_RECHARGE_DAYS * 24 * 60 * 60 * 1000;
  const canLaunch = Date.now() >= nextMs;

  return {
    canLaunch,
    cadence,
    nextAvailableAt: canLaunch ? null : new Date(nextMs).toISOString(),
    lastDebateAt: last.created_at,
  };
}

/**
 * Sessions autonomes d'un projet : ce que l'equipe a produit sans le fondateur.
 * Les plus recentes d'abord, non lues en premier lieu d'interet.
 */
export async function listAutonomousSessions(
  projectId: string
): Promise<DebateRecord[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("debates")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .eq("origin", "autonomous")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("listAutonomousSessions error:", error);
    return [];
  }
  return (data ?? []) as DebateRecord[];
}

/**
 * Marque les sessions autonomes comme lues.
 *
 * Sans cet appel, le cron d'equipe s'arreterait definitivement apres sa
 * premiere session : sa regle "jamais de nouvelle session tant que la
 * precedente n'a pas ete lue" resterait bloquee a jamais.
 */
export async function markAutonomousSessionsSeen(
  projectId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from("debates")
    .update({ seen_at: new Date().toISOString() })
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .eq("origin", "autonomous")
    .is("seen_at", null);

  if (error) {
    console.error("markAutonomousSessionsSeen error:", error);
    return { success: false };
  }
  return { success: true };
}
