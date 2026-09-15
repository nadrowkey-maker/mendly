import type { CSSProperties } from "react";
import { useCurrentFrame } from "remotion";
import { SANS } from "../../theme";
import { ACCENT_GRADIENT } from "../look";
import { GLIDE, LEAVE, range } from "../ease";

/**
 * Le texte qui se défloute, mot par mot.
 *
 * C'est le geste typographique des publicités de référence : chaque mot sort
 * du flou en glissant de quelques pixels, sans rebond. Il repart de la même
 * façon, en se refloutant vers le haut. Un seul mot peut porter le dégradé
 * d'accent — deux, et la phrase perd son centre.
 */
interface BlurTextProps {
  text: string;
  /** Image d'entrée du premier mot. */
  start: number;
  /** Image de début de sortie ; absent, le texte reste. */
  end?: number;
  /** Écart entre deux mots, en images. */
  stagger?: number;
  /** Index du mot en dégradé. */
  accent?: number;
  size?: number;
  weight?: number;
  color?: string;
  align?: "left" | "center";
  style?: CSSProperties;
}

export const BlurText: React.FC<BlurTextProps> = ({
  text,
  start,
  end,
  stagger = 3,
  accent,
  size = 88,
  weight = 600,
  color = "#0E0E0F",
  align = "center",
  style,
}) => {
  const frame = useCurrentFrame();
  const out = end === undefined ? 0 : range(frame, end, end + 12, 0, 1, LEAVE);
  let index = 0;

  return (
    <div
      style={{
        fontFamily: SANS,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.08,
        letterSpacing: "-0.035em",
        color,
        textAlign: align,
        ...style,
      }}
    >
      {text.split("\n").map((line, li) => (
        <div key={li}>
          {line.split(" ").map((word, wi) => {
            const i = index++;
            const p = range(frame, start + i * stagger, start + i * stagger + 16, 0, 1, GLIDE);
            const opacity = p * (1 - out);
            const blur = (1 - p) * 18 + out * 16;
            const y = (1 - p) * 0.32 - out * 0.22;
            const isAccent = i === accent;
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  marginRight: "0.24em",
                  opacity,
                  filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
                  transform: `translateY(${y}em)`,
                  ...(isAccent
                    ? {
                        backgroundImage: ACCENT_GRADIENT,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }
                    : null),
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
