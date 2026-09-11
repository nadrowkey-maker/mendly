"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * La carte de détail — un fragment de l'atelier, posé sur le dégradé.
 *
 * C'est la réponse au vrai défaut des captures : ce n'était pas leur
 * définition, c'était leur échelle. Montrer un écran de 1280 pixels dans un
 * cadre de 470 divise le texte par trois et le rend illisible, quelle que soit
 * la finesse de l'image.
 *
 * Une carte de détail montre donc moins, mais à sa taille réelle. Le texte de
 * 13 pixels reste du texte de 13 pixels, et le visiteur lit ce que Mendly
 * répond au lieu de deviner qu'il répond quelque chose. C'est aussi ce que
 * fait la référence dans ses propres panneaux, et c'est pour cette raison.
 *
 * La carte cadence elle-même sa petite séquence, et ne la joue que lorsqu'elle
 * est à l'écran : trois cartes qui s'animent en permanence dans une page qu'on
 * lit ailleurs, c'est trois fois le travail pour personne.
 */
interface DemoCardProps {
  /** Durée de chaque étape, en millisecondes. La longueur donne le nombre d'étapes. */
  holds: number[];
  /** Étape affichée quand les animations sont désactivées. */
  stillStep?: number;
  children: (step: number) => ReactNode;
  className?: string;
}

export function DemoCard({ holds, stillStep, children, className }: DemoCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting),
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setStep((s) => (s + 1) % holds.length), holds[step]);
    return () => clearTimeout(timer);
  }, [running, step, holds]);

  // À l'arrêt on montre l'étape finale par défaut : une carte figée sur son
  // premier état montre un écran qui n'a pas encore commencé, ce qui ne dit
  // rien du produit.
  const shown = running ? step : (stillStep ?? holds.length - 1);

  return (
    <div
      ref={ref}
      className={[
        "overflow-hidden rounded-2xl border border-white/8 bg-(--panel) text-white text-left",
        "shadow-[0_30px_70px_-28px_rgba(0,0,0,0.7)]",
        className ?? "",
      ].join(" ")}
    >
      {children(shown)}
    </div>
  );
}
