"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

/**
 * Le bandeau de compteurs du tableau de bord.
 *
 * Les chiffres sont en gras et non en display fin : ils se lisent en diagonale,
 * plusieurs fois par jour, et la finesse qui donne de l'aplomb à un titre de
 * vitrine rend un compteur illisible à 30 px.
 *
 * Les sessions non lues portent l'accent azur quand il y en a, et retombent en
 * gris quand il n'y en a plus. Une couleur permanente ne signalerait rien —
 * c'est le changement qui attire l'œil.
 */
interface StatStripProps {
  projects: number;
  decisions: number;
  openActions: number;
  unseenSessions: number;
}

export function StatStrip({ projects, decisions, openActions, unseenSessions }: StatStripProps) {
  const t = useTranslations("dashboard.stats");

  const items = [
    { key: "projects", value: projects, highlight: false },
    { key: "decisions", value: decisions, highlight: false },
    { key: "actions", value: openActions, highlight: false },
    { key: "sessions", value: unseenSessions, highlight: unseenSessions > 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className={[
            "rounded-2xl border p-4",
            item.highlight
              ? "border-(--accent-primary)/35 bg-(--accent-primary)/8"
              : "border-(--panel-line) bg-white/2",
          ].join(" ")}
        >
          <span className="block text-[11px] font-medium text-white/38">
            {t(`${item.key}.label`)}
          </span>
          <span
            className={[
              "mt-1.5 block text-[28px] leading-none font-bold tracking-[-0.03em] tabular-nums",
              item.highlight ? "text-(--accent-glow)" : "text-white",
            ].join(" ")}
          >
            {item.value}
          </span>
          <span className="mt-2 block text-[12px] text-white/40">{t(`${item.key}.hint`)}</span>
        </motion.div>
      ))}
    </div>
  );
}
