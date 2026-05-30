"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * AISearchBar — természetes nyelvű keresés a Szaknévsorban.
 *
 * A user pl. ezt írja: "magyar villanyszerelő Aargau-ban aki angolul is tud",
 * és az API endpoint (/api/ai/parse-search) visszaadja a strukturált szűrőket.
 * A komponens ezekkel hívja a setter-eket, beállítja a kategória + kanton +
 * keyword filtereket.
 */

interface ParsedFilter {
  categoryId: string | null;
  cantonCode: string | null;
  language: string | null;
  keywords: string;
  explanation: string;
}

interface Props {
  /** Aktuális szabad-keresés mező — ezt is felülírjuk, ha az AI keywords-et ad. */
  onApplyCategory: (id: string) => void;
  onApplyCanton: (code: string) => void;
  onApplyQuery: (q: string) => void;
}

export function AISearchBar({
  onApplyCategory,
  onApplyCanton,
  onApplyQuery,
}: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ParsedFilter | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk() {
    const q = input.trim();
    if (q.length < 3) {
      setError("Írj részletesebben (min 3 karakter).");
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/parse-search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "Nem sikerült értelmezni a keresést.");
        setBusy(false);
        return;
      }
      const data = (await res.json()) as ParsedFilter;
      setResult(data);
      setBusy(false);
    } catch {
      setError("Hálózati hiba.");
      setBusy(false);
    }
  }

  function applyAndClose() {
    if (!result) return;
    if (result.categoryId) onApplyCategory(result.categoryId);
    if (result.cantonCode) onApplyCanton(result.cantonCode);
    if (result.keywords) onApplyQuery(result.keywords);
    setOpen(false);
    setInput("");
    setResult(null);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-pill border border-primary/30 bg-primary-soft/40 px-3 py-2 shadow-card transition active:scale-[0.97] cursor-pointer hover:bg-primary-soft/60"
      >
        <Icon name="sparkles" size={13} strokeWidth={2.4} className="text-primary shrink-0" />
        <span className="text-[11.5px] font-bold tracking-wide text-primary select-none">
          AI kereső
        </span>
      </button>
    );
  }

  return (
    <div className="w-full rounded-card border-2 border-primary/30 bg-surface p-4 shadow-card-hover">
      <div className="flex items-center gap-2">
        <Icon name="sparkles" size={14} strokeWidth={2.4} className="text-primary" />
        <span className="text-[12px] font-extrabold uppercase tracking-wide text-primary">
          Mondd el mit keresel
        </span>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setResult(null);
            setError(null);
          }}
          aria-label="Bezár"
          className="ml-auto grid h-7 w-7 place-items-center rounded-full bg-surface-alt text-ink-muted active:scale-90"
        >
          ✕
        </button>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={2}
        maxLength={200}
        placeholder="pl. magyar villanyszerelő Aargau-ban aki angolul is tud"
        disabled={busy}
        className="mt-2 w-full rounded-[10px] border border-line bg-surface-alt px-3 py-2 text-[13px] text-ink outline-none focus:ring-2 focus:ring-primary/30 resize-none"
      />

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[10.5px] text-ink-faint">
          A kereső automatikusan beállítja a szűrőket.
        </span>
        <button
          type="button"
          onClick={handleAsk}
          disabled={busy || input.trim().length < 3}
          className={cn(
            "rounded-pill px-4 py-2 text-[12px] font-extrabold transition active:scale-95",
            busy || input.trim().length < 3
              ? "bg-surface-alt text-ink-muted cursor-not-allowed"
              : "bg-primary text-white shadow-card",
          )}
        >
          {busy ? "Értelmezem…" : "Megértem"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-[11.5px] font-bold text-accent">{error}</p>
      )}

      {result && (
        <div className="mt-3 rounded-[10px] border border-primary/20 bg-primary-soft/40 p-3">
          <p className="text-[12px] font-bold text-ink">
            {result.explanation || "Készen állok a szűrésre."}
          </p>
          <ul className="mt-2 space-y-0.5 text-[11.5px] text-ink-muted">
            {result.categoryId && (
              <li>
                <strong className="text-ink">Kategória:</strong> {result.categoryId}
              </li>
            )}
            {result.cantonCode && (
              <li>
                <strong className="text-ink">Kanton:</strong> {result.cantonCode}
              </li>
            )}
            {result.language && (
              <li>
                <strong className="text-ink">Nyelv:</strong> {result.language.toUpperCase()}
              </li>
            )}
            {result.keywords && (
              <li>
                <strong className="text-ink">Egyéb keresés:</strong> „{result.keywords}"
              </li>
            )}
          </ul>
          <button
            type="button"
            onClick={applyAndClose}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[12.5px] font-extrabold text-white shadow-card active:scale-95"
          >
            Beállítom a szűrőket
            <Icon name="arrowRight" size={12} strokeWidth={2.4} />
          </button>
        </div>
      )}
    </div>
  );
}
