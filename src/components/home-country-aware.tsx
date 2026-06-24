"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon, SectionHeader } from "@/components/ui";
import type { IconName } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, countryLocative, countryIllative } from "@/lib/countries";
import { CountryFlag } from "@/components/ui/country-flag";
import type { KintiEvent } from "@/lib/types";

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

/** A fejléc ország-zászlója (a választott országé; default CH). */
export function HomeCountryFlag() {
  return <CountryFlag code={useEffectiveCountry()} className="h-[22px] w-[30px]" />;
}

/** A „Mit szeretnél?" fő belépési pontok — az Ügyintézés ország-tudatos felirattal. */
export function HomePrimaryActions() {
  const country = useEffectiveCountry();
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <PrimaryAction href="/szaknevsor" icon="list" label="Szakembert keresek" tone="primary" />
      <PrimaryAction href="/allasok" icon="briefcase" label="Állást keresek" tone="primary" />
      <PrimaryAction href="/vallalkozo" icon="plus" label="Vállalkozásom felviszem" tone="accent" />
      <PrimaryAction href={country === "DE" || country === "NL" ? "/tudasbazis" : "/ugyintezes"} icon="document" label={`Ügyintézés ${countryLocative(country)}`} tone="accent" />
    </div>
  );
}

/** „Következő események" — ország-szűrt esemény-előnézet (max 3). Üres → rejtve. */
export function HomeEvents({ events }: { events: KintiEvent[] }) {
  const country = useEffectiveCountry();
  const items = events.filter((e) => (e.country ?? "CH") === country).slice(0, 3);
  if (items.length === 0) return null;
  return (
    <section className="space-y-3">
      <SectionHeader
        right={
          <Link href="/kozosseg" className="text-[13px] font-bold text-primary">
            Mind ›
          </Link>
        }
      >
        Következő események
      </SectionHeader>
      <div className="grid gap-2.5">
        {items.map((e) => (
          <Link
            key={e.id}
            href="/kozosseg"
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-card transition active:scale-[0.99]"
          >
            <div className="w-[50px] shrink-0 rounded-xl border border-line bg-surface-alt py-1.5 text-center">
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-primary">{e.dateMonth}</div>
              <div className="text-xl font-extrabold leading-none text-ink">{e.dateDay}</div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14.5px] font-bold tracking-[-0.01em] text-ink">{e.title}</div>
              <div className="mt-0.5 text-xs text-ink-muted">{e.venue} · {e.going} fő megy</div>
            </div>
            <Icon name="chevR" size={14} className="text-ink-muted" />
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Kezdőlap-kártyák: a Kiköltözés Tracker minden országban (ország-tudatos szöveg),
 *  a Tudásbázis (svájci források) egyelőre csak CH-ban. */
export function HomeChCards() {
  const country = useEffectiveCountry();
  const isCH = country === "CH";
  return (
    <>
      <Link
        href="/kikoltozes"
        className="flex items-center gap-3 rounded-card border border-accent/20 bg-accent-soft px-4 py-3.5 shadow-card transition active:scale-[0.99]"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-accent text-white">
          <Icon name="check" size={19} strokeWidth={2.3} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-extrabold tracking-[-0.01em] text-ink">Kiköltözés Tracker</span>
          <span className="block text-[12px] text-ink-muted">
            Személyre szabott, lépésről-lépésre checklist {countryIllative(country)} költözőknek
          </span>
        </span>
        <Icon name="chevR" size={16} strokeWidth={2.2} className="shrink-0 text-accent" />
      </Link>

      <Link
        href="/tudasbazis"
        className="flex items-center gap-3 rounded-card border border-primary/20 bg-primary-soft px-4 py-3.5 shadow-card transition active:scale-[0.99]"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary text-white">
          <Icon name="globe" size={19} strokeWidth={2.3} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-extrabold tracking-[-0.01em] text-ink">Tudásbázis — hasznos tudnivalók</span>
          <span className="block text-[12px] text-ink-muted">
            Bejelentkezés, {country === "AT" ? "ÖGK" : "Krankenkasse"}, adó, iskola — hivatalos forrásból
          </span>
        </span>
        <Icon name="chevR" size={16} strokeWidth={2.2} className="shrink-0 text-primary" />
      </Link>
    </>
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
