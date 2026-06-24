"use client";

import { useState } from "react";

/**
 * „Töröl" gomb a /admin/jeloltek jelöltjein: GDPR-kérésre eltávolítja a jelöltet
 * az aktív közvetítésből (opt-in törlés), és frissíti a listát.
 */
export function RemoveFromPlacement({ workerId }: { workerId: string }) {
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!confirm("Eltávolítod a jelöltet a közvetítésből? A közvetítési hozzájárulása (opt-in) törlődik, és eltűnik erről a listáról. (A felhasználó saját Kinti-profilja megmarad.)")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/recruiter/optout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ workerId }),
      });
      if (res.ok) { window.location.reload(); return; }
    } catch { /* ignore */ }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={loading}
      className="rounded-pill border border-line bg-surface-alt px-3 py-1.5 text-[12px] font-bold text-ink-muted hover:text-accent active:scale-95 disabled:opacity-60"
    >
      {loading ? "…" : "Töröl"}
    </button>
  );
}
