"use server";

import { createClient } from "@/lib/supabase/server";

export interface DeliverableWithUrl {
  id: string;
  project_id: string;
  agent_role: string;
  type: string;
  title: string;
  file_path: string | null;
  created_at: string;
}

/**
 * Lists all deliverables for a project (RLS ensures user owns it).
 */
export async function listDeliverables(
  projectId: string
): Promise<DeliverableWithUrl[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("deliverables")
    .select("id, project_id, agent_role, type, title, file_path, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listDeliverables error:", error);
    return [];
  }

  return (data ?? []) as DeliverableWithUrl[];
}

/**
 * Generates a fresh signed URL (1 hour) to download a deliverable PDF.
 */
export async function getDeliverableDownloadUrl(
  filePath: string
): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Security check: file path must start with the user's id folder
  if (!filePath.startsWith(`${user.id}/`)) {
    console.error("Path mismatch — not user's deliverable");
    return null;
  }

  const { data, error } = await supabase.storage
    .from("deliverables")
    .createSignedUrl(filePath, 3600);

  if (error) {
    console.error("Signed URL error:", error);
    return null;
  }

  return data?.signedUrl ?? null;
}

/**
 * Deletes a deliverable (DB row + Storage file).
 */
export async function deleteDeliverable(
  deliverableId: string,
  filePath: string | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // Delete from storage first
  if (filePath && filePath.startsWith(`${user.id}/`)) {
    await supabase.storage.from("deliverables").remove([filePath]);
  }

  // Then delete DB row (RLS protects us)
  const { error } = await supabase
    .from("deliverables")
    .delete()
    .eq("id", deliverableId);

  if (error) {
    console.error("Delete deliverable error:", error);
    return { success: false, error: "Could not delete" };
  }

  return { success: true };
}