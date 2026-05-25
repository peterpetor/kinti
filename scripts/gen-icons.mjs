// Egyszer kell futtatni (vagy ha frissül az SVG): `npm run gen:icons`.
// Az SVG forrásokból ki-rendereli a PWA-hoz szükséges PNG-méreteket.
//
// Telepítés:  npm i -D sharp
// Futás:      node scripts/gen-icons.mjs

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error(
    "[gen-icons] Hiányzik a `sharp`. Telepítsd:  npm i -D sharp\n" +
      "Vagy generáld bármilyen SVG→PNG eszközzel (Figma, Inkscape, realfavicongenerator).",
  );
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = resolve(__dirname, "..", "public", "icons");

const ANY_SVG = await readFile(resolve(ICONS_DIR, "kinti.svg"));
const MASK_SVG = await readFile(resolve(ICONS_DIR, "kinti-maskable.svg"));

/** [forrásSVG, kimeneti név, méret] */
const TARGETS = [
  [ANY_SVG, "icon-192.png", 192],
  [ANY_SVG, "icon-256.png", 256],
  [ANY_SVG, "icon-384.png", 384],
  [ANY_SVG, "icon-512.png", 512],
  [ANY_SVG, "apple-touch-icon.png", 180],
  [ANY_SVG, "favicon-32.png", 32],
  [ANY_SVG, "favicon-16.png", 16],
  [MASK_SVG, "icon-maskable-192.png", 192],
  [MASK_SVG, "icon-maskable-512.png", 512],
];

await mkdir(ICONS_DIR, { recursive: true });
for (const [svg, name, size] of TARGETS) {
  const out = resolve(ICONS_DIR, name);
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`  ✔  ${name}  (${size}×${size})`);
}

// Egyszerű favicon.ico is jól jön a böngészők fülén; a sharp 0.33-tól tudja.
try {
  const ico = await sharp(ANY_SVG, { density: 384 })
    .resize(64, 64, { fit: "cover" })
    .png()
    .toBuffer();
  await writeFile(resolve(__dirname, "..", "public", "favicon.ico"), ico);
  console.log("  ✔  favicon.ico (64×64 PNG-be csomagolva)");
} catch (err) {
  console.warn("  ⚠  favicon.ico nem készült el:", err?.message ?? err);
}

console.log("\nKész. Az új ikonok a public/icons/ alatt.");
