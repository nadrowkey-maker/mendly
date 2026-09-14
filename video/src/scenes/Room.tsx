import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Copy } from "../copy";
import { C, MONO, SAFE, SANS } from "../theme";
import { pop } from "../utils";
import { Scene } from "../components/Motion";
import { GradientField } from "../components/GradientField";
import { Words } from "../components/Words";
import { Card } from "../components/UiBits";

/**
 * La salle de réunion — trois objections qui se croisent, puis un verdict.
 *
 * Les répliques arrivent alternativement de gauche et de droite : on voit un
 * désaccord avant d'avoir lu un mot. Aucun spécialiste n'a de couleur propre,
 * comme dans le produit ; seul le verdict s'éclaire.
 */
export const Room: React.FC<{ c: Copy }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panelIn = pop(frame, fps, 2);

  return (
    <Scene duration={68} background={C.paper} push={0.05}>
      <GradientField way="verdict" intensity={0.95} />

      <Words
        text={c.room.caption}
        stagger={2}
        style={{
          position: "absolute",
          top: SAFE.top,
          left: SAFE.left,
          right: SAFE.right,
          fontSize: 92,
          fontWeight: 800,
          lineHeight: 1.02,
          letterSpacing: "-0.045em",
          color: C.ink,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 520,
          left: 80,
          width: 920,
          padding: 44,
          borderRadius: 48,
          background: C.panel,
          boxShadow: "0 60px 140px -40px rgba(0,0,0,0.55)",
          opacity: panelIn,
          transform: `translateY(${(1 - panelIn) * 80}px)`,
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: "0.2em", textTransform: "uppercase", color: C.glow }}>
          {c.room.label}
        </div>
        <div style={{ fontFamily: SANS, marginTop: 14, fontSize: 46, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#fff" }}>
          {c.room.question}
        </div>

        {c.room.lines.map((line, i) => (
          <div key={line.who} style={{ marginTop: 20 }}>
            <Card
              label={line.who}
              text={line.text}
              tone="plain"
              size={38}
              from={i % 2 === 0 ? "left" : "right"}
              progress={pop(frame, fps, 10 + i * 11, { damping: 12, stiffness: 240 })}
            />
          </div>
        ))}

        <div style={{ marginTop: 24 }}>
          <Card label={c.room.verdictLabel} text={c.room.verdict} tone="azure" size={40} progress={pop(frame, fps, 46)} />
        </div>
      </div>
    </Scene>
  );
};
