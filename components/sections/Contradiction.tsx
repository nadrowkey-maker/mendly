"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

/**
 * La section qui porte la différenciation.
 *
 * Elle ne l'affirme pas, elle la met en scène : une seule question de
 * fondateur, deux réponses côte à côte. L'assistant qui approuve, et Mendly
 * qui conteste. Le lecteur tranche tout seul en cinq secondes — c'est plus
 * fort que n'importe quelle liste d'arguments.
 *
 * Choix assumé : pas de trois cartes à pictogrammes. C'est le remplissage
 * standard de toute landing SaaS, et ça n'aurait rien démontré.
 *
 * Le marqueur ambre n'apparaît que dans le panneau de droite, sur la
 * contradiction interne. C'est son seul emploi autorisé.
 */
export function Contradiction() {
  const t = useTranslations("landing.contradiction");

  return (
    <section
      id="methode"
      data-entity-shape="1"
      className="relative scroll-mt-24 px-5 py-28 md:px-8 md:py-40"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-(--text-muted)">
          {t("label")}
        </p>
        <h2 className="text-balance text-4xl font-extralight leading-[1.04] tracking-[-0.03em] text-white md:text-6xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base text-(--text-secondary) md:text-lg">
          {t("sub")}
        </p>
      </motion.div>

      {/* La question, posée une seule fois — c'est ce qui rend la comparaison honnête. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-14 max-w-2xl"
      >
        <div className="rounded-2xl border border-(--glass-line) bg-(--glass) px-5 py-4 backdrop-blur-xl">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-(--text-muted)">
            {t("questionLabel")}
          </span>
          <p className="text-lg text-white">{t("question")}</p>
        </div>
      </motion.div>

      <div className="mx-auto mt-6 grid max-w-5xl gap-4 md:grid-cols-2">
        {/* Panneau gauche — l'assistant complaisant */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col rounded-2xl border border-(--glass-line) bg-white/2 p-6 backdrop-blur-xl"
        >
          <span className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-(--text-muted)">
            {t("assistantLabel")}
          </span>
          <p className="flex-1 text-[15px] leading-relaxed text-(--text-secondary)">
            {t("assistantBody")}
          </p>
          <p className="mt-5 border-t border-(--glass-line) pt-4 text-sm text-(--text-muted)">
            {t("assistantVerdict")}
          </p>
        </motion.div>

        {/* Panneau droit — Mendly */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col overflow-hidden rounded-2xl border border-(--glass-line) bg-[rgba(11,15,20,0.6)] p-6 shadow-[inset_0_1px_0_var(--glass-hi),0_40px_100px_-50px_var(--accent-halo)] backdrop-blur-2xl"
        >
          <span className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-(--accent-glow)">
            {t("mendlyLabel")}
          </span>

          <div className="mb-4 border-l-2 border-(--signal) py-1.5 pl-3">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-(--signal)">
              {t("tensionLabel")}
            </span>
            <p className="text-[15px] text-white">{t("tension")}</p>
          </div>

          <p className="flex-1 text-[15px] leading-relaxed text-(--text-secondary)">
            {t("mendlyBody")}
          </p>
          <p className="mt-5 border-t border-(--glass-line) pt-4 text-sm text-white">
            <span className="font-semibold">{t("verdictLabel")}</span> {t("verdictBody")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
