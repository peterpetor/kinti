"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

export function KintiAssistant() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(data.error || "Hiba történt a kérdés feldolgozása közben.");
      }

      setAnswer(data.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[22px] border border-[#2563eb]/20 bg-[#2563eb]/[0.03] p-4 shadow-sm">
      <div className="mb-3 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#2563eb] text-white shadow-md">
          <Icon name="search" size={20} strokeWidth={2.3} />
        </div>
        <div>
          <h3 className="text-[15.5px] font-extrabold tracking-[-0.01em] text-ink">
            Kinti Asszisztens (AI)
          </h3>
          <p className="text-[12.5px] leading-snug text-ink-muted">
            Kérdezz a svájci életről (pl. vám, büntetések, adózás, iskola) és én azonnal válaszolok a Kinti tudásbázisa alapján!
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Mennyi vámot kell fizetnem 5 liter borra?"
          disabled={loading}
          className="h-[46px] w-full rounded-2xl border border-line bg-surface pl-4 pr-12 text-[14px] font-medium text-ink placeholder:text-ink-faint focus:border-[#2563eb] focus:outline-none focus:ring-4 focus:ring-[#2563eb]/10 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="absolute right-2 top-2 grid h-[30px] w-[30px] place-items-center rounded-xl bg-[#2563eb] text-white transition active:scale-95 disabled:opacity-50"
          aria-label="Kérdés küldése"
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Icon name="arrowUp" size={16} strokeWidth={2.5} />
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl bg-danger/10 p-3 text-[13px] font-semibold text-danger">
          {error}
        </div>
      )}

      {answer && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-line bg-surface p-4 shadow-card">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#2563eb] animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wide text-[#2563eb]">
              AI Válasz
            </span>
          </div>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}
