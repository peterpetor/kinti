import { CANTONS } from "@/lib/cantons";
import { AT_BUNDESLAENDER, DE_BUNDESLAENDER } from "@/lib/salary-calc";

/** Iránytű régió-segédek — ország szerint kanton (CH) vagy Bundesland (AT/DE). */
export interface BenchRegion {
  code: string;
  name: string;
}

export function benchRegions(country: string): BenchRegion[] {
  if (country === "AT") return AT_BUNDESLAENDER.map((b) => ({ code: b.code, name: b.name }));
  if (country === "DE") return DE_BUNDESLAENDER.map((b) => ({ code: b.code, name: b.name }));
  return CANTONS.map((c) => ({ code: c.code, name: c.name }));
}

export function benchRegionName(country: string, code: string): string {
  return benchRegions(country).find((r) => r.code === code)?.name ?? code;
}

export function benchCurrency(country: string): string {
  return country === "AT" || country === "DE" ? "EUR" : "CHF";
}

export function benchAllLabel(country: string): string {
  if (country === "AT") return "Egész Ausztria";
  if (country === "DE") return "Egész Németország";
  return "Egész Svájc";
}

/** Alapértelmezett régiókód az adott országban (a beküldő-űrlaphoz). */
export function benchDefaultRegion(country: string): string {
  if (country === "AT") return "W";
  if (country === "DE") return "BY";
  return "ZH";
}

/** Alapértelmezett éves bruttó az „enyém" mezőkhöz (CH: CHF, AT/DE: EUR). */
export function benchDefaultSalary(country: string): number {
  if (country === "AT") return 45000;
  if (country === "DE") return 48000;
  return 80000;
}

/** Alapértelmezett havi lakbér (CH: CHF, AT/DE: EUR). */
export function benchDefaultRent(country: string): number {
  if (country === "AT") return 900;
  if (country === "DE") return 1000;
  return 1800;
}
