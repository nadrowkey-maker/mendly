import type { MetadataRoute } from "next";
import { INDEXED_PAGES, SEO_LOCALES, pageUrl } from "@/lib/seo/site";

/**
 * Le plan du site, servi à /sitemap.xml.
 *
 * Chaque page y figure une fois par langue, et chaque entrée déclare ses
 * traductions : c'est la forme que Google recommande pour un site bilingue,
 * et elle évite que la version anglaise et la version française se fassent
 * concurrence sur la même requête.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return INDEXED_PAGES.flatMap((page) =>
    SEO_LOCALES.map((locale) => ({
      url: pageUrl(locale, page.path),
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(SEO_LOCALES.map((l) => [l, pageUrl(l, page.path)])),
      },
    }))
  );
}
