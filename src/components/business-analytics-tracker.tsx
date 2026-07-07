"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { recordCallForReview } from "@/lib/review-prompt";

/**
 * Best-effort, fire-and-forget POST-ek a vállalkozói analitikához:
 *   • <TrackBusinessView businessId> — profil-megnyitás (mount-on egyszer)
 *   • <TelLink businessId phone>     — telefon-kattintás
 *
 * A fetch sose throw-ol, a kliens sose tapasztal hibát. A szerver szintén
 * 200-zal felel mindig (lásd /api/businesses/[id]/track).
 *
 * A TelLink emellett KLIENS-oldalon naplózza a hívást (localStorage), amiből
 * a kezdőlapi vélemény-kérő kártya dolgozik (lib/review-prompt) — ehhez a
 * `businessName` prop kell; név nélkül a naplózás kimarad.
 */

async function track(businessId: string, kind: "view" | "phone"): Promise<void> {
  try {
    await fetch(`/api/businesses/${businessId}/track`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind }),
      keepalive: true,
    });
  } catch {
    // szándékos némaság
  }
}

export function TrackBusinessView({ businessId }: { businessId: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void track(businessId, "view");
  }, [businessId]);
  return null;
}

export function TelLink({
  businessId,
  phone,
  businessName,
  stopPropagation = false,
  className,
  children,
  "aria-label": ariaLabel,
}: {
  businessId: string;
  phone: string;
  /** A cég neve a hívás-utáni vélemény-kérőhöz; ha nincs, csak analitika fut. */
  businessName?: string;
  /** Kártyán belüli gombnál (pl. térkép-kártya) ne buborékoljon a kattintás. */
  stopPropagation?: boolean;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  return (
    <a
      href={`tel:${phone.replace(/\s/g, "")}`}
      aria-label={ariaLabel}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        void track(businessId, "phone");
        if (businessName) recordCallForReview(businessId, businessName);
      }}
      className={className}
    >
      {children}
    </a>
  );
}
