"use client";

import { useState } from "react";

/**
 * „Előfizetésem kezelése — lemondás, számlák" gomb (Szaknévsor PRO).
 *
 * A /api/payments/portal?scope=business végpontot hívja — Clerk-tulajdonosnál
 * paraméter nélkül, email-only (token-os) kezelőoldalról a manageTokennel.
 * Paddle-előfizetésnél a customer portalra visz (lemondás mély-linkkel),
 * Play-esnél a Play Előfizetések oldalára.
 *
 * ⚠️ CSAK webes kontextusban jelenítsd meg (.web-only-payment wrapperben) —
 * a Paddle-portál az Android-appban Play-szabályzatot sértene.
 */
export function SubscriptionManageButton({
  manageToken,
  className,
}: {
  manageToken?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = async () => {
    setBusy(true);
    setError(null);
    try {
      const qs = manageToken
        ? `?scope=business&manageToken=${encodeURIComponent(manageToken)}`
        : "?scope=business";
      const res = await fetch(`/api/payments/portal${qs}`);
      const data = (await res.json()) as { provider?: string; url?: string; error?: string };
      if (data.provider === "play") {
        window.location.href = "https://play.google.com/store/account/subscriptions";
        return;
      }
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error || "Az előfizetés-kezelő megnyitása nem sikerült.");
    } catch {
      setError("Az előfizetés-kezelő megnyitása nem sikerült. Próbáld újra később.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={open}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2 text-[12.5px] font-bold text-ink shadow-card transition active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? "Megnyitás…" : "Előfizetésem kezelése — lemondás, számlák"}
      </button>
      {error && <p className="mt-1.5 text-[11.5px] leading-snug text-accent">{error}</p>}
    </div>
  );
}
