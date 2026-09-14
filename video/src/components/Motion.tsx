import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, EASE_OUT } from "../theme";
import { pop } from "../utils";

/**
 * Les trois gestes de montage de la vidéo.
 *
 * Réunis dans un seul fichier parce qu'ils forment un vocabulaire : chaque
 * scène les combine, et les régler au même endroit garantit que la vidéo
 * entière garde un seul rythme.
 */

interface SceneProps {
  children: ReactNode;
  duration: number;
  background?: string;
  /** Poussée lente de la caméra sur toute la scène (0,05 = +5 %). */
  push?: number;
}

/**
 * Une scène : entrée en zoom flou, puis poussée continue.
 *
 * La poussée n'est jamais nulle. En vertical, une image qui ne bouge pas
 * pendant une seconde est le moment exact où le pouce reprend le défilement.
 */
export const Scene: React.FC<SceneProps> = ({ children, duration, background, push = 0.04 }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 8], [0, 1], { ...clamp, easing: EASE_OUT });
  const scale = interpolate(frame, [0, duration], [1, 1 + push], clamp) * (1.12 - 0.12 * enter);
  const blur = 18 * (1 - enter);

  return (
    <AbsoluteFill style={{ background, overflow: "hidden" }}>
      <AbsoluteFill
        style={{ transform: `scale(${scale})`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

interface SlamProps {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
}

/** Un bloc qui tombe sur l'écran : grossi, écrasé, secoué. Pour les phrases coup de poing. */
export const Slam: React.FC<SlamProps> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const s = pop(frame, fps, delay, { damping: 9, stiffness: 260, mass: 0.5 });
  const scale = interpolate(s, [0, 1], [1.9, 1]);
  const opacity = interpolate(f, [0, 2], [0, 1], clamp);
  const shake = f >= 0 && f < 10 ? Math.sin(f * 2.6) * (10 - f) * 1.4 : 0;

  return (
    <div
      style={{
        opacity,
        transform: `translate(${shake}px, ${-shake * 0.4}px) scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

interface FlashProps {
  at: number;
  color?: string;
}

/** Un éclair de deux cents millisecondes sur une coupe franche : il marque le temps. */
export const Flash: React.FC<FlashProps> = ({ at, color = "#ffffff" }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 5) return null;
  return (
    <AbsoluteFill
      style={{ background: color, opacity: interpolate(f, [0, 5], [0.5, 0]), pointerEvents: "none" }}
    />
  );
};
