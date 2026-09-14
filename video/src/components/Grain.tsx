import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * Le grain de pellicule, par-dessus tout.
 *
 * Il change de tirage toutes les deux images : un grain figé se lit comme une
 * texture posée sur l'écran, un grain qui vibre se lit comme de la matière
 * filmée. C'est ce qui empêche le motion design de paraître « plastique ».
 */
interface GrainProps {
  opacity?: number;
}

export const Grain: React.FC<GrainProps> = ({ opacity = 0.1 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 60;
  const id = `grain-${seed}`;

  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};
