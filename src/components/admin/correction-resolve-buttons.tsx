"use client";

import { useState } from "react";

/**
 * Egy „Javíts rajta" javaslat lezárása.
 *
 * ⚠️ Ez CSAK az állapotot zárja le — az adatot az admin a szokásos
 * cég-szerkesztőn vezeti át. Szándékosan NINCS „egy kattintással beírom"
 * gomb: az egy nyílt űrlapról érkező értéket tenne ellenőrzés nélkül a
 * publikus szaknévsorba.
 */
export function CorrectionResolveButtons({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);

  async function resolve(action: "applied" | "rejected") {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/corrections", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Nem sikerült.");
        setBusy(false);
      }
    } catch {
      alert("Hálózati hiba.");
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 flex gap-2">
      <button
        type="button"
        onClick={() => resolve("applied")}
        disabled={busy}
        className="rounded-pill bg-primary px-3 py-1 text-[11px] font-bold text-white active:scale-95 disabled:opacity-50"
      >
        ✓ Átvezettem
      </button>
      <button
        type="button"
        onClick={() => resolve("rejected")}
        disabled={busy}
        className="rounded-pill border border-line bg-surface px-3 py-1 text-[11px] font-bold text-ink-muted active:scale-95 disabled:opacity-50"
      >
        ✕ Elvetem
      </button>
    </div>
  );
}
