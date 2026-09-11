"use client";

import { useEffect, useState } from "react";

/**
 * Révèle un texte caractère par caractère.
 *
 * Sert deux gestes différents sur la vitrine : la frappe du fondateur dans la
 * zone de saisie, et la réponse de Mendly qui arrive en flux. Ce sont les deux
 * seuls moments d'une démonstration où l'on comprend que quelque chose se
 * passe réellement — un texte qui apparaît d'un bloc ne se distingue pas d'une
 * capture d'écran.
 *
 * La révélation est calée sur l'horloge et non sur un compteur d'images. Un
 * `setInterval` de 30 ms qui incrémente d'un caractère produit une vitesse qui
 * dépend de la charge de la machine ; en repartant du temps écoulé, la durée
 * annoncée est celle qu'on obtient, et le scénario du plateau reste synchrone
 * avec ce qu'il montre.
 */
export function useReveal(text: string, active: boolean, durationMs: number): string {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      return;
    }

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setCount(Math.round(progress * text.length));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, active, durationMs]);

  return text.slice(0, count);
}
