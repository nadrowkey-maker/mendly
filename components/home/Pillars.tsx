"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/home/Reveal";
import { GrainGradient, type GrainColorway } from "@/components/ui/GrainGradient";

/** Un coloris par carte, dans l'ordre des cartes de `home.pillars`. */
const COLORWAYS: GrainColorway[] = ["signal", "azure", "verdict"];

/**
 * Les trois atouts, juste avant les tarifs.
 *
 * C'est la dernière chose lue avant la question du prix, et ce n'est pas un
 * hasard : les trois arguments répondent à « est-ce que je vais m'en servir
 * dans trois mois », qui est la seule objection qui compte à cet endroit. Les
 * arguments de séduction, eux, sont déjà passés trois sections plus haut.
 *
 * Les trois cartes portent le même traitement, et chacune le coloris que son
 * sujet a déjà ailleurs sur la page : ambre pour le travail nocturne, azur
 * pour la mémoire, vert pour le verdict rendu. La couleur dit donc quelque
 * chose au lieu de décorer, et une carte lue ici renvoie à la rangée de
 * démonstration qui traite le même point.
 *
 * Deux versions ont échoué avant celle-ci, et les deux échecs sont instructifs.
 * Une seule carte colorée sur trois ne se lisait pas comme une hiérarchie mais
 * comme deux cartes oubliées. Et cette carte-là, en dégradé saturé sous un
 * texte clair, n'avait aucun contraste stable : le blanc tenait sur le bleu
 * sombre et disparaissait sur le bleu moyen deux centimètres plus loin.
 *
 * D'où le lavis. La matière est posée à trente pour cent sur le fond clair
 * des cartes : assez pour qu'on la voie, trop peu pour qu'elle fasse varier le
 * contraste du texte sombre qui la traverse. C'est aussi ce qui empêche cette
 * rangée de concurrencer les trois grands panneaux de démonstration, qui eux
 * portent la couleur à pleine force.
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
            className="relative min-h-[220px] overflow-hidden rounded-3xl bg-(--paper-raised) p-7 md:min-h-[260px] md:p-8"
          >
            <GrainGradient
              colorway={COLORWAYS[i]}
              seed={91 + i * 17}
              grain={0.5}
              className="absolute inset-0 size-full opacity-30"
            />

            <div className="relative flex h-full flex-col">
              <h3 className="text-[17px] font-semibold tracking-tight text-(--ink)">
                {card.title}
              </h3>
              <p className="mt-3 max-w-xs text-[13.5px] leading-relaxed text-(--ink-soft)">
                {card.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
