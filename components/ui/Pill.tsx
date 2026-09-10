"use client";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * La pilule — l'unique forme de bouton du produit.
 *
 * Un seul rayon, une seule hauteur, quatre valeurs. Tout le reste du système
 * peut varier ; le bouton, non. C'est la pièce qu'on voit le plus souvent, et
 * c'est par elle qu'une interface se met à sentir le patchwork dès qu'on
 * autorise une deuxième forme.
 *
 * Les quatre valeurs correspondent au fond sur lequel la pilule est posée,
 * jamais à un niveau d'importance abstrait :
 * — `ink`   : action principale sur fond clair (encre pleine, texte blanc)
 * — `paper` : action secondaire sur fond clair (blanc, filet fin)
 * — `light` : action principale sur fond sombre (clair plein, texte encre)
 * — `ghost` : action discrète, sur l'un ou l'autre
 */

type PillTone = "ink" | "paper" | "light" | "ghost";
type PillSize = "sm" | "md" | "lg";

interface PillBaseProps {
  children: React.ReactNode;
  tone?: PillTone;
  size?: PillSize;
  className?: string;
  /** Glyphe posé avant le libellé — un point d'état, une icône fine. */
  icon?: React.ReactNode;
}

interface PillLinkProps extends PillBaseProps {
  href: string;
  /** Ancre de la même page ou lien externe : sort du routeur localisé. */
  external?: boolean;
}

interface PillButtonProps extends PillBaseProps {
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  /** Occupe toute la largeur — formulaires, panneaux latéraux. */
  block?: boolean;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight " +
  "transition-all duration-200 cursor-pointer whitespace-nowrap " +
  "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--accent-primary) " +
  "disabled:cursor-not-allowed disabled:opacity-45";

const SIZES: Record<PillSize, string> = {
  sm: "h-8 px-3.5 text-[12.5px]",
  md: "h-10 px-5 text-[13.5px]",
  lg: "h-12 px-7 text-[15px]",
};

const TONES: Record<PillTone, string> = {
  ink: "bg-(--ink) text-white hover:bg-black hover:-translate-y-px hover:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.7)]",
  paper:
    "bg-white text-(--ink) border border-(--paper-line) hover:border-(--ink-faint) hover:-translate-y-px",
  light:
    "bg-[#e9e7e2] text-(--ink) hover:bg-white hover:-translate-y-px hover:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.8)]",
  ghost:
    "bg-transparent text-current opacity-65 hover:opacity-100 hover:bg-current/6",
};

function shell(tone: PillTone, size: PillSize, className?: string) {
  return cn(BASE, SIZES[size], TONES[tone], className);
}

export function PillLink({
  href,
  children,
  tone = "ink",
  size = "md",
  icon,
  external,
  className,
}: PillLinkProps) {
  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );

  // Les ancres et les liens sortants ne passent pas par le routeur localisé :
  // il préfixerait "#tarifs" avec la locale et casserait le saut.
  if (external || href.startsWith("#") || href.startsWith("http")) {
    return (
      <a href={href} className={shell(tone, size, className)}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={shell(tone, size, className)}>
      {content}
    </Link>
  );
}

export function PillAction({
  children,
  onClick,
  type = "button",
  disabled,
  tone = "ink",
  size = "md",
  icon,
  block,
  className,
}: PillButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={shell(tone, size, cn(block && "w-full", className))}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
