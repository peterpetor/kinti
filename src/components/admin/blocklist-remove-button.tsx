"use client";

import { useState } from "react";

export function BlocklistRemoveButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);

  async function handleRemove() {
    if (!confirm("Eltávolítod a tiltást? A felhasználó újra beküldhet.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/blocklist/${id}`, { method: "DELETE" });
      if (res.ok && typeof window !== "undefined") {
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
    <button
      type="button"
      onClick={handleRemove}
      disabled={busy}
      className="rounded-pill border border-line bg-surface px-3 py-1 text-[11px] font-bold text-ink-muted active:scale-95 disabled:opacity-50"
    >
      ↩ Feloldás
    </button>
  );
}
