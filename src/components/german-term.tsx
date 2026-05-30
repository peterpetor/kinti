"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";

/**
 * GermanTerm — inline tooltip-jellegű komponens, ami egy svájci hivatali
 * német/francia kifejezést jelöl, és kattintásra magyar magyarázatot mutat
 * (AI-generált).
 *
 * Használat (server-render is OK, a fetch csak click-re indul):
 *   <GermanTerm>Vorsorgeauftrag</GermanTerm>
 *
 * A magyarázat edge-cache-elt 7 napra (azonos kifejezés mindig ugyanaz).
 */

export function GermanTerm({ children }: { children: string }) {
  const [open, setOpen] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (explanation || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/ai/german-term?term=${encodeURIComponent(children)}`,
      );
      const data = (await res.json()) as { explanation?: string | null; error?: string };
      if (data.explanation) {
        setExplanation(data.explanation);
      } else {
        setError(data.error || "Nem tudtuk lekérni a magyarázatot.");
      }
      setLoading(false);
    } catch {
      setError("Hálózati hiba.");
      setLoading(false);
    }
  }

  return (
    <span ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-baseline gap-0.5 border-b border-dashed border-primary/50 text-primary hover:text-primary/80 transition cursor-help"
        aria-label={`Mit jelent: ${children}?`}
      >
        {children}
        <Icon name="question" size={9} strokeWidth={2.4} className="self-center text-primary/70" />
      </button>

      {open && (
        <span className="absolute left-0 top-full z-20 mt-1 w-[260px] rounded-card border border-line bg-surface p-3 shadow-pop">
          <span className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">
            <Icon name="sparkles" size={10} strokeWidth={2.4} />
            AI magyarázat
          </span>
          {loading && (
            <>
              <span className="block h-[12px] w-3/4 animate-pulse rounded bg-primary/10" />
              <span className="mt-1.5 block h-[12px] w-5/6 animate-pulse rounded bg-primary/10" />
            </>
          )}
          {error && (
            <span className="block text-[11.5px] text-accent">{error}</span>
          )}
          {explanation && (
            <span className="block text-[12px] leading-snug text-ink">{explanation}</span>
          )}
          <span className="mt-2 block text-[9.5px] text-ink-faint italic">
            Automatikus magyarázat, nem hivatalos forrás. Részletekért: ch.ch
          </span>
        </span>
      )}
    </span>
  );
}
