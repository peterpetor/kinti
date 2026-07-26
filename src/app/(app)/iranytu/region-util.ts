import { CANTONS } from "@/lib/cantons";
import { AT_BUNDESLAENDER, DE_BUNDESLAENDER } from "@/lib/salary-calc";
import { getRegions } from "@/lib/regions";

/**
 * Iránytű régió-segédek — ország szerint kanton (CH) / Bundesland (AT/DE) /
 * provincia (NL) / régió (GB).
 *
 * ⚠️ MINDEN függvénynek KELL explicit GB-ág: a `return`-ök végén a svájci
 * alapeset áll, így GB nélkül Anglián svájci KANTONOK, „Egész Svájc" felirat
 * és EUR pénznem jelent volna meg (valós fallthrough-bug volt).
 */
export interface BenchRegion {
  code: string;
  name: string;
}

export function benchRegions(country: string): BenchRegion[] {
  if (country === "AT") return AT_BUNDESLAENDER.map((b) => ({ code: b.code, name: b.name }));
  if (country === "DE") return DE_BUNDESLAENDER.map((b) => ({ code: b.code, name: b.name }));
  if (country === "NL") return getRegions("NL").map((r) => ({ code: r.code, name: r.name }));
  if (country === "GB") return getRegions("GB").map((r) => ({ code: r.code, name: r.name }));
  return CANTONS.map((c) => ({ code: c.code, name: c.name }));
}

export function benchRegionName(country: string, code: string): string {
  return benchRegions(country).find((r) => r.code === code)?.name ?? code;
}

/** A régió-szint magyar megnevezése (UI-felirat). */
export function benchRegionLabel(country: string): string {
  if (country === "CH") return "Kanton";
  if (country === "NL") return "Provincia";
  if (country === "GB") return "Régió";
  return "Bundesland";
}

export function benchCurrency(country: string): string {
  if (country === "CH") return "CHF";
  if (country === "GB") return "GBP";
  return "EUR";
}

export function benchAllLabel(country: string): string {
  if (country === "AT") return "Egész Ausztria";
  if (country === "DE") return "Egész Németország";
  if (country === "NL") return "Egész Hollandia";
  if (country === "GB") return "Egész Anglia";
  return "Egész Svájc";
}

/** Alapértelmezett régiókód az adott országban (a beküldő-űrlaphoz). */
export function benchDefaultRegion(country: string): string {
  if (country === "AT") return "W";
  if (country === "DE") return "BY";
  if (country === "NL") return "NH";
  if (country === "GB") return "LDN";
  return "ZH";
}

/** Alapértelmezett éves bruttó az „enyém" mezőkhöz (CH: CHF, AT/DE/NL: EUR). */
export function benchDefaultSalary(country: string): number {
  if (country === "AT") return 45000;
  if (country === "DE") return 48000;
  if (country === "NL") return 44000;
  if (country === "GB") return 35000; // £ — ONS medián körüli éves bruttó
  return 80000;
}

/** Alapértelmezett havi lakbér (CH: CHF, GB: GBP, egyébként EUR). */
export function benchDefaultRent(country: string): number {
  if (country === "AT") return 900;
  if (country === "DE") return 1000;
  if (country === "NL") return 1400;
  if (country === "GB") return 1300; // £ — londoni átlag alatt, országos fölött
  return 1800;
}
