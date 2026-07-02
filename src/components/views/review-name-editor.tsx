"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { REVIEW_LIMITS } from "@/lib/reviews";

/**
 * A vélemény MEGJELENŐ NEVÉNEK átírása a kezelő-oldalon (manage token = jog).
 * Üresen hagyva visszaáll az auto-generált álnév (pl. „GyorsSün_15").
 * A szerver ugyanazzal a szabályrendszerrel validál, mint beküldéskor
 * (max 40 karakter + trágárság-szűrő).
 */
export function ReviewNameEditor({
  token,
  currentName,
  fallbackHandle,
}: {
  token: string;
  currentName: string;
  fallbackHandle: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/reviews/manage/${token}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reviewerName: name }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "A mentés nem sikerült.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Hálózati hiba — próbáld újra.");
    } finally {
      setSaving(false);
    }
  }

  const dirty = name.trim() !== currentName.trim();

  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-card">
      <h3 className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
        Megjelenő név átírása
      </h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setSaved(false); setError(null); }}
          placeholder={`Üresen: „${fallbackHandle}"`}
          maxLength={REVIEW_LIMITS.reviewerNameMax}
          className="h-10 min-w-0 flex-1 rounded-[12px] border border-line bg-surface-alt px-3 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className={cn(
            "h-10 shrink-0 rounded-pill bg-primary px-4 text-[13px] font-bold text-white transition active:scale-95",
            (saving || !dirty) && "cursor-not-allowed opacity-50",
          )}
        >
          {saving ? "Mentés…" : "Mentem"}
        </button>
      </div>
      {saved && (
        <p className="mt-2 text-[12px] font-bold text-success">✓ Név átírva — már így jelenik meg.</p>
      )}
      {error && (
        <p className="mt-2 text-[12px] font-semibold text-accent">{error}</p>
      )}
      <p className="mt-2 text-[11px] leading-snug text-ink-muted">
        Elég egy keresztnév vagy becenév. Ha üresen hagyod, a játékos álnév
        („{fallbackHandle}") jelenik meg.
      </p>
    </div>
  );
}
