import type { Metadata } from "next";
import { BRAND, OG_LOCALE, SEO_LOCALES, SITE_URL, DEFAULT_LOCALE, pageUrl, type SeoLocale } from "./site";

/**
 * La fiche d'une page pour les moteurs et les réseaux.
 *
 * Trois choses manquaient partout et coûtent cher :
 * — l'adresse canonique, sans laquelle `/fr/terms/` et `/en/terms/` peuvent
 *   être lus comme deux pages concurrentes du même site ;
 * — les liens entre langues (`hreflang`), qui disent à Google que ce sont deux
 *   versions d'une même page et laquelle servir selon le pays ;
 * — l'image de partage : sans elle, un lien collé sur X ou LinkedIn sort en
 *   bloc de texte gris, et personne ne clique.
 */
interface BuildMetadataInput {
  locale: string;
  /** Chemin sans la langue : "/" pour l'accueil, "/terms" pour les CGU. */
  path: string;
  /** Titre seul : le gabarit « · Mendly » est ajouté par la mise en page. */
  title: string;
  description: string;
  /** Titre complet, sans le gabarit — réservé à l'accueil. */
  absoluteTitle?: boolean;
  /** Une page privée ou en double se met hors index, mais reste suivable. */
  index?: boolean;
}

export function buildMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle = false,
  index = true,
}: BuildMetadataInput): Metadata {
  const current = (SEO_LOCALES as readonly string[]).includes(locale) ? (locale as SeoLocale) : DEFAULT_LOCALE;
  const url = pageUrl(current, path);

  const languages: Record<string, string> = {};
  for (const l of SEO_LOCALES) languages[l] = pageUrl(l, path);
  languages["x-default"] = pageUrl(DEFAULT_LOCALE, path);

  const image = {
    url: `${SITE_URL}/og/mendly-${current}.png`,
    width: 1200,
    height: 630,
    alt: `${BRAND} — ${description.slice(0, 90)}`,
  };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages },
    robots: index
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } }
      : { index: false, follow: true },
    openGraph: {
      type: "website",
      url,
      siteName: BRAND,
      title: absoluteTitle ? title : `${title} · ${BRAND}`,
      description,
      locale: OG_LOCALE[current],
      alternateLocale: SEO_LOCALES.filter((l) => l !== current).map((l) => OG_LOCALE[l]),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle ? title : `${title} · ${BRAND}`,
      description,
      images: [image.url],
    },
  };
}
