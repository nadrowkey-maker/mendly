"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PillButton } from "@/components/ui/PillButton";

/**
 * La clôture.
 *
 * Elle ne récapitule pas : quelqu'un qui arrive ici a déjà tout lu, lui
 * répéter les arguments le fait partir. Elle repose l'enjeu sous forme de
 * question — la seule qui compte pour un fondateur solo — puis donne le
 * premier geste concret et retire la dernière friction (pas de carte
 * bancaire).
 *
 * L'entité se contracte sur cette section (data-entity-shape="5") : elle se
 * resserre au moment où la page demande une décision.
 */
export function Closing() {
  const t = useTranslations("landing.closing");

  return (
    <section
      data-entity-shape="5"
      className="relative px-5 py-32 md:px-8 md:py-48"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.22em] text-(--text-muted)">
          {t("label")}
        </p>

        <h2 className="text-balance text-4xl font-extralight leading-[1.02] tracking-[-0.035em] text-white md:text-6xl lg:text-7xl">
          {t("title")}
        </h2>

        <p className="mx-auto mt-7 max-w-lg text-base text-(--text-secondary) md:text-lg">
          {t("sub")}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PillButton href="/signup">{t("ctaPrimary")}</PillButton>
          <PillButton href="/manifesto" variant="glass">
            {t("ctaSecondary")}
          </PillButton>
        </div>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-(--text-muted)">
          {t("footnote")}
        </p>
      </motion.div>
    </section>
  );
}
