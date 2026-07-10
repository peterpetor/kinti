"use client";

import { useState } from "react";
import Link from "next/link";
import { getCountry } from "@/lib/countries";

/**
 * GuideNewsletterCta — INLINE hírlevél-feliratkozó a Tudásbázis cikk-oldalain.
 *
 * A cikkek az SEO-tölcsér teteje: a Google-ból érkező olvasót itt lehet
 * visszahívhatóvá tenni. Link-out (/hirlevel) helyett inline email-mező —
 * eggyel kevesebb ugrás. A meglévő double-opt-in API-ra épül
 * (/api/newsletter/subscribe: IP-limit, eldobható-email-szűrő, megerősítő
 * levél), az ország a CIKK országa (aki DE-cikket olvas, a DE-hírlevélre
 * iratkozik). SSG-oldalon él → tisztán kliens-oldali állapot.
 */
export function GuideNewsletterCta({ country }: { country: string }) {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const countryName = getCountry(country)?.name ?? "a választott ország";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Érvényes e-mail-címet adj meg.");
      return;
    }
    setPhase("busy");
    setError(null);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, country }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Nem sikerült a feliratkozás. Próbáld újra.");
        setPhase("error");
        return;
      }
      setPhase("done");
    } catch {
      setError("Hálózati hiba. Próbáld újra.");
      setPhase("error");
    }
  }

  if (phase === "done") {
    return (
      <div className="rounded-card border border-success/30 bg-success/5 p-4">
        <p className="text-[13.5px] font-extrabold text-success">✓ Már csak egy lépés!</p>
        <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
          Küldtünk egy megerősítő e-mailt — kattints a benne lévő linkre, és kész is.
          (Nézd meg a spam-mappát is.)
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-primary/25 bg-primary-soft/40 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary text-lg text-white">
          ✉️
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-extrabold leading-snug text-ink">
            Hasznos volt? Ilyeneket küldünk levélben is.
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
            Hírek, határidők és tippek — {countryName} magyarjainak szabva. Ingyenes,
            bármikor egy kattintással leiratkozhatsz.
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@címed.hu"
          className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-[14px] text-ink outline-none transition focus:border-primary"
        />
        <button
          type="submit"
          disabled={phase === "busy"}
          className="h-11 shrink-0 rounded-pill bg-primary px-4 text-[13.5px] font-extrabold text-white transition active:scale-[0.97] disabled:opacity-60"
        >
          {phase === "busy" ? "Küldés…" : "Feliratkozom"}
        </button>
      </form>
      {error && <p className="mt-1.5 text-[12px] font-semibold text-accent">{error}</p>}
      <p className="mt-2 text-[10.5px] leading-snug text-ink-faint">
        Dupla megerősítéses feliratkozás — a címedet csak a hírlevélhez használjuk.{" "}
        <Link href="/adatvedelem" className="underline">Adatvédelem</Link>
      </p>
    </div>
  );
}
