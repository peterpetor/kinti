"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

interface GeoHit {
  label: string;
  lat: number;
  lng: number;
}

/**
 * Svájci címkereső autocomplete a hivatalos geo.admin.ch fölött (/api/geo/search).
 * Kiválasztáskor visszaadja a pontos címet + WGS84 koordinátát; a szülő ebből
 * automatikusan beállítja a kantont is (nearestCantonCode).
 */
export function AddressAutocomplete({
  value,
  onTextChange,
  onSelect,
  invalid,
  placeholder = "Kezdd el írni a címet — pl. Bahnhofstrasse 10, Zürich",
}: {
  value: string;
  onTextChange: (text: string) => void;
  onSelect: (hit: GeoHit) => void;
  invalid?: boolean;
  placeholder?: string;
}) {
  const [hits, setHits] = useState<GeoHit[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);

  // Debounce-olt keresés
  useEffect(() => {
    if (picked) return; // ne keressünk újra közvetlenül kiválasztás után
    const q = value.trim();
    if (q.length < 3) {
      setHits([]);
      setOpen(false);
      return;
    }
    const my = ++seq.current;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geo/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json().catch(() => ({}))) as { results?: GeoHit[] };
        if (my !== seq.current) return; // elavult válasz
        setHits(data.results ?? []);
        setOpen((data.results ?? []).length > 0);
      } catch {
        if (my === seq.current) setHits([]);
      } finally {
        if (my === seq.current) setBusy(false);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [value, picked]);

  // Kattintás a komponensen kívül → bezár
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function choose(hit: GeoHit) {
    setPicked(true);
    onTextChange(hit.label);
    onSelect(hit);
    setOpen(false);
    setHits([]);
  }

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
          <Icon name="pin" size={15} strokeWidth={2.2} />
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setPicked(false);
            onTextChange(e.target.value);
          }}
          onFocus={() => hits.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            "w-full rounded-[12px] border bg-surface-alt py-2.5 pl-9 pr-9 text-[14px] text-ink placeholder:text-ink-faint",
            "focus:outline-none focus:ring-2 focus:ring-primary/30",
            invalid ? "border-accent/40" : "border-line",
          )}
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
  );
}
