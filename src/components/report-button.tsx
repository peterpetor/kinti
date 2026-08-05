"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { cn } from "@/lib/cn";
import { BottomSheet } from "./bottom-sheet";

/**
 * ReportButton — „Jelentem" gomb vállalkozásokhoz, véleményekhez, SOS-hez,
 * B2B-projekthez, élettörténethez és Keresek-hirdetéshez (Notice & Takedown,
 * DSA Art. 16). Megnyit egy alsó lapot, ahol a felhasználó megadja az indokot;
 * beküldés után a tartalom AZONNAL elrejtődik a publikum elől, amíg az admin
 * dönt róla. Vezérelt nélkül, önállóan használható.
 */
export function ReportButton({
  contentType,
  contentId,
  variant = "icon",
  className,
}: {
  contentType: "business" | "review" | "sos" | "b2b" | "story" | "request" | "housing";
  contentId: string;
  variant?: "icon" | "link";
  /** Az „icon" variáns gomb-stílusának felülírása (pl. fehér-pill a profil-fejlécben). */
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [phase, setPhase] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  // ⚠️ BOT-VÉDELEM. A bejelentés AZONNAL elrejti a tartalmat, tehát ez a
  // legkényesebb névtelen írási pont az egész appban — eddig mégis védtelen volt.
  // A kulcsot közvetlenül az env-ből olvassuk (NEXT_PUBLIC_*, build-időben
  // beépül), így egyetlen hívási helyet sem kellett módosítani.
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  async function submit() {
    if (reason.trim().length < 3) {
      setError("Kérlek, írd le röviden, miért jelented.");
      return;
    }
    if (siteKey && !turnstileToken) {
      setError("Várj a robot-ellenőrzésre (pár másodperc).");
      return;
    }
    setPhase("sending");
    setError(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contentType, contentId, reason: reason.trim(), turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Nem sikerült elküldeni a jelentést.");
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
    // kis késleltetés, hogy a záró animáció alatt ne villanjon vissza az űrlap
    setTimeout(() => {
      setReason("");
      setPhase("idle");
      setError(null);
      setTurnstileToken("");
    }, 200);
  }

  return (
    <>
      {variant === "link" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-faint transition-colors hover:text-accent"
        >
          <Icon name="flag" size={11} strokeWidth={2.4} /> Jelentés
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Jelentés"
          className={className ?? "text-ink-faint transition hover:text-accent active:scale-90"}
        >
          <Icon name="flag" size={className ? 16 : 14} strokeWidth={2.2} />
        </button>
      )}

      <BottomSheet open={open} onClose={close} title="Tartalom jelentése">
        {phase === "done" ? (
          <div className="py-2 text-center">
            <div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-2xl bg-success/15 text-success-ink">
              <Icon name="check" size={20} strokeWidth={2.6} />
            </div>
            <p className="text-[14px] font-bold text-ink">Köszönjük, megkaptuk!</p>
            <p className="mx-auto mt-1 max-w-xs text-[12.5px] leading-relaxed text-ink-muted">
              Ellenőrizzük, és döntünk róla. Ha jogsértő, eltávolítjuk — ha alaptalan a
              bejelentés, a tartalom marad.
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
              Miért jelented ezt a tartalmat? (pl. jogsértő, csalás, sértő, spam) Minden
              bejelentést emberi szem néz át.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Az indok…"
              rows={3}
              maxLength={1000}
              className="w-full resize-none rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            {siteKey && (
              <TurnstileWidget
                ref={turnstileRef}
                siteKey={siteKey}
                onToken={setTurnstileToken}
                className="flex justify-center"
              />
            )}
            {error && (
              <p className="text-[11.5px] font-semibold text-accent">{error}</p>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={phase === "sending"}
              className={cn(
                "flex h-11 w-full items-center justify-center gap-1.5 rounded-pill bg-accent text-[14px] font-extrabold text-white transition active:scale-[0.99]",
                phase === "sending" && "cursor-not-allowed opacity-60",
              )}
            >
              <Icon name="flag" size={14} strokeWidth={2.4} />
              {phase === "sending" ? "Küldés…" : "Jelentés elküldése"}
            </button>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
