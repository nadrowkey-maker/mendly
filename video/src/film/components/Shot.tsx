import type { ReactNode } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { GLIDE, LEAVE, range } from "../ease";

/**
 * Un plan, et le passage au suivant.
 *
 * Il n'y a pas de coupe franche dans le film : chaque plan déborde de LEAD
 * images de part et d'autre et se fond dans ses voisins. Le plan qui part
 * avance vers la caméra en se floutant, celui qui arrive sort du flou en
 * reculant légèrement — les deux ensemble donnent l'impression d'un seul
 * mouvement de caméra vers l'avant, jamais d'un montage.
 *
 * Dans une scène, `useShotFrame()` donne l'image 0 au début exact de sa
 * mesure ; elle vaut -LEAD pendant le fondu d'entrée.
 */
export const LEAD = 8;

export function useShotFrame(): number {
  return useCurrentFrame() - LEAD;
}

interface ShotProps {
  from: number;
  duration: number;
  children: ReactNode;
}

const ShotBody: React.FC<{ duration: number; children: ReactNode }> = ({ duration, children }) => {
  const f = useShotFrame();
  const enter = range(f, -LEAD, 6, 0, 1, GLIDE);
  const exit = range(f, duration - 6, duration + LEAD, 0, 1, LEAVE);
  const blur = (1 - enter) * 22 + exit * 26;
  const scale = (0.95 + enter * 0.05) * (1 + exit * 0.14);

  return (
    <AbsoluteFill
      style={{
        opacity: enter * (1 - exit),
        transform: `scale(${scale})`,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const Shot: React.FC<ShotProps> = ({ from, duration, children }) => (
  <Sequence from={from - LEAD} durationInFrames={duration + LEAD * 2}>
    <ShotBody duration={duration}>{children}</ShotBody>
  </Sequence>
);
