import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Copy } from "../copy";
import { C, SAFE, SANS } from "../theme";
import { pop } from "../utils";
import { Scene } from "../components/Motion";
import { GradientField } from "../components/GradientField";
import { Words } from "../components/Words";

/**
 * Le récapitulatif — trois bénéfices, trois pilules.
 *
 * Juste avant l'appel à l'action, on redit ce qu'on vient de montrer en une
 * phrase par geste. Le spectateur qui a raté la démo en regardant ailleurs
 * repart quand même avec la promesse entière.
 */
export const Benefits: React.FC<{ c: Copy }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Scene duration={72} background={C.paper} push={0.05}>
      <GradientField way="azure" intensity={0.6} />

      <Words
        text={c.benefits.title}
        stagger={2}
        style={{
          position: "absolute",
          top: SAFE.top + 90,
          left: SAFE.left,
          right: SAFE.right,
          fontSize: 84,
          fontWeight: 800,
          letterSpacing: "-0.045em",
          color: C.ink,
        }}
      />

      {c.benefits.items.map((item, i) => {
        const s = pop(frame, fps, 10 + i * 12, { damping: 11, stiffness: 230 });
        return (
          <div
            key={item}
            style={{
              position: "absolute",
              top: 580 + i * 230,
              left: SAFE.left,
              display: "flex",
              alignItems: "center",
              gap: 30,
              padding: "34px 52px 34px 34px",
              borderRadius: 999,
              background: "#ffffff",
              boxShadow: "0 30px 70px -30px rgba(14,14,15,0.35)",
              opacity: Math.min(1, s * 1.4),
              transform: `translateX(${(1 - s) * -120}px) scale(${0.9 + 0.1 * s})`,
              transformOrigin: "0% 50%",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: C.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4.2 4.2L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontFamily: SANS, fontSize: 52, fontWeight: 700, letterSpacing: "-0.025em", color: C.ink }}>
              {item}
            </span>
          </div>
        );
      })}
    </Scene>
  );
};
