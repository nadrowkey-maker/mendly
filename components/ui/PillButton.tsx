import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Le bouton signature : une pilule, et à l'intérieur une pastille circulaire
 * qui porte la flèche.
 *
 * La pastille inverse toujours le fond du bouton — sombre dans une pilule
 * claire, claire dans une pilule en verre. C'est ce contraste interne qu'on
 * reconnaît avant même de lire le logo, et c'est pour ça qu'il ne faut jamais
 * le remplacer par une flèche posée à côté du texte.
 */

type PillVariant = "light" | "glass";

interface PillButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: PillVariant;
  className?: string;
}

const SHELL =
  "group inline-flex items-center gap-2.5 rounded-full border py-1.5 pl-5 pr-1.5 text-sm font-semibold tracking-tight transition-all duration-200 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent-glow)";

const VARIANTS: Record<PillVariant, string> = {
  light:
    "border-transparent bg-white text-black hover:shadow-[0_8px_30px_-8px_rgba(255,255,255,0.35)]",
  glass:
    "border-(--glass-line) bg-(--glass) text-white backdrop-blur-xl hover:border-(--glass-hi) hover:shadow-[0_8px_34px_-12px_var(--accent-halo)]",
};

const PELLET: Record<PillVariant, string> = {
  light: "bg-black text-white",
  glass: "bg-white text-black",
};

export function PillButton({ href, children, variant = "light", className }: PillButtonProps) {
  return (
    <Link href={href} className={cn(SHELL, VARIANTS[variant], className)}>
      <span>{children}</span>
      <span
        aria-hidden="true"
        className={cn(
          "grid size-7 place-items-center rounded-full text-xs transition-transform duration-200 group-hover:rotate-45",
          PELLET[variant]
        )}
      >
        <svg viewBox="0 0 12 12" fill="none" className="size-3">
          <path d="M3 9L9 3M9 3H4M9 3v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        </svg>
      </span>
    </Link>
  );
}
