"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KintiLogo } from "@/components/ui";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, getCountry } from "@/lib/countries";
import { isFeatureAvailable } from "@/lib/feature-availability";

/**
 * CountryGuard — page-level védelem a CH-specifikus lapokhoz. A belépési pontok
 * (menü, csempék) már ország szerint rejtik ezeket, de a lapok közvetlen URL-en /
 * könyvjelzőből még elérhetők. Ez a guard a választott országban NEM elérhető
 * funkciónál egy teljes-képernyős „Svájcban érhető el” üzenetet mutat (a CH-tartalom
 * helyett), főoldal-linkkel.
 *
 * Hidratálás-biztos: mount előtt CH-default (= SSR), nincs overlay; mount után a
 * választott ország szerint dől el. A `feature` a lib/feature-availability kulcsa.
 */
export function CountryGuard({ feature }: { feature: string }) {
  const [prefCountry] = usePreferredCountry();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const country = mounted ? prefCountry ?? DEFAULT_COUNTRY : DEFAULT_COUNTRY;
  if (isFeatureAvailable(feature, country)) return null;

  const countryName = getCountry(country)?.name ?? "";
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-bg px-6 text-center">
      <div className="mx-auto max-w-xs space-y-4">
        <KintiLogo size={44} className="mx-auto" />
        <div className="text-5xl" aria-hidden="true">🇨🇭</div>
        <h1 className="text-[19px] font-extrabold tracking-tight text-ink">
          Ez a funkció Svájcban érhető el
        </h1>
        <p className="text-[13.5px] leading-relaxed text-ink-muted">
          A(z) <strong className="text-ink">{countryName}</strong> beállításodnál ez az eszköz nem elérhető — svájci-specifikus tudás. Bármikor válthatsz országot a menüből.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-pill bg-primary px-5 py-3 text-[14px] font-extrabold text-white shadow-card transition active:scale-[0.98]"
        >
          Vissza a főoldalra
        </Link>
      </div>
    </div>
  );
}
