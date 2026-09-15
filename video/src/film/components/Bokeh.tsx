import { useCurrentFrame } from "remotion";
import { Node } from "./Space";

/**
 * Des points de lumière hors foyer, répartis en profondeur.
 *
 * Seuls, ils ne se voient presque pas. Mais quand la caméra bouge, ils
 * défilent à des vitesses différentes selon leur distance — et c'est cette
 * parallaxe qui fait sentir qu'il y a un volume, pas un fond plat.
 */
interface BokehProps {
  color: string;
  count?: number;
  opacity?: number;
}

const rand = (i: number, k: number) => {
  const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

export const Bokeh: React.FC<BokehProps> = ({ color, count = 16, opacity = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const z = -1800 + rand(i, 1) * 2400;
        const size = 20 + rand(i, 2) * 70;
        const drift = Math.sin(frame * 0.02 + i) * 20;
        return (
          <Node
            key={i}
            width={size}
            height={size}
            x={(rand(i, 3) - 0.5) * 2200}
            y={(rand(i, 4) - 0.5) * 3000 + drift}
            z={z}
            opacity={opacity * (0.25 + rand(i, 5) * 0.5)}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                filter: `blur(${4 + Math.abs(z) / 250}px)`,
              }}
            />
          </Node>
        );
      })}
    </>
  );
};
