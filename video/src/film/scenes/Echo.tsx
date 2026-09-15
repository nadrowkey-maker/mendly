import { SANS } from "../../theme";
import { BlurText } from "../components/BlurText";
import { Bokeh } from "../components/Bokeh";
import { useShotFrame } from "../components/Shot";
import { Node, Space } from "../components/Space";
import type { FilmCopy } from "../copy";
import { GLIDE, range, track } from "../ease";

/**
 * Mesures 2–3 — l'IA qui dit oui, et le silence qui suit.
 *
 * Les réponses complaisantes arrivent une par une, grises, sans visage. La
 * caméra tourne lentement autour d'elles. Puis elles reculent dans le flou et
 * il ne reste qu'une phrase : personne ne te contredit. C'est la fin de
 * l'intro calme ; la lumière revient au temps suivant, avec la musique.
 */
export const REPLY_AT = [0, 15, 30] as const;

const SLOTS = [
  { x: -110, y: -300, z: 0, ry: 8 },
  { x: 90, y: -90, z: -90, ry: -6 },
  { x: -60, y: 120, z: -180, ry: 5 },
];

export const Echo: React.FC<{ copy: FilmCopy }> = ({ copy }) => {
  const f = useShotFrame();
  const recede = range(f, 60, 96);

  const world = {
    ry: track(f, [[-8, -14], [126, 12]]),
    rx: track(f, [[-8, 6], [126, -2]]),
    z: track(f, [[-8, -120], [63, 40], [126, -260]]),
  };

  return (
    <Space world={world}>
      <Bokeh color="rgba(90,160,255,0.9)" count={16} />
      {copy.replies.map((reply, i) => {
        const p = range(f, REPLY_AT[i], REPLY_AT[i] + 20, 0, 1, GLIDE);
        const s = SLOTS[i];
        return (
          <Node
            key={i}
            width={900}
            height={130}
            x={s.x}
            y={s.y}
            z={s.z - (1 - p) * 500 - recede * 700}
            ry={s.ry}
            opacity={p * (1 - recede * 0.85)}
          >
            <div style={{ display: "flex", justifyContent: "center", filter: `blur(${(1 - p) * 16 + recede * 10}px)` }}>
              <div
                style={{
                  padding: "30px 46px",
                  borderRadius: 60,
                  background: "rgba(60,64,74,0.55)",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.12), 0 30px 60px -30px rgba(0,0,0,0.8)",
                  fontFamily: SANS,
                  fontSize: 44,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  color: "rgba(244,246,250,0.78)",
                  whiteSpace: "nowrap",
                }}
              >
                {reply}
              </div>
            </div>
          </Node>
        );
      })}
      <Node width={1000} height={130} y={420} z={60}>
        <BlurText text={copy.yes.text} accent={copy.yes.accent} start={34} end={56} size={80} weight={600} color="#F4F6FA" />
      </Node>
      <Node width={1000} height={220} y={0} z={200}>
        <BlurText text={copy.nobody.text} accent={copy.nobody.accent} start={70} end={112} size={92} weight={600} color="#F4F6FA" stagger={4} />
      </Node>
    </Space>
  );
};
