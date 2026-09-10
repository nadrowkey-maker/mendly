"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PillLink } from "@/components/ui/Pill";
import { Ribbon } from "@/components/ui/Ribbon";

/**
 * Le haut de page.
 *
 * Titre centré, fin et grand ; sous-titre en une ligne ; deux pilules ; puis le
 * ruban qui traverse toute la largeur. L'ordre est celui-là et pas un autre :
 * le ruban placé au-dessus du titre deviendrait le sujet de la page, alors
 * qu'il n'est que la respiration entre la promesse et la preuve.
 */
export function Hero() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative overflow-hidden pt-20 md:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-3xl px-5 text-center md:px-8"
      >
        <h1 className="display text-[40px] leading-[1.05] text-(--ink) sm:text-[52px] md:text-[64px]">
          {t("title1")}
          <br />
          {t("title2")}
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-(--ink-soft)">
          {t("sub")}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <PillLink href="#produit" tone="paper" size="md" icon={<PlayDot />}>
            {t("ctaSecondary")}
          </PillLink>
          <PillLink href="/signup" tone="ink" size="md">
            {t("ctaPrimary")}
          </PillLink>
        </div>
      </motion.div>

      {/* Le ruban déborde volontairement à gauche et à droite : il doit sortir
          du cadre de lecture pour ne pas se lire comme une illustration posée
          dans une boîte. */}
      <div className="pointer-events-none relative -mx-[6vw] mt-8 h-[190px] md:mt-4 md:h-[300px]">
        <Ribbon className="size-full" />
      </div>
    </section>
  );
}

/** Le point d'état des pilules secondaires — un signal, pas une icône. */
function PlayDot() {
  return (
    <span
      aria-hidden="true"
      className="grid size-4 place-items-center rounded-full bg-(--accent-primary)/12"
    >
      <span className="size-1.5 rounded-full bg-(--accent-primary)" />
    </span>
  );
}
