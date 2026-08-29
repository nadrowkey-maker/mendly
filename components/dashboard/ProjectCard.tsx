"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { MessageSquareDashed } from "lucide-react";
import { ProjectCardMenu } from "@/components/dashboard/ProjectCardMenu";
import type { Project } from "@/lib/types/project";

/**
 * Une carte de projet.
 *
 * Extraite de DashboardClient, qui dépassait 320 lignes alors que la charte du
 * projet en impose 200 au maximum — et qui mélangeait la liste, la carte et la
 * mise en page de la page entière.
 *
 * La couleur d'accent choisie par le fondateur est conservée sur le liseré
 * supérieur : c'est le seul endroit du système où une teinte hors charte est
 * admise, parce qu'elle appartient à l'utilisateur et sert à distinguer ses
 * projets d'un coup d'œil.
 */
interface ProjectBriefing {
  lastDecision?: string;
  nextAction?: string;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  whispers: number;
  briefing?: ProjectBriefing;
  stageLabel: string;
  onEdit: (project: Project) => void;
  onDeleted: (projectId: string) => void;
}

export function ProjectCard({
  project,
  index,
  whispers,
  briefing,
  stageLabel,
  onEdit,
  onDeleted,
}: ProjectCardProps) {
  const t = useTranslations("dashboard");
  const accent = project.accent_color || "var(--accent-primary)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div className="absolute right-4 top-4 z-20">
        <ProjectCardMenu project={project} onEdit={onEdit} onDeleted={onDeleted} />
      </div>

      <Link
        href={`/dashboard/projects/${project.id}`}
        className="relative block overflow-hidden rounded-2xl border border-(--glass-line) bg-(--glass) p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-(--glass-hi) hover:shadow-[0_30px_70px_-28px_rgba(0,0,0,0.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-glow)"
      >
        <span
          className="absolute inset-x-0 top-0 h-0.5 opacity-80"
          style={{ background: accent }}
          aria-hidden
        />

        <div className="mb-4 flex items-center gap-2 pr-10">
          <span className="inline-block rounded-full border border-(--glass-line) px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-(--text-secondary)">
            {stageLabel}
          </span>
          {whispers > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-(--accent-primary)/30 bg-(--accent-primary)/10 px-2 py-0.5 text-[10px] font-semibold text-(--accent-glow)">
              <MessageSquareDashed className="size-3" />
              {whispers}
            </span>
          )}
        </div>

        <h3 className="mb-2 line-clamp-1 flex items-center gap-2 text-lg font-medium tracking-tight text-white">
          {project.emoji && <span>{project.emoji}</span>}
          {project.name}
        </h3>

        {project.description && (
          <p className="mb-4 line-clamp-2 text-sm text-(--text-secondary)">{project.description}</p>
        )}

        {(briefing?.lastDecision || briefing?.nextAction) && (
          <div className="mb-4 space-y-1.5">
            {briefing.lastDecision && (
              <p className="line-clamp-1 text-xs text-(--text-secondary)">
                <span className="font-mono uppercase tracking-wider text-(--text-muted)">
                  {t("lastDecision")}{" "}
                </span>
                {briefing.lastDecision}
              </p>
            )}
            {briefing.nextAction && (
              <p className="line-clamp-1 text-xs text-(--text-secondary)">
                <span className="font-mono uppercase tracking-wider text-(--accent-glow)">
                  {t("nextAction")}{" "}
                </span>
                {briefing.nextAction}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-(--glass-line) pt-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-(--text-muted)">
            {project.sector ?? "—"}
          </span>
          <span className="font-mono text-[10px] text-(--text-muted) transition-colors group-hover:text-white">
            {new Date(project.created_at).toLocaleDateString()} →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
