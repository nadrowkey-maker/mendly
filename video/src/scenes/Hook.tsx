import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Copy } from "../copy";
import { C, SAFE, SANS, clamp } from "../theme";
import { pop } from "../utils";
import { Scene, Slam } from "../components/Motion";
import { GradientField } from "../components/GradientField";
import { Words } from "../components/Words";
import { Bubble } from "../components/UiBits";

/**
 * L'accroche — 2,4 secondes pour empêcher le pouce de défiler.
 *
 * Pas de logo, pas d'introduction : le problème, dès l'image 0. La phrase du
 * haut se lit sans le son ; en dessous, la question d'un fondateur est
 * aussitôt noyée sous une nuée de « oui » enthousiastes. Le spectateur voit
 * l'absurdité avant qu'on la nomme — puis la phrase tombe.
 */
const SPOTS = [
  { x: 6, y: 760, r: -4 },
  { x: 40, y: 850, r: 3 },
  { x: 12, y: 950, r: 2 },
  { x: 46, y: 1045, r: -3 },
  { x: 4, y: 1140, r: 4 },
  { x: 36, y: 1235, r: -2 },
  { x: 10, y: 1330, r: 3 },
  { x: 44, y: 1420, r: -4 },
  { x: 50, y: 1320, r: -1 },
  { x: 52, y: 740, r: 2 },
];

export const Hook: React.FC<{ c: Copy }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dim = interpolate(frame, [48, 54], [0, 0.8], clamp);
  const q = pop(frame, fps, 0, { stiffness: 260 });

  return (
    <Scene duration={72} background={C.shell} push={0.06}>
      <GradientField way="ink" intensity={0.8} />

      <Words
        text={c.hook.line}
        stagger={2}
        accentWords={[c.hook.accentIndex]}
        accentStyle={{ color: C.ink, background: "#ffffff", padding: "0 0.18em", borderRadius: 18 }}
        style={{
          position: "absolute",
          top: SAFE.top,
          left: SAFE.left,
          right: SAFE.right,
          fontSize: 116,
          fontWeight: 800,
          lineHeight: 1.04,
          letterSpacing: "-0.045em",
          color: "#ffffff",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 560,
          right: SAFE.right,
          opacity: q,
          transform: `scale(${0.85 + 0.15 * q})`,
          transformOrigin: "100% 50%",
        }}
      >
        <Bubble text={c.hook.question} tone="founder" size={42} style={{ maxWidth: 820 }} />
      </div>

      {c.hook.yes.map((text, i) => {
        const delay = 9 + i * 3.5;
        const s = pop(frame, fps, delay, { damping: 10, stiffness: 280 });
        if (frame < delay) return null;
        const spot = SPOTS[i % SPOTS.length];
        return (
          <div
            key={text}
            style={{
              position: "absolute",
              left: `${spot.x}%`,
              top: spot.y,
              opacity: Math.min(1, s * 1.5),
              transform: `rotate(${spot.r}deg) scale(${0.5 + 0.5 * s})`,
            }}
          >
            <Bubble text={text} tone="ai" size={44} />
          </div>
        );
      })}

      <AbsoluteFill style={{ background: `rgba(10,10,11,${dim})` }} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Slam delay={51}>
          <div
            style={{
              // La police est posée explicitement : un bloc hors du flux de
              // `Words` n'hérite de rien, et retombait sur la police serif du
              // navigateur.
              fontFamily: SANS,
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: C.ink,
              background: "#ffffff",
              padding: "18px 40px",
              borderRadius: 28,
            }}
          >
            {c.hook.slam}
          </div>
        </Slam>
      </AbsoluteFill>
    </Scene>
  );
};
