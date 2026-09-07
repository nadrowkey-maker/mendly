"use server";

import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/stripe/plans";
import { getUserPlan } from "@/lib/actions/subscription";
import type { DebateRecord, DebateAccess } from "@/lib/types/tracking";

/** Enregistre un débat lancé par le fondateur (origin vaut "founder" par défaut). */
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
 * Payant : illimité. Gratuit : UN seul débat, à vie.
 */
export async function getDebateAccess(): Promise<DebateAccess> {
  const plan = await getUserPlan();
  const cadence = PLANS[plan].debates;

  if (cadence === "unlimited") {
    return { canLaunch: true, cadence, nextAvailableAt: null, lastDebateAt: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { canLaunch: false, cadence, nextAvailableAt: null, lastDebateAt: null };
  }

  /*
   * Le quota ne compte QUE les débats lancés par le fondateur.
   *
   * getLastDebate() ne filtrait pas l'origine : une session autonome produite
   * par le cron pendant la nuit consommait le quota du fondateur, qui se
   * retrouvait bloqué sans avoir rien lancé. Le cadeau devenait une punition.
   */
  const { data, count } = await supabase
    .from("debates")
    .select("created_at", { count: "exact" })
    .eq("user_id", user.id)
    .eq("origin", "founder")
    .order("created_at", { ascending: false })
    .limit(1);

  const used = count ?? 0;
  const last = (data ?? [])[0] as { created_at: string } | undefined;

  return {
    canLaunch: used === 0,
    cadence,
    // Le quota gratuit ne se recharge pas : il n'y a pas de prochaine échéance.
    nextAvailableAt: null,
    lastDebateAt: last?.created_at ?? null,
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
