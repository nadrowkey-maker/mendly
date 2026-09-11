"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

/**
 * L'accordéon des questions.
 *
 * Une seule question ouverte à la fois. L'accordéon multi-ouvert paraît plus
 * généreux, mais il déplace le contenu sous le doigt : on ouvre la cinquième,
 * la troisième pousse la page, et on perd sa ligne. Un seul panneau ouvert
 * garde le point de lecture stable.
 *
 * Construit sur des vrais boutons plutôt que sur `<details>` : il faut piloter
 * la fermeture des autres, ce que l'élément natif ne permet pas seul.
 */
export function Faq() {
  const t = useTranslations("home.faq");
  const [open, setOpen] = useState<number | null>(0);

  const items = [1, 2, 3, 4, 5, 6].map((n) => ({
    q: t(`q${n}` as "q1"),
    a: t(`a${n}` as "a1"),
  }));

  return (
    <section className="mx-auto max-w-3xl px-5 md:px-8">
      <Reveal>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--ink-muted)">
          {t("title")}
        </p>
      </Reveal>

      <div className="mt-6 border-t border-(--paper-line)">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={item.q} delay={i} className="border-b border-(--paper-line)">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
              >
                <span className="text-[15px] font-medium tracking-tight text-(--ink)">
                  {item.q}
                </span>
                <Plus
                  aria-hidden="true"
                  className={[
                    "size-4 shrink-0 text-(--ink-muted) transition-transform duration-300",
                    isOpen ? "rotate-45" : "",
                  ].join(" ")}
                />
              </button>

              {/* La grille à hauteur fractionnaire anime l'ouverture sans
                  connaître la hauteur du texte à l'avance — ce qu'aucune
                  transition sur `height: auto` ne sait faire. */}
              <div
                id={`faq-panel-${i}`}
                className={[
                  "grid transition-all duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                ].join(" ")}
              >
                <div className="overflow-hidden">
                  <p className="max-w-xl pb-6 text-[13.5px] leading-relaxed text-(--ink-soft)">
                    {item.a}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
