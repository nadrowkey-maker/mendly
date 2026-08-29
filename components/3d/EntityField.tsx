"use client";

import { useEffect, useRef } from "react";

/**
 * L'entité — le champ de particules qui suit le fondateur sur toute la page.
 *
 * Une seule structure, plusieurs états. Les mêmes points se réorganisent selon
 * la section survolée : rien n'apparaît, rien ne disparaît, la chose se
 * transforme. C'est ce qui la fait lire comme un être plutôt que comme une
 * suite d'illustrations.
 *
 * Calculée en canvas, jamais imitée en CSS : un dégradé qui essaie de rendre
 * ça se repère immédiatement, et c'est précisément le marqueur du template IA
 * que le produit doit fuir.
 *
 * Pour changer d'état, une section pose `data-entity-shape="2"` sur elle-même.
 */

const SHAPES = 6;

/** Fraction du cycle consacrée à l'étalement des départs entre particules. */
const STAGGER = 0.45;

/** Avancement du fondu par image. Plus bas = transformation plus longue. */
const BLEND_SPEED = 0.0075;

/** Taille du lutin lumineux pré-rendu, en pixels. */
const SPRITE = 24;

type Vec = Float32Array;

/** Densité adaptée à l'écran : un mobile ne doit pas calculer autant qu'un 27". */
function particleCount(width: number): number {
  if (width < 640) return 1800;
  if (width < 1280) return 3000;
  return 4200;
}

function buildShapes(count: number): Vec[] {
  const buf: Vec[] = [];
  for (let s = 0; s < SHAPES; s++) buf.push(new Float32Array(count * 3));

  const rings = 60;
  const per = Math.ceil(count / rings);
  const PHI = Math.PI * (1 + Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const o = i * 3;
    const ri = Math.floor(i / per);
    const pi = i % per;
    const u = (ri / rings) * Math.PI * 2;
    const v = (pi / per) * Math.PI * 2;

    // Répartition en spirale d'or : une sphère sans pôles surchargés.
    const ga = Math.acos(1 - (2 * (i + 0.5)) / count);
    const gb = PHI * i;

    // 0 — tore (hero)
    const R = 1.0;
    const r0 = 0.4;
    buf[0][o] = (R + r0 * Math.cos(v)) * Math.cos(u);
    buf[0][o + 1] = (R + r0 * Math.cos(v)) * Math.sin(u);
    buf[0][o + 2] = r0 * Math.sin(v);

    // 1 — sphère
    buf[1][o] = Math.sin(ga) * Math.cos(gb) * 1.15;
    buf[1][o + 1] = Math.sin(ga) * Math.sin(gb) * 1.15;
    buf[1][o + 2] = Math.cos(ga) * 1.15;

    // 2 — nappe ondulante
    const gx = (pi / per - 0.5) * 2.9;
    const gy = (ri / rings - 0.5) * 2.9;
    buf[2][o] = gx;
    buf[2][o + 1] = gy;
    buf[2][o + 2] = Math.sin(gx * 2.2) * Math.cos(gy * 2.0) * 0.34;

    // 3 — double hélice
    const hp = i / count;
    const ha = hp * Math.PI * 2 * 5.5;
    const side = i % 2 ? 1 : -1;
    buf[3][o] = Math.cos(ha) * 0.55 * side;
    buf[3][o + 1] = (hp - 0.5) * 2.7;
    buf[3][o + 2] = Math.sin(ha) * 0.55 * side;

    // 4 — anneaux concentriques
    const band = ri % 5;
    const rad = 0.35 + band * 0.22;
    buf[4][o] = Math.cos(v) * rad;
    buf[4][o + 1] = Math.sin(v) * rad;
    buf[4][o + 2] = (ri / rings - 0.5) * 0.5;

    // 5 — nuage contracté
    const rr = 0.35 + ((i % 97) / 97) * 0.85;
    buf[5][o] = Math.sin(ga) * Math.cos(gb) * rr;
    buf[5][o + 1] = Math.sin(ga) * Math.sin(gb) * rr;
    buf[5][o + 2] = Math.cos(ga) * rr;
  }
  return buf;
}

/**
 * Le lutin lumineux, dessiné une seule fois.
 *
 * Un halo radial recalculé pour chacune des milliers de particules à chaque
 * image écroulerait la fréquence d'affichage. On le rend une fois hors écran,
 * puis on ne fait que le recopier.
 */
function buildSprite(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = SPRITE;
  c.height = SPRITE;
  const g = c.getContext("2d");
  if (g) {
    const half = SPRITE / 2;
    const grad = g.createRadialGradient(half, half, 0, half, half, half);
    // Cœur presque blanc, halo azur : c'est ce dégradé qui fait lire un point
    // comme une lumière plutôt que comme une pastille de couleur.
    grad.addColorStop(0, "rgba(255,255,255,0.95)");
    grad.addColorStop(0.18, "rgba(190,230,255,0.62)");
    grad.addColorStop(0.45, "rgba(90,180,255,0.22)");
    grad.addColorStop(1, "rgba(58,168,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, SPRITE, SPRITE);
  }
  return c;
}

/** Smootherstep : dérivées nulles aux deux bouts, donc aucun à-coup perceptible. */
function smootherstep(x: number): number {
  const t = x < 0 ? 0 : x > 1 ? 1 : x;
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function EntityField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const sprite = buildSprite();

    let count = particleCount(window.innerWidth);
    let shapes = buildShapes(count);
    let cur = new Float32Array(count * 3);
    cur.set(shapes[0]);

    let width = 0;
    let height = 0;
    let time = 0;
    let from = 0;
    let target = 0;
    let blend = 1;
    let raf = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const next = particleCount(width);
      if (next !== count) {
        count = next;
        shapes = buildShapes(count);
        cur = new Float32Array(count * 3);
        cur.set(shapes[target]);
        blend = 1;
        from = target;
      }
    };

    const pickShape = () => {
      let best = 0;
      let closest = Number.POSITIVE_INFINITY;
      document.querySelectorAll<HTMLElement>("[data-entity-shape]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.55 && rect.bottom > 0) {
          if (Math.abs(rect.top) < closest) {
            closest = Math.abs(rect.top);
            best = Number(el.dataset.entityShape ?? 0);
          }
        }
      });
      if (window.scrollY < window.innerHeight * 0.5) best = 0;
      if (best !== target) {
        from = target;
        target = best;
        blend = 0;
      }
    };

    const frame = () => {
      if (blend < 1) blend = Math.min(1, blend + BLEND_SPEED);

      const a = shapes[from];
      const b = shapes[target];
      const span = 1 - STAGGER;

      ctx.clearRect(0, 0, width, height);
      // Mélange additif : là où les points se superposent, la lumière
      // s'accumule. C'est ce qui donne les zones incandescentes de la référence
      // au lieu d'un aplat uniforme.
      ctx.globalCompositeOperation = "lighter";

      const cx = width * 0.5;
      const cy = height * 0.47;
      const scale = Math.min(width, height) * 0.46;
      const ax = -0.55 + Math.sin(time * 0.15) * 0.08;
      const ay = time * 0.1;
      const ca = Math.cos(ax);
      const sa = Math.sin(ax);
      const cb = Math.cos(ay);
      const sb = Math.sin(ay);

      for (let i = 0; i < count; i++) {
        const o = i * 3;

        // Chaque particule démarre un peu après la précédente : la
        // transformation se propage en vague à travers la structure plutôt que
        // de basculer d'un bloc. C'est ça qui rend le changement doux, bien
        // plus qu'un simple ralentissement.
        const e = smootherstep((blend - (i / count) * STAGGER) / span);

        const x = a[o] + (b[o] - a[o]) * e;
        const y = a[o + 1] + (b[o + 1] - a[o + 1]) * e;
        const z = a[o + 2] + (b[o + 2] - a[o + 2]) * e;
        cur[o] = x;
        cur[o + 1] = y;
        cur[o + 2] = z;

        const y1 = y * ca - z * sa;
        const z1 = y * sa + z * ca;
        const x1 = x * cb - z1 * sb;
        const z2 = x * sb + z1 * cb;

        const persp = 2.7 / (2.7 + z2);
        const depth = (z2 + 1.6) / 3.2;
        const alpha = 0.5 - depth * 0.42;
        if (alpha <= 0.015) continue;

        const s = Math.max(1.5, 5.2 * persp);
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          sprite,
          cx + x1 * scale * persp - s / 2,
          cy + y1 * scale * persp - s / 2,
          s,
          s
        );
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      if (!reduce) time += 0.005;
    };

    const loop = () => {
      frame();
      raf = requestAnimationFrame(loop);
    };

    resize();
    pickShape();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", pickShape, { passive: true });

    if (reduce) frame();
    else loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", pickShape);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 z-0 h-full w-full" />
      {/* Voile : garde le texte lisible par-dessus l'entité sans l'éteindre. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(140%_80%_at_50%_30%,transparent_0%,rgba(0,0,0,0.45)_55%,rgba(0,0,0,0.86)_100%)]"
      />
    </>
  );
}
