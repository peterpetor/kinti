"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Best-effort, fire-and-forget POST-ek a vállalkozói analitikához:
 *   • <TrackBusinessView businessId> — profil-megnyitás (mount-on egyszer)
 *   • <TelLink businessId phone>     — telefon-kattintás
 *
 * A fetch sose throw-ol, a kliens sose tapasztal hibát. A szerver szintén
 * 200-zal felel mindig (lásd /api/businesses/[id]/track).
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
  className,
  children,
}: {
  businessId: string;
  phone: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={`tel:${phone.replace(/\s/g, "")}`}
      onClick={() => {
        void track(businessId, "phone");
      }}
      className={className}
    >
      {children}
    </a>
  );
}
