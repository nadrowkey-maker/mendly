"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { GrainGradient } from "@/components/ui/GrainGradient";
import { PillLink } from "@/components/ui/Pill";
import { ConversationDemo } from "@/components/home/ConversationDemo";

/**
 * Le grand panneau produit.
 *
 * La capture émerge par le bas plutôt que d'être centrée dans le cadre : une
 * image entièrement visible se lit comme une illustration finie, une image
 * coupée par le bord se lit comme un écran qui continue derrière la page. Le
 * second geste donne envie de cliquer, le premier non.
 */
export function Showcase() {
  const t = useTranslations("home.showcase");

  return (
    <section id="produit" className="mx-auto max-w-6xl px-5 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[28px]"
      >
        <GrainGradient
          colorway="ash"
          seed={12}
          grain={0.55}
          className="absolute inset-0 size-full"
        />

        <div className="relative px-6 pt-14 text-center md:px-16 md:pt-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--ink-muted)">
            {t("eyebrow")}
          </p>
          <h2 className="display mt-3 text-[28px] text-(--ink) md:text-[38px]">{t("title")}</h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-(--ink-soft)">
            {t("sub")}
          </p>
          <div className="mt-6 flex justify-center">
            <PillLink href="/signup" tone="ink" size="md">
              {t("cta")}
            </PillLink>
          </div>

          {/* Marge basse négative : le plateau est rogné par le bas du
              panneau, et le produit a l'air de continuer derrière la page. */}
          <div className="mx-auto -mb-10 mt-12 max-w-5xl md:-mb-14 md:mt-14">
            <ConversationDemo />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
