import { Orb } from "../../components/Orb";
import { BlurText } from "../components/BlurText";
import { Bokeh } from "../components/Bokeh";
import { useShotFrame } from "../components/Shot";
import { Node, Space } from "../components/Space";
import type { FilmCopy } from "../copy";
import { GLIDE, range, track } from "../ease";

/**
 * Mesure 4 — l'orbe s'éveille, sur le temps fort où la musique décolle.
 *
 * Une onde de lumière part de l'orbe au moment exact de l'impact, puis tout
 * se pose. Pas de secousse, pas de flash blanc : la puissance vient de la
 * lumière qui s'ouvre et de la caméra qui avance, pas d'une vibration.
 */
export const Awaken: React.FC<{ copy: FilmCopy }> = ({ copy }) => {
  const f = useShotFrame();
  const born = range(f, 0, 26, 0, 1, GLIDE);
  const wave = range(f, 0, 40, 0, 1, GLIDE);
  const intensity = track(f, [[0, 1], [30, 0.45], [71, 0.35]]);

  const world = {
    z: track(f, [[-8, -200], [71, 160]]),
    rx: track(f, [[-8, 8], [71, -2]]),
    ry: track(f, [[-8, -4], [71, 4]]),
  };

  return (
    <Space world={world}>
      <Bokeh color="rgba(143,212,255,0.9)" count={14} opacity={0.8} />
      <Node width={1400} height={1400} y={-80} z={-120} opacity={(1 - wave) * 0.9}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            transform: `scale(${0.2 + wave * 1.1})`,
            border: "3px solid rgba(255,255,255,0.9)",
            boxShadow: "0 0 80px rgba(143,212,255,0.8), inset 0 0 80px rgba(143,212,255,0.6)",
          }}
        />
      </Node>
      <Node width={540} height={540} y={-80} scale={0.35 + born * 0.65} opacity={born}>
        <div style={{ filter: born < 0.98 ? `blur(${(1 - born) * 30}px)` : undefined }}>
          <Orb size={540} intensity={intensity} />
        </div>
      </Node>
      <Node width={1000} height={140} y={340} z={80}>
        <BlurText text={copy.meet.text} accent={copy.meet.accent} start={14} size={112} weight={600} stagger={5} />
      </Node>
    </Space>
  );
};
