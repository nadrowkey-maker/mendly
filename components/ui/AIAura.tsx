"use client";

interface AIAuraProps {
  size?: number;
  speed?: number;
  opacity?: number;
  className?: string;
  glow?: boolean;
}

export function AIAura({
  size = 800,
  speed = 7,
  opacity = 1,
  className = "",
  glow = true,
}: AIAuraProps) {
  const blur1 = size * 0.05;
  const blur2 = size * 0.07;
  const blur3 = size * 0.12;

  return (
    <div
      className={`absolute pointer-events-none select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Primary ring — breathes + spins */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          animation: `ai-orb-breathe ${speed * 1.4}s ease-in-out infinite`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `conic-gradient(
              from 0deg,
              rgba(191,90,242,${opacity * 0.65}),
              rgba(255,55,95,${opacity * 0.55}),
              rgba(255,159,10,${opacity * 0.45}),
              rgba(48,209,88,${opacity * 0.40}),
              rgba(10,132,255,${opacity * 0.60}),
              rgba(162,89,255,${opacity * 0.55}),
              rgba(191,90,242,${opacity * 0.65})
            )`,
            filter: `blur(${blur1}px)`,
            animation: `ai-spin ${speed}s linear infinite`,
            WebkitMaskImage:
              "radial-gradient(transparent 48%, black 56%, black 82%, transparent 94%)",
            maskImage:
              "radial-gradient(transparent 48%, black 56%, black 82%, transparent 94%)",
          }}
        />
      </div>

      {/* Secondary ring — counter-rotates + breathes offset */}
      <div
        style={{
          position: "absolute",
          inset: size * 0.06,
          borderRadius: "50%",
          animation: `ai-orb-breathe ${speed * 1.8}s ease-in-out infinite`,
          animationDelay: `${speed * 0.6}s`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `conic-gradient(
              from 90deg,
              rgba(10,132,255,${opacity * 0.45}),
              rgba(48,209,88,${opacity * 0.30}),
              rgba(255,159,10,${opacity * 0.35}),
              rgba(255,55,95,${opacity * 0.40}),
              rgba(191,90,242,${opacity * 0.45}),
              rgba(10,132,255,${opacity * 0.45})
            )`,
            filter: `blur(${blur2}px)`,
            animation: `ai-spin ${speed * 1.7}s linear infinite reverse`,
            WebkitMaskImage:
              "radial-gradient(transparent 46%, black 55%, black 80%, transparent 92%)",
            maskImage:
              "radial-gradient(transparent 46%, black 55%, black 80%, transparent 92%)",
          }}
        />
      </div>

      {/* Outer atmospheric haze — very slow drift, very blurred */}
      <div
        style={{
          position: "absolute",
          inset: -size * 0.10,
          borderRadius: "50%",
          background: `conic-gradient(
            from 45deg,
            rgba(191,90,242,${opacity * 0.20}),
            rgba(255,55,95,${opacity * 0.13}),
            rgba(10,132,255,${opacity * 0.18}),
            rgba(48,209,88,${opacity * 0.10}),
            rgba(191,90,242,${opacity * 0.20})
          )`,
          filter: `blur(${blur3}px)`,
          animation: `ai-spin ${speed * 3.5}s linear infinite`,
        }}
      />

      {/* Center breathing glow */}
      {glow && (
        <div
          style={{
            position: "absolute",
            inset: "18%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(191,90,242,0.14) 0%, rgba(10,132,255,0.07) 50%, transparent 75%)",
            filter: `blur(${size * 0.07}px)`,
            animation: `ai-orb-breathe ${speed * 1.1}s ease-in-out infinite`,
            animationDelay: `${speed * 0.3}s`,
          }}
        />
      )}
    </div>
  );
}
