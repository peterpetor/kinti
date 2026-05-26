/**
 * Svájci kantonok — keresési segédmodul.
 *
 * Két irányba dolgozik:
 *   1) `cantonFromAddress(addr)` — egy svájci címből (PLZ alapján) megpróbálja
 *      megmondani, melyik kantonban van.
 *   2) `matchCantonByName(query)` — a kereső-szóra ránéz, hogy egy kanton
 *      nevére/aliasára/kódjára utal-e.
 *
 * A PLZ → kanton hozzárendelés közelítő (a Svájci Posta körzetei nem fedik 1:1
 * a kantonokat, főleg BE / FR / VS határán), de a tipikus városokra pontos. Ez
 * a kompromisszum egy MVP-keresőhöz bőven elég.
 */

export interface Canton {
  code: string; // 2-betűs ISO-kód
  name: string; // elsődleges (német) név
  aliases: string[]; // alt nevek (EN/FR/IT/HU)
}

export const CANTONS: Canton[] = [
  { code: "ZH", name: "Zürich", aliases: ["zurich", "cürih"] },
  { code: "BE", name: "Bern", aliases: ["berne"] },
  { code: "LU", name: "Luzern", aliases: ["lucerne", "lucern"] },
  { code: "UR", name: "Uri", aliases: [] },
  { code: "SZ", name: "Schwyz", aliases: [] },
  { code: "OW", name: "Obwalden", aliases: [] },
  { code: "NW", name: "Nidwalden", aliases: [] },
  { code: "GL", name: "Glarus", aliases: ["glaris"] },
  { code: "ZG", name: "Zug", aliases: ["zoug"] },
  { code: "FR", name: "Fribourg", aliases: ["freiburg"] },
  { code: "SO", name: "Solothurn", aliases: ["soleure"] },
  { code: "BS", name: "Basel-Stadt", aliases: ["basel", "bale", "bázel"] },
  { code: "BL", name: "Basel-Landschaft", aliases: ["baselland"] },
  { code: "SH", name: "Schaffhausen", aliases: ["schaffhouse"] },
  { code: "AR", name: "Appenzell Ausserrhoden", aliases: ["appenzell ar"] },
  { code: "AI", name: "Appenzell Innerrhoden", aliases: ["appenzell ai"] },
  { code: "SG", name: "St. Gallen", aliases: ["sankt gallen", "st gallen", "saint gall"] },
  { code: "GR", name: "Graubünden", aliases: ["graubunden", "grisons", "grigioni"] },
  { code: "AG", name: "Aargau", aliases: ["argovie"] },
  { code: "TG", name: "Thurgau", aliases: ["thurgovie"] },
  { code: "TI", name: "Ticino", aliases: ["tessin"] },
  { code: "VD", name: "Vaud", aliases: ["waadt"] },
  { code: "VS", name: "Valais", aliases: ["wallis"] },
  { code: "NE", name: "Neuchâtel", aliases: ["neuchatel", "neuenburg"] },
  { code: "GE", name: "Genève", aliases: ["geneva", "geneve", "genf", "genova"] },
  { code: "JU", name: "Jura", aliases: [] },
];

const BY_CODE = new Map(CANTONS.map((c) => [c.code, c]));

/** Diakritika-mentes, kisbetűs forma (Zürich → zurich, Genève → geneve). */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/**
 * PLZ → kanton. Konkrét 2-számjegy tartományok először (pontosabb),
 * fallback 1-számjegyes körzet.
 */
function plzToCanton(plz: string): Canton | null {
  if (!/^[1-9]\d{3}$/.test(plz)) return null;
  const d2 = parseInt(plz.slice(0, 2), 10);
  // pontosabb 2-számjegyes tartományok
  if (d2 === 12) return BY_CODE.get("GE") ?? null; // 1200-1299
  if (d2 === 13) return BY_CODE.get("VD") ?? null; // 1300-1399 Morges/etc.
  if (d2 === 16) return BY_CODE.get("VD") ?? null;
  if (d2 === 17) return BY_CODE.get("FR") ?? null;
  if (d2 === 18) return BY_CODE.get("FR") ?? null;
  if (d2 === 19) return BY_CODE.get("VS") ?? null; // 1900-1999 Martigny/Sion
  if (d2 === 20) return BY_CODE.get("NE") ?? null;
  if (d2 === 23 || d2 === 24) return BY_CODE.get("JU") ?? null;
  if (d2 === 25 || d2 === 26) return BY_CODE.get("BE") ?? null; // Biel/Bienne
  if (d2 === 41 || d2 === 42 || d2 === 43) return BY_CODE.get("BS") ?? null;
  if (d2 === 44) return BY_CODE.get("BL") ?? null;
  if (d2 === 47 || d2 === 48 || d2 === 49) return BY_CODE.get("SO") ?? null;
  if (d2 >= 65 && d2 <= 69) return BY_CODE.get("TI") ?? null; // 6500-6999
  if (d2 === 82) return BY_CODE.get("SH") ?? null; // 8200-8299
  if (d2 === 84 || d2 === 85) return BY_CODE.get("TG") ?? null; // 8400-8599
  if (d2 === 88 || d2 === 89) return BY_CODE.get("SG") ?? null; // 8800-8999
  if (d2 >= 90 && d2 <= 91) return BY_CODE.get("SG") ?? null; // 9000-9199
  if (d2 === 92 || d2 === 93) return BY_CODE.get("AR") ?? null;
  if (d2 === 94) return BY_CODE.get("AI") ?? null;
  // 1-számjegyes fallback
  switch (plz[0]) {
    case "1":
      return BY_CODE.get("VD") ?? null;
    case "2":
      return BY_CODE.get("NE") ?? null;
    case "3":
      return BY_CODE.get("BE") ?? null;
    case "4":
      return BY_CODE.get("BS") ?? null;
    case "5":
      return BY_CODE.get("AG") ?? null;
    case "6":
      return BY_CODE.get("LU") ?? null;
    case "7":
      return BY_CODE.get("GR") ?? null;
    case "8":
      return BY_CODE.get("ZH") ?? null;
    case "9":
      return BY_CODE.get("SG") ?? null;
    default:
      return null;
  }
}

/**
 * Címből (PLZ alapján) megpróbálja kinyerni a kantont.
 * Pl. "Birmensdorferstr. 142, 8003 Zürich" → ZH.
 */
export function cantonFromAddress(address: string | null | undefined): Canton | null {
  if (!address) return null;
  const m = address.match(/\b([1-9]\d{3})\b/);
  if (!m) return null;
  return plzToCanton(m[1]);
}

/**
 * A keresőszó utal-e konkrét kantonra (kód / név / alias)?
 * Min. 2 karakter, hogy a véletlen rövid karakter-sor ne illeszkedjen.
 */
export function matchCantonByName(query: string): Canton | null {
  const q = normalize(query);
  if (q.length < 2) return null;
  for (const c of CANTONS) {
    if (c.code.toLowerCase() === q) return c;
    if (normalize(c.name).includes(q)) return c;
    if (c.aliases.some((a) => normalize(a).includes(q))) return c;
  }
  return null;
}

/** A query egy kantonra utal, ÉS a vállalkozás abban van? */
export function matchesCanton(
  business: { address: string | null },
  query: string,
): boolean {
  const target = matchCantonByName(query);
  if (!target) return false;
  const own = cantonFromAddress(business.address);
  return own?.code === target.code;
}
