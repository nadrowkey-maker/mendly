import type { FilmCopy } from "../copy";
import { askStrokes, sendFrame } from "../scenes/Ask";
import { CARD_POSITION_AT, CARD_TENSION_AT, CLICK_AT } from "../scenes/Contest";
import { POD_AT, SPEECH_AT, VERDICT_AT } from "../scenes/Council";
import { REPLY_AT } from "../scenes/Echo";
import { PILL_AT } from "../scenes/EndCard";
import { bar, SHOT } from "../timing";

/**
 * La feuille de sons du film.
 *
 * Tout est calculé depuis les constantes des scènes : si une animation bouge
 * d'une image, son son la suit. Les volumes restent bas — la musique porte le
 * film, les sons ne font que donner du toucher à ce qu'on voit.
 */
export interface FilmCue {
  at: number;
  sfx: string;
  volume: number;
}

export function filmCues(copy: FilmCopy): FilmCue[] {
  const cues: FilmCue[] = [];
  const add = (at: number, sfx: string, volume: number) => cues.push({ at, sfx, volume });

  // La nuit.
  add(bar(SHOT.night), "air_long", 0.3);
  add(bar(SHOT.night) + 2, "tap_0", 0.22);

  // La question : une frappe par lettre, la barre d'espace plus grave.
  const ask = bar(SHOT.ask);
  askStrokes(copy).forEach((k, i) => {
    add(ask + k.frame, k.char === " " ? "space" : `thock_${(i * 7) % 6}`, k.char === " " ? 0.42 : 0.36 + ((i * 5) % 3) * 0.04);
  });
  add(ask + sendFrame(copy), "press", 0.55);
  add(ask + sendFrame(copy) + 2, "air", 0.3);

  // L'IA qui dit oui, puis le silence et l'inspiration avant le décollage.
  const echo = bar(SHOT.echo);
  REPLY_AT.forEach((at, i) => add(echo + at, `tap_${i}`, 0.2));
  add(echo + 70, "air", 0.28);
  add(bar(SHOT.awaken) - 63, "inhale", 0.62);

  // L'éveil, sur le temps fort.
  const awaken = bar(SHOT.awaken);
  add(awaken, "impact", 0.85);
  add(awaken + 14, "halo", 0.42);

  // Le produit.
  const contest = bar(SHOT.contest);
  add(contest - 6, "air_long", 0.4);
  add(contest + CARD_TENSION_AT, "tap_2", 0.34);
  add(contest + CARD_POSITION_AT, "tap_3", 0.34);
  add(contest + CLICK_AT, "press", 0.5);
  add(contest + CLICK_AT + 4, "air_long", 0.45);

  // Le débat.
  const council = bar(SHOT.council);
  POD_AT.forEach((at, i) => add(council + at, `tap_${i}`, 0.18));
  SPEECH_AT.forEach((at, i) => add(council + at, `tap_${(i + 1) % 4}`, 0.3));
  add(council + SPEECH_AT[3] + 2, "halo", 0.26);
  add(council + VERDICT_AT, "impact_soft", 0.45);
  add(council + VERDICT_AT, "resolve", 0.5);

  // Le travelling.
  const team = bar(SHOT.team);
  add(team - 6, "air_long", 0.5);
  add(team + 30, "air", 0.34);

  // La phrase, puis la signature.
  add(bar(SHOT.alone), "impact_soft", 0.5);
  const end = bar(SHOT.end);
  add(end + 4, "resolve", 0.5);
  add(end + PILL_AT, "tap_3", 0.26);

  return cues;
}
