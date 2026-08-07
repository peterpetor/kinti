import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

/**
 * A maskable app-ikon őre.
 *
 * ⚠️⚠️ VALÓS HIBÁBÓL (2026-08-07). A telefon kezdőképernyőjén a Kinti ikonja
 * értelmezhetetlen piros-fehér-zöld sávokként jelent meg. Az ok: a maskable
 * ikon a teljes vásznat kitöltötte, ÁTLÁTSZÓ háttérrel — az Android launcher
 * viszont tetszőleges alakra (kör, lekerekített négyzet, csepp) vágja, így a
 * térkép-tű hegye és oldala levágódott.
 *
 * A maskable ikonra KÉT kötelező szabály van, és a hiba MINDKETTŐT sértette:
 *   1. csak a vászon KÖZÉPSŐ 80%-a garantált (512-nél 409 px átmérőjű kör),
 *   2. a háttérnek TELJESEN FEDETTNEK kell lennie.
 *
 * ⚠️ Ránézésre ez NEM látszik: a fájl négyzetesen megnyitva tökéletes. Csak
 * körre vágva derül ki — ezért mér ez a teszt, nem szemlél.
 */

const GYOKER = resolve(__dirname, "../..");
const IKONOK = [
  "public/icons/icon-maskable-192-v2.png",
  "public/icons/icon-maskable-512-v2.png",
  "public/icons/icon-maskable-192.png",
  "public/icons/icon-maskable-512.png",
];
/** A manifest background_color-ja; a generátor ezzel tölti ki a hátteret. */
const HATTER = [0xf4, 0xed, 0xe0];

async function mer(p: string) {
  const { data, info } = await sharp(resolve(GYOKER, p))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const sugarHatar = (W * 0.8) / 2;
  let atlatszo = 0;
  let kilogo = 0;
  let maxSugar = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * C;
      if (data[i + 3] < 255) atlatszo++;
      const eltero =
        Math.abs(data[i] - HATTER[0]) > 12 ||
        Math.abs(data[i + 1] - HATTER[1]) > 12 ||
        Math.abs(data[i + 2] - HATTER[2]) > 12;
      if (!eltero) continue;
      const d = Math.hypot(x + 0.5 - W / 2, y + 0.5 - H / 2);
      if (d > maxSugar) maxSugar = d;
      if (d > sugarHatar) kilogo++;
    }
  }
  return { W, H, atlatszo, kilogo, kitoltesSzazalek: (maxSugar / (W / 2)) * 100 };
}

describe("⚠️⚠️ az ikonok gyorsítótár-szabálya", () => {
  /**
   * ⚠️ EZ VOLT A VALÓDI GYÖKÉR-OK 2026-08-07-én. Az ikon-javítást kétszer is
   * kideployoltuk, a telefonon mégis a régi kép maradt — és a hibát előbb a
   * rajzra, majd az Android-buildre fogtuk. Valójában a `_headers` adott
   * `immutable` fejlécet a `/icons/*` útvonalnak, ami azt ígéri a CDN-nek,
   * hogy az URL tartalma SOHA nem változik: egy évig a régit szolgálta ki
   * (`cf-cache-status: HIT`, `Age: 46740`).
   *
   * Az `immutable` CSAK tartalomhoz kötött (hash-elt) fájlnévnél helyes.
   * Az ikonok neve fix, tehát ott TILOS.
   */
  const HEADERS = olvasHeaders();

  it("a /icons/* NEM kap `immutable` fejlécet", () => {
    const blokk = ikonBlokk(HEADERS);
    expect(blokk, "nincs /icons/* szabály a _headers-ben").not.toBeNull();
    expect(blokk!, "immutable + fix fájlnév = a csere sosem jut ki").not.toMatch(/immutable/);
  });

  it("a /icons/* cache-e rövid és újraérvényesít", () => {
    const blokk = ikonBlokk(HEADERS)!;
    const m = blokk.match(/max-age=(\d+)/);
    expect(m, "nincs max-age a /icons/* szabályban").not.toBeNull();
    // Egy nap alatt ki kell jutnia egy ikoncserének.
    expect(Number(m![1])).toBeLessThanOrEqual(86_400);
    expect(blokk).toMatch(/must-revalidate|no-cache/);
  });

  it("a hash-elt nevű erőforrások VISZONT maradhatnak immutable", () => {
    // A megkülönböztetés a lényeg: a betűtípus- és a Next-bundle-nevek a
    // tartalomhoz kötöttek, ott az `immutable` helyes és hasznos.
    expect(HEADERS).toMatch(/\/_next\/static\/\*[\s\S]{0,120}immutable/);
  });
});

function olvasHeaders() {
  return readFileSync(resolve(GYOKER, "public/_headers"), "utf8").replace(/\r\n/g, "\n");
}
/** A `/icons/*` szabály törzse a következő üres sorig. */
function ikonBlokk(h: string) {
  const i = h.indexOf("\n/icons/*");
  if (i < 0) return null;
  const utana = h.slice(i + 1);
  return utana.slice(0, utana.indexOf("\n\n") + 1 || utana.length);
}

describe("maskable app-ikon", () => {
  it("⚠️ TELJESEN FEDETT — átlátszó pixel maskable ikonban tilos", async () => {
    for (const p of IKONOK) {
      const m = await mer(p);
      expect(m.atlatszo, `${p}: ${m.atlatszo} átlátszó pixel`).toBe(0);
    }
  }, 30_000);

  it("⚠️ a logó a 80%-os BIZTONSÁGI ZÓNÁN BELÜL van — különben a launcher levágja", async () => {
    for (const p of IKONOK) {
      const m = await mer(p);
      expect(m.kilogo, `${p}: ${m.kilogo} logó-pixel a biztonsági körön kívül`).toBe(0);
    }
  }, 30_000);

  it("de nem is aránytalanul kicsi (a zóna érdemi részét kitölti)", async () => {
    // Ha valaki „biztonságra” túl kicsire veszi, az ikon elveszik a launcherben.
    for (const p of IKONOK) {
      const m = await mer(p);
      expect(m.kitoltesSzazalek, `${p}: a logó csak a sugár ${m.kitoltesSzazalek.toFixed(1)}%-áig ér`).toBeGreaterThan(55);
      expect(m.kitoltesSzazalek).toBeLessThanOrEqual(80);
    }
  }, 30_000);

  it("a méretek egyeznek a manifestben deklarálttal", async () => {
    const mf = JSON.parse(readFileSync(resolve(GYOKER, "public/manifest.webmanifest"), "utf8"));
    const maskable = mf.icons.filter((i: { purpose?: string }) => i.purpose === "maskable");
    expect(maskable.length, "nincs maskable ikon a manifestben").toBeGreaterThanOrEqual(2);
    for (const ikon of maskable) {
      const m = await mer(`public${ikon.src}`);
      expect(`${m.W}x${m.H}`, `${ikon.src}: a fájl mérete nem egyezik a deklarálttal`).toBe(ikon.sizes);
    }
  }, 30_000);
});
