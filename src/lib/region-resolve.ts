/**
 * region-resolve.ts — szabad-szöveges hely → régió-kód feloldás.
 *
 * A külső (API-ból aggregált) álláshirdetéseknél a forrás csak SZÖVEGES helyet
 * ad (pl. "Linz, Oberösterreich", "Wien, Österreich"), illetve az Adzuna egy
 * strukturált `area` tömböt (["Österreich","Oberösterreich","Linz"]). Ez a modul
 * ebből oldja fel a strukturált régió-kódot (AT Bundesland / DE Land / NL
 * provincia / CH kanton), hogy a régió-szűrő ezekre a hirdetésekre is működjön.
 *
 * PURE (nincs Cloudflare-függés) → a cron-szinkronban ÉS az offline backfill-
 * scriptben is fut. Legfeljebb best-effort: ha a hely-szöveg nem tartalmaz
 * felismerhető régiót (csak városnév), null-t ad — ilyenkor a sor a régiótól
 * függetlenül (egész országra) marad látható, mint eddig.
 */
import { getRegions } from "./regions";
import { cantonFromAddress } from "./cantons";

/**
 * ⚠️ AZ ADZUNA `gb` PIACA A TELJES EGYESÜLT KIRÁLYSÁG — A KINTI „GB"-JE ANGLIA.
 *
 * A Kinti ötödik országa `{ code: "GB", name: "Anglia" }`, és CSAK a 9 angol
 * statisztikai régiót ismeri. Az Adzuna viszont skót, walesi és észak-írországi
 * hirdetéseket is ad ugyanabban a `gb` feedben — élesben ez 255 angliai
 * hirdetésből 30-at jelentett („County Antrim", „Omagh, Northern Ireland",
 * „Newry", „Bathgate"), amik így „Anglia" alatt jelentek meg, régió nélkül.
 * Nem hiányos adat volt, hanem TÉVES: olyan országhoz sorolva, ahol nincsenek.
 *
 * A szűrő szándékosan CSAK egyértelmű jelzőkre lép. A többértelmű helyneveket
 * KIHAGYTAM, mert egy téves kizárás valódi angliai állást dobna el:
 *   • „Newport" — Wales (Gwent), DE Newport, Shropshire és Newport, Isle of
 *     Wight is létezik Angliában → NINCS a listán.
 *   • „Bangor" — Észak-Írország ÉS Wales; mindkettő Anglián kívül, ezért BENNE
 *     lehet (bármelyik találat helyes kizárás).
 *   • „Perth" magában nem szerepel (Perth & Kinross → „kinross" a jelző).
 */
const NOT_ENGLAND: readonly string[] = [
  // Országnevek
  "scotland", "wales", "cymru", "northern ireland",
  // Skócia
  "glasgow", "edinburgh", "aberdeen", "aberdeenshire", "dundee", "inverness",
  "stirling", "falkirk", "paisley", "livingston", "bathgate", "kilmarnock",
  "dumfries", "kinross", "perthshire", "lanarkshire", "renfrewshire",
  "ayrshire", "lothian", "fife", "argyll", "moray", "clackmannanshire",
  // Wales
  "cardiff", "swansea", "wrexham", "aberystwyth", "carmarthen", "pembrokeshire",
  "powys", "gwynedd", "conwy", "denbighshire", "flintshire", "monmouthshire",
  "ceredigion", "merthyr tydfil", "rhondda", "bridgend", "llanelli",
  "caerphilly", "torfaen", "blaenau gwent", "glamorgan", "anglesey", "gwent",
  // Észak-Írország
  "antrim", "armagh", "tyrone", "fermanagh", "londonderry", "belfast", "newry",
  "omagh", "lisburn", "craigavon", "ballymena", "newtownabbey", "coleraine",
  "enniskillen", "dungannon", "portadown", "larne", "carrickfergus",
  "downpatrick", "banbridge", "cookstown", "magherafelt", "limavady",
  "strabane", "bangor",
];

/**
 * A hely NYILVÁNVALÓAN kívül van-e az adott Kinti-ország területén?
 *
 * Csak akkor ad `true`-t, ha a forrás piaca nagyobb, mint a Kinti országa
 * (ma egyedül a GB ilyen). Bizonytalanság esetén `false` — inkább maradjon benne
 * egy régió nélküli hirdetés, mint hogy valódi angliai állást dobjunk el.
 */
export function isOutsideCountryScope(
  country: string,
  location: string | null | undefined,
  areas?: (string | null | undefined)[],
): boolean {
  if (country !== "GB") return false;
  const parts = [...(areas ?? []), location].filter(
    (x): x is string => typeof x === "string" && x.trim().length > 0,
  );
  if (parts.length === 0) return false;
  const corpus = foldTokens(parts.join(" "));
  return NOT_ENGLAND.some((m) => corpus.includes(` ${m} `));
}

/** Ékezet-hajtás + nem-alfanumerikus → szóköz, szóközzel keretezve (token-illesztéshez). */
function foldTokens(s: string): string {
  const folded = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return ` ${folded} `;
}

/**
 * Régió-kód feloldása egy hely-szövegből (+ opcionális strukturált `areas`
 * tömb, pl. Adzuna `location.area`). A régió NEVÉT / aliasait TOKEN-határon
 * illesztjük (nem naiv substring), hogy a „Wien" ne illeszkedjen a „Wiener
 * Neustadt"-ba; a hosszabb (specifikusabb) nevek nyernek, hogy a
 * „Niederösterreich" megelőzze a „Wien"-t egy „Wien-Umgebung"-jellegű helynél.
 * Nincs találat → null.
 */
export function regionCodeFromLocation(
  country: string,
  location: string | null | undefined,
  areas?: (string | null | undefined)[],
): string | null {
  const regions = getRegions(country);
  if (regions.length === 0) return null;

  const parts = [...(areas ?? []), location].filter(
    (x): x is string => typeof x === "string" && x.trim().length > 0,
  );
  if (parts.length === 0) return null;
  const corpus = foldTokens(parts.join(" "));

  // Régiónként a foldolt név + aliasok; a leghosszabb névvel rangsorolva, hogy a
  // specifikusabb (több karakteres) régiónév előbb illeszkedjen.
  const ranked = regions
    .map((r) => ({
      code: r.code,
      names: [r.name, ...(r.aliases ?? [])].map((n) => foldTokens(n).trim()).filter(Boolean),
    }))
    .sort((a, b) => {
      const la = Math.max(0, ...a.names.map((n) => n.length));
      const lb = Math.max(0, ...b.names.map((n) => n.length));
      return lb - la;
    });

  for (const { code, names } of ranked) {
    for (const nm of names) {
      if (corpus.includes(` ${nm} `)) return code;
    }
  }

  // CH kiegészítés: ismert város / PLZ a kanton-név-illesztésen túl (pl. „8001",
  // vagy egy város, ami nem azonos a kanton nevével).
  if (country === "CH") {
    const byAddr = cantonFromAddress(location ?? null);
    if (byAddr) return byAddr.code;
  }

  return null;
}
