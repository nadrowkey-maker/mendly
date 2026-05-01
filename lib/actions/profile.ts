"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingInput, UserProfile } from "@/lib/types/profile";

/**
 * Returns the user's profile or null if not yet created.
 * Profile rows are created lazily on first save — RLS protects per user_id.
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getUserProfile error:", error);
    return null;
  }

  return (data as UserProfile | null) ?? null;
}

/**
 * Whether the user has either completed or actively skipped onboarding.
 * Used by the layout to decide whether to redirect to /onboarding.
 */
export async function hasSeenOnboarding(): Promise<boolean> {
  const profile = await getUserProfile();
  if (!profile) return false;
  return profile.onboarding_completed || profile.onboarding_skipped;
}

/**
 * Save the onboarding answers and mark as completed.
 * Uses upsert because the row may not exist yet.
 */
export async function saveOnboarding(input: OnboardingInput): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const trimmedContext = input.founder_context?.trim() ?? "";
  const trimmedGoals = input.goals?.trim() ?? "";
  if (trimmedContext.length > 2000 || trimmedGoals.length > 2000) {
    return { success: false, error: "Texte trop long (max 2000 caractères)" };
  }

  const { error } = await supabase.from("user_profiles").upsert(
    {
      user_id: user.id,
      founder_context: trimmedContext || null,
      expertise: input.expertise,
      goals: trimmedGoals || null,
      time_commitment: input.time_commitment,
      stage: input.stage,
      onboarding_completed: true,
      onboarding_skipped: false,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("saveOnboarding error:", error);
    return { success: false, error: "Impossible d'enregistrer ton profil" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Mark onboarding as skipped. The user won't be re-prompted.
 * They can still fill it later via Settings.
 */
export async function skipOnboarding(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("user_profiles").upsert(
    {
      user_id: user.id,
      onboarding_completed: false,
      onboarding_skipped: true,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("skipOnboarding error:", error);
    return { success: false, error: "Erreur" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Update profile from the Settings page (partial update).
 */
export async function updateProfile(
  patch: Partial<OnboardingInput>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const cleanPatch: Record<string, unknown> = { user_id: user.id };
  if (patch.founder_context !== undefined) {
    cleanPatch.founder_context = patch.founder_context.trim() || null;
  }
  if (patch.expertise !== undefined) cleanPatch.expertise = patch.expertise;
  if (patch.goals !== undefined) cleanPatch.goals = patch.goals.trim() || null;
  if (patch.time_commitment !== undefined) cleanPatch.time_commitment = patch.time_commitment;
  if (patch.stage !== undefined) cleanPatch.stage = patch.stage;

  cleanPatch.onboarding_completed = true;
  cleanPatch.onboarding_skipped = false;

  const { error } = await supabase
    .from("user_profiles")
    .upsert(cleanPatch, { onConflict: "user_id" });

  if (error) {
    console.error("updateProfile error:", error);
    return { success: false, error: "Impossible de mettre à jour" };
  }

  revalidatePath("/settings");
  return { success: true };
}
