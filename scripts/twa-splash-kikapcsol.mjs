/**
 * twa-splash-kikapcsol.mjs — a TWA NATÍV betöltőképét teljesen kikapcsolja.
 *
 * ⚠️⚠️ MIÉRT NEM VOLT ELÉG AZ ÁTLÁTSZÓ KÉP (az előző, HIBÁS javítás):
 * a natív TWA-splash nem egy réteg a weblap FÖLÖTT, hanem egy külön natív
 * képernyő, amely ELTAKARJA a Custom Tabot addig, amíg a lap be nem töltődik.
 * Amíg látszik, a weblap MÉG NEM IS FUT — tehát az app saját animált jelzője
 * nem lehet mögötte. Átlátszó képpel a felhasználó nem az animációt látta,
 * hanem a natív képernyő puszta HÁTTERÉT: egy üres, világos felületet.
 * (Mérve 1.8-on: „csak egy fehér betöltő képernyő".)
 *
 * A megoldás ezért nem a kép, hanem a képernyő: ha a
 * `SPLASH_IMAGE_DRAWABLE` meta-data NINCS a manifestben, az
 * androidbrowserhelper egyáltalán nem hoz létre splash-stratégiát, és a
 * LauncherActivity azonnal megnyitja a Custom Tabot. Onnantól amit a
 * felhasználó lát, az a WEB saját betöltése — pont, mint böngészőben.
 *
 * ⚠️ A `bubblewrap update` MINDEN alkalommal visszaírja a meta-datát, ezért ezt
 * a szkriptet MINDEN update UTÁN, a build ELŐTT le kell futtatni. Ezt az
 * `npm run twa:update` elvégzi. Az `android/` gitignore-olt, tehát a javítást
 * nem lehet bekommitolni — csak ez a szkript és az `android/README.md` őrzi meg.
 *
 * A splash.png-ket is átlátszóra cseréli, hogy ha valamiért mégis marad
 * splash-útvonal (régi androidbrowserhelper), akkor se villanjon be a tűs logó.
 */
import sharp from "sharp";
import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ANDROID = resolve(dirname(fileURLToPath(import.meta.url)), "..", "android");
const RES = join(ANDROID, "app", "src", "main", "res");
const MANIFEST = join(ANDROID, "app", "src", "main", "AndroidManifest.xml");

/**
 * Kiveszi a natív splash-t bekapcsoló meta-data elemeket a manifestből.
 * Külön függvény, hogy tesztelhető legyen — az `android/` mappa gitignore-olt,
 * így a valódi kimenetre nem lehet tesztet írni.
 *
 * @param {string} xml az AndroidManifest.xml tartalma
 * @returns {{ xml: string, eltavolitva: string[] }}
 */
export function splashMetaDataNelkul(xml) {
  const KULCSOK = [
    "android.support.customtabs.trusted.SPLASH_IMAGE_DRAWABLE",
    "android.support.customtabs.trusted.SPLASH_SCREEN_BACKGROUND_COLOR",
    "android.support.customtabs.trusted.SPLASH_SCREEN_FADE_OUT_DURATION",
  ];
  const eltavolitva = [];
  let ki = xml;
  for (const kulcs of KULCSOK) {
    // Egy `<meta-data ... android:name="<kulcs>" ... />` elem, akárhány sorban.
    const minta = new RegExp(
      `[ \\t]*<meta-data\\b(?:(?!/>|</meta-data>)[\\s\\S])*?${kulcs.replace(/\./g, "\\.")}[\\s\\S]*?/>\\s*`,
      "g",
    );
    const elotte = ki;
    ki = ki.replace(minta, "");
    if (ki !== elotte) eltavolitva.push(kulcs);
  }
  return { xml: ki, eltavolitva };
}

// A modul importálható tesztből; a mellékhatás csak közvetlen futtatáskor fut.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const eredeti = await readFile(MANIFEST, "utf8");
  const { xml, eltavolitva } = splashMetaDataNelkul(eredeti);
  if (eltavolitva.length) {
    await writeFile(MANIFEST, xml, "utf8");
    for (const k of eltavolitva) console.log(`  ✔  meta-data eltávolítva: ${k.split(".").pop()}`);
  } else if (/SPLASH_IMAGE_DRAWABLE/.test(eredeti)) {
    console.error("⚠️  A SPLASH_IMAGE_DRAWABLE benne van, de a minta nem fogta meg — a manifest formátuma változott.");
    process.exit(1);
  } else {
    console.log("  ·  a manifestben már nincs natív splash meta-data");
  }

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
    await sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .png({ compressionLevel: 9 })
      .toFile(p);
    db++;
  }
  console.log(`  ✔  ${db} splash.png átlátszóra cserélve (tartalék)`);
  console.log("\nKész: a natív betöltőképernyő ki van kapcsolva. Most jöhet a `bubblewrap build`.");
}
