"use client";

import { ScreenHeader } from "@/components/ui";
import { usePreferredCountry } from "@/lib/country-pref";
import { getCountry, DEFAULT_COUNTRY } from "@/lib/countries";

/**
 * Ország-tudatos állások-fejléc — a többi menüvel egységes ScreenHeader
 * (eyebrow + cím + „…" menü). Mount előtt CH (= SSR), mount után a választott
 * ország neve (Svájc / Ausztria / …).
 */
export function AllasokHeader() {
  const [prefCountry] = usePreferredCountry();
  const name = getCountry(prefCountry ?? DEFAULT_COUNTRY)?.name ?? "Svájc";
  return <ScreenHeader eyebrow={`Állások · ${name}`} title="Kinti Állások" />;
}
