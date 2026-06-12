"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MemoryEvent, MemoryKind } from "@/lib/types/tracking";

/** Full project memory timeline, newest first. */
export async function listProjectMemory(projectId: string): Promise<MemoryEvent[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("memory_events")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listProjectMemory error:", error);
    return [];
  }
  return (data ?? []) as MemoryEvent[];
}

export async function createMemoryEvent(input: {
  projectId: string;
  kind: MemoryKind;
  title: string;
  detail?: string | null;
}): Promise<{ success: boolean; error?: string; event?: MemoryEvent }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const title = input.title.trim();
  if (!title) return { success: false, error: "Empty title" };

  const { data, error } = await supabase
    .from("memory_events")
    .insert({
      project_id: input.projectId,
      user_id: user.id,
      kind: input.kind,
      title,
      detail: input.detail?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error("createMemoryEvent error:", error);
    return { success: false, error: "Could not create memory event" };
  }

  revalidatePath(`/dashboard/projects/${input.projectId}`);
  return { success: true, event: data as MemoryEvent };
}
