"use client";

import { useState, useEffect, useCallback } from "react";
import { CANTONS } from "@/lib/cantons";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { SalaryCard } from "./SalaryCard";
import { SalaryCalculator, AlertSubscription, RentToSalaryCalculator } from "./SalaryWidgets";
import { SwissHeatmap } from "./SwissHeatmap";

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
interface SalaryStatsRow { industry: string; avg_salary: number; min_salary: number; max_salary: number; entry_count: number; }
interface SalaryExpRow { industry: string; exp_bucket: string; avg_salary: number; entry_count: number; }
interface RentStatsRow { rooms: number; avg_rent: number; min_rent: number; max_rent: number; entry_count: number; }
interface MyData { salary: { cantonCode: string; industry: string; yearsExperience: number; grossSalaryChf: number } | null; rent: { cantonCode: string; rooms: number; rentChf: number } | null; }

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
      const data: any = await res.json();
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

function MyDataCard({ tab, myData, onEdit }: { tab: Tab; myData: MyData; onEdit: () => void }) {
  const s = myData.salary, r = myData.rent;
  if ((tab === "salary" && !s) || (tab === "rent" && !r)) return null;
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-black uppercase tracking-wide text-primary">Saját adatom</p>
        <button onClick={onEdit} className="flex items-center gap-1.5 text-[12px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg hover:opacity-70 transition">✏️ Szerkesztés</button>
      </div>
      {tab === "salary" && s && <div className="space-y-0.5 text-[13px] text-ink">
        <p><span className="text-ink-muted">Kanton:</span> {s.cantonCode} · <span className="text-ink-muted">Iparág:</span> {s.industry}</p>
        <p><span className="text-ink-muted">Tapasztalat:</span> {s.yearsExperience} év · <span className="text-ink-muted">Bér:</span> <strong>{s.grossSalaryChf.toLocaleString("hu-HU")} CHF/év</strong></p>
      </div>}
      {tab === "rent" && r && <div className="space-y-0.5 text-[13px] text-ink">
        <p><span className="text-ink-muted">Kanton:</span> {r.cantonCode} · <span className="text-ink-muted">Szobák:</span> {r.rooms} · <span className="text-ink-muted">Lakbér:</span> <strong>{r.rentChf.toLocaleString("hu-HU")} CHF/hó</strong></p>
      </div>}
    </div>
  );
}

function RentCard({ stat }: { stat: RentStatsRow }) {
  const pct = Math.min(100, Math.round((stat.avg_rent / 5000) * 100));
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-bold text-[14px] text-ink">{stat.rooms} szobás lakás</p>
        <span className="shrink-0 text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{stat.entry_count} adat</span>
      </div>
      <p className="text-[22px] font-extrabold text-ink">{stat.avg_rent.toLocaleString("hu-HU")} <span className="text-[13px] font-normal text-ink-muted">CHF/hó</span></p>
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
      const data: any = await res.json();
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
                    {filtered.map((s, i) => (
                      <SalaryCard key={i} stat={s} expRows={salaryByExp.filter(r => r.industry === s.industry)} canton={canton} />
                    ))}
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
                  {rentStats.map((r, i) => <RentCard key={i} stat={r} />)}
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
