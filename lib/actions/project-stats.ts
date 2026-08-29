"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Les compteurs d'un projet, pour le bandeau console de l'écran de travail.
 *
 * Même approche que dashboard-stats : `head: true` avec `count: "exact"`, donc
 * aucune ligne rapatriée. Ces quatre requêtes partent à chaque ouverture de
 * projet — elles doivent rester des comptages, pas des chargements.
 */
export interface ProjectStats {
  decisions: number;
  openActions: number;
  sessions: number;
  unseenSessions: number;
}

const EMPTY: ProjectStats = { decisions: 0, openActions: 0, sessions: 0, unseenSessions: 0 };

export async function getProjectStats(projectId: string): Promise<ProjectStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EMPTY;

  const [decisions, openActions, sessions, unseen] = await Promise.all([
    supabase
      .from("memory_events")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("kind", "decision"),
    supabase
      .from("actions")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("status", "todo"),
    supabase
      .from("debates")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("origin", "autonomous"),
    supabase
      .from("debates")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("origin", "autonomous")
      .is("seen_at", null),
  ]);

  return {
    decisions: decisions.count ?? 0,
    openActions: openActions.count ?? 0,
    sessions: sessions.count ?? 0,
    unseenSessions: unseen.count ?? 0,
  };
}
