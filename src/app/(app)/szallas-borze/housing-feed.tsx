"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { usePreferredCountry } from "@/lib/country-pref";
import type { HousingListing } from "@/lib/repo-housing";
import { HousingCard } from "./housing-card";
import { ComposerModal } from "./composer-modal";

/**
 * A börze kliens-rétege: ország-szűrő chipek (hidratálás-biztos: mount előtt
 * nincs szűrés — egyezik az SSR-rel, ami mindent átad), új-hirdetés gomb és a
 * kártya-lista. A lista adata SSR-ből jön (nincs kliens-fetch → nem kell
 * lista-skeleton); feladás után router.refresh() húzza be az újat.
 */
export function HousingFeed({
  listings,
  isPro,
  signedIn,
}: {
  listings: HousingListing[];
  isPro: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [prefCountry] = usePreferredCountry();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // "" = mind; mount után a preferált ország az alapértelmezés.
  const [filter, setFilter] = useState<string | null>(null);
  const country = filter ?? (mounted ? prefCountry ?? DEFAULT_COUNTRY : null);

  const [composerOpen, setComposerOpen] = useState(false);
  const [justPosted, setJustPosted] = useState(false);

  const visible = useMemo(
    () => (country ? listings.filter((l) => l.country === country) : listings),
    [listings, country],
  );

  return (
    <div className="space-y-3">
      {/* Ország-szűrő + feladás-gomb */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <FilterChip active={country === ""} label="Mind" onClick={() => setFilter("")} />
        {COUNTRIES.map((c) => (
          <FilterChip
            key={c.code}
            active={country === c.code}
            label={`${c.flag} ${c.name}`}
            onClick={() => setFilter(c.code)}
          />
        ))}
      </div>

      {signedIn ? (
        <button
          type="button"
          onClick={() => setComposerOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-pill bg-primary py-3 text-[14px] font-extrabold text-white shadow-card-hover transition active:scale-[0.98]"
        >
          <Icon name="plus" size={16} strokeWidth={2.6} /> Új hirdetés feladása
        </button>
      ) : (
        <Link
          href="/belepes?redirect_url=/szallas-borze"
          className="flex w-full items-center justify-center gap-2 rounded-pill border border-line bg-surface py-3 text-[14px] font-bold text-ink shadow-card transition active:scale-[0.98]"
        >
          <Icon name="user" size={16} strokeWidth={2.4} /> Hirdetés feladásához jelentkezz be
        </Link>
      )}

      {justPosted && (
        <div className="flex items-center gap-2 rounded-card border border-success/30 bg-success/10 p-3 text-[12.5px] font-bold text-success">
          <Icon name="check" size={15} strokeWidth={2.6} />
          Köszönjük! A hirdetésed jóváhagyás után jelenik meg (tipikusan 24 órán belül).
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface p-6 text-center">
          <p className="text-[28px]">🛏️</p>
          <p className="mt-1 text-[14px] font-bold text-ink">Itt még nincs hirdetés</p>
          <p className="mx-auto mt-1 max-w-xs text-[12.5px] leading-snug text-ink-muted">
            Légy az első — adj fel egy kiadó szobát, vagy írd meg, mit keresel.
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {visible.map((l) => (
            <HousingCard key={l.id} listing={l} isPro={isPro} signedIn={signedIn} />
          ))}
        </div>
      )}

      <ComposerModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        defaultCountry={country || prefCountry || DEFAULT_COUNTRY}
        onCreated={() => {
          setComposerOpen(false);
          setJustPosted(true);
          router.refresh();
        }}
      />
    </div>
  );
}

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-pill border px-3 py-1.5 text-[12px] font-bold shadow-card transition active:scale-[0.97]",
        active ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink-muted",
      )}
    >
      {label}
    </button>
  );
}
