"use client";

import { useMemo } from "react";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { cn } from "@/lib/cn";
import {
  CUSTOMS_CATEGORIES,
  VALUE_THRESHOLD_CHF,
  calculateAll,
  type CategoryResult,
} from "@/lib/customs";

/**
 * CustomsCalculator — vizuális csúszkás kalkulátor: hány fő utazik + ki mit
 * visz. Színes feedback (zöld/sárga/piros) + becsült vám-költség.
 */
export function CustomsCalculator() {
  const [persons, setPersons] = usePersistedState("kinti_calc_customs_persons", 1);
  const [amounts, setAmounts] = usePersistedState<Record<string, number>>("kinti_calc_customs_amounts", {});

  function setAmount(id: string, val: number) {
    setAmounts((a) => ({ ...a, [id]: val }));
  }

  const calc = useMemo(() => calculateAll({ persons, amounts }), [persons, amounts]);

  return (
    <div className="space-y-4">
      {/* Hány fő utazik */}
      <section className="rounded-card border-2 border-primary/20 bg-primary-soft/40 p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">👥</span>
          <h2 className="text-[14px] font-extrabold text-ink">Hány fő utazik az autóban?</h2>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={9}
            step={1}
            value={persons}
            onChange={(e) => setPersons(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="min-w-[3rem] text-center text-[22px] font-extrabold text-primary">
            {persons}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
          <span className="inline-flex items-center gap-1 rounded-pill bg-surface-alt px-2 py-0.5 font-bold">
            💰 Vámmentes érték: {persons * VALUE_THRESHOLD_CHF} CHF
          </span>
          <span className="text-ink-faint">(személyenként {VALUE_THRESHOLD_CHF} CHF)</span>
        </div>
      </section>

      {/* Kategóriák */}
      <section className="space-y-2.5">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
          Mit viszel be?
        </h2>
        {calc.results.map((r) => (
          <CategoryRow
            key={r.category.id}
            result={r}
            persons={persons}
            onChange={(v) => setAmount(r.category.id, v)}
          />
        ))}
      </section>

      {/* Összegzés */}
      <section
        className={cn(
          "rounded-card border-2 p-5 shadow-pop",
          calc.overCount === 0
            ? "border-success/40 bg-success/10"
            : "border-accent/40 bg-accent-soft",
        )}
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl shrink-0">
            {calc.overCount === 0 ? "✅" : "⚠️"}
          </span>
          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                "text-[16px] font-extrabold",
                calc.overCount === 0 ? "text-success" : "text-accent",
              )}
            >
              {calc.overCount === 0
                ? "Rendben — minden a vámmentes limit alatt!"
                : `Túllépés: ${calc.overCount} kategóriában`}
            </h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
              {calc.overCount === 0
                ? `${persons} főre minden mennyiség a vámmentes limit alatt van. Nyugodtan átkelhettek.`
                : `Becsült vám-költség a túllépésre: kb. ${calc.totalDuty.toFixed(2)} CHF. A vám csak a túllépést számolja, nem a teljes mennyiséget.`}
            </p>
            {calc.anyAlcoholOver && (
              <p className="mt-2 rounded-md bg-accent/10 px-2 py-1.5 text-[11.5px] font-semibold text-accent">
                ⚠️ Alkohol túllépés esetén: külön deklarálni kell a vámnál (QuickZoll app).
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Tipikus info */}
      <section className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[11.5px] leading-relaxed text-ink-muted space-y-2">
        <p>
          <strong className="text-ink">💡 Tipp:</strong> a vámmentes limit{" "}
          <strong>napi</strong> alapon számol, és <strong>személyenként</strong> — egy autóban 4 fő = 4× a limit.
          A gyerekek (17 év alatt) is teljes limittel számolnak ÉTLE/HÚSRA, de NEM az alkoholra/dohányra.
        </p>
        <p>
          <strong className="text-ink">🛂 Self-deklaráció:</strong> ha túl van a limit, használhatod a{" "}
          <a
            href="https://www.bazg.admin.ch/bazg/de/home/services/services-firmen/services-firmen-warenanmeldung/quickzoll.html"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary underline"
          >
            QuickZoll appot
          </a>{" "}
          (BAZG hivatalos) — kifizeted online, és nem kell a vámnál megállni.
        </p>
        <p>
          <strong className="text-ink">⚠️ Ne becsüld!</strong> A vámnál nyilatkozni kell — ha a vámos talál nem deklarált árut,
          a büntetés a vám 2-5×-e is lehet. Inkább előre deklaráld.
        </p>
      </section>
    </div>
  );
}

function CategoryRow({
  result,
  persons,
  onChange,
}: {
  result: CategoryResult;
  persons: number;
  onChange: (v: number) => void;
}) {
  const { category, amount, totalLimit, overage, estimatedDuty, status, pct } = result;

  // A range max = limit ×2 a látvány miatt (hogy lássd a túllépést is)
  const sliderMax = Math.max(totalLimit * 2, totalLimit + 1);
  const step = category.unit === "db" ? 10 : 0.5;

  const colors = {
    ok: { border: "border-success/30", bar: "bg-success", pill: "bg-success/15 text-success" },
    warning: { border: "border-star/40", bar: "bg-star", pill: "bg-star/15 text-[#9a6b00]" },
    over: { border: "border-accent/40", bar: "bg-accent", pill: "bg-accent/15 text-accent" },
  }[status];

  return (
    <div className={cn("rounded-card border bg-surface p-3.5 shadow-card transition", colors.border)}>
      <div className="flex items-start gap-3 mb-2">
        <span className="text-2xl shrink-0">{category.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-[13.5px] font-extrabold text-ink">{category.label}</h3>
            <span className={cn("rounded-pill px-1.5 py-0.5 text-[11px] font-bold", colors.pill)}>
              {status === "ok" && "✓ Rendben"}
              {status === "warning" && "⚠ Közel a limithez"}
              {status === "over" && "✕ Túl"}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            Limit: <strong>{totalLimit} {category.unit}</strong> ({category.limitPerPerson} {category.unit}/fő × {persons})
          </p>
        </div>
      </div>

      {/* Slider */}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={sliderMax}
          step={step}
          value={amount}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn("flex-1", status === "over" ? "accent-accent" : status === "warning" ? "accent-star" : "accent-success")}
        />
        <input
          type="number"
          min={0}
          max={sliderMax}
          step={step}
          value={amount}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="w-16 rounded-[8px] border border-line bg-surface-alt px-2 py-1 text-[13px] font-bold text-ink text-right outline-none focus:bg-surface focus:ring-2 focus:ring-primary/30"
        />
        <span className="min-w-[2rem] text-[11px] font-bold text-ink-muted">{category.unit}</span>
      </div>

      {/* Progress visual */}
      <div className="mt-2 h-1.5 w-full rounded-full bg-surface-alt overflow-hidden">
        <div
          className={cn("h-full transition-all", colors.bar)}
          style={{ width: `${Math.min(pct, 200)}%`, maxWidth: "100%" }}
        />
      </div>

      {/* Túllépés-info */}
      {status === "over" && (
        <div className="mt-2 flex items-center gap-2 rounded-md bg-accent/10 px-2.5 py-1.5 text-[11.5px]">
          <span className="font-bold text-accent">
            + {overage.toFixed(category.unit === "db" ? 0 : 1)} {category.unit} túl
          </span>
          <span className="text-ink-muted">→</span>
          <span className="font-extrabold text-ink">
            kb. {estimatedDuty.toFixed(2)} CHF vám
          </span>
        </div>
      )}

      {category.note && (
        <p className="mt-1.5 text-[11.5px] leading-snug text-ink-faint">{category.note}</p>
      )}
    </div>
  );
}
