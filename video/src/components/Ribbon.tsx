import { useCurrentFrame } from "remotion";

/**
 * Le ruban de la page d'accueil, en SVG et piloté par le numéro d'image.
 *
 * Même géométrie que le composant du site : une bande parcourue en fils
 * décalés perpendiculairement à la trajectoire, qui se pince là où elle se
 * présente de profil. Le canvas du site suit l'horloge ; ici tout dérive du
 * numéro d'image, pour que chaque rendu produise exactement la même vidéo.
 */
const RAMP: [number, [number, number, number]][] = [
  [0.0, [255, 180, 84]],
  [0.22, [255, 215, 154]],
  [0.42, [255, 243, 221]],
  [0.58, [223, 233, 244]],
  [0.78, [143, 212, 255]],
  [1.0, [58, 148, 235]],
];

function sample(v: number): [number, number, number] {
  for (let i = 1; i < RAMP.length; i++) {
    const [p1, c1] = RAMP[i - 1];
    const [p2, c2] = RAMP[i];
    if (v <= p2) {
      const k = (v - p1) / (p2 - p1);
      return [c1[0] + (c2[0] - c1[0]) * k, c1[1] + (c2[1] - c1[1]) * k, c1[2] + (c2[2] - c1[2]) * k];
    }
  }
  return RAMP[RAMP.length - 1][1];
}

const THREADS = 36;
const STEPS = 64;

interface RibbonProps {
  width: number;
  height: number;
  speed?: number;
}

export const Ribbon: React.FC<RibbonProps> = ({ width, height, speed = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.045 * speed;

  const path = (u: number) => {
    const x = u * width;
    const y =
      height * 0.5 +
      Math.sin(u * Math.PI * 2.4 + t) * height * 0.3 +
      Math.sin(u * Math.PI * 4.6 + t * 1.31) * height * 0.12;
    const twist = 0.3 + 0.7 * Math.abs(Math.sin(u * Math.PI * 2.1 + t * 0.7));
    const half = Math.sin(u * Math.PI) * height * 0.34 * twist;
    return { x, y, half, twist };
  };

  const threads = Array.from({ length: THREADS }, (_, n) => {
    const v = n / (THREADS - 1);
    const [r, g, b] = sample(v);
    let d = "";
    let alpha = 0;
    for (let i = 0; i <= STEPS; i++) {
      const u = i / STEPS;
      const p = path(u);
      const q = path(Math.min(1, u + 0.004));
      const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
      const nx = -(q.y - p.y) / len;
      const ny = (q.x - p.x) / len;
      const off = (v - 0.5) * 2 * p.half;
      d += `${i === 0 ? "M" : "L"}${(p.x + nx * off).toFixed(1)},${(p.y + ny * off).toFixed(1)}`;
      if (i === STEPS / 2) alpha = p.twist;
    }
    const edge = Math.sin(v * Math.PI) ** 0.55;
    return (
      <path
        key={n}
        d={d}
        fill="none"
        stroke={`rgba(${r | 0},${g | 0},${b | 0},${0.8 * edge * alpha})`}
        strokeWidth={(height * 0.62) / THREADS * 1.25}
        strokeLinecap="round"
      />
    );
  });

  return (
    <svg width={width} height={height} style={{ overflow: "visible", mixBlendMode: "multiply" }}>
      <defs>
        <filter id="ribbon-blur" x="-10%" y="-40%" width="120%" height="180%">
          <feGaussianBlur stdDeviation={3} />
        </filter>
      </defs>
      <g filter="url(#ribbon-blur)">{threads}</g>
    </svg>
  );
};
