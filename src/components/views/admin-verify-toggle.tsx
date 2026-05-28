"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * AdminVerifyToggle — egy vállalkozás "Verified Hungarian-speaking" jelvényének
 * be/ki kapcsolása az admin dashboardról.
 */
export function AdminVerifyToggle({
  businessId,
  initial,
}: {
  businessId: string;
  initial: boolean;
}) {
  const router = useRouter();
  const [verified, setVerified] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = !verified;
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}/verify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ verified: next }),
      });
      if (res.ok) {
        setVerified(next);
        router.refresh();
      }
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border px-2.5 py-1 text-[11px] font-bold transition",
        verified
          ? "border-success/30 bg-success/10 text-success"
          : "border-line bg-surface text-ink-muted",
        busy && "opacity-60",
      )}
    >
      {verified ? (
        <>
          <Icon name="check" size={11} strokeWidth={2.6} /> Verified
        </>
      ) : (
        <>Hitelesítés</>
      )}
    </button>
  );
}
