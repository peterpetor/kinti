import { CANTONS } from "@/lib/cantons";
import { AT_BUNDESLAENDER } from "@/lib/salary-calc";

/** Iránytű régió-segédek — ország szerint kanton (CH) vagy Bundesland (AT). */
export interface BenchRegion {
  code: string;
  name: string;
}

export function benchRegions(country: string): BenchRegion[] {
  return country === "AT"
    ? AT_BUNDESLAENDER.map((b) => ({ code: b.code, name: b.name }))
    : CANTONS.map((c) => ({ code: c.code, name: c.name }));
}

export function benchRegionName(country: string, code: string): string {
  return benchRegions(country).find((r) => r.code === code)?.name ?? code;
}

export function benchCurrency(country: string): string {
  return country === "AT" ? "EUR" : "CHF";
}

export function benchAllLabel(country: string): string {
  return country === "AT" ? "Egész Ausztria" : "Egész Svájc";
}

/** Alapértelmezett régiókód az adott országban (a beküldő-űrlaphoz). */
export function benchDefaultRegion(country: string): string {
  return country === "AT" ? "W" : "ZH";
}

/** Alapértelmezett éves bruttó az „enyém" mezőkhöz (CH: CHF, AT: EUR). */
export function benchDefaultSalary(country: string): number {
  return country === "AT" ? 45000 : 80000;
}

/** Alapértelmezett havi lakbér (CH: CHF, AT: EUR). */
export function benchDefaultRent(country: string): number {
  return country === "AT" ? 900 : 1800;
}
