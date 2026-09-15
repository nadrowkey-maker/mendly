/**
 * Captures haute définition du vrai produit, pour la vidéo publicitaire.
 *
 * La vidéo pose ces images sur des plans en 3D et la caméra plonge dedans :
 * elles doivent rester nettes en très gros plan. D'où la densité de pixels ×2
 * (×3 pour le format téléphone) — un écran de 1440 points sort en 2880 pixels.
 *
 * Les scènes sont les pages de capture du site (/[locale]/preview/*), servies
 * uniquement en développement, avec un projet de démonstration fictif. Aucun
 * compte réel n'apparaît dans une publicité.
 *
 * Usage : npm run dev (dans un autre terminal), puis
 *         node scripts/capture-video-shots.mjs [fr|en]
 *   → video/public/product/<locale>/*.png
 */
import { launch } from "puppeteer-core";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.CAPTURE_BASE ?? "http://localhost:3000";
const LOCALE = process.argv[2] ?? "fr";
const OUT = resolve(ROOT, "video/public/product", LOCALE);
mkdirSync(OUT, { recursive: true });

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => existsSync(p));

const SHOTS = [
  { name: "workspace", path: "preview/workspace/", w: 1440, h: 900, dpr: 2 },
  { name: "contradiction", path: "preview/contradiction/", w: 1440, h: 900, dpr: 2 },
  { name: "debate", path: "preview/debate/", w: 1440, h: 1400, dpr: 2 },
  { name: "room", path: "preview/room/", w: 1440, h: 900, dpr: 2 },
  { name: "dashboard", path: "preview/night/", w: 1440, h: 900, dpr: 2 },
  { name: "intake", path: "preview/intake/", w: 1440, h: 900, dpr: 2 },
  { name: "landing", path: "", w: 1440, h: 900, dpr: 2 },
  { name: "phone-chat", path: "preview/contradiction/", w: 390, h: 844, dpr: 3 },
  { name: "phone-debate", path: "preview/debate/", w: 390, h: 844, dpr: 3 },
];

const browser = await launch({
  executablePath: process.env.CHROME_PATH ?? CHROME,
  headless: true,
  args: ["--hide-scrollbars", "--font-render-hinting=none"],
});

try {
  for (const shot of SHOTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: shot.w, height: shot.h, deviceScaleFactor: shot.dpr });
    await page.goto(`${BASE}/${LOCALE}/${shot.path}`, { waitUntil: "networkidle0", timeout: 90000 });
    await page.addStyleTag({ content: "nextjs-portal,[data-nextjs-toast]{display:none!important}" });
    await page.evaluate(() => document.fonts.ready);
    // Les entrées animées doivent être posées avant la prise : on attend que
    // plus rien ne soit à mi-opacité.
    await page
      .waitForFunction(
        () =>
          [...document.querySelectorAll("main [style*='opacity']")].every((el) => {
            const o = parseFloat(getComputedStyle(el).opacity);
            return Number.isNaN(o) || o > 0.98;
          }),
        { timeout: 15000 }
      )
      .catch(() => console.warn(`  ${shot.name} : animations non stabilisées`));
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: resolve(OUT, `${shot.name}.png`) });
    await page.close();
    console.log(`${shot.name} → video/public/product/${LOCALE}/${shot.name}.png`);
  }
} finally {
  await browser.close();
}
