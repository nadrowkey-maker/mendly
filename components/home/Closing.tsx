"use client";

import { useTranslations } from "next-intl";
import { PillLink } from "@/components/ui/Pill";
import { GrainGradient } from "@/components/ui/GrainGradient";

/**
 * La dernière adresse au visiteur.
 *
 * Le dégradé monte du bas de la page et s'éteint avant le texte : la couleur
 * doit annoncer la fin du parcours, pas concurrencer la seule phrase qui doit
 * rester en tête. C'est le même geste que le ruban du haut, refermé.
 */
export function Closing() {
  const t = useTranslations("home.closing");

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[340px]">
        <GrainGradient
          colorway="azure"
          seed={73}
          grain={0.45}
          className="size-full opacity-70"
        />
        {/* Le voile efface le haut du dégradé pour qu'il naisse du papier au
            lieu de commencer par une arête franche. */}
        <div className="absolute inset-0 bg-linear-to-b from-(--paper) via-(--paper)/45 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-2xl px-5 py-24 text-center md:px-8 md:py-32">
        <h2 className="display text-[30px] text-(--ink) md:text-[44px]">{t("title")}</h2>
        <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-(--ink-soft)">
          {t("sub")}
        </p>
        <div className="mt-8 flex justify-center">
          <PillLink href="/signup" tone="ink" size="lg">
            {t("cta")}
          </PillLink>
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-(--ink-muted)">
          {t("note")}
        </p>
      </div>
    </section>
  );
}
