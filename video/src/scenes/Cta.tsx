import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Copy } from "../copy";
import { C, MONO, SANS, clamp } from "../theme";
import { pop } from "../utils";
import { Scene } from "../components/Motion";
import { GradientField } from "../components/GradientField";
import { Orb } from "../components/Orb";
import { Ribbon } from "../components/Ribbon";
import { Words } from "../components/Words";

/**
 * L'appel à l'action — une phrase, un bouton, une adresse.
 *
 * Le décor revient à celui de la page d'accueil : papier, ruban, orbe. Celui
 * qui clique doit arriver sur un site qu'il reconnaît. Le bouton est pressé à
 * l'écran — un appel à l'action qu'on voit utilisé se lit comme un geste à
 * reproduire, pas comme une formule.
 *
 * Tout reste au-dessus des 20 % du bas, où TikTok pose sa propre légende et
 * son bouton publicitaire.
 */
export const Cta: React.FC<{ c: Copy }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const orbIn = pop(frame, fps, 0, { damping: 12, stiffness: 160 });
  const buttonIn = pop(frame, fps, 30, { damping: 11, stiffness: 220 });
  const press = interpolate(frame, [58, 62, 70], [1, 0.93, 1], clamp);
  const ripple = interpolate(frame, [62, 84], [0, 1], clamp);
  const tail = interpolate(frame, [40, 50], [0, 1], clamp);

  return (
    <Scene duration={108} background={C.paper} push={0.03}>
      <GradientField way="paper" intensity={1} />

      <div style={{ position: "absolute", top: 1330, left: -120 }}>
        <Ribbon width={1320} height={560} speed={1.4} />
      </div>

      <AbsoluteFill style={{ alignItems: "center" }}>
        <div style={{ position: "absolute", top: 250, transform: `scale(${orbIn})` }}>
          <Orb size={250} intensity={interpolate(frame, [0, 30], [1, 0.45], clamp)} />
        </div>

        <Words
          text={c.cta.line}
          delay={6}
          stagger={3}
          style={{
            position: "absolute",
            top: 600,
            textAlign: "center",
            fontSize: 134,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            color: C.ink,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 990,
            opacity: buttonIn,
            transform: `translateY(${(1 - buttonIn) * 60}px) scale(${press})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -ripple * 60,
              borderRadius: 999,
              border: `4px solid rgba(14,14,15,${0.35 * (1 - ripple)})`,
            }}
          />
          <div
            style={{
              fontFamily: SANS,
              fontSize: 58,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#fff",
              background: C.ink,
              borderRadius: 999,
              padding: "34px 74px",
              boxShadow: "0 30px 70px -30px rgba(14,14,15,0.6)",
            }}
          >
            {c.cta.button}
          </div>
        </div>

        <div style={{ position: "absolute", top: 1180, textAlign: "center", opacity: tail }}>
          <div style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: C.ink }}>{c.cta.url}</div>
          <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 24, letterSpacing: "0.14em", color: C.inkSoft }}>
            {c.cta.sub}
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
