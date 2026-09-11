"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Le plateau — la machinerie qui rejoue le produit sur la vitrine.
 *
 * Les captures fixes ne marchaient pas, et pas pour la raison qu'on croit. Le
 * problème n'était pas la définition : c'était l'échelle. Un écran de travail
 * de 1440 pixels de large réduit à 470 rend son texte de 13 pixels à 4. Aucune
 * image, si nette soit-elle, ne rattrape ça — il faut cesser de tout montrer
 * en même temps.
 *
 * D'où le plateau : la vraie interface, en DOM, à sa taille réelle, et une
 * caméra qui va chercher la zone dont on parle. Le texte reste vectoriel donc
 * net à n'importe quel grossissement, le produit montré est le produit livré,
 * et le fichier ne pèse rien puisqu'il n'y a pas de fichier.
 *
 * Le curseur n'est pas un ornement. Sans lui, un zoom qui se déplace tout seul
 * se lit comme une vidéo promotionnelle ; avec lui, on lit quelqu'un qui se
 * sert de l'outil.
 */

export interface StageStep {
  /** Durée de l'étape, en millisecondes. */
  hold: number;
  /** Cadrage : le point à centrer, en fractions du plateau, et le grossissement. */
  camera?: { x: number; y: number; scale: number };
  /** Position du curseur, en pixels du plateau. Absent : il ne bouge pas. */
  cursor?: { x: number; y: number };
  /** Déclenche l'onde de clic à l'arrivée du curseur. */
  click?: boolean;
}

interface ProductStageProps {
  /** Dimensions logiques du plateau — celles de l'interface réelle. */
  width: number;
  height: number;
  steps: StageStep[];
  /** La scène, rendue selon l'étape courante. */
  children: (step: number) => ReactNode;
  /** Étape figée quand l'utilisateur a désactivé les animations. */
  stillStep?: number;
  className?: string;
}

export function ProductStage({
  width,
  height,
  steps,
  children,
  stillStep = 0,
  className,
}: ProductStageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(0);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  /*
   * Le facteur de réduction est mesuré plutôt que calculé en CSS.
   *
   * Une transformation `scale` ne change pas la place que l'élément réserve
   * dans le flux : le plateau continuerait d'occuper ses 1280 pixels et
   * déborderait de la page sur tout écran plus étroit. Il faut donc connaître
   * le facteur en JavaScript pour fixer la hauteur du cadre en conséquence.
   */
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => setFit(frame.clientWidth / width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [width]);

  /*
   * La séquence ne tourne que lorsque le plateau est à l'écran. Trois plateaux
   * qui rejouent leur scénario en permanence dans une page qu'on est en train
   * de lire ailleurs, c'est trois fois le travail pour zéro spectateur.
   */
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting),
      { threshold: 0.35 }
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const current = steps[step];
    const timer = setTimeout(() => {
      setStep((s) => (s + 1) % steps.length);
    }, current.hold);
    return () => clearTimeout(timer);
  }, [running, step, steps]);

  const active = running ? step : stillStep;

  // Le dernier cadrage et la dernière position connus : une étape qui ne les
  // précise pas doit laisser la caméra où elle est, pas la ramener au départ.
  const camera = lastDefined(steps, active, "camera") ?? { x: 0.5, y: 0.5, scale: 1 };
  const cursor = lastDefined(steps, active, "cursor") ?? { x: width * 0.5, y: height * 0.6 };

  return (
    <div
      ref={frameRef}
      className={[
        "relative overflow-hidden rounded-2xl border border-black/10 bg-(--shell) text-white text-left",
        "shadow-[0_40px_90px_-40px_rgba(0,0,0,0.55)]",
        className ?? "",
      ].join(" ")}
      style={{ height: fit ? height * fit : undefined, aspectRatio: fit ? undefined : `${width}/${height}` }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width, height, transform: `scale(${fit || 0.001})` }}
      >
        <div
          className="relative size-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.33,1,0.68,1)]"
          style={{
            transform: `scale(${camera.scale}) translate(${(0.5 - camera.x) * 100}%, ${(0.5 - camera.y) * 100}%)`,
          }}
        >
          {children(active)}

          {running && (
            <Cursor
              x={cursor.x}
              y={cursor.y}
              zoom={camera.scale}
              clickKey={steps[active].click ? active : null}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** Remonte les étapes jusqu'à la dernière qui définit la clé demandée. */
function lastDefined<K extends "camera" | "cursor">(
  steps: StageStep[],
  index: number,
  key: K
): StageStep[K] | undefined {
  for (let i = index; i >= 0; i--) {
    const value = steps[i][key];
    if (value) return value;
  }
  return undefined;
}

/**
 * Le curseur de démonstration.
 *
 * Il est contre-mis à l'échelle du grossissement : un curseur qui grossit avec
 * le zoom trahit immédiatement le procédé, parce qu'un vrai pointeur garde sa
 * taille quoi qu'affiche l'écran.
 */
function Cursor({
  x,
  y,
  zoom,
  clickKey,
}: {
  x: number;
  y: number;
  zoom: number;
  /** L'étape qui clique, ou `null`. Sert de clé de remontage, voir plus bas. */
  clickKey: number | null;
}) {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-50 transition-transform duration-[900ms] ease-[cubic-bezier(0.33,1,0.68,1)]"
      style={{ transform: `translate(${x}px, ${y}px) scale(${1 / zoom})` }}
    >
      {/* L'onde ne passe par aucun état.
          Une première version allumait un booléen puis l'éteignait par minuterie,
          ce qui faisait deux rendus de l'arbre pour une décoration de 520 ms —
          et React signale à juste titre l'écriture d'état depuis un effet.
          Ici la clé change avec l'étape : React remonte le nœud, et le
          navigateur rejoue l'animation CSS depuis le début. */}
      {clickKey !== null && (
        <span
          key={clickKey}
          className="absolute -top-2 -left-2 size-9 animate-[stage-click_520ms_ease-out] rounded-full border-2 border-white/70 opacity-0"
        />
      )}
      <svg viewBox="0 0 20 22" className="size-5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
        <path
          d="M2 1.5l14.5 8.2-6.4 1.3-2.8 6.3z"
          fill="#fff"
          stroke="rgba(0,0,0,0.55)"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
