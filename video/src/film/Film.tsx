import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Grain } from "../components/Grain";
import { Backdrop } from "./components/Backdrop";
import { Shot } from "./components/Shot";
import { FILM_COPY, type Locale } from "./copy";
import { track } from "./ease";
import { Alone } from "./scenes/Alone";
import { Ask } from "./scenes/Ask";
import { Awaken } from "./scenes/Awaken";
import { Contest } from "./scenes/Contest";
import { Council } from "./scenes/Council";
import { Echo } from "./scenes/Echo";
import { EndCard } from "./scenes/EndCard";
import { Night } from "./scenes/Night";
import { Team } from "./scenes/Team";
import { FilmSound } from "./sound/FilmSound";
import { bar, BAR, SHOT } from "./timing";

/**
 * Le film : quinze mesures de « Zone », un plan par phrase.
 *
 * La lumière raconte autant que le texte : nuit tant que le fondateur est
 * seul, jour dès que Mendly apparaît — la bascule se fait sur la dernière
 * demi-mesure de l'intro, pour que le jour arrive avec le décollage.
 */
export const Film: React.FC<{ locale: Locale }> = ({ locale }) => {
  const frame = useCurrentFrame();
  const copy = FILM_COPY[locale];
  const night = track(frame, [[0, 1], [bar(SHOT.awaken) - 26, 1], [bar(SHOT.awaken) + 4, 0]]);

  return (
    <AbsoluteFill>
      <Backdrop night={night} />
      <Shot from={bar(SHOT.night)} duration={BAR}>
        <Night copy={copy} />
      </Shot>
      <Shot from={bar(SHOT.ask)} duration={BAR}>
        <Ask copy={copy} />
      </Shot>
      <Shot from={bar(SHOT.echo)} duration={BAR * 2}>
        <Echo copy={copy} />
      </Shot>
      <Shot from={bar(SHOT.awaken)} duration={BAR}>
        <Awaken copy={copy} />
      </Shot>
      <Shot from={bar(SHOT.contest)} duration={BAR * 2}>
        <Contest copy={copy} locale={locale} />
      </Shot>
      <Shot from={bar(SHOT.council)} duration={BAR * 4}>
        <Council copy={copy} locale={locale} />
      </Shot>
      <Shot from={bar(SHOT.team)} duration={BAR}>
        <Team copy={copy} locale={locale} />
      </Shot>
      <Shot from={bar(SHOT.alone)} duration={BAR}>
        <Alone copy={copy} />
      </Shot>
      <Shot from={bar(SHOT.end)} duration={BAR * 2 + 20}>
        <EndCard copy={copy} />
      </Shot>
      <Grain opacity={0.05} />
      <FilmSound copy={copy} locale={locale} />
    </AbsoluteFill>
  );
};
