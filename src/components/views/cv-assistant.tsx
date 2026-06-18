"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

interface CvIssue {
  section: string;
  problem: string;
  fix: string;
}
interface CvRewrite {
  title: string;
  content: string;
}
interface CvReview {
  score: number | null;
  summary: string;
  strengths: string[];
  issues: CvIssue[];
  rewrite: CvRewrite[];
}

/**
 * AI CV-audit (PRO). A PDF szövegét a BÖNGÉSZŐ nyeri ki (pdf.js/unpdf) — ez
 * megbízhatóbb, mint az edge-en futtatott PDF-parse —, majd a kinyert szöveget
 * küldjük a szervernek, ahol egy erős (70B) modell svájci HR-szempontból auditálja:
 * 0–100 pont, erősségek, szakaszonkénti konkrét hibák + javítások, végül a
 * leggyengébb szakaszok svájci formátumban újraírva.
 */
export function CvAssistant() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<"idle" | "reading" | "analyzing">("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CvReview | null>(null);

  const busy = phase !== "idle";

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // ugyanaz a fájl újraválasztható legyen
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Csak PDF-et tudok elemezni.");
      return;
    }
    setError(null);
    setResult(null);
    setFileName(file.name);

    // 1) Szöveg kinyerése a böngészőben
    let text = "";
    setPhase("reading");
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(buf);
      const res = await extractText(pdf, { mergePages: true });
      text = (Array.isArray(res.text) ? res.text.join("\n") : res.text).trim();
    } catch {
      setPhase("idle");
      setError("Nem sikerült beolvasni a PDF-et. Próbálj egy másik (szöveges) PDF-et.");
      return;
    }
    if (text.replace(/\s+/g, "").length < 60) {
      setPhase("idle");
      setError(
        "Ebből a PDF-ből alig jött ki szöveg — valószínűleg szkennelt/kép-alapú. Tölts fel szöveges, kimásolható PDF-et.",
      );
      return;
    }

    // 2) Elemzés a szerveren
    setPhase("analyzing");
    try {
      const res = await fetch("/api/ai/cv-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 12000) }),
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
        rewrite: data.rewrite ?? [],
      });
    } catch {
      setError("Hálózati hiba — próbáld újra.");
    } finally {
      setPhase("idle");
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
            PRO — átnézi a CV-det a svájci HR-elvárások szerint.
          </p>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        onChange={onPick}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className={cn(
          "inline-flex w-full items-center justify-center gap-1.5 rounded-pill px-4 py-2.5 text-[13px] font-extrabold transition active:scale-95",
          busy ? "cursor-wait bg-surface-alt text-ink-muted" : "bg-primary text-white shadow-card",
        )}
      >
        <Icon name="sparkles" size={13} strokeWidth={2.4} />
        {phase === "reading"
          ? "CV beolvasása…"
          : phase === "analyzing"
            ? "Az AI elemzi… (~20–40 mp)"
            : result
              ? "Másik CV elemzése"
              : "Válaszd ki a CV-det (PDF)"}
      </button>

      {fileName && !error && (
        <p className="mt-1.5 truncate text-[11px] text-ink-faint">📄 {fileName}</p>
      )}
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

          {result.rewrite.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
                Újraírt szakaszok (svájci formátum)
              </p>
              <div className="space-y-2">
                {result.rewrite.map((r, i) => (
                  <Block key={i} title={r.title || "Szakasz"} copyText={r.content}>
                    <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink">
                      {r.content}
                    </p>
                  </Block>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-ink-faint">
            Az AI csak javaslat — ellenőrizd és igazítsd a saját szavaidra, mielőtt a CV-dbe
            emeled. A [...] helyekre a saját konkrét adataidat írd.
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

function Block({
  title,
  copyText,
  children,
}: {
  title: string;
  copyText: string;
  children: React.ReactNode;
}) {
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
