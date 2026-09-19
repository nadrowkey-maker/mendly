import { AbsoluteFill } from "remotion";
import { Orb } from "../components/Orb";
import { Backdrop } from "../film/components/Backdrop";
import { FILM_COPY, type Locale } from "../film/copy";
import { LOOK } from "../film/look";
import { MONO, SANS } from "../theme";

/**
 * Les images fixes de la marque : partage social et icônes.
 *
 * Elles sortent du même moteur que le film, avec le même orbe et la même
 * lumière. Une vignette de partage dessinée ailleurs finit toujours par
 * dériver de la charte — et c'est la première image que voit quelqu'un à qui
 * on envoie le lien.
 */
export const OgCard: React.FC<{ locale: Locale }> = ({ locale }) => {
  const copy = FILM_COPY[locale];

  return (
    <AbsoluteFill>
      <Backdrop night={0} />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 86px", gap: 60 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 112,
              fontWeight: 600,
              letterSpacing: "-0.05em",
              color: LOOK.ink,
              lineHeight: 1,
            }}
          >
            mendly
          </div>
          <div
            style={{
              marginTop: 26,
              fontFamily: SANS,
              fontSize: 42,
              fontWeight: 500,
              letterSpacing: "-0.025em",
              lineHeight: 1.22,
              color: LOOK.inkSoft,
              maxWidth: 620,
            }}
          >
            {copy.tagline}
          </div>
          <div
            style={{
              marginTop: 44,
              fontFamily: MONO,
              fontSize: 26,
              letterSpacing: "0.14em",
              color: LOOK.deep,
            }}
          >
            {copy.url}
          </div>
        </div>
        <Orb size={330} intensity={0.55} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** L'icône : l'orbe seul, avec l'air qu'il faut autour. */
export const Mark: React.FC = () => (
  <AbsoluteFill style={{ background: LOOK.mist, alignItems: "center", justifyContent: "center" }}>
    <Orb size={368} intensity={0.55} />
  </AbsoluteFill>
);
