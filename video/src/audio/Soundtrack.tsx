import { Audio, Sequence, interpolate, staticFile } from "remotion";
import { clamp, FPS } from "../theme";
import { CUES, DUCKS } from "./cues";
import { MUSIC } from "./music";

/**
 * La bande-son : la musique de fond, puis un son par événement visible.
 *
 * Chaque effet est posé dans sa propre séquence, calée sur l'image où
 * l'animation démarre. Quatre secondes de fenêtre suffisent au plus long
 * d'entre eux, queue de réverbération comprise.
 */
const CUE_WINDOW = 4 * FPS;

/** La nappe reste en retrait : elle occupe l'oreille, les effets racontent. */
const BED_GAIN = 0.4;

/**
 * Le volume de la musique, image par image.
 *
 * Entrée en 6 images, sortie sur les 24 dernières, et un creux bref sous
 * chaque coup majeur : la musique s'efface en 2 images et revient en 14.
 * C'est ce creux qui rend les impacts physiques plutôt que simplement forts.
 */
function musicVolume(frame: number, duration: number, gain: number): number {
  const edges = interpolate(frame, [0, 6, duration - 24, duration], [0, 1, 1, 0], clamp);
  let duck = 1;
  for (const at of DUCKS) {
    duck = Math.min(duck, interpolate(frame, [at - 2, at, at + 14], [1, 0.4, 1], clamp));
  }
  return gain * edges * duck;
}

interface SoundtrackProps {
  duration: number;
}

export const Soundtrack: React.FC<SoundtrackProps> = ({ duration }) => {
  // Copie locale : TypeScript ne garantit pas qu'une constante de module reste
  // non nulle à l'intérieur d'une fonction appelée plus tard (le volume).
  const bed = MUSIC;

  return (
    <>
      {/* Un morceau sous licence s'il y en a un ; sinon la nappe de synthèse,
          qui comble les silences entre les effets. Jamais les deux : deux
          harmonies superposées se contrediraient. */}
      {bed ? (
        <Audio
          src={staticFile(bed.file)}
          volume={(f) => musicVolume(f, duration, bed.gain)}
        />
      ) : (
        <Audio
          src={staticFile("sfx/bed.wav")}
          volume={(f) => musicVolume(f, duration, BED_GAIN)}
        />
      )}

      {CUES.map((cue, i) => (
        <Sequence
          key={`${cue.sfx}-${cue.at}-${i}`}
          from={cue.at}
          durationInFrames={CUE_WINDOW}
          layout="none"
        >
          <Audio src={staticFile(`sfx/${cue.sfx}.wav`)} volume={cue.volume} />
        </Sequence>
      ))}
    </>
  );
};
