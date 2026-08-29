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
 * RENDU EN DEUX PASSES
 * Un halo dessiné particule par particule ne produit pas une lueur : il produit
 * des points flous, isolés les uns des autres. La lumière de la référence vient
 * d'un bloom global — on dessine d'abord tous les points nets sur un tampon
 * réduit, on étale ce tampon au flou, puis on le recompose en additif sous les
 * points nets. Les zones denses s'embrasent, les zones clairsemées restent
 * discrètes, et le coût reste celui d'un seul flou par image.
 *
 * Pour changer d'état, une section pose `data-entity-shape="2"` sur elle-même.
 */

const SHAPES = 6;

/** Fraction du cycle consacrée à l'étalement des départs entre particules. */
const STAGGER = 0.45;

/** Avancement du fondu par image. Plus bas = transformation plus longue. */
const BLEND_SPEED = 0.0075;

/** Rangées de la trame. Beaucoup de points par rangée = tirets continus. */
const RINGS = 96;

/** Le tampon de bloom est rendu à cette fraction de la résolution écran. */
const BLOOM_SCALE = 0.32;

type Vec = Float32Array;

/**
 * Densité. Bien plus haute qu'avant : c'était la cause première du rendu
 * clairsemé. La référence tire son aspect de rangées SERRÉES, pas de points
 * lumineux isolés. Les points sont dessinés en fillRect, assez bon marché pour
 * en assumer des dizaines de milliers.
 */
function particleCount(width: number): number {
  if (width < 640) return 6000;
  if (width < 1280) return 11000;
  return 17000;
}

function buildShapes(count: number): Vec[] {
  const buf: Vec[] = [];
  for (let s = 0; s < SHAPES; s++) buf.push(new Float32Array(count * 3));

  const per = Math.ceil(count / RINGS);
  const PHI = Math.PI * (1 + Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const o = i * 3;
    const ri = Math.floor(i / per);
    const pi = i % per;
    const u = (ri / RINGS) * Math.PI * 2;
    const v = (pi / per) * Math.PI * 2;

    // 0 — sphère en rangées de latitude (état du hero).
    // Construite anneau par anneau, et non en spirale d'or : ce sont ces
    // rangées visibles qui donnent la trame de la référence.
    const lat = (ri / (RINGS - 1)) * Math.PI;
    const sinLat = Math.sin(lat);
    buf[0][o] = sinLat * Math.cos(v) * 1.25;
    buf[0][o + 1] = Math.cos(lat) * 1.25;
    buf[0][o + 2] = sinLat * Math.sin(v) * 1.25;

    // 1 — tore
    const R = 0.95;
    const r0 = 0.42;
    buf[1][o] = (R + r0 * Math.cos(v)) * Math.cos(u);
    buf[1][o + 1] = (R + r0 * Math.cos(v)) * Math.sin(u);
    buf[1][o + 2] = r0 * Math.sin(v);

    // 2 — nappe ondulante
    const gx = (pi / per - 0.5) * 3.1;
    const gy = (ri / RINGS - 0.5) * 3.1;
    buf[2][o] = gx;
    buf[2][o + 1] = gy;
    buf[2][o + 2] = Math.sin(gx * 2.2) * Math.cos(gy * 2.0) * 0.36;

    // 3 — double hélice
    const hp = i / count;
    const ha = hp * Math.PI * 2 * 6;
    const side = i % 2 ? 1 : -1;
    buf[3][o] = Math.cos(ha) * 0.6 * side;
    buf[3][o + 1] = (hp - 0.5) * 2.8;
    buf[3][o + 2] = Math.sin(ha) * 0.6 * side;

    // 4 — anneaux concentriques
    const band = ri % 6;
    const rad = 0.32 + band * 0.2;
    buf[4][o] = Math.cos(v) * rad;
    buf[4][o + 1] = Math.sin(v) * rad;
    buf[4][o + 2] = (ri / RINGS - 0.5) * 0.55;

    // 5 — nuage contracté
    const ga = Math.acos(1 - (2 * (i + 0.5)) / count);
    const gb = PHI * i;
    const rr = 0.4 + ((i % 89) / 89) * 0.8;
    buf[5][o] = Math.sin(ga) * Math.cos(gb) * rr;
    buf[5][o + 1] = Math.sin(ga) * Math.sin(gb) * rr;
    buf[5][o + 2] = Math.cos(ga) * rr;
  }
  return buf;
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

    const bloom = document.createElement("canvas");
    const bctx = bloom.getContext("2d");
    if (!bctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let count = particleCount(window.innerWidth);
    let shapes = buildShapes(count);

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

      bloom.width = Math.max(1, Math.floor(width * BLOOM_SCALE));
      bloom.height = Math.max(1, Math.floor(height * BLOOM_SCALE));

      const next = particleCount(width);
      if (next !== count) {
        count = next;
        shapes = buildShapes(count);
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

      // Cadrage : la structure entière doit tenir à l'écran. Trop agrandie, on
      // se retrouve à l'intérieur et il ne reste que des points épars.
      const cx = width * 0.5;
      const cy = height * 0.5;
      const scale = Math.min(width, height) * 0.44;

      const ax = -0.5 + Math.sin(time * 0.15) * 0.07;
      const ay = time * 0.1;
      const ca = Math.cos(ax);
      const sa = Math.sin(ax);
      const cb = Math.cos(ay);
      const sb = Math.sin(ay);

      ctx.clearRect(0, 0, width, height);
      bctx.clearRect(0, 0, bloom.width, bloom.height);
      bctx.globalCompositeOperation = "lighter";
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < count; i++) {
        const o = i * 3;

        // Chaque particule démarre un peu après la précédente : la
        // transformation se propage en vague au lieu de basculer d'un bloc.
        const e = smootherstep((blend - (i / count) * STAGGER) / span);

        const x = a[o] + (b[o] - a[o]) * e;
        const y = a[o + 1] + (b[o + 1] - a[o + 1]) * e;
        const z = a[o + 2] + (b[o + 2] - a[o + 2]) * e;

        const y1 = y * ca - z * sa;
        const z1 = y * sa + z * ca;
        const x1 = x * cb - z1 * sb;
        const z2 = x * sb + z1 * cb;

        const persp = 2.8 / (2.8 + z2);
        const depth = (z2 + 1.5) / 3;
        const alpha = 0.92 - depth * 0.6;
        if (alpha <= 0.03) continue;

        const px = cx + x1 * scale * persp;
        const py = cy + y1 * scale * persp;
        if (px < -20 || px > width + 20 || py < -20 || py > height + 20) continue;

        // Tirets courts : la trame de la référence, pas un semis de pastilles.
        const w = Math.max(0.8, 1.35 * persp);
        const h = w * 2.4;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#eaf7ff";
        ctx.fillRect(px, py, w, h);

        // Le même point, en plus gros, sur le tampon de bloom : c'est lui qui
        // portera la lueur une fois flouté.
        bctx.globalAlpha = alpha * 0.8;
        bctx.fillStyle = "#5cc8ff";
        bctx.fillRect(
          px * BLOOM_SCALE,
          py * BLOOM_SCALE,
          Math.max(1, w * BLOOM_SCALE * 2),
          Math.max(1.4, h * BLOOM_SCALE * 2)
        );
      }

      // Recomposition : le tampon réduit est étalé au flou puis rajouté en
      // additif. Les rangées serrées s'embrasent, les zones vides restent noires.
      ctx.filter = "blur(9px)";
      ctx.globalAlpha = 1;
      ctx.drawImage(bloom, 0, 0, width, height);
      // Passe large : elle porte l'ambiance. Assez présente pour que la
      // structure baigne dans sa propre lueur, assez retenue pour ne pas
      // recouvrir le texte des sections.
      ctx.filter = "blur(40px)";
      ctx.globalAlpha = 0.5;
      ctx.drawImage(bloom, 0, 0, width, height);
      ctx.filter = "none";
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
      {/*
        Voile de lisibilité, pondéré vers le haut : le noir protège la barre de
        navigation et le titre, puis s'efface pour laisser la structure rayonner
        sur les côtés et en bas.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.5)_16%,rgba(0,0,0,0.34)_45%,rgba(0,0,0,0.6)_100%)]"
      />
    </>
  );
}
