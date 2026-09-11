"use client";

import { useEffect, useRef } from "react";

/**
 * Le dégradé granuleux — le dispositif signature de la direction.
 *
 * Généré au canvas plutôt qu'importé en vidéo ou en image, pour trois raisons
 * qui comptent :
 * — il pèse quelques kilo-octets de code au lieu de plusieurs méga-octets
 *   d'asset, et ne coûte aucun aller-retour réseau ;
 * — il s'adapte à n'importe quelle taille sans jamais pixeliser ;
 * — il appartient au produit, ce qu'un fichier récupéré ailleurs ne fait pas.
 *
 * Il est fait de DEUX couches superposées, et la séparation est le cœur du
 * composant :
 *
 *   1. le dégradé, peint au quart de la définition puis étiré. Il est flou par
 *      nature, l'étirement ne se voit pas, et on divise le coût par seize ;
 *   2. le grain, posé par-dessus à l'échelle 1:1 en fond répété.
 *
 * Tout mettre dans le même canvas paraissait plus simple et donnait un très
 * mauvais résultat : le bruit se retrouvait étiré ×4 lui aussi, chaque point
 * devenait un carré de quatre pixels, et la matière tournait en neige de
 * téléviseur. Le grain doit rester fin, donc il doit rester à sa définition.
 */

export type GrainColorway = "azure" | "signal" | "verdict" | "ash" | "dusk";

/**
 * Chaque coloris tient en cinq teintes plus un fond. Peu de couleurs et
 * beaucoup de recouvrement : c'est le mélange qui fait la richesse, pas le
 * nombre de teintes. Huit couleurs donnent de la boue, pas de la profondeur.
 */
const COLORWAYS: Record<GrainColorway, { base: string; blobs: string[] }> = {
  // L'azur de Mendly sur un blanc chaud — le coloris principal.
  azure: {
    base: "#eef1f6",
    blobs: ["#1f8ce8", "#63bdff", "#ffc046", "#ffffff", "#0d4f92"],
  },
  // L'ambre du signal : réservé aux blocs qui parlent de contradiction.
  signal: {
    base: "#fbf1df",
    blobs: ["#ff9d1f", "#ffc266", "#fff3dd", "#c96a0d", "#ffd699"],
  },
  // Le verdict rendu — vert froid, pour les blocs qui parlent de décision.
  verdict: {
    base: "#e9f5ec",
    blobs: ["#17b87c", "#6fdcae", "#eefaf3", "#067a52", "#a5e6c8"],
  },
  // Neutre : quand le contenu posé dessus doit primer. Très clair et très peu
  // contrasté — un gris moyen ferait un panneau plus lourd que la carte qu'il
  // est censé mettre en valeur.
  ash: {
    base: "#f4f2ee",
    blobs: ["#ffffff", "#efe9dc", "#e8edf3", "#fbf7ee", "#e2ded4"],
  },
  // La déclinaison sombre, pour les panneaux de l'atelier.
  dusk: {
    base: "#0d1118",
    blobs: ["#1d6fbd", "#3aa8ff", "#0a0d12", "#123a5f", "#8fd4ff"],
  },
};
interface GrainGradientProps {
  colorway?: GrainColorway;
  /** Intensité du grain, 0 à 1. */
  grain?: number;
  /** Graine du tirage : deux blocs avec la même graine sont identiques. */
  seed?: number;
  /** Fait dériver lentement les taches. Coupé si l'utilisateur réduit les animations. */
  animate?: boolean;
  className?: string;
}

/**
 * La même couleur, en transparent.
 *
 * Un dégradé radial qui se termine sur `rgba(0,0,0,0)` ne devient pas
 * transparent : il devient NOIR transparent, et le moteur interpole vers ce
 * noir en même temps que vers l'opacité zéro. Chaque tache traînait donc un
 * halo gris, et tous les panneaux sortaient nettement plus sombres et plus
 * sales que leur palette — une tache blanche sur fond crème donnait du gris à
 * 55 %. Il faut s'éteindre sur sa propre teinte.
 */
function fadeOut(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},0)`;
}

/** Générateur déterministe : une même graine redonne toujours le même visuel. */
function makeRandom(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

/**
 * La tuile de grain, fabriquée une fois pour toute la page.
 *
 * Une tuile de 128 px répétée en fond CSS : le navigateur la compose lui-même,
 * sans passer par le processeur à chaque image. Un bruit regénéré par image
 * coûterait un parcours pixel par pixel vingt-quatre fois par seconde — c'est
 * exactement ce qui fait ramer les fonds animés.
 */
let noiseTile: string | null = null;

function getNoiseTile(): string {
  if (noiseTile) return noiseTile;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const img = ctx.createImageData(size, size);
  const px = img.data;
  const rand = makeRandom(991);
  for (let i = 0; i < px.length; i += 4) {
    // Même écart sur les trois canaux : le grain module la luminosité sans
    // faire virer la teinte du dégradé qu'il recouvre.
    const v = 128 + (rand() - 0.5) * 165;
    px[i] = v;
    px[i + 1] = v;
    px[i + 2] = v;
    px[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  noiseTile = canvas.toDataURL("image/png");
  return noiseTile;
}

export function GrainGradient({
  colorway = "azure",
  grain = 0.5,
  seed = 7,
  animate = true,
  className,
}: GrainGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noiseRef = useRef<HTMLDivElement>(null);

  /*
   * La tuile de grain est posée à la main sur le nœud, sans passer par un état.
   *
   * Elle ne peut être fabriquée que dans le navigateur — au rendu serveur,
   * `document` n'existe pas — mais la stocker dans un état forcerait un second
   * rendu de l'arbre entier à chaque montage, pour une valeur que React n'a
   * aucune raison de connaître : c'est une texture, pas une donnée.
   */
  useEffect(() => {
    const node = noiseRef.current;
    if (!node) return;
    if (grain <= 0) {
      node.style.backgroundImage = "";
      node.style.opacity = "0";
      return;
    }
    node.style.backgroundImage = `url(${getNoiseTile()})`;
    node.style.backgroundRepeat = "repeat";
    node.style.opacity = String(grain * 0.3);
  }, [grain]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { base, blobs } = COLORWAYS[colorway];
    const rand = makeRandom(seed);

    // Les taches débordent volontairement du cadre : une tache entièrement
    // visible se lit comme un rond posé, une tache coupée par le bord se lit
    // comme une nappe qui continue. C'est toute la différence entre un motif
    // et une matière.
    const specs = Array.from({ length: 6 }, () => ({
      x: rand() * 1.5 - 0.25,
      y: rand() * 1.5 - 0.25,
      radius: 0.46 + rand() * 0.62,
      color: blobs[Math.floor(rand() * blobs.length)],
      alpha: 0.62 + rand() * 0.30,
      // Chaque tache dérive sur sa propre ellipse, à sa propre vitesse : des
      // trajectoires synchronisées se liraient comme une pulsation.
      driftX: 0.03 + rand() * 0.06,
      driftY: 0.03 + rand() * 0.06,
      speed: 0.00004 + rand() * 0.00007,
      phase: rand() * Math.PI * 2,
    }));

    let w = 0;
    let h = 0;

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      w = Math.max(1, Math.round(rect.width / 4));
      h = Math.max(1, Math.round(rect.height / 4));
      canvas.width = w;
      canvas.height = h;
      return true;
    };

    const paint = (time: number) => {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      const span = Math.max(w, h);
      for (const s of specs) {
        const t = time * s.speed + s.phase;
        const cx = (s.x + Math.cos(t) * s.driftX) * w;
        const cy = (s.y + Math.sin(t * 0.83) * s.driftY) * h;
        const r = s.radius * span;

        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, s.color);
        g.addColorStop(1, fadeOut(s.color));
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalAlpha = 1;
    };

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const moving = animate && !reduced;

    let frame = 0;
    let last = 0;

    const loop = (now: number) => {
      // 24 images par seconde suffisent : ces taches mettent une minute à
      // traverser le cadre, personne ne perçoit l'écart avec 60, et on rend au
      // processeur les deux tiers du budget.
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
  }, [colorway, grain, seed, animate]);

  /*
   * L'enveloppe ne pose AUCUNE classe de position : elle prend exactement
   * celle qu'on lui passe.
   *
   * Elle portait `relative` au départ, et Tailwind émet `relative` après
   * `absolute` dans sa feuille. Résultat : un appelant qui demandait
   * « absolute inset-0 » obtenait un bloc en flux normal qui poussait tout le
   * contenu hors du panneau. Les champs des écrans de connexion avaient
   * purement et simplement disparu de la page.
   *
   * Les deux couches sont donc positionnées par rapport au premier ancêtre
   * positionné, que ce soit cette enveloppe ou le conteneur au-dessus — dans
   * les deux cas, la même boîte.
   */
  return (
    <div aria-hidden="true" className={`overflow-hidden ${className ?? ""}`}>
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div ref={noiseRef} className="absolute inset-0 opacity-0 mix-blend-overlay" />
    </div>
  );
}
