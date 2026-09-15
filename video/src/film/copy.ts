/**
 * Le texte du film, FR et EN.
 *
 * Un fil narratif, une phrase par mesure :
 * la nuit, la question, l'IA qui dit oui, la solitude — puis Mendly qui ose
 * contredire, tranche, fait débattre l'équipe, continue la nuit — et la
 * phrase qui reste : arrête de prendre seul tes décisions.
 *
 * « Il se contredit » a disparu : hors du produit, la formule laissait croire
 * que Mendly était incohérent. Ici c'est toujours le fondateur qu'on contredit.
 *
 * `accent` : index du mot en dégradé, compté sur toute la phrase.
 */
export type Locale = "fr" | "en";

export interface Line {
  text: string;
  accent?: number;
}

export interface Speech {
  role: 0 | 1 | 2;
  text: string;
  changed?: boolean;
}

export interface FilmCopy {
  clock: string;
  night: Line;
  askLabel: string;
  placeholder: string;
  typed: string;
  replies: [string, string, string];
  yes: Line;
  nobody: Line;
  meet: Line;
  dares: Line;
  decides: Line;
  cardLabel: string;
  cardTension: string;
  cardPosition: string;
  debated: Line;
  roles: [string, string, string];
  roleNames: [string, string, string];
  changedMind: string;
  debate: [Speech, Speech, Speech, Speech];
  verdictLabel: string;
  verdict: string;
  team: Line;
  alone: Line;
  tagline: string;
  cta: string;
  url: string;
}

export const FILM_COPY: Record<Locale, FilmCopy> = {
  fr: {
    clock: "02:07",
    night: { text: "Il est 2 h du matin." },
    askLabel: "Tu demandes à une IA",
    placeholder: "Expose ta décision…",
    typed: "Je lance ma collection ce mois-ci ?",
    replies: ["Excellente idée !", "Fonce, c'est le moment.", "Ton instinct a raison."],
    yes: { text: "Et l'IA te dit oui.", accent: 4 },
    nobody: { text: "Mais personne\nne te contredit." },
    meet: { text: "Voici Mendly.", accent: 1 },
    dares: { text: "Mendly ose\nte contredire.", accent: 0 },
    decides: { text: "Puis il tranche.", accent: 2 },
    cardLabel: "Mendly",
    cardTension: "Ton produit est prêt.\nTon canal ne l'est pas.",
    cardPosition: "Ma position : sors trois pièces cette semaine, juste pour mesurer.",
    debated: { text: "Les grandes décisions\nse débattent.", accent: 4 },
    roles: ["CFO", "CMO", "CPO"],
    roleNames: ["Finance", "Marketing", "Produit"],
    changedMind: "a changé d'avis",
    debate: [
      { role: 0, text: "Douze pièces, c'est 4 200 € de stock. Trop tôt." },
      { role: 1, text: "Trois pièces ne créent aucun événement." },
      { role: 2, text: "Une collection se lit comme une saison." },
      { role: 0, text: "Soit. Trois pièces, annoncées comme un premier chapitre.", changed: true },
    ],
    verdictLabel: "Le verdict",
    verdict: "Trois pièces cette semaine. Tu mesures jusqu'au 15 novembre, puis tu décides chiffres en main.",
    team: { text: "Ton équipe travaille\nmême quand tu dors." },
    alone: { text: "Arrête de prendre\nseul tes décisions.", accent: 3 },
    tagline: "Le conseil qui ose te dire non.",
    cta: "Essaie gratuitement",
    url: "mendlyai.io",
  },
  en: {
    clock: "02:07",
    night: { text: "It's 2 a.m." },
    askLabel: "You ask an AI",
    placeholder: "Lay out your decision…",
    typed: "Should I launch my collection now?",
    replies: ["Great idea!", "Go for it, the timing is right.", "Trust your instinct."],
    yes: { text: "And AI says yes.", accent: 3 },
    nobody: { text: "But no one\npushes back." },
    meet: { text: "Meet Mendly.", accent: 1 },
    dares: { text: "Mendly dares\nto push back.", accent: 0 },
    decides: { text: "Then it decides.", accent: 2 },
    cardLabel: "Mendly",
    cardTension: "Your product is ready.\nYour channel isn't.",
    cardPosition: "My position: release three pieces this week, just to measure.",
    debated: { text: "Big decisions\nget debated.", accent: 3 },
    roles: ["CFO", "CMO", "CPO"],
    roleNames: ["Finance", "Marketing", "Product"],
    changedMind: "changed their mind",
    debate: [
      { role: 0, text: "Twelve pieces is €4,200 of stock. Too early." },
      { role: 1, text: "Three pieces create no event." },
      { role: 2, text: "A collection reads like a season." },
      { role: 0, text: "Fine. Three pieces, announced as chapter one.", changed: true },
    ],
    verdictLabel: "The verdict",
    verdict: "Three pieces this week. Measure until November 15, then decide with numbers in hand.",
    team: { text: "Your team keeps working\nwhile you sleep." },
    alone: { text: "Stop making\ndecisions alone.", accent: 3 },
    tagline: "The counsel that dares to say no.",
    cta: "Try it free",
    url: "mendlyai.io",
  },
};
