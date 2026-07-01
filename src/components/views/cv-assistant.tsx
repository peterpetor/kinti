"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

interface CvIssue {
  section: string;
  problem: string;
  fix: string;
}
interface CvReview {
  score: number | null;
  summary: string;
  strengths: string[];
  issues: CvIssue[];
}

/**
 * AI CV-audit (PRO) — a FELTÖLTÖTT CV-t (PDF) nézi át a szerver: R2 → szöveg
 * (Cloudflare AI.toMarkdown) → modell. CSAK értékel (nem ír újra): 0–100 pont,
 * erősségek, szakaszonkénti konkrét hibák + javítások.
 */
export function CvAssistant({ hasCv = false }: { hasCv?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CvReview | null>(null);
  const [prefCountry] = usePreferredCountry();

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/cv-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ country: prefCountry ?? DEFAULT_COUNTRY }),
      });
      const data = (await res.json().catch(() => ({}))) as CvReview & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Az AI épp túlterhelt — próbáld újra pár másodperc múlva.");
        return;
      }
      setResult({
        score: typeof data.score === "number" ? data.score : null,
        summary: data.summary ?? "",
        strengths: data.strengths ?? [],
        issues: data.issues ?? [],
      });
    } catch {
      setError("Hálózati hiba — próbáld újra.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-card border-2 border-primary/20 bg-primary-soft/40 p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary/10 text-primary">
          <Icon name="sparkles" size={15} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-extrabold tracking-tight text-ink">AI CV-audit</h3>
          <p className="text-[11.5px] text-ink-muted">
            PRO — átnézi a feltöltött CV-det a helyi HR-elvárások szerint.
          </p>
        </div>
      </div>

      {!hasCv && !result && (
        <p className="mb-3 rounded-[12px] border border-accent/20 bg-accent/5 px-3 py-2 text-[12.5px] leading-snug text-ink-muted">
          📄 Tölts fel egy <strong>szöveges (nem szkennelt) PDF</strong> CV-t a{" "}
          <Link href="/allasok/profil" className="font-bold text-primary underline">profilodnál</Link>, aztán
          futtasd az auditot.
        </p>
      )}

      <button
        type="button"
        onClick={run}
        disabled={busy}
        className={cn(
          "inline-flex w-full items-center justify-center gap-1.5 rounded-pill px-4 py-2.5 text-[13px] font-extrabold transition active:scale-95",
          busy ? "cursor-wait bg-surface-alt text-ink-muted" : "bg-primary text-white shadow-card",
        )}
      >
        <Icon name="sparkles" size={13} strokeWidth={2.4} />
        {busy ? "Az AI átnézi a CV-det… (~20–40 mp)" : result ? "Újra elemzem" : "Elemezd a CV-met"}
      </button>

      {error && <p className="mt-2 text-[12px] font-bold text-accent">{error}</p>}

      {result && (
        <div className="mt-4 space-y-4">
          {result.score !== null && <ScoreBar score={result.score} />}

          {result.summary && (
            <p className="text-[13px] leading-relaxed text-ink">{result.summary}</p>
          )}

          {result.strengths.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
                Erősségek
              </p>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex gap-1.5 text-[13px] leading-snug text-ink">
                    <span className="text-primary">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.issues.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
                Mit javíts ({result.issues.length})
              </p>
              <div className="space-y-2">
                {result.issues.map((it, i) => (
                  <div key={i} className="rounded-[12px] border border-line bg-surface p-3">
                    {it.section && (
                      <p className="text-[12px] font-extrabold text-ink">{it.section}</p>
                    )}
                    {it.problem && (
                      <p className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">{it.problem}</p>
                    )}
                    {it.fix && (
                      <p className="mt-1 flex gap-1.5 text-[12.5px] leading-snug text-ink">
                        <span className="text-primary">→</span>
                        <span>{it.fix}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-ink-faint">
            Az AI csak javaslat — a végső döntés a tiéd. A „mit javíts" pontokat a saját
            CV-szerkesztődben vezesd át.
          </p>
        </div>
      )}
    </section>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? "#2e7d52" : score >= 50 ? "#cc7700" : "#c2410c";
  const label = score >= 75 ? "Erős" : score >= 50 ? "Közepes" : "Fejlesztendő";
  return (
    <div className="rounded-[12px] border border-line bg-surface p-3">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          CV-pontszám
        </span>
        <span className="text-[15px] font-extrabold" style={{ color }}>
          {score}/100 · {label}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-alt">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

