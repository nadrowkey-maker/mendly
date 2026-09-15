import { Orb } from "../../components/Orb";
import { MONO, SANS } from "../../theme";
import { BlurText } from "../components/BlurText";
import { useShotFrame } from "../components/Shot";
import { Node, Space } from "../components/Space";
import type { FilmCopy } from "../copy";
import { GLIDE, range, track } from "../ease";
import { LOOK } from "../look";

/**
 * Mesures 13–14 — la signature.
 *
 * L'orbe, le nom, la promesse, un seul bouton et l'adresse. Deux mesures
 * entières : c'est l'image sur laquelle on décide de cliquer, elle doit
 * rester assez longtemps pour qu'on la lise sans se presser.
 */
export const PILL_AT = 34;

export const EndCard: React.FC<{ copy: FilmCopy }> = ({ copy }) => {
  const f = useShotFrame();
  const orb = range(f, 0, 30, 0, 1, GLIDE);
  const pill = range(f, PILL_AT, PILL_AT + 22, 0, 1, GLIDE);
  const url = range(f, 44, 64, 0, 1, GLIDE);
  const world = { z: track(f, [[-8, -140], [134, 70]]), rx: track(f, [[-8, 5], [134, 0]]) };

  return (
    <Space world={world}>
      <Node width={320} height={320} y={-330} scale={0.6 + orb * 0.4} opacity={orb}>
        <div style={{ filter: orb < 0.98 ? `blur(${(1 - orb) * 24}px)` : undefined }}>
          <Orb size={320} intensity={track(f, [[0, 0.8], [40, 0.3]])} />
        </div>
      </Node>
      <Node width={1000} height={170} y={-40}>
        <BlurText text="mendly" start={8} size={150} weight={600} stagger={0} style={{ letterSpacing: "-0.05em" }} />
      </Node>
      <Node width={1000} height={80} y={125}>
        <BlurText text={copy.tagline} start={20} size={46} weight={500} color={LOOK.inkSoft} stagger={2} />
      </Node>
      <Node width={1000} height={130} y={305} z={-(1 - pill) * 200} opacity={pill}>
        <div style={{ display: "flex", justifyContent: "center", filter: pill < 0.98 ? `blur(${(1 - pill) * 12}px)` : undefined }}>
          <div
            style={{
              padding: "34px 70px",
              borderRadius: 80,
              background: LOOK.ink,
              color: "#F4F6FA",
              fontFamily: SANS,
              fontSize: 44,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              boxShadow: "0 30px 60px -24px rgba(29,111,189,0.6), inset 0 1.5px 0 rgba(255,255,255,0.2)",
            }}
          >
            {copy.cta}
          </div>
        </div>
      </Node>
      <Node width={1000} height={60} y={445} opacity={url}>
        <div style={{ fontFamily: MONO, fontSize: 32, letterSpacing: "0.12em", color: LOOK.inkSoft, textAlign: "center" }}>
          {copy.url}
        </div>
      </Node>
    </Space>
  );
};
