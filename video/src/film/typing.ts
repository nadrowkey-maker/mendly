/**
 * Le calendrier de frappe, partagé entre l'image et le son.
 *
 * Chaque caractère a son image d'apparition, calculée une seule fois ici. La
 * scène s'en sert pour afficher le texte, la bande-son pour poser une frappe
 * de clavier sur chaque lettre : les deux ne peuvent pas se décaler, puisqu'ils
 * lisent la même liste.
 *
 * Le rythme n'est pas régulier. Une frappe humaine ralentit après une espace
 * et accélère au milieu d'un mot ; une frappe métronomique se reconnaît tout
 * de suite comme une animation.
 */
export interface Keystroke {
  frame: number;
  char: string;
}

export function schedule(text: string, start: number, framesPerChar = 1.6): Keystroke[] {
  const out: Keystroke[] = [];
  let t = start;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    out.push({ frame: Math.round(t), char });
    const wobble = 0.75 + 0.5 * ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
    t += framesPerChar * wobble * (char === " " ? 1.8 : 1);
  }
  return out;
}

export function typedAt(strokes: Keystroke[], frame: number): string {
  let s = "";
  for (const k of strokes) {
    if (k.frame > frame) break;
    s += k.char;
  }
  return s;
}
