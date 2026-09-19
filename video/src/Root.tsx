import { Composition } from "remotion";
import { Film } from "./film/Film";
import { FPS, TOTAL } from "./film/timing";
import { Mark, OgCard } from "./social/Social";
import { H, W } from "./theme";

/**
 * Deux compositions, une par langue, sur le même montage.
 *
 * 1080 × 1920 à 30 images par seconde : le format natif TikTok, Reels et
 * Shorts. Un seul fichier source sert les trois plateformes.
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="MendlyAd-FR"
      component={Film}
      durationInFrames={TOTAL}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ locale: "fr" as const }}
    />
    <Composition
      id="MendlyAd-EN"
      component={Film}
      durationInFrames={TOTAL}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ locale: "en" as const }}
    />
    {/* Images fixes du site : rendues par `npm run social`, jamais animées. */}
    <Composition
      id="OgCard"
      component={OgCard}
      durationInFrames={1}
      fps={FPS}
      width={1200}
      height={630}
      defaultProps={{ locale: "fr" as const }}
    />
    <Composition id="Mark" component={Mark} durationInFrames={1} fps={FPS} width={512} height={512} />
  </>
);
