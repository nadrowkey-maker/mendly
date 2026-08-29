"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

/**
 * Le bandeau de compteurs du tableau de bord.
 *
 * C'est la première tenue de la promesse faite par la console de la landing :
 * le fondateur y voit d'un coup d'œil ce que son conseil a accumulé.
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
    <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className={`rounded-2xl border p-4 backdrop-blur-xl ${
            item.highlight
              ? "border-(--accent-primary)/35 bg-(--accent-primary)/8"
              : "border-(--glass-line) bg-(--glass)"
          }`}
        >
          <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-(--text-muted)">
            {t(`${item.key}.label`)}
          </span>
          <span
            className={`mt-1.5 block text-3xl font-extralight leading-none tracking-tight tabular-nums ${
              item.highlight ? "text-(--accent-glow)" : "text-white"
            }`}
          >
            {item.value}
          </span>
          <span className="mt-1.5 block text-xs text-(--text-secondary)">
            {t(`${item.key}.hint`)}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
