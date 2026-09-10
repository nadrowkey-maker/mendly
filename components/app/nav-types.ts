import type { LucideIcon } from "lucide-react";

/**
 * La description de la navigation latérale.
 *
 * Elle est passée en données plutôt que codée dans la barre elle-même, parce
 * que les écrans n'ont pas la même navigation : le tableau de bord liste les
 * projets, un projet ouvert liste ses vues. Une barre qui devine son contenu à
 * partir de l'URL finit par contenir la carte du site entière — c'est ce que
 * faisait l'ancienne, et c'est pour ça qu'elle affichait encore neuf agents
 * quand il n'en restait qu'un.
 */

export interface NavItem {
  label: string;
  icon: LucideIcon;
  /** Destination interne. Exclusif avec `onClick`. */
  href?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  /** Pastille de compte — masquée à zéro. */
  count?: number;
}

export interface NavGroup {
  /** L'étiquette de section, en petites capitales au-dessus du groupe. */
  label: string;
  items: NavItem[];
  /** Le « + » aligné à droite de l'étiquette. */
  action?: { label: string; href: string };
}
