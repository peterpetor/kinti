"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

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
  placeholder?: string;
  className?: string;
}

export function SmartSearchBar({
  value,
  onChange,
  onApplyCategory,
  onApplyCanton,
  onApplyQuery,
  placeholder = "Mit keresel? Pl. „villanyszerelő Aargauban, aki angolul is tud”",
  className,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAi() {
    const q = value.trim();
    if (q.length < 3) {
      setError("Írj előbb pár szót a keresőbe, aztán nyomd meg az ✨ AI gombot.");
      setNote(null);
      return;
    }
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/ai/parse-search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q }),
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
    <div className={className}>
      <div className="flex items-center gap-2 rounded-[18px] border border-line bg-surface px-3.5 py-3 shadow-card">
        <Icon name="search" size={20} className="shrink-0 text-ink-muted" />
        <input
          type="search"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (note) setNote(null);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
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
          aria-label="AI értelmezés"
          title="Természetes nyelvű keresés — az AI beállítja a szűrőket"
          className={cn(
            "grid h-8 shrink-0 place-items-center gap-1 rounded-[10px] px-2.5 text-[11.5px] font-extrabold transition active:scale-95",
            busy
              ? "bg-surface-alt text-ink-muted cursor-wait"
              : "bg-primary-soft/60 text-primary hover:bg-primary-soft",
          )}
        >
          <span className="inline-flex items-center gap-1">
            <Icon name="sparkles" size={14} strokeWidth={2.4} className={busy ? "animate-pulse" : ""} />
            {busy ? "…" : "AI"}
          </span>
        </button>
      </div>

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
