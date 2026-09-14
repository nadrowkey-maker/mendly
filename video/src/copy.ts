/**
 * Le script de la publicité, en deux langues.
 *
 * Structure retenue — celle des publicités SaaS qui performent sur TikTok :
 *
 *   0,0 s  ACCROCHE   le problème, pas le logo. Lisible sans le son dès l'image 0.
 *   2,4 s  PROBLÈME   trois constats, puis ce que ça coûte.
 *   6,8 s  RÉVÉLATION l'orbe et le nom, une seule phrase de promesse.
 *   9,4 s  DÉMO       le produit en marche : il conteste, se contredit, tranche.
 *  17,4 s  PREUVE     la salle de réunion, puis le travail de nuit.
 *  21,7 s  RÉCAP      trois bénéfices en une phrase chacun.
 *  24,1 s  APPEL      une phrase, un bouton, une adresse.
 *
 * Aucun chiffre de clientèle, aucun témoignage : Mendly n'en a pas encore, et
 * une publicité est une allégation commerciale. Les chiffres qui apparaissent
 * sont ceux du projet de démonstration, présentés comme tels à l'écran.
 */

export type Locale = "fr" | "en";

interface Line {
  who: string;
  text: string;
}

export interface Copy {
  hook: { line: string; accentIndex: number; question: string; yes: string[]; slam: string };
  problem: { lines: string[]; lossLead: string; lossUnit: string; lossTail: string };
  reveal: { name: string; tagline: string };
  demo: {
    header: string;
    project: string;
    question: string;
    answer: string;
    tensionLabel: string;
    tension: string;
    verdictLabel: string;
    verdict: string;
    captions: [string, string, string];
  };
  room: { caption: string; label: string; question: string; lines: Line[]; verdictLabel: string; verdict: string };
  night: { caption: string; label: string; badge: string; log: { time: string; text: string }[] };
  benefits: { title: string; items: string[] };
  cta: { line: string; button: string; sub: string; url: string };
}

export const COPY: Record<Locale, Copy> = {
  fr: {
    hook: {
      line: "Ton IA te dit\ntoujours oui.",
      accentIndex: 5,
      question: "Je lance mon offre ce mois-ci ?",
      yes: [
        "Excellente idée ! 🚀",
        "Fonce !",
        "C'est génial 🔥",
        "Validé à 100 %",
        "Tu vas cartonner",
        "Parfait 👏",
        "Rien à redire",
        "Idée brillante ✨",
        "Go go go !",
        "Aucun risque",
      ],
      slam: "C'est le problème.",
    },
    problem: {
      lines: ["Pas d'associé.", "Pas de board.", "Personne pour\nte dire non."],
      lossLead: "RÉSULTAT",
      lossUnit: "mois",
      lossTail: "perdus sur la\nmauvaise idée.",
    },
    reveal: { name: "Mendly", tagline: "Le conseil qui ose\nte contredire." },
    demo: {
      header: "Conversation",
      project: "PROJET DÉMO · ATELIER KAOLIN",
      question: "Je lance la collection d'hiver ce mois-ci ?",
      answer:
        "Tu as vendu 34 pièces depuis juin, dont 21 en une seule journée de marché. Ce n'est pas une courbe, c'est un événement.",
      tensionLabel: "Contradiction interne",
      tension: "Ta collection tient debout. Ton canal, non.",
      verdictLabel: "Ma position",
      verdict: "Sors 3 pièces cette semaine. Mesure. Puis décide.",
      captions: ["Il conteste.", "Il se contredit.", "Il tranche."],
    },
    room: {
      caption: "Question difficile ?\nIl réunit l'équipe.",
      label: "Salle de réunion",
      question: "Collection entière, ou 3 pièces test ?",
      lines: [
        { who: "Finance", text: "12 pièces = 4 200 € de stock bloqué." },
        { who: "Croissance", text: "3 pièces, zéro événement." },
        { who: "Produit", text: "Une saison ne se découpe pas." },
      ],
      verdictLabel: "Verdict",
      verdict: "3 pièces, annoncées comme un premier chapitre.",
    },
    night: {
      caption: "Et il bosse pendant\nque tu dors.",
      label: "Session autonome",
      badge: "Sans toi",
      log: [
        { time: "03:04", text: "Action enlisée depuis 11 jours." },
        { time: "03:07", text: "Équipe convoquée." },
        { time: "03:09", text: "Débat ouvert." },
        { time: "03:12", text: "Verdict rendu. Il t'attend." },
      ],
    },
    benefits: {
      title: "Mendly, c'est :",
      items: ["Un avis qui te contredit", "Une décision, pas 5 options", "Un conseil qui bosse la nuit"],
    },
    cta: {
      line: "Arrête de te\nfaire dire oui.",
      button: "Essayer gratuitement",
      sub: "MENDLY · LE CONSEIL QUI OSE TE CONTREDIRE",
      url: "mendlyai.io",
    },
  },

  en: {
    hook: {
      line: "Your AI always\nsays yes.",
      accentIndex: 4,
      question: "Should I launch my paid plan this month?",
      yes: [
        "Great idea! 🚀",
        "Go for it!",
        "Love it 🔥",
        "100% validated",
        "You'll crush it",
        "Perfect 👏",
        "No notes",
        "Brilliant ✨",
        "Ship it!",
        "Zero risk",
      ],
      slam: "That's the problem.",
    },
    problem: {
      lines: ["No cofounder.", "No board.", "Nobody to\ntell you no."],
      lossLead: "RESULT",
      lossUnit: "months",
      lossTail: "lost on the\nwrong idea.",
    },
    reveal: { name: "Mendly", tagline: "The counsel that dares\nto contradict you." },
    demo: {
      header: "Conversation",
      project: "DEMO PROJECT · KAOLIN STUDIO",
      question: "Should I launch the winter collection this month?",
      answer:
        "You sold 34 pieces since June, 21 of them on a single market day. That's not a curve, it's an event.",
      tensionLabel: "Internal contradiction",
      tension: "Your collection holds up. Your channel doesn't.",
      verdictLabel: "My position",
      verdict: "Release 3 pieces this week. Measure. Then decide.",
      captions: ["It pushes back.", "It contradicts itself.", "It decides."],
    },
    room: {
      caption: "Hard question?\nIt convenes the team.",
      label: "Meeting room",
      question: "Full collection, or 3 test pieces?",
      lines: [
        { who: "Finance", text: "12 pieces = €4,200 of stock tied up." },
        { who: "Growth", text: "3 pieces, zero buzz." },
        { who: "Product", text: "A season can't be cut up." },
      ],
      verdictLabel: "Verdict",
      verdict: "3 pieces, launched as chapter one.",
    },
    night: {
      caption: "And it works\nwhile you sleep.",
      label: "Autonomous session",
      badge: "No input",
      log: [
        { time: "03:04", text: "Action stalled for 11 days." },
        { time: "03:07", text: "Team convened." },
        { time: "03:09", text: "Debate opened." },
        { time: "03:12", text: "Verdict reached. Waiting for you." },
      ],
    },
    benefits: {
      title: "Mendly is:",
      items: ["Advice that pushes back", "One decision, not 5 options", "A board that works overnight"],
    },
    cta: {
      line: "Stop hearing\nyes.",
      button: "Try it free",
      sub: "MENDLY · THE COUNSEL THAT DARES TO CONTRADICT YOU",
      url: "mendlyai.io",
    },
  },
};
