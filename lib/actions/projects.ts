"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { track } from "@/lib/actions/analytics";
import { createMemoryEvent } from "@/lib/actions/memory";
import { assignProjectTeam } from "@/lib/ai/team/assign-team";
import { PLANS, type PlanTier, resolvePlan } from "@/lib/stripe/plans";
import type {
  CreateProjectInput,
  Project,
  ProjectSector,
  ProjectStage,
  ProjectPriority,
  ProjectTimeCommitment,
} from "@/lib/types/project";

/**
 * Create a new project for the authenticated user.
 */
export async function createProject(input: CreateProjectInput): Promise<{
  success: boolean;
  error?: string;
  project?: Project;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // ============= PROJECT LIMIT CHECK =============
  const { data: subData } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .maybeSingle();
  const plan = resolvePlan(subData?.plan, subData?.status);
  const projectLimit = PLANS[plan].projectLimit;
  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if ((count ?? 0) >= projectLimit) {
    return { success: false, error: `plan_limit:${projectLimit}` };
  }

  if (!input.name || input.name.trim().length < 2) {
    return { success: false, error: "Le nom du projet est trop court" };
  }
  if (input.name.length > 100) {
    return { success: false, error: "Le nom du projet est trop long" };
  }

  // Mendly assembles this project's permanent specialist team once, here —
  // before the row exists, since we already have everything the assignment
  // needs (name/description/stage/sector) straight from the form input.
  const trimmedName = input.name.trim();
  const trimmedDescription = input.description?.trim() || null;
  const team = await assignProjectTeam({
    name: trimmedName,
    description: trimmedDescription,
    stage: input.stage,
    sector: input.sector || null,
    locale: input.locale === "en" ? "en" : "fr",
    maxAgents: PLANS[plan].teamSize,
  });

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: trimmedName,
      description: trimmedDescription,
      sector: input.sector || null,
      stage: input.stage,
      priority: input.priority || null,
      time_commitment: input.time_commitment || null,
      accent_color: input.accent_color || null,
      emoji: input.emoji || null,
      vision: input.vision?.trim() || null,
      assigned_agents: team.agents,
      team_rationale: team.rationale,
    })
    .select()
    .single();

  if (error) {
    console.error("createProject error:", error);
    return { success: false, error: "Impossible de créer le projet" };
  }

  void track("project_created", { stage: input.stage, sector: input.sector ?? null });
  revalidatePath("/dashboard");
  return { success: true, project: data as Project };
}

/**
 * List all projects for the authenticated user.
 */
export async function listProjects(): Promise<Project[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listProjects error:", error);
    return [];
  }

  return (data ?? []) as Project[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  sector?: ProjectSector | null;
  stage?: ProjectStage;
  priority?: ProjectPriority | null;
  time_commitment?: ProjectTimeCommitment | null;
}

/**
 * Update an existing project. RLS ensures user owns it.
 */
export async function updateProject(
  projectId: string,
  patch: UpdateProjectInput
): Promise<{ success: boolean; error?: string; project?: Project }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  let prevStage: string | null = null;
  if (patch.stage !== undefined) {
    const { data: cur } = await supabase
      .from("projects")
      .select("stage")
      .eq("id", projectId)
      .single();
    prevStage = (cur as { stage?: string } | null)?.stage ?? null;
  }

  const cleanPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) {
    const trimmed = patch.name.trim();
    if (trimmed.length < 2) return { success: false, error: "Nom trop court" };
    if (trimmed.length > 100) return { success: false, error: "Nom trop long" };
    cleanPatch.name = trimmed;
  }
  if (patch.description !== undefined) {
    cleanPatch.description = patch.description?.trim() || null;
  }
  if (patch.sector !== undefined) cleanPatch.sector = patch.sector;
  if (patch.stage !== undefined) cleanPatch.stage = patch.stage;
  if (patch.priority !== undefined) cleanPatch.priority = patch.priority;
  if (patch.time_commitment !== undefined) cleanPatch.time_commitment = patch.time_commitment;

  if (Object.keys(cleanPatch).length === 0) {
    return { success: false, error: "Rien à mettre à jour" };
  }

  cleanPatch.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("projects")
    .update(cleanPatch)
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    console.error("updateProject error:", error);
    return { success: false, error: "Impossible de mettre à jour le projet" };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${projectId}`);

  // Celebrate stage advancement (Bloc 8.3) — lands a milestone in project memory.
  if (patch.stage && prevStage) {
    const order: Record<string, number> = { idea: 0, mvp: 1, launched: 2, scaling: 3 };
    if ((order[patch.stage] ?? 0) > (order[prevStage] ?? 0)) {
      void createMemoryEvent({
        projectId,
        kind: "milestone",
        title: `Milestone: ${prevStage} → ${patch.stage}`,
      });
      void track("milestone_reached", { stage: patch.stage });
    }
  }

  return { success: true, project: data as Project };
}

/**
 * Delete a project. RLS prevents deleting someone else's.
 * Cascading deletes handled at DB level.
 */
export async function deleteProject(projectId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const prefix = `${user.id}/${projectId}/`;
    const { data: files } = await supabase.storage
      .from("deliverables")
      .list(prefix.replace(/\/$/, ""));
    if (files && files.length > 0) {
      const paths = files.map((f) => `${prefix}${f.name}`);
      await supabase.storage.from("deliverables").remove(paths);
    }
  } catch (err) {
    console.warn("Storage cleanup skipped:", err);
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    console.error("deleteProject error:", error);
    return { success: false, error: "Impossible de supprimer le projet" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
