import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Copy } from "../copy";
import { C, EASE_OUT, SAFE, clamp } from "../theme";
import { Scene } from "../components/Motion";
import { GradientField } from "../components/GradientField";
import { Words } from "../components/Words";
import { DEMO_TIMES, DemoPanel } from "./DemoPanel";

/**
 * La démo — le produit en marche, huit secondes.
 *
 * Trois légendes au-dessus de l'écran, une par geste : il conteste, il se
 * contredit, il tranche. La caméra suit : plein cadre pendant la réponse, puis
 * elle plonge sur la carte de contradiction, puis sur la position. Le texte
 * légende l'action ; il ne la raconte pas à la place de l'écran.
 */
const PANEL_TOP = 470;

export const Demo: React.FC<{ c: Copy }> = ({ c }) => {
  const frame = useCurrentFrame();
  const T = DEMO_TIMES;
  const keys = [0, T.answerEnd, T.tension + 10, T.verdict - 4, T.verdict + 8, 240];
  const scale = interpolate(frame, keys, [1, 1, 1.13, 1.13, 1.15, 1.15], { ...clamp, easing: EASE_OUT });
  const lift = interpolate(frame, keys, [0, 0, -300, -300, -470, -470], { ...clamp, easing: EASE_OUT });

  const captions: { text: string; from: number; to: number }[] = [
    { text: c.demo.captions[0], from: T.think - 2, to: T.tension - 6 },
    { text: c.demo.captions[1], from: T.tension, to: T.verdict - 6 },
    { text: c.demo.captions[2], from: T.verdict, to: 260 },
  ];

  return (
    <Scene duration={240} background={C.shell} push={0.02}>
      <GradientField way="dusk" intensity={0.6} />

      <div
        style={{
          position: "absolute",
          top: PANEL_TOP,
          left: 80,
          transformOrigin: "50% 0%",
          transform: `translateY(${lift}px) scale(${scale})`,
        }}
      >
        <DemoPanel c={c} />
      </div>

      <AbsoluteFill
        style={{
          // Voile plein jusqu'aux deux tiers : au zoom final, le haut du
          // panneau remonte sous la légende et le texte de la bulle se lisait
          // à travers « Il tranche. ».
          height: 660,
          background: "linear-gradient(180deg, #0A0A0B 0%, #0A0A0B 62%, rgba(10,10,11,0) 100%)",
        }}
      />

      {captions.map((cap) => (
        <Words
          key={cap.text}
          text={cap.text}
          delay={cap.from}
          stagger={3}
          exitAt={cap.to}
          style={{
            position: "absolute",
            top: SAFE.top + 20,
            left: SAFE.left,
            right: SAFE.right,
            // Une seule ligne, toujours. Sur deux lignes, la légende descend
            // sous le voile et recouvre la bulle du fondateur — c'est ce qui
            // arrivait à « It contradicts itself. ». La taille se déduit de la
            // longueur (≈ 0,44 em par caractère en Manrope 800), plafonnée.
            fontSize: Math.min(108, Math.floor(860 / (cap.text.length * 0.44))),
            fontWeight: 800,
            letterSpacing: "-0.045em",
            lineHeight: 1,
            whiteSpace: "nowrap",
            color: "#ffffff",
          }}
        />
      ))}
    </Scene>
  );
};
