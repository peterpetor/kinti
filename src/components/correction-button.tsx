"use client";

import { useId, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { BottomSheet } from "./bottom-sheet";
import {
  CORRECTION_FIELDS,
  CORRECTION_FIELD_LABELS,
  needsSuggestion,
  type CorrectionField,
} from "@/lib/correction-fields";

/**
 * „Javíts rajta" — könnyű adatjavítási javaslat egy szaknévsor-tételhez.
 *
 * ⚠️ MIÉRT KELL A „JELENTEM" MELLÉ: a bejelentés AZONNAL ELREJTI a vállalkozást
 * (DSA Art. 16). Ez helyes egy jogsértő adatra, de aránytalan egy elgépelt
 * telefonszámra — eddig aki csak javítani akart, vagy hallgatott, vagy
 * indokolatlanul levetetett egy működő céget. Ez a gomb NEM rejt el semmit:
 * a javaslat sorba áll, és admin dönt róla.
 */
export function CorrectionButton({ businessId }: { businessId: string }) {
  const [open, setOpen] = useState(false);
  const [field, setField] = useState<CorrectionField>("phone");
  const [suggestion, setSuggestion] = useState("");
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  const fieldId = useId();
  const suggestionId = useId();
  const noteId = useId();

  // A „már nem működik" jelzésnél nincs javasolt érték — ott a puszta jelzés az adat.
  const needsValue = needsSuggestion(field);

  async function submit() {
    if (needsValue && !suggestion.trim()) {
      setError("Írd be a helyes értéket.");
      return;
    }
    if (siteKey && !turnstileToken) {
      setError("Várj a robot-ellenőrzésre (pár másodperc).");
      return;
    }
    setPhase("sending");
    setError(null);
    try {
      const res = await fetch("/api/business/correction", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessId,
          field,
          suggestion: suggestion.trim() || null,
          note: note.trim() || null,
          turnstileToken,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Nem sikerült elküldeni.");
        setPhase("error");
        turnstileRef.current?.reset(); // egyszer használatos token
        return;
      }
      setPhase("done");
    } catch {
      setError("Hálózati hiba. Próbáld újra.");
      setPhase("error");
    }
  }

  function close() {
    setOpen(false);
    setTimeout(() => {
      setField("phone");
      setSuggestion("");
      setNote("");
      setPhase("idle");
      setError(null);
      setTurnstileToken("");
    }, 200);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-faint transition-colors hover:text-primary-ink"
      >
        <Icon name="edit" size={11} strokeWidth={2.4} /> Javíts rajta
      </button>

      <BottomSheet open={open} onClose={close} title="Adatjavítás">
        {phase === "done" ? (
          <div className="py-2 text-center">
            <div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-2xl bg-success/15 text-success">
              <Icon name="check" size={20} strokeWidth={2.6} />
            </div>
            <p className="text-[14px] font-bold text-ink">Köszönjük!</p>
            <p className="mx-auto mt-1 max-w-xs text-[12.5px] leading-relaxed text-ink-muted">
              Átnézzük, és ha helytálló, javítjuk az adatlapot. A vállalkozás addig is
              látható marad.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-3 rounded-pill bg-primary px-4 py-2 text-[12.5px] font-bold text-white"
            >
              Rendben
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[12.5px] leading-relaxed text-ink-muted">
              Elavult vagy hibás adatot látsz? Írd meg a helyeset — emberi szem nézi át,
              és a vállalkozás közben látható marad.
            </p>

            <div>
              <label
                htmlFor={fieldId}
                className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted"
              >
                Mi a hibás?
              </label>
              <select
                id={fieldId}
                value={field}
                onChange={(e) => setField(e.target.value as CorrectionField)}
                className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {CORRECTION_FIELDS.map((f) => (
                  <option key={f} value={f}>
                    {CORRECTION_FIELD_LABELS[f]}
                  </option>
                ))}
              </select>
            </div>

            {needsValue && (
              <div>
                <label
                  htmlFor={suggestionId}
                  className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted"
                >
                  A helyes érték
                </label>
                <input
                  id={suggestionId}
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  maxLength={300}
                  className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}

            <div>
              <label
                htmlFor={noteId}
                className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted"
              >
                Megjegyzés (nem kötelező)
              </label>
              <textarea
                id={noteId}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={300}
                className="w-full resize-none rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {siteKey && (
              <TurnstileWidget ref={turnstileRef} siteKey={siteKey} onToken={setTurnstileToken} />
            )}

            {error && <p className="text-[12px] font-semibold text-accent">{error}</p>}

            <button
              type="button"
              onClick={submit}
              disabled={phase === "sending"}
              className="w-full rounded-pill bg-primary px-4 py-2.5 text-[13.5px] font-bold text-white active:scale-[0.98] disabled:opacity-50"
            >
              {phase === "sending" ? "Küldés…" : "Javaslat küldése"}
            </button>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
