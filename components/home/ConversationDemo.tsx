"use client";

import { ProductStage, type StageStep } from "@/components/home/ProductStage";
import { ConversationScene } from "@/components/home/ConversationScene";

/**
 * La démonstration principale : un échange complet, du curseur au verdict.
 *
 * Le scénario suit les phases de `ConversationScene`, une étape par phase.
 * L'indice de l'étape EST la phase — c'est ce qui permet de relire le
 * scénario et la scène côte à côte sans table de correspondance, et d'ajouter
 * une phase sans avoir à renuméroter quoi que ce soit.
 *
 * Les durées ne sont pas régulières. On s'attarde sur la contradiction et sur
 * l'orientation vers la salle, parce que ce sont les deux seuls moments qu'un
 * assistant généraliste ne produirait pas ; la frappe, elle, passe vite.
 */

/** Dimensions logiques du plateau — un écran de portable, à l'unité près. */
const W = 1280;
const H = 800;

const STEPS: StageStep[] = [
  // L'accueil. Plein cadre, l'orbe au repos : on montre où l'on se trouve
  // avant de montrer ce qu'on y fait.
  { hold: 2000, camera: { x: 0.5, y: 0.5, scale: 1 }, cursor: { x: 690, y: 470 } },

  // Le curseur descend chercher la zone de saisie et clique dedans. Ici le
  // cadrage mord sur l'en-tête, et c'est voulu : on regarde le bas de l'écran.
  { hold: 900, camera: { x: 0.5, y: 0.58, scale: 1.2 }, cursor: { x: 700, y: 712 }, click: true },

  // La frappe.
  { hold: 2100 },

  // L'envoi : le curseur file sur le bouton, la question part.
  { hold: 1100, cursor: { x: 1140, y: 712 }, click: true },

  // La réponse arrive. Retour plein cadre pour la voir se construire.
  { hold: 4000, camera: { x: 0.5, y: 0.5, scale: 1 }, cursor: { x: 900, y: 560 } },

  /*
   * Le temps fort : on va lire la contradiction de près.
   *
   * Les valeurs ne sont pas choisies à l'œil. À ce grossissement le champ fait
   * 1113 × 696 : centré en x = 0,50 il contient la colonne de texte (392 à
   * 1160) ET l'essentiel de la barre latérale, et centré en y = 0,44 il garde
   * l'en-tête entier. Un cran plus loin, l'un des deux sortait du cadre — et
   * une démonstration qui coupe ses propres phrases ne démontre rien.
   */
  { hold: 3200, camera: { x: 0.5, y: 0.44, scale: 1.15 } },

  // L'orientation vers la salle de réunion, et le curseur qui s'y pose.
  { hold: 3400, camera: { x: 0.5, y: 0.48, scale: 1.08 }, cursor: { x: 620, y: 600 }, click: true },
];

interface ConversationDemoProps {
  className?: string;
}

export function ConversationDemo({ className }: ConversationDemoProps) {
  return (
    <ProductStage
      width={W}
      height={H}
      steps={STEPS}
      // À l'arrêt, on montre la réponse complète plutôt que l'écran d'accueil :
      // une page figée sur un état vide ne dit rien du produit.
      stillStep={5}
      className={className}
    >
      {(step) => <ConversationScene phase={step} />}
    </ProductStage>
  );
}
