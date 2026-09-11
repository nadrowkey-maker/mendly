"use client";

import { useEffect, useRef } from "react";

/**
 * Le ruban — la grande onde qui traverse le haut de la page d'accueil.
 *
 * La première version empilait six mèches épaisses et floues. Le résultat
 * était plat : six formes qui se recouvrent restent six formes, et aucune
 * quantité de flou n'en fait de la matière.
 *
 * Celle-ci traite le ruban comme ce qu'il est — une bande, pas un paquet de
 * traits. On parcourt sa largeur en quarante-huit fils, chacun décalé
 * PERPENDICULAIREMENT à la trajectoire, et on teinte le fil selon sa position
 * dans la bande. Deux conséquences, et ce sont elles qui font la soie :
 *
 * — la bande se pince là où elle se présente de profil, ce qui se lit comme
 *   une vrille ;
 * — la couleur balaie l'or vers le bleu à travers la largeur, donc la lumière
 *   semble tourner avec la matière.
 *
 * L'épaisseur s'annule aux deux extrémités. Un ruban coupé net au bord se lit
 * comme une image tronquée ; un ruban qui s'affine jusqu'à disparaître se lit
 * comme un geste.
 */

interface RibbonProps {
  className?: string;
  /** Coupe l'animation. */
  animate?: boolean;
}

/**
 * La teinte à travers la largeur de la bande.
 *
 * Or d'un bord, azur de l'autre, crème au passage — les deux couleurs du
 * produit et rien d'autre. Une troisième famille ferait un arc-en-ciel, qui
 * est précisément la signature du fond génératif générique.
 */
const RAMP: [number, [number, number, number]][] = [
  [0.00, [255, 180, 84]],   // ambre
  [0.22, [255, 215, 154]],  // ambre clair
  [0.42, [255, 243, 221]],  // crème
  [0.58, [223, 233, 244]],  // bleu très pâle
  [0.78, [143, 212, 255]],  // azur clair
  [1.00, [58, 148, 235]],   // azur
];

function sample(v: number): [number, number, number] {
  for (let i = 1; i < RAMP.length; i++) {
    const [p1, c1] = RAMP[i - 1];
    const [p2, c2] = RAMP[i];
    if (v <= p2) {
      const k = (v - p1) / (p2 - p1);
      return [
        c1[0] + (c2[0] - c1[0]) * k,
        c1[1] + (c2[1] - c1[1]) * k,
        c1[2] + (c2[2] - c1[2]) * k,
      ];
    }
  }
  return RAMP[RAMP.length - 1][1];
}

/** Nombre de fils à travers la largeur du ruban. */
const THREADS = 48;
/** Points échantillonnés le long du ruban. */
const STEPS = 96;

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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.round(rect.width * dpr * 0.6);
      h = Math.round(rect.height * dpr * 0.6);
      canvas.width = w;
      canvas.height = h;
      return true;
    };

    /** La trajectoire de la bande et sa demi-largeur, au paramètre u. */
    const path = (u: number, t: number) => {
      const x = u * w;
      // Deux harmoniques : une seule sinusoïde donne une vague de piscine.
      const y =
        h * 0.5 +
        Math.sin(u * Math.PI * 2.4 + t) * h * 0.30 +
        Math.sin(u * Math.PI * 4.6 + t * 1.31) * h * 0.12;
      // La demi-largeur se pince deux fois le long du parcours : c'est ce
      // pincement qu'on lit comme un ruban qui se retourne.
      const twist = 0.30 + 0.70 * Math.abs(Math.sin(u * Math.PI * 2.1 + t * 0.7));
      const half = Math.sin(u * Math.PI) * h * 0.34 * twist;
      return { x, y, half, twist };
    };

    const paint = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      const t = time * 0.00016;

      // Un léger flou de contexte fond les fils entre eux. Sans lui on voit
      // quarante-huit traits ; avec, on voit une surface.
      ctx.filter = `blur(${Math.max(1.5, h * 0.012)}px)`;
      ctx.lineCap = "round";

      for (let n = 0; n < THREADS; n++) {
        const v = n / (THREADS - 1);
        const [r, g, b] = sample(v);

        ctx.beginPath();
        let alpha = 0;

        for (let i = 0; i <= STEPS; i++) {
          const u = i / STEPS;
          const p = path(u, t);

          // La normale à la trajectoire, obtenue par différence finie. Décaler
          // les fils verticalement plutôt que perpendiculairement écraserait la
          // bande à chaque virage — elle cesserait d'avoir une épaisseur.
          const q = path(Math.min(1, u + 0.004), t);
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;

          const off = (v - 0.5) * 2 * p.half;
          const px = p.x + nx * off;
          const py = p.y + ny * off;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);

          // On retient l'opacité du milieu du parcours : un fil a une seule
          // couleur de trait, autant qu'elle corresponde à sa partie visible.
          if (i === STEPS / 2) alpha = p.twist;
        }

        // Les bords de la bande s'estompent : une arête nette ferait un ruban
        // découpé aux ciseaux.
        const edge = Math.sin(v * Math.PI) ** 0.55;
        ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${0.78 * edge * alpha})`;
        ctx.lineWidth = Math.max(1, (h * 0.62) / THREADS);
        ctx.stroke();
      }

      ctx.filter = "none";
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const moving = animate && !reduced;

    let frame = 0;
    let last = 0;
    const loop = (now: number) => {
      if (now - last > 33) {
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
