"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PillButton } from "@/components/ui/PillButton";
import { ProductConsole } from "@/components/sections/ProductConsole";

/**
 * Le hero. Titre en graisse 200, corps énorme, interlettrage serré, point
 * final — la ponctuation ferme la phrase et lui donne son aplomb.
 *
 * Pas de pastille d'annonce au-dessus du titre : le « Now with AI ✨ » est le
 * tic le plus reconnaissable des landings générées. La page attaque
 * directement sur la promesse.
 *
 * Une seule action principale, doublée d'une action secondaire en verre.
 */
export function HeroMission() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative px-5 pt-16 md:px-8 md:pt-24" data-entity-shape="0">
      <div className="mx-auto max-w-5xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance text-5xl font-extralight leading-[0.98] tracking-[-0.038em] text-white md:text-7xl lg:text-8xl"
        >
          {t("titleLine1")}
          <br />
          {t("titleLine2")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-xl text-base text-(--text-secondary) md:text-lg"
        >
          {t("sub")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <PillButton href="/signup">{t("ctaPrimary")}</PillButton>
          <PillButton href="/manifesto" variant="glass">
            {t("ctaSecondary")}
          </PillButton>
        </motion.div>
      </div>

      <div className="mx-auto max-w-5xl">
        <ProductConsole />
      </div>
    </section>
  );
}
