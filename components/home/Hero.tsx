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
 *
 * L'entrée est échelonnée ligne par ligne plutôt que d'un bloc. Un bloc entier
 * qui monte se lit comme un chargement ; des lignes qui arrivent l'une après
 * l'autre se lisent comme une phrase qui se dit. Quarante millisecondes
 * d'écart suffisent — au-delà, on attend.
 */

const RISE = {
  hidden: { opacity: 0, y: 22 },
  shown: { opacity: 1, y: 0 },
};

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative overflow-hidden pt-20 md:pt-28">
      <motion.div
        initial="hidden"
        animate="shown"
        transition={{ staggerChildren: 0.09, delayChildren: 0.05 }}
        className="relative z-10 mx-auto max-w-3xl px-5 text-center md:px-8"
      >
        <h1 className="display text-[40px] leading-[1.05] text-(--ink) sm:text-[52px] md:text-[66px]">
          <motion.span
            variants={RISE}
            transition={{ duration: 0.9, ease: EASE }}
            className="block"
          >
            {t("title1")}
          </motion.span>
          <motion.span
            variants={RISE}
            transition={{ duration: 0.9, ease: EASE }}
            className="block"
          >
            {t("title2")}
          </motion.span>
        </h1>

        <motion.p
          variants={RISE}
          transition={{ duration: 0.9, ease: EASE }}
          className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-(--ink-soft)"
        >
          {t("sub")}
        </motion.p>

        <motion.div
          variants={RISE}
          transition={{ duration: 0.9, ease: EASE }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2.5"
        >
          <PillLink href="#produit" tone="paper" size="md" icon={<PlayDot />}>
            {t("ctaSecondary")}
          </PillLink>
          <PillLink href="/signup" tone="ink" size="md">
            {t("ctaPrimary")}
          </PillLink>
        </motion.div>
      </motion.div>

      {/* Le ruban déborde à gauche et à droite : il doit sortir du cadre de
          lecture pour ne pas se lire comme une illustration posée dans une
          boîte. Il monte aussi derrière le titre — d'où la marge négative et le
          plan inférieur : la page gagne une profondeur que deux bandes
          empilées n'auraient jamais. */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0.82 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 1.6, delay: 0.25, ease: EASE }}
        className="pointer-events-none relative -mx-[8vw] -mt-10 h-[230px] md:-mt-16 md:h-[360px]"
      >
        <Ribbon className="size-full" />
      </motion.div>
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
