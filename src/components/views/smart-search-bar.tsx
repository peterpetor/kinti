"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { heuristicParseSearch, type HeuristicCategory } from "@/lib/search-heuristic";
import { buildSearchSuggestions } from "@/lib/search-suggest";

/**
 * SmartSearchBar — EGY kereső, ami kétféleképp dolgozik:
 *
 *   • **Kulcsszavas (alapból):** ahogy gépelsz, azonnal szűr (gyors, ingyenes).
 *   • **✨ AI:** ha természetes mondatot írsz (pl. „villanyszerelő Aargauban, aki
 *     angolul is tud"), a ✨ gombra az AI értelmezi és beállítja a kategória /
 *     kanton / kulcsszó szűrőket. Nincs külön „AI kereső" panel — egy mező.
 */
interface ParsedFilter {
  categoryId: string | null;
  cantonCode: string | null;
  language: string | null;
  keywords: string;
  explanation: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onApplyCategory: (id: string) => void;
  onApplyCanton: (code: string) => void;
  onApplyQuery: (q: string) => void;
  /** A Szaknévsor kategóriái — a kliens-oldali heurisztika ezekre képez le
   *  (pl. „fodrász" → Fodrász), hogy a gyakori „kat + hely" keresés AI-hívás
   *  nélkül feloldódjon. Üresen hagyva mindig az AI-hoz fordulunk. */
  categories?: HeuristicCategory[];
  /**
   * Kategóriánkénti darabszám az AKTUÁLIS országban — a gépelés közbeni
   * javaslatokhoz. ⚠️ Enélkül nem tudnánk kiszűrni a nulla-találatos
   * kategóriákat, és zsákutcát ajánlanánk.
   */
  categoryCounts?: Record<string, number>;
  placeholder?: string;
  className?: string;
}

export function SmartSearchBar({
  value,
  onChange,
  onApplyCategory,
  onApplyCanton,
  onApplyQuery,
  categories,
  categoryCounts,
  placeholder = "Mit keresel? Pl. villanyszerelő Zürichben",
  className,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prefCountry] = usePreferredCountry();
  // Gépelés közbeni javaslatok. ⚠️ A mező eddig NÉMA volt: 70 szakma van az
  // adatbázisban, de a pill-sor csak néhányat mutat — aki nem tudta a szó
  // pontos alakját, nem talált rá. A javaslat elgépelést is javít.
  const [sugOpen, setSugOpen] = useState(false);
  const suggestions = useMemo(
    () =>
      categories && categoryCounts
        ? buildSearchSuggestions(value, categories, categoryCounts)
        : [],
    [value, categories, categoryCounts],
  );

  async function runAi() {
    const q = value.trim();
    if (q.length < 3) {
      setError("Írj előbb pár szót a keresőbe, aztán nyomd meg az ✨ AI gombot.");
      setNote(null);
      return;
    }

    // 1) Kliens-oldali heurisztika ELŐSZŐR: a gyakori „kategória + helyszín" mintát
    //    (pl. „fodrász Zürich", „orvos Bécsben") helyben, azonnal, AI-hívás nélkül
    //    oldjuk fel. Csak a bonyolultabb, természetes nyelvi kérés jut az AI-hoz —
    //    így a hálózati késleltetés és a szigorú AI-kvóta (20/óra/IP) megspórolható.
    const heur = heuristicParseSearch(q, prefCountry ?? DEFAULT_COUNTRY, categories ?? []);
    if (heur) {
      if (heur.categoryId) onApplyCategory(heur.categoryId);
      if (heur.cantonCode) onApplyCanton(heur.cantonCode);
      onApplyQuery(heur.keywords);
      setError(null);
      setNote(heur.explanation);
      return;
    }

    // 2) Csak ha a heurisztika bizonytalan (természetes nyelv) → valódi AI-hívás.
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/ai/parse-search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q, country: prefCountry ?? DEFAULT_COUNTRY }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "Nem sikerült értelmezni a keresést. Próbáld kulcsszóval.");
        return;
      }
      const data = (await res.json()) as ParsedFilter;
      if (data.categoryId) onApplyCategory(data.categoryId);
      if (data.cantonCode) onApplyCanton(data.cantonCode);
      onApplyQuery(data.keywords ?? "");
      setNote(data.explanation || "Beállítottam a szűrőket.");
    } catch {
      setError("Hálózati hiba — próbáld újra.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2 rounded-[18px] border border-line bg-surface px-3.5 py-3 shadow-card">
        <Icon name="search" size={20} className="shrink-0 text-ink-muted" />
        <input
          type="search"
          enterKeyHint="search"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSugOpen(true);
            if (note) setNote(null);
            if (error) setError(null);
          }}
          onFocus={() => setSugOpen(true)}
          // ⚠️ Késleltetett zárás: enélkül a blur ELŐBB tüzelne, mint a
          // javaslatra való kattintás, és a választás elveszne.
          onBlur={() => setTimeout(() => setSugOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSugOpen(false);
              return;
            }
            if (e.key === "Enter") {
              e.preventDefault();
              setSugOpen(false);
              void runAi();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[15px] font-medium tracking-[-0.01em] text-ink outline-none placeholder:text-ink-faint"
        />
        {value.length > 0 && (
          <button
            type="button"
            aria-label="Törlés"
            onClick={() => {
              onChange("");
              setNote(null);
              setError(null);
            }}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-surface-alt text-ink-muted transition hover:text-ink"
          >
            <Icon name="close" size={14} strokeWidth={2.4} />
          </button>
        )}
        <button
          type="button"
          onClick={runAi}
          disabled={busy}
          aria-label="AI-mód — természetes nyelvű keresés"
          title="AI-mód: írj természetes mondatot (pl. villanyszerelő Zürichben, aki angolul is tud) — az AI beállítja a szűrőket"
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-bold transition active:scale-95",
            busy
              ? "border-line bg-surface-alt text-ink-muted cursor-wait"
              : "border-line bg-surface text-ink hover:bg-surface-alt",
          )}
        >
          <Icon name="sparkles" size={15} strokeWidth={2.4} className={busy ? "animate-pulse text-primary" : "text-primary"} />
          {busy ? "…" : "AI-mód"}
          {/* Kereső-ikon a gomb végén — user-visszajelzés (2026-07-21): a sparkles+
              „AI-mód" felirat önmagában nem mondta ki egyértelműen, hogy a gombra
              koppintás KERESÉST indít (inkább egy mód-váltónak tűnt). */}
          {!busy && <Icon name="search" size={13} strokeWidth={2.6} className="text-ink-faint" />}
        </button>
      </div>

      {/* Gépelés közbeni javaslatok — a szakma nevére, darabszámmal.
          ⚠️ Csak olyat kínálunk, amiben VAN találat (a nulla-találatos
          kategória zsákutcába küldene). Az elgépelés-javítást külön jelöljük,
          hogy a felhasználó lássa: nem azt írta, amit ajánlunk. */}
      {sugOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label="Keresési javaslatok"
          className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-[14px] border border-line bg-surface shadow-card-hover"
        >
          {suggestions.map((s) => (
            <li key={s.categoryId}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                // onMouseDown: a blur ELŐTT tüzel, így a választás sosem vész el.
                onMouseDown={(e) => {
                  e.preventDefault();
                  onApplyCategory(s.categoryId);
                  onApplyQuery("");
                  onChange("");
                  setSugOpen(false);
                  setNote(`Szűrő: ${s.label}`);
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left transition hover:bg-surface-alt active:bg-surface-alt"
              >
                <Icon name="search" size={14} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold text-ink">
                  {s.label}
                  {s.fuzzy && (
                    <span className="ml-1.5 text-[11px] font-semibold text-ink-muted">
                      — erre gondoltál?
                    </span>
                  )}
                </span>
                <span className="shrink-0 rounded-full bg-surface-alt px-2 py-0.5 text-[11px] font-bold text-ink-muted">
                  {s.count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-1.5 px-1 text-[11.5px] font-bold text-accent">{error}</p>}
      {note && (
        <p className="mt-1.5 flex items-start gap-1.5 px-1 text-[11.5px] text-primary">
          <Icon name="sparkles" size={12} strokeWidth={2.4} className="mt-0.5 shrink-0" />
          <span>{note}</span>
        </p>
      )}
    </div>
  );
}
