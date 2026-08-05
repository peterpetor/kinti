"use client";

import Link from "next/link";
import { RangeSlider } from "@/components/ui/range-slider";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { CountryFlag } from "@/components/ui/country-flag";
import { szam } from "@/lib/szam-format";
import { getCountry } from "@/lib/countries";
import { currencySymbol } from "@/lib/country-examples";
import {
  orszagSor, egyenleg, SAVOK, OSSZEHASONLITO_ORSZAGOK, MEDIAN_GROSS, RENT_MIN_MINTA,
  type OrszagSor, type SavId,
} from "@/lib/orszag-osszehasonlito";
import { suggestedRooms, type BudgetCountry } from "@/lib/budget-plan";

/**
 * OrszagOsszehasonlitoChart — „Hol marad több a hónap végén?"
 *
 * Csúszkával állítható jövedelem-szint → mind a 6 ország 100%-ra normalizált,
 * rangsorolt sávdiagramja (lakhatás / megélhetés / biztosítás / marad).
 *
 * ⚠️ SZÍNEK. A négy sáv színét a `dataviz` validátorával léptettük, VILÁGOS és
 * SÖTÉT módra KÜLÖN (a sötét nem a világos megfordítása). A sáv-SORREND is
 * mérési eredmény: a piros és a zöld nem lehet szomszédos, mert deuteranopia
 * mellett összeolvadnak — ezt teszt is őrzi. Ne rendezd át „logikusabbra”.
 *
 * ⚠️ A borostyán sáv kontrasztja a felülethez 3:1 ALATT van (a validátor
 * WARN-ja). Ezt nem lehet elengedni: ezért van MINDEN sávon közvetlen felirat
 * és külön táblázatos nézet — a szín sosem az egyetlen hordozó.
 */

interface CmpApi {
  rooms: number;
  countries: { country_code: string; median_rent: number; entry_count: number }[];
}

/*
 * ⚠️ Egyszemélyes háztartás → 2 szoba, a projekt saját `suggestedRooms(1, 0)`
 * ajánlása szerint. Először 3 szobával mértem, és 60%-os jövedelem-szinten MIND
 * az öt EUR/GBP-ország 0%-ot mutatott: egy főre 3 szobás albérlet irreális
 * párosítás, amitől a grafikon alacsony béreknél elvesztette az információt.
 */
const ROOMS = suggestedRooms(1, 0);

export function OrszagOsszehasonlitoChart() {
  const [szazalek, setSzazalek] = useState(100);
  const [adat, setAdat] = useState<CmpApi | null>(null);
  const [hiba, setHiba] = useState(false);
  const [tablazat, setTablazat] = useState(false);
  const [nyitott, setNyitott] = useState<string | null>(null);

  useEffect(() => {
    let el = true;
    fetch(`/api/koltsegvetes?country=CH&compare=1&rooms=${ROOMS}`)
      .then((r) => (r.ok ? (r.json() as Promise<CmpApi>) : Promise.reject(new Error(String(r.status)))))
      .then((d) => el && setAdat(d))
      .catch(() => el && setHiba(true));
    return () => {
      el = false;
    };
  }, []);

  const sorok: OrszagSor[] = useMemo(() => {
    if (!adat) return [];
    const map = new Map(adat.countries.map((c) => [c.country_code, c]));
    return OSSZEHASONLITO_ORSZAGOK.map((c) => {
      const r = map.get(c);
      return orszagSor(c as BudgetCountry, szazalek, r?.median_rent ?? null, r?.entry_count ?? 0);
    })
      .filter((s) => !s.keves)
      .sort((a, b) => b.arany.marad - a.arany.marad);
  }, [adat, szazalek]);

  const kihagyott = useMemo(() => {
    if (!adat) return [];
    const map = new Map(adat.countries.map((c) => [c.country_code, c]));
    return OSSZEHASONLITO_ORSZAGOK.filter((c) => {
      const r = map.get(c);
      return !r || r.entry_count < RENT_MIN_MINTA;
    });
  }, [adat]);

  if (hiba) return null;

  return (
    <section className="space-y-3 rounded-card border border-line bg-surface p-4 shadow-card">
      <header className="space-y-1">
        <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-ink">Hol marad több a hónap végén?</h2>
        <p className="text-[12px] leading-snug text-ink-muted">
          Húzd a csúszkát: mind a hat országban <strong className="text-ink">ugyanolyan jól</strong> keresel —
          a helyi átlaghoz mérve. A sávok azt mutatják, mire megy el a nettó béred.
        </p>
      </header>

      {/* ── Csúszka ─────────────────────────────────────────────────────── */}
      <div className="rounded-[14px] bg-surface-alt/70 px-3.5 py-3">
        <label htmlFor="cmp-slider" className="flex items-baseline justify-between gap-2">
          <span className="text-[12px] font-bold text-ink">Jövedelem-szint</span>
          <span className="text-[13px] font-extrabold tabular-nums text-primary-ink">
            a helyi átlagbér {szazalek}%-a
          </span>
        </label>
        <RangeSlider
          id="cmp-slider"
          min={50}
          max={250}
          step={5}
          value={szazalek}
          onChange={(e) => setSzazalek(Number(e.target.value))}
          className="mt-2 h-6 w-full cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10.5px] text-ink-faint">
          <span>a fele</span>
          <span>átlag</span>
          <span>2,5×</span>
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-ink-faint">
          Pl. Németországban ez {szam(Math.round((MEDIAN_GROSS.DE * szazalek) / 100))} € bruttó,
          Svájcban {szam(Math.round((MEDIAN_GROSS.CH * szazalek) / 100))} CHF.
        </p>
      </div>

      {/* ── Jelmagyarázat — 4 sávnál KÖTELEZŐ, a szín sosem az egyetlen jel ── */}
      <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
        {SAVOK.map((s) => (
          <li key={s.id} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-muted">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: `var(--sav-${s.id})` }} />
            {s.emoji} {s.label}
          </li>
        ))}
      </ul>

      {!adat ? (
        <div className="space-y-3" aria-busy="true">
          <span className="sr-only">Összehasonlítás betöltése…</span>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="kinti-shimmer mb-1 h-3 w-1/3 rounded-md bg-ink/10" />
              <div className="kinti-shimmer h-7 w-full rounded-[8px] bg-ink/10" />
            </div>
          ))}
        </div>
      ) : tablazat ? (
        <Tabla sorok={sorok} />
      ) : (
        <div className="space-y-3">
          {sorok.map((s, i) => (
            <Rud
              key={s.country}
              sor={s}
              helyezes={i + 1}
              nyitott={nyitott === s.country}
              onToggle={() => setNyitott((x) => (x === s.country ? null : s.country))}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setTablazat((t) => !t)}
          className="flex items-center gap-1.5 text-[11.5px] font-bold text-ink-muted underline underline-offset-2"
        >
          <Icon name={tablazat ? "trending" : "list"} size={13} strokeWidth={2.4} />
          {tablazat ? "Vissza a grafikonhoz" : "Táblázatos nézet"}
        </button>
        <Link href="/hova-koltozzek" className="flex items-center gap-1 text-[11.5px] font-bold text-primary-ink underline underline-offset-2">
          Hová költözzek? <Icon name="chevR" size={12} strokeWidth={2.6} />
        </Link>
      </div>

      {/* ⚠️ A biztosítás-sáv 0 négy országban — ez NEM azt jelenti, hogy nincs
          biztosítás. Enélkül a grafikon félrevezető lenne. */}
      <div className="space-y-1.5 rounded-[12px] bg-surface-alt/70 px-3 py-2.5 text-[11px] leading-snug text-ink-muted">
        <p>
          <strong className="text-ink">Miért nulla a biztosítás négy országban?</strong> Mert ott az
          egészségbiztosítás már a bérből levont járulék része — a nettóból nem megy el újra.
          Svájcban és Hollandiában viszont külön havi díjat fizetsz, ezért látszik külön sávként.
        </p>
        <p>
          Egyszemélyes háztartással, {ROOMS} szobás albérlettel számolunk. A lakbér a közösségi
          beküldések mediánja, a többi tétel tipikus referencia-szint — a{" "}
          <strong className="text-ink">saját</strong> számaidhoz használd fent a tervezőt.
        </p>
        {kihagyott.length > 0 && (
          <p>
            Kihagyva (kevés lakbér-adat): {kihagyott.map((c) => getCountry(c)?.name ?? c).join(", ")}.
          </p>
        )}
      </div>
    </section>
  );
}

/** Egy ország rúdja — 100%-ra normalizált, rangsorolt. */
function Rud({
  sor, helyezes, nyitott, onToggle,
}: { sor: OrszagSor; helyezes: number; nyitott: boolean; onToggle: () => void }) {
  const o = getCountry(sor.country);
  const eg = egyenleg(sor);
  const jel = currencySymbol(sor.currency);
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={nyitott}
        className="mb-1 flex w-full items-baseline gap-1.5 text-left"
      >
        <span className="text-[11px] font-bold tabular-nums text-ink-faint">{helyezes}.</span>
        {/* ⚠️ SVG-zászló, NEM a `flag` emoji: Anglia zászlaja tag-sequence,
            amihez a legtöbb Android/Windows fontban nincs glyph. */}
        <CountryFlag code={sor.country} className="h-[11px] w-[16px] self-center" />
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-ink">{o?.name ?? sor.country}</span>
        <span className={cn("shrink-0 text-[12.5px] font-extrabold tabular-nums", eg >= 0 ? "text-ink" : "text-accent")}>
          {eg >= 0 ? "" : "−"}
          {szam(Math.abs(eg))} {jel}
        </span>
        <Icon name="chevD" size={13} strokeWidth={2.4} className={cn("shrink-0 text-ink-faint transition-transform", nyitott && "rotate-180")} />
      </button>

      {/* A rúd: 2px felület-rés a szegmensek közt (dataviz mark-spec). */}
      <div className="flex h-7 w-full gap-[2px] overflow-hidden rounded-[8px]">
        {SAVOK.map((s) => {
          const pct = sor.arany[s.id];
          if (pct <= 0) return null;
          return (
            <div
              key={s.id}
              title={`${s.label}: ${Math.round(pct)}% — ${szam(sor.osszeg[s.id])} ${jel}`}
              className="grid min-w-0 place-items-center first:rounded-l-[8px] last:rounded-r-[8px]"
              style={{ width: `${pct}%`, background: `var(--sav-${s.id})` }}
            >
              {/* Közvetlen felirat, ahol elfér — a szín nem lehet az egyetlen
                  jel. A 9%-os küszöb mérés: 390px-es telefonon a sáv ~330px,
                  ennek 9%-a ~30px, amibe a „12%" (~20px) még belefér. Ez alatt
                  a felirat kilógna a szegmensből. */}
              {pct >= 9 && (
                <span className="px-1 text-[10.5px] font-extrabold tabular-nums text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                  {Math.round(pct)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {nyitott && (
        <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 rounded-[10px] bg-surface-alt/70 px-3 py-2">
          <Tetel cimke="Bruttó" ertek={`${szam(sor.gross)} ${jel}`} />
          <Tetel cimke="Nettó" ertek={`${szam(sor.net)} ${jel}`} />
          {SAVOK.filter((s) => s.id !== "marad").map((s) => (
            <Tetel
              key={s.id}
              cimke={`${s.emoji} ${s.label}`}
              ertek={`${szam(sor.osszeg[s.id])} ${jel}`}
            />
          ))}
          <Tetel cimke="Lakbér-minta" ertek={`${sor.rentMinta} beküldés`} />
        </dl>
      )}
    </div>
  );
}

function Tetel({ cimke, ertek }: { cimke: string; ertek: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="truncate text-[11px] text-ink-muted">{cimke}</dt>
      <dd className="shrink-0 text-[11.5px] font-bold tabular-nums text-ink">{ertek}</dd>
    </div>
  );
}

/** Táblázatos nézet — a kontraszt-WARN miatt KÖTELEZŐ alternatíva, nem extra. */
function Tabla({ sorok }: { sorok: OrszagSor[] }) {
  return (
    <div className="overflow-x-auto">
      {/* ⚠️ NINCS külön „Egyenleg" oszlop. Hattal a táblázat 380px-re hízott, és
          mobilon pont a LEGFONTOSABB („Marad") csúszott ki a képernyőről —
          vízszintes görgetés mögé rejtve. Az abszolút összeg a sávos nézet
          során és a lenyitott részletekben amúgy is ott van. */}
      <table className="w-full min-w-[290px] border-collapse text-[11px]">
        <caption className="sr-only">Költség-arányok országonként, a nettó bér százalékában</caption>
        <thead>
          {/* ⚠️ SZÖVEGES fejlécek, nem puszta emoji: a táblázat épp azért van
              itt, hogy a színtől és az ikontól függetlenül is olvasható legyen. */}
          <tr className="border-b border-line text-left text-ink-muted">
            <th scope="col" className="py-1.5 pr-2 font-bold">Ország</th>
            {/* Rövidített fejlécek — a teljes szavakkal a „Marad" oszlop
                kicsúszott a telefon képernyőjéről (lásd SAVOK.rovid). A teljes
                nevet a jelmagyarázat és a sávos nézet adja meg. */}
            {SAVOK.map((s) => (
              <th key={s.id} scope="col" className="py-1.5 pr-1.5 text-right align-bottom font-bold last:pr-0">
                <abbr title={s.label} className="no-underline">{s.rovid}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorok.map((s) => {
            const eg = egyenleg(s);
            return (
              <tr key={s.country} className="border-b border-line/60">
                <th scope="row" className="whitespace-nowrap py-1.5 pr-2 text-left font-bold text-ink">
                  {getCountry(s.country)?.name ?? s.country}
                </th>
                {SAVOK.map((x) => (
                  <td
                    key={x.id}
                    className={cn(
                      "py-1.5 pr-1.5 text-right tabular-nums last:pr-0",
                      x.id === "marad"
                        ? eg >= 0 ? "font-extrabold text-ink" : "font-extrabold text-accent"
                        : "text-ink-muted",
                    )}
                  >
                    {Math.round(s.arany[x.id])}%
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

