/**
 * Les constantes du site, telles que Google doit les voir.
 *
 * Le domaine canonique est `www.mendlyai.io` : le domaine nu répond par une
 * redirection 307 vers lui. Écrire les adresses sans `www` enverrait donc les
 * moteurs sur une redirection à chaque lien — et deux adresses pour une même
 * page, c'est un signal de contenu dupliqué.
 *
 * Toutes les adresses se terminent par une barre oblique, parce que
 * `next.config.ts` fixe `trailingSlash: true` : une adresse canonique qui ne
 * correspond pas à celle réellement servie annule tout le bénéfice.
 */
/**
 * Le domaine est écrit ici, pas lu dans `NEXT_PUBLIC_SITE_URL`.
 *
 * Cette variable-là sert à fabriquer les liens de l'application et vaut
 * `http://localhost:3000` en développement : branchée sur les canoniques, elle
 * publierait des adresses locales dans le HTML dès qu'un environnement est mal
 * réglé — et une canonique fausse retire la page de l'index. Le domaine
 * canonique d'un site ne change qu'en cas de déménagement ; il n'a rien à
 * faire dans la configuration.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_CANONICAL_URL ?? "https://www.mendlyai.io").replace(/\/+$/, "");

export const BRAND = "Mendly";

export const SEO_LOCALES = ["en", "fr"] as const;
export type SeoLocale = (typeof SEO_LOCALES)[number];

/** La langue servie quand le visiteur n'en demande aucune. */
export const DEFAULT_LOCALE: SeoLocale = "en";

/** Forme attendue par Open Graph : langue_PAYS, pas le code court. */
export const OG_LOCALE: Record<SeoLocale, string> = {
  en: "en_US",
  fr: "fr_FR",
};

export function isSeoLocale(value: string): value is SeoLocale {
  return (SEO_LOCALES as readonly string[]).includes(value);
}

/** `/fr/manifesto/` — toujours une langue, toujours une barre finale. */
export function localePath(locale: string, path: string): string {
  const clean = path === "/" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  return `/${locale}${clean}/`;
}

/** L'adresse absolue d'une page, pour les canoniques et le partage. */
export function pageUrl(locale: string, path: string): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

export interface IndexedPage {
  /** Chemin sans la langue : "/" pour l'accueil. */
  path: string;
  /** Clé de description dans le fichier de traduction, section `seo`. */
  key: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
}

/**
 * Les pages que Google a le droit d'indexer, et elles seules.
 *
 * L'atelier, les réglages, l'accueil guidé, les écrans de connexion et les
 * scènes de contrôle visuel n'y sont pas : ce sont des pages privées ou des
 * doublons de contenu, et les laisser entrer dilue le site aux yeux des
 * moteurs. La liste sert à la fois au plan du site et aux liens entre langues.
 */
export const INDEXED_PAGES: IndexedPage[] = [
  { path: "/", key: "home", priority: 1, changeFrequency: "weekly" },
  { path: "/manifesto", key: "manifesto", priority: 0.8, changeFrequency: "monthly" },
  { path: "/help", key: "help", priority: 0.7, changeFrequency: "monthly" },
  { path: "/security", key: "security", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", key: "contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/status", key: "status", priority: 0.4, changeFrequency: "weekly" },
  { path: "/terms", key: "terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", key: "privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", key: "cookies", priority: 0.2, changeFrequency: "yearly" },
  { path: "/refund", key: "refund", priority: 0.2, changeFrequency: "yearly" },
  { path: "/legal", key: "legal", priority: 0.2, changeFrequency: "yearly" },
];

/** Les chemins interdits aux robots : privés, ou sans contenu à indexer. */
export const PRIVATE_PATHS = [
  "/api/",
  "/auth/",
  "/*/dashboard/",
  "/*/settings/",
  "/*/onboarding/",
  "/*/upgrade/",
  "/*/preview/",
  "/*/waitlist/",
  "/*/login/",
  "/*/signup/",
  "/*/forgot-password/",
  "/*/reset-password/",
];
