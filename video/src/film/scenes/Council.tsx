import { MONO, SANS } from "../../theme";
import { Caption } from "../components/Caption";
import { Glass } from "../components/Glass";
import { useShotFrame } from "../components/Shot";
import { Node, Screen, Space } from "../components/Space";
import type { FilmCopy, Locale } from "../copy";
import { GLIDE, LEAVE, range, track } from "../ease";
import { ACCENT_GRADIENT, LOOK } from "../look";

/**
 * Mesures 7–10 — le débat, en volume.
 *
 * Il commence dans le vrai produit : la capture de la salle de réunion, que
 * la caméra parcourt. Puis l'écran recule hors foyer et le débat en sort :
 * les trois spécialistes se lèvent, et chaque prise de parole arrive des
 * profondeurs en repoussant la précédente vers l'arrière. On voit la
 * discussion avancer dans l'espace, pas défiler dans une liste.
 *
 * Une prise de parole toutes les deux temps, le verdict sur le premier temps
 * de la dernière mesure : il a toute une mesure pour être lu.
 */
export const POD_AT = [40, 46, 52] as const;
export const SPEECH_AT = [63, 95, 126, 158] as const;
export const VERDICT_AT = 189;

const NEWEST_Y = 120;
const STEP_Y = 250;
const STEP_Z = 210;

export const Council: React.FC<{ copy: FilmCopy; locale: Locale }> = ({ copy, locale }) => {
  const f = useShotFrame();
  const back = range(f, 34, 64);
  const verdict = range(f, VERDICT_AT, VERDICT_AT + 24, 0, 1, GLIDE);
  const podsOut = range(f, VERDICT_AT - 4, VERDICT_AT + 16, 0, 1, LEAVE);

  let speaker = -1;
  SPEECH_AT.forEach((at, i) => {
    if (f >= at && f < VERDICT_AT) speaker = copy.debate[i].role;
  });

  const world = {
    ry: track(f, [[-8, -7], [130, 6], [260, -2]]),
    rx: track(f, [[-8, 5], [260, 1]]),
    z: track(f, [[-8, 0], [260, 90]]),
  };

  return (
    <>
      <Space>
        <Screen
          src={`product/${locale}/debate.png`}
          width={1000}
          height={1300}
          radius={48}
          x={back * 220}
          y={track(f, [[-8, 140], [10, 40]])}
          z={track(f, [[-8, -500], [18, 0], [34, 0], [64, -1300]])}
          rx={track(f, [[-8, 16], [34, 3], [64, 8]])}
          ry={track(f, [[-8, -12], [34, -4], [64, 26]])}
          blur={back * 9}
          opacity={1 - back * 0.1 - verdict * 0.2}
          pan={{ u: 0.61, v: track(f, [[-8, 0.34], [40, 0.46], [260, 0.52]]), zoom: 1.5 }}
        />
      </Space>

      <Space world={world}>
        {copy.roles.map((role, i) => {
          const p = range(f, POD_AT[i], POD_AT[i] + 20, 0, 1, GLIDE);
          const active = speaker === i ? 1 : 0;
          const lit = range(f, 0, 1) * active;
          return (
            <Node
              key={role}
              width={290}
              height={100}
              x={(i - 1) * 310}
              y={-420 + (1 - p) * 160 - lit * 12}
              z={-(1 - p) * 300 - podsOut * 300}
              scale={1 + lit * 0.06}
              opacity={p * (1 - podsOut)}
            >
              <Glass
                radius={50}
                glow={0.4 + lit}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "0 22px",
                  border: lit ? `2px solid ${LOOK.azure}` : undefined,
                  boxShadow: lit ? `0 0 50px rgba(58,168,255,0.55), inset 0 1.5px 0 rgba(255,255,255,0.95)` : undefined,
                }}
              >
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: "50%",
                    background: lit ? ACCENT_GRADIENT : LOOK.ink,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: MONO,
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {role}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", color: LOOK.ink }}>
                  {copy.roleNames[i]}
                </div>
              </Glass>
            </Node>
          );
        })}

        {copy.debate.map((speech, i) => {
          const p = range(f, SPEECH_AT[i], SPEECH_AT[i] + 20, 0, 1, GLIDE);
          let k = 0;
          for (let j = i + 1; j < SPEECH_AT.length; j++) k += range(f, SPEECH_AT[j], SPEECH_AT[j] + 20, 0, 1, GLIDE);
          k += verdict * 2.2;
          // Deux prises de parole visibles au plus : la troisième passerait
          // derrière les spécialistes.
          const fade = Math.max(0, Math.min(1, 2 - k));
          return (
            <Node
              key={i}
              width={900}
              height={220}
              y={NEWEST_Y - k * STEP_Y + (1 - p) * 120}
              z={-k * STEP_Z - (1 - p) * 520}
              opacity={p * fade}
            >
              <div style={{ filter: `blur(${(1 - p) * 14 + k * 2.2}px)` }}>
                <Glass radius={38} glow={0.7} style={{ width: 900, padding: "28px 38px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                    <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, letterSpacing: "0.16em", color: LOOK.inkSoft }}>
                      {copy.roles[speech.role]}
                    </div>
                    {speech.changed && (
                      <div
                        style={{
                          fontFamily: SANS,
                          fontSize: 22,
                          fontWeight: 600,
                          color: LOOK.deep,
                          padding: "5px 16px",
                          borderRadius: 30,
                          border: `1.5px solid ${LOOK.azure}`,
                          background: "rgba(58,168,255,0.12)",
                        }}
                      >
                        ↻ {copy.changedMind}
                      </div>
                    )}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 40, fontWeight: 500, lineHeight: 1.2, letterSpacing: "-0.02em", color: LOOK.ink }}>
                    {speech.text}
                  </div>
                </Glass>
              </div>
            </Node>
          );
        })}

        <Node width={940} height={430} y={80} z={60 - (1 - verdict) * 600} ry={(1 - verdict) * 12} opacity={verdict}>
          <div style={{ filter: verdict < 0.98 ? `blur(${(1 - verdict) * 18}px)` : undefined }}>
            <Glass radius={48} glow={1.4} style={{ width: 940, padding: "44px 50px", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 5, background: ACCENT_GRADIENT }} />
              <div
                style={{
                  position: "absolute",
                  right: -160,
                  top: -160,
                  width: 480,
                  height: 480,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(58,168,255,0.28) 0%, transparent 70%)",
                }}
              />
              <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: LOOK.deep, marginBottom: 20 }}>
                {copy.verdictLabel}
              </div>
              <div style={{ position: "relative", fontFamily: SANS, fontSize: 50, fontWeight: 600, lineHeight: 1.16, letterSpacing: "-0.03em", color: LOOK.ink }}>
                {copy.verdict}
              </div>
            </Glass>
          </div>
        </Node>
      </Space>

      <Caption line={copy.debated} start={4} end={176} y={-660} size={66} />
    </>
  );
};
