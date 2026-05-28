"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * "Igényeld a vállalkozásod" CTA — csak akkor látszik, ha:
 *   • a látogató be van lépve (Clerk)
 *   • a vállalkozás GAZDÁTLAN (owner_user_id IS NULL)
 *
 * Logika:
 *   • Ha a Clerk emailed = a vállalkozás contact_email-je → azonnali claim → /profil-ra.
 *   • Egyébként verifikációs link a vállalkozás contact_email-jére (maszkolva mutatjuk).
 *
 * Belépés nélkül a komponens egy egyszerű "lépj be az igényléshez" CTA-t mutat.
 */
export function ClaimBusinessButton({ businessId }: { businessId: string }) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [phase, setPhase] = useState<"idle" | "submitting" | "verification_sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="mt-4 rounded-card border border-line bg-primary-soft/50 p-3.5 text-[12.5px] leading-snug text-ink">
        <strong className="font-extrabold">A te vállalkozásod?</strong> Lépj be vagy regisztrálj,
        és igényelheted a kezelési jogot — utána szerkesztheted az adatokat.
        <div className="mt-2 flex gap-2">
          <Link
            href={`/belepes?redirect_url=${encodeURIComponent(`/szaknevsor/${businessId}?claim=1`)}`}
            className="flex-1 inline-flex h-9 items-center justify-center gap-1 rounded-pill bg-primary px-3 text-[12px] font-bold text-white shadow-card-hover"
          >
            Belépés
          </Link>
          <Link
            href="/regisztracio"
            className="flex-1 inline-flex h-9 items-center justify-center gap-1 rounded-pill border border-line bg-surface px-3 text-[12px] font-bold text-ink"
          >
            Regisztráció
          </Link>
        </div>
      </div>
    );
  }

  async function onClaim() {
    setPhase("submitting");
    setMessage(null);
    try {
      const res = await fetch("/api/owner/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        status?: string;
        error?: string;
        message?: string;
        maskedEmail?: string;
      };
      if (!res.ok) {
        setMessage(data.message ?? data.error ?? "Hiba történt. Próbáld újra.");
        setPhase("error");
        return;
      }
      if (data.status === "claimed" || data.status === "already_owned") {
        // Azonnali claim sikerült → /profil-ra.
        router.push("/profil");
        router.refresh();
        return;
      }
      if (data.status === "verification_sent") {
        setMaskedEmail(data.maskedEmail ?? null);
        setPhase("verification_sent");
        return;
      }
      setMessage("Ismeretlen válasz a szervertől.");
      setPhase("error");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Hálózati hiba.");
      setPhase("error");
    }
  }

  if (phase === "verification_sent") {
    return (
      <div className="mt-4 rounded-card border border-success/30 bg-success/10 p-4 text-[13px] leading-relaxed text-ink">
        <div className="flex items-center gap-2 font-extrabold text-success">
          <Icon name="send" size={14} strokeWidth={2.4} />
          Megerősítő emailt küldtünk
        </div>
        <p className="mt-1.5">
          Mert a Clerk fiókod e-mailje nem egyezik a vállalkozás kapcsolati címével,
          küldtünk egy megerősítő linket a <strong>{maskedEmail ?? "vállalkozás emailjére"}</strong>{" "}
          címre. Kattints rá 24 órán belül, és a vállalkozás a fiókodhoz kerül.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-card border border-line bg-primary-soft/40 p-3.5">
      <div className="text-[12.5px] leading-snug text-ink">
        <strong className="font-extrabold">A te vállalkozásod?</strong> Igényelheted, és a
        Vállalkozói profilodban onnantól szerkesztheted az adatokat.
      </div>
      <button
        type="button"
        onClick={onClaim}
        disabled={phase === "submitting"}
        className={cn(
          "mt-2 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-pill bg-primary px-4 text-[13px] font-extrabold text-white shadow-card-hover transition active:scale-[0.98]",
          phase === "submitting" && "cursor-not-allowed opacity-60",
        )}
      >
        {phase === "submitting" ? "Igénylés…" : "Igényeld a vállalkozást"}
        {phase !== "submitting" && <Icon name="arrowRight" size={14} strokeWidth={2.6} />}
      </button>
      {message && (
        <p className="mt-2 text-[11.5px] font-semibold text-accent" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
