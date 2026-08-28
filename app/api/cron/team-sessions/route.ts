/**
 * Cron endpoint — sessions de travail autonomes de l'équipe.
 *
 * L'équipe assignée d'un projet se réunit sans que le fondateur déclenche quoi
 * que ce soit, débat d'un sujet tiré de l'état réel du projet, et laisse le
 * résultat dans la salle de réunion pour sa prochaine visite.
 *
 * Tourne quotidiennement, mais ne produit presque jamais quelque chose : la
 * cadence par plan et le filtre de pertinence (lib/ai/team/session-policy.ts)
 * écartent la grande majorité des projets à chaque passage. C'est voulu — une
 * session sans matière neuve accouche d'un débat générique, et le fondateur
 * qui ouvre la salle pour y trouver du blabla n'y revient plus.
 *
 * Sécurité : appelable uniquement avec un header CRON_SECRET valide.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PLANS, type PlanTier } from "@/lib/stripe/plans";
import { runHeadlessDebate } from "@/lib/ai/debate/run-headless";
import {
  decideSession,
  generateSessionTopic,
  STALLED_ACTION_DAYS,
} from "@/lib/ai/team/session-policy";
import { selectMemoryForContext, relativeAge } from "@/lib/ai/project-memory";
import type { MemoryEvent } from "@/lib/types/tracking";
import type { Project } from "@/lib/types/project";
import type { DebateAgentRole } from "@/lib/types/debate";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Plafond dur par passage. Le filtre de pertinence borne déjà le volume, mais
 * il dépend d'un modèle : ce plafond, lui, est arithmétique. Il garantit qu'une
 * anomalie de données ne se traduise pas par une facture Gemini imprévue.
 */
const MAX_SESSIONS_PER_RUN = 20;

/** Fenêtre au-delà de laquelle un projet est considéré comme encore vivant. */
const ALIVE_WINDOW_DAYS = 14;

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const now = new Date();
  const skipped: Record<string, number> = {};
  let created = 0;

  const skip = (reason: string) => {
    skipped[reason] = (skipped[reason] ?? 0) + 1;
  };

  try {
    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: true });

    if (!projects?.length) {
      return NextResponse.json({ message: "No projects", created: 0 });
    }

    // Un seul appel pour tous les abonnements : le plan est relu pour chaque
    // projet, le faire projet par projet multiplierait les allers-retours.
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("user_id, plan")
      .eq("status", "active");
    const planOf = new Map<string, PlanTier>();
    for (const s of (subs ?? []) as { user_id: string; plan: string }[]) {
      if (s.plan === "pro" || s.plan === "starter") planOf.set(s.user_id, s.plan);
    }

    for (const raw of projects as Project[]) {
      if (created >= MAX_SESSIONS_PER_RUN) {
        skip("plafond du passage atteint");
        continue;
      }

      try {
        const project = raw;
        const plan: PlanTier = planOf.get(project.user_id) ?? "free";

        const stalledBefore = new Date(now.getTime() - STALLED_ACTION_DAYS * 86_400_000).toISOString();
        const aliveAfter = new Date(now.getTime() - ALIVE_WINDOW_DAYS * 86_400_000).toISOString();

        const [lastSessionRes, unseenRes, memoryRes, actionsRes, stalledRes, messagesRes] =
          await Promise.all([
            supabase
              .from("debates")
              .select("created_at")
              .eq("project_id", project.id)
              .eq("origin", "autonomous")
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle(),
            supabase
              .from("debates")
              .select("id")
              .eq("project_id", project.id)
              .eq("origin", "autonomous")
              .is("seen_at", null)
              .limit(1),
            supabase
              .from("memory_events")
              .select("*")
              .eq("project_id", project.id)
              .order("created_at", { ascending: false })
              .limit(40),
            supabase
              .from("actions")
              .select("content, created_at")
              .eq("project_id", project.id)
              .eq("status", "todo")
              .order("created_at", { ascending: false })
              .limit(10),
            supabase
              .from("actions")
              .select("id")
              .eq("project_id", project.id)
              .eq("status", "todo")
              .lt("created_at", stalledBefore),
            supabase
              .from("messages")
              .select("id")
              .eq("user_id", project.user_id)
              .eq("role", "user")
              .gte("created_at", aliveAfter)
              .limit(1),
          ]);

        const lastSessionAt = lastSessionRes.data?.created_at ?? null;
        const memory = (memoryRes.data ?? []) as MemoryEvent[];
        const newMemoryEvents = lastSessionAt
          ? memory.filter((m) => new Date(m.created_at) > new Date(lastSessionAt)).length
          : memory.length;

        const decision = decideSession(
          {
            plan,
            projectCreatedAt: project.created_at,
            lastSessionAt,
            hasUnseenSession: (unseenRes.data ?? []).length > 0,
            newMemoryEvents,
            stalledActions: (stalledRes.data ?? []).length,
            recentFounderMessages: (messagesRes.data ?? []).length,
          },
          now
        );

        if (!decision.run) {
          skip(decision.reason);
          continue;
        }

        const openActions = (actionsRes.data ?? []) as { content: string; created_at: string }[];
        const memoryStr = selectMemoryForContext(memory)
          .map((m) => `- [${m.kind}] ${m.title} (${relativeAge(m.created_at, "fr", now)})`)
          .join("\n");
        const actionsStr = openActions.map((a) => `- ${a.content}`).join("\n");

        const topic = await generateSessionTopic({
          projectName: project.name,
          projectDescription: project.description,
          stage: project.stage,
          memory: memoryStr,
          openActions: actionsStr,
          locale: "fr",
        });

        // Le modèle a le droit de dire "rien à débattre". C'est la porte de
        // sortie qui empêche la session de remplissage.
        if (!topic) {
          skip("aucun sujet ne méritait un débat");
          continue;
        }

        const planAllowed = (PLANS[plan].agentsAvailable as readonly string[]).filter(
          (a) => a !== "CEO"
        ) as DebateAgentRole[];
        const teamAllowed = project.assigned_agents?.length
          ? planAllowed.filter((a) => project.assigned_agents!.includes(a))
          : planAllowed;
        const allowed = teamAllowed.length >= 2 ? teamAllowed : planAllowed;

        const result = await runHeadlessDebate({
          question: topic,
          project,
          allowed,
          locale: "fr",
        });

        if (!result) {
          skip("débat sans résultat exploitable");
          continue;
        }

        const { error } = await supabase.from("debates").insert({
          project_id: project.id,
          user_id: project.user_id,
          conversation_id: null,
          question: topic,
          verdict: result.verdict,
          agents: result.agents,
          origin: "autonomous",
        });

        if (error) {
          console.error(`[team-sessions] insert failed for ${project.id}:`, error.message);
          skip("échec d'enregistrement");
          continue;
        }

        created += 1;
      } catch (err) {
        console.error(`[team-sessions] project ${raw.id} failed:`, err);
        skip("erreur inattendue");
      }
    }

    // Les raisons d'écart sont renvoyées : un cron qui ne produit rien doit
    // pouvoir dire POURQUOI, sinon on ne sait pas distinguer "rien à faire"
    // d'une panne silencieuse.
    return NextResponse.json({ created, skipped });
  } catch (err) {
    console.error("[team-sessions] fatal:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
