"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CreateProjectInput, Project } from "@/lib/types/project";

/**
 * Crée un nouveau projet pour le user authentifié
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

  // Validation simple
  if (!input.name || input.name.trim().length < 2) {
    return { success: false, error: "Le nom du projet est trop court" };
  }
  if (input.name.length > 100) {
    return { success: false, error: "Le nom du projet est trop long" };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      sector: input.sector || null,
      stage: input.stage,
      priority: input.priority || null,
      time_commitment: input.time_commitment || null,
    })
    .select()
    .single();

  if (error) {
    console.error("createProject error:", error);
    return { success: false, error: "Impossible de créer le projet" };
  }

  revalidatePath("/dashboard");
  return { success: true, project: data as Project };
}

/**
 * Récupère tous les projets du user authentifié
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

/**
 * Supprime un projet du user (RLS empêche déjà de supprimer celui d'un autre)
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