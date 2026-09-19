/**
 * Les images fixes du site, rendues depuis les compositions Remotion.
 *
 * Sortie dans le `public/` du SITE (et non celui de la vidéo), puisque ce sont
 * des fichiers que les robots et les réseaux vont chercher à la racine :
 *   public/og/mendly-<langue>.png  → la vignette de partage (1200 × 630)
 *   public/icons/mendly-<taille>.png → les icônes du manifeste et d'iOS
 *
 * Ces fichiers-là sont versionnés : ils doivent exister sur le site déployé,
 * et ils ne pèsent que quelques dizaines de kilo-octets.
 *
 * Usage : npm run social
 */
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const videoRoot = path.resolve(import.meta.dirname, "..");
const siteRoot = path.resolve(videoRoot, "..");

const TARGETS = [
  { id: "OgCard", props: { locale: "fr" }, out: "public/og/mendly-fr.png", scale: 1 },
  { id: "OgCard", props: { locale: "en" }, out: "public/og/mendly-en.png", scale: 1 },
  { id: "Mark", props: {}, out: "public/icons/mendly-512.png", scale: 1 },
  { id: "Mark", props: {}, out: "public/icons/mendly-192.png", scale: 192 / 512 },
  { id: "Mark", props: {}, out: "public/icons/mendly-180.png", scale: 180 / 512 },
];

const serveUrl = await bundle({ entryPoint: path.join(videoRoot, "src/index.ts") });

for (const target of TARGETS) {
  // La composition est résolue AVEC ses propriétés : listée sans elles, elle
  // garde ses valeurs par défaut et les deux langues sortent identiques.
  const composition = await selectComposition({ serveUrl, id: target.id, inputProps: target.props });
  const output = path.join(siteRoot, target.out);
  mkdirSync(path.dirname(output), { recursive: true });
  await renderStill({
    composition,
    serveUrl,
    output,
    frame: 0,
    scale: target.scale,
    imageFormat: "png",
    inputProps: target.props,
    overwrite: true,
  });
  console.log(`→ ${target.out}`);
}
