"use client";

import { useEffect, useRef } from "react";

/**
 * Le ruban — la grande onde qui traverse le haut de la page d'accueil.
 *
 * Plusieurs mèches suivent la même sinusoïde, décalées en phase et en
 * amplitude. C'est ce léger désaccord qui produit la torsion : des mèches
 * parfaitement parallèles donnent un ruban plat, des mèches désaccordées se
 * croisent et se recouvrent, et le recouvrement fait la matière.
 *
 * L'épaisseur s'annule aux deux extrémités. Un ruban coupé net au bord de
 * l'écran se lit comme une image tronquée ; un ruban qui s'affine jusqu'à
 * disparaître se lit comme un geste.
 */

interface RibbonProps {
  className?: string;
  /** Coupe l'animation — utilisé pour les captures produit. */
  animate?: boolean;
}

/** Deux teintes seulement : l'azur du produit, l'ambre du signal. */
const STRANDS = [
  { color: "#3aa8ff", phase: 0.0, amp: 0.30, freq: 1.9, width: 0.075, alpha: 0.38, speed: 0.00013 },
  { color: "#8fd4ff", phase: 1.1, amp: 0.24, freq: 2.2, width: 0.055, alpha: 0.30, speed: 0.00017 },
  { color: "#ffb454", phase: 2.4, amp: 0.34, freq: 1.7, width: 0.095, alpha: 0.42, speed: 0.00011 },
  { color: "#ffd79a", phase: 3.6, amp: 0.27, freq: 2.4, width: 0.062, alpha: 0.34, speed: 0.00019 },
  { color: "#f7e2b0", phase: 4.9, amp: 0.20, freq: 2.8, width: 0.042, alpha: 0.36, speed: 0.00023 },
  { color: "#1d6fbd", phase: 5.7, amp: 0.16, freq: 3.1, width: 0.030, alpha: 0.24, speed: 0.00027 },
];

export function Ribbon({ className, animate = true }: RibbonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      // Demi-définition : le tracé est flou, le doubler ne se verrait pas.
      w = Math.round(rect.width / 2);
      h = Math.round(rect.height / 2);
      canvas.width = w;
      canvas.height = h;
      return true;
    };

    const paint = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      // Le flou est appliqué au contexte plutôt qu'en CSS : un filtre CSS sur
      // le canvas entier flouterait aussi ses bords, et le ruban perdrait sa
      // pointe.
      ctx.filter = `blur(${Math.max(3, h * 0.030)}px)`;
      ctx.globalCompositeOperation = "multiply";

      const steps = 90;
      for (const s of STRANDS) {
        const t = time * s.speed + s.phase;
        ctx.beginPath();

        // Bord supérieur de gauche à droite, bord inférieur au retour : une
        // seule forme fermée, donc un seul remplissage, sans couture visible.
        for (let i = 0; i <= steps; i++) {
          const p = i / steps;
          const x = p * w;
          const y = h * 0.5 + Math.sin(p * Math.PI * s.freq + t) * h * s.amp;
          // sin(pi*p) vaut zéro aux deux bouts et un au milieu : l'épaisseur
          // naît et meurt d'elle-même.
          const th = Math.sin(p * Math.PI) * h * s.width;
          if (i === 0) ctx.moveTo(x, y - th);
          else ctx.lineTo(x, y - th);
        }
        for (let i = steps; i >= 0; i--) {
          const p = i / steps;
          const x = p * w;
          const y = h * 0.5 + Math.sin(p * Math.PI * s.freq + t) * h * s.amp;
          const th = Math.sin(p * Math.PI) * h * s.width;
          ctx.lineTo(x, y + th);
        }
        ctx.closePath();

        const g = ctx.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.25, s.color);
        g.addColorStop(0.75, s.color);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = g;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";
    };

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const moving = animate && !reduced;

    let frame = 0;
    let last = 0;
    const loop = (now: number) => {
      if (now - last > 41) {
        last = now;
        paint(now);
      }
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!measure()) return;
      cancelAnimationFrame(frame);
      if (moving) frame = requestAnimationFrame(loop);
      else paint(0);
    };

    start();
    const observer = new ResizeObserver(start);
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [animate]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
