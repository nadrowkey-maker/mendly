"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

/**
 * Le travail autonome, raconté en journal de bord.
 *
 * La fonctionnalité est une promesse abstraite ("l'équipe travaille sans
 * toi") ; le journal horodaté la rend concrète. On voit le signal détecté,
 * l'équipe convoquée, le verdict rendu, puis le fondateur qui arrive le matin.
 * C'est la même information qu'une carte de fonctionnalité, mais elle se
 * regarde au lieu de se croire.
 *
 * La dernière ligne du journal est la seule où le fondateur apparaît. Tout le
 * reste s'est passé sans lui — c'est tout l'argument.
 */

const LOG_KEYS = ["signal", "convened", "debate", "verdict", "founder"] as const;

export function NightWatch() {
  const t = useTranslations("landing.night");

  return (
    <section
      id="salle"
      data-entity-shape="2"
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

      <div className="mx-auto mt-16 grid max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Le journal */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-2xl border border-(--glass-line) bg-(--glass) backdrop-blur-xl"
        >
          <div className="border-b border-(--glass-line) px-5 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--text-muted)">
              {t("logTitle")}
            </span>
          </div>
          <ol className="px-5 py-2">
            {LOG_KEYS.map((key, i) => {
              const isFounder = key === "founder";
              return (
                <li
                  key={key}
                  className={`flex gap-4 border-(--glass-line) py-3.5 ${
                    i < LOG_KEYS.length - 1 ? "border-b" : ""
                  }`}
                >
                  <span
                    className={`shrink-0 pt-px font-mono text-[11px] tabular-nums ${
                      isFounder ? "text-white" : "text-(--accent-glow)"
                    }`}
                  >
                    {t(`log.${key}.time`)}
                  </span>
                  <span
                    className={`text-sm leading-relaxed ${
                      isFounder ? "text-white" : "text-(--text-secondary)"
                    }`}
                  >
                    {t(`log.${key}.text`)}
                  </span>
                </li>
              );
            })}
          </ol>
        </motion.div>

        {/* Ce que le fondateur trouve en revenant */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-2xl border border-(--glass-line) bg-[rgba(11,15,20,0.6)] shadow-[inset_0_1px_0_var(--glass-hi),0_40px_100px_-50px_var(--accent-halo)] backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between gap-3 border-b border-(--glass-line) px-5 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--accent-glow)">
              {t("sessionLabel")}
            </span>
            <span className="rounded-full border border-(--glass-line) px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-(--text-secondary)">
              {t("sessionAgents")}
            </span>
          </div>

          <div className="px-5 py-5">
            <p className="mb-5 text-lg leading-snug text-white">{t("sessionTopic")}</p>

            <div className="mb-5 border-l-2 border-(--signal) py-1.5 pl-3">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-(--signal)">
                {t("tensionLabel")}
              </span>
              <p className="text-[15px] text-white">{t("tension")}</p>
            </div>

            <p className="text-[15px] leading-relaxed text-(--text-secondary)">
              <span className="font-semibold text-white">{t("verdictLabel")}</span>{" "}
              {t("verdictBody")}
            </p>
          </div>
        </motion.div>
      </div>

      {/* La retenue est un argument : le dire évite la promesse de spam. */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: 0.26 }}
        className="mx-auto mt-8 max-w-xl text-center text-sm text-(--text-muted)"
      >
        {t("restraint")}
      </motion.p>
    </section>
  );
}
