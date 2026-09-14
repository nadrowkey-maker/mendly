import { SCENE_START as S } from "../timeline";
import { DEMO_TIMES as D } from "../scenes/DemoPanel";

/**
 * La feuille de sons : chaque événement visible a le sien.
 *
 * Elle se lit comme la partition de la vidéo. Les instants sont tirés des
 * mêmes constantes que les scènes — quand une animation bouge, son son bouge
 * avec elle, au lieu de tomber à côté.
 *
 * Trois règles de mixage :
 * — les souffles de transition culminent SUR la coupe, pas après : l'oreille
 *   annonce le changement d'image une fraction de seconde avant l'œil ;
 * — les séries (bulles, cartes, pilules) montent d'un demi-ton à chaque
 *   élément : une série qui monte se lit comme une accumulation, une série
 *   répétée comme un bug ;
 * — les textures continues (frappe, flux de réponse) restent très basses :
 *   elles occupent l'oreille sans jamais passer devant les coups.
 */

export interface Cue {
  /** Image de départ, dans le montage entier. */
  at: number;
  /** Nom du fichier dans public/sfx, sans extension. */
  sfx: string;
  volume: number;
}

const cues: Cue[] = [];
const add = (at: number, sfx: string, volume: number) => cues.push({ at: Math.round(at), sfx, volume });

// Le souffle culmine à 65 % de ses 0,5 s, soit ~10 images : on le lance 10 images avant la coupe.
for (const cut of [S.problem, S.demo, S.room, S.night, S.benefits, S.cta]) add(cut - 10, "whoosh", 0.5);

// ---- Accroche
add(S.hook, "whoosh_in", 0.45);
add(S.hook + 1, "pop_0", 0.5);
for (let i = 0; i < 10; i++) add(S.hook + 9 + i * 3.5, `pop_${i}`, 0.38 + i * 0.02);
add(S.hook + 42, "riser_short", 0.45);
add(S.hook + 51, "impact", 0.9);

// ---- Problème
[3, 22, 41].forEach((d) => add(S.problem + d, "thud", 0.6));
[22, 41].forEach((d) => add(S.problem + d + 1, "strike", 0.4));
add(S.problem + 72, "whoosh_in", 0.35);
[78, 82.5, 87, 91.5].forEach((d, i) => add(S.problem + d, `blip_${i}`, 0.42));
add(S.problem + 98, "whoosh_in", 0.3);

// ---- Révélation : la montée remplace le souffle, et la coupe est un coup de sous-basse.
add(S.reveal - 30, "riser", 0.55);
add(S.reveal + 1, "boom", 1);
add(S.reveal + 5, "shimmer", 0.5);
add(S.reveal + 15, "impact", 0.45);
add(S.reveal + 27, "whoosh_in", 0.3);

// ---- Démo
for (let f = 2, k = 0; f <= D.typeEnd; f += 2, k++) add(S.demo + f, `key_${k % 4}`, 0.26);
add(S.demo + D.think - 2, "whoosh_in", 0.32);
add(S.demo + D.think, "tick", 0.2);
add(S.demo + D.think + 8, "tick", 0.16);
for (let f = D.answer, k = 0; f <= D.answerEnd; f += 4, k++) add(S.demo + f, `key_${k % 4}`, 0.12);
add(S.demo + D.answerEnd, "whoosh", 0.35);
add(S.demo + D.tension, "tension", 0.8);
add(S.demo + D.tension, "whoosh_in", 0.3);
add(S.demo + D.verdict - 6, "whoosh", 0.3);
add(S.demo + D.verdict, "chime", 0.62);

// ---- Salle de réunion : les cartes arrivent de gauche, de droite, de gauche.
add(S.room, "whoosh_in", 0.32);
add(S.room + 2, "thud", 0.35);
["swipe_l", "swipe_r", "swipe_l"].forEach((sfx, i) => add(S.room + 10 + i * 11, sfx, 0.5));
add(S.room + 46, "chime", 0.58);

// ---- Nuit : un tic par minute, un pop par ligne du journal.
for (let k = 1; k <= 8; k++) add(S.night + 4 + k * (34 / 9), k % 2 ? "tick" : "tick_hi", 0.3);
[6, 14, 22, 30].forEach((d, i) => add(S.night + d, `pop_${2 + i * 2}`, 0.3));
add(S.night + 44, "blip_3", 0.26);

// ---- Récapitulatif
add(S.benefits, "whoosh_in", 0.32);
[10, 22, 34].forEach((d, i) => {
  add(S.benefits + d, `pop_${3 + i * 3}`, 0.5);
  add(S.benefits + d, "click", 0.2);
});

// ---- Appel à l'action
add(S.cta, "shimmer", 0.45);
add(S.cta + 6, "whoosh_in", 0.32);
add(S.cta + 30, "pop_5", 0.45);
add(S.cta + 40, "tick_hi", 0.22);
add(S.cta + 60, "click", 0.8);
add(S.cta + 62, "chime", 0.55);

/*
 * La seconde moitié est remontée de 4 dB.
 *
 * Mesurée sur le premier rendu, l'accroche tournait à -13 dB et la
 * révélation à -10 dB, mais la salle, la nuit, le récap et l'appel
 * retombaient entre -21 et -25 dB : la vidéo s'éteignait pile au moment où
 * elle doit convaincre de cliquer.
 */
for (const cue of cues) {
  if (cue.at >= S.room - 10) cue.volume = Math.min(1, cue.volume * 1.6);
}

export const CUES: readonly Cue[] = cues;

/** Les coups sous lesquels la musique s'efface un instant, pour les laisser passer. */
export const DUCKS: readonly number[] = [
  S.hook + 51,
  S.reveal + 1,
  S.reveal + 15,
  S.demo + D.tension,
  S.cta + 60,
];
