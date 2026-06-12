"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Fire-and-forget usage event (Bloc 9.5). Never throws. Reads are service-role
 * only (no RLS select policy) — query analytics_events in the Supabase SQL editor.
 */
export async function track(event: string, props: Record<string, unknown> = {}): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("analytics_events").insert({ user_id: user.id, event, props });
  } catch (e) {
    console.warn("track skipped:", e);
  }
}
