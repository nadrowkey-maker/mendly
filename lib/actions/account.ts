"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

/**
 * Returns true if the user has any active or non-canceled paid subscription.
 * We block account deletion in that case to avoid orphan Stripe state.
 */
export async function hasActiveSubscription(): Promise<{
  hasActive: boolean;
  status: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { hasActive: false, status: null };

  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return { hasActive: false, status: null };

  if (data.plan === "free") return { hasActive: false, status: data.status };

  const blockingStatuses = new Set([
    "active",
    "trialing",
    "past_due",
    "incomplete",
    "incomplete_expired",
    "unpaid",
  ]);
  return {
    hasActive: blockingStatuses.has(data.status ?? ""),
    status: data.status,
  };
}

/**
 * Deletes the user's account.
 * - Refuses if there's an active paid subscription (user must cancel first).
 * - Deletes auth.users via the service role; cascade rules in the DB
 *   take care of projects / conversations / messages / deliverables / profile.
 */
export async function deleteAccount(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { hasActive } = await hasActiveSubscription();
  if (hasActive) {
    return {
      success: false,
      error:
        "Tu as un abonnement actif. Annule-le depuis le portail Stripe avant de supprimer ton compte.",
    };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return {
      success: false,
      error: "Configuration serveur manquante. Contacte le support.",
    };
  }

  // Best-effort storage cleanup (deliverables bucket)
  try {
    const { data: projectFolders } = await supabase.storage
      .from("deliverables")
      .list(user.id);

    if (projectFolders && projectFolders.length > 0) {
      const allPaths: string[] = [];
      for (const folder of projectFolders) {
        const { data: files } = await supabase.storage
          .from("deliverables")
          .list(`${user.id}/${folder.name}`);
        if (files) {
          allPaths.push(
            ...files.map((f) => `${user.id}/${folder.name}/${f.name}`)
          );
        }
      }
      if (allPaths.length > 0) {
        await supabase.storage.from("deliverables").remove(allPaths);
      }
    }
  } catch (err) {
    console.warn("Storage cleanup partial during account deletion:", err);
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("Account deletion error:", error);
    return { success: false, error: "Impossible de supprimer le compte" };
  }

  await supabase.auth.signOut();

  return { success: true };
}
