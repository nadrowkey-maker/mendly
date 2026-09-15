import type { CSSProperties, ReactNode } from "react";

/**
 * Le verre dépoli.
 *
 * Trois couches font la différence entre du verre et un rectangle
 * transparent : le flou de ce qui est derrière, un liseré blanc sur l'arête
 * haute (la lumière qui accroche), et un halo coloré très diffus en dessous.
 * Sans le liseré, la surface se lit comme une ombre grise.
 */
interface GlassProps {
  children?: ReactNode;
  tone?: "light" | "dark";
  radius?: number;
  /** Intensité du halo coloré sous la surface, 0 à 1. */
  glow?: number;
  style?: CSSProperties;
}

export const Glass: React.FC<GlassProps> = ({ children, tone = "light", radius = 36, glow = 0.6, style }) => {
  const light = tone === "light";
  return (
    <div
      style={{
        position: "relative",
        borderRadius: radius,
        // Le flou d'arrière-plan ne s'applique pas dans un volume 3D : sur un
        // écran sombre, un blanc à 58 % sortait gris. Le verre est donc un
        // blanc presque plein, dégradé vers le bas, et c'est le liseré qui
        // le fait lire comme du verre.
        background: light
          ? "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(243,246,252,0.88) 100%)"
          : "rgba(20,22,28,0.62)",
        backdropFilter: "blur(28px) saturate(160%)",
        border: `1.5px solid ${light ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.12)"}`,
        boxShadow: [
          `0 40px 90px -40px rgba(29,111,189,${0.45 * glow})`,
          `0 12px 30px -18px rgba(10,20,40,${light ? 0.18 : 0.6})`,
          `inset 0 1.5px 0 ${light ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.16)"}`,
        ].join(", "),
        ...style,
      }}
    >
      {children}
    </div>
  );
};
