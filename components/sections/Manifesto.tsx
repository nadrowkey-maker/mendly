"use client";

import { useTranslations } from "next-intl";
import { PaperHeader } from "@/components/home/PaperHeader";
import { Reveal } from "@/components/home/Reveal";
import { PillLink } from "@/components/ui/Pill";
import { GrainGradient } from "@/components/ui/GrainGradient";

/**
 * Le manifeste.
 *
 * C'est la seule page du site faite pour être lue d'une traite. Colonne
 * étroite, titres de section en display fin, filets entre les sections : le
 * rythme d'un texte long, pas celui d'une page de vente.
 *
 * L'appel final menait à la liste d'attente d'un produit qui est lancé depuis ;
 * il mène à l'inscription.
 */
const SECTIONS = [
  { title: "section1Title", body: ["section1Body1", "section1Body2"] },
  { title: "section2Title", body: ["section2Body1", "section2Body2"] },
  { title: "section3Title", body: ["section3Body1", "section3Body2"] },
  { title: "section4Title", body: ["section4Body1", "section4Body2"] },
  { title: "section5Title", body: ["section5Body"] },
] as const;

export function Manifesto() {
  const t = useTranslations("manifesto");

  return (
    <>
      <PaperHeader title={t("title")} sub={t("subtitle")} colorway="signal" />

      <article className="mx-auto max-w-2xl px-5 pt-16 md:px-8 md:pt-24">
        {SECTIONS.map((section, i) => (
          <Reveal
            key={section.title}
            className={i > 0 ? "mt-14 border-t border-(--paper-line) pt-14" : undefined}
          >
            <h2 className="display text-[26px] text-(--ink) md:text-[34px]">{t(section.title)}</h2>
            <div className="mt-5 space-y-4">
              {section.body.map((key) => (
                <p key={key} className="text-[16px] leading-[1.75] text-(--ink-soft)">
                  {t(key)}
                </p>
              ))}
            </div>
          </Reveal>
        ))}
      </article>

      <section className="mx-auto max-w-6xl px-5 pt-24 md:px-8 md:pt-32">
        <Reveal className="relative overflow-hidden rounded-[28px] bg-(--paper-raised) px-6 py-16 text-center md:py-20">
          <GrainGradient
            colorway="azure"
            seed={57}
            grain={0.5}
            className="absolute inset-0 size-full opacity-35"
          />
          <div className="relative flex justify-center">
            <PillLink href="/signup" tone="ink" size="lg">
              {t("cta")}
            </PillLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
