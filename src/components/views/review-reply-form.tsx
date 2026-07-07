"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

/**
 * ReviewReplyForm — a vállalkozás tulajdonosa nyilvánosan válaszolhat egy
 * véleményre (Google-stílusú bizalmi jel). Újrahasznosítható: az `endpoint`
 * dönti el a tulajdonjog-igazolást (manage-token vagy Clerk owner). A mentett
 * válasz a publikus profilon is megjelenik.
 *
 * Bemenet: reviewId + a meglévő válasz (ha van). Mentés → router.refresh().
 */
const MAX = 1000;

export function ReviewReplyForm({
  reviewId,
  endpoint,
  initialResponse,
}: {
  reviewId: string;
  /** A POST végpont (a kezelt cég manage-route-ja: `/api/business/manage/<token>`). */
  endpoint: string;
  initialResponse?: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(initialResponse ?? "");
  const [phase, setPhase] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);

  const current = initialResponse?.trim() || null;

  async function submit(nextText: string) {
    setPhase("saving");
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        // action: a konszolidált manage POST route akció-diszpécseréhez.
        body: JSON.stringify({ action: "review-response", reviewId, response: nextText }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "A mentés nem sikerült.");
        setPhase("idle");
        return;
      }
      setEditing(false);
      setPhase("idle");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hálózati hiba.");
      setPhase("idle");
    }
  }

  // Megjelenített (nem szerkesztett) állapot: van válasz → mutatjuk + „Szerkesztés”;
  // nincs válasz → „Válasz írása” gomb.
  if (!editing) {
    return (
      <div className="mt-2.5 border-t border-line/40 pt-2.5">
        {current ? (
          <div className="rounded-[12px] bg-primary-soft/60 px-3 py-2.5">
            <div className="mb-1 flex items-center gap-1.5">
              <span className="text-[13px]">💬</span>
              <span className="text-[11.5px] font-bold uppercase tracking-wide text-primary">
                A vállalkozás válasza
              </span>
            </div>
            <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink">{current}</p>
            <button
              type="button"
              onClick={() => { setText(current); setEditing(true); }}
              className="mt-1.5 text-[12px] font-bold text-primary hover:underline"
            >
              Szerkesztés
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { setText(""); setEditing(true); }}
            className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[12.5px] font-bold text-ink active:scale-95"
          >
            💬 Válasz írása
          </button>
        )}
      </div>
    );
  }

  // Szerkesztő állapot.
  return (
    <div className="mt-2.5 border-t border-line/40 pt-2.5">
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
        Válaszod (nyilvános)
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={MAX}
        placeholder="Köszönd meg a visszajelzést, vagy reagálj tárgyilagosan…"
        className="w-full resize-none rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <p className="mt-1 text-right text-[11px] text-ink-faint">{text.length} / {MAX}</p>

      {error && (
        <div className="mt-1 rounded-[10px] border border-accent/30 bg-accent/5 px-3 py-2 text-[12px] font-semibold text-accent">
          {error}
        </div>
      )}

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => submit(text)}
          disabled={phase === "saving" || !text.trim()}
          className={cn(
            "rounded-pill bg-primary px-4 py-2 text-[13px] font-extrabold text-white active:scale-95",
            (phase === "saving" || !text.trim()) && "opacity-50 cursor-not-allowed",
          )}
        >
          {phase === "saving" ? "Mentés…" : current ? "Válasz frissítése" : "Válasz közzététele"}
        </button>
        <button
          type="button"
          onClick={() => { setEditing(false); setError(null); }}
          disabled={phase === "saving"}
          className="text-[12.5px] font-semibold text-ink-muted hover:underline"
        >
          Mégsem
        </button>
        {current && (
          <button
            type="button"
            onClick={() => submit("")}
            disabled={phase === "saving"}
            className="ml-auto text-[12px] font-semibold text-accent hover:underline"
          >
            Válasz törlése
          </button>
        )}
      </div>
    </div>
  );
}
