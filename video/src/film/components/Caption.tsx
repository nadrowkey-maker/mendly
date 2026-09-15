import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Line } from "../copy";
import { GLIDE, LEAVE, range } from "../ease";
import { BlurText } from "./BlurText";
import { Glass } from "./Glass";

/**
 * Une phrase posée sur une lame de verre.
 *
 * Au-dessus d'un écran sombre du produit, un texte nu devient illisible. Le
 * verre clair apparaît juste avant les mots et part juste après eux : on lit
 * la phrase, jamais un bandeau.
 */
interface CaptionProps {
  line: Line;
  start: number;
  end: number;
  /** Position verticale du centre, depuis le centre de l'écran. */
  y: number;
  size?: number;
}

export const Caption: React.FC<CaptionProps> = ({ line, start, end, y, size = 64 }) => {
  const frame = useCurrentFrame();
  const inP = range(frame, start - 4, start + 12, 0, 1, GLIDE);
  const outP = range(frame, end + 2, end + 12, 0, 1, LEAVE);
  const p = inP * (1 - outP);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          transform: `translateY(${y + (1 - inP) * 24 - outP * 20}px) scale(${0.96 + p * 0.04})`,
          opacity: p,
          filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined,
        }}
      >
        <Glass radius={44} glow={0.5} style={{ padding: "30px 48px" }}>
          <BlurText text={line.text} accent={line.accent} start={start} end={end} size={size} stagger={2} />
        </Glass>
      </div>
    </AbsoluteFill>
  );
};
