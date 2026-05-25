"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * Két állapotú törlés-vezérlő — kétlépcsős, hogy ne lehessen véletlenül törölni.
 *   1) "Hirdetés törlése"  → megerősítő gomb
 *   2) "Igen, biztos vagyok" → DELETE /api/bulletin/manage/<token>
 */
export function ManageActions({ token }: { token: string }) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/bulletin/manage/${token}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "A törlés nem sikerült.");
      }
      setDone(true);
      // 2 mp múlva vissza a közösséghez
      setTimeout(() => router.push("/kozosseg"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba.");
    } finally {
      setDeleting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-card border border-success/30 bg-surface p-4 text-center shadow-card">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-2xl bg-success/15 text-success">
          <Icon name="check" size={18} strokeWidth={2.4} />
        </div>
        <p className="mt-2 text-[13.5px] font-bold text-ink">Hirdetés törölve.</p>
        <p className="text-[11.5px] text-ink-muted">Visszairányítunk a közösséghez…</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!armed ? (
        <button
          type="button"
          onClick={() => setArmed(true)}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-pill border border-accent/30 bg-surface text-[13px] font-bold text-accent"
        >
          <Icon name="close" size={14} strokeWidth={2.4} />
          Hirdetés törlése
        </button>
      ) : (
        <div className="space-y-2 rounded-card border border-accent/30 bg-accent-soft p-3">
          <p className="text-[12.5px] font-semibold text-accent">
            Biztos vagy benne? A törlés visszavonhatatlan.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className={cn(
                "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-pill bg-accent text-[12.5px] font-bold text-white",
                deleting && "opacity-60",
              )}
            >
              {deleting ? "Törlés…" : "Igen, töröld"}
            </button>
            <button
              type="button"
              onClick={() => setArmed(false)}
              className="flex h-10 flex-1 items-center justify-center rounded-pill border border-line bg-surface text-[12.5px] font-bold text-ink"
            >
              Mégse
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-md bg-accent/10 px-3 py-2 text-[11.5px] font-semibold text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
