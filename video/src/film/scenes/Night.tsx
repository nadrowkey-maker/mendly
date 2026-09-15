import { MONO } from "../../theme";
import { Bokeh } from "../components/Bokeh";
import { BlurText } from "../components/BlurText";
import { useShotFrame } from "../components/Shot";
import { Node, Space } from "../components/Space";
import type { FilmCopy } from "../copy";
import { GLIDE, range, track } from "../ease";
import { LOOK } from "../look";

/**
 * Mesure 0 — la nuit.
 *
 * Aucun produit, aucun logo : une heure et une phrase. La caméra avance
 * lentement dans le noir, et les points de lumière qui glissent disent qu'on
 * est dans une pièce, pas devant un écran titre.
 */
export const Night: React.FC<{ copy: FilmCopy }> = ({ copy }) => {
  const f = useShotFrame();
  const world = {
    z: track(f, [[-8, -260], [71, 140]]),
    ry: track(f, [[-8, 7], [71, -3]]),
    rx: track(f, [[-8, -3], [71, 1]]),
  };
  const clock = range(f, 0, 22, 0, 1, GLIDE);

  return (
    <Space world={world}>
      <Bokeh color="rgba(90,160,255,0.9)" count={18} />
      <Node width={1000} height={80} y={-150} z={40} opacity={clock}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 44,
            letterSpacing: "0.3em",
            color: LOOK.glow,
            textAlign: "center",
            filter: clock < 0.98 ? `blur(${(1 - clock) * 10}px)` : undefined,
          }}
        >
          {copy.clock}
        </div>
      </Node>
      <Node width={1000} height={130} y={0}>
        <BlurText text={copy.night.text} start={10} size={92} weight={500} color="#F4F6FA" stagger={4} />
      </Node>
    </Space>
  );
};
