/**
 * L'en-tête d'un écran de l'atelier : un titre, un filet, rien d'autre.
 *
 * Le filet court sur toute la largeur de la zone de travail plutôt que sous le
 * seul titre. C'est ce qui pose une ligne d'horizon commune à tous les écrans :
 * on change de page, le titre change, la ligne ne bouge pas.
 *
 * Le titre est en gras plein et non en display fin. La vitrine se regarde, ces
 * écrans-là se scrutent — un titre fin y devient une décoration qu'on cesse de
 * lire au bout de deux jours.
 */
interface AppHeaderProps {
  title: string;
  /** Une ligne de contexte sous le titre. */
  subtitle?: string;
  /** Actions alignées à droite du titre. */
  actions?: React.ReactNode;
}

export function AppHeader({ title, subtitle, actions }: AppHeaderProps) {
  return (
    <header className="px-6 pt-8 md:px-10 md:pt-10">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="truncate text-[26px] font-bold tracking-[-0.025em] text-white md:text-[30px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-[13.5px] text-white/45">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div>}
      </div>
      <div className="mt-6 h-px bg-(--panel-line)" />
    </header>
  );
}
