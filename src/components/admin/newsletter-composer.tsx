"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

interface SegmentOption {
  code: string;
  label: string;
  count: number;
}

const inputCls =
  "w-full rounded-[12px] border border-line bg-surface-alt px-3.5 py-3 text-[14px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

/**
 * Admin hírlevél-szerkesztő: ország-szegmens + tárgy + sima-szöveg törzs → küldés
 * a /api/admin/newsletter/send route-ra (Resend batch). Napi-keret-tudatos.
 */
export function NewsletterComposer({
  options,
  dailyRemaining,
}: {
  options: SegmentOption[];
  dailyRemaining: number;
}) {
  const [country, setCountry] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [phase, setPhase] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState<{ sent: number; skipped: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recipientCount = options.find((o) => o.code === country)?.count ?? 0;
  const willSend = Math.min(recipientCount, dailyRemaining, 100);
  const disabled = phase === "sending" || subject.trim().length < 3 || body.trim().length < 10 || willSend === 0;

  async function send() {
    if (!confirm(`Biztosan kiküldöd ${willSend} címzettnek?`)) return;
    setPhase("sending");
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subject, body, country }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; sent?: number; skipped?: number; total?: number };
      if (!res.ok) {
        setError(data.error ?? "Hiba történt a küldés során.");
        setPhase("error");
        return;
      }
      setResult({ sent: data.sent ?? 0, skipped: data.skipped ?? 0, total: data.total ?? 0 });
      setPhase("done");
    } catch {
      setError("Hálózati hiba.");
      setPhase("error");
    }
  }

  return (
    <div className="space-y-4 rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Kinek (megerősített feliratkozók)</label>
        <div className="flex flex-wrap gap-1.5">
          {options.map((o) => (
            <button
              key={o.code}
              type="button"
              onClick={() => setCountry(o.code)}
              className={cn(
                "rounded-pill px-3 py-1.5 text-[12px] font-bold transition",
                country === o.code ? "bg-primary text-white shadow-card" : "border border-line bg-surface-alt text-ink hover:bg-surface",
              )}
            >
              {o.label} <span className={cn("ml-1", country === o.code ? "text-white/80" : "text-ink-faint")}>{o.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Tárgy</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} placeholder="Pl. Kinti hírek — júniusi szám" className={inputCls} />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Tartalom <span className="font-normal normal-case text-ink-faint">— sima szöveg, üres sor = új bekezdés</span></label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} maxLength={8000} placeholder="Szia!&#10;&#10;Ezek a hónap legfontosabb hírei…" className={cn(inputCls, "resize-y leading-relaxed")} />
      </div>

      {error && <div className="rounded-[10px] bg-accent/10 px-3 py-2.5 text-[12.5px] font-semibold text-accent">{error}</div>}
      {phase === "done" && result && (
        <div className="rounded-[10px] border border-success/30 bg-success/10 px-3 py-2.5 text-[12.5px] font-semibold text-success">
          ✅ Elküldve {result.sent} címzettnek{result.skipped > 0 ? ` · ${result.skipped} kimaradt a napi keret miatt (a maradékot holnap kiküldheted)` : ""}.
        </div>
      )}

      <button
        type="button"
        onClick={send}
        disabled={disabled}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-primary text-[15px] font-extrabold text-white shadow-card-hover transition active:scale-[0.98]",
          disabled && "opacity-60 cursor-not-allowed",
        )}
      >
        {phase === "sending" ? "Küldés…" : `Küldés ${willSend} címzettnek`}
      </button>
      {recipientCount > willSend && (
        <p className="text-center text-[11px] text-ink-faint">A szegmensben {recipientCount} feliratkozó van, de most csak {willSend} fér a napi keretbe — a többit később küldheted.</p>
      )}
    </div>
  );
}
