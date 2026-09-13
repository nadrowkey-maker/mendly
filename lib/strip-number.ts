/**
 * Retire la numérotation en tête d'un titre (« 1. Qui est responsable ? »).
 *
 * Certains namespaces portent déjà le numéro dans la traduction, d'autres non.
 * On le retire à l'affichage plutôt que de réécrire les traductions : le
 * numéro est une décision de mise en page, et la page le pose elle-même. Le
 * doubler serait la première chose qu'on voit.
 */
export function stripLeadingNumber(title: string): string {
  return title.replace(/^\s*\d+\s*[.)–-]\s*/, "");
}
