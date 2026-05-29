/**
 * Anonim handle-generátor — a felhasználói nevek helyett auto-derivált
 * "VidámPék_42" stílusú név a rekord id-jéből (Reddit-szerű).
 *
 * Tervezési cél:
 *   • Zéró PII a DB-ben (semmilyen név-mező)
 *   • Determinikus: ugyanaz a rekord MINDIG ugyanazt a handle-t kapja
 *   • Privátabb mint a 'first-name': ugyanaz a user különböző rekord-jain
 *     KÜLÖNBÖZŐ handle (nem követhetők össze)
 *   • Olvasható: magyar jelző + főnév + szám (10-99)
 *
 * A tér mérete ~108 000 (30 × 40 × 90). Ütközés OK, mert nem unique ID-ként
 * használjuk — csak megjelenítésre.
 */

const ADJ = [
  "Vidám", "Bátor", "Kedves", "Okos", "Friss", "Gyors", "Csendes",
  "Aranyos", "Pajkos", "Bohókás", "Vagány", "Nyugodt", "Mókás", "Tarka",
  "Lágy", "Erős", "Édes", "Ügyes", "Halk", "Furcsa", "Csodás", "Élénk",
  "Mosolygós", "Csillogó", "Békés", "Játékos", "Boldog", "Csöndes",
  "Lágy", "Bohém",
];

const NOUN = [
  "Pék", "Kávé", "Hold", "Csillag", "Nap", "Tó", "Hegy", "Erdő",
  "Felhő", "Szellő", "Eső", "Hó", "Köd", "Bagoly", "Róka", "Mókus",
  "Sün", "Béka", "Madár", "Hal", "Virág", "Levél", "Mag", "Méz", "Tea",
  "Bor", "Cipó", "Tök", "Dió", "Pite", "Sajt", "Vaj", "Tészta", "Leves",
  "Almafa", "Mákos", "Tejszín", "Habverő", "Tavasz", "Ősz",
];

/** Stabil 32-bites hash egy string id-ből — FNV-1a egyszerűsítve. */
function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

/**
 * Egyetlen rekord id-jéből generál egy magyar handle-t, pl.:
 *   "fbb8f291-2b59-46c2-a08b-..." → "VidámPék_42"
 *
 * A handle determinikus: ugyanaz az id MINDIG ugyanazt adja.
 */
export function handleFromId(id: string | null | undefined): string {
  if (!id) return "VidámKinti_00";
  const h = hash32(id);
  const adj = ADJ[h % ADJ.length];
  const noun = NOUN[Math.floor(h / ADJ.length) % NOUN.length];
  const num = (Math.floor(h / (ADJ.length * NOUN.length)) % 90) + 10;
  return `${adj}${noun}_${num}`;
}

/**
 * Egy karakter "avatar-kezdőbetű" a handle első betűjéből — ha valahol egy
 * kis kör-jelvényre kell a handle helyett.
 */
export function handleInitial(id: string | null | undefined): string {
  return handleFromId(id).charAt(0);
}
