"use client";

import { useMemo } from "react";
import { RangeSlider } from "@/components/ui/range-slider";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { usePreferredCountry } from "@/lib/country-pref";
import { cn } from "@/lib/cn";
import {
  calculateAll,
  getCustomsConfig,
  type CategoryResult,
  type CustomsConfig,
} from "@/lib/customs";

/**
 * CustomsCalculator — vizuális csúszkás kalkulátor: hány fő utazik + ki mit
 * visz. Színes feedback (zöld/sárga/piros) + becsült vám-költség.
 *
 * ORSZÁG-TUDATOS: a limitek és a pénznem a választott országhoz igazodnak
 * (CH: BAZG, GB: gov.uk Brexit utáni keretek). A vám-kalkulátor csak
 * vámhatáros országoknál jelenik meg (CH, GB) — ld. feature-availability.
 */
export function CustomsCalculator() {
  const [prefCountry] = usePreferredCountry();
  const config = useMemo(() => getCustomsConfig(prefCountry), [prefCountry]);

  const [persons, setPersons] = usePersistedState("kinti_calc_customs_persons", 1);
  const [amounts, setAmounts] = usePersistedState<Record<string, number>>("kinti_calc_customs_amounts", {});

  function setAmount(id: string, val: number) {
    setAmounts((a) => ({ ...a, [id]: val }));
  }

  const calc = useMemo(
    () => calculateAll({ persons, amounts, country: prefCountry }),
    [persons, amounts, prefCountry],
  );

  const cur = config.currency;

  return (
    <div className="space-y-4">
      {config.warning && (
        <section className="rounded-card border-2 border-accent/40 bg-accent-soft p-4 shadow-card">
          <p className="text-[12.5px] leading-relaxed text-ink">
            <strong className="text-accent">⚠️ Fontos:</strong> {config.warning}
          </p>
        </section>
      )}

      {/* Hány fő utazik */}
      <section className="rounded-card border-2 border-primary/20 bg-primary-soft/40 p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">👥</span>
          <h2 className="text-[14px] font-extrabold text-ink">Hány fő utazik?</h2>
        </div>
        <div className="flex items-center gap-3">
          <RangeSlider
            min={1}
            max={9}
            step={1}
            value={persons}
            onChange={(e) => setPersons(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="min-w-[3rem] text-center text-[22px] font-extrabold text-primary-ink">
            {persons}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
          <span className="inline-flex items-center gap-1 rounded-pill bg-surface-alt px-2 py-0.5 font-bold">
            💰 Vámmentes érték: {persons * config.valueThreshold} {cur}
          </span>
          <span className="text-ink-faint">
            ({config.directionNote} {config.valueThreshold} {cur})
          </span>
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
            currency={cur}
            onChange={(v) => setAmount(r.category.id, v)}
          />
        ))}
      </section>

      {/* Összegzés */}
      <Summary calc={calc} persons={persons} config={config} />

      {/* Ország-specifikus tippek */}
      {config.country === "CH" ? <SwissTips /> : <BritishTips />}

      <p className="px-1 text-[11px] leading-snug text-ink-faint">
        Becslés, nem hivatalos vám-tájékoztatás. Hivatalos forrás:{" "}
        <a
          href={config.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-primary-ink underline"
        >
          {config.sourceLabel}
        </a>
        .
      </p>
    </div>
  );
}

function Summary({
  calc,
  persons,
  config,
}: {
  calc: ReturnType<typeof calculateAll>;
  persons: number;
  config: CustomsConfig;
}) {
  const ok = calc.overCount === 0;
  return (
    <section
      className={cn(
        "rounded-card border-2 p-5 shadow-pop",
        ok ? "border-success/40 bg-success/10" : "border-accent/40 bg-accent-soft",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl shrink-0">{ok ? "✅" : "⚠️"}</span>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "text-[16px] font-extrabold",
              ok ? "text-success" : "text-accent",
            )}
          >
            {ok
              ? "Rendben — minden a vámmentes limit alatt!"
              : `Túllépés: ${calc.overCount} kategóriában`}
          </h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
            {ok
              ? `${persons} főre minden mennyiség a vámmentes limit alatt van.`
              : config.country === "CH"
                ? `Becsült vám-költség a túllépésre: kb. ${calc.totalDuty.toFixed(2)} ${config.currency}. A vám csak a túllépést számolja, nem a teljes mennyiséget.`
                : "A limit fölötti mennyiséget deklarálni kell — Nagy-Britanniában ilyenkor a TELJES mennyiség után fizetsz adót és vámot, nem csak a többlet után."}
          </p>
          {calc.anyProhibited && (
            <p className="mt-2 rounded-md bg-accent/15 px-2 py-1.5 text-[11.5px] font-bold text-accent">
              🚫 Tiltott tétel: hús- és tejterméket az EU-ból Nagy-Britanniába nem hozhatsz be —
              a vámnál elkobozzák, és bírság is járhat.
            </p>
          )}
          {calc.anyAlcoholOver && (
            <p className="mt-2 rounded-md bg-accent/10 px-2 py-1.5 text-[11.5px] font-semibold text-accent">
              ⚠️ Alkohol túllépés esetén külön deklarálni kell a vámnál.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function SwissTips() {
  return (
    <section className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[11.5px] leading-relaxed text-ink-muted space-y-2">
      <p>
        <strong className="text-ink">💡 Tipp:</strong> a vámmentes limit{" "}
        <strong>napi</strong> alapon számol, és <strong>személyenként</strong> — egy autóban 4 fő = 4× a limit.
        A gyerekek (17 év alatt) is teljes limittel számolnak ÉTELRE/HÚSRA, de NEM az alkoholra/dohányra.
      </p>
      <p>
        <strong className="text-ink">🛂 Self-deklaráció:</strong> ha túl van a limit, használhatod a{" "}
        <a
          href="https://www.bazg.admin.ch/bazg/de/home/services/services-firmen/services-firmen-warenanmeldung/quickzoll.html"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-primary-ink underline"
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
  );
}

function BritishTips() {
  return (
    <section className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[11.5px] leading-relaxed text-ink-muted space-y-2">
      <p>
        <strong className="text-ink">💡 Brexit óta vámhatár:</strong> az EU-ból Nagy-Britanniába
        érkezve ugyanúgy vámhatárt lépsz át, mint bármely harmadik országból. A keret{" "}
        <strong>személyenként</strong> jár, és a 18 éven aluliakra <strong>nem</strong> vonatkozik
        az alkohol- és dohánykeret.
      </p>
      <p>
        <strong className="text-ink">🚫 Hús és tejtermék:</strong> személyes csomagban{" "}
        <strong>nem hozható be</strong> az EU-ból (szalámi, kolbász, sajt, vaj sem) — a határon
        elkobozzák. Ez a legtöbb hazalátogató magyart érinti, érdemes előre számolni vele.
      </p>
      <p>
        <strong className="text-ink">🛂 Deklarálás:</strong> ha a keret fölött vagy, online kell
        deklarálnod és fizetned a{" "}
        <a
          href="https://www.gov.uk/duty-free-goods"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-primary-ink underline"
        >
          gov.uk
        </a>{" "}
        felületén, az érkezés előtti 5 napban. Nem deklarált áru esetén elkobzás és bírság jár.
      </p>
    </section>
  );
}

function CategoryRow({
  result,
  persons,
  currency,
  onChange,
}: {
  result: CategoryResult;
  persons: number;
  currency: string;
  onChange: (v: number) => void;
}) {
  const { category, amount, totalLimit, overage, estimatedDuty, status, pct } = result;

  // A range max = limit ×2 a látvány miatt (hogy lásd a túllépést is).
  // Tiltott kategóriánál a limit 0, ezért fix, kicsi skálát adunk.
  const sliderMax = category.prohibited
    ? category.unit === "db"
      ? 200
      : 10
    : Math.max(totalLimit * 2, totalLimit + 1);
  const step = category.unit === "db" ? 10 : 0.5;

  const colors = {
    ok: { border: "border-success/30", bar: "bg-success", pill: "bg-success/15 text-success" },
    warning: { border: "border-star/40", bar: "bg-star", pill: "bg-star/15 text-[#9a6b00]" },
    over: { border: "border-accent/40", bar: "bg-accent", pill: "bg-accent/15 text-accent" },
    prohibited: { border: "border-accent", bar: "bg-accent", pill: "bg-accent text-white" },
  }[status];

  return (
    <div className={cn("rounded-card border bg-surface p-3.5 shadow-card transition", colors.border)}>
      <div className="flex items-start gap-3 mb-2">
        <span className="text-2xl shrink-0">{category.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-[13.5px] font-extrabold text-ink">{category.label}</h3>
            <span className={cn("rounded-pill px-1.5 py-0.5 text-[11px] font-bold", colors.pill)}>
              {status === "ok" && (category.prohibited ? "🚫 Tiltott" : "✓ Rendben")}
              {status === "warning" && "⚠ Közel a limithez"}
              {status === "over" && "✕ Túl"}
              {status === "prohibited" && "🚫 Nem vihető be"}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            {category.prohibited ? (
              <strong className="text-accent">Behozatala tiltott</strong>
            ) : (
              <>
                Limit: <strong>{totalLimit} {category.unit}</strong> ({category.limitPerPerson}{" "}
                {category.unit}/fő × {persons})
              </>
            )}
          </p>
        </div>
      </div>

      {/* Slider */}
      <div className="flex items-center gap-3">
        <RangeSlider
          min={0}
          max={sliderMax}
          step={step}
          value={amount}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            "flex-1",
            status === "over" || status === "prohibited"
              ? "accent-accent"
              : status === "warning"
                ? "accent-star"
                : "accent-success",
          )}
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
          {estimatedDuty > 0 ? (
            <>
              <span className="text-ink-muted">→</span>
              <span className="font-extrabold text-ink">
                kb. {estimatedDuty.toFixed(2)} {currency} vám
              </span>
            </>
          ) : (
            <>
              <span className="text-ink-muted">→</span>
              <span className="font-extrabold text-ink">deklarálni kell</span>
            </>
          )}
        </div>
      )}

      {status === "prohibited" && (
        <div className="mt-2 rounded-md bg-accent/15 px-2.5 py-1.5 text-[11.5px] font-bold text-accent">
          🚫 Ezt nem hozhatod be — a határon elkobozzák.
        </div>
      )}

      {category.note && (
        <p className="mt-1.5 text-[11.5px] leading-snug text-ink-faint">{category.note}</p>
      )}
    </div>
  );
}
