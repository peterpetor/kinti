"use client";

export function MiniHistogram({ data }: { data: { bucket_k: number; entry_count: number }[] }) {
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

  return (
    <div className="pt-2 pb-1 space-y-1.5">
      {/* Oszlopok */}
      <div className="flex items-end gap-1 h-24">
        {fullData.map((d) => {
          const pct = (d.entry_count / maxCount) * 100;
          return (
            <div key={d.bucket_k} className="group relative flex flex-1 flex-col items-center justify-end">
              {/* Oszlop fölötti érték — csak hoverre, nem tolja el a sávokat */}
              <span className="pointer-events-none absolute -top-3.5 text-[10px] font-bold text-ink-muted opacity-0 transition-opacity group-hover:opacity-100">
                {d.entry_count > 0 ? d.entry_count : ""}
              </span>

              {/* Maga az oszlop */}
              <div
                className="w-full rounded-t-sm bg-primary/40 transition-colors group-hover:bg-primary"
                style={{ height: `${pct}%`, minHeight: d.entry_count > 0 ? "4px" : "0px" }}
              />
            </div>
          );
        })}
      </div>

      {/* Vízszintes tengely: olvasható, csak a két szélső (+ középső) bérsáv */}
      {minK === maxK ? (
        <div className="text-center text-[10px] font-medium text-ink-muted">{minK}k CHF</div>
      ) : (
        <div className="flex justify-between text-[10px] font-medium text-ink-muted">
          <span>{minK}k</span>
          {fullData.length > 2 && <span>{midK}k</span>}
          <span>{maxK}k</span>
        </div>
      )}

      <p className="pt-1 text-right text-[11px] text-ink-faint">Bérsávok 10.000 CHF-enként</p>
    </div>
  );
}
