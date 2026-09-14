import { Composition } from "remotion";
import { Ad, AD_DURATION } from "./Ad";
import { FPS, H, W } from "./theme";

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
      component={Ad}
      durationInFrames={AD_DURATION}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ locale: "fr" }}
    />
    <Composition
      id="MendlyAd-EN"
      component={Ad}
      durationInFrames={AD_DURATION}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ locale: "en" }}
    />
  </>
);
