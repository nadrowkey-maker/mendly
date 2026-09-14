import { interpolate, spring } from "remotion";
import { clamp } from "./theme";

/** Texte révélé caractère par caractère entre deux images. */
export function typed(text: string, frame: number, start: number, end: number): string {
  const count = Math.round(interpolate(frame, [start, end], [0, text.length], clamp));
  return text.slice(0, count);
}

/** Un ressort qui part à `delay` images et reste à zéro avant. */
export function pop(
  frame: number,
  fps: number,
  delay: number,
  config: { damping?: number; stiffness?: number; mass?: number } = {}
): number {
  return spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 14, stiffness: 200, mass: 0.6, ...config },
  });
}

/**
 * Une couleur hexadécimale en rgba.
 *
 * Les dégradés s'éteignent sur leur propre teinte à opacité nulle : s'éteindre
 * sur `transparent` (du noir transparent) grise tout ce qu'ils traversent.
 */
export function rgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
