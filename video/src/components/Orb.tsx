import { useCurrentFrame } from "remotion";
import { rgba } from "../utils";

/**
 * L'orbe de Mendly, piloté image par image.
 *
 * Même composition que l'orbe du produit — cinq taches dans une sphère,
 * assombrissement du bord, reflet fixe en haut à gauche — mais calculé depuis
 * le numéro d'image plutôt que depuis l'horloge : une vidéo doit rendre la
 * même image à chaque rendu.
 *
 * `intensity` joue le rôle de « Mendly écrit » : la matière accélère,
 * s'éclaire, et le halo monte.
 */
const BLOBS = [
  { c: "#0b2a4a", r: 0.5, a: 0.45, fx: 1.3, fy: 0.9, p: 3.3 },
  { c: "#3aa8ff", r: 0.6, a: 0.95, fx: 0.8, fy: 1.1, p: 0 },
  { c: "#8fd4ff", r: 0.5, a: 0.65, fx: 1.2, fy: 0.7, p: 2.1 },
  { c: "#ffd79a", r: 0.52, a: 0.9, fx: 0.6, fy: 1.4, p: 4 },
  // Le blanc est retenu : en grand format (révélation), il noyait l'azur et
  // l'ambre, et l'orbe sortait laiteux au lieu de coloré.
  { c: "#ffffff", r: 0.28, a: 0.5, fx: 1.5, fy: 0.8, p: 1.2 },
];

interface OrbProps {
  size: number;
  /** 0 au repos, 1 quand Mendly parle. */
  intensity?: number;
}

export const Orb: React.FC<OrbProps> = ({ size, intensity = 0 }) => {
  const frame = useCurrentFrame();
  const t = frame * (0.035 + intensity * 0.07);
  const swing = 0.3 + intensity * 0.16;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div
        style={{
          position: "absolute",
          inset: -size * 0.4,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(58,168,255,${0.22 + intensity * 0.38}) 0%, rgba(58,168,255,0) 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          overflow: "hidden",
          background: "#164a7d",
          boxShadow: `inset 0 0 0 ${Math.max(1, size * 0.006)}px rgba(255,255,255,${0.12 + intensity * 0.2})`,
        }}
      >
        {BLOBS.map((b, i) => {
          const cx = 50 + Math.cos(t * b.fx + b.p) * swing * 50;
          const cy = 50 + Math.sin(t * b.fy + b.p) * swing * 50;
          const d = b.r * size * 2;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${cx}%`,
                top: `${cy}%`,
                width: d,
                height: d,
                marginLeft: -d / 2,
                marginTop: -d / 2,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${rgba(b.c, b.a * (0.75 + intensity * 0.25))} 0%, ${rgba(b.c, 0)} 70%)`,
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(4,14,28,0) 60%, rgba(4,14,28,0.5) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,${0.22 + intensity * 0.16}) 0%, rgba(255,255,255,0) 34%)`,
          }}
        />
      </div>
    </div>
  );
};
