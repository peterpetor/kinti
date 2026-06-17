"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

interface CvResult {
  summary: string;
  bullets: string[];
  tips: string[];
}

/**
 * CV-asszisztens (PRO) — a felhasználó nyers tapasztalat-szövegéből svájci
 * álláspiacra szabott összefoglalót + bullet pontokat + tippeket ad.
 * A leírás-asszisztens mintáját követi: csak javaslat, a user dönt.
 */
export function CvAssistant() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CvResult | null>(null);

  async function run() {
    if (text.trim().length < 20) {
      setError("Írj pár mondatot a tapasztalatodról (min. 20 karakter).");
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/cv-helper", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as CvResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Az AI épp túlterhelt — próbáld újra pár másodperc múlva.");
        return;
      }
      setResult({ summary: data.summary ?? "", bullets: data.bullets ?? [], tips: data.tips ?? [] });
    } catch {
      setError("Hálózati hiba.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-card border-2 border-primary/20 bg-primary-soft/40 p-5 shadow-card">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary/10 text-primary">
          <Icon name="sparkles" size={15} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-extrabold tracking-tight text-ink">AI CV-asszisztens</h3>
          <p className="text-[11.5px] text-ink-muted">PRO — svájci stílusú összefoglaló a tapasztalatodból.</p>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Írd le pár mondatban a tapasztalatodat, képesítéseidet, mit keresel… (pl. 5 év építőipari tapasztalat, kőműves szakképesítés, dolgoztam Ausztriában, B1 német)"
        rows={4}
        maxLength={2000}
        className="w-full resize-none rounded-[12px] border border-line bg-surface px-3 py-2.5 text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[11px] text-ink-faint">{text.length} / 2000</span>
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-[12.5px] font-extrabold transition active:scale-95",
            busy ? "bg-surface-alt text-ink-muted cursor-wait" : "bg-primary text-white shadow-card",
          )}
        >
          <Icon name="sparkles" size={12} strokeWidth={2.4} />
          {busy ? "AI dolgozik…" : "Csiszold ki"}
        </button>
      </div>
      {error && <p className="mt-2 text-[12px] font-bold text-accent">{error}</p>}

      {result && (
        <div className="mt-3 space-y-3">
          {result.summary && (
            <Block title="Szakmai összefoglaló" copyText={result.summary}>
              <p className="text-[13px] leading-relaxed text-ink">{result.summary}</p>
            </Block>
          )}
          {result.bullets.length > 0 && (
            <Block title="Kiemelendő pontok" copyText={result.bullets.map((b) => `• ${b}`).join("\n")}>
              <ul className="space-y-1">
                {result.bullets.map((b, i) => (
                  <li key={i} className="flex gap-1.5 text-[13px] leading-snug text-ink">
                    <span className="text-primary">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </Block>
          )}
          {result.tips.length > 0 && (
            <div className="rounded-[12px] border border-accent/20 bg-accent/5 p-3">
              <p className="mb-1 text-[11.5px] font-bold uppercase tracking-wide text-accent">Tippek a jelentkezéshez</p>
              <ul className="space-y-1">
                {result.tips.map((t, i) => (
                  <li key={i} className="flex gap-1.5 text-[12.5px] leading-snug text-ink-muted">
                    <span>💡</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[11px] text-ink-faint">
            Az AI csak javaslat — ellenőrizd és igazítsd a saját szavaidra, mielőtt a CV-dbe emeled.
          </p>
        </div>
      )}
    </section>
  );
}

function Block({ title, copyText, children }: { title: string; copyText: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-[12px] border border-primary/20 bg-surface p-3">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">{title}</p>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(copyText).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          className="text-[11px] font-bold text-primary"
        >
          {copied ? "✓ Másolva" : "Másolás"}
        </button>
      </div>
      {children}
    </div>
  );
}
