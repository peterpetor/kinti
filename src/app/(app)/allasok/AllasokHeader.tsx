"use client";

import { ScreenHeader } from "@/components/ui";
import { usePreferredCountry } from "@/lib/country-pref";
import { getCountry, DEFAULT_COUNTRY } from "@/lib/countries";

/**
 * Ország-tudatos állások-fejléc — EGYSÉGES mintát követ a Szaknévsor-
 * fejléccel (SzaknevsorHeader.tsx): `eyebrow="{Funkció} · {Ország}"` + rövid
 * cím. ⚠️ NINCS zászló-emoji az eyebrow-ban: Windows-on a 🇦🇹-szerű
 * zászló-emojik nem képként, hanem a két betűkódként ("AT") jelennek meg —
 * user-visszajelzés (2026-07-21) szerint ez zavaró/nem egységes volt.
 * Mount előtt CH (= SSR), mount után a választott ország neve.
 */
export function AllasokHeader() {
  const [prefCountry] = usePreferredCountry();
  const name = getCountry(prefCountry ?? DEFAULT_COUNTRY)?.name ?? "Svájc";
  return <ScreenHeader eyebrow={`Állások · ${name}`} title="Állások" />;
}
