"use client";

import { useTranslations } from "next-intl";
import { PaperHeader } from "@/components/home/PaperHeader";
import { Reveal } from "@/components/home/Reveal";
import { PillLink } from "@/components/ui/Pill";
import { stripLeadingNumber } from "@/lib/strip-number";

/**
 * L'engagement sécurité.
 *
 * Six engagements en grille, puis la marche à suivre pour signaler une faille.
 * Les icônes émoji ont disparu : sur une page qui demande qu'on fasse
 * confiance, un cadenas en émoji fait l'effet inverse — il se lit comme une
 * décoration, là où un numéro se lit comme une liste d'engagements qu'on peut
 * vérifier un par un.
 */
const PLEDGES = [1, 2, 3, 4, 5, 6] as const;

export function SecurityPledge() {
  const t = useTranslations("security");

  return (
    <>
      <PaperHeader title={t("title")} sub={t("subtitle")} colorway="azure" />

      <section className="mx-auto max-w-6xl px-5 pt-20 md:px-8 md:pt-28">
        <Reveal className="max-w-2xl">
          <h2 className="display text-[26px] text-(--ink) md:text-[34px]">{t("introTitle")}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-(--ink-soft)">{t("introBody")}</p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {PLEDGES.map((n, i) => (
            <Reveal key={n} delay={i} className="rounded-3xl bg-(--paper-raised) p-7 md:p-8">
              <p className="font-mono text-[11px] tabular-nums text-(--ink-muted)">
                {String(n).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-[17px] font-semibold tracking-tight text-(--ink)">
                {stripLeadingNumber(t(`p${n}Title` as "p1Title"))}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-(--ink-soft)">
                {t(`p${n}Body` as "p1Body")}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-4 rounded-3xl border border-(--paper-line) bg-white p-7 md:p-10">
          <h2 className="text-[17px] font-semibold tracking-tight text-(--ink)">{t("vulnTitle")}</h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-(--ink-soft)">
            {t("vulnBody")}
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-2xl px-5 pt-24 text-center md:px-8 md:pt-32">
        <Reveal>
          <h2 className="display text-[28px] text-(--ink) md:text-[38px]">{t("closingTitle")}</h2>
          <div className="mt-7 flex justify-center">
            <PillLink href="/contact" tone="ink" size="lg">
              {t("cta")}
            </PillLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
