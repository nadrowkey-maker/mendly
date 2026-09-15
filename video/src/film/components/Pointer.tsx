import { useCurrentFrame } from "remotion";
import { GLIDE, range } from "../ease";

/**
 * Le pointeur : une bille de verre, pas une flèche système.
 *
 * Une flèche de navigateur ramène la publicité à une capture d'écran filmée.
 * Une bille translucide qui s'enfonce au clic et laisse une onde se lit comme
 * un geste — c'est la main du fondateur, pas le curseur de sa machine.
 */
interface PointerProps {
  x: number;
  y: number;
  /** Image du clic ; absent, pas de clic. */
  pressAt?: number;
  opacity?: number;
}

export const Pointer: React.FC<PointerProps> = ({ x, y, pressAt, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const press = pressAt === undefined ? 0 : range(frame, pressAt - 3, pressAt, 0, 1) - range(frame, pressAt + 2, pressAt + 10, 0, 1);
  const wave = pressAt === undefined ? 0 : range(frame, pressAt, pressAt + 22, 0, 1, GLIDE);
  const size = 46;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity }}>
      {pressAt !== undefined && frame >= pressAt && (
        <div
          style={{
            position: "absolute",
            width: size * (1 + wave * 2.4),
            height: size * (1 + wave * 2.4),
            left: -(size * (1 + wave * 2.4)) / 2,
            top: -(size * (1 + wave * 2.4)) / 2,
            borderRadius: "50%",
            border: `2px solid rgba(255,255,255,${0.7 * (1 - wave)})`,
            boxShadow: `0 0 30px rgba(143,212,255,${0.5 * (1 - wave)})`,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          width: size,
          height: size,
          left: -size / 2,
          top: -size / 2,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(10px)",
          border: "2px solid rgba(255,255,255,0.95)",
          boxShadow: "0 10px 30px -8px rgba(10,24,48,0.45)",
          transform: `scale(${1 - press * 0.22})`,
        }}
      />
    </div>
  );
};
