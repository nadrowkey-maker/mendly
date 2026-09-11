"use client";

import { useEffect, useRef } from "react";

/**
 * L'orbe — le visage de Mendly.
 *
 * C'est la seule représentation de l'entité dans tout le produit. Elle
 * remplace l'anneau conique multicolore et les pastilles de rôle : un conseil
 * qui parle d'une seule voix ne pouvait pas avoir huit avatars de couleurs
 * différentes, et un anneau qui tourne à vitesse constante ne dit rien de ce
 * que fait l'IA à l'instant où on la regarde.
 *
 * La matière est celle du dégradé granuleux de la vitrine, refermée sur une
 * sphère. C'est ce qui fait le lien entre la page d'accueil et l'atelier sans
 * avoir à répéter la page d'accueil.
 *
 * Deux états, et un seul chemin entre les deux :
 * — au repos, les taches dérivent lentement, la sphère respire à peine ;
 * — quand Mendly écrit, la matière s'accélère, s'éclaircit, et la surface se
 *   déforme au rythme des mots.
 *
 * L'intensité n'est jamais changée d'un coup : elle est interpolée image par
 * image. Un basculement net se lit comme un défaut d'affichage, alors que la
 * montée progressive se lit comme quelqu'un qui prend la parole.
 */

/**
 * La palette de l'orbe, exportée parce que d'autres surfaces s'y accordent —
 * le bandeau haut de l'atelier s'allume avec exactement ces teintes quand
 * Mendly écrit. Deux palettes proches mais distinctes seraient pires que deux
 * palettes franchement différentes.
 */
export const ORB_COLORS = {
  deep: "#0b2a4a",
  azure: "#3aa8ff",
  glow: "#8fd4ff",
  warm: "#ffd79a",
  white: "#ffffff",
} as const;

/**
 * Les teintes qui composent la matière, dans leur ordre de superposition.
 *
 * Le bleu profond passe en premier et reste discret. Posé en dernier et en
 * force, comme dans la première version, il recouvrait tout le reste et
 * l'orbe sortait en bille bleu marine — la matière était bien là, mais sous
 * une couche d'encre.
 */
const BLOBS = [
  { color: ORB_COLORS.deep, r: 0.50, a: 0.45, fx: 0.13, fy: 0.29, px: 3.3, py: 1.1 },
  { color: ORB_COLORS.azure, r: 0.56, a: 0.85, fx: 0.31, fy: 0.23, px: 0.0, py: 1.7 },
  { color: ORB_COLORS.glow, r: 0.52, a: 0.90, fx: 0.19, fy: 0.37, px: 2.1, py: 0.4 },
  { color: ORB_COLORS.warm, r: 0.52, a: 0.90, fx: 0.43, fy: 0.17, px: 4.0, py: 2.9 },
  { color: ORB_COLORS.white, r: 0.36, a: 0.80, fx: 0.27, fy: 0.49, px: 1.2, py: 5.1 },
];

interface MendlyOrbProps {
  /** Diamètre en pixels. */
  size?: number;
  /** Mendly est en train d'écrire. */
  speaking?: boolean;
  className?: string;
}

/** Passe une couleur hexadécimale en rgba — pour s'éteindre sur sa propre teinte. */
function rgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function MendlyOrb({ size = 72, speaking = false, className }: MendlyOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /*
   * L'état "parle" est lu dans une référence et non dans les dépendances de
   * l'effet. Le passer en dépendance relancerait toute la boucle à chaque
   * bascule : les taches sauteraient à leur position de départ au moment
   * précis où Mendly commence à répondre, ce qui est le pire moment possible.
   */
  const speakingRef = useRef(speaking);
  speakingRef.current = speaking;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const px = Math.round(size * dpr);
    canvas.width = px;
    canvas.height = px;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Intensité courante, poursuivant la cible. C'est elle qui porte toute la
    // différence entre les deux états — vitesse, amplitude, éclat, halo.
    let intensity = speaking ? 1 : 0;
    let frame = 0;
    let last = 0;

    const paint = (time: number) => {
      const c = px / 2;
      const radius = px * 0.5;

      ctx.clearRect(0, 0, px, px);
      ctx.save();

      // Tout est peint dans le disque : le détourage circulaire est ce qui
      // transforme un nuage de taches en objet.
      ctx.beginPath();
      ctx.arc(c, c, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = "#164a7d";
      ctx.fillRect(0, 0, px, px);

      // La vitesse ne double pas entre repos et parole : elle est multipliée
      // par trois. Un facteur deux passe pour une variation de cadence, pas
      // pour un changement d'état.
      const speed = reduced ? 0 : (0.00022 + intensity * 0.00055) * time;
      const swing = 0.30 + intensity * 0.16;

      for (const b of BLOBS) {
        const bx = c + Math.cos(speed / b.fx + b.px) * radius * swing;
        const by = c + Math.sin(speed / b.fy + b.py) * radius * swing;
        // Chaque tache respire sur sa propre période : des rayons synchronisés
        // feraient battre l'orbe comme un cœur, ce qui est une autre idée.
        const br = radius * b.r * (1 + Math.sin(speed / 0.21 + b.px) * 0.12);

        const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, rgba(b.color, b.a * (0.72 + intensity * 0.28)));
        g.addColorStop(1, rgba(b.color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, px, px);
      }

      // L'assombrissement du bord — le seul trait qui fait lire une sphère
      // plutôt qu'un disque. Sans lui, la matière reste à plat.
      const limb = ctx.createRadialGradient(c, c, radius * 0.60, c, c, radius);
      limb.addColorStop(0, "rgba(0,0,0,0)");
      limb.addColorStop(1, "rgba(4,14,28,0.48)");
      ctx.fillStyle = limb;
      ctx.fillRect(0, 0, px, px);

      // Le reflet spéculaire, en haut à gauche, immobile. Il fixe la source de
      // lumière : un reflet qui se déplace avec la matière donne une bulle de
      // savon, pas une sphère éclairée.
      const hx = c - radius * 0.34;
      const hy = c - radius * 0.38;
      const spec = ctx.createRadialGradient(hx, hy, 0, hx, hy, radius * 0.48);
      spec.addColorStop(0, `rgba(255,255,255,${0.20 + intensity * 0.16})`);
      spec.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = spec;
      ctx.fillRect(0, 0, px, px);

      ctx.restore();

      // Le liseré : la même lumière que la matière, posée sur l'arête. Il
      // décolle l'orbe du fond sombre de l'atelier.
      ctx.beginPath();
      ctx.arc(c, c, radius - dpr * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${0.10 + intensity * 0.18})`;
      ctx.lineWidth = dpr;
      ctx.stroke();
    };

    const loop = (now: number) => {
      const target = speakingRef.current ? 1 : 0;
      // Montée franche, descente lente : Mendly prend la parole d'un coup et
      // la relâche doucement, comme une voix qui retombe.
      const ease = target > intensity ? 0.09 : 0.035;
      intensity += (target - intensity) * ease;

      /*
       * La cadence suit l'état, elle ne s'arrête jamais tout à fait.
       *
       * Une première version cessait de peindre au repos, pour la batterie.
       * L'orbe se figeait alors en bille, et c'est tout ce qu'il ne doit pas
       * être : au repos il respire, c'est la seule chose qui le distingue
       * d'une pastille de couleur. Douze images par seconde suffisent pour
       * une dérive aussi lente, et c'est cinq fois moins de travail que la
       * cadence d'écran.
       */
      const busy = intensity > 0.02;
      if (now - last > (busy ? 33 : 83)) {
        last = now;
        paint(now);
      }
      frame = requestAnimationFrame(loop);
    };

    paint(0);
    if (!reduced) frame = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frame);
  }, [size, speaking]);

  return (
    <span
      className={["relative inline-block shrink-0", className ?? ""].join(" ")}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Le halo vit en CSS plutôt que dans le canvas : il doit déborder du
          cadre, et un canvas ne peut rien peindre hors de ses propres bords. */}
      <span
        className="absolute inset-0 rounded-full transition-opacity duration-700"
        style={{
          boxShadow: `0 0 ${size * 0.5}px ${size * 0.1}px ${rgba(ORB_COLORS.azure, 0.35)}`,
          opacity: speaking ? 1 : 0,
        }}
      />
      <canvas
        ref={canvasRef}
        className="relative block size-full rounded-full"
        style={{ width: size, height: size }}
      />
    </span>
  );
}
