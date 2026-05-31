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
  // ---- TRÁGÁR SZAVAK ----
  "szar",
  "fasz",
  "geci",
  "fos",
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

  // ---- RASSZISTA / KIREKESZTŐ / GYŰLÖLETKELTŐ (HU) ----
  "cigany",  // cigány — pejoratív kontextusban
  "cigan",   // ragozott alakok (cigánok, cigányoz)
  "putri",   // cigányputri
  "neger",   // néger
  "nigger",
  "nigg",
  "zsido",   // zsidó — sértő kontextusban
  "buzik",   // buzik, buziknak
  "koszos",  // "koszos cigány" stb.
  "takarodj",
  "doglod",  // döglődj
  "dogol",   // dögölj
  "halalod", // halálod
  "fasiszta",
  "nacist",
  "nazi",
  "hitler",
  "sieg heil",
  // Angol rasszista szavak
  "nigga",
  "faggot",
  "tranny",
  "retard",
  "spastic",
  "kike",
  // Német rasszista szavak
  "kanake",
  "neger",
  "schwuchtel",
  "missgeburt",
];

// Többszavas rasszista/gyűlöletkeltő kifejezések (normalizálva, ékezet nélkül)
const BLOCKED_PHRASES: string[] = [
  "sieg heil",
  "heil hitler",
  "white power",
  "halal a",  // "halál a [csoport]-ra"
  "ki veluk", // "ki velük"
  "takarodjanak",
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
  // "koszos" hamis pozitív
  "koszoru", // koszorú
  "koszoruk",
  "koszont", // köszönt
  "koszon",  // köszön
  "koszonom",
  "koszonjuk",
  // "nazi" hamis pozitív
  "nazim",   // név
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

/**
 * "Scattered" detektálás: ha valaki szóközökkel vagy írásjelekkel szétdarabol
 * egy szót (pl. `f a s z`, `c.i.g.a.n.y`, `b a z d  m e g`), a meglévő
 * tokenize 1-karakteres tokenekre vágja, amelyek külön-külön nem matchelnek
 * a szótövekre. Ez a függvény végigfut a tokeneken, és ahol min. 3 EGYMÁS
 * UTÁNI rövid (max 2 karakteres) token van, összefűzi őket, és substring-
 * matcheli a tiltott szótövekre.
 *
 * Ez azért biztonságos hamis pozitív szempontból, mert a min-3-rövid-token
 * kritérium nem teljesül normál mondatban (pl. "én is itt" — csak 3 rövid
 * token, és a join "enisitt" nem tartalmaz tiltott szótövet).
 */
function detectScatteredProfanity(tokens: string[]): ProfanityResult {
  const MAX_SHORT_LEN = 2;
  const MIN_RUN = 3;

  let i = 0;
  while (i < tokens.length) {
    if (tokens[i].length <= MAX_SHORT_LEN) {
      // Konszekutív rövid-token sorozat keresése
      let j = i;
      while (j < tokens.length && tokens[j].length <= MAX_SHORT_LEN) j++;
      if (j - i >= MIN_RUN) {
        const joined = tokens.slice(i, j).join("");
        // Whitelist: ha véletlenül egy ártatlan szó esik egybe
        if (!WHITELIST_TOKENS.has(joined)) {
          for (const stem of BLOCKED_STEMS) {
            if (joined.includes(stem)) {
              return { hit: true, matched: joined };
            }
          }
        }
      }
      i = j;
    } else {
      i++;
    }
  }
  return { hit: false };
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

  // 1) Többszavas tiltott kifejezések
  for (const phrase of BLOCKED_PHRASES) {
    if (normalized.includes(phrase)) {
      return { hit: true, matched: phrase };
    }
  }

  // 2) Szótő-prefix illesztés
  for (const token of tokens) {
    if (WHITELIST_TOKENS.has(token)) continue;
    for (const stem of BLOCKED_STEMS) {
      if (token.startsWith(stem)) {
        return { hit: true, matched: token };
      }
    }
  }

  // 3) "Scattered" trükközés (f a s z, c.i.g.a.n.y, b a z d m e g)
  const scattered = detectScatteredProfanity(tokens);
  if (scattered.hit) return scattered;

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

const MASK_WORDS = [
  // Hungarian — trágár
  "bazdmeg", "bzdmg", "kurva", "fasz", "geci", "szar", "picsa", "köcsög", "kocsog", "buzi", "baszni", "baszás",
  "faszfej", "gecc", "kurafi", "szarházi", "gec", "fos", "anyád", "kurvanyád",
  // Hungarian — rasszista / gyűlöletkeltő
  "cigány", "cigany", "néger", "neger", "nigger", "nigga", "zsidó", "zsido",
  "putri", "cigányputri", "dögölj", "döglődj", "fasiszta", "nácista", "nacista",
  "hitler", "sieg heil", "heil hitler", "white power",
  // English — trágár
  "fuck", "shit", "bitch", "cunt", "asshole", "dick", "pussy", "slut", "whore", "motherfucker", "fucker",
  // English — rasszista
  "faggot", "tranny", "retard", "spastic", "kike",
  // German — trágár
  "scheisse", "scheiße", "arsch", "arschloch", "ficken", "hure", "fotze", "schlampe", "wixer", "wichser",
  // German — rasszista
  "kanake", "schwuchtel", "missgeburt",
];

export function filterProfanity(text: string): string {
  if (!text) return text;
  let filteredText = text;
  for (const word of MASK_WORDS) {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedWord, "gi");
    filteredText = filteredText.replace(regex, (match) => '*'.repeat(match.length));
  }
  return filteredText;
}
