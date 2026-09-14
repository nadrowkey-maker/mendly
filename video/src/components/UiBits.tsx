import type { CSSProperties } from "react";
import { C, MONO, SANS } from "../theme";
import { rgba } from "../utils";

/**
 * Les pièces d'interface reprises de l'atelier, agrandies pour le vertical.
 *
 * Bulles et cartes suivent le dessin du produit — mêmes arrondis, mêmes
 * étiquettes en capitales mono, même ambre pour la contradiction — mais à une
 * taille lisible sur un téléphone tenu à bout de bras, sans le son.
 */

interface BubbleProps {
  text: string;
  tone: "founder" | "ai";
  size?: number;
  caret?: boolean;
  style?: CSSProperties;
}

export const Bubble: React.FC<BubbleProps> = ({ text, tone, size = 40, caret, style }) => (
  <div
    style={{
      display: "inline-block",
      padding: `${size * 0.5}px ${size * 0.72}px`,
      borderRadius: size * 1.05,
      fontFamily: SANS,
      fontSize: size,
      lineHeight: 1.28,
      fontWeight: 600,
      letterSpacing: "-0.01em",
      background: tone === "founder" ? "rgba(255,255,255,0.11)" : "#ffffff",
      color: tone === "founder" ? "#ffffff" : C.ink,
      boxShadow: "0 24px 60px -24px rgba(0,0,0,0.7)",
      ...style,
    }}
  >
    {text}
    {caret && <span style={{ opacity: 0.6, marginLeft: 2 }}>|</span>}
  </div>
);

interface CardProps {
  label: string;
  text: string;
  tone: "signal" | "azure" | "plain";
  /** Progression d'apparition, 0 à 1 (un ressort). */
  progress: number;
  size?: number;
  from?: "below" | "left" | "right";
}

const TINT = { signal: C.signal, azure: C.glow, plain: "#9AA4AE" } as const;

export const Card: React.FC<CardProps> = ({ label, text, tone, progress, size = 40, from = "below" }) => {
  const tint = TINT[tone];
  const offset = (1 - progress) * 60;
  const transform =
    from === "left"
      ? `translateX(${-offset * 2}px)`
      : from === "right"
        ? `translateX(${offset * 2}px)`
        : `translateY(${offset}px) scale(${0.94 + 0.06 * progress})`;

  return (
    <div
      style={{
        opacity: Math.min(1, progress * 1.4),
        transform,
        padding: `${size * 0.6}px ${size * 0.7}px`,
        borderRadius: size * 0.7,
        border: `2px solid ${tone === "plain" ? "transparent" : rgba(tint, 0.42)}`,
        background: tone === "plain" ? "rgba(255,255,255,0.06)" : rgba(tint, 0.12),
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: size * 0.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: tint,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: size * 0.3,
          fontFamily: SANS,
          fontSize: size,
          lineHeight: 1.22,
          fontWeight: 700,
          letterSpacing: "-0.015em",
          color: "#ffffff",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Les trois points d'attente avant le premier mot. */
export const Dots: React.FC<{ frame: number; size?: number }> = ({ frame, size = 14 }) => (
  <div style={{ display: "flex", gap: size * 0.7, padding: `${size}px 0` }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: C.glow,
          opacity: 0.35 + 0.65 * Math.max(0, Math.sin((frame - i * 4) * 0.35)),
          transform: `translateY(${-Math.max(0, Math.sin((frame - i * 4) * 0.35)) * size * 0.5}px)`,
        }}
      />
    ))}
  </div>
);
