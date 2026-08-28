"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionItem, ActionStatus, ActionSource } from "@/lib/types/tracking";

/** All actions for a project, newest first. */
export async function listProjectActions(projectId: string): Promise<ActionItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("actions")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listProjectActions error:", error);
    return [];
  }
  return (data ?? []) as ActionItem[];
}

/** Open (todo) actions across all of the user's projects — for the dashboard. */
export async function listOpenActions(limit = 20): Promise<ActionItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("actions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "todo")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("listOpenActions error:", error);
    return [];
  }
  return (data ?? []) as ActionItem[];
}

export async function createAction(input: {
  projectId: string;
  content: string;
  source?: ActionSource;
  conversationId?: string | null;
}): Promise<{ success: boolean; error?: string; action?: ActionItem }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const content = input.content.trim();
  if (!content) return { success: false, error: "Empty action" };

  const { data, error } = await supabase
    .from("actions")
    .insert({
      project_id: input.projectId,
      user_id: user.id,
      conversation_id: input.conversationId ?? null,
      content,
      source: input.source ?? "manual",
    })
    .select()
    .single();

  if (error) {
    console.error("createAction error:", error);
    return { success: false, error: "Could not create action" };
  }

  revalidatePath(`/dashboard/projects/${input.projectId}`);
  revalidatePath("/dashboard");
  return { success: true, action: data as ActionItem };
}

export async function setActionStatus(
  actionId: string,
  status: ActionStatus
): Promise<{ success: boolean; error?: string; action?: ActionItem }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("actions")
    .update({ status, completed_at: status === "done" ? new Date().toISOString() : null })
    .eq("id", actionId)
    .select()
    .single();

  if (error) {
    console.error("setActionStatus error:", error);
    return { success: false, error: "Could not update action" };
  }

  revalidatePath(`/dashboard/projects/${(data as ActionItem).project_id}`);
  revalidatePath("/dashboard");
  return { success: true, action: data as ActionItem };
}

export async function deleteAction(actionId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("actions").delete().eq("id", actionId);
  if (error) {
    console.error("deleteAction error:", error);
    return { success: false, error: "Could not delete action" };
  }
  revalidatePath("/dashboard");
  return { success: true };
}

export interface ProjectBriefing {
  lastDecision?: string;
  nextAction?: string;
}

/**
 * Per-project briefing for the dashboard cards (Bloc 1.1):
 * the latest decision taken + the next open action.
 */
export async function getProjectBriefings(): Promise<Record<string, ProjectBriefing>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const [decisionsRes, actionsRes] = await Promise.all([
    supabase
      .from("memory_events")
      .select("project_id, title, created_at")
      .eq("user_id", user.id)
      .eq("kind", "decision")
      .order("created_at", { ascending: false }),
    supabase
      .from("actions")
      .select("project_id, content, created_at")
      .eq("user_id", user.id)
      .eq("status", "todo")
      .order("created_at", { ascending: true }),
  ]);

  const out: Record<string, ProjectBriefing> = {};
  for (const row of (decisionsRes.data ?? []) as { project_id: string; title: string }[]) {
    if (!out[row.project_id]?.lastDecision) {
      out[row.project_id] = { ...out[row.project_id], lastDecision: row.title };
    }
  }
  for (const row of (actionsRes.data ?? []) as { project_id: string; content: string }[]) {
    if (!out[row.project_id]?.nextAction) {
      out[row.project_id] = { ...out[row.project_id], nextAction: row.content };
    }
  }
  return out;
}
