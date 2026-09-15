import { Audio, interpolate, Sequence, staticFile } from "remotion";
import type { FilmCopy, Locale } from "../copy";
import { FPS, TOTAL } from "../timing";
import { filmCues } from "./cues";

/**
 * La bande-son du film : la musique, la voix si elle existe, les sons.
 *
 * La musique est un morceau sous licence déposé dans public/audio/ — ignoré
 * par git, le dépôt est public. Le montage entier est calé sur sa grille de
 * mesures : il doit commencer à 0 s, sans décalage.
 *
 * La voix off est optionnelle. Tant qu'aucun fichier n'est renseigné dans
 * VOICE, le film tient seul sur la musique, comme la référence. Quand une
 * voix est là, la musique descend pour lui laisser la place.
 */
const MUSIC_FILE = "audio/zone.mp3";

const VOICE: Record<Locale, string | null> = {
  fr: null,
  en: null,
};

const CUE_WINDOW = 4 * FPS;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const FilmSound: React.FC<{ copy: FilmCopy; locale: Locale }> = ({ copy, locale }) => {
  const voice = VOICE[locale];
  const gain = voice ? 0.55 : 0.9;

  return (
    <>
      <Audio src={staticFile(MUSIC_FILE)} volume={(f) => gain * interpolate(f, [0, 3, TOTAL - 50, TOTAL - 1], [0, 1, 1, 0], clamp)} />
      {voice && <Audio src={staticFile(voice)} />}
      {filmCues(copy).map((cue, i) => (
        <Sequence key={`${cue.sfx}-${cue.at}-${i}`} from={cue.at} durationInFrames={CUE_WINDOW} layout="none">
          <Audio src={staticFile(`sfx-film/${cue.sfx}.wav`)} volume={cue.volume} />
        </Sequence>
      ))}
    </>
  );
};
