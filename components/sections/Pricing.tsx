"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { Check } from "lucide-react";

/**
 * Les tarifs.
 *
 * L'échelle est construite sur la CADENCE DU TRAVAIL AUTONOME, pas sur un
 * nombre d'agents ni sur une version de modèle :
 * — le nombre d'agents ne veut plus rien dire depuis le passage à l'entité
 *   unique, et l'ancienne grille vendait encore "les 8 agents" ;
 * — vendre "Flash 1.5" contre "Pro 2.5" date à chaque montée de version, et
 *   invite à une comparaison technique avec ChatGPT que le produit ne gagne
 *   pas. Un fondateur achète un résultat, pas un moteur.
 *
 * La cadence, elle, est déjà appliquée par le code (CADENCE_DAYS) et dit
 * exactement ce que le fondateur obtient : la fréquence à laquelle son conseil
 * travaille sans lui.
 *
 * La mémoire du projet est incluse sur les trois plans, volontairement. C'est
 * ce qui rend Mendly utile dès le premier jour ; un fondateur qui n'en fait
 * jamais l'expérience ne comprend pas ce qu'il achèterait ensuite.
 */

const TIERS = [
  { id: "free", featured: false, href: "/signup", features: 4 },
  { id: "starter", featured: true, href: "/signup", features: 5 },
  { id: "pro", featured: false, href: "/signup", features: 5 },
] as const;

export function PricingSection() {
  const t = useTranslations("landing.pricing");

  return (
    <section
      id="tarifs"
      data-entity-shape="4"
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

      <div className="mx-auto mt-16 grid max-w-5xl gap-4 md:grid-cols-3">
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
            className={`relative flex flex-col rounded-2xl border p-6 backdrop-blur-xl ${
              tier.featured
                ? "border-(--accent-primary)/35 bg-gradient-to-b from-[rgba(20,45,75,0.55)] to-[rgba(8,12,18,0.7)] shadow-[inset_0_1px_0_var(--glass-hi),0_40px_110px_-50px_var(--accent-halo)]"
                : "border-(--glass-line) bg-(--glass)"
            }`}
          >
            {tier.featured && (
              <span className="absolute -top-2.5 left-6 rounded-full border border-(--accent-primary)/40 bg-[#0B1626] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-(--accent-glow)">
                {t("popular")}
              </span>
            )}

            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--text-muted)">
              {t(`${tier.id}.name`)}
            </span>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-4xl font-extralight tracking-tight text-white tabular-nums">
                {t(`${tier.id}.price`)}
              </span>
              <span className="text-sm text-(--text-muted)">{t(`${tier.id}.period`)}</span>
            </div>

            <p className="mt-2 text-sm text-(--text-secondary)">{t(`${tier.id}.tagline`)}</p>

            <ul className="mt-6 flex flex-1 flex-col gap-2.5">
              {Array.from({ length: tier.features }, (_, n) => (
                <li key={n} className="flex items-start gap-2.5 text-sm text-(--text-secondary)">
                  <Check className="mt-0.5 size-4 shrink-0 text-(--accent-primary)" aria-hidden="true" />
                  <span>{t(`${tier.id}.feature${n + 1}`)}</span>
                </li>
              ))}
            </ul>

            <Link
              href={tier.href}
              className={`mt-7 rounded-full px-4 py-2.5 text-center text-sm font-semibold tracking-tight transition-all hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow) ${
                tier.featured
                  ? "bg-white text-black hover:shadow-[0_8px_30px_-8px_rgba(255,255,255,0.35)]"
                  : "border border-(--glass-line) bg-white/5 text-white hover:border-(--glass-hi)"
              }`}
            >
              {t(`${tier.id}.cta`)}
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mx-auto mt-8 max-w-xl text-center text-sm text-(--text-muted)"
      >
        {t("footnote")}
      </motion.p>
    </section>
  );
}
