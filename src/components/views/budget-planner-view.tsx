"use client";

/**
 * budget-planner-view.tsx — „Mennyi marad?" kiköltözési költségvetés-tervező.
 *
 * A bérkalkulátor (salary-calc nettó-motorok) és a költség-adatok (rent_benchmarks +
 * cost_benchmarks + kurált referencia, lásd budget-plan.ts) INTEGRÁCIÓJA: bruttó bér +
 * család + régió → „ennyi marad a hónap végén". VIRÁLIS mechanika: a teljes állapot
 * URL-paraméterben él (window.location, NEM useSearchParams — a force-static oldalon
 * az Suspense-t igényelne), így a megosztott link ugyanazt a számítást nyitja meg.
 * Egy fizetésből számol (a partner jövedelme nélkül) — ezt a UI ki is mondja.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { trackAction } from "@/components/usage-tracker";
import { usePreferredCountry } from "@/lib/country-pref";
import { getRegions, REGION_LABEL } from "@/lib/regions";
import { getCountry } from "@/lib/countries";
import {
  computeSalary, computeSalaryAT, computeSalaryDE, computeSalaryNL,
  type AgeBracket, type CivilStatus, type Steuerklasse,
} from "@/lib/salary-calc";
import {
  type BudgetCountry, isBudgetCountry, budgetCurrency, baselineCosts, blendCosts,
  childBenefit, summarizeBudget, suggestedRooms, VERDICT_COPY, type BudgetCostItem,
} from "@/lib/budget-plan";

interface RentRow { rooms: number; median: number; count: number }
interface CostApiData {
  rents: RentRow[];
  rentsCountry: RentRow[];
  costs: Record<string, { median: number | null; count: number }>;
}

const inputCls =
  "h-12 w-full rounded-card border border-line bg-surface px-3 text-[14px] font-medium text-ink outline-none focus:border-primary/50";
const labelCls = "mb-1.5 block text-[12.5px] font-bold text-ink";
const pillBase =
  "rounded-pill px-3.5 py-2 text-[13px] font-bold transition active:scale-95 border";
const pillOn = "border-primary bg-primary text-white";
const pillOff = "border-line bg-surface text-ink-muted";

/**
 * Szám-felpörgés a nagy eredmény-számhoz (delight a megosztható képernyőn):
 * érték-VÁLTOZÁSKOR ease-out görbével pörög az új értékre (első render azonnali).
 * Reduced-motion → ugrás animáció nélkül.
 */
function useCountUp(value: number, ms = 550): number {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (from === value) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return display;
}

/** A legjobb lakbér-medián a kért szobaszámhoz: régió pontos → régió legközelebbi
 *  → országos pontos → országos legközelebbi. */
function pickRent(data: CostApiData | null, rooms: number): { amount: number; scope: "region" | "country" } | null {
  if (!data) return null;
  const pick = (rows: RentRow[]): number | null => {
    const usable = rows.filter((r) => r.count > 0 && r.median > 0);
    if (usable.length === 0) return null;
    const exact = usable.find((r) => r.rooms === rooms);
    if (exact) return exact.median;
    const nearest = usable.reduce((a, b) =>
      Math.abs(b.rooms - rooms) < Math.abs(a.rooms - rooms) ? b : a,
    );
    return nearest.median;
  };
  const regional = pick(data.rents);
  if (regional != null) return { amount: regional, scope: "region" };
  const national = pick(data.rentsCountry);
  if (national != null) return { amount: national, scope: "country" };
  return null;
}

export function BudgetPlannerView() {
  const [prefCountry] = usePreferredCountry();

  // ── Állapot ───────────────────────────────────────────────────────────────
  const [country, setCountry] = useState<BudgetCountry>("DE");
  const [gross, setGross] = useState("");
  const [region, setRegion] = useState("all");
  const [adults, setAdults] = useState(1);
  const [partnerWorks, setPartnerWorks] = useState(false);
  const [kids, setKids] = useState(0);
  const [rooms, setRooms] = useState(2);
  const [roomsTouched, setRoomsTouched] = useState(false);
  const [manualRent, setManualRent] = useState("");
  // Kategóriánkénti SAJÁT összeg-felülírás (üres = a becslés marad). A user-panasz
  // (2026-07-11) nyomán: a becsült sorok „kamu adatnak" tűntek — mostantól minden
  // sor átírható, és a becslés-forrás jelölve van.
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  // Ország-specifikus adó-részletek
  const [sk, setSk] = useState<Steuerklasse>(1);        // DE
  const [church, setChurch] = useState(false);           // DE + CH
  const [m14, setM14] = useState(true);                  // AT: 13./14.
  const [m13, setM13] = useState(true);                  // CH: 13. havi
  const [age, setAge] = useState<AgeBracket>("25-34");   // CH: BVG-korsáv
  const [vakantie, setVakantie] = useState(true);        // NL: vakantiegeld
  const [ruling30, setRuling30] = useState(false);       // NL: 30%-regeling
  const [copied, setCopied] = useState(false);

  const [data, setData] = useState<CostApiData | null>(null);
  const hydrated = useRef(false);
  const trackedRef = useRef(false);
  const urlParsed = useRef(false);
  const sawCountryParam = useRef(false);
  const countryTouched = useRef(false);

  // ── URL-állapot beolvasása mounton (megosztott link) + ország-default ─────
  // Az ország-preferencia KÉSVE (mount-effektből) érkezik, közben az URL-szinkron
  // már ?c=DE-t ír a címsorba — ezért az URL-t csak EGYSZER, az EREDETI
  // paraméterekből olvassuk, és a preferencia-default külön ágon, csak akkor fut,
  // ha se eredeti c-param, se kézi ország-választás nem előzte meg (audit #1).
  useEffect(() => {
    if (!urlParsed.current) {
      urlParsed.current = true;
      const p = new URLSearchParams(window.location.search);
      const c = p.get("c");
      sawCountryParam.current = isBudgetCountry(c);
      if (isBudgetCountry(c)) setCountry(c);
      const b = p.get("b"); if (b && /^\d{2,7}$/.test(b)) setGross(b);
      const r = p.get("r"); if (r) setRegion(r);
      const a = Number(p.get("a")); if (a === 2) setAdults(2);
      const k = Number(p.get("k")); if (Number.isInteger(k) && k >= 0 && k <= 6) setKids(k);
      const rm = Number(p.get("rm")); if (Number.isInteger(rm) && rm >= 1 && rm <= 6) { setRooms(rm); setRoomsTouched(true); }
      const skP = Number(p.get("sk")); if ([1, 2, 3, 4].includes(skP)) setSk(skP as Steuerklasse);
      if (p.get("pw") === "1") setPartnerWorks(true);
      if (p.get("ch") === "1") setChurch(true);
      if (p.get("m14") === "0") setM14(false);
      if (p.get("m13") === "0") setM13(false);
      if (p.get("vk") === "0") setVakantie(false);
      if (p.get("r30") === "1") setRuling30(true);
      const mr = p.get("mr"); if (mr && /^\d{1,7}$/.test(mr)) setManualRent(mr);
      const o = p.get("o");
      if (o) {
        const map: Record<string, string> = {};
        for (const part of o.split("~")) {
          const [id, val] = part.split(".");
          if (id && /^[a-z_]{1,24}$/.test(id) && /^\d{1,6}$/.test(val ?? "")) map[id] = val;
        }
        setOverrides(map);
      }
      hydrated.current = true;
    }
    if (!sawCountryParam.current && !countryTouched.current && isBudgetCountry(prefCountry)) {
      setCountry(prefCountry);
    }
  }, [prefCountry]);

  const regions = useMemo(() => getRegions(country), [country]);
  // Ország-váltásra a más országbeli régió érvénytelen → vissza "all"-ra.
  useEffect(() => {
    if (region !== "all" && !regions.some((r) => r.code === region)) setRegion("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  // Háztartás-méret alapján ajánlott szobaszám (amíg a user nem nyúlt hozzá).
  useEffect(() => {
    if (!roomsTouched) setRooms(suggestedRooms(adults, kids));
  }, [adults, kids, roomsTouched]);

  // ── Költség-adatok lekérése (régió/háztartás-tudatos, cache-elt API) ──────
  const household = adults + kids;
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/koltsegvetes?country=${country}&canton=${encodeURIComponent(region)}&household=${household}`)
      .then((r) => (r.ok ? (r.json() as Promise<CostApiData>) : null))
      .then((d) => { if (!cancelled && d) setData(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [country, region, household]);

  // ── URL szinkron (megosztható állapot) ────────────────────────────────────
  const grossNum = Number(gross) || 0;
  useEffect(() => {
    if (!hydrated.current) return;
    const p = new URLSearchParams();
    p.set("c", country);
    if (grossNum > 0) p.set("b", String(grossNum));
    if (region !== "all") p.set("r", region);
    if (adults === 2) { p.set("a", "2"); if (partnerWorks) p.set("pw", "1"); }
    if (kids > 0) p.set("k", String(kids));
    if (roomsTouched) p.set("rm", String(rooms));
    if (country === "DE" && sk !== 1) p.set("sk", String(sk));
    if ((country === "DE" || country === "CH") && church) p.set("ch", "1");
    if (country === "AT" && !m14) p.set("m14", "0");
    if (country === "CH" && !m13) p.set("m13", "0");
    if (country === "NL" && !vakantie) p.set("vk", "0");
    if (country === "NL" && ruling30) p.set("r30", "1");
    // Saját lakbér + kategória-felülírások — a megosztott link a TELJES számítást viszi.
    if (manualRent.trim() !== "" && /^\d{1,7}$/.test(manualRent.trim())) p.set("mr", manualRent.trim());
    const oParts = Object.entries(overrides)
      .filter(([, v]) => v.trim() !== "" && /^\d{1,6}$/.test(v.trim()))
      .map(([id, v]) => `${id}.${v.trim()}`);
    if (oParts.length > 0) p.set("o", oParts.join("~"));
    window.history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
  }, [country, grossNum, region, adults, partnerWorks, kids, rooms, roomsTouched, sk, church, m14, m13, vakantie, ruling30, manualRent, overrides]);

  // ── Nettó bér (havi ÁTLAG — a 13./14. havi szétosztva) ────────────────────
  const netMonthly = useMemo(() => {
    if (grossNum <= 0) return 0;
    if (country === "CH") {
      const canton = region !== "all" ? region : "ZH";
      const civil: CivilStatus = adults === 2 ? (partnerWorks ? "C" : "B") : "A";
      const r = computeSalary({ gross: grossNum, period: "month", canton, age, civil, kids, churchTax: church, months: m13 ? 13 : 12 });
      return r.netYearly / 12;
    }
    if (country === "AT") {
      const soleEarner = adults === 2 && !partnerWorks && kids >= 1;
      const r = computeSalaryAT({ gross: grossNum, period: "month", months: m14 ? 14 : 12, kids, soleEarner });
      return r.netYearly / 12;
    }
    if (country === "DE") {
      const r = computeSalaryDE({ gross: grossNum, period: "month", steuerklasse: sk, kids, churchTax: church });
      return r.netMonthly;
    }
    const r = computeSalaryNL({ gross: grossNum, period: "month", holidayAllowance: vakantie, ruling30 });
    return r.netMonthly;
  }, [country, grossNum, region, adults, partnerWorks, kids, age, church, m13, m14, sk, vakantie, ruling30]);

  // ── Költségek: lakbér + kevert (közösségi/referencia) kategóriák ──────────
  // A „Saját lakbér" a 0-t is elfogadja (céges szállás / rokonoknál lakás — gyakori
  // eset): üres mező = medián-becslés, beírt szám (a 0 is!) = a te összeged.
  const manualRentSet = manualRent.trim() !== "" && Number.isFinite(Number(manualRent));
  const rentPick = useMemo(() => pickRent(data, rooms), [data, rooms]);
  const rentAmount = manualRentSet ? Math.max(0, Math.round(Number(manualRent))) : rentPick?.amount ?? 0;
  const estimatedCosts: BudgetCostItem[] = useMemo(
    () => blendCosts(baselineCosts(country, adults, kids), data?.costs ?? {}),
    [country, adults, kids, data],
  );
  // Saját felülírások alkalmazása (üres/érvénytelen = a becslés marad).
  const costs: BudgetCostItem[] = useMemo(
    () =>
      estimatedCosts.map((c) => {
        const raw = overrides[c.id];
        if (raw != null && raw.trim() !== "" && Number.isFinite(Number(raw))) {
          return { ...c, amount: Math.max(0, Math.round(Number(raw))), source: "user" as const };
        }
        return c;
      }),
    [estimatedCosts, overrides],
  );
  const benefit = childBenefit(country, kids);
  const summary = useMemo(
    () => summarizeBudget({ netMonthly, childBenefitMonthly: benefit, rentMonthly: rentAmount, costs }),
    [netMonthly, benefit, rentAmount, costs],
  );

  const currency = budgetCurrency(country);
  const nf = useMemo(() => new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 0 }), []);
  const fmt = (n: number) => `${nf.format(Math.round(n))} ${currency === "CHF" ? "CHF" : "€"}`;
  // Lakbér 0-val is van eredmény (saját megadás) — csak akkor nincs, ha se medián,
  // se saját összeg nem áll rendelkezésre.
  const showResult = grossNum > 0 && (manualRentSet || rentPick != null);
  // A nagy szám input-változásra „felpörög" az új értékre.
  const animatedLeftover = useCountUp(summary.leftover);
  const verdict = VERDICT_COPY[summary.verdict];
  const regionName = region !== "all" ? regions.find((r) => r.code === region)?.name ?? region : null;
  const countryName = getCountry(country)?.name ?? country;

  // Első kiszámolt eredmény — konverzió-jel (sessionönként a trackAction dedupol).
  useEffect(() => {
    if (showResult && !trackedRef.current) { trackedRef.current = true; trackAction("budget-calc"); }
  }, [showResult]);

  async function share() {
    const kidsPart = kids > 0 ? `, ${kids} gyerekkel` : "";
    const placePart = regionName ? `${regionName} (${countryName})` : countryName;
    const text =
      `💶 ${fmt(grossNum)} bruttóból${kidsPart} kb. ${fmt(summary.leftover)} marad a hónap végén — ${placePart}. ` +
      `Számold ki a saját számaidat a Kintin:`;
    const url = window.location.href;
    trackAction("budget-share");
    try {
      if (navigator.share) { await navigator.share({ text, url }); return; }
    } catch { /* user cancelled */ }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-5">
      {/* ── Bemenetek ─────────────────────────────────────────────────────── */}
      <section className="space-y-4 rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
        {/* Ország */}
        <div>
          <span className={labelCls}>Hová költöznél?</span>
          <div className="flex flex-wrap gap-2">
            {(["DE", "AT", "CH", "NL"] as const).map((c) => (
              <button key={c} type="button"
                onClick={() => {
                  countryTouched.current = true;
                  setCountry(c);
                  // Kézi ország-váltásnál a saját összegek törlődnek (más pénznem /
                  // más árszint) — URL-ből jövő megosztott számításnál maradnak.
                  setOverrides({});
                  setManualRent("");
                }}
                className={cn(pillBase, country === c ? pillOn : pillOff)}>
                {getCountry(c)?.flag} {getCountry(c)?.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bruttó bér */}
        <div>
          <label htmlFor="bp-gross" className={labelCls}>
            Felajánlott HAVI bruttó bér ({currency === "CHF" ? "CHF" : "€"})
            {country === "AT" && <span className="ml-1 font-medium text-ink-muted">— a szerződéses havi (a 13./14. külön)</span>}
          </label>
          <input id="bp-gross" type="number" inputMode="numeric" min={0} placeholder={country === "CH" ? "pl. 5800" : "pl. 3200"}
            value={gross} onChange={(e) => setGross(e.target.value)} className={inputCls} />
        </div>

        {/* Régió */}
        <div>
          <label htmlFor="bp-region" className={labelCls}>
            Melyik {REGION_LABEL[country] ?? "régió"}? <span className="font-medium text-ink-muted">(a lakbér{country === "CH" ? " és az adó" : ""} ehhez igazodik)</span>
          </label>
          <select id="bp-region" value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls}>
            <option value="all">Országos átlag</option>
            {regions.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
          </select>
          {country === "CH" && region === "all" && (
            <p className="mt-1 text-[11px] text-ink-muted">
              Svájcban az adó kantononként eltér — kanton nélkül zürichi (ZH) kulccsal
              becslünk. Válassz kantont a pontosabb nettóhoz.
            </p>
          )}
        </div>

        {/* Háztartás */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className={labelCls}>Felnőttek</span>
            <div className="flex gap-2">
              {[1, 2].map((n) => (
                <button key={n} type="button" onClick={() => setAdults(n)}
                  className={cn(pillBase, adults === n ? pillOn : pillOff)}>
                  {n === 1 ? "Egyedül" : "Párban"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={labelCls}>Gyerekek</span>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((n) => (
                <button key={n} type="button" onClick={() => setKids(n)}
                  className={cn(pillBase, "px-3", kids === n ? pillOn : pillOff)}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
        {adults === 2 && (
          <label className="flex items-start gap-2.5 text-[12.5px] leading-snug text-ink">
            <input type="checkbox" checked={partnerWorks} onChange={(e) => setPartnerWorks(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
            <span>
              A párom is dolgozni fog kint.{" "}
              <span className="text-ink-muted">A tervező EGY fizetésből számol — két keresővel a közös büdzsé ennél jobb lesz.</span>
            </span>
          </label>
        )}

        {/* Lakás */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className={labelCls}>Lakásméret (szoba)</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button key={n} type="button" onClick={() => { setRooms(n); setRoomsTouched(true); }}
                  className={cn(pillBase, "px-3", rooms === n ? pillOn : pillOff)}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="bp-rent" className={labelCls}>
              Saját lakbér <span className="font-medium text-ink-muted">(0 = nem fizetsz, pl. céges szállás)</span>
            </label>
            <input id="bp-rent" type="number" inputMode="numeric" min={0} placeholder="üresen: medián"
              value={manualRent} onChange={(e) => setManualRent(e.target.value)} className={inputCls} />
          </div>
        </div>

        {/* Ország-specifikus adó-részletek */}
        {country === "DE" && (
          <div className="space-y-3 rounded-xl border border-line bg-surface-alt/40 p-3">
            <div>
              <label htmlFor="bp-sk" className={labelCls}>Steuerklasse (adóosztály)</label>
              <select id="bp-sk" value={sk} onChange={(e) => setSk(Number(e.target.value) as Steuerklasse)} className={inputCls}>
                <option value={1}>I — egyedülálló</option>
                <option value={2}>II — egyedülálló, gyerekkel</option>
                <option value={3}>III — házas, fő kereső</option>
                <option value={4}>IV — házas, hasonló keresetek</option>
              </select>
            </div>
            <label className="flex items-center gap-2.5 text-[12.5px] text-ink">
              <input type="checkbox" checked={church} onChange={(e) => setChurch(e.target.checked)} className="h-4 w-4 accent-primary" />
              Egyházi adó (Kirchensteuer)
            </label>
          </div>
        )}
        {country === "AT" && (
          <label className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-alt/40 p-3 text-[12.5px] text-ink">
            <input type="checkbox" checked={m14} onChange={(e) => setM14(e.target.checked)} className="h-4 w-4 accent-primary" />
            13. és 14. havi fizetés (Urlaubs-/Weihnachtsgeld) — Ausztriában szinte mindig jár
          </label>
        )}
        {country === "CH" && (
          <div className="space-y-3 rounded-xl border border-line bg-surface-alt/40 p-3">
            <div>
              <label htmlFor="bp-age" className={labelCls}>Életkor (a nyugdíj-levonáshoz)</label>
              <select id="bp-age" value={age} onChange={(e) => setAge(e.target.value as AgeBracket)} className={inputCls}>
                <option value="<25">25 alatt</option>
                <option value="25-34">25–34</option>
                <option value="35-44">35–44</option>
                <option value="45-54">45–54</option>
                <option value="55-65">55–65</option>
              </select>
            </div>
            <label className="flex items-center gap-2.5 text-[12.5px] text-ink">
              <input type="checkbox" checked={m13} onChange={(e) => setM13(e.target.checked)} className="h-4 w-4 accent-primary" />
              13. havi fizetés
            </label>
            <label className="flex items-center gap-2.5 text-[12.5px] text-ink">
              <input type="checkbox" checked={church} onChange={(e) => setChurch(e.target.checked)} className="h-4 w-4 accent-primary" />
              Egyházi adó
            </label>
          </div>
        )}
        {country === "NL" && (
          <div className="space-y-3 rounded-xl border border-line bg-surface-alt/40 p-3">
            <label className="flex items-center gap-2.5 text-[12.5px] text-ink">
              <input type="checkbox" checked={vakantie} onChange={(e) => setVakantie(e.target.checked)} className="h-4 w-4 accent-primary" />
              8% vakantiegeld (szabadságpénz) is jár
            </label>
            <label className="flex items-start gap-2.5 text-[12.5px] leading-snug text-ink">
              <input type="checkbox" checked={ruling30} onChange={(e) => setRuling30(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
              <span>30%-regeling (expat-adókedvezmény) <span className="text-ink-muted">— külön engedélyhez és bérküszöbhöz kötött</span></span>
            </label>
          </div>
        )}
      </section>

      {/* ── Eredmény ──────────────────────────────────────────────────────── */}
      {grossNum > 0 && !showResult && (
        <p className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[13px] text-ink-muted">
          Ehhez a régióhoz/szobaszámhoz még nincs lakbér-adatunk — írd be a „Saját lakbér" mezőbe a kinézett lakás árát.
        </p>
      )}
      {showResult && (
        <section className="space-y-4 animate-fade-up">
          {/* Verdikt + nagy szám */}
          <div className="rounded-card border-2 border-primary/25 bg-gradient-to-br from-primary/5 to-surface p-5 text-center shadow-card">
            <p className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">
              Ennyi marad a hónap végén{regionName ? ` — ${regionName}` : ` — ${countryName}`}
            </p>
            <p className={cn("mt-1 text-[36px] font-extrabold tracking-tight tabular-nums", summary.leftover >= 0 ? "text-primary" : "text-accent")}>
              {animatedLeftover >= 0 ? "~" : "−"}{fmt(Math.abs(animatedLeftover))}
            </p>
            <p className="text-[13px] font-bold text-ink">
              {verdict.emoji} {verdict.title}
              {summary.leftover >= 0 && <span className="font-medium text-ink-muted"> · a jövedelem {summary.savingsRate}%-a</span>}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-[12px] leading-snug text-ink-muted">{verdict.sub}</p>
          </div>

          {/* Bontás — MINDEN költség-sor átírható (a becslés csak kiindulópont). */}
          <div className="space-y-2.5 rounded-card border border-line bg-surface p-4 shadow-card">
            <p className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">Havi bontás (átlag)</p>
            <p className="rounded-lg bg-surface-alt/70 px-3 py-2 text-[11.5px] leading-snug text-ink-muted">
              ✏️ A költségek <strong className="text-ink">tipikus becslések</strong> (nem a te
              adataid) — írd át bármelyik összeget a sajátodra, azzal számolunk. A 0 is
              érvényes (pl. ha nem költesz rá).
            </p>
            <Row label={`💰 Nettó bér${(country === "AT" && m14) || (country === "CH" && m13) ? " (13./14. havival elosztva)" : ""}`}
              amount={fmt(netMonthly)} strong />
            {benefit > 0 && <Row label="👶 Gyerek utáni juttatás (becslés)" amount={`+${fmt(benefit)}`} strong />}
            <div className="my-2 border-t border-line" />
            <CostRow
              label={`🏠 Albérlet (${rooms} szoba${manualRentSet ? " · saját adat" : rentPick?.scope === "country" ? " · országos medián" : " · régió-medián"})`}
              sub={manualRentSet ? (rentAmount === 0 ? "0 = nem fizetsz lakbért" : undefined) : "átírható fent, a Saját lakbér mezőben (0 = nem fizetsz)"}
              amount={rentAmount} total={summary.incomeTotal} fmt={fmt} />
            {costs.map((c, i) => (
              <EditableCostRow key={c.id}
                item={c}
                estimate={estimatedCosts[i].amount}
                value={overrides[c.id] ?? ""}
                onChange={(v) => setOverrides((s) => ({ ...s, [c.id]: v }))}
                total={summary.incomeTotal}
                currency={currency}
              />
            ))}
            <div className="my-2 border-t border-line" />
            <Row label="Összes költség" amount={`−${fmt(summary.costTotal)}`} strong />
          </div>

          {/* Megosztás */}
          <button type="button" onClick={share}
            className="flex w-full items-center justify-center gap-2 rounded-pill bg-primary px-4 py-3 text-[15px] font-extrabold text-white transition active:scale-[0.98]">
            <Icon name="share" size={17} strokeWidth={2.4} />
            {copied ? "Link kimásolva ✓" : "Eredmény megosztása"}
          </button>
          <p className="text-center text-[11px] leading-snug text-ink-faint">
            A link a beállításaidat is viszi — aki megnyitja, ugyanezt a számítást látja.
          </p>
        </section>
      )}

      {/* Kereszt-linkek */}
      <section className="grid gap-2">
        <Link href="/berkalkulator" className="flex items-center gap-2 rounded-card border border-line bg-surface px-4 py-3 text-[13px] font-bold text-ink transition active:scale-[0.99]">
          <Icon name="sliders" size={15} strokeWidth={2.2} className="text-primary" />
          Részletes nettó-bér bontás (adók, járulékok) <Icon name="chevR" size={14} className="ml-auto text-ink-faint" />
        </Link>
        <Link href="/iranytu" className="flex items-center gap-2 rounded-card border border-line bg-surface px-4 py-3 text-[13px] font-bold text-ink transition active:scale-[0.99]">
          <Icon name="compass" size={15} strokeWidth={2.2} className="text-primary" />
          Jó ez az ajánlat? Nézd meg, mennyit keresnek mások <Icon name="chevR" size={14} className="ml-auto text-ink-faint" />
        </Link>
        {/* A „Mennyit költesz?" kereszt-link 2026-07-11-én kivezetve a modullal együtt. */}
      </section>
    </div>
  );
}

function Row({ label, amount, strong }: { label: string; amount: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={cn("text-[13px]", strong ? "font-bold text-ink" : "text-ink-muted")}>{label}</span>
      <span className={cn("shrink-0 text-[13.5px] font-extrabold", strong ? "text-ink" : "text-ink")}>{amount}</span>
    </div>
  );
}

function CostRow({ label, sub, amount, total, fmt }: { label: string; sub?: string; amount: number; total: number; fmt: (n: number) => string }) {
  const pct = total > 0 ? Math.min(100, Math.round((amount / total) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] text-ink-muted">{label}</span>
          {sub && <span className="block text-[10.5px] text-ink-faint">{sub}</span>}
        </span>
        <span className="shrink-0 text-[13.5px] font-bold text-ink">−{fmt(amount)}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Szerkeszthető költség-sor: az input üresen a becslést mutatja (placeholder),
 *  beírt értékkel (a 0-val is) a SAJÁT összeg számít. */
function EditableCostRow({
  item,
  estimate,
  value,
  onChange,
  total,
  currency,
}: {
  item: BudgetCostItem;
  estimate: number;
  value: string;
  onChange: (v: string) => void;
  total: number;
  currency: "CHF" | "EUR";
}) {
  const pct = total > 0 ? Math.min(100, Math.round((item.amount / total) * 100)) : 0;
  const srcLabel =
    item.source === "user" ? "saját adat"
    : item.source === "community" ? "közösségi medián · átírható"
    : "becslés · átírható";
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] text-ink">{item.emoji} {item.label}</span>
          <span className={cn("block text-[10.5px]", item.source === "user" ? "font-bold text-primary" : "text-ink-faint")}>
            {srcLabel}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="text-[13px] font-bold text-ink-muted">−</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={value}
            placeholder={String(estimate)}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${item.label} havi összege`}
            className="h-9 w-[84px] rounded-lg border border-line bg-surface px-2 text-right text-[13.5px] font-bold text-ink outline-none placeholder:text-ink-faint focus:border-primary/50"
          />
          <span className="text-[12px] font-bold text-ink-muted">{currency === "CHF" ? "CHF" : "€"}</span>
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
