"use client";

import { cn } from "@/lib/cn";
import { salaryStanding } from "@/lib/benchmark-stats";

export function MiniHistogram({
  data,
  userValueChf,
  cur = "CHF",
}: {
  data: { bucket_k: number; entry_count: number }[];
  /** A user saját bére (helyi pénznem). Ha megvan, a saját sávja kiemelve + „top X%". */
  userValueChf?: number;
  cur?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="py-4 text-center text-[12px] text-ink-faint">
        Még nincs elegendő adat az eloszláshoz.
      </div>
    );
  }

  // Megkeressük a legnagyobb count-ot a skálázáshoz
  const maxCount = Math.max(...data.map(d => d.entry_count)) || 1;

  // Hogy szép legyen, kiegészítjük az üres "lyukakat" a min és max bucket között
  const minK = Math.min(...data.map(d => d.bucket_k));
  const maxK = Math.max(...data.map(d => d.bucket_k));

  const fullData: { bucket_k: number; entry_count: number }[] = [];
  for (let k = minK; k <= maxK; k += 10) {
    const existing = data.find(d => d.bucket_k === k);
    fullData.push(existing || { bucket_k: k, entry_count: 0 });
  }

  const midK = fullData[Math.floor(fullData.length / 2)].bucket_k;

  // „Itt állsz": a user sávja (10k-s bucketre kerekítve) + percentilis pozíció.
  const hasUser = typeof userValueChf === "number" && userValueChf > 0;
  const userBucketK = hasUser ? Math.floor(userValueChf! / 10000) * 10 : null;
  const standing = hasUser ? salaryStanding(data, userValueChf!) : null;
  const showStanding = !!standing && standing.total >= 3;
  const topPct = standing ? Math.max(1, 100 - standing.percentile) : null;

  return (
    <div className="pt-2 pb-1 space-y-1.5">
      {/* Oszlopok */}
      <div className="flex items-end gap-1 h-28">
        {fullData.map((d) => {
          const pct = (d.entry_count / maxCount) * 100;
          const isUser = userBucketK != null && d.bucket_k === userBucketK;
          return (
            <div key={d.bucket_k} className="group flex h-full flex-1 flex-col items-center justify-end">
              {/* Felső sáv: a darabszám (mindig látszik), VAGY a user pin-je */}
              <span
                className={cn(
                  "mb-0.5 h-3.5 text-[10px] font-bold leading-none",
                  isUser ? "text-accent" : "text-ink-muted",
                )}
              >
                {isUser ? "📍" : d.entry_count > 0 ? d.entry_count : ""}
              </span>

              {/* A sáv a maradék magasságban, alulra igazítva */}
              <div className="flex w-full flex-1 items-end">
                <div
                  className={cn(
                    "w-full rounded-t-sm transition-colors",
                    isUser
                      ? "bg-accent shadow-[0_0_0_2px_rgb(var(--surface))]"
                      : "bg-primary/40 group-hover:bg-primary",
                  )}
                  style={{ height: `${pct}%`, minHeight: isUser || d.entry_count > 0 ? "4px" : "0px" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Vízszintes tengely: olvasható, csak a két szélső (+ középső) bérsáv */}
      {minK === maxK ? (
        <div className="text-center text-[10px] font-medium text-ink-muted">{minK}k {cur}</div>
      ) : (
        <div className="flex justify-between text-[10px] font-medium text-ink-muted">
          <span>{minK}k</span>
          {fullData.length > 2 && <span>{midK}k</span>}
          <span>{maxK}k</span>
        </div>
      )}

      {/* „Itt állsz" összegző sáv — a saját bér pozíciója az eloszlásban */}
      {hasUser ? (
        <div className="rounded-xl border border-accent/25 bg-accent/5 px-3 py-2 text-center">
          <p className="text-[12px] font-bold text-accent leading-snug">
            📍 Te itt vagy: {userValueChf!.toLocaleString("hu-HU")} {cur}
            {showStanding ? ` · a felső ${topPct}%-ban` : ""}
          </p>
          {showStanding && (
            <p className="mt-0.5 text-[10.5px] leading-snug text-ink-muted">
              Többet keresel, mint a beküldők <strong className="text-ink">{standing!.percentile}%</strong>-a{" "}
              <span className="text-ink-faint">({standing!.total} adat)</span>.
            </p>
          )}
        </div>
      ) : (
        <p className="pt-1 text-right text-[11px] text-ink-faint">Bérsávok 10.000 {cur}-enként</p>
      )}
    </div>
  );
}
