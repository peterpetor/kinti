"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { cn } from "@/lib/cn";
import { CANTONS } from "@/lib/cantons";

type Phase = "idle" | "sending" | "sent" | "error";

export function DigestSubscribeForm() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const [email, setEmail] = useState("");
  const [cantonCode, setCantonCode] = useState("all");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!acceptTerms) {
      setError("Az adatkezelési hozzájárulás kötelező a feliratkozáshoz.");
      return;
    }
    if (!turnstileToken) {
      setError("Várd meg a robot-ellenőrzést, mielőtt elküldöd.");
      return;
    }
    setPhase("sending");
    try {
      const res = await fetch("/api/digest/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, cantonCode, acceptTerms, website, turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        turnstileRef.current?.reset();
        setTurnstileToken("");
        setError(data.error ?? "Hiba történt. Próbáld újra.");
        setPhase("error");
        return;
      }
      setPhase("sent");
    } catch {
      setError("Hálózati hiba. Próbáld újra.");
      setPhase("error");
    }
  }

  if (phase === "sent") {
    return (
      <div className="rounded-card border border-line bg-surface p-6 text-center shadow-card">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white">
          <Icon name="send" size={22} strokeWidth={2.2} />
        </div>
        <h2 className="mt-3 text-[18px] font-extrabold tracking-tight text-ink">
          Nézd meg a postafiókodat!
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-pretty text-[13.5px] leading-relaxed text-ink-muted">
          Küldtünk egy megerősítő emailt a <strong className="text-ink">{email}</strong> címre.
          A linkre kattintva véglegesíted a feliratkozást — utána hetente egyszer küldjük az új
          eseményeket és hirdetéseket.
        </p>
        <p className="mt-3 text-[11.5px] text-ink-faint">Spam mappa? Néha oda kerül.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {/* Honeypot — bot-csapda, sose lássa az ember */}
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

      <div className="rounded-card border border-line bg-surface p-4 shadow-card space-y-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
            Email-cím
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="te@example.ch"
            autoComplete="email"
            maxLength={254}
            className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
            Mely kanton(ok)ról kérsz híreket?
          </label>
          <select
            value={cantonCode}
            onChange={(e) => setCantonCode(e.target.value)}
            className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">Egész Svájc (minden új tartalom)</option>
            {CANTONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-relaxed text-ink">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-none cursor-pointer accent-primary"
          />
          <span>
            Hozzájárulok, hogy a kinti.app az email-címemet a heti hírlevél kiküldéséhez
            tárolja és felhasználja. A leveleknél bármikor egy kattintással leiratkozhatok.
            Részletek:{" "}
            <Link href="/adatvedelem" target="_blank" className="underline">
              Adatkezelési Tájékoztató
            </Link>
            .
          </span>
        </label>

        {turnstileSiteKey && (
          <TurnstileWidget
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            onToken={setTurnstileToken}
          />
        )}

        {error && (
          <p className="text-[11.5px] font-semibold text-accent" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={phase === "sending" || !acceptTerms || !turnstileToken}
          className={cn(
            "flex h-11 w-full items-center justify-center gap-1.5 rounded-pill bg-primary text-[14px] font-extrabold text-white shadow-card transition active:scale-[0.99]",
            (phase === "sending" || !acceptTerms || !turnstileToken) && "cursor-not-allowed opacity-50",
          )}
        >
          {phase === "sending" ? "Küldés…" : "Feliratkozom"}
          {phase !== "sending" && <Icon name="arrowRight" size={14} strokeWidth={2.4} />}
        </button>
      </div>
    </form>
  );
}
