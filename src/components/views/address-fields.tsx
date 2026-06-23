"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

export interface AddressParts {
  street: string; // utca + házszám
  zip: string; // irányítószám (PLZ)
  city: string; // helység
}

interface GeoHit {
  label: string;
  lat: number;
  lng: number;
}

/** "Bahnhofstrasse 10 8001 Zürich" → { street, zip, city } */
export function parseSwissAddress(label: string): AddressParts {
  const m = label.match(/\b(\d{4})\b/);
  if (!m) return { street: label.trim(), zip: "", city: "" };
  const zip = m[1];
  const idx = label.indexOf(zip);
  const street = label.slice(0, idx).replace(/[,\s]+$/, "").trim();
  const city = label.slice(idx + zip.length).replace(/^[,\s]+/, "").trim();
  return { street, zip, city };
}

/** Külön mezőkből a tárolt/küldött egységes cím-string. */
export function composeAddress(p: AddressParts): string {
  const tail = [p.zip, p.city].filter(Boolean).join(" ");
  return [p.street.trim(), tail].filter(Boolean).join(", ");
}

/**
 * Strukturált svájci cím-beviteli mező: utca/házszám + irányítószám + helység,
 * külön mezőkben. Az utca-mezőhöz hivatalos svájci címkereső (geo.admin.ch)
 * autocomplete kapcsolódik: kiválasztáskor mindhárom mező kitöltődik, és a
 * szülő megkapja a pontos koordinátát (onGeocode) a kanton beállításához.
 */
export function AddressFields({
  value,
  onChange,
  onGeocode,
  invalid,
}: {
  value: AddressParts;
  onChange: (next: AddressParts) => void;
  onGeocode: (hit: GeoHit) => void;
  invalid?: boolean;
}) {
  const [hits, setHits] = useState<GeoHit[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);
  // Ország-tudatos geokóder (CH: geo.admin.ch, AT/egyéb: Photon/OSM) + példák.
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const isAT = country === "AT";

  // Debounce-olt keresés az utca-mező szövegére (+ helység, ha már van).
  useEffect(() => {
    if (picked) return;
    const q = [value.street, value.city].filter(Boolean).join(" ").trim();
    if (q.length < 3) {
      setHits([]);
      setOpen(false);
      return;
    }
    const my = ++seq.current;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geo/search?q=${encodeURIComponent(q)}&country=${country}`);
        const data = (await res.json().catch(() => ({}))) as { results?: GeoHit[] };
        if (my !== seq.current) return;
        setHits(data.results ?? []);
        setOpen((data.results ?? []).length > 0);
      } catch {
        if (my === seq.current) setHits([]);
      } finally {
        if (my === seq.current) setBusy(false);
      }
    }, 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.street, picked, country]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function choose(hit: GeoHit) {
    setPicked(true);
    onChange(parseSwissAddress(hit.label));
    onGeocode(hit);
    setOpen(false);
    setHits([]);
  }

  const fieldCls = (bad?: boolean) =>
    cn(
      "w-full rounded-[12px] border bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint",
      "focus:outline-none focus:ring-2 focus:ring-primary/30",
      bad ? "border-accent/40" : "border-line",
    );

  return (
    <div ref={boxRef} className="space-y-2">
      {/* Utca + házszám (ehhez kapcsolódik a kereső) */}
      <div className="relative">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-faint">
          Utca, házszám
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
            <Icon name="pin" size={15} strokeWidth={2.2} />
          </span>
          <input
            type="text"
            value={value.street}
            onChange={(e) => {
              setPicked(false);
              onChange({ ...value, street: e.target.value });
            }}
            onFocus={() => hits.length > 0 && setOpen(true)}
            placeholder={isAT ? "Pl. Hauptstraße 4" : "Pl. Bahnhofstrasse 10"}
            autoComplete="off"
            className={cn(fieldCls(invalid), "pl-9 pr-9")}
          />
          {busy && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint">
              <Icon name="clock" size={14} strokeWidth={2.2} className="animate-spin" />
            </span>
          )}
          {picked && !busy && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-success">
              <Icon name="check" size={15} strokeWidth={2.6} />
            </span>
          )}
        </div>

        {open && hits.length > 0 && (
          <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-[12px] border border-line bg-surface shadow-card-hover">
            {hits.map((hit, i) => (
              <li key={`${hit.label}-${i}`}>
                <button
                  type="button"
                  onClick={() => choose(hit)}
                  className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-[13px] text-ink hover:bg-surface-alt active:bg-primary-soft/40"
                >
                  <Icon name="pin" size={13} strokeWidth={2.2} className="mt-0.5 shrink-0 text-primary" />
                  <span className="leading-snug">{hit.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Irányítószám + helység egy sorban */}
      <div className="flex gap-2">
        <div className="w-[110px] shrink-0">
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-faint">
            Ir.szám
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={value.zip}
            onChange={(e) => {
              setPicked(false);
              onChange({ ...value, zip: e.target.value.replace(/[^\d]/g, "").slice(0, 4) });
            }}
            placeholder={isAT ? "1010" : "8001"}
            maxLength={4}
            autoComplete="off"
            className={fieldCls(invalid)}
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-faint">
            Helység
          </label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => {
              setPicked(false);
              onChange({ ...value, city: e.target.value });
            }}
            placeholder={isAT ? "Wien" : "Zürich"}
            autoComplete="off"
            className={fieldCls(invalid)}
          />
        </div>
      </div>
    </div>
  );
}
