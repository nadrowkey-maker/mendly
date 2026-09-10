/**
 * L'orientation vers la salle de réunion.
 *
 * Une instruction de prompt seule ne suffisait pas : Mendly écrivait bien
 * "ouvre-la en salle de réunion", mais en texte brut. Le fondateur devait
 * ensuite trouver le lien dans la barre latérale, cliquer, puis RETAPER sa
 * question. Trois actions pour suivre un conseil, c'est un conseil qu'on ne
 * suit pas.
 *
 * Mendly émet donc un marqueur en fin de réponse, que l'interface convertit en
 * bouton : un clic ouvre la salle avec la question déjà écrite.
 *
 *     [[SALLE]]Faut-il repousser le lancement d'un mois ?[[/SALLE]]
 */

const OPEN = "[[SALLE]]";
const CLOSE = "[[/SALLE]]";

export interface ParsedReply {
  /** Le texte à afficher, marqueur retiré. */
  body: string;
  /** La question à débattre, si Mendly en a proposé une. */
  suggestion: string | null;
}

/**
 * Sépare le corps du message de la suggestion.
 *
 * Tolère le marqueur incomplet : pendant le streaming, "[[SAL" puis "[[SALLE]]Fau"
 * arrivent morceau par morceau. Sans ce traitement, le fondateur verrait la
 * syntaxe brute clignoter avant de disparaître.
 */
export function parseReply(text: string): ParsedReply {
  const start = text.indexOf(OPEN);

  if (start === -1) {
    // Marqueur peut-être en cours d'arrivée : on masque tout début de "[[" en
    // fin de chaîne plutôt que de le laisser s'afficher.
    const partial = text.lastIndexOf("[[");
    if (partial !== -1 && OPEN.startsWith(text.slice(partial))) {
      return { body: text.slice(0, partial).trimEnd(), suggestion: null };
    }
    return { body: text, suggestion: null };
  }

  const body = text.slice(0, start).trimEnd();
  const rest = text.slice(start + OPEN.length);
  const end = rest.indexOf(CLOSE);

  // Fermeture pas encore arrivée : on cache déjà l'ouverture.
  if (end === -1) return { body, suggestion: null };

  const suggestion = rest.slice(0, end).trim();
  return { body, suggestion: suggestion ? suggestion.slice(0, 500) : null };
}
