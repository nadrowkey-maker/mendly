import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Copy } from "../copy";
import { C, MONO, SANS, clamp } from "../theme";
import { pop, typed } from "../utils";
import { Orb } from "../components/Orb";
import { Bubble, Card, Dots } from "../components/UiBits";

/**
 * L'écran de conversation, recomposé pour le vertical.
 *
 * Mêmes pièces que l'atelier — orbe, bulle du fondateur, réponse en flux,
 * carte ambre de contradiction, carte de position — dans la même séquence que
 * la démonstration de la page d'accueil. Le bandeau lumineux du haut s'allume
 * pendant que Mendly écrit, aux couleurs de l'orbe, comme dans le produit.
 *
 * Toutes les dates d'apparition sont en images locales à la scène de démo.
 */
export const DEMO_TIMES = { typeEnd: 26, think: 28, answer: 44, answerEnd: 100, tension: 104, verdict: 164 };

export const DemoPanel: React.FC<{ c: Copy }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = DEMO_TIMES;
  const speaking = interpolate(frame, [T.think, T.think + 10, T.answerEnd, T.answerEnd + 20], [0, 1, 1, 0], clamp);
  const question = typed(c.demo.question, frame, 2, T.typeEnd);

  return (
    <div
      style={{
        position: "relative",
        width: 920,
        borderRadius: 48,
        background: C.panel,
        padding: 48,
        overflow: "hidden",
        boxShadow: "0 60px 140px -40px rgba(0,0,0,0.9)",
        border: `2px solid ${C.line}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 180,
          opacity: speaking,
          background:
            "radial-gradient(60% 100% at 30% 0%, rgba(58,168,255,0.35) 0%, rgba(58,168,255,0) 70%), radial-gradient(50% 100% at 72% 0%, rgba(255,215,154,0.28) 0%, rgba(255,215,154,0) 72%)",
        }}
      />

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 22 }}>
        <Orb size={60} intensity={speaking * 0.6} />
        <div>
          <div style={{ fontFamily: SANS, fontSize: 40, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
            {c.demo.header}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)" }}>
            {c.demo.project}
          </div>
        </div>
      </div>
      <div style={{ height: 2, background: C.line, margin: "30px 0 34px" }} />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Bubble
          text={question}
          tone="founder"
          size={38}
          caret={frame < T.typeEnd + 4}
          style={{ maxWidth: 700, opacity: frame < 2 ? 0 : 1 }}
        />
      </div>

      <div style={{ display: "flex", gap: 24, marginTop: 36, minHeight: 300 }}>
        <div style={{ flexShrink: 0, opacity: frame >= T.think ? 1 : 0 }}>
          <Orb size={76} intensity={speaking} />
        </div>
        <div style={{ flex: 1 }}>
          {frame >= T.think && frame < T.answer && <Dots frame={frame} size={16} />}
          {frame >= T.answer && (
            <div style={{ fontFamily: SANS, fontSize: 39, lineHeight: 1.42, fontWeight: 500, color: "rgba(255,255,255,0.86)" }}>
              {typed(c.demo.answer, frame, T.answer, T.answerEnd)}
            </div>
          )}
        </div>
      </div>

      {/* Les cartes n'existent qu'à partir de leur apparition. Présentes mais
          invisibles, elles réservaient leur place et le panneau affichait un
          grand vide noir sous la réponse — le fil doit grandir, pas attendre. */}
      {frame >= T.tension && (
        <div style={{ marginTop: 30 }}>
          <Card label={c.demo.tensionLabel} text={c.demo.tension} tone="signal" size={44} progress={pop(frame, fps, T.tension)} />
        </div>
      )}
      {frame >= T.verdict && (
        <div style={{ marginTop: 22 }}>
          <Card label={c.demo.verdictLabel} text={c.demo.verdict} tone="azure" size={44} progress={pop(frame, fps, T.verdict)} />
        </div>
      )}
    </div>
  );
};
