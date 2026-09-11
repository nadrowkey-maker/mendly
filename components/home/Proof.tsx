"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/home/Reveal";

/**
 * La bande de preuve.
 *
 * À cet endroit, la référence affiche un rang de logos clients. Mendly n'en a
 * pas encore, et en inventer serait une allégation commerciale fausse — pas un
 * détail de mise en page. La bande garde donc le même rythme typographique,
 * mais dit ce qui est vrai : les huit angles que Mendly porte.
 *
 * Le bloc de citation ne porte pas non plus de témoignage inventé. Il porte la
 * position du produit, attribuée à ce qu'elle est.
 */
export function Proof() {
  const t = useTranslations("home.proof");
  const tD = useTranslations("home.disciplines");
  const disciplines = tD.raw("items") as string[];

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8">
      <Reveal>
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.22em] text-(--ink-muted)">
          {tD("label")}
        </p>
      </Reveal>

      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 md:gap-x-10">
        {disciplines.map((d, i) => (
          <Reveal
            key={d}
            as="li"
            delay={i}
            className="text-[15px] font-medium tracking-tight text-(--ink)/45 transition-colors hover:text-(--ink)"
          >
            {d}
          </Reveal>
        ))}
      </ul>

      <div className="mt-14 grid gap-8 border-t border-(--paper-line) pt-8 md:grid-cols-[auto_1fr] md:gap-16">
        <Reveal className="flex gap-10">
          <Stat value={t("stat1Value")} label={t("stat1Label")} />
          <Stat value={t("stat2Value")} label={t("stat2Label")} />
        </Reveal>

        <Reveal delay={2} className="md:border-l md:border-(--paper-line) md:pl-16">
          <figure>
            <blockquote className="text-[14px] leading-relaxed text-(--ink-soft)">
              {t("quote")}
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-full bg-(--ink) text-[11px] font-semibold text-white"
              >
                M
              </span>
              <span className="text-[12px] leading-tight">
                <span className="block font-medium text-(--ink)">{t("quoteAuthor")}</span>
                <span className="block text-(--ink-muted)">{t("quoteRole")}</span>
              </span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="max-w-[9rem]">
      <p className="display text-[32px] text-(--ink) md:text-[38px]">{value}</p>
      <p className="mt-1.5 text-[12px] leading-snug text-(--ink-muted)">{label}</p>
    </div>
  );
}
