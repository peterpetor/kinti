"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

interface SearchResults {
  businesses: Array<{ id: string; name: string; categoryLabel: string | null }>;
  bulletins: Array<{ id: string; title: string; kindLabel: string | null; cantonCode: string | null }>;
  events: Array<{ id: string; title: string; eventDate: string | null; venue: string | null }>;
}

const EMPTY: SearchResults = { businesses: [], bulletins: [], events: [] };

/**
 * GlobalSearch — fixed modal egy nagy kereső-mezővel, ami a 3 entitásban keres
 * (vállalkozás, hirdetés, esemény). Kliens komponens, /api/search-ot hív.
 */
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced fetch
  useEffect(() => {
    if (!open) return;
    if (q.trim().length < 2) {
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
  }, [q, open]);

  // Focus + body lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      setQ("");
      setResults(EMPTY);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ESC bezárás
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const total =
    results.businesses.length + results.bulletins.length + results.events.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Keresés"
        className="grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-line bg-surface text-ink shadow-card transition active:scale-95"
      >
        <Icon name="search" size={17} strokeWidth={2.4} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[110] flex justify-center items-start sm:items-center px-3 pt-[calc(env(safe-area-inset-top)+1rem)] pb-6 bg-ink/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-card border border-line bg-surface shadow-card-strong overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kereső input */}
            <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
              <Icon name="search" size={17} className="shrink-0 text-ink-muted" />
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Keresés a kintin…"
                className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-ink outline-none placeholder:text-ink-faint"
                autoComplete="off"
              />
              {busy && <span className="text-[10px] text-ink-faint shrink-0">keresek…</span>}
              <button
                type="button"
                aria-label="Bezárás"
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-alt text-ink-muted active:scale-90"
              >
                <Icon name="close" size={14} strokeWidth={2.4} />
              </button>
            </div>

            {/* Találatok */}
            <div className="flex-1 overflow-y-auto p-2">
              {q.trim().length < 2 ? (
                <div className="px-3 py-8 text-center text-[12.5px] text-ink-muted">
                  Írj legalább 2 karaktert.<br />
                  Keresel <strong className="text-ink">vállalkozást</strong>,{" "}
                  <strong className="text-ink">hirdetést</strong> vagy{" "}
                  <strong className="text-ink">eseményt</strong>?
                </div>
              ) : total === 0 ? (
                <div className="px-3 py-8 text-center text-[12.5px] text-ink-muted">
                  Nincs találat „<strong className="text-ink">{q}</strong>" kifejezésre.
                </div>
              ) : (
                <div className="space-y-3">
                  <ResultSection
                    label="Vállalkozások"
                    emoji="📑"
                    items={results.businesses.map((b) => ({
                      key: b.id,
                      href: `/szaknevsor/${b.id}`,
                      title: b.name,
                      subtitle: b.categoryLabel,
                    }))}
                    onNavigate={() => setOpen(false)}
                  />
                  <ResultSection
                    label="Hirdetések"
                    emoji="📢"
                    items={results.bulletins.map((b) => ({
                      key: b.id,
                      href: `/kozosseg/hirdetes/${b.id}`,
                      title: b.title,
                      subtitle: [b.kindLabel, b.cantonCode ? `🇨🇭 ${b.cantonCode}` : null]
                        .filter(Boolean)
                        .join(" · "),
                    }))}
                    onNavigate={() => setOpen(false)}
                  />
                  <ResultSection
                    label="Események"
                    emoji="📅"
                    items={results.events.map((e) => ({
                      key: e.id,
                      href: `/kozosseg/esemeny/${e.id}`,
                      title: e.title,
                      subtitle: [e.eventDate, e.venue].filter(Boolean).join(" · "),
                    }))}
                    onNavigate={() => setOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface SearchItem {
  key: string;
  href: string;
  title: string;
  subtitle: string | null;
}

function ResultSection({
  label,
  emoji,
  items,
  onNavigate,
}: {
  label: string;
  emoji: string;
  items: SearchItem[];
  onNavigate: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="px-2 py-1 text-[10.5px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
        <span>{emoji}</span>
        {label}
        <span className="text-ink-faint">({items.length})</span>
      </h3>
      <ul className="space-y-0.5">
        {items.map((it) => (
          <li key={it.key}>
            <Link
              href={it.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-[10px] px-2.5 py-2 transition",
                "hover:bg-surface-alt active:scale-[0.99]",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-bold text-ink">{it.title}</div>
                {it.subtitle && (
                  <div className="truncate text-[11px] text-ink-muted">{it.subtitle}</div>
                )}
              </div>
              <Icon name="chevR" size={13} className="text-ink-faint shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
