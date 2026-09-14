import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Copy } from "../copy";
import { C, MONO, SAFE, SANS, clamp } from "../theme";
import { pop } from "../utils";
import { Scene } from "../components/Motion";
import { GradientField } from "../components/GradientField";
import { Words } from "../components/Words";

/**
 * La nuit — l'horloge tourne, le journal s'écrit.
 *
 * Une promesse comme « il travaille pendant que tu dors » ne se croit pas, elle
 * se voit : trois heures du matin, quatre lignes horodatées, huit minutes du
 * signal au verdict. L'ambre est ici celui de la rangée « travail nocturne »
 * de la page d'accueil.
 */
export const Night: React.FC<{ c: Copy }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const minute = 4 + Math.floor(interpolate(frame, [4, 38], [0, 8.99], clamp));
  const clock = `03:${String(minute).padStart(2, "0")}`;
  const fill = interpolate(frame, [8, 44], [0, 100], clamp);

  return (
    <Scene duration={60} background={C.shell} push={0.05}>
      <GradientField way="ink" intensity={1} />
      <div
        style={{
          position: "absolute",
          top: 420,
          left: 140,
          width: 800,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,180,84,0.28) 0%, rgba(255,180,84,0) 65%)",
        }}
      />

      <Words
        text={c.night.caption}
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
          color: "#fff",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 520,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 250,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: "#fff",
        }}
      >
        {clock}
      </div>

      <div style={{ position: "absolute", top: 860, left: 80, width: 920 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontFamily: MONO, fontSize: 26, letterSpacing: "0.2em", textTransform: "uppercase", color: C.signal }}>
            {c.night.label}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", border: "2px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "8px 20px" }}>
            {c.night.badge}
          </span>
        </div>

        {c.night.log.map((entry, i) => {
          const s = pop(frame, fps, 6 + i * 8, { damping: 13, stiffness: 240 });
          return (
            <div
              key={entry.time}
              style={{
                display: "flex",
                gap: 28,
                alignItems: "baseline",
                padding: "22px 0",
                borderTop: i === 0 ? "none" : `2px solid ${C.line}`,
                opacity: s,
                transform: `translateX(${(1 - s) * 60}px)`,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 34, color: C.signal }}>{entry.time}</span>
              <span style={{ fontFamily: SANS, fontSize: 40, fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>{entry.text}</span>
            </div>
          );
        })}

        <div style={{ marginTop: 22, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <div style={{ width: `${fill}%`, height: "100%", background: C.signal }} />
        </div>
      </div>
    </Scene>
  );
};
