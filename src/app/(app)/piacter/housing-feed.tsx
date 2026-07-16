"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { usePreferredCountry } from "@/lib/country-pref";
import { getRegions, regionLabel } from "@/lib/regions";
import { HOUSING_TYPE_LABELS, type HousingType } from "@/lib/housing";
import type { HousingListing } from "@/lib/repo-housing";
import { HousingCard } from "./housing-card";
import { ComposerModal } from "./composer-modal";

/** Ékezet-hajtás a szabad-szöveg kereséshez („zurich" találja a „Zürich"-öt). */
function fold(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * A börze kliens-rétege: ország-chipek + régió-választó + típus-chipek +
 * szabad-szöveg keresés (település/falu/leírás), hidratálás-biztosan (mount
 * előtt nincs szűrés — egyezik az SSR-rel). A lista adata SSR-ből jön (≤100
 * hirdetés → a szűrés kliensoldali, azonnali); feladás után router.refresh().
 * A feladás-gomb MINDIG látszik — belépés nélkül a fiók-oldalra visz (mint az
 * álláshirdetés-feladás), a tényleges zárat a szerver (401) adja.
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

  const [region, setRegion] = useState("");
  const [type, setType] = useState<HousingType | "">("");
  const [query, setQuery] = useState("");

  const [composerOpen, setComposerOpen] = useState(false);
  const [justPosted, setJustPosted] = useState(false);

  // Ország-váltásra a másik ország régiója érvénytelen → vissza „mind"-re.
  const regions = country ? getRegions(country) : [];
  useEffect(() => setRegion(""), [country]);

  const visible = useMemo(() => {
    const q = fold(query.trim());
    return listings.filter((l) => {
      if (country && l.country !== country) return false;
      if (region && l.regionCode !== region) return false;
      if (type && l.type !== type) return false;
      if (q && !fold(`${l.city} ${l.description}`).includes(q)) return false;
      return true;
    });
  }, [listings, country, region, type, query]);

  const openComposer = () => {
    if (!signedIn) {
      // Ugyanaz a minta, mint az álláshirdetés-feladásnál: a gomb a fiókhoz visz.
      window.location.href = "/belepes?redirect_url=/piacter";
      return;
    }
    setComposerOpen(true);
  };

  return (
    <div className="space-y-3">
      {/* Ország-szűrő */}
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

      {/* Keresés + régió — település/falu névre is (szabad szöveg). */}
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Icon
            name="search"
            size={14}
            strokeWidth={2.4}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Város, falu vagy kulcsszó…"
            className="h-10 w-full rounded-pill border border-line bg-surface pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {country && regions.length > 0 && (
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            aria-label={`Szűrés ${regionLabel(country)} szerint`}
            className="h-10 max-w-[46%] shrink-0 rounded-pill border border-line bg-surface px-3 text-[13px] font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Minden {regionLabel(country)}</option>
            {regions.map((r) => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Típus-szűrő */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <FilterChip active={type === ""} label="Minden hirdetés" onClick={() => setType("")} />
        <FilterChip active={type === "room_offered"} label={`🔑 ${HOUSING_TYPE_LABELS.room_offered}`} onClick={() => setType("room_offered")} />
        <FilterChip active={type === "apartment_offered"} label={`🔑 ${HOUSING_TYPE_LABELS.apartment_offered}`} onClick={() => setType("apartment_offered")} />
        <FilterChip active={type === "looking_for_room"} label="🔎 Keresők" onClick={() => setType("looking_for_room")} />
      </div>

      <button
        type="button"
        onClick={openComposer}
        className="flex w-full items-center justify-center gap-2 rounded-pill bg-primary py-3 text-[14px] font-extrabold text-white shadow-card-hover transition active:scale-[0.98]"
      >
        <Icon name="plus" size={16} strokeWidth={2.6} /> Új hirdetés feladása
      </button>
      {!signedIn && (
        <p className="-mt-1 px-1 text-[11px] leading-snug text-ink-faint">
          A feladáshoz ingyenes Kinti-fiók kell (mint az álláshirdetésnél) — a gomb a belépéshez visz.
        </p>
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
          {listings.length > 0 ? (
            <>
              <p className="mt-1 text-[14px] font-bold text-ink">Nincs találat erre a szűrésre</p>
              <p className="mx-auto mt-1 max-w-xs text-[12.5px] leading-snug text-ink-muted">
                Próbáld tágítani: másik régió, „Minden hirdetés", vagy töröld a keresőszót.
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 text-[14px] font-bold text-ink">Itt még nincs hirdetés</p>
              <p className="mx-auto mt-1 max-w-xs text-[12.5px] leading-snug text-ink-muted">
                Légy az első — adj fel egy kiadó szobát, vagy írd meg, mit keresel.
              </p>
            </>
          )}
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
