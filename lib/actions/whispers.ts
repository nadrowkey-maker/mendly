"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Whisper } from "@/lib/types/tracking";

export async function listProjectWhispers(projectId: string): Promise<Whisper[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("whispers")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listProjectWhispers error:", error);
    return [];
  }
  return (data ?? []) as Whisper[];
}

/** Total unread whispers for the user — for a global badge. */
export async function getUnreadWhisperCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("whispers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    console.error("getUnreadWhisperCount error:", error);
    return 0;
  }
  return count ?? 0;
}

/** Map of projectId -> unread count, for dashboard card badges. */
export async function getUnreadWhisperCountsByProject(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("whispers")
    .select("project_id")
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    console.error("getUnreadWhisperCountsByProject error:", error);
    return {};
  }
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const pid = (row as { project_id: string }).project_id;
    counts[pid] = (counts[pid] ?? 0) + 1;
  }
  return counts;
}

export type WhisperWithProject = Whisper & {
  projects?: { name: string; emoji: string | null; accent_color: string | null } | null;
};

/** All whispers across the user's projects — for the global Whispers center (Bloc 1.3). */
export async function listAllWhispers(): Promise<WhisperWithProject[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("whispers")
    .select("*, projects(name, emoji, accent_color)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("listAllWhispers error:", error);
    return [];
  }
  return (data ?? []) as WhisperWithProject[];
}

/** Mark every unread whisper read (used by the Whispers center). */
export async function markAllWhispersRead(): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from("whispers")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    console.error("markAllWhispersRead error:", error);
    return { success: false };
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/whispers");
  return { success: true };
}

export async function createWhisper(input: {
  projectId: string;
  agentRole: string;
  content: string;
}): Promise<{ success: boolean; error?: string; whisper?: Whisper }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const content = input.content.trim();
  if (!content) return { success: false, error: "Empty whisper" };

  const { data, error } = await supabase
    .from("whispers")
    .insert({
      project_id: input.projectId,
      user_id: user.id,
      agent_role: input.agentRole,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("createWhisper error:", error);
    return { success: false, error: "Could not create whisper" };
  }
  revalidatePath("/dashboard");
  return { success: true, whisper: data as Whisper };
}

export async function markWhisperRead(id: string): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase.from("whispers").update({ read: true }).eq("id", id);
  if (error) {
    console.error("markWhisperRead error:", error);
    return { success: false };
  }
  return { success: true };
}

export async function markProjectWhispersRead(projectId: string): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from("whispers")
    .update({ read: true })
    .eq("project_id", projectId)
    .eq("read", false);

  if (error) {
    console.error("markProjectWhispersRead error:", error);
    return { success: false };
  }
  revalidatePath("/dashboard");
  return { success: true };
}
