import { BRAND, SITE_URL, pageUrl } from "./site";

/**
 * Les données structurées, en JSON-LD.
 *
 * C'est la seule partie de la page que Google lit sans avoir à l'interpréter :
 * elle dit en toutes lettres ce qu'est Mendly, ce qu'il coûte et ce qu'on lui
 * demande le plus souvent. C'est aussi ce que lisent les moteurs de réponse
 * (les assistants IA) quand on leur demande « c'est quoi Mendly ». Sans elle,
 * ils doivent deviner à partir du texte visible — et pour un nom aussi disputé
 * que « Mendly », ils se trompent de société.
 */

/** « 19 € » → « 19 ». Le prix affiché reste la seule source. */
function amount(price: string): string {
  const digits = price.replace(/[^\d.,]/g, "").replace(",", ".");
  return digits === "" ? "0" : digits;
}

export function organizationSchema(locale: string) {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND,
    url: pageUrl(locale, "/"),
    logo: `${SITE_URL}/icons/mendly-512.png`,
    email: "hello@mendlyai.io",
  };
}

export function websiteSchema(locale: string, description: string) {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: BRAND,
    url: pageUrl(locale, "/"),
    description,
    inLanguage: locale,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

interface PlanInput {
  name: string;
  price: string;
  description: string;
}

export function softwareSchema(locale: string, description: string, plans: PlanInput[]) {
  return {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#app`,
    name: BRAND,
    url: pageUrl(locale, "/"),
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "AI decision support",
    operatingSystem: "Web",
    description,
    inLanguage: locale,
    publisher: { "@id": `${SITE_URL}/#organization` },
    offers: plans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: amount(plan.price),
      priceCurrency: "EUR",
      description: plan.description,
      url: pageUrl(locale, "/"),
      availability: "https://schema.org/InStock",
    })),
  };
}

export function faqSchema(entries: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

/** Un seul graphe par page : plusieurs blocs séparés se lisent moins bien. */
export function graph(nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
