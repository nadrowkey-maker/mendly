/**
 * Les données structurées, posées dans la page.
 *
 * Composant serveur : le balisage part dans le HTML rendu, donc un robot qui
 * n'exécute aucun script le voit quand même — et c'est le cas de la plupart
 * des robots autres que Google.
 */
interface JsonLdProps {
  data: object;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // Le contenu vient de nos fichiers de traduction, jamais d'une saisie.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
