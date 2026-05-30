"use client";

import { useState } from "react";
import type { ModerationTable } from "@/lib/repo";

/**
 * Approve / Reject gomb az admin moderation queue-ra. POST-ol az
 * /api/admin/moderation/decide-re, sikeres válasz után újratölti a page-et.
 */
export function ModerationDecideButtons({
  table,
  id,
  current,
}: {
  table: ModerationTable;
  id: string;
  /** 0=pending, 1=approved, 2=rejected — az aktuális állapot. */
  current: number;
}) {
  const [busy, setBusy] = useState(false);

  async function decide(decision: "approved" | "rejected") {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/moderation/decide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ table, id, decision }),
      });
      if (res.ok) {
        // Egyszerű reload — egy server-rendered admin-page bőven elég.
        if (typeof window !== "undefined") window.location.reload();
      } else {
        alert("Nem sikerült a döntés mentése.");
        setBusy(false);
      }
    } catch {
      alert("Hálózati hiba.");
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-1.5">
      {current !== 1 && (
        <button
          type="button"
          onClick={() => decide("approved")}
          disabled={busy}
          className="rounded-pill bg-primary px-3 py-1 text-[11px] font-bold text-white shadow-card active:scale-95 disabled:opacity-50"
        >
          ✅ Jóváhagy
        </button>
      )}
      {current !== 2 && (
        <button
          type="button"
          onClick={() => decide("rejected")}
          disabled={busy}
          className="rounded-pill bg-accent px-3 py-1 text-[11px] font-bold text-white shadow-card active:scale-95 disabled:opacity-50"
        >
          ❌ Elutasít
        </button>
      )}
    </div>
  );
}
