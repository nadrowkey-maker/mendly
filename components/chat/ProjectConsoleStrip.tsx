"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import type { ProjectStats } from "@/lib/actions/project-stats";

/**
 * Le bandeau console de l'écran de travail.
 *
 * C'est ici que la promesse de la landing se tient concrètement : le fondateur
 * voit ce que son conseil a accumulé sans quitter la conversation.
 *
 * Volontairement une bande fine et non un tableau de bord : le geste principal
 * de cet écran est de PARLER à Mendly. Reléguer la conversation derrière un
 * écran d'accueil ajouterait un clic sur le travail quotidien, et c'est le
 * genre de décision qui tue l'usage sans qu'on comprenne pourquoi.
 *
 * La ligne "pendant ton absence" n'apparaît que s'il y a réellement du travail
 * non lu. Un emplacement toujours occupé cesse d'être un signal.
 */
interface ProjectConsoleStripProps {
  stats: ProjectStats;
  onOpenTeamRoom: () => void;
}

export function ProjectConsoleStrip({ stats, onOpenTeamRoom }: ProjectConsoleStripProps) {
  const t = useTranslations("chat.console");

  const metrics = [
    { key: "decisions", value: stats.decisions },
    { key: "actions", value: stats.openActions },
    { key: "sessions", value: stats.sessions },
  ];

  return (
    <div className="shrink-0 border-b border-(--glass-line) bg-(--glass) px-4 py-2.5 backdrop-blur-xl md:px-6">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-2">
        {metrics.map((m) => (
          <span key={m.key} className="flex items-baseline gap-1.5">
            <span className="text-sm font-medium tabular-nums text-white">{m.value}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-muted)">
              {t(`${m.key}`)}
            </span>
          </span>
        ))}

        {stats.unseenSessions > 0 && (
          <motion.button
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={onOpenTeamRoom}
            className="ml-auto cursor-pointer rounded-full border border-(--accent-primary)/35 bg-(--accent-primary)/10 px-3 py-1 text-xs text-(--accent-glow) transition-colors hover:bg-(--accent-primary)/18 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-glow)"
          >
            {t("unseen", { count: stats.unseenSessions })}
          </motion.button>
        )}
      </div>
    </div>
  );
}
