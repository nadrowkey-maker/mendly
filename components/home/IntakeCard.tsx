"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { DemoCard } from "@/components/home/DemoCard";
import { MendlyOrb } from "@/components/ui/MendlyOrb";

/**
 * La carte de création de projet.
 *
 * Elle montre le seul argument de la section : on ne remplit pas un
 * formulaire, on répond à des questions. Un formulaire de création, aussi
 * bien dessiné soit-il, se lit comme du travail à fournir avant de commencer ;
 * un entretien se lit comme quelqu'un qui s'intéresse au projet.
 *
 * La dernière réplique est la plus importante et elle arrive en dernier :
 * Mendly ne demande pas quels spécialistes on veut, il les assigne et dit
 * pourquoi. C'est là que la promesse cesse d'être une promesse.
 */
const HOLDS = [1600, 1500, 1600, 1500, 3000, 3200];

export function IntakeCard() {
  const t = useTranslations("home.demo.intake");
  const turns = t.raw("turns") as { who: string; text: string }[];

  return (
    <DemoCard holds={HOLDS}>
      {(step) => (
        <div className="p-5">
          <p className="font-mono text-[9.5px] tracking-[0.18em] text-white/35 uppercase">
            {t("label")}
          </p>

          <div className="mt-4 space-y-3">
            {turns.map((turn, i) => (
              <AnimatePresence key={turn.text}>
                {step > i && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className={
                      turn.who === "founder" ? "flex justify-end" : "flex items-start gap-2.5"
                    }
                  >
                    {turn.who === "mendly" && (
                      <MendlyOrb size={22} speaking={step === i + 1} className="mt-0.5" />
                    )}
                    <p
                      className={[
                        "max-w-[86%] rounded-2xl px-3 py-2 text-[12.5px] leading-snug",
                        turn.who === "founder"
                          ? "bg-white/8 text-white"
                          : "bg-transparent px-0 text-white/75",
                      ].join(" ")}
                    >
                      {turn.text}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>

          <AnimatePresence>
            {step >= HOLDS.length - 1 && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 rounded-xl border border-(--accent-primary)/30 bg-(--accent-primary)/10 px-3.5 py-2.5 font-mono text-[10px] tracking-[0.12em] text-(--accent-glow) uppercase"
              >
                {t("team")}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </DemoCard>
  );
}
