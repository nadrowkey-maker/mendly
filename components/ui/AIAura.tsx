"use client";

/**
 * AIAura — the signature "the AI is present / speaking" element.
 * A calm, premium multicolor aurora: a slowly rotating conic ring of
 * violet → blue → teal → pink, with a soft breathing field inside.
 * No neon, no red/orange. Quiet until it matters.
 *
 * Uses global keyframes `aurora-rotate` and `aurora-breathe` (globals.css).
 */
interface AIAuraProps {
  /** Diameter in px. */
  size?: number;
  /** Seconds for one full rotation (lower = faster). */
  speed?: number;
  /** 0–1 master opacity. */
  opacity?: number;
  /** Extra ring thickness (px). */
  thickness?: number;
  className?: string;
}

const VIOLET = "167, 139, 250";
const BLUE = "91, 157, 255";
const TEAL = "52, 216, 180";
const PINK = "244, 114, 182";

export function AIAura({
  size = 520,
  speed = 14,
  opacity = 1,
  thickness = 0,
  className = "",
}: AIAuraProps) {
  const ringBlur = size * 0.04 + thickness;

  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      style={{ width: size, height: size, position: "absolute" }}
      aria-hidden
    >
      {/* Rotating conic ring — the multicolor aurora */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `conic-gradient(from 0deg,
            rgba(${VIOLET}, ${0.7 * opacity}),
            rgba(${BLUE}, ${0.6 * opacity}),
            rgba(${TEAL}, ${0.5 * opacity}),
            rgba(${PINK}, ${0.6 * opacity}),
            rgba(${VIOLET}, ${0.7 * opacity}))`,
          filter: `blur(${ringBlur}px)`,
          WebkitMaskImage:
            "radial-gradient(closest-side, transparent 54%, black 64%, black 86%, transparent 99%)",
          maskImage:
            "radial-gradient(closest-side, transparent 54%, black 64%, black 86%, transparent 99%)",
          animation: `aurora-rotate ${speed}s linear infinite`,
        }}
      />

      {/* Counter-rotating softer ring for depth */}
      <div
        style={{
          position: "absolute",
          inset: size * 0.05,
          borderRadius: "50%",
          background: `conic-gradient(from 140deg,
            rgba(${BLUE}, ${0.4 * opacity}),
            rgba(${TEAL}, ${0.3 * opacity}),
            rgba(${PINK}, ${0.35 * opacity}),
            rgba(${VIOLET}, ${0.4 * opacity}),
            rgba(${BLUE}, ${0.4 * opacity}))`,
          filter: `blur(${ringBlur * 1.6}px)`,
          WebkitMaskImage:
            "radial-gradient(closest-side, transparent 50%, black 62%, black 84%, transparent 98%)",
          maskImage:
            "radial-gradient(closest-side, transparent 50%, black 62%, black 84%, transparent 98%)",
          animation: `aurora-rotate ${speed * 1.7}s linear infinite reverse`,
        }}
      />

      {/* Breathing inner glow */}
      <div
        style={{
          position: "absolute",
          inset: "22%",
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center,
            rgba(${VIOLET}, ${0.16 * opacity}) 0%,
            rgba(${BLUE}, ${0.08 * opacity}) 48%,
            transparent 74%)`,
          filter: `blur(${size * 0.06}px)`,
          animation: `aurora-breathe ${speed * 0.6}s ease-in-out infinite`,
        }}
      />
    </div>
  );
}
