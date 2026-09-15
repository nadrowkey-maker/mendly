/**
 * La grille du film : tout est compté en mesures de la musique.
 *
 * « Zone » tourne à 114,3 BPM, soit une mesure de 2,1 s — 63 images à 30 i/s.
 * Chaque plan dure un nombre entier de mesures. C'est la réponse directe au
 * reproche « parfois trop rapide, parfois pas assez » : quand chaque plan vit
 * sur le même temps musical, le rythme ne peut plus être irrégulier. Les
 * mouvements internes tombent sur les temps (un quart de mesure).
 *
 * Carte d'énergie du morceau, mesurée (scripts/track-map.mjs) :
 *   mesures 0–3   intro calme        → la nuit, la solitude
 *   mesure 4      le morceau décolle  → l'orbe s'éveille
 *   mesures 4–11  pleine énergie      → le produit, le débat, l'équipe
 *   mesures 12–14 retombée            → la phrase finale, le logo
 */
export const FPS = 30;
export const BAR = 63;
export const BEAT = BAR / 4;

export const bar = (n: number) => Math.round(n * BAR);
export const beat = (n: number) => Math.round(n * BEAT);

/** Première mesure de chaque plan. */
export const SHOT = {
  night: 0,
  ask: 1,
  echo: 2,
  awaken: 4,
  contest: 5,
  council: 7,
  team: 11,
  alone: 12,
  end: 13,
} as const;

export const TOTAL = bar(15);
