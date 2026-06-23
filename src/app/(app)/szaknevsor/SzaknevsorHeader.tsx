"use client";

import { ScreenHeader } from "@/components/ui";
import { usePreferredCountry } from "@/lib/country-pref";
import { getCountry, DEFAULT_COUNTRY } from "@/lib/countries";

/**
 * Ország-tudatos szaknévsor-fejléc. A lap szerver-renderelt, az ország
 * kliensoldali → kliens-komponens. Mount előtt CH (= SSR), mount után a választott
 * ország neve (Svájc / Ausztria / …).
 */
export function SzaknevsorHeader() {
  const [prefCountry] = usePreferredCountry();
  const name = getCountry(prefCountry ?? DEFAULT_COUNTRY)?.name ?? "Svájc";
  return <ScreenHeader eyebrow={`Szaknévsor · ${name}`} title="Kereső" />;
}
