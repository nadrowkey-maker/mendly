import { CameraMotionBlur } from "@remotion/motion-blur";
import { Caption } from "../components/Caption";
import { useShotFrame } from "../components/Shot";
import { Screen, Space } from "../components/Space";
import type { FilmCopy, Locale } from "../copy";
import { range, track } from "../ease";

/**
 * Mesure 11 — tout le produit, en un travelling.
 *
 * Les écrans réels sont rangés en couloir dans la profondeur et la caméra le
 * traverse d'un seul mouvement, avec un vrai flou de bougé (plusieurs rendus
 * par image). C'est le dernier temps fort de la musique : l'ampleur du
 * produit, montrée par la vitesse plutôt que par une énumération.
 */
const SCREENS = [
  { file: "dashboard", w: 1300, h: 812 },
  { file: "phone-debate", w: 520, h: 1125 },
  { file: "workspace", w: 1300, h: 812 },
  { file: "room", w: 1300, h: 812 },
  { file: "phone-chat", w: 520, h: 1125 },
  { file: "intake", w: 1300, h: 812 },
];

const GAP = 950;

const Corridor: React.FC<{ locale: Locale }> = ({ locale }) => {
  const f = useShotFrame();
  const travel = track(f, [[-8, 0], [71, GAP * SCREENS.length + 400]], (t) => t);

  return (
    <Space perspective={1800}>
      {SCREENS.map((s, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const z = -700 - i * GAP + travel;
        const opacity = range(z, -5200, -3600) * (1 - range(z, 900, 1500));
        return (
          <Screen
            key={s.file}
            src={`product/${locale}/${s.file}.png`}
            width={s.w}
            height={s.h}
            radius={s.w > 600 ? 36 : 56}
            x={side * (s.w > 600 ? 380 : 300)}
            y={(i % 3 - 1) * 180}
            z={z}
            ry={side * -30}
            rx={4}
            opacity={opacity}
          />
        );
      })}
    </Space>
  );
};

export const Team: React.FC<{ copy: FilmCopy; locale: Locale }> = ({ copy, locale }) => (
  <>
    <CameraMotionBlur shutterAngle={200} samples={6}>
      <Corridor locale={locale} />
    </CameraMotionBlur>
    <Caption line={copy.team} start={4} end={56} y={0} size={70} />
  </>
);
