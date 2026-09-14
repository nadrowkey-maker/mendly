import { AbsoluteFill, Sequence } from "remotion";
import { COPY, type Locale } from "./copy";
import { C } from "./theme";
import { Flash } from "./components/Motion";
import { Grain } from "./components/Grain";
import { Hook } from "./scenes/Hook";
import { Problem } from "./scenes/Problem";
import { Reveal } from "./scenes/Reveal";
import { Demo } from "./scenes/Demo";
import { Room } from "./scenes/Room";
import { Night } from "./scenes/Night";
import { Benefits } from "./scenes/Benefits";
import { Cta } from "./scenes/Cta";

/**
 * Le montage.
 *
 * 27,7 secondes, dans la fourchette où les publicités In-Feed TikTok gardent
 * leur taux de visionnage complet tout en laissant le temps de démontrer. Aucun
 * plan ne dure plus de trois secondes sans qu'un élément change à l'écran.
 *
 * Chaque coupe est franche et marquée d'un éclair bref : sur un fil qu'on fait
 * défiler, le fondu enchaîné ralentit, la coupe relance.
 */
const TIMELINE = [
  { name: "Accroche", from: 0, duration: 72, Scene: Hook },
  { name: "Problème", from: 72, duration: 132, Scene: Problem },
  { name: "Révélation", from: 204, duration: 78, Scene: Reveal },
  { name: "Démo", from: 282, duration: 240, Scene: Demo },
  { name: "Salle de réunion", from: 522, duration: 68, Scene: Room },
  { name: "Nuit", from: 590, duration: 60, Scene: Night },
  { name: "Récap", from: 650, duration: 72, Scene: Benefits },
  { name: "Appel", from: 722, duration: 108, Scene: Cta },
] as const;

export const AD_DURATION = 830;

export type AdProps = { locale: Locale };

export const Ad: React.FC<AdProps> = ({ locale }) => {
  const c = COPY[locale];

  return (
    <AbsoluteFill style={{ background: C.shell }}>
      {TIMELINE.map(({ name, from, duration, Scene }) => (
        <Sequence key={name} name={name} from={from} durationInFrames={duration}>
          <Scene c={c} />
        </Sequence>
      ))}

      {TIMELINE.slice(1).map(({ name, from }) => (
        <Flash key={name} at={from} />
      ))}

      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
