import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Copy } from "../copy";
import { C, MONO, SAFE, SANS, clamp } from "../theme";
import { pop } from "../utils";
import { Scene } from "../components/Motion";
import { GradientField } from "../components/GradientField";
import { Words } from "../components/Words";

/**
 * Le problème — trois constats, puis l'addition.
 *
 * Chaque constat raye le précédent : on ne lit jamais deux phrases à la fois,
 * et la liste qui s'accumule dit l'isolement mieux qu'une phrase sur
 * l'isolement. Puis le compteur monte jusqu'à ce que ça coûte.
 */
const LINE_DELAYS = [3, 22, 41];

export const Problem: React.FC<{ c: Copy }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const value = Math.min(3, Math.floor(interpolate(frame, [78, 96], [0, 3.99], clamp)));
  const bump = 1 + 0.14 * (1 - pop(frame, fps, 78 + value * 6, { damping: 9, stiffness: 300 }));
  const lossIn = pop(frame, fps, 72);

  return (
    <Scene duration={132} background={C.paper} push={0.04}>
      <GradientField way="signal" intensity={0.5} />

      {c.problem.lines.map((line, i) => {
        // Seuls les deux premiers constats sont rayés. Le dernier — personne
        // pour te dire non — est le vrai problème : il s'estompe sous
        // l'addition, mais on ne le barre pas.
        const last = i === c.problem.lines.length - 1;
        const next = LINE_DELAYS[i + 1] ?? 66;
        const struck = last ? 0 : interpolate(frame, [next, next + 6], [0, 1], clamp);
        const fade = last ? interpolate(frame, [66, 74], [0, 0.45], clamp) : struck * 0.7;
        return (
          <div
            key={line}
            style={{
              position: "absolute",
              top: SAFE.top + 40 + i * 150,
              left: SAFE.left,
              right: SAFE.right,
              opacity: 1 - fade,
            }}
          >
            <Words
              text={line}
              delay={LINE_DELAYS[i]}
              stagger={2}
              style={{ fontSize: 92, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em", color: C.ink }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 50,
                height: 10,
                borderRadius: 5,
                width: `${struck * 70}%`,
                background: C.ink,
              }}
            />
          </div>
        );
      })}

      <div style={{ position: "absolute", top: 860, left: SAFE.left, right: SAFE.right, opacity: lossIn }}>
        <div style={{ fontFamily: MONO, fontSize: 34, letterSpacing: "0.2em", color: C.inkSoft }}>
          {c.problem.lossLead}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginTop: 6 }}>
          <span
            style={{
              fontFamily: SANS,
              fontSize: 330,
              fontWeight: 800,
              lineHeight: 0.92,
              letterSpacing: "-0.06em",
              color: C.ink,
              display: "inline-block",
              transform: `scale(${bump})`,
              transformOrigin: "0% 80%",
            }}
          >
            {value}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 120, fontWeight: 800, letterSpacing: "-0.04em", color: C.ink }}>
            {c.problem.lossUnit}
          </span>
        </div>
        <Words
          text={c.problem.lossTail}
          delay={98}
          stagger={2}
          style={{ marginTop: 18, fontSize: 70, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.03em", color: C.inkSoft }}
        />
      </div>
    </Scene>
  );
};
