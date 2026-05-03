"use client";

import { useEffect, useRef } from "react";

const STAR_COLORS = [
  [139, 92, 246],   // violet
  [167, 139, 250],  // light violet
  [6, 182, 212],    // cyan
  [240, 171, 252],  // fuchsia
  [255, 255, 255],  // white
];

const CONNECT_DIST = 130;
const MOUSE_AURORA_RADIUS = 280;
const STAR_COUNT_DIVISOR = 7000;
const MAX_STARS = 160;

interface Star {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  color: number[];
  alpha: number;
  alphaDir: number;
  alphaSpeed: number;
}

function spawnStar(w: number, h: number): Star {
  const colorIdx = Math.random() < 0.55 ? 4 : Math.floor(Math.random() * 4);
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    radius: Math.random() * 1.4 + 0.3,
    color: STAR_COLORS[colorIdx],
    alpha: Math.random() * 0.6 + 0.1,
    alphaDir: Math.random() > 0.5 ? 1 : -1,
    alphaSpeed: Math.random() * 0.002 + 0.0005,
  };
}

export function TeamConstellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const mouse = { x: W / 2, y: H / 2, active: false };
    const count = Math.min(MAX_STARS, Math.floor((W * H) / STAR_COUNT_DIVISOR));
    const stars: Star[] = Array.from({ length: count }, () => spawnStar(W, H));

    let raf: number;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);

      // ── Mouse aurora glow ──
      if (mouse.active) {
        const aur = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_AURORA_RADIUS);
        aur.addColorStop(0, "rgba(139,92,246,0.12)");
        aur.addColorStop(0.4, "rgba(6,182,212,0.07)");
        aur.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = aur;
        ctx.fillRect(0, 0, W, H);
      }

      // ── Connections ──
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const sa = stars[i], sb = stars[j];
          const dx = sa.x - sb.x, dy = sa.y - sb.y;
          const dSq = dx * dx + dy * dy;
          if (dSq > CONNECT_DIST * CONNECT_DIST) continue;

          const dist = Math.sqrt(dSq);
          const baseAlpha = (1 - dist / CONNECT_DIST) * 0.28;

          // Boost connection alpha near mouse
          let alpha = baseAlpha;
          if (mouse.active) {
            const mxA = (sa.x + sb.x) / 2 - mouse.x;
            const myA = (sa.y + sb.y) / 2 - mouse.y;
            const mDist = Math.sqrt(mxA * mxA + myA * myA);
            if (mDist < MOUSE_AURORA_RADIUS) {
              alpha += (1 - mDist / MOUSE_AURORA_RADIUS) * 0.45;
            }
          }

          const [ra, ga, ba] = sa.color;
          const [rb, gb, bb] = sb.color;
          const grd = ctx.createLinearGradient(sa.x, sa.y, sb.x, sb.y);
          grd.addColorStop(0, `rgba(${ra},${ga},${ba},${Math.min(alpha, 0.85).toFixed(3)})`);
          grd.addColorStop(1, `rgba(${rb},${gb},${bb},${Math.min(alpha, 0.85).toFixed(3)})`);
          ctx.beginPath();
          ctx.moveTo(sa.x, sa.y);
          ctx.lineTo(sb.x, sb.y);
          ctx.strokeStyle = grd;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // ── Stars ──
      for (const s of stars) {
        s.x += s.vx; s.y += s.vy;
        s.alpha += s.alphaDir * s.alphaSpeed;
        if (s.alpha > 0.75) s.alphaDir = -1;
        if (s.alpha < 0.06) s.alphaDir = 1;

        if (s.x < -10) s.x = W + 10;
        if (s.x > W + 10) s.x = -10;
        if (s.y < -10) s.y = H + 10;
        if (s.y > H + 10) s.y = -10;

        // Boost brightness near mouse
        let drawAlpha = s.alpha;
        let drawRadius = s.radius;
        if (mouse.active) {
          const mdx = s.x - mouse.x, mdy = s.y - mouse.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < MOUSE_AURORA_RADIUS) {
            const boost = (1 - mDist / MOUSE_AURORA_RADIUS) * 0.6;
            drawAlpha = Math.min(drawAlpha + boost, 1);
            drawRadius = s.radius + boost * 1.5;
          }
        }

        const [r, g, b] = s.color;
        // Glow halo
        const glowR = drawRadius * 5;
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
        grd.addColorStop(0, `rgba(${r},${g},${b},${(drawAlpha * 0.4).toFixed(3)})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath(); ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();

        // Core
        ctx.beginPath(); ctx.arc(s.x, s.y, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(drawAlpha * 1.6, 1).toFixed(3)})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    tick();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onMouseLeave = () => { mouse.active = false; };
    const onResize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W; canvas.height = H;
    };

    const section = canvas.closest("section");
    const target = section ?? window;
    target.addEventListener("mousemove", onMouseMove as EventListener);
    target.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("mousemove", onMouseMove as EventListener);
      target.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-80"
      aria-hidden
    />
  );
}
