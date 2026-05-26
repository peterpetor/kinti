/**
 * Szerver-oldali káromkodás-szűrő.
 *
 * Stratégia: a bemenetet normalizáljuk (kisbetűsítés, ékezet-eltávolítás,
 * leet-számcsere, ismétlődő-betűk összevonása), tokenizáljuk, majd minden
 * tokenre megnézzük, hogy egy tiltott szótő ELŐTAGJA-e. A whitelist a
 * gyakori hamis pozitívokat (pl. „szarka", „szarvas", „foszlik") fogja meg.
 *
 * Miért prefix-match? A magyar agglutinatív — egy „fasz" gyök tucatnyi
 * ragozott formában jelenhet meg (faszom, faszosak, faszságodtól, …),
 * és minden formát listázni karbantarthatatlan. Prefix + whitelist a
 * pragmatikus középút.
 *
 * Bővítés: az `BLOCKED_STEMS` és `WHITELIST_TOKENS` listák tartanak meg
 * a karbantartást — ha üzenetből látsz egy átengedett szót vagy hamis
 * találatot, itt vedd fel.
 */

const BLOCKED_STEMS: string[] = [
  // user által példaként adott
  "szar",
  "fasz",
  "geci",
  "fos",
  // gyakori magyar trágárság
  "kurv", // kurva, kurvák, kurvának
  "picsa",
  "segg", // segg, seggfej, segged
  "kocsog", // köcsög (ékezet stripped)
  "baszd",
  "basz", // baszik, baszás, baszott
  "bazd",
  "bazm", // bazmeg
  "bazze",
  "rohad", // rohadj, rohadt
  "buzi",
];

/**
 * Normalizált tokenek (lowercase, ékezet-mentes), amik a szótő-prefixet
 * tartalmazzák, de NEM trágárak. Ezek átmennek.
 */
const WHITELIST_TOKENS = new Set<string>([
  // "szar" hamis pozitív szavak
  "szarka",
  "szarkak",
  "szarvas",
  "szarvasok",
  "szarvasi",
  "szarvasmarha",
  "szarvashus",
  // "fos" hamis pozitív szavak
  "foszlik",
  "foszlanyi",
  "foszlany",
  "foszlanyok",
  "foszt",
  "foszto",
  "fosztott",
  "fosztogat",
  "fosztogatas",
  "fosztogato",
  "foszfor",
  "foszforos",
]);

/**
 * Tipikus leet-helyettesítések visszaalakítása. Konzervatív lista — csak
 * ami egyértelmű (1 → l-t is jelenthetne, de gyakrabban i, így i marad).
 */
const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
};

function normalize(text: string): string {
  let out = text.toLowerCase();
  out = out.replace(/[01345 7@$]/g, (c) => LEET_MAP[c] ?? c);
  // Unicode dekompozíció + diakritika eltávolítás (é → e, ő → o, ű → u, …)
  out = out.normalize("NFD").replace(/[̀-ͯ]/g, "");
  // 3+ egymás utáni betűt 2-re csökkentünk: "fasssszzz" → "fassz"
  out = out.replace(/(.)\1{2,}/g, "$1$1");
  return out;
}

function tokenize(normalized: string): string[] {
  return normalized.split(/[^a-z]+/).filter(Boolean);
}

export interface ProfanityResult {
  hit: boolean;
  /** A bemenetben talált eredeti szó (debug / hibaüzenethez). */
  matched?: string;
}

/**
 * Megnézi, hogy a szöveg tartalmaz-e tiltott szótő-prefixet.
 * Üres / null bemenet → nincs találat.
 */
export function containsProfanity(text: string | null | undefined): ProfanityResult {
  if (!text) return { hit: false };
  const normalized = normalize(text);
  const tokens = tokenize(normalized);
  for (const token of tokens) {
    if (WHITELIST_TOKENS.has(token)) continue;
    for (const stem of BLOCKED_STEMS) {
      if (token.startsWith(stem)) {
        return { hit: true, matched: token };
      }
    }
  }
  return { hit: false };
}

/**
 * Több mezőt vizsgál egymás után — visszaadja az ELSŐ találatot a mezőnévvel.
 * Hibaüzenetbe írásra használjuk, hogy a felhasználó tudja, melyik mezőjét
 * kell átírnia.
 */
export function findProfanityInFields(
  fields: Record<string, string | null | undefined>,
): { field: string; matched: string } | null {
  for (const [field, value] of Object.entries(fields)) {
    const res = containsProfanity(value);
    if (res.hit && res.matched) {
      return { field, matched: res.matched };
    }
  }
  return null;
}
