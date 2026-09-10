import Image from "next/image";

/**
 * Une capture du produit, posée dans son cadre.
 *
 * Les captures sont prises sur l'atelier réel, pas dessinées : une maquette
 * d'interface sur une page de vente se repère à la seconde, et le visiteur en
 * déduit — souvent à raison — que le produit derrière n'existe pas encore.
 *
 * Le cadre est légèrement plus sombre que la capture et le coin est arrondi au
 * même rayon que les panneaux de l'atelier. C'est ce raccord de rayon qui fait
 * que la capture appartient à la page au lieu d'y être collée.
 */
interface ShotFrameProps {
  src: string;
  alt: string;
  /** Largeur intrinsèque de la capture, en pixels. */
  width: number;
  height: number;
  className?: string;
  /** Charge l'image sans attendre le défilement — réservé à la première. */
  priority?: boolean;
}

export function ShotFrame({
  src,
  alt,
  width,
  height,
  className,
  priority,
}: ShotFrameProps) {
  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border border-black/8 bg-(--shell)",
        "shadow-[0_30px_70px_-30px_rgba(0,0,0,0.45)]",
        className ?? "",
      ].join(" ")}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes="(max-width: 768px) 92vw, 620px"
        className="block h-auto w-full"
      />
    </div>
  );
}
