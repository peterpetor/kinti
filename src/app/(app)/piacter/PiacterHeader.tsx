"use client";

import { ScreenHeader } from "@/components/ui";
import { usePreferredCountry } from "@/lib/country-pref";
import { getCountry, DEFAULT_COUNTRY } from "@/lib/countries";

/**
 * Ország-tudatos piactér-fejléc — ugyanaz a minta, mint a Szaknévsor/Állások
 * fejlécnél (`eyebrow="{Funkció} · {Ország}"`): user-visszajelzés (2026-07-21)
 * szerint a Piactér korábban egyáltalán nem mutatta, melyik országra vonatkozik.
 * Mount előtt CH (= SSR), mount után a választott ország neve.
 */
export function PiacterHeader() {
  const [prefCountry] = usePreferredCountry();
  const name = getCountry(prefCountry ?? DEFAULT_COUNTRY)?.name ?? "Svájc";
  return <ScreenHeader eyebrow={`Piactér · ${name}`} title="Albérlet és hirdetések" />;
}
