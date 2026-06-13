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

  return (
    <div className="pt-2 pb-1 space-y-2">
      <div className="flex items-end gap-1 h-24 mt-2">
        {fullData.map((d, i) => {
          const pct = (d.entry_count / maxCount) * 100;
          return (
            <div key={d.bucket_k} className="flex-1 flex flex-col items-center justify-end group">
              {/* Oszlop fölötti érték */}
              <span className="text-[10px] font-bold text-ink-faint mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {d.entry_count > 0 ? d.entry_count : ""}
              </span>
              
              {/* Maga az oszlop */}
              <div 
                className="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm"
                style={{ height: `${pct}%`, minHeight: d.entry_count > 0 ? "4px" : "0px" }}
              />
              
              {/* Tengely felirat (minden második vagy első/utolsó, ha sok van) */}
              <span className="text-[10px] text-ink-muted mt-1 rotate-[-45deg] origin-top-left -ml-2 whitespace-nowrap">
                {d.bucket_k}k
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-ink-faint text-right pt-2">Bérsávok 10.000 CHF-enként</p>
    </div>
  );
}
