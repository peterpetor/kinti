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

/**
 * ⚠️⚠️ A MASKABLE IKON MÁS SZABÁLY SZERINT KÉSZÜL, MINT A TÖBBI.
 *
 * Az Android adaptív ikonként kezeli, és a launcher TETSZŐLEGES alakra vágja
 * (kör, lekerekített négyzet, csepp). Ezért két dolgot KÖTELEZŐ betartani:
 *
 *  1. BIZTONSÁGI ZÓNA: csak a vászon KÖZÉPSŐ 80%-a garantált (512-nél egy
 *     409 px átmérőjű kör). Ami ezen kívül esik, LEVÁGÓDHAT.
 *  2. TELJESEN FEDETT HÁTTÉR: átlátszó maskable ikonnál a launcher tölti ki
 *     a hátteret, kiszámíthatatlan eredménnyel.
 *
 * ⚠️ 2026-08-07-ig EGYIK SEM teljesült: a tű a teljes vásznat kitöltötte,
 * átlátszó háttérrel. A telefonon emiatt a tű hegye és oldala levágódott, és
 * csak a közepe látszott — értelmezhetetlen piros-fehér-zöld sávokként.
 * Ha ránézésre teszteled, MINDIG körre vágva nézd, ne négyzetesen.
 */
const MASKABLE_HATTER = "#f4ede0"; // = a manifest background_color (márka-felület)
/** A logó a vászon hány százalékát töltse ki. 72% bőven a 80%-os zónán belül. */
const MASKABLE_ARANY = 0.72;

/** [forrásSVG, kimeneti név, méret] */
const TARGETS = [
  [ANY_SVG, "icon-192.png", 192],
  [ANY_SVG, "icon-256.png", 256],
  [ANY_SVG, "icon-384.png", 384],
  [ANY_SVG, "icon-512.png", 512],
  [ANY_SVG, "apple-touch-icon.png", 180],
  [ANY_SVG, "favicon-32.png", 32],
  [ANY_SVG, "favicon-16.png", 16],
];
/**
 * ⚠️ VERZIÓZOTT FÁJLNÉV — NE VEDD KI.
 * A `/icons/*` sokáig `immutable` cache-fejlécet kapott, ezért egy fix nevű
 * ikon cseréje SOHA nem jutott ki a felhasználókhoz: a Cloudflare egy évig a
 * régit szolgálta ki. A fejléc azóta rövid cache + újraérvényesítés, DE a
 * korábban gyorsítótárazott bejegyzések csak új URL-lel kerülhetők meg.
 * Ha legközelebb változik a rajz, EMELD EZT A SZÁMOT, és írd át a
 * `public/manifest.webmanifest` és az `android/twa-manifest.json` hivatkozását.
 */
const MASKABLE_VERZIO = 2;
const MASKABLE_TARGETS = [
  [`icon-maskable-192-v${MASKABLE_VERZIO}.png`, 192],
  [`icon-maskable-512-v${MASKABLE_VERZIO}.png`, 512],
  // A régi, verziótlan nevek is elkészülnek: régi telepítések gyorsítótárazott
  // manifestje még ezekre hivatkozhat, és így ott is a javított kép szolgál ki,
  // amint a mérgezett cache-bejegyzés lejár.
  ["icon-maskable-192.png", 192],
  ["icon-maskable-512.png", 512],
];

await mkdir(ICONS_DIR, { recursive: true });
for (const [svg, name, size] of TARGETS) {
  const out = resolve(ICONS_DIR, name);
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`  ✔  ${name}  (${size}×${size})`);
}

for (const [name, size] of MASKABLE_TARGETS) {
  const belso = Math.round(size * MASKABLE_ARANY);
  // `trim()`: a forrás körüli átlátszó keretet levágjuk, különben a logó
  // kétszeresen is beljebb kerülne, és túl kicsi lenne a vásznon.
  const logo = await sharp(MASK_SVG, { density: 768 })
    .trim()
    .resize(belso, belso, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const out = resolve(ICONS_DIR, name);
  await sharp({
    create: { width: size, height: size, channels: 4, background: MASKABLE_HATTER },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .flatten({ background: MASKABLE_HATTER }) // garantáltan átlátszatlan
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`  ✔  ${name}  (${size}×${size}, logó ${belso}px a ${size}px vásznon)`);
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
