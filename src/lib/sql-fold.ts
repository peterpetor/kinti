/**
 * sql-fold.ts — ékezet-érzéketlen keresés SQLite-ban (migráció nélkül).
 *
 * A SQLite `LOWER()` csak ASCII-t kisbetűsít, és nincs `unaccent()`, ezért egy
 * accentes „Fodrász" sose illeszkedne a felhasználó „fodrasz" keresésére. Itt
 * két, egymással GARANTÁLTAN összehangolt eszközt adunk:
 *
 *   • `foldSearchText(q)`     — a KERESŐSZÓ (needle) normalizálása JS-ben.
 *   • `hungarianFoldSql(col)` — az OSZLOP accent-foldja beágyazott REPLACE-ekkel
 *                               + LOWER, hogy a LIKE mindkét oldalon ugyanazt lássa.
 *
 * A karakter-halmaz magyar + német + francia + holland ékezeteket fed le (a 4
 * célország neveihez/címeihez elég). A [[sql-fold.test.ts]] szimulálja az SQL
 * oldalt és bit-pontosan a `foldSearchText`-hez méri — így a két oldal nem
 * csúszhat szét.
 */

/**
 * Accent-fold párok: [tárolt karakter, ASCII-megfelelő]. MINDKÉT kisbetűs ÉS
 * nagybetűs alakot felsoroljuk, mert a SQLite REPLACE case-érzékeny, a LOWER
 * pedig nem nyúl az accentes nagybetűkhöz (pl. „Ü" → marad „Ü").
 */
export const FOLD_PAIRS: ReadonlyArray<readonly [string, string]> = [
  // a-család
  ["á", "a"], ["Á", "a"], ["à", "a"], ["À", "a"], ["â", "a"], ["Â", "a"],
  ["ä", "a"], ["Ä", "a"], ["ã", "a"], ["Ã", "a"], ["å", "a"], ["Å", "a"],
  // e-család
  ["é", "e"], ["É", "e"], ["è", "e"], ["È", "e"], ["ê", "e"], ["Ê", "e"],
  ["ë", "e"], ["Ë", "e"],
  // i-család
  ["í", "i"], ["Í", "i"], ["ì", "i"], ["Ì", "i"], ["î", "i"], ["Î", "i"],
  ["ï", "i"], ["Ï", "i"],
  // o-család (benne a magyar ő + a holland/skandináv ø)
  ["ó", "o"], ["Ó", "o"], ["ö", "o"], ["Ö", "o"], ["ő", "o"], ["Ő", "o"],
  ["ò", "o"], ["Ò", "o"], ["ô", "o"], ["Ô", "o"], ["õ", "o"], ["Õ", "o"],
  ["ø", "o"], ["Ø", "o"],
  // u-család (benne a magyar ű)
  ["ú", "u"], ["Ú", "u"], ["ü", "u"], ["Ü", "u"], ["ű", "u"], ["Ű", "u"],
  ["ù", "u"], ["Ù", "u"], ["û", "u"], ["Û", "u"],
  // egyéb gyakori
  ["ç", "c"], ["Ç", "c"], ["ñ", "n"], ["Ñ", "n"],
  // a német ß-t ss-re bontjuk (a nagybetűs ẞ ritka, de kezeljük)
  ["ß", "ss"], ["ẞ", "ss"],
];

/**
 * Egy-karakteres accent-fold térkép MINDKÉT esetre (pl. „Ü"→„u", „ü"→„u"). A
 * többkarakteres cserék (ß/ẞ → ss) NEM ide kerülnek — azokat külön, string-
 * szinten kezeljük, hogy a needle-oldal pontosan a SQLite REPLACE-láncát tükrözze.
 */
const CHAR_FOLD: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const [ch, ascii] of FOLD_PAIRS) {
    if (ch.length === 1 && ascii.length === 1) m[ch] = ascii;
  }
  return m;
})();

/**
 * A keresőszó normalizálása ÚGY, hogy bit-pontosan a `hungarianFoldSql`-t (SQLite
 * REPLACE-lánc + LOWER) tükrözze:
 *   1) ß/ẞ → ss (string-szintű, ahogy a REPLACE),
 *   2) a fold-halmaz karakterei (mindkét eset) → ASCII,
 *   3) a maradék CSAK-ASCII A–Z kisbetűsítése (a SQLite LOWER is csak ASCII-t
 *      kisbetűsít — a Unicode `toLowerCase` itt eltérést okozna a set-en kívüli
 *      karaktereknél, pl. „Œ").
 */
export function foldSearchText(q: string): string {
  const s = q.replace(/ß/g, "ss").replace(/ẞ/g, "ss");
  let out = "";
  for (const ch of s) {
    const folded = CHAR_FOLD[ch];
    if (folded !== undefined) { out += folded; continue; }
    const code = ch.charCodeAt(0);
    out += code >= 65 && code <= 90 ? String.fromCharCode(code + 32) : ch; // A–Z → a–z
  }
  return out;
}

/** A `'` SQL-literál-escapelése (a fold-karakterek közt nincs `'`, de a helper legyen biztonságos). */
function sqlLiteral(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

/**
 * Egy oszlop-kifejezés accent-foldja SQL-ben: beágyazott REPLACE-ek (mindkét eset
 * → ASCII), a végén LOWER a maradék ASCII A–Z-hez. A needle-t `foldSearchText`-tel
 * kell normalizálni, hogy a LIKE két oldala egyezzen.
 *
 * Pl. `hungarianFoldSql("b.name")` egy olyan kifejezés, ami a „Fülöp" tárolt
 * értéket „fulop"-ra hozza, így a „fulop" (vagy „fülöp") needle illeszkedik.
 */
export function hungarianFoldSql(column: string): string {
  let expr = column;
  for (const [ch, ascii] of FOLD_PAIRS) {
    expr = `REPLACE(${expr}, ${sqlLiteral(ch)}, ${sqlLiteral(ascii)})`;
  }
  return `LOWER(${expr})`;
}
