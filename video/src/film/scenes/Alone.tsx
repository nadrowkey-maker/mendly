import { BlurText } from "../components/BlurText";
import { Bokeh } from "../components/Bokeh";
import { useShotFrame } from "../components/Shot";
import { Node, Space } from "../components/Space";
import type { FilmCopy } from "../copy";
import { track } from "../ease";

/**
 * Mesure 12 — la phrase qui reste.
 *
 * La musique retombe, l'image aussi : plus d'écran, plus de verre, seulement
 * la phrase et une lumière derrière elle. La caméra avance très lentement ;
 * c'est le seul plan du film où rien d'autre ne bouge.
 */
export const Alone: React.FC<{ copy: FilmCopy }> = ({ copy }) => {
  const f = useShotFrame();
  const world = {
    z: track(f, [[-8, -120], [71, 150]]),
    rx: track(f, [[-8, 4], [71, -1]]),
  };
  const glow = track(f, [[-8, 0], [20, 0.9], [71, 1]]);

  return (
    <Space world={world}>
      <Bokeh color="rgba(143,212,255,0.9)" count={12} opacity={0.7} />
      <Node width={1300} height={1300} z={-400} opacity={glow}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(58,168,255,0.35) 0%, rgba(201,212,255,0.25) 35%, transparent 68%)",
            filter: "blur(20px)",
          }}
        />
      </Node>
      <Node width={1040} height={260}>
        <BlurText text={copy.alone.text} accent={copy.alone.accent} start={2} size={104} weight={600} stagger={5} />
      </Node>
    </Space>
  );
};
