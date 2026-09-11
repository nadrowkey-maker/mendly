"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/home/Reveal";
import { GrainGradient } from "@/components/ui/GrainGradient";

/**
 * Les trois atouts, juste avant les tarifs.
 *
 * C'est la dernière chose lue avant la question du prix, et ce n'est pas un
 * hasard : les trois arguments répondent à « est-ce que je vais m'en servir
 * dans trois mois », qui est la seule objection qui compte à cet endroit. Les
 * arguments de séduction, eux, sont déjà passés trois sections plus haut.
 *
 * Le dégradé ne remplit que la première carte. Trois cartes colorées feraient
 * un damier où rien ne prime ; une seule donne un point d'entrée à la rangée,
 * et les deux autres se lisent comme sa suite.
 *
 * Cette carte-là est sombre. Elle a d'abord été claire, avec le coloris azur
 * de la vitrine : le texte gris du reste de la rangée devenait illisible
 * dessus, parce qu'un dégradé saturé ne laisse aucun contraste stable à un
 * texte sombre — il en a sur le bleu clair et plus aucun sur l'or. Fond
 * sombre, texte blanc : le contraste ne dépend plus de l'endroit où la tache
 * passe.
 */
export function Pillars() {
  const t = useTranslations("home.pillars");
  const cards = t.raw("cards") as { title: string; body: string }[];

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8">
      <Reveal>
        <h2 className="display max-w-lg text-[28px] text-(--ink) md:text-[38px]">{t("title")}</h2>
      </Reveal>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {cards.map((card, i) => (
          <Reveal
            key={card.title}
            delay={i}
            className="relative min-h-[220px] overflow-hidden rounded-3xl p-7 md:min-h-[260px] md:p-8"
          >
            {i === 0 ? (
              <GrainGradient
                colorway="dusk"
                seed={91}
                grain={0.55}
                className="absolute inset-0 size-full"
              />
            ) : (
              <div className="absolute inset-0 bg-(--paper-raised)" />
            )}

            <div className="relative flex h-full flex-col">
              <h3
                className={[
                  "text-[17px] font-semibold tracking-tight",
                  i === 0 ? "text-white" : "text-(--ink)",
                ].join(" ")}
              >
                {card.title}
              </h3>
              <p
                className={[
                  "mt-3 max-w-xs text-[13.5px] leading-relaxed",
                  i === 0 ? "text-white/70" : "text-(--ink-soft)",
                ].join(" ")}
              >
                {card.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
