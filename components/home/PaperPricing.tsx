"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PillLink } from "@/components/ui/Pill";

/**
 * Les trois plans.
 *
 * Le plan du milieu est encré, les deux autres sont sur papier. C'est le seul
 * bloc noir de toute la page : posé au milieu d'une vitrine claire, il attire
 * l'œil sans avoir besoin d'un badge, d'une flèche ou d'une bordure de couleur.
 * Le badge « le plus choisi » reste, mais il ne porte plus tout le poids.
 *
 * Ce qui distingue les plans est écrit tel quel : la cadence à laquelle
 * l'équipe travaille sans le fondateur. Vendre des « fonctionnalités
 * avancées » à cet endroit ne dit rien à personne.
 */

interface PlanShape {
  key: "free" | "starter" | "pro";
  href: string;
  featureCount: number;
  highlighted?: boolean;
}

const PLANS: PlanShape[] = [
  { key: "free", href: "/signup", featureCount: 4 },
  { key: "starter", href: "/upgrade", featureCount: 5, highlighted: true },
  { key: "pro", href: "/upgrade", featureCount: 5 },
];

export function PaperPricing() {
  const t = useTranslations("landing.pricing");

  return (
    <section id="tarifs" className="mx-auto max-w-6xl px-5 md:px-8">
      <div className="max-w-xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--ink-muted)">
          {t("label")}
        </p>
        <h2 className="display mt-3 text-[28px] text-(--ink) md:text-[38px]">{t("title")}</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-(--ink-soft)">{t("sub")}</p>
      </div>

      <div className="mt-12 grid gap-4 md:mt-14 md:grid-cols-3">
        {PLANS.map((plan, i) => (
          <motion.article
            key={plan.key}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className={[
              "flex flex-col rounded-3xl p-7",
              plan.highlighted
                ? "bg-(--ink) text-white"
                : "border border-(--paper-line) bg-(--paper-raised) text-(--ink)",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold tracking-tight">
                {t(`${plan.key}.name` as "free.name")}
              </h3>
              {plan.highlighted && (
                <span className="rounded-full bg-white/12 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/70">
                  {t("popular")}
                </span>
              )}
            </div>

            <p
              className={[
                "mt-1.5 text-[12.5px] leading-snug",
                plan.highlighted ? "text-white/55" : "text-(--ink-muted)",
              ].join(" ")}
            >
              {t(`${plan.key}.tagline` as "free.tagline")}
            </p>

            <p className="mt-7 flex items-baseline gap-1.5">
              <span className="display text-[38px]">{t(`${plan.key}.price` as "free.price")}</span>
              <span
                className={[
                  "text-[12px]",
                  plan.highlighted ? "text-white/45" : "text-(--ink-muted)",
                ].join(" ")}
              >
                {t(`${plan.key}.period` as "free.period")}
              </span>
            </p>

            <ul
              className={[
                "mt-7 mb-8 flex-1 border-t",
                plan.highlighted ? "border-white/10" : "border-(--paper-line)",
              ].join(" ")}
            >
              {Array.from({ length: plan.featureCount }, (_, n) => (
                <li
                  key={n}
                  className={[
                    "border-b py-3 text-[13px] leading-snug",
                    plan.highlighted
                      ? "border-white/10 text-white/72"
                      : "border-(--paper-line) text-(--ink-soft)",
                  ].join(" ")}
                >
                  {t(`${plan.key}.feature${n + 1}` as "free.feature1")}
                </li>
              ))}
            </ul>

            <PillLink
              href={plan.href}
              tone={plan.highlighted ? "light" : "ink"}
              size="md"
              className="w-full"
            >
              {t(`${plan.key}.cta` as "free.cta")}
            </PillLink>
          </motion.article>
        ))}
      </div>

      <p className="mt-6 text-[12px] text-(--ink-muted)">{t("footnote")}</p>
    </section>
  );
}
