import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Grain } from "./Grain";
import { rgba } from "../utils";

/**
 * Le dégradé granuleux de la page d'accueil, en plein écran vertical.
 *
 * Mêmes coloris, même sens : azur pour le produit, ambre pour la tension,
 * vert pour le verdict, sombre pour l'atelier. Les taches dérivent en continu
 * — en vidéo verticale, un fond immobile se lit comme un diaporama.
 */
const WAYS = {
  azure: { base: "#EEF1F6", blobs: ["#1f8ce8", "#63bdff", "#ffc046", "#ffffff"] },
  signal: { base: "#FBF1DF", blobs: ["#ff9d1f", "#ffc266", "#fff3dd", "#ffd699"] },
  verdict: { base: "#E9F5EC", blobs: ["#17b87c", "#6fdcae", "#eefaf3", "#a5e6c8"] },
  dusk: { base: "#070A10", blobs: ["#1d6fbd", "#3aa8ff", "#0b2a4a", "#8fd4ff"] },
  ink: { base: "#0A0A0B", blobs: ["#10263f", "#1d6fbd", "#0A0A0B", "#3a2a12"] },
  paper: { base: "#FBFAF8", blobs: ["#f3f1ed", "#ffffff", "#e8edf3", "#fbf1df"] },
} as const;

export type Way = keyof typeof WAYS;

/** Positions de départ des taches, en pourcentage du cadre. */
const SPOTS = [
  { x: 18, y: 20, r: 1300, a: 0.85, sx: 0.9, sy: 0.7, ph: 0 },
  { x: 84, y: 34, r: 1150, a: 0.8, sx: 0.6, sy: 1.1, ph: 1.7 },
  { x: 28, y: 76, r: 1250, a: 0.8, sx: 1.2, sy: 0.8, ph: 3.1 },
  { x: 78, y: 88, r: 1050, a: 0.75, sx: 0.8, sy: 1.3, ph: 4.4 },
];

interface GradientFieldProps {
  way: Way;
  /** Force des taches, 0 à 1. */
  intensity?: number;
  speed?: number;
}

export const GradientField: React.FC<GradientFieldProps> = ({ way, intensity = 1, speed = 1 }) => {
  const frame = useCurrentFrame();
  const { base, blobs } = WAYS[way];
  const t = frame * 0.02 * speed;
  const dark = way === "dusk" || way === "ink";

  return (
    <AbsoluteFill style={{ background: base, overflow: "hidden" }}>
      {blobs.map((color, i) => {
        const p = SPOTS[i];
        const x = p.x + Math.cos(t * p.sx + p.ph) * 14;
        const y = p.y + Math.sin(t * p.sy + p.ph) * 9;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: p.r,
              height: p.r,
              marginLeft: -p.r / 2,
              marginTop: -p.r / 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${rgba(color, 1)} 0%, ${rgba(color, 0)} 68%)`,
              opacity: p.a * intensity,
              filter: "blur(40px)",
            }}
          />
        );
      })}
      <Grain opacity={dark ? 0.09 : 0.16} />
    </AbsoluteFill>
  );
};
