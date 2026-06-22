"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import type { IconName } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { getCountry, DEFAULT_COUNTRY } from "@/lib/countries";

/**
 * A kezdőlap ország-függő darabjai (a lap szerver-renderelt, az ország
 * kliensoldali → kliens-komponensek). Hidratálás-biztos: mount előtt CH (default),
 * mert az SSR is azt rendereli; mount után a választott ország.
 */
function useEffectiveCountry(): string {
  const [prefCountry] = usePreferredCountry();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? prefCountry ?? DEFAULT_COUNTRY : DEFAULT_COUNTRY;
}

/** A fejléc ország-zászlója (a választott országé; default 🇨🇭). */
export function HomeCountryFlag() {
  const country = getCountry(useEffectiveCountry());
  return (
    <span className="select-none text-[30px] leading-none" aria-hidden="true">
      {country?.flag ?? "🇨🇭"}
    </span>
  );
}

/** A „Mit szeretnél?" fő belépési pontok — az Ügyintézés (svájci) csak CH-ban. */
export function HomePrimaryActions() {
  const isCH = useEffectiveCountry() === "CH";
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <PrimaryAction href="/szaknevsor" icon="list" label="Szakembert keresek" tone="primary" />
      <PrimaryAction href="/allasok" icon="briefcase" label="Állást keresek" tone="primary" />
      <PrimaryAction href="/vallalkozo" icon="plus" label="Vállalkozásom felviszem" tone="accent" />
      {isCH ? (
        <PrimaryAction href="/ugyintezes" icon="document" label="Ügyintézés Svájcban" tone="accent" />
      ) : (
        <PrimaryAction href="/kozosseg" icon="calendar" label="Közösség, események" tone="accent" />
      )}
    </div>
  );
}

function PrimaryAction({
  href,
  icon,
  label,
  tone,
}: {
  href: string;
  icon: IconName;
  label: string;
  tone: "primary" | "accent";
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2.5 rounded-2xl border border-line bg-surface px-3 py-5 text-center shadow-card transition active:scale-[0.98]"
    >
      <span
        className={cn(
          "grid h-12 w-12 place-items-center rounded-2xl",
          tone === "accent" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary",
        )}
      >
        <Icon name={icon} size={23} strokeWidth={2.2} />
      </span>
      <span className="text-[13.5px] font-bold leading-tight text-ink">{label}</span>
    </Link>
  );
}
