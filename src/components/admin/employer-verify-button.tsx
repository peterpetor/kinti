"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Admin: „Hiteles cég" jelzés ki/be kapcsolása egy munkáltatóra.
 * A UID kézi ellenőrzése után az admin itt erősíti meg.
 */
export function EmployerVerifyButton({ id, verified }: { id: string; verified: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/employers/${id}/verify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ verified: !verified }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`rounded-pill px-2.5 py-1 text-[11.5px] font-bold transition active:scale-95 disabled:opacity-60 ${
        verified
          ? "bg-success/15 text-success"
          : "border border-line bg-surface text-ink-muted hover:bg-surface-alt"
      }`}
    >
      {busy ? "…" : verified ? "✓ Hiteles cég" : "Hitelesítés"}
    </button>
  );
}
