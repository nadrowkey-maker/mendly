"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import { DemoCard } from "@/components/home/DemoCard";

/**
 * La carte de la salle de réunion.
 *
 * Les spécialistes arrivent un par un et se contredisent avant qu'un verdict
 * tombe. C'est l'inverse d'un fil de messages : ici, chaque ligne est une
 * objection à la précédente, et c'est visible sans avoir à les lire — les
 * trois cartes se posent en désaccord avant que la barre du verdict les
 * referme.
 *
 * Les spécialistes ne portent pas de couleurs individuelles. Huit pastilles de
 * teintes différentes reconstituaient exactement l'ancien produit à huit
 * agents, celui dont le nom de chacun comptait plus que ce qu'il disait.
 */
const HOLDS = [1200, 1600, 1600, 1800, 3600];

export function RoomCard() {
  const t = useTranslations("home.demo.room");
  const lines = t.raw("lines") as { who: string; text: string }[];

  return (
    <DemoCard holds={HOLDS}>
      {(step) => (
        <div className="p-5">
          <div className="flex items-center gap-2">
            <Users className="size-3.5 text-(--accent-glow)" />
            <p className="font-mono text-[9.5px] tracking-[0.18em] text-(--accent-glow) uppercase">
              {t("title")}
            </p>
          </div>

          <p className="mt-2.5 text-[13.5px] leading-snug font-medium text-white">
            {t("question")}
          </p>

          <div className="mt-4 space-y-2">
            {lines.map((line, i) => (
              <AnimatePresence key={line.who}>
                {step > i && (
                  <motion.div
                    initial={{ opacity: 0, x: i % 2 === 0 ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-xl bg-white/4 px-3 py-2.5"
                  >
                    <p className="font-mono text-[9px] tracking-[0.16em] text-white/40 uppercase">
                      {line.who}
                    </p>
                    <p className="mt-0.5 text-[12.5px] leading-snug text-white/80">{line.text}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>

          <AnimatePresence>
            {step >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-3 rounded-xl border border-(--accent-primary)/30 bg-(--accent-primary)/10 px-3.5 py-2.5"
              >
                <p className="font-mono text-[9.5px] tracking-[0.18em] text-(--accent-glow) uppercase">
                  {t("verdictLabel")}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-white">{t("verdict")}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </DemoCard>
  );
}
