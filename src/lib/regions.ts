/**
 * regions.ts — a többország-rendszer GENERIKUS geográfia-rétege.
 *
 * Eddig a hely-fogalom kizárólag a svájci kanton volt (cantons.ts). A 6 ország
 * indulásához ezt általánosítjuk: minden országnak van egy „régió" listája
 * (CH=kanton, AT=Bundesland, DE=Land, NL=provincia, DK=region, SE=län). A CH
 * régiók a meglévő CANTONS-ból jönnek (egyetlen forrás marad).
 *
 * A `code` országon belül egyedi (ASCII, DB/URL-barát); országok között
 * ütközhet (pl. CH-ZH Zürich vs NL-ZH Zuid-Holland) — ezért MINDIG a
 * country_code + region_code párral azonosítunk.
 */
import { CANTONS } from "./cantons";

export interface Region {
  code: string;
  name: string;
  aliases?: string[];
}

/** Az adott ország régió-szintjének magyar megnevezése (UI-felirat). */
export const REGION_LABEL: Record<string, string> = {
  CH: "kanton",
  AT: "tartomány",
  DE: "tartomány",
  NL: "provincia",
};

// Ausztria — 9 Bundesland. Az aliasok közt a NAGYVÁROSOK is (a szabad-szöveges
// hely-feloldáshoz: kereső-heurisztika, Telegram-bot, külső állás-szinkron) —
// egy város CSAK a saját tartományánál szerepelhet (a feloldás egyértelmű marad).
const AT_REGIONS: Region[] = [
  { code: "W", name: "Wien", aliases: ["bécs", "vienna"] },
  { code: "NOE", name: "Niederösterreich", aliases: ["alsó-ausztria", "lower austria", "st pölten", "sankt pölten", "wiener neustadt"] },
  { code: "OOE", name: "Oberösterreich", aliases: ["felső-ausztria", "upper austria", "linz", "wels", "steyr"] },
  { code: "STM", name: "Steiermark", aliases: ["stájerország", "styria", "graz", "leoben"] },
  { code: "TIR", name: "Tirol", aliases: ["tyrol", "innsbruck", "kufstein"] },
  { code: "KTN", name: "Kärnten", aliases: ["karintia", "carinthia", "klagenfurt", "villach"] },
  { code: "SBG", name: "Salzburg", aliases: [] },
  { code: "VBG", name: "Vorarlberg", aliases: ["bregenz", "dornbirn", "feldkirch"] },
  { code: "BGL", name: "Burgenland", aliases: ["eisenstadt"] },
];

// Németország — 16 Land (hivatalos kódok). Város-aliasok: lásd az AT-megjegyzést.
// Frankfurt SZÁNDÉKOSAN a HE-nél (Frankfurt am Main — az Oder-parti kicsi);
// Freiburg SZÁNDÉKOSAN kimarad (ütközne a svájci Freiburg kantonnal).
const DE_REGIONS: Region[] = [
  { code: "BW", name: "Baden-Württemberg", aliases: ["stuttgart", "karlsruhe", "mannheim", "heidelberg", "ulm"] },
  { code: "BY", name: "Bayern", aliases: ["bajorország", "bavaria", "münchen", "munich", "nürnberg", "augsburg", "regensburg", "ingolstadt"] },
  { code: "BE", name: "Berlin", aliases: [] },
  { code: "BB", name: "Brandenburg", aliases: ["potsdam"] },
  { code: "HB", name: "Bremen", aliases: ["bréma"] },
  { code: "HH", name: "Hamburg", aliases: [] },
  { code: "HE", name: "Hessen", aliases: ["hesse", "frankfurt", "wiesbaden", "darmstadt", "kassel"] },
  { code: "MV", name: "Mecklenburg-Vorpommern", aliases: ["rostock", "schwerin"] },
  { code: "NI", name: "Niedersachsen", aliases: ["alsó-szászország", "lower saxony", "hannover", "braunschweig", "osnabrück"] },
  { code: "NW", name: "Nordrhein-Westfalen", aliases: ["észak-rajna-vesztfália", "köln", "cologne", "düsseldorf", "dortmund", "essen", "bonn", "duisburg", "aachen", "bochum", "wuppertal", "bielefeld", "münster"] },
  { code: "RP", name: "Rheinland-Pfalz", aliases: ["mainz", "koblenz", "trier"] },
  { code: "SL", name: "Saarland", aliases: ["saarbrücken"] },
  { code: "SN", name: "Sachsen", aliases: ["szászország", "saxony", "dresden", "drezda", "leipzig", "lipcse", "chemnitz"] },
  { code: "ST", name: "Sachsen-Anhalt", aliases: ["magdeburg"] },
  { code: "SH", name: "Schleswig-Holstein", aliases: ["kiel", "lübeck"] },
  { code: "TH", name: "Thüringen", aliases: ["türingia", "thuringia", "erfurt", "jena"] },
];

// Hollandia — 12 provincia (ISO 3166-2 kódok). Város-aliasok: lásd az AT-megjegyzést.
const NL_REGIONS: Region[] = [
  { code: "NH", name: "Noord-Holland", aliases: ["amszterdam", "amsterdam", "haarlem", "alkmaar", "zaandam"] },
  { code: "ZH", name: "Zuid-Holland", aliases: ["rotterdam", "hága", "den haag", "leiden", "delft", "dordrecht"] },
  { code: "UT", name: "Utrecht", aliases: ["amersfoort"] },
  { code: "NB", name: "Noord-Brabant", aliases: ["eindhoven", "tilburg", "breda", "den bosch", "s-hertogenbosch"] },
  { code: "GE", name: "Gelderland", aliases: ["arnhem", "nijmegen", "apeldoorn"] },
  { code: "OV", name: "Overijssel", aliases: ["enschede", "zwolle", "deventer"] },
  { code: "LI", name: "Limburg", aliases: ["maastricht", "venlo"] },
  { code: "FR", name: "Friesland", aliases: ["fryslân", "leeuwarden"] },
  { code: "GR", name: "Groningen", aliases: [] },
  { code: "DR", name: "Drenthe", aliases: ["assen", "emmen"] },
  { code: "FL", name: "Flevoland", aliases: ["almere", "lelystad"] },
  { code: "ZE", name: "Zeeland", aliases: ["middelburg"] },
];

/** Ország → régiók. A CH a meglévő CANTONS-ra mutat (egyetlen forrás). */
export const REGIONS: Record<string, Region[]> = {
  CH: CANTONS,
  AT: AT_REGIONS,
  DE: DE_REGIONS,
  NL: NL_REGIONS,
};

/** Az adott ország régiói (ismeretlen ország → üres lista). */
export function getRegions(country: string | null | undefined): Region[] {
  if (!country) return [];
  return REGIONS[country] ?? [];
}

/** Egy konkrét régió az országon belül kód alapján. */
export function getRegion(country: string | null | undefined, code: string | null | undefined): Region | undefined {
  if (!country || !code) return undefined;
  return getRegions(country).find((r) => r.code === code);
}

/** Egy régió kijelző-neve (vagy maga a kód, ha nincs találat). */
export function regionName(country: string | null | undefined, code: string | null | undefined): string {
  return getRegion(country, code)?.name ?? code ?? "";
}

/** A régió-szint magyar felirata az országhoz (alapértelmezett: „régió"). */
export function regionLabel(country: string | null | undefined): string {
  return (country && REGION_LABEL[country]) || "régió";
}
