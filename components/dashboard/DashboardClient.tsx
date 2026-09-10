"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { LayoutDashboard, Radio, FolderClosed, Compass } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { AppHeader } from "@/components/app/AppHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { AskMendly } from "@/components/app/AskMendly";
import { PillLink } from "@/components/ui/Pill";
import { EditProjectModal } from "@/components/dashboard/EditProjectModal";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { StatStrip } from "@/components/dashboard/StatStrip";
import { OpenActionsPanel } from "@/components/dashboard/OpenActionsPanel";
import type { Project } from "@/lib/types/project";
import type { ActionItem } from "@/lib/types/tracking";
import type { DashboardStats } from "@/lib/actions/dashboard-stats";
import type { NavGroup } from "@/components/app/nav-types";

/**
 * Le tableau de bord.
 *
 * Il ne porte plus sa propre mise en page : le châssis, la barre latérale et le
 * titre viennent de `components/app`, partagés avec les paramètres et l'écran
 * de conversation. Chaque écran qui redéfinissait son en-tête finissait par en
 * avoir un légèrement différent, et l'application donnait l'impression d'avoir
 * été assemblée à partir de trois produits.
 *
 * Le rappel de confidentialité a quitté cet écran : il est à sa place dans les
 * paramètres, où l'on va justement se demander ce que deviennent ses données,
 * pas sur l'écran qu'on ouvre vingt fois par jour.
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
  userPlan: string;
  usageUsed: number;
  usageLimit: number;
}

export function DashboardClient({
  projects: initialProjects,
  userEmail,
  openActions,
  whisperCounts,
  briefings,
  stats,
  userPlan,
  usageUsed,
  usageLimit,
}: DashboardClientProps) {
  const t = useTranslations("dashboard");
  const tSide = useTranslations("sidebar");
  const tApp = useTranslations("app");
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editing, setEditing] = useState<Project | null>(null);
  const [, startTransition] = useTransition();

  const stageLabel = (stage: string) =>
    ({
      idea: t("stage_idea"),
      mvp: t("stage_mvp"),
      launched: t("stage_launched"),
      scaling: t("stage_scaling"),
    })[stage] ?? stage;

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";
  const unreadWhispers = Object.values(whisperCounts).reduce((a, b) => a + b, 0);

  const groups: NavGroup[] = [
    {
      label: tSide("groupOverview"),
      items: [
        { label: tSide("overview"), icon: LayoutDashboard, href: "/dashboard", active: true },
        {
          label: tSide("whispers"),
          icon: Radio,
          href: "/dashboard/whispers",
          count: unreadWhispers,
        },
      ],
    },
    {
      label: tSide("groupProjects"),
      action: { label: tSide("newProject"), href: "/dashboard/new" },
      items: projects.map((p) => ({
        label: p.name,
        icon: FolderClosed,
        href: `/dashboard/projects/${p.id}`,
      })),
    },
  ];

  return (
    <AppShell
      groups={groups}
      usageUsed={usageUsed}
      usageLimit={usageLimit}
      userPlan={userPlan}
      userEmail={userEmail}
    >
      <AppHeader
        title={t("welcome")}
        subtitle={t("stats.eyebrow")}
        actions={
          projects.length > 0 ? (
            <PillLink href="/dashboard/new" tone="light" size="sm">
              {t("newProject")}
            </PillLink>
          ) : undefined
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={Compass}
          title={tApp("emptyProjectsTitle")}
          body={tApp("emptyProjectsBody")}
          ctaLabel={tApp("emptyProjectsCta")}
          ctaHref="/dashboard/new"
        />
      ) : (
        <div className="px-6 py-8 md:px-10">
          <StatStrip
            projects={projects.length}
            decisions={stats.decisions}
            openActions={openActions.length}
            unseenSessions={stats.unseenSessions}
          />

          <OpenActionsPanel actions={openActions} projectName={projectName} />

          <h2 className="mt-10 mb-4 text-[11px] font-semibold tracking-tight text-white/38">
            {t("yourProjects")}
          </h2>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
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
        </div>
      )}

      <AskMendly projectId={projects[0]?.id ?? null} />

      <EditProjectModal
        project={editing}
        onClose={() => setEditing(null)}
        onUpdated={(updated) =>
          startTransition(() =>
            setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
          )
        }
      />
    </AppShell>
  );
}
