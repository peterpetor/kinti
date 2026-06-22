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
  DK: "régió",
  SE: "megye",
};

// Ausztria — 9 Bundesland.
const AT_REGIONS: Region[] = [
  { code: "W", name: "Wien", aliases: ["bécs", "vienna"] },
  { code: "NOE", name: "Niederösterreich", aliases: ["alsó-ausztria", "lower austria"] },
  { code: "OOE", name: "Oberösterreich", aliases: ["felső-ausztria", "upper austria"] },
  { code: "STM", name: "Steiermark", aliases: ["stájerország", "styria"] },
  { code: "TIR", name: "Tirol", aliases: ["tyrol"] },
  { code: "KTN", name: "Kärnten", aliases: ["karintia", "carinthia"] },
  { code: "SBG", name: "Salzburg", aliases: [] },
  { code: "VBG", name: "Vorarlberg", aliases: [] },
  { code: "BGL", name: "Burgenland", aliases: [] },
];

// Németország — 16 Land (hivatalos kódok).
const DE_REGIONS: Region[] = [
  { code: "BW", name: "Baden-Württemberg", aliases: [] },
  { code: "BY", name: "Bayern", aliases: ["bajorország", "bavaria"] },
  { code: "BE", name: "Berlin", aliases: [] },
  { code: "BB", name: "Brandenburg", aliases: [] },
  { code: "HB", name: "Bremen", aliases: [] },
  { code: "HH", name: "Hamburg", aliases: [] },
  { code: "HE", name: "Hessen", aliases: ["hesse"] },
  { code: "MV", name: "Mecklenburg-Vorpommern", aliases: [] },
  { code: "NI", name: "Niedersachsen", aliases: ["alsó-szászország", "lower saxony"] },
  { code: "NW", name: "Nordrhein-Westfalen", aliases: ["észak-rajna-vesztfália"] },
  { code: "RP", name: "Rheinland-Pfalz", aliases: [] },
  { code: "SL", name: "Saarland", aliases: [] },
  { code: "SN", name: "Sachsen", aliases: ["szászország", "saxony"] },
  { code: "ST", name: "Sachsen-Anhalt", aliases: [] },
  { code: "SH", name: "Schleswig-Holstein", aliases: [] },
  { code: "TH", name: "Thüringen", aliases: ["türingia", "thuringia"] },
];

// Hollandia — 12 provincia (ISO 3166-2 kódok).
const NL_REGIONS: Region[] = [
  { code: "NH", name: "Noord-Holland", aliases: ["amszterdam", "amsterdam"] },
  { code: "ZH", name: "Zuid-Holland", aliases: ["rotterdam", "hága", "den haag"] },
  { code: "UT", name: "Utrecht", aliases: [] },
  { code: "NB", name: "Noord-Brabant", aliases: ["eindhoven"] },
  { code: "GE", name: "Gelderland", aliases: [] },
  { code: "OV", name: "Overijssel", aliases: [] },
  { code: "LI", name: "Limburg", aliases: [] },
  { code: "FR", name: "Friesland", aliases: ["fryslân"] },
  { code: "GR", name: "Groningen", aliases: [] },
  { code: "DR", name: "Drenthe", aliases: [] },
  { code: "FL", name: "Flevoland", aliases: [] },
  { code: "ZE", name: "Zeeland", aliases: [] },
];

// Dánia — 5 region.
const DK_REGIONS: Region[] = [
  { code: "HOV", name: "Hovedstaden", aliases: ["koppenhága", "copenhagen", "københavn"] },
  { code: "SJ", name: "Sjælland", aliases: ["zealand"] },
  { code: "SYD", name: "Syddanmark", aliases: ["dél-dánia", "south denmark", "odense"] },
  { code: "MJ", name: "Midtjylland", aliases: ["közép-jylland", "aarhus", "århus"] },
  { code: "NJ", name: "Nordjylland", aliases: ["észak-jylland", "aalborg"] },
];

// Svédország — 21 län (hivatalos megyebetűk).
const SE_REGIONS: Region[] = [
  { code: "AB", name: "Stockholm", aliases: [] },
  { code: "M", name: "Skåne", aliases: ["malmö", "scania"] },
  { code: "O", name: "Västra Götaland", aliases: ["göteborg", "gothenburg"] },
  { code: "C", name: "Uppsala", aliases: [] },
  { code: "D", name: "Södermanland", aliases: [] },
  { code: "E", name: "Östergötland", aliases: ["linköping"] },
  { code: "F", name: "Jönköping", aliases: [] },
  { code: "G", name: "Kronoberg", aliases: ["växjö"] },
  { code: "H", name: "Kalmar", aliases: [] },
  { code: "I", name: "Gotland", aliases: ["visby"] },
  { code: "K", name: "Blekinge", aliases: [] },
  { code: "N", name: "Halland", aliases: [] },
  { code: "S", name: "Värmland", aliases: ["karlstad"] },
  { code: "T", name: "Örebro", aliases: [] },
  { code: "U", name: "Västmanland", aliases: ["västerås"] },
  { code: "W", name: "Dalarna", aliases: ["falun"] },
  { code: "X", name: "Gävleborg", aliases: ["gävle"] },
  { code: "Y", name: "Västernorrland", aliases: ["sundsvall"] },
  { code: "Z", name: "Jämtland", aliases: ["östersund"] },
  { code: "AC", name: "Västerbotten", aliases: ["umeå"] },
  { code: "BD", name: "Norrbotten", aliases: ["luleå", "kiruna"] },
];

/** Ország → régiók. A CH a meglévő CANTONS-ra mutat (egyetlen forrás). */
export const REGIONS: Record<string, Region[]> = {
  CH: CANTONS,
  AT: AT_REGIONS,
  DE: DE_REGIONS,
  NL: NL_REGIONS,
  DK: DK_REGIONS,
  SE: SE_REGIONS,
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
