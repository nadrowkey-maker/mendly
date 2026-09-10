"use client";

import { motion } from "framer-motion";
import { GrainGradient, type GrainColorway } from "@/components/ui/GrainGradient";
import { ShotFrame } from "@/components/home/ShotFrame";

/**
 * Une rangée de démonstration : le discours d'un côté, l'écran de l'autre.
 *
 * Les arguments sont séparés par des filets plutôt que par des puces. Une puce
 * annonce une liste à parcourir ; un filet annonce des lignes à lire une par
 * une. À quatre arguments, la deuxième lecture est celle qu'on veut.
 *
 * Le coloris du dégradé n'est pas décoratif : il code le propos. L'azur pour la
 * contestation, le vert pour le verdict rendu, l'ambre pour le travail
 * nocturne. Trois rangées de la même couleur se liraient comme trois fois la
 * même chose.
 */
interface FeatureRowProps {
  eyebrow: string;
  title: string;
  items: string[];
  shot: string;
  caption: string;
  colorway: GrainColorway;
  seed: number;
  /** Inverse texte et visuel — une rangée sur deux. */
  flipped?: boolean;
}

export function FeatureRow({
  eyebrow,
  title,
  items,
  shot,
  caption,
  colorway,
  seed,
  flipped,
}: FeatureRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="grid items-center gap-9 md:grid-cols-2 md:gap-16"
    >
      <div className={flipped ? "md:order-2" : undefined}>
        <span className="inline-flex items-center rounded-full border border-(--paper-line) bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-(--ink-muted)">
          {eyebrow}
        </span>

        <h3 className="display mt-5 text-[26px] text-(--ink) md:text-[32px]">{title}</h3>

        <ul className="mt-7">
          {items.map((item) => (
            <li
              key={item}
              className="border-t border-(--paper-line-soft) py-3.5 text-[13.5px] leading-relaxed text-(--ink-soft)"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div
        className={[
          "relative aspect-4/3 overflow-hidden rounded-3xl",
          flipped ? "md:order-1" : "",
        ].join(" ")}
      >
        <GrainGradient
          colorway={colorway}
          seed={seed}
          grain={0.6}
          className="absolute inset-0 size-full"
        />
        {/* La capture flotte au-dessus du dégradé, décalée du centre : posée
            plein cadre elle masquerait la matière qui fait tout l'intérêt du
            panneau. */}
        <div className="absolute inset-x-6 bottom-6 md:inset-x-9 md:bottom-9">
          <ShotFrame src={shot} alt={caption} width={1440} height={900} />
        </div>
      </div>
    </motion.div>
  );
}
