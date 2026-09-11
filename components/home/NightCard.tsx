"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { DemoCard } from "@/components/home/DemoCard";

/**
 * La carte du travail nocturne.
 *
 * Le journal s'écrit ligne à ligne, horodaté. C'est la seule façon de rendre
 * crédible une promesse aussi facile à annoncer que « ça travaille pendant que
 * tu dors » : on ne l'affirme pas, on montre les quatre lignes que ça produit,
 * avec leur heure.
 *
 * Les heures ne sont pas décoratives — trois heures du matin, douze minutes
 * entre le signal et le verdict. Des horaires de bureau ruineraient la
 * démonstration en une seconde.
 */
const HOLDS = [1500, 1500, 1500, 1500, 3800];

export function NightCard() {
  const t = useTranslations("home.demo.night");
  const log = t.raw("log") as { time: string; text: string }[];

  return (
    <DemoCard holds={HOLDS}>
      {(step) => (
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[9.5px] tracking-[0.18em] text-(--signal) uppercase">
              {t("title")}
            </p>
            <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] tracking-[0.12em] text-white/45 uppercase">
              {t("badge")}
            </span>
          </div>

          <div className="mt-4 space-y-0">
            {log.map((entry, i) => (
              <AnimatePresence key={entry.time}>
                {step > i && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="flex gap-3 border-t border-white/7 py-2.5 first:border-t-0"
                  >
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-(--signal)/80">
                      {entry.time}
                    </span>
                    <span className="text-[12.5px] leading-snug text-white/75">{entry.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>

          {/* La ligne de progression : elle avance avec le journal et se remplit
              au verdict. Sans elle, quatre lignes qui apparaissent se lisent
              comme une liste, pas comme un travail qui se déroule. */}
          <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-white/8">
            <motion.div
              className="h-full rounded-full bg-(--signal)"
              animate={{ width: `${Math.min(100, (step / (HOLDS.length - 1)) * 100)}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      )}
    </DemoCard>
  );
}
