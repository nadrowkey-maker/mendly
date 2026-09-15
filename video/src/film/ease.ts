import { Easing, interpolate } from "remotion";

/**
 * Les courbes du film.
 *
 * La première version utilisait des ressorts nerveux et des secousses : c'est
 * ce qui la faisait « cheap ». Les publicités des grands produits d'IA ne
 * rebondissent jamais — tout accélère doucement et freine longtemps. Trois
 * courbes suffisent, et aucune ne dépasse sa cible.
 */

/** Accélère et freine en douceur : les déplacements de caméra. */
export const SMOOTH = Easing.bezier(0.45, 0, 0.15, 1);
/** Départ vif, arrivée très longue : les apparitions. */
export const GLIDE = Easing.bezier(0.16, 1, 0.3, 1);
/** Départ lent, sortie franche : les disparitions. */
export const LEAVE = Easing.bezier(0.6, 0, 0.9, 0.4);

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Une valeur qui passe de v0 à v1 entre deux images. */
export function range(
  frame: number,
  f0: number,
  f1: number,
  v0 = 0,
  v1 = 1,
  easing: (t: number) => number = SMOOTH
): number {
  return interpolate(frame, [f0, f1], [v0, v1], { ...CLAMP, easing });
}

/** Une piste à plusieurs clés [image, valeur], chaque segment adouci. */
export function track(
  frame: number,
  keys: readonly (readonly [number, number])[],
  easing: (t: number) => number = SMOOTH
): number {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f0, v0] = keys[i - 1];
    const [f1, v1] = keys[i];
    if (frame <= f1) return interpolate(frame, [f0, f1], [v0, v1], { ...CLAMP, easing });
  }
  return keys[keys.length - 1][1];
}
