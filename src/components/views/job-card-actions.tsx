"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { BoostCheckoutButton } from "./boost-checkout-button";

/**
 * Egy hirdetés-kártya akciói a munkáltató dashboardján: jelentkezők megnyitása,
 * szerkesztés, törlés (megerősítéssel) + kiemelés-vásárlás (job_featured).
 */
export function JobCardActions({
  jobId,
  applicantCount,
  featured = false,
  expired = false,
}: {
  jobId: string;
  applicantCount: number;
  featured?: boolean;
  /** A hirdetés lejárt (nincs a publikus listában) — ingyenes megújítás kínálva. */
  expired?: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renewing, setRenewing] = useState(false);

  const handleRenew = async () => {
    setRenewing(true);
    setError(null);
    try {
      const res = await fetch(`/api/employer/jobs/${jobId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "renew" }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "A megújítás nem sikerült.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "A megújítás nem sikerült.");
      setRenewing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/employer/jobs/${jobId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "A törlés nem sikerült.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "A törlés nem sikerült.");
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="mt-3 border-t border-line/60 pt-3">
      <div className="flex items-center gap-3 text-[12px] font-semibold">
        <Link
          href={`/munkaltato/allas/${jobId}/jelentkezok`}
          className="flex items-center gap-1.5 text-primary hover:underline"
        >
          <Icon name="users" size={14} strokeWidth={2.2} />
          Jelentkezők ({applicantCount})
        </Link>

        <Link
          href={`/munkaltato/allas/${jobId}/szerkesztes`}
          className="flex items-center gap-1.5 text-ink-muted hover:text-primary transition-colors"
        >
          <Icon name="sliders" size={14} strokeWidth={2.2} />
          Szerkesztés
        </Link>

        <div className="flex-1" />

        {confirming ? (
          <>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full bg-accent/15 px-2.5 py-1 text-[12px] font-bold text-accent disabled:opacity-60"
            >
              {deleting ? "Törlés…" : "Biztosan törlöd?"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="text-[12px] font-semibold text-ink-muted hover:underline"
            >
              Mégsem
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-1.5 text-ink-muted hover:text-accent transition-colors"
          >
            <Icon name="trash" size={14} strokeWidth={2.2} />
            Törlés
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-[12px] font-semibold text-accent">{error}</p>}

      <div className="mt-2.5 flex items-center justify-between gap-2">
        {expired ? (
          <div className="flex w-full items-center justify-between gap-2 rounded-[12px] bg-accent/10 px-3 py-2">
            <span className="text-[11.5px] font-bold text-accent">
              ⏳ Lejárt — nem látszik a jelölteknek
            </span>
            <button
              type="button"
              onClick={handleRenew}
              disabled={renewing}
              className="shrink-0 rounded-pill bg-primary px-3 py-1.5 text-[12px] font-bold text-white active:scale-95 disabled:opacity-60"
            >
              {renewing ? "Megújítás…" : "🔄 Megújítás (ingyenes)"}
            </button>
          </div>
        ) : featured ? (
          <span className="inline-flex items-center gap-1 rounded-pill bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-accent">
            <Icon name="star" size={11} filled /> Kiemelt hirdetés
          </span>
        ) : (
          <BoostCheckoutButton
            product="job_featured"
            customData={{ type: "job_featured", jobId }}
            label="🚀 Hirdetés kiemelése (49 €)"
            className="bg-ink text-surface hover:opacity-90"
          />
        )}
      </div>
    </div>
  );
}
