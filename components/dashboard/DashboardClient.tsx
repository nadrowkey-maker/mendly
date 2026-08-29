"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { EditProjectModal } from "@/components/dashboard/EditProjectModal";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { StatStrip } from "@/components/dashboard/StatStrip";
import { OpenActionsPanel } from "@/components/dashboard/OpenActionsPanel";
import { PrivacyReassurance } from "@/components/project/PrivacyReassurance";
import type { Project } from "@/lib/types/project";
import type { ActionItem } from "@/lib/types/tracking";
import type { DashboardStats } from "@/lib/actions/dashboard-stats";

/**
 * Le tableau de bord.
 *
 * Réécrit en console : un bandeau de compteurs en tête, puis les actions
 * ouvertes, puis les projets. C'est ce que la landing promet, et l'ordre suit
 * l'urgence — ce qui attend le fondateur avant ce qu'il peut explorer.
 *
 * La carte de projet et le bandeau de compteurs sont sortis dans leurs propres
 * fichiers : ce composant faisait 326 lignes pour une charte qui en impose 200.
 */
interface ProjectBriefing {
  lastDecision?: string;
  nextAction?: string;
}

interface DashboardClientProps {
  projects: Project[];
  userEmail: string | null;
  openActions: ActionItem[];
  whisperCounts: Record<string, number>;
  briefings: Record<string, ProjectBriefing>;
  stats: DashboardStats;
}

export function DashboardClient({
  projects: initialProjects,
  userEmail,
  openActions,
  whisperCounts,
  briefings,
  stats,
}: DashboardClientProps) {
  const t = useTranslations("dashboard");
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editing, setEditing] = useState<Project | null>(null);
  const [, startTransition] = useTransition();

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    window.location.href = "/login";
  };

  const stageLabel = (stage: string) =>
    ({
      idea: t("stage_idea"),
      mvp: t("stage_mvp"),
      launched: t("stage_launched"),
      scaling: t("stage_scaling"),
    })[stage] ?? stage;

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";

  return (
    <main className="relative min-h-screen bg-black px-6 py-10 md:px-12">
      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="mb-8 flex items-start justify-between gap-6">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-(--text-muted)">
              {t("stats.eyebrow")}
            </p>
            <h1 className="text-3xl font-extralight tracking-[-0.03em] text-white md:text-4xl">
              {t("welcome")}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-4 pt-1">
            <Link
              href="/settings"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-muted) transition-colors hover:text-white"
            >
              {t("settings")}
            </Link>
            <button
              onClick={handleSignOut}
              className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-muted) transition-colors hover:text-white"
            >
              {t("signOut")}
            </button>
          </div>
        </header>

        <StatStrip
          projects={projects.length}
          decisions={stats.decisions}
          openActions={openActions.length}
          unseenSessions={stats.unseenSessions}
        />

        <OpenActionsPanel actions={openActions} projectName={projectName} />

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-(--glass-line) bg-(--glass) p-10 text-center backdrop-blur-xl md:p-16"
          >
            <h2 className="mb-4 text-2xl font-extralight tracking-tight text-white md:text-3xl">
              {t("emptyTitle")}
            </h2>
            <p className="mx-auto mb-8 max-w-md text-(--text-secondary)">{t("emptyBody")}</p>
            <Link
              href="/dashboard/new"
              className="inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:-translate-y-px"
            >
              {t("createFirstProject")}
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--text-muted)">
                {t("yourProjects")}
              </h2>
              <Link
                href="/dashboard/new"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:-translate-y-px"
              >
                {t("newProject")}
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {projects.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  whispers={whisperCounts[project.id] ?? 0}
                  briefing={briefings[project.id]}
                  stageLabel={stageLabel(project.stage)}
                  onEdit={setEditing}
                  onDeleted={(id) =>
                    startTransition(() => setProjects((prev) => prev.filter((p) => p.id !== id)))
                  }
                />
              ))}
            </div>

            {userEmail && (
              <p className="mt-12 text-center font-mono text-[11px] text-(--text-muted)">
                {t("loggedInAs")} <span className="text-(--text-secondary)">{userEmail}</span>
              </p>
            )}
          </>
        )}

        <PrivacyReassurance className="mx-auto mt-12 max-w-md" />
      </div>

      <EditProjectModal
        project={editing}
        onClose={() => setEditing(null)}
        onUpdated={(updated) =>
          startTransition(() =>
            setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
          )
        }
      />
    </main>
  );
}
