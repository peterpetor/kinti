"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import type { IconName } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import {
  searchDestinations,
  quickActions,
  highlightTitle,
  type TitleSegment,
} from "@/lib/app-destinations";
import { tokenizeFolded, foldSearchText } from "@/lib/sql-fold";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

/**
 * GlobalSearch — az app „mindenkeresője" (command palette).
 *
 *   • GlobalSearchOverlay: a paletta MAGA — az (app) layoutban ül, így BÁRMELY
 *     oldalról megnyílik: Ctrl/⌘+K vagy „/" gyorsbillentyűvel, ill. a
 *     `kinti:open-global-search` eseménnyel (ezt lövi a fejléc-gomb).
 *   • GlobalSearch: a fejléc ikon-gombja (home) — csak eseményt dob.
 *
 * Ami benne van: azonnali app-cél keresés (eszközök/oldalak), útmutatók
 * (lazy-importált guides), szerveres cég+esemény keresés (/api/search),
 * ékezet-tudatos találat-kiemelés, üres állapotban „Legutóbbiak" (localStorage,
 * privacy-elv: kliens-oldalon) + kurált gyorsműveletek, teljes billentyű-
 * navigáció (↑↓ + Enter), és zsákutca-mentesítő „keresés a Szaknévsorban" sor.
 */

const OPEN_EVENT = "kinti:open-global-search";
const RECENTS_KEY = "kinti_global_recent_v1";
const RECENTS_MAX = 5;

/** Bárhonnan megnyitja a mindenkeresőt (pl. fejléc-gomb, üres állapot CTA-k). */
export function openGlobalSearch() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

interface SearchResults {
  businesses: Array<{ id: string; name: string; categoryLabel: string | null }>;
  events: Array<{ id: string; title: string; eventDate: string | null; venue: string | null }>;
}

const EMPTY: SearchResults = { businesses: [], events: [] };

/** Egy navigálható találat-sor (bármely szekcióból) — a billentyű-nav közös listája. */
interface Row {
  key: string;
  href: string;
  title: string;
  subtitle: string | null;
  icon?: IconName;
  section: "recent" | "quick" | "app" | "guide" | "business" | "event" | "cta";
}

interface RecentItem { href: string; title: string; icon?: IconName; }

function readRecents(): RecentItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]");
    return Array.isArray(raw)
      ? raw.filter((r) => r && typeof r.href === "string" && typeof r.title === "string").slice(0, RECENTS_MAX)
      : [];
  } catch {
    return [];
  }
}

function writeRecent(item: RecentItem) {
  try {
    const next = [item, ...readRecents().filter((r) => r.href !== item.href)].slice(0, RECENTS_MAX);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* localStorage tiltva → a recents egyszerűen nem működik */
  }
}

/** Finom haptika (ahol van vibrációs motor) — progresszív, hibára néma. */
function buzz() {
  try {
    navigator.vibrate?.(8);
  } catch {
    /* nem támogatott */
  }
}

/** Igaz, ha a billentyű-esemény szerkeszthető mezőben született (ott a „/" gépelés). */
function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  if (t.isContentEditable) return true;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/** Guide-találat (a lazy-importált tudásbázisból). */
interface GuideHit { slug: string; title: string; summary: string; icon: IconName; }

type GuidesModule = typeof import("@/lib/guides");

/** A fejléc keresés-gombja — csak megnyitja a globális palettát. */
export function GlobalSearch() {
  return (
    <button
      type="button"
      onClick={openGlobalSearch}
      aria-label="Keresés (Ctrl+K)"
      title="Keresés (Ctrl+K)"
      className="grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-line bg-surface text-ink shadow-card transition active:scale-95"
    >
      <Icon name="search" size={17} strokeWidth={2.4} />
    </button>
  );
}

export function GlobalSearchOverlay() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const guidesRef = useRef<GuidesModule | null>(null);
  const [guidesReady, setGuidesReady] = useState(false);

  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;

  const tokens = useMemo(() => tokenizeFolded(q), [q]);
  const hasQuery = q.trim().length >= 2;

  // Megnyitás: fejléc-gomb eseménye + gyorsbillentyűk (Ctrl/⌘+K toggle, „/" nyit).
  useEffect(() => {
    const onOpen = () => { buzz(); setOpen(true); };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        buzz();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isEditableTarget(e.target)) {
        e.preventDefault();
        buzz();
        setOpen(true);
      }
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // App-célok — azonnal, kliensoldalon.
  const destinations = useMemo(
    () => (hasQuery ? searchDestinations(q, country, 5) : []),
    [q, hasQuery, country],
  );

  // Útmutatók — a guides modul LAZY (nagy adatfájl, csak megnyitáskor töltjük).
  useEffect(() => {
    if (!open || guidesRef.current) return;
    let cancelled = false;
    import("@/lib/guides").then((m) => {
      if (cancelled) return;
      guidesRef.current = m;
      setGuidesReady(true);
    }).catch(() => { /* offline/chunk-hiba → a szekció egyszerűen kimarad */ });
    return () => { cancelled = true; };
  }, [open]);

  const guideHits = useMemo<GuideHit[]>(() => {
    if (!hasQuery || tokens.length === 0 || !guidesReady || !guidesRef.current) return [];
    const pool = guidesRef.current.getGuides(country);
    const out: GuideHit[] = [];
    for (const g of pool) {
      const hay = foldSearchText(`${g.title} ${g.summary}`);
      if (tokens.every((t) => hay.includes(t))) {
        out.push({ slug: g.slug, title: g.title, summary: g.summary, icon: g.icon });
        if (out.length >= 3) break;
      }
    }
    return out;
  }, [hasQuery, tokens, country, guidesReady]);

  // Szerveres cég+esemény keresés — debounce + abort.
  useEffect(() => {
    if (!open) return;
    if (!hasQuery) {
      setResults(EMPTY);
      return;
    }
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setBusy(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ac.signal });
        if (res.ok) setResults((await res.json()) as SearchResults);
      } catch {
        /* aborted vagy hibás — figyelmen kívül */
      } finally {
        if (!ac.signal.aborted) setBusy(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q, open, hasQuery]);

  // Megnyitás/zárás: fókusz + body-lock + állapot-reset + recents beolvasás.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setRecents(readRecents());
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      setQ("");
      setResults(EMPTY);
      setActive(0);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ---- A navigálható sorok EGY listában (billentyű-nav + render közös forrása) ----
  const rows = useMemo<Row[]>(() => {
    if (!hasQuery) {
      const quick = quickActions(country);
      return [
        ...recents.map<Row>((r) => ({
          key: `recent:${r.href}`, href: r.href, title: r.title, subtitle: null,
          icon: r.icon ?? "clock", section: "recent",
        })),
        ...quick.map<Row>((d) => ({
          key: `quick:${d.href}`, href: d.href, title: d.title, subtitle: d.subtitle,
          icon: d.icon, section: "quick",
        })),
      ];
    }
    const list: Row[] = [
      ...destinations.map<Row>((d) => ({
        key: `app:${d.href}`, href: d.href, title: d.title, subtitle: d.subtitle, icon: d.icon, section: "app",
      })),
      ...guideHits.map<Row>((g) => ({
        key: `guide:${g.slug}`, href: `/tudasbazis/${g.slug}`, title: g.title, subtitle: g.summary, icon: g.icon, section: "guide",
      })),
      ...results.businesses.map<Row>((b) => ({
        key: `biz:${b.id}`, href: `/szaknevsor/${b.id}`, title: b.name, subtitle: b.categoryLabel, section: "business",
      })),
      ...results.events.map<Row>((e) => ({
        key: `event:${e.id}`, href: `/kozosseg/esemeny/${e.id}`, title: e.title,
        subtitle: [e.eventDate, e.venue].filter(Boolean).join(" · ") || null, section: "event",
      })),
    ];
    // Zsákutca-mentesítés: a Szaknévsor teljes keresője mindig egy Enterre van.
    list.push({
      key: "cta:szaknevsor", href: `/szaknevsor?q=${encodeURIComponent(q.trim())}`,
      title: `„${q.trim()}" keresése a Szaknévsorban`, subtitle: "Teljes kereső szűrőkkel, térképpel",
      icon: "search", section: "cta",
    });
    return list;
  }, [hasQuery, recents, country, destinations, guideHits, results, q]);

  // Aktív sor vissza az elejére, ha változik a lista.
  useEffect(() => { setActive(0); }, [q, rows.length, open]);

  // Aktív sor látótérben tartása.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`#gs-item-${active}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const close = useCallback(() => setOpen(false), []);

  const pick = useCallback((row: Row, viaKeyboard: boolean) => {
    buzz();
    if (row.section !== "cta") {
      writeRecent({ href: row.href, title: row.title, icon: row.icon });
    }
    setOpen(false);
    if (viaKeyboard) router.push(row.href);
  }, [router]);

  // Billentyű-navigáció a palettán belül.
  const onInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (rows.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % rows.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + rows.length) % rows.length); }
    else if (e.key === "Enter") {
      const row = rows[active];
      if (row) { e.preventDefault(); pick(row, true); }
    }
  }, [rows, active, close, pick]);

  if (!open) return null;

  // A szekció-fejlécekhez: az adott szekció sorai + a globális kezdő-index.
  const sections: Array<{ id: Row["section"]; label: string; emoji: string }> = hasQuery
    ? [
        { id: "app", label: "Az appban", emoji: "🧭" },
        { id: "guide", label: "Útmutatók", emoji: "📖" },
        { id: "business", label: "Vállalkozások", emoji: "📑" },
        { id: "event", label: "Események", emoji: "📅" },
        { id: "cta", label: "", emoji: "" },
      ]
    : [
        { id: "recent", label: "Legutóbbiak", emoji: "🕘" },
        { id: "quick", label: "Gyorsműveletek", emoji: "⚡" },
      ];

  const showEmptyHint = hasQuery && rows.length <= 1 && !busy; // csak a CTA-sor maradt
  const showSkeleton = hasQuery && busy && results.businesses.length === 0 && results.events.length === 0;

  return (
    <div
      className="fixed inset-0 z-[110] flex justify-center items-start sm:items-center px-3 pt-[calc(env(safe-area-inset-top)+1rem)] pb-6 bg-ink/40 backdrop-blur-sm"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keresés a kintin"
        className="w-full max-w-md animate-fade-up rounded-card border border-line bg-surface shadow-pop overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kereső input */}
        <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
          <Icon name="search" size={17} className="shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={rows.length > 0}
            aria-controls="gs-listbox"
            aria-activedescendant={rows.length > 0 ? `gs-item-${active}` : undefined}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Eszköz, szakember, útmutató, esemény…"
            className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-ink outline-none placeholder:text-ink-faint"
            autoComplete="off"
          />
          {busy && <span className="text-[11px] text-ink-faint shrink-0" aria-live="polite">keresek…</span>}
          <kbd className="hidden sm:flex shrink-0 items-center gap-0.5 rounded-md border border-line bg-surface-alt px-1.5 py-0.5 text-[10px] font-bold text-ink-faint">
            Ctrl K
          </kbd>
          <button
            type="button"
            aria-label="Bezárás"
            onClick={close}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-alt text-ink-muted active:scale-90"
          >
            <Icon name="close" size={14} strokeWidth={2.4} />
          </button>
        </div>

        {/* Találatok / launcher */}
        <div ref={listRef} id="gs-listbox" role="listbox" className="flex-1 overflow-y-auto p-2">
          {!hasQuery && rows.length === 0 ? (
            <div className="px-3 py-8 text-center text-[12.5px] text-ink-muted">
              Kezdj el gépelni — keresel <strong className="text-ink">eszközt</strong>,{" "}
              <strong className="text-ink">vállalkozást</strong>,{" "}
              <strong className="text-ink">útmutatót</strong> vagy{" "}
              <strong className="text-ink">eseményt</strong>?
            </div>
          ) : showEmptyHint ? (
            <div className="px-3 pb-1 pt-6 text-center text-[12.5px] text-ink-muted">
              Nincs gyors találat „<strong className="text-ink">{q}</strong>" kifejezésre — próbáld a teljes keresőt:
            </div>
          ) : null}

          <div className="space-y-3">
            {sections.map((sec) => {
              const secRows = rows
                .map((r, i) => ({ r, i }))
                .filter(({ r }) => r.section === sec.id);
              if (secRows.length === 0) return null;
              return (
                <section key={sec.id}>
                  {sec.label && (
                    <h3 className="px-2 py-1 text-[11.5px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                      <span aria-hidden>{sec.emoji}</span>
                      {sec.label}
                      {sec.id !== "recent" && sec.id !== "quick" && (
                        <span className="text-ink-faint">({secRows.length})</span>
                      )}
                    </h3>
                  )}
                  <ul className="space-y-0.5">
                    {secRows.map(({ r, i }) => (
                      <li key={r.key}>
                        <Link
                          id={`gs-item-${i}`}
                          role="option"
                          aria-selected={i === active}
                          href={r.href}
                          onClick={() => pick(r, false)}
                          onMouseMove={() => setActive(i)}
                          className={cn(
                            "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 transition",
                            i === active ? "bg-primary-soft" : "hover:bg-surface-alt",
                            "active:scale-[0.99]",
                            r.section === "cta" && "border border-dashed border-line",
                          )}
                        >
                          {r.icon && (
                            <span className={cn(
                              "grid h-8 w-8 shrink-0 place-items-center rounded-[10px]",
                              r.section === "recent" ? "bg-surface-alt text-ink-muted" : "bg-primary-soft text-primary",
                            )}>
                              <Icon name={r.icon} size={16} strokeWidth={2.2} />
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13.5px] font-bold text-ink">
                              <HighlightedTitle title={r.title} tokens={r.section === "cta" ? [] : tokens} />
                            </div>
                            {r.subtitle && (
                              <div className="truncate text-[11px] text-ink-muted">{r.subtitle}</div>
                            )}
                          </div>
                          {i === active ? (
                            <span className="hidden sm:grid shrink-0 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] font-bold text-ink-faint">↵</span>
                          ) : (
                            <Icon name="chevR" size={13} className="text-ink-faint shrink-0" />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}

            {/* Skeleton, amíg a szerveres (cég/esemény) találatok töltenek */}
            {showSkeleton && (
              <div className="space-y-1.5 px-2" aria-hidden>
                {[0, 1].map((i) => (
                  <div key={i} className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2">
                    <div className="h-8 w-8 shrink-0 animate-pulse rounded-[10px] bg-surface-alt" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="h-3 w-2/3 animate-pulse rounded bg-surface-alt" />
                      <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface-alt" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cím a keresett szakaszok kiemelésével (ékezet-tudatos). */
function HighlightedTitle({ title, tokens }: { title: string; tokens: string[] }) {
  const segments: TitleSegment[] = useMemo(() => highlightTitle(title, tokens), [title, tokens]);
  return (
    <>
      {segments.map((s, i) =>
        s.hit ? (
          <mark key={i} className="rounded-[3px] bg-star/25 px-0.5 text-inherit">
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}
