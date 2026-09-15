import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LOOK } from "../look";

/**
 * Le fond : une lumière qui respire, claire ou nocturne.
 *
 * Trois halos très larges et très flous dérivent lentement. On ne doit jamais
 * les voir comme des formes — seulement sentir que la lumière n'est pas figée.
 * `night` fond le jour vers la nuit (0 à 1) sans coupe.
 */
interface BackdropProps {
  /** 0 = jour, 1 = nuit. */
  night?: number;
}

const HALOS = [
  { x: 22, y: 18, r: 1500, day: LOOK.lavender, dark: "#0F2A4D", a: 0.55, s: 0.9, p: 0 },
  { x: 82, y: 42, r: 1300, day: "#D9ECFF", dark: "#123A66", a: 0.6, s: 0.7, p: 2.1 },
  { x: 40, y: 88, r: 1400, day: "#FFF1DA", dark: "#0A1B33", a: 0.45, s: 1.1, p: 4.2 },
];

export const Backdrop: React.FC<BackdropProps> = ({ night = 0 }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.012;

  return (
    <AbsoluteFill style={{ background: LOOK.mist, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: LOOK.night, opacity: night }} />
      {HALOS.map((h, i) => {
        const x = h.x + Math.cos(t * h.s + h.p) * 6;
        const y = h.y + Math.sin(t * h.s * 0.8 + h.p) * 4;
        return (
          <div key={i}>
            {(["day", "dark"] as const).map((mode) => (
              <div
                key={mode}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  width: h.r,
                  height: h.r,
                  marginLeft: -h.r / 2,
                  marginTop: -h.r / 2,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${mode === "day" ? h.day : h.dark} 0%, transparent 70%)`,
                  opacity: h.a * (mode === "day" ? 1 - night : night),
                  filter: "blur(30px)",
                }}
              />
            ))}
          </div>
        );
      })}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(8,14,26,${0.08 + night * 0.35}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
