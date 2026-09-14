import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Copy } from "../copy";
import { C, SANS, clamp } from "../theme";
import { pop } from "../utils";
import { Scene, Slam } from "../components/Motion";
import { GradientField } from "../components/GradientField";
import { Orb } from "../components/Orb";
import { Words } from "../components/Words";

/**
 * La révélation — l'orbe, le nom, la promesse.
 *
 * C'est le premier moment où la marque apparaît, et il arrive après le
 * problème, pas avant. L'orbe naît dans une onde de choc : on doit sentir que
 * quelque chose vient de répondre au problème posé juste avant.
 */
const ORB = 560;
const ORB_TOP = 400;

export const Reveal: React.FC<{ c: Copy }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = pop(frame, fps, 1, { damping: 11, stiffness: 150, mass: 0.8 });
  const wave = interpolate(frame, [4, 30], [0, 1], clamp);
  const intensity = interpolate(frame, [0, 24], [1, 0.35], clamp);

  return (
    <Scene duration={78} background="#070A10" push={0.05}>
      <GradientField way="dusk" intensity={0.9} speed={1.6} />

      <AbsoluteFill style={{ alignItems: "center" }}>
        <div
          style={{
            position: "absolute",
            top: ORB_TOP + ORB / 2,
            width: ORB + wave * 1100,
            height: ORB + wave * 1100,
            marginTop: -(ORB + wave * 1100) / 2,
            borderRadius: "50%",
            border: `6px solid rgba(143,212,255,${0.7 * (1 - wave)})`,
          }}
        />
        <div style={{ position: "absolute", top: ORB_TOP, transform: `scale(${grow})` }}>
          <Orb size={ORB} intensity={intensity} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center" }}>
        <div style={{ position: "absolute", top: 1030 }}>
          <Slam delay={15}>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 200,
                fontWeight: 800,
                letterSpacing: "-0.055em",
                color: "#ffffff",
                lineHeight: 1,
              }}
            >
              {c.reveal.name}
            </div>
          </Slam>
        </div>
        <Words
          text={c.reveal.tagline}
          delay={27}
          stagger={2}
          style={{
            position: "absolute",
            top: 1280,
            textAlign: "center",
            fontSize: 66,
            fontWeight: 500,
            lineHeight: 1.12,
            letterSpacing: "-0.025em",
            color: "rgba(255,255,255,0.82)",
          }}
        />
      </AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 240px ${C.shell}` }} />
    </Scene>
  );
};
