"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { MendlyOrb } from "@/components/ui/MendlyOrb";
import { DemoCard } from "@/components/home/DemoCard";
import { useReveal } from "@/lib/hooks/use-reveal";

/**
 * La carte de la contestation.
 *
 * Elle joue les trois gestes de Mendly dans l'ordre où ils arrivent : il
 * demande sur quoi tu te bases, il expose la tension qu'il n'arrive pas à
 * résoudre, puis il tranche. Le troisième temps est celui qu'aucun assistant
 * généraliste ne produit, et c'est pour lui que la carte existe.
 *
 * La tension apparaît en ambre. C'est le seul emploi autorisé de cette teinte
 * dans tout le produit — partout ailleurs elle cesserait de signifier quoi que
 * ce soit.
 */
const HOLDS = [1400, 3600, 2600, 3400];

export function ContradictionCard() {
  const t = useTranslations("home.demo.contradiction");

  return (
    <DemoCard holds={HOLDS}>
      {(step) => <Body step={step} t={t} />}
    </DemoCard>
  );
}

function Body({ step, t }: { step: number; t: ReturnType<typeof useTranslations> }) {
  const body = useReveal(t("body"), step === 1, 2600);

  return (
    <div className="p-5">
      {/* La question du fondateur, toujours là : sans elle on lirait un avis
          sur rien, et c'est le contraste question/réponse qui porte le propos. */}
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl bg-white/7 px-3.5 py-2.5 text-[13px] leading-snug text-white">
          {t("question")}
        </p>
      </div>

      <div className="mt-4 flex gap-3">
        <MendlyOrb size={28} speaking={step === 1} className="mt-0.5" />

        <div className="min-w-0 flex-1 space-y-3">
          <p className="min-h-[3.2em] text-[13px] leading-relaxed text-white/80">
            {step === 0 ? <Dots /> : step === 1 ? body : t("body")}
          </p>

          <AnimatePresence>
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl border border-(--signal)/30 bg-(--signal)/8 px-3.5 py-2.5"
              >
                <p className="font-mono text-[9.5px] tracking-[0.18em] text-(--signal) uppercase">
                  {t("tensionLabel")}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-white">{t("tension")}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="border-t border-white/8 pt-3"
              >
                <p className="font-mono text-[9.5px] tracking-[0.18em] text-(--accent-glow) uppercase">
                  {t("verdictLabel")}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-white">{t("verdict")}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      {[1, 2, 3].map((i) => (
        <span key={i} className={`size-1.5 rounded-full bg-(--accent-glow) typing-dot-${i}`} />
      ))}
    </span>
  );
}
