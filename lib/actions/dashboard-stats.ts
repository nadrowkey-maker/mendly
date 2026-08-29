"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Les compteurs du tableau de bord.
 *
 * Ils n'existaient nulle part : l'app ne comptait ni les décisions accumulées,
 * ni les sessions autonomes non lues. C'est pourtant ce que la landing montre
 * dans sa console, et surtout ce qui dit au fondateur que quelque chose s'est
 * passé en son absence.
 *
 * Requêtes en `head: true` avec `count: "exact"` : on ne rapatrie aucune ligne,
 * seulement le nombre. Sur un projet actif depuis des mois, charger toute la
 * mémoire pour en compter les entrées serait absurde.
 */
export interface DashboardStats {
  decisions: number;
  unseenSessions: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { decisions: 0, unseenSessions: 0 };

  const [decisionsRes, sessionsRes] = await Promise.all([
    supabase
      .from("memory_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("kind", "decision"),
    supabase
      .from("debates")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("origin", "autonomous")
      .is("seen_at", null),
  ]);

  return {
    decisions: decisionsRes.count ?? 0,
    unseenSessions: sessionsRes.count ?? 0,
  };
}
