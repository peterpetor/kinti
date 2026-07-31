"use client";

import { useState } from "react";

/**
 * Egy BEJELENTŐ összes nyitott bejelentésének visszaállítása.
 *
 * ⚠️ Ez a rosszhiszemű kampány ellenszere: a bejelentés azonnal rejt (DSA
 * Art. 16), ezért a helyreállításnak kell azonnalinak és tömegesnek lennie.
 */
export function RestoreReporterButton({
  reporterIpHash,
  count,
}: {
  reporterIpHash: string;
  count: number;
}) {
  const [busy, setBusy] = useState(false);

  async function handleRestore() {
    if (
      !confirm(
        `Visszaállítod ennek a bejelentőnek mind a ${count} nyitott bejelentését? ` +
          `A tartalmak újra láthatóvá válnak.`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/reports/restore-by-reporter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reporterIpHash }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        restored?: number;
        skipped?: number;
      };
      if (res.ok) {
        alert(
          `${data.restored ?? 0} tartalom visszaállítva.` +
            (data.skipped ? ` ${data.skipped} kihagyva (ismeretlen típus vagy hiba).` : ""),
        );
        window.location.reload();
      } else {
        alert("Nem sikerült a visszaállítás.");
        setBusy(false);
      }
    } catch {
      alert("Hálózati hiba.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRestore}
      disabled={busy}
      className="rounded-pill bg-primary px-3 py-1.5 text-[11px] font-bold text-white active:scale-95 disabled:opacity-50"
    >
      {busy ? "Visszaállítás…" : `↩ Mind a ${count} visszaállítása`}
    </button>
  );
}
