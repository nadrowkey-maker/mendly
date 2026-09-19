import type { MetadataRoute } from "next";
import { PRIVATE_PATHS, SITE_URL } from "@/lib/seo/site";

/**
 * Le fichier robots, servi à /robots.txt.
 *
 * Il n'existait pas : le site répondait 404 à la première adresse que
 * consulte un robot. Rien ne l'empêchait d'explorer, mais rien ne lui
 * indiquait non plus le plan du site, ni ne le tenait à l'écart de l'atelier.
 *
 * Les robots des moteurs de réponse (GPTBot, ClaudeBot, PerplexityBot…) ne
 * sont pas bloqués : aujourd'hui, une part des gens cherche un produit en le
 * demandant à un assistant, et se rendre illisible pour eux revient à
 * disparaître de ce canal.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE_PATHS }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
