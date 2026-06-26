/**
 * Iránytű (benchmark) kanonikus konstansok — KLIENS és SZERVER közös forrása.
 * Szándékosan függőség-mentes (nincs D1/cloudflare import), hogy a kliens-bundle
 * is biztonságosan importálhassa, ÉS az API-route is validálhasson belőle.
 *
 * FONTOS: a benckmark egy KÖZÖSSÉGI adat (mindenkinek megjelenik a statisztika,
 * a hőtérkép és az iparág-legördülő). A beküldő API a bizalmi határ — sosem szabad
 * a kliensből jött iparág/régió-értéket vakon elfogadni, különben tetszőleges
 * (kamu) iparágak/régiók pollutálhatják a mindenki által látott statisztikát.
 */

/** A benchmark-beküldő engedélyezett iparágai (a legördülő forrása is). */
export const BENCHMARK_INDUSTRIES = [
  "Informatika (IT)",
  "Vendéglátás / Szálloda",
  "Építőipar",
  "Egészségügy / Ápolás",
  "Pénzügy / Bank / Biztosítás",
  "Mérnök / Gyártás",
  "Logisztika / Szállítás",
  "Oktatás / Tudomány",
  "Kereskedelem / Retail",
  "Egyéb",
] as const;

export function isValidBenchmarkIndustry(s: unknown): s is string {
  return typeof s === "string" && (BENCHMARK_INDUSTRIES as readonly string[]).includes(s);
}

/** A lakbér-beküldő engedélyezett szobaszámai. */
export const BENCHMARK_ROOMS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;

export function isValidBenchmarkRooms(n: unknown): n is number {
  return typeof n === "number" && (BENCHMARK_ROOMS as readonly number[]).includes(n);
}
