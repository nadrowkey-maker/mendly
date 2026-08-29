"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { Circle, ListChecks } from "lucide-react";
import type { ActionItem } from "@/lib/types/tracking";

/**
 * Les actions non terminées, tous projets confondus.
 *
 * Placées avant la liste des projets : ce qui attend le fondateur passe avant
 * ce qu'il peut explorer. Chaque ligne mène à la mémoire du projet concerné,
 * là où l'action a été décidée — pas à une liste de tâches détachée de son
 * contexte.
 */
interface OpenActionsPanelProps {
  actions: ActionItem[];
  projectName: (id: string) => string;
}

export function OpenActionsPanel({ actions, projectName }: OpenActionsPanelProps) {
  const t = useTranslations("dashboard");

  if (actions.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8 rounded-2xl border border-(--glass-line) bg-(--glass) p-5 backdrop-blur-xl md:p-6"
    >
      <h2 className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-(--text-muted)">
        <ListChecks className="size-3.5" />
        {t("openActionsTitle")}
      </h2>
      <ul className="space-y-1">
        {actions.map((a) => (
          <li key={a.id}>
            <Link
              href={`/dashboard/projects/${a.project_id}/memory`}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--accent-glow)"
            >
              <Circle className="size-4 shrink-0 text-(--text-muted) transition-colors group-hover:text-(--accent-primary)" />
              <span className="flex-1 truncate text-sm text-(--text-secondary) transition-colors group-hover:text-white">
                {a.content}
              </span>
              <span className="shrink-0 rounded-full bg-white/6 px-2 py-0.5 font-mono text-[10px] text-(--text-muted)">
                {projectName(a.project_id)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
