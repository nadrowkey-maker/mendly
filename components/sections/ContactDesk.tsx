"use client";

import { useTranslations } from "next-intl";
import { PaperHeader } from "@/components/home/PaperHeader";
import { Reveal } from "@/components/home/Reveal";
import { PillLink } from "@/components/ui/Pill";

/**
 * La page de contact.
 *
 * Trois adresses selon le motif, pas de formulaire — c'est un choix déjà
 * assumé par le texte (« Pas de formulaire »), la mise en page le suit.
 *
 * L'adresse est le seul élément cliquable de chaque carte et elle est écrite
 * en clair : on doit pouvoir la recopier sans l'ouvrir. L'ancien lien
 * « LinkedIn » pointait vers une ancre vide ; il est retiré plutôt que laissé
 * en place à ne mener nulle part.
 */
const CARDS = [1, 2, 3] as const;

export function ContactDesk() {
  const t = useTranslations("contact");

  return (
    <>
      <PaperHeader title={t("title")} sub={t("subtitle")} colorway="verdict" />

      <section className="mx-auto max-w-6xl px-5 pt-16 md:px-8 md:pt-24">
        <div className="grid gap-4 md:grid-cols-3">
          {CARDS.map((n, i) => {
            const email = t(`card${n}Email` as "card1Email");
            return (
              <Reveal
                key={n}
                delay={i}
                className="flex min-h-[220px] flex-col rounded-3xl bg-(--paper-raised) p-7 md:p-8"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--ink-muted)">
                  {t(`card${n}Title` as "card1Title")}
                </p>
                <a
                  href={`mailto:${email}`}
                  className="mt-4 break-all text-[16px] font-medium text-(--ink) underline decoration-(--paper-line) underline-offset-4 transition-colors hover:decoration-(--ink)"
                >
                  {email}
                </a>
                <p className="mt-auto pt-6 text-[13.5px] leading-relaxed text-(--ink-soft)">
                  {t(`card${n}Note` as "card1Note")}
                </p>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-5 pt-24 text-center md:px-8 md:pt-32">
        <Reveal>
          <h2 className="display text-[28px] text-(--ink) md:text-[38px]">{t("closingTitle")}</h2>
          <p className="mx-auto mt-4 max-w-md text-[14.5px] leading-relaxed text-(--ink-soft)">
            {t("closingBody")}
          </p>
          <div className="mt-8 flex justify-center">
            <PillLink href="/signup" tone="ink" size="lg">
              {t("cta")}
            </PillLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
