"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";

/**
 * AIReviewSummary — a Szaknévsor profil-oldalon megjelenő AI-generált
 * vélemény-összegzés. A komponens kliens-oldali, lazy-fetch:
 *
 *   1) Mount-on lekéri a /api/ai/review-summary/[id]-t
 *   2) Cache-elt válaszra azonnal megjelenik
 *   3) Új generálásra "Készítjük..." állapot
 *
 * Csak akkor renderel, ha a vállalkozónak van legalább 3 véleménye
 * (az API a "few_reviews" reason-nal jelzi ha nincs elég).
 */

interface SummaryResponse {
  summary: string | null;
  reason?: "few_reviews" | "ai_unavailable" | "error";
  cached?: boolean;
  generatedAt?: string;
  reviewCount?: number;
}

export function AIReviewSummary({ businessId }: { businessId: string }) {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/ai/review-summary/${businessId}`);
        if (!res.ok) {
          if (!cancelled) setLoading(false);
          return;
        }
        const json = (await res.json()) as SummaryResponse;
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  // Nem renderelünk semmit, ha nincs összegzés (kevés vélemény vagy hiba)
  if (loading) {
    return (
      <section className="rounded-card border border-primary/15 bg-primary-soft/40 p-4 shadow-card">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-primary/10 text-primary">
            <Icon name="sparkles" size={13} strokeWidth={2.4} />
          </span>
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-primary/80">
            AI vélemény-összegzés
          </span>
        </div>
        <div className="mt-2 h-[14px] w-3/4 animate-pulse rounded bg-primary/10" />
        <div className="mt-1.5 h-[14px] w-5/6 animate-pulse rounded bg-primary/10" />
        <div className="mt-1.5 h-[14px] w-2/3 animate-pulse rounded bg-primary/10" />
      </section>
    );
  }

  if (!data?.summary) return null;

  return (
    <section className="rounded-card border border-primary/15 bg-primary-soft/40 p-4 shadow-card">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-primary/10 text-primary">
          <Icon name="sparkles" size={13} strokeWidth={2.4} />
        </span>
        <span className="text-[11.5px] font-bold uppercase tracking-wide text-primary/80">
          AI vélemény-összegzés
        </span>
        <span className="ml-auto text-[10px] text-ink-faint">
          {data.reviewCount ?? 0} vélemény alapján
        </span>
      </div>
      <p className="text-[13px] leading-relaxed text-ink">{data.summary}</p>
      <p className="mt-2 text-[10px] text-ink-faint">
        Automatikusan generált — egyéni véleményt ne ez alapján alkoss, olvasd el a teljes
        értékeléseket lent.
      </p>
    </section>
  );
}
