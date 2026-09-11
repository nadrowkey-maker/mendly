"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { GrainGradient, type GrainColorway } from "@/components/ui/GrainGradient";

/**
 * Une rangée de démonstration : le discours d'un côté, le produit de l'autre.
 *
 * Les arguments sont séparés par des filets plutôt que par des puces. Une puce
 * annonce une liste à parcourir ; un filet annonce des lignes à lire une par
 * une. À quatre arguments, la deuxième lecture est celle qu'on veut.
 *
 * Le coloris du dégradé n'est pas décoratif, il code le propos : azur pour la
 * contestation, vert pour le verdict rendu, ambre pour le travail nocturne.
 * Trois rangées de la même couleur se liraient comme trois fois la même chose.
 *
 * Le visuel est passé en contenu et non en chemin d'image. Ces panneaux
 * portaient des captures d'écran entières, réduites au tiers de leur taille :
 * le texte y tombait à quatre pixels de haut. Ils portent maintenant un
 * fragment vivant de l'interface, à sa taille réelle.
 */
interface FeatureRowProps {
  eyebrow: string;
  title: string;
  items: string[];
  /** Le fragment d'interface posé sur le dégradé. */
  visual: ReactNode;
  colorway: GrainColorway;
  seed: number;
  /** Inverse texte et visuel — une rangée sur deux. */
  flipped?: boolean;
}

export function FeatureRow({
  eyebrow,
  title,
  items,
  visual,
  colorway,
  seed,
  flipped,
}: FeatureRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="grid items-center gap-9 md:grid-cols-2 md:gap-16"
    >
      <div className={flipped ? "md:order-2" : undefined}>
        <span className="inline-flex items-center rounded-full border border-(--paper-line) bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-(--ink-muted)">
          {eyebrow}
        </span>

        <h3 className="display mt-5 text-[26px] text-(--ink) md:text-[32px]">{title}</h3>

        <ul className="mt-7">
          {items.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
              className="border-t border-(--paper-line-soft) py-3.5 text-[13.5px] leading-relaxed text-(--ink-soft)"
            >
              {item}
            </motion.li>
          ))}
        </ul>
      </div>

      <div
        className={[
          "relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-3xl p-6 md:min-h-[420px] md:p-9",
          flipped ? "md:order-1" : "",
        ].join(" ")}
      >
        <GrainGradient
          colorway={colorway}
          seed={seed}
          grain={0.6}
          className="absolute inset-0 size-full"
        />
        {/* Le fragment flotte au centre, un peu plus étroit que le panneau :
            posé plein cadre il masquerait la matière qui fait tout l'intérêt du
            panneau, et on aurait juste une image dans une boîte. */}
        <div className="relative w-full max-w-sm">{visual}</div>
      </div>
    </motion.div>
  );
}
