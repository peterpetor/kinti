"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * „Keresőindex újraépítése" — a teljes jóváhagyott vállalkozás-listát újra-
 * embeddeli a Vectorize szemantikus keresőbe (POST /api/admin/reindex-search).
 * Új bejegyzés jóváhagyáskor magától indexelődik; ez a gomb a TELJES
 * újraépítéshez kell (pl. seed-import után, vagy ha az index hiányos — a
 * kereső addig kulcsszavas fallbackre esik).
 */
export function ReindexSearchButton() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function onClick() {
    if (
      !confirm(
        "Teljes keresőindex-újraépítés indul (minden jóváhagyott vállalkozás újra-embeddelése a Vectorize-ba). Eltarthat fél-egy percig. Mehet?",
      )
    )
      return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/reindex-search", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        total?: number;
        indexed?: number;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setResult(`Hiba: ${data.error ?? res.status}`);
        return;
      }
      setResult(`✓ ${data.indexed}/${data.total} indexelve`);
    } catch {
      setResult("Hiba: a kérés nem ment át (hálózat?).");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-bold text-ink transition active:scale-95 hover:bg-surface-alt",
          busy && "cursor-wait opacity-60",
        )}
      >
        🔍 {busy ? "Indexelés…" : "Keresőindex újraépítése"}
      </button>
      {result && (
        <span
          className={cn(
            "text-[11.5px] font-bold",
            result.startsWith("Hiba") ? "text-accent" : "text-success",
          )}
        >
          {result}
        </span>
      )}
    </span>
  );
}
