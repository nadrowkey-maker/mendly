import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/seo/site";

/**
 * Le manifeste d'application.
 *
 * Il sert à l'installation sur mobile, mais aussi à Google : c'est lui qui
 * fournit le nom court et les icônes quand le site est ajouté à un écran
 * d'accueil ou affiché dans les résultats sur téléphone.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND} — the counsel that dares to contradict you`,
    short_name: BRAND,
    description:
      "An AI counsel for solo founders: it challenges your plan, exposes its own contradictions, decides, and keeps working while you are away.",
    start_url: "/en/",
    display: "standalone",
    background_color: "#FBFAF8",
    theme_color: "#0E0E0F",
    icons: [
      { src: "/icons/mendly-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/mendly-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/mendly-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
