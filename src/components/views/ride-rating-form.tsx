"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { cn } from "@/lib/cn";

export function RideRatingForm({ targetPhone, isRequest }: { targetPhone: string, isRequest: boolean }) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const [expanded, setExpanded] = useState(false);
  const [phase, setPhase] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [rating, setRating] = useState(5);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!turnstileToken) {
      setErrorMsg("Várd meg a robot-ellenőrzést, mielőtt elküldöd.");
      return;
    }
    setPhase("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/ride/rating/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPhone, email, rating, turnstileToken, website }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        turnstileRef.current?.reset();
        setTurnstileToken("");
        throw new Error(data.error || "Hiba történt a küldés során.");
      }
      setPhase("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Ismeretlen hiba.");
      setPhase("error");
    }
  }

  if (phase === "success") {
    return (
      <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-center">
        <Icon name="check" size={20} className="mx-auto mb-1 text-success" />
        <div className="text-[13px] font-bold text-success">Megerősítő e-mail elküldve!</div>
        <div className="mt-1 text-[12px] text-success/80 leading-snug">
          Kattints az e-mailben lévő linkre az értékelés véglegesítéséhez.
        </div>
      </div>
    );
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-pill bg-surface text-[12.5px] font-bold text-ink shadow-[inset_0_0_0_1px_rgb(var(--border-channel)/var(--border-strong-alpha))] hover:bg-surface-alt transition py-2 active:scale-95"
      >
        <Icon name="star" size={14} strokeWidth={2.2} /> Értékelem
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface-alt p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[13px] font-bold text-ink">
          {isRequest ? "Utas értékelése" : "Sofőr értékelése"}
        </div>
        <button type="button" onClick={() => setExpanded(false)} className="text-ink-faint hover:text-ink">
          <Icon name="close" size={16} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-[11.5px] font-semibold text-ink-muted">
            Hány csillagot adsz?
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Icon
                  name="star"
                  size={24}
                  className={s <= rating ? "text-[#f1c40f]" : "text-ink-faint"}
                  filled={s <= rating}
                  strokeWidth={s <= rating ? 0 : 2}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor={`email-${targetPhone}`} className="mb-1 block text-[11.5px] font-semibold text-ink-muted">
            A te e-mail címed (visszaigazoláshoz)
          </label>
          <input
            id={`email-${targetPhone}`}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full rounded-[10px] border border-line bg-surface px-3 text-[14px] text-ink shadow-sm placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="nev@email.com"
          />
        </div>

        {/* Honeypot */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
        />

        {turnstileSiteKey && (
          <TurnstileWidget
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            onToken={setTurnstileToken}
          />
        )}

        {errorMsg && (
          <div className="text-[11.5px] font-semibold text-accent leading-tight">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={phase === "submitting" || !turnstileToken}
          className={cn(
            "flex w-full items-center justify-center gap-1.5 rounded-pill bg-primary py-2.5 text-[13px] font-bold text-white shadow-card transition active:scale-[0.98]",
            (phase === "submitting" || !turnstileToken) && "opacity-70"
          )}
        >
          {phase === "submitting" ? "Küldés..." : "Értékelés beküldése"}
        </button>
      </form>
    </div>
  );
}
