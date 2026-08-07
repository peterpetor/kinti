/**
 * twa-splash-atlatszo.mjs — a TWA natív betöltőképét ÁTLÁTSZÓRA cseréli.
 *
 * ⚠️ MIÉRT KELL: a Bubblewrap minden `update`-nél legenerálja minden sűrűség
 * `drawable-.../splash.png` fájlját az `iconUrl`-ből, és a natív TWA-splash ezt mutatja
 * a háttérszínen, amíg a webnézet ki nem fest. Így a felhasználó a STATIKUS
 * logót látja — az app SAJÁT, animált (pulzáló) betöltő-jelzője helyett, ami a
 * `html[data-country-pending]::after`-ben él.
 *
 * Átlátszó splash-sel a natív réteg csak a háttérszínt (#F4EDE0) mutatja, ami
 * megegyezik az app hátterével — így a váltás észrevehetetlen, és amint a lap
 * kifest, rögtön az animált jelző jön.
 *
 * ⚠️ MÉRT INDOK: az első festés melegen ~312 ms, hidegen ~850 ms. Ennyi ideig
 * látszik a sima krém felület. A natív splash tehát nem hiányzik.
 *
 * ⚠️⚠️ A `bubblewrap update` MINDIG felülírja a splash.png-ket, ezért ezt a
 * szkriptet MINDEN update UTÁN, a build ELŐTT le kell futtatni:
 *
 *     cd android && npx @bubblewrap/cli@1.25.0 update
 *     node ../scripts/twa-splash-atlatszo.mjs
 *     npx @bubblewrap/cli@1.25.0 build
 *
 * (Az `android/` mappa gitignore-olt, ezért nem lehet a javítást bekommitolni —
 * csak ez a szkript és az `android/README.md` őrzi meg a tudást.)
 */
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RES = resolve(dirname(fileURLToPath(import.meta.url)), "..", "android", "app", "src", "main", "res");

let db = 0;
for (const konyvtar of await readdir(RES)) {
  if (!konyvtar.startsWith("drawable")) continue;
  const p = join(RES, konyvtar, "splash.png");
  try {
    await stat(p);
  } catch {
    continue; // ebben a sűrűségben nincs splash
  }
  const { width, height } = await sharp(p).metadata();
  // Ugyanaz a méret, csak teljesen átlátszó — a Bubblewrap méret-elvárásai így sértetlenek.
  await sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png({ compressionLevel: 9 })
    .toFile(p);
  console.log(`  ✔  ${konyvtar}/splash.png  (${width}×${height}, átlátszó)`);
  db++;
}

if (db === 0) {
  console.error("⚠️  Egy splash.png-t sem találtam. Futott már a `bubblewrap update`?");
  process.exit(1);
}
console.log(`\nKész: ${db} betöltőkép átlátszóra cserélve. Most jöhet a \`bubblewrap build\`.`);
