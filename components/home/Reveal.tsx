"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * L'entrée au défilement, en un seul endroit.
 *
 * Six sections répétaient les mêmes quatre lignes de `motion.div` avec des
 * durées et des distances légèrement différentes — 0,75 s ici, 0,8 s là, 24
 * pixels d'un côté, 30 de l'autre. Ces écarts ne se voient pas un par un, mais
 * bout à bout la page perd son unité de rythme : c'est le genre de détail qui
 * fait dire « ça ne fait pas fini » sans qu'on sache désigner quoi.
 *
 * Une seule courbe, une seule distance, un seul délai de base. Ce qui varie
 * d'un bloc à l'autre est uniquement le rang dans la cascade.
 *
 * `once` est volontairement vrai partout : un contenu qui se rejoue à chaque
 * passage devient une animation qu'on subit quand on remonte la page pour
 * relire quelque chose.
 */
interface RevealProps {
  children: ReactNode;
  /** Rang dans la cascade — chaque cran ajoute 80 ms. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({ children, delay = 0, className, as = "div" }: RevealProps) {
  const Tag = motion[as];

  return (
    <Tag
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: delay * 0.08, ease: EASE }}
      className={className}
    >
      {children}
    </Tag>
  );
}
