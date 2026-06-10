"use client";

import { useState, useEffect, useCallback } from "react";
import { CANTONS } from "@/lib/cantons";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { SalaryCard } from "./SalaryCard";
import { SalaryCalculator, AlertSubscription, RentToSalaryCalculator } from "./SalaryWidgets";
import { SwissHeatmap } from "./SwissHeatmap";
import { salaryStanding, rentStanding, type SalaryStanding } from "@/lib/benchmark-stats";

const INDUSTRIES = [
  "Informatika (IT)", "Vendéglátás / Szálloda", "Építőipar",
  "Egészségügy / Ápolás", "Pénzügy / Bank / Biztosítás", "Mérnök / Gyártás",
  "Logisztika / Szállítás", "Oktatás / Tudomány", "Kereskedelem / Retail", "Egyéb",
];
const PERIODS = [
  { value: "3m", label: "3 hó" }, { value: "6m", label: "6 hó" },
  { value: "12m", label: "1 év" }, { value: "all", label: "Összes" },
];

type Tab = "salary" | "rent";
interface SalaryStatsRow { industry: string; avg_salary: number; median_salary: number; min_salary: number; max_salary: number; entry_count: number; }
interface SalaryExpRow { industry: string; exp_bucket: string; avg_salary: number; entry_count: number; }
interface RentStatsRow { rooms: number; avg_rent: number; median_rent: number; min_rent: number; max_rent: number; entry_count: number; }
interface MyData {
  salary: { cantonCode: string; industry: string; yearsExperience: number; grossSalaryChf: number; lastUpdatedAt: string | null } | null;
  rent:   { cantonCode: string; rooms: number; rentChf: number; lastUpdatedAt: string | null } | null;
}

/** 6+ hónapos adat → elavult. */
const STALE_THRESHOLD_MS = 6 * 30 * 24 * 60 * 60 * 1000;
/** Statisztikához kell minimum 3 adat. */
const MIN_ENTRIES_FOR_STATS = 3;

function isoToMs(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z")).getTime();
  return Number.isNaN(t) ? null : t;
}
function monthsSince(iso: string | null): number | null {
  const t = isoToMs(iso);
  return t === null ? null : Math.floor((Date.now() - t) / (30 * 24 * 60 * 60 * 1000));
}
function isStale(iso: string | null): boolean {
  const t = isoToMs(iso);
  return t !== null && Date.now() - t >= STALE_THRESHOLD_MS;
}

const inputCls = "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 transition";
const labelCls = "block text-[11px] font-bold text-ink-muted mb-1 uppercase tracking-wide";

function Spinner() {
  return <div className="py-14 flex justify-center"><div className="animate-spin w-7 h-7 border-[3px] border-primary border-t-transparent rounded-full" /></div>;
}

function SubmitForm({ tab, mode, initialData, onSuccess, onCancel, turnstileSiteKey }: {
  tab: Tab; mode: "submit" | "edit"; initialData?: MyData; onSuccess: () => void; onCancel?: () => void; turnstileSiteKey: string;
}) {
  const isEdit = mode === "edit";
  const [canton, setCanton] = useState(tab === "salary" ? (initialData?.salary?.cantonCode ?? "ZH") : (initialData?.rent?.cantonCode ?? "ZH"));
  const [industry, setIndustry] = useState(initialData?.salary?.industry ?? INDUSTRIES[0]);
  const [exp, setExp] = useState(initialData?.salary?.yearsExperience ?? 3);
  const [salary, setSalary] = useState(initialData?.salary?.grossSalaryChf ?? 80000);
  const [rooms, setRooms] = useState(initialData?.rent?.rooms ?? 3.5);
  const [rent, setRent] = useState(initialData?.rent?.rentChf ?? 1800);
  const [token, setToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) { setError("CAPTCHA szükséges."); return; }
    setSubmitting(true); setError(null);
    const payload = tab === "salary"
      ? { type: "salary", cantonCode: canton, industry, yearsExperience: exp, grossSalaryChf: salary, turnstileToken: token }
      : { type: "rent", cantonCode: canton, rooms, rentChf: rent, turnstileToken: token };
    try {
      const res = await fetch("/api/benchmark", { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json() as { error?: string };
      res.ok ? onSuccess() : setError(data.error || "Hiba.");
    } catch { setError("Hálózati hiba."); }
    setSubmitting(false);
  }

  return (
    <div className={`rounded-2xl border ${isEdit ? "border-primary/30 bg-primary/5" : "border-line bg-surface"} p-5 space-y-3`}>
      <div className="flex items-center justify-between">
        <p className="font-bold text-[15px] text-ink">{isEdit ? (tab === "salary" ? "Béradat szerkesztése" : "Lakbéradat szerkesztése") : (tab === "salary" ? "Add meg a béredet" : "Add meg a lakbéredet")}</p>
        {onCancel && <button onClick={onCancel} className="text-[12px] text-ink-faint hover:text-ink">Mégse</button>}
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div><label className={labelCls}>Kanton</label>
          <select value={canton} onChange={e => setCanton(e.target.value)} className={inputCls}>
            {CANTONS.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
          </select>
        </div>
        {tab === "salary" ? (<>
          <div><label className={labelCls}>Iparág</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)} className={inputCls}>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Tapasztalat (év)</label><input type="number" min={0} max={50} value={exp} onChange={e => setExp(parseInt(e.target.value) || 0)} className={inputCls} /></div>
          <div><label className={labelCls}>Bruttó éves bér (CHF)</label><input type="number" min={20000} max={300000} step={500} value={salary} onChange={e => setSalary(parseInt(e.target.value) || 0)} required className={inputCls} /></div>
        </>) : (<>
          <div><label className={labelCls}>Szobák száma</label>
            <select value={rooms} onChange={e => setRooms(parseFloat(e.target.value))} className={inputCls}>
              {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(r => <option key={r} value={r}>{r === 1 ? "1 szoba (Stúdió)" : `${r} szoba`}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Havi lakbér (CHF)</label><input type="number" min={300} max={10000} step={50} value={rent} onChange={e => setRent(parseInt(e.target.value) || 0)} required className={inputCls} /></div>
        </>)}
        {error && <p className="text-[13px] text-accent font-medium rounded-xl bg-accent/10 px-3 py-2">{error}</p>}
        <TurnstileWidget siteKey={turnstileSiteKey} onToken={setToken} />
        <button type="submit" disabled={submitting || !token} className="w-full bg-primary hover:opacity-90 text-white font-bold py-3 rounded-xl transition disabled:opacity-40 text-[15px]">
          {submitting ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block" /> : isEdit ? "✏️ Módosítás mentése" : "🔓 Anonim beküldés & feloldás"}
        </button>
      </form>
    </div>
  );
}

/** „Hol állsz?" — a saját bér percentilis pozíciója a kanton+iparág eloszlásában. */
function SalaryStandingInsight({ cantonCode, industry, salary }: { cantonCode: string; industry: string; salary: number }) {
  const [standing, setStanding] = useState<SalaryStanding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/benchmark/histogram?industry=${encodeURIComponent(industry)}&canton=${cantonCode}`);
        const data = await res.json() as { histogram?: Parameters<typeof salaryStanding>[0] };
        const s = salaryStanding(data.histogram ?? [], salary);
        // Adatvédelem/megbízhatóság: 3+ adat alatt nem pozicionálunk.
        if (alive) setStanding(s && s.total >= MIN_ENTRIES_FOR_STATS ? s : null);
      } catch {
        if (alive) setStanding(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [cantonCode, industry, salary]);

  if (loading || !standing) return null;

  const cantonName = CANTONS.find((c) => c.code === cantonCode)?.name ?? cantonCode;
  const topPct = Math.max(1, 100 - standing.percentile);
  const highEarner = standing.percentile >= 50;

  return (
    <div className="mt-2.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
      <p className="text-[12.5px] font-bold text-primary leading-snug">
        {highEarner ? `📈 A béred a felső ${topPct}%-ban van` : "📊 Hol állsz a mezőnyben"} · {industry}, {cantonName}
      </p>
      <p className="mt-0.5 text-[11px] text-ink-muted leading-snug">
        Többet keresel, mint a beküldők <strong className="text-ink">{standing.percentile}%</strong>-a{" "}
        <span className="text-ink-faint">({standing.total} adat alapján)</span>.
      </p>
    </div>
  );
}

/** „Hol állsz?" — a saját lakbér pozíciója a kanton+szobaszám eloszlásában (kevesebb = jobb). */
function RentStandingInsight({ cantonCode, rooms, rent }: { cantonCode: string; rooms: number; rent: number }) {
  const [standing, setStanding] = useState<SalaryStanding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/benchmark/rent-histogram?rooms=${rooms}&canton=${cantonCode}`);
        const data = await res.json() as { histogram?: Parameters<typeof rentStanding>[0] };
        const s = rentStanding(data.histogram ?? [], rent);
        if (alive) setStanding(s && s.total >= MIN_ENTRIES_FOR_STATS ? s : null);
      } catch {
        if (alive) setStanding(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [cantonCode, rooms, rent]);

  if (loading || !standing) return null;

  const cantonName = CANTONS.find((c) => c.code === cantonCode)?.name ?? cantonCode;
  // Lakbérnél a KEVESEBB a kedvező. percentile = % aki nálad kevesebbet fizet,
  // tehát cheaperThan = % aki nálad TÖBBET fizet (te olcsóbban laksz náluk).
  const cheaperThan = 100 - standing.percentile;
  const goodDeal = standing.percentile <= 50;

  return (
    <div className="mt-2.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
      <p className="text-[12.5px] font-bold text-primary leading-snug">
        {goodDeal ? "🏠 Kedvező lakbér" : "🏠 Hol állsz a lakbér-mezőnyben"} · {rooms} szoba, {cantonName}
      </p>
      <p className="mt-0.5 text-[11px] text-ink-muted leading-snug">
        {goodDeal ? (
          <>Olcsóbban laksz, mint a beküldők <strong className="text-ink">{cheaperThan}%</strong>-a</>
        ) : (
          <>Többet fizetsz, mint a beküldők <strong className="text-ink">{standing.percentile}%</strong>-a</>
        )}{" "}
        <span className="text-ink-faint">({standing.total} adat alapján)</span>.
      </p>
    </div>
  );
}

function MyDataCard({ tab, myData, onEdit }: { tab: Tab; myData: MyData; onEdit: () => void }) {
  const s = myData.salary, r = myData.rent;
  if ((tab === "salary" && !s) || (tab === "rent" && !r)) return null;

  const lastUpdated = tab === "salary" ? s?.lastUpdatedAt ?? null : r?.lastUpdatedAt ?? null;
  const stale = isStale(lastUpdated);
  const ageMonths = monthsSince(lastUpdated);

  return (
    <div className="space-y-2">
      {/* Sárga banner ha 6+ hónapos */}
      {stale && ageMonths !== null && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-[13px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <span className="text-base mt-0.5">⚠️</span>
          <div className="flex-1">
            <strong>Az adatod {ageMonths} hónapos.</strong>{" "}
            Frissítsd, hogy pontos legyen a statisztika! A béred / lakbéred változhatott azóta.
            <button
              onClick={onEdit}
              className="block mt-1.5 text-[12px] font-bold text-amber-900 dark:text-amber-100 underline hover:opacity-70"
            >
              Frissítem most →
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-black uppercase tracking-wide text-primary">Saját adatom</p>
          <button onClick={onEdit} className="flex items-center gap-1.5 text-[12px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg hover:opacity-70 transition">✏️ Szerkesztés</button>
        </div>
        {tab === "salary" && s && <div className="space-y-0.5 text-[13px] text-ink">
          <p><span className="text-ink-muted">Kanton:</span> {s.cantonCode} · <span className="text-ink-muted">Iparág:</span> {s.industry}</p>
          <p><span className="text-ink-muted">Tapasztalat:</span> {s.yearsExperience} év · <span className="text-ink-muted">Bér:</span> <strong>{s.grossSalaryChf.toLocaleString("hu-HU")} CHF/év</strong></p>
          {ageMonths !== null && (
            <p className="text-[11px] text-ink-faint pt-1">Utolsó frissítés: {ageMonths === 0 ? "kevesebb mint 1 hónapja" : `${ageMonths} hónapja`}</p>
          )}
          <SalaryStandingInsight cantonCode={s.cantonCode} industry={s.industry} salary={s.grossSalaryChf} />
        </div>}
        {tab === "rent" && r && <div className="space-y-0.5 text-[13px] text-ink">
          <p><span className="text-ink-muted">Kanton:</span> {r.cantonCode} · <span className="text-ink-muted">Szobák:</span> {r.rooms} · <span className="text-ink-muted">Lakbér:</span> <strong>{r.rentChf.toLocaleString("hu-HU")} CHF/hó</strong></p>
          {ageMonths !== null && (
            <p className="text-[11px] text-ink-faint pt-1">Utolsó frissítés: {ageMonths === 0 ? "kevesebb mint 1 hónapja" : `${ageMonths} hónapja`}</p>
          )}
          <RentStandingInsight cantonCode={r.cantonCode} rooms={r.rooms} rent={r.rentChf} />
        </div>}
      </div>
    </div>
  );
}

/** Minimum-küszöb alatti kártya: < 3 adat esetén nem mutatunk konkrét számot. */
function LowDataCard({ title, count }: { title: string; count: number }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface-alt/40 p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-bold text-[14px] text-ink leading-snug">{title}</p>
        <span className="shrink-0 text-[11px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full whitespace-nowrap">
          {count} adat
        </span>
      </div>
      <p className="text-[12.5px] text-ink-muted leading-snug">
        {count === 1
          ? "Még csak 1 adat — legyél te a második!"
          : `Még csak ${count} adat — kell még ${MIN_ENTRIES_FOR_STATS - count} a megbízható statisztikához.`}
      </p>
      <p className="mt-1 text-[11px] text-ink-faint">
        Az adatvédelem érdekében 3+ beküldés alatt nem mutatunk konkrét számot.
      </p>
    </div>
  );
}

function RentCard({ stat }: { stat: RentStatsRow }) {
  const pct = Math.min(100, Math.round((stat.avg_rent / 5000) * 100));
  // Ha avg/median > 10%-kal eltér → kiugró adat
  const skewed = stat.median_rent > 0 && Math.abs(stat.avg_rent - stat.median_rent) / stat.median_rent > 0.1;
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-bold text-[14px] text-ink">{stat.rooms} szobás lakás</p>
        <span className="shrink-0 text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{stat.entry_count} adat</span>
      </div>
      {/* Medián (kiemelt — reprezentatívabb) */}
      <p className="text-[22px] font-extrabold text-ink">{stat.median_rent.toLocaleString("hu-HU")} <span className="text-[13px] font-normal text-ink-muted">CHF/hó</span></p>
      <p className="text-[10.5px] font-bold uppercase tracking-wide text-primary/70 mt-0.5">Medián (középérték)</p>
      <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-ink-muted">
        <span>Átlag:</span>
        <strong className="text-ink">{stat.avg_rent.toLocaleString("hu-HU")} CHF</strong>
        {skewed && (
          <span title="Az átlag jelentősen eltér a mediántól — kiugró adat torzíthatja" className="text-[10px] text-amber-600 dark:text-amber-400">⚠ eltérés</span>
        )}
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-surface-alt overflow-hidden">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[11px] text-ink-faint mt-1"><span>Min {stat.min_rent.toLocaleString("hu-HU")}</span><span>Max {stat.max_rent.toLocaleString("hu-HU")}</span></div>
    </div>
  );
}

export default function BenchmarkClient({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [lock, setLock] = useState({ salary: true, rent: true });
  const [myData, setMyData] = useState<MyData>({ salary: null, rent: null });
  const [loading, setLoading] = useState(true);
  const [salaryStats, setSalaryStats] = useState<SalaryStatsRow[]>([]);
  const [salaryByExp, setSalaryByExp] = useState<SalaryExpRow[]>([]);
  const [rentStats, setRentStats] = useState<RentStatsRow[]>([]);
  const [tab, setTab] = useState<Tab>("salary");
  const [canton, setCanton] = useState("all");
  const [period, setPeriod] = useState("12m");
  const [search, setSearch] = useState("");
  const [editingTab, setEditingTab] = useState<Tab | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/benchmark?canton=${canton}&period=${period}`);
      const data = await res.json() as {
        locked?: Parameters<typeof setLock>[0];
        myData?: Parameters<typeof setMyData>[0];
        salary?: Parameters<typeof setSalaryStats>[0];
        salaryByExp?: Parameters<typeof setSalaryByExp>[0];
        rent?: Parameters<typeof setRentStats>[0];
      };
      if (data.locked) setLock(data.locked);
      if (data.myData) setMyData(data.myData);
      if (data.salary) setSalaryStats(data.salary);
      if (data.salaryByExp) setSalaryByExp(data.salaryByExp);
      if (data.rent) setRentStats(data.rent);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [canton, period]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const isLocked = lock[tab];
  const isEditing = editingTab === tab;
  const filtered = salaryStats.filter(s => s.industry.toLowerCase().includes(search.toLowerCase()));
  const topIndustry = salaryStats[0];

  return (
    <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-card">
      {/* Tabs */}
      <div className="flex border-b border-line">
        {(["salary", "rent"] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setEditingTab(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[14px] font-bold transition-colors ${tab === t ? "text-primary border-b-2 border-primary bg-primary/5" : "text-ink-muted hover:text-ink"}`}>
            {t === "salary" ? "💰 Bérek" : "🏠 Lakbérek"}
            {lock[t] && <span className="text-[10px] bg-surface-alt text-ink-faint px-1.5 py-0.5 rounded-full font-normal">🔒</span>}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {isLocked ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 px-4 py-3 text-[13px] text-amber-800 flex items-start gap-2">
              <span className="mt-0.5">🔐</span>
              <span>{tab === "salary" ? "Küld be a béredet a statisztikák feloldásához!" : "Küld be a lakbéredet a statisztikák feloldásához!"}</span>
            </div>
            <SubmitForm tab={tab} mode="submit" onSuccess={fetchStats} turnstileSiteKey={turnstileSiteKey} />
          </div>
        ) : (
          <>
            {isEditing ? (
              <SubmitForm tab={tab} mode="edit" initialData={myData} onSuccess={() => { setEditingTab(null); fetchStats(); }} onCancel={() => setEditingTab(null)} turnstileSiteKey={turnstileSiteKey} />
            ) : (
              <MyDataCard tab={tab} myData={myData} onEdit={() => setEditingTab(tab)} />
            )}

            {!isEditing && (
              <div className="space-y-2">
                {tab === "salary" && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">🔍</span>
                    <input type="search" placeholder="Iparág keresése…" value={search} onChange={e => setSearch(e.target.value)}
                      className="w-full rounded-xl border border-line bg-surface-alt pl-8 pr-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/40 transition" />
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  <select value={canton} onChange={e => setCanton(e.target.value)}
                    className="flex-1 min-w-0 rounded-xl border border-line bg-surface-alt px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 transition">
                    <option value="all">🇨🇭 Egész Svájc</option>
                    {CANTONS.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                  <div className="flex rounded-xl border border-line overflow-hidden shrink-0">
                    {PERIODS.map(p => (
                      <button key={p.value} onClick={() => setPeriod(p.value)}
                        className={`px-3 py-2 text-[12px] font-bold transition-colors ${period === p.value ? "bg-primary text-white" : "bg-surface-alt text-ink-muted hover:text-ink"}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!isEditing && (loading ? <Spinner /> : tab === "salary" ? (
              <div className="space-y-4">
                {filtered.length === 0 ? (
                  <p className="py-10 text-center text-ink-muted text-[14px]">{search ? "Nincs találat." : "Nincs elég adat."}</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filtered.map((s, i) =>
                      s.entry_count < MIN_ENTRIES_FOR_STATS ? (
                        <LowDataCard key={i} title={s.industry} count={s.entry_count} />
                      ) : (
                        <SalaryCard key={i} stat={s} expRows={salaryByExp.filter(r => r.industry === s.industry)} canton={canton} />
                      ),
                    )}
                  </div>
                )}
                {/* Hőtérkép */}
                <SwissHeatmap industry={search || "all"} period={period} />
                
                {/* Kalkulátor */}
                {salaryByExp.length > 0 && <SalaryCalculator salaryByExp={salaryByExp} />}
                {/* Email értesítés */}
                <AlertSubscription defaultIndustry={topIndustry?.industry} defaultAvg={topIndustry?.avg_salary} turnstileSiteKey={turnstileSiteKey} />
              </div>
            ) : (
              rentStats.length === 0 ? (
                <p className="py-10 text-center text-ink-muted text-[14px]">Nincs elég adat.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {rentStats.map((r, i) =>
                    r.entry_count < MIN_ENTRIES_FOR_STATS ? (
                      <LowDataCard key={i} title={`${r.rooms} szobás lakás`} count={r.entry_count} />
                    ) : (
                      <RentCard key={i} stat={r} />
                    ),
                  )}
                </div>
              )
            ))}

            {/* Bér vs Lakbér arány - Mindkét fülön látszik, ha már beküldött valamit */}
            {!isEditing && (
              <RentToSalaryCalculator 
                canton={canton} 
                mySalary={myData?.salary?.grossSalaryChf} 
                myRent={myData?.rent?.rentChf} 
              />
            )}

            {!isEditing && lock[tab === "salary" ? "rent" : "salary"] && (
              <div className="border-t border-line pt-3 text-center">
                <p className="text-[12px] text-ink-faint">
                  {tab === "salary" ? "🏠 Lakbérek" : "💰 Bérek"} fül még zárolt — küld be a {tab === "salary" ? "lakbéredet" : "béredet"} is!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
