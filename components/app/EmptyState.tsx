import type { LucideIcon } from "lucide-react";
import { PillLink } from "@/components/ui/Pill";

/**
 * L'écran vide.
 *
 * Trois lignes et une action, centrées. L'écran vide est le premier que voit
 * un nouvel arrivant, et c'est celui qu'on soigne le moins parce qu'on ne le
 * revoit jamais soi-même. Il porte donc la phrase qui explique à quoi sert la
 * chose absente, pas seulement le constat qu'elle est absente : « aucun projet »
 * ne dit pas pourquoi il en faudrait un.
 *
 * L'icône est cerclée et non pleine : à cet endroit elle doit poser un point de
 * fixation au centre, pas attirer l'œil plus fort que le bouton.
 */
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptyState({ icon: Icon, title, body, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <span
        aria-hidden="true"
        className="grid size-11 place-items-center rounded-full border border-white/15 text-white/75"
      >
        <Icon className="size-5" />
      </span>
      <h2 className="mt-5 text-[17px] font-bold tracking-tight text-white">{title}</h2>
      <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-white/45">{body}</p>
      {ctaLabel && ctaHref && (
        <div className="mt-6">
          <PillLink href={ctaHref} tone="light" size="md">
            {ctaLabel}
          </PillLink>
        </div>
      )}
    </div>
  );
}
