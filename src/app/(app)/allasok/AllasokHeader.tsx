"use client";

import { ScreenHeader } from "@/components/ui";
import { usePreferredCountry } from "@/lib/country-pref";
import { getCountry, countryLocative, DEFAULT_COUNTRY } from "@/lib/countries";

/**
 * Ország-tudatos állások-fejléc — a többi menüvel egységes ScreenHeader
 * (eyebrow + cím + „…" menü). Mount előtt CH (= SSR), mount után a választott
 * ország neve (Svájc / Ausztria / …).
 *
 * A cím (nem csak az apró eyebrow) is kimondja az országot — user-visszajelzés
 * (2026-07-21): a kis eyebrow-szöveg könnyen elsikkad, a nagy H1-ben viszont
 * egyértelmű. Ugyanaz a „-ban/-ben" minta, mint a kezdőlapi „Ügyintézés
 * Ausztriában" gombnál (countryLocative).
 */
export function AllasokHeader() {
  const [prefCountry] = usePreferredCountry();
  const code = prefCountry ?? DEFAULT_COUNTRY;
  const flag = getCountry(code)?.flag ?? "🇨🇭";
  return (
    <ScreenHeader
      eyebrow={`${flag} Kinti Állások`}
      title={`Állások ${countryLocative(code)}`}
    />
  );
}
