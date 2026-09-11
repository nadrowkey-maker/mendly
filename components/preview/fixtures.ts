import type { Project } from "@/lib/types/project";
import type { ActionItem } from "@/lib/types/tracking";

/**
 * Le projet de démonstration utilisé pour les captures de la vitrine.
 *
 * Il est fictif et le reste : un compte réel dans une capture publierait le
 * travail de quelqu'un sur la page d'accueil. Mais l'interface, elle, est la
 * vraie — ce sont les mêmes composants que ceux servis aux fondateurs, avec un
 * contenu de démonstration. Une maquette dessinée dérive de la réalité au bout
 * de deux refontes et se met à promettre un produit qui n'existe pas.
 *
 * Le contenu est écrit pour montrer ce que Mendly fait de particulier : il
 * conteste, il expose sa tension interne, il tranche. Des messages neutres
 * feraient de jolies captures qui ne vendent rien.
 */

const NOW = "2026-09-08T09:12:00.000Z";

export const DEMO_PROJECT: Project = {
  id: "demo-project",
  user_id: "demo-user",
  name: "Atelier Kaolin",
  description: "Céramique artisanale vendue en ligne, une collection par saison.",
  sector: "ecommerce",
  stage: "mvp",
  priority: "growth",
  time_commitment: "parttime",
  accent_color: null,
  emoji: null,
  vision: null,
  assigned_agents: ["CFO", "CMO", "CPO"],
  team_rationale: null,
  created_at: NOW,
  updated_at: NOW,
};

export const DEMO_PROJECTS: Project[] = [
  DEMO_PROJECT,
  { ...DEMO_PROJECT, id: "demo-2", name: "Lettre du dimanche" },
  { ...DEMO_PROJECT, id: "demo-3", name: "Refonte tarifaire" },
];

export const DEMO_EMAIL = "camille@atelier-kaolin.fr";

/** L'échange qui montre la contestation, pas l'assentiment. */
export const DEMO_EXCHANGE = {
  question: "Je lance la collection d'hiver ce mois-ci ?",
  answer: `Sur quoi tu te bases pour dire que c'est le bon mois ? Tu as vendu 34 pièces depuis juin, dont 21 sur une seule journée de marché. Ce n'est pas une courbe, c'est un événement.

**Contradiction interne** — le produit est prêt, ton canal ne l'est pas. Ta collection tient debout : les prix passent, les retours sont bons, la production suit. Mais tout ton volume vient d'un stand physique que tu ne peux pas répéter en décembre.

Lancer maintenant, c'est brûler ta seule fenêtre de nouveauté pour découvrir que tu n'as pas d'audience en ligne. Et une collection d'hiver ne se relance pas en février.

**Ma position :** sors trois pièces au lieu de douze, dès cette semaine, uniquement pour mesurer. Tu sauras avant le 15 novembre si ton canal existe. S'il existe, tu lances le reste avec un chiffre en main.`,
  roomSuggestion:
    "Faut-il sortir la collection entière ou trois pièces de test avant décembre ?",
  /*
   * La version courte, pour le plateau de la vitrine.
   *
   * La réponse complète tient dans l'atelier, qui défile. Le plateau, lui, a
   * une hauteur fixe : la version longue en déborderait, et la démonstration
   * montrerait un texte coupé au milieu d'une phrase — soit exactement ce qu'on
   * ne veut pas donner à lire à quelqu'un qui découvre le produit.
   *
   * Elle garde les trois gestes qui comptent : la question sur les chiffres,
   * la contradiction assumée, la position tranchée.
   */
  stageAnswer: `Sur quoi tu te bases pour dire que c'est le bon mois ? Tu as vendu 34 pièces depuis juin, dont 21 sur une seule journée de marché. Ce n'est pas une courbe, c'est un événement.

**Contradiction interne** — ta collection tient debout, ton canal ne tient pas. Tout ton volume vient d'un stand que tu ne peux pas répéter en décembre.

**Ma position :** sors trois pièces cette semaine pour mesurer. Tu sauras avant le 15 novembre si ton canal existe.`,
};

export const DEMO_ACTIONS: ActionItem[] = [
  {
    id: "a1",
    project_id: "demo-project",
    user_id: "demo-user",
    conversation_id: null,
    content: "Mesurer la rétention des inscrits à la lettre sur 14 jours",
    status: "todo",
    source: "debate",
    created_at: "2026-08-28T09:00:00.000Z",
    updated_at: "2026-08-28T09:00:00.000Z",
    completed_at: null,
  },
  {
    id: "a2",
    project_id: "demo-project",
    user_id: "demo-user",
    conversation_id: null,
    content: "Chiffrer le coût unitaire réel des pièces émaillées",
    status: "todo",
    source: "ceo",
    created_at: "2026-08-30T09:00:00.000Z",
    updated_at: "2026-08-30T09:00:00.000Z",
    completed_at: null,
  },
  {
    id: "a3",
    project_id: "demo-project",
    user_id: "demo-user",
    conversation_id: null,
    content: "Décider du prix de la pièce d'appel avant la mise en ligne",
    status: "todo",
    source: "debate",
    created_at: "2026-09-02T09:00:00.000Z",
    updated_at: "2026-09-02T09:00:00.000Z",
    completed_at: null,
  },
];
