import { AbsoluteFill, Sequence } from "remotion";
import { COPY, type Locale } from "./copy";
import { C } from "./theme";
import { AD_DURATION, SCENE_START as S } from "./timeline";
import { Flash } from "./components/Motion";
import { Grain } from "./components/Grain";
import { Soundtrack } from "./audio/Soundtrack";
import { Hook } from "./scenes/Hook";
import { Problem } from "./scenes/Problem";
import { Reveal } from "./scenes/Reveal";
import { Demo } from "./scenes/Demo";
import { Room } from "./scenes/Room";
import { Night } from "./scenes/Night";
import { Benefits } from "./scenes/Benefits";
import { Cta } from "./scenes/Cta";

export { AD_DURATION };

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
  { name: "Accroche", from: S.hook, to: S.problem, Scene: Hook },
  { name: "Problème", from: S.problem, to: S.reveal, Scene: Problem },
  { name: "Révélation", from: S.reveal, to: S.demo, Scene: Reveal },
  { name: "Démo", from: S.demo, to: S.room, Scene: Demo },
  { name: "Salle de réunion", from: S.room, to: S.night, Scene: Room },
  { name: "Nuit", from: S.night, to: S.benefits, Scene: Night },
  { name: "Récap", from: S.benefits, to: S.cta, Scene: Benefits },
  { name: "Appel", from: S.cta, to: AD_DURATION, Scene: Cta },
] as const;

export type AdProps = { locale: Locale };

export const Ad: React.FC<AdProps> = ({ locale }) => {
  const c = COPY[locale];

  return (
    <AbsoluteFill style={{ background: C.shell }}>
      {TIMELINE.map(({ name, from, to, Scene }) => (
        <Sequence key={name} name={name} from={from} durationInFrames={to - from}>
          <Scene c={c} />
        </Sequence>
      ))}

      {TIMELINE.slice(1).map(({ name, from }) => (
        <Flash key={name} at={from} />
      ))}

      <Grain opacity={0.05} />
      <Soundtrack duration={AD_DURATION} />
    </AbsoluteFill>
  );
};
