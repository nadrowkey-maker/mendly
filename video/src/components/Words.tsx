import type { CSSProperties } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, SANS } from "../theme";
import { pop } from "../utils";

/**
 * Le texte cinétique : chaque mot arrive l'un après l'autre.
 *
 * Trois images d'écart par mot, soit dix mots par seconde — le haut de la
 * fourchette que TikTok recommande pour qu'un texte reste lisible sans son.
 * Chaque mot monte, se défloute et se pose sur un ressort : c'est le ressort,
 * pas le fondu, qui donne l'énergie.
 *
 * `\n` force un retour à la ligne : en vertical, la coupe de ligne est une
 * décision de mise en page, pas un hasard du retour automatique.
 */
interface WordsProps {
  text: string;
  delay?: number;
  stagger?: number;
  style?: CSSProperties;
  /** Index (dans l'ordre de lecture) des mots à mettre en exergue. */
  accentWords?: number[];
  accentStyle?: CSSProperties;
  /** Sortie : fondu à partir de cette image. */
  exitAt?: number;
}

export const Words: React.FC<WordsProps> = ({
  text,
  delay = 0,
  stagger = 3,
  style,
  accentWords = [],
  accentStyle,
  exitAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = exitAt === undefined ? 1 : interpolate(frame, [exitAt, exitAt + 5], [1, 0], clamp);
  let index = 0;

  return (
    <div style={{ fontFamily: SANS, opacity: exit, ...style }}>
      {text.split("\n").map((line, li) => (
        <div key={li}>
          {line.split(" ").map((word, wi) => {
            const i = index++;
            const f = frame - delay - i * stagger;
            const s = pop(frame, fps, delay + i * stagger, { damping: 13, stiffness: 190, mass: 0.55 });
            const opacity = interpolate(f, [0, 5], [0, 1], clamp);
            const blur = interpolate(f, [0, 7], [12, 0], clamp);
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  marginRight: "0.24em",
                  opacity,
                  filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
                  transform: `translateY(${(1 - s) * 0.55}em)`,
                  ...(accentWords.includes(i) ? accentStyle : null),
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
