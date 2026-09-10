/**
 * Produit les captures du produit qui illustrent la page d'accueil.
 *
 * Pourquoi un script plutôt que le mode capture de Chrome en ligne de
 * commande : ce dernier prend l'image dès l'événement `load`, sans attendre
 * l'hydratation ni les animations d'entrée. Une capture sur deux sortait avec
 * les cartes encore à opacité zéro — c'est-à-dire une page vide, et on ne s'en
 * aperçoit qu'en ouvrant le fichier.
 *
 * Ici on attend explicitement que les éléments animés soient opaques avant de
 * déclencher, ce qui rend la capture reproductible.
 *
 * Usage :
 *   1. npm run dev        (dans un autre terminal)
 *   2. node scripts/capture-product.mjs
 *
 * Les pages source sont sous /[locale]/preview/[shot], fermées en production.
 */
import { launch } from "puppeteer-core";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.CAPTURE_BASE ?? "http://localhost:3000";
const LOCALE = process.env.CAPTURE_LOCALE ?? "fr";

/** Chrome installé sur la machine — aucun navigateur n'est téléchargé. */
const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

const SHOTS = [
  { name: "workspace", width: 1440, height: 900 },
  { name: "contradiction", width: 1440, height: 900 },
  { name: "room", width: 1440, height: 900 },
  { name: "night", width: 1440, height: 900 },
  { name: "intake", width: 1440, height: 700 },
];

function findChrome() {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) {
    throw new Error(
      "Aucun Chrome trouvé. Renseigne CHROME_PATH avec le chemin de l'exécutable."
    );
  }
  return found;
}

const browser = await launch({
  executablePath: process.env.CHROME_PATH ?? findChrome(),
  headless: true,
  // Le facteur 2 donne une image nette sur écran dense. La page d'accueil la
  // sert ensuite réduite : mieux vaut réduire une image nette qu'agrandir une
  // image juste.
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  args: ["--disable-gpu", "--hide-scrollbars", "--font-render-hinting=none"],
});

try {
  for (const shot of SHOTS) {
    const page = await browser.newPage();
    await page.setViewport({
      width: shot.width,
      height: shot.height,
      deviceScaleFactor: 2,
    });

    const url = `${BASE}/${LOCALE}/preview/${shot.name}/`;
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

    // Le badge d'outils de Next se pose en bas à gauche, c'est-à-dire pile sur
    // la barre latérale. Il s'était invité dans la première série de captures,
    // et sur la page d'accueil il passait pour un élément de l'interface.
    await page.addStyleTag({
      content: "nextjs-portal, [data-nextjs-toast] { display: none !important; }",
    });

    // Les polices d'abord : capturer pendant le remplacement produit une image
    // à la mauvaise fonte, ce qui ne se rattrape pas au recadrage.
    await page.evaluate(() => document.fonts.ready);

    // Puis l'hydratation et les animations d'entrée. On interroge l'opacité
    // réelle plutôt que d'attendre un délai fixe : un délai marche sur cette
    // machine et échoue sur une machine chargée.
    await page
      .waitForFunction(
        () => {
          const animated = document.querySelectorAll("main [style*='opacity']");
          if (animated.length === 0) return true;
          return [...animated].every((el) => {
            const o = parseFloat(getComputedStyle(el).opacity);
            return Number.isNaN(o) || o > 0.98;
          });
        },
        { timeout: 15000 }
      )
      .catch(() => {
        console.warn(`  ${shot.name} : animations non stabilisées, capture quand même`);
      });

    // Les dégradés granuleux sont peints au fil des images ; deux images de
    // marge suffisent à garantir qu'ils ont un contenu.
    await new Promise((r) => setTimeout(r, 600));

    const out = resolve(ROOT, "public/product", `${shot.name}.png`);
    await page.screenshot({ path: out, type: "png" });
    await page.close();
    console.log(`${shot.name} → public/product/${shot.name}.png`);
  }
} finally {
  await browser.close();
}
