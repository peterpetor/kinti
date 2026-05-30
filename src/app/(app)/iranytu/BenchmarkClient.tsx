"use client";

import { useState, useEffect, useCallback } from "react";
import { CANTONS } from "@/lib/cantons";
import { TurnstileWidget } from "@/components/turnstile-widget";

const INDUSTRIES = [
  "Informatika (IT)",
  "Vendéglátás / Szálloda",
  "Építőipar",
  "Egészségügy / Ápolás",
  "Pénzügy / Bank / Biztosítás",
  "Mérnök / Gyártás",
  "Logisztika / Szállítás",
  "Oktatás / Tudomány",
  "Kereskedelem / Retail",
  "Egyéb",
];

const PERIODS = [
  { value: "3m",  label: "3 hónap" },
  { value: "6m",  label: "6 hónap" },
  { value: "12m", label: "1 év" },
  { value: "all", label: "Összes" },
];

type TabType = "salary" | "rent";
type LockState = { salary: boolean; rent: boolean };

interface SalaryStat {
  industry: string;
  avg_salary: number;
  min_salary: number;
  max_salary: number;
  entry_count: number;
}

interface RentStat {
  rooms: number;
  avg_rent: number;
  min_rent: number;
  max_rent: number;
  entry_count: number;
}

interface MyData {
  salary: { cantonCode: string; industry: string; yearsExperience: number; grossSalaryChf: number } | null;
  rent:   { cantonCode: string; rooms: number; rentChf: number } | null;
}

function Spinner() {
  return (
    <div className="py-16 flex justify-center">
      <div className="animate-spin w-7 h-7 border-[3px] border-primary border-t-transparent rounded-full" />
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition";
const labelCls =
  "block text-[12px] font-bold text-ink-muted mb-1 uppercase tracking-wide";

/** Beküldési / szerkesztési form egy adott tabhoz */
function BenchmarkForm({
  tab,
  mode,
  initialData,
  onSuccess,
  onCancel,
}: {
  tab: TabType;
  mode: "submit" | "edit";
  initialData?: MyData;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const isEdit = mode === "edit";

  // Salary fields
  const [canton, setCanton] = useState(
    tab === "salary" ? (initialData?.salary?.cantonCode ?? "ZH") : (initialData?.rent?.cantonCode ?? "ZH")
  );
  const [industry, setIndustry] = useState(initialData?.salary?.industry ?? INDUSTRIES[0]);
  const [exp, setExp] = useState(initialData?.salary?.yearsExperience ?? 3);
  const [salary, setSalary] = useState(initialData?.salary?.grossSalaryChf ?? 80000);

  // Rent fields
  const [rooms, setRooms] = useState(initialData?.rent?.rooms ?? 3.5);
  const [rent, setRent] = useState(initialData?.rent?.rentChf ?? 1800);

  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) { setError("Igazold, hogy nem vagy robot (CAPTCHA)."); return; }
    setSubmitting(true);

    const payload =
      tab === "salary"
        ? { type: "salary", cantonCode: canton, industry, yearsExperience: exp, grossSalaryChf: salary, turnstileToken: token }
        : { type: "rent", cantonCode: canton, rooms, rentChf: rent, turnstileToken: token };

    try {
      const res = await fetch("/api/benchmark", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: any = await res.json();
      if (res.ok) {
        onSuccess();
      } else {
        setError(data.error || "Hiba történt.");
      }
    } catch {
      setError("Hálózati hiba.");
    }
    setSubmitting(false);
  }

  return (
    <div className={`rounded-2xl border ${isEdit ? "border-primary/30 bg-primary/5" : "border-line bg-surface"} p-5 space-y-4`}>
      {/* Fejléc */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-xl">
            {tab === "salary" ? "💰" : "🏠"}
          </span>
          <div>
            <p className="text-[15px] font-bold text-ink">
              {isEdit
                ? (tab === "salary" ? "Béradatom szerkesztése" : "Lakbéradatom szerkesztése")
                : (tab === "salary" ? "Add meg a béredet" : "Add meg a lakbéredet")}
            </p>
            <p className="text-[12px] text-ink-muted">
              {isEdit ? "Az adatod módosítása azonnal frissíti a statisztikát" : "Teljesen anonim · csak te látod az adatod"}
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-ink-faint hover:text-ink text-[13px] font-medium transition-colors px-2 py-1"
          >
            Mégse
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelCls}>Kanton</label>
          <select value={canton} onChange={(e) => setCanton(e.target.value)} className={inputCls}>
            {CANTONS.map((c) => (
              <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>

        {tab === "salary" ? (
          <>
            <div>
              <label className={labelCls}>Iparág</label>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputCls}>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tapasztalat (évek)</label>
              <input type="number" min={0} max={50} value={exp}
                onChange={(e) => setExp(parseInt(e.target.value) || 0)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Bruttó éves bér (CHF)</label>
              <p className="text-[11px] text-ink-faint mb-1.5">13. havi + bónusszal együtt · pl. 85000</p>
              <input type="number" min={20000} max={300000} step={500} value={salary}
                onChange={(e) => setSalary(parseInt(e.target.value) || 0)} required className={inputCls} />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className={labelCls}>Szobák száma</label>
              <select value={rooms} onChange={(e) => setRooms(parseFloat(e.target.value))} className={inputCls}>
                {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((r) => (
                  <option key={r} value={r}>{r === 1 ? "1 szoba (Stúdió)" : `${r} szoba`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Havi lakbér (CHF)</label>
              <p className="text-[11px] text-ink-faint mb-1.5">Rezsi nélkül (Netto-Mietzins)</p>
              <input type="number" min={300} max={10000} step={50} value={rent}
                onChange={(e) => setRent(parseInt(e.target.value) || 0)} required className={inputCls} />
            </div>
          </>
        )}

        {error && (
          <div className="rounded-xl bg-accent/10 text-accent px-3 py-2 text-[13px] font-medium">
            {error}
          </div>
        )}

        <TurnstileWidget
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onToken={setToken}
        />

        <button
          type="submit"
          disabled={submitting || !token}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-[15px]"
        >
          {submitting ? (
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : isEdit ? (
            <>✏️ Módosítás mentése</>
          ) : (
            <>🔓 Anonim beküldés &amp; feloldás</>
          )}
        </button>
      </form>
    </div>
  );
}

/** Saját adat összegző kártya (szerkesztés gombbal) */
function MyDataCard({ tab, myData, onEdit }: { tab: TabType; myData: MyData; onEdit: () => void }) {
  const s = myData.salary;
  const r = myData.rent;

  if (tab === "salary" && !s) return null;
  if (tab === "rent" && !r) return null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[12px] font-black uppercase tracking-wide text-primary">Saját adatom</p>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-[12px] font-bold text-primary hover:opacity-70 transition-opacity bg-primary/10 px-2.5 py-1 rounded-lg"
        >
          ✏️ Szerkesztés
        </button>
      </div>

      {tab === "salary" && s && (
        <div className="space-y-0.5 text-[13px] text-ink">
          <p><span className="text-ink-muted">Kanton:</span> {s.cantonCode}</p>
          <p><span className="text-ink-muted">Iparág:</span> {s.industry}</p>
          <p><span className="text-ink-muted">Tapasztalat:</span> {s.yearsExperience} év</p>
          <p><span className="text-ink-muted">Éves bér:</span> <strong>{s.grossSalaryChf.toLocaleString("hu-HU")} CHF</strong></p>
        </div>
      )}

      {tab === "rent" && r && (
        <div className="space-y-0.5 text-[13px] text-ink">
          <p><span className="text-ink-muted">Kanton:</span> {r.cantonCode}</p>
          <p><span className="text-ink-muted">Szobák:</span> {r.rooms} szoba</p>
          <p><span className="text-ink-muted">Havi lakbér:</span> <strong>{r.rentChf.toLocaleString("hu-HU")} CHF</strong></p>
        </div>
      )}
    </div>
  );
}

/** Statisztika-kártya */
function StatCard({ title, badge, avg, min, max, maxValue }: {
  title: string; badge: string; avg: number; min: number; max: number; maxValue: number;
}) {
  const pct = Math.min(100, Math.round((avg / maxValue) * 100));
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="font-bold text-[14px] text-ink leading-snug">{title}</p>
        <span className="shrink-0 text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
          {badge}
        </span>
      </div>
      <p className="text-[22px] font-extrabold text-ink tracking-tight">
        {avg.toLocaleString("hu-HU")} <span className="text-[13px] font-normal text-ink-muted">CHF</span>
      </p>
      <div className="mt-2 h-2 rounded-full bg-surface-alt overflow-hidden">
        <div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[11px] text-ink-faint mt-1.5">
        <span>Min {min.toLocaleString("hu-HU")}</span>
        <span>Max {max.toLocaleString("hu-HU")}</span>
      </div>
    </div>
  );
}

export default function BenchmarkClient() {
  const [lock, setLock] = useState<LockState>({ salary: true, rent: true });
  const [myData, setMyData] = useState<MyData>({ salary: null, rent: null });
  const [loading, setLoading] = useState(true);
  const [salaryStats, setSalaryStats] = useState<SalaryStat[]>([]);
  const [rentStats, setRentStats] = useState<RentStat[]>([]);

  const [activeTab, setActiveTab] = useState<TabType>("salary");
  const [canton, setCanton] = useState("all");
  const [period, setPeriod] = useState("12m");
  const [search, setSearch] = useState("");

  // Szerkesztési mód per tab
  const [editingTab, setEditingTab] = useState<TabType | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/benchmark?canton=${canton}&period=${period}`);
      const data: any = await res.json();
      if (data.locked) setLock(data.locked);
      if (data.myData) setMyData(data.myData);
      if (data.salary) setSalaryStats(data.salary);
      if (data.rent)   setRentStats(data.rent);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [canton, period]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "salary", label: "Bérek", icon: "💰" },
    { id: "rent",   label: "Lakbérek", icon: "🏠" },
  ];

  const isCurrentLocked = lock[activeTab];
  const isEditing = editingTab === activeTab;

  const filteredSalary = salaryStats.filter((s) =>
    s.industry.toLowerCase().includes(search.toLowerCase())
  );

  function handleEditSuccess() {
    setEditingTab(null);
    fetchStats();
  }

  return (
    <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-card">

      {/* Tab sor */}
      <div className="flex border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setEditingTab(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[14px] font-bold transition-colors
              ${activeTab === t.id
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-ink-muted hover:text-ink"}`}
          >
            <span>{t.icon}</span>
            {t.label}
            {lock[t.id] && (
              <span className="ml-1 text-[11px] bg-surface-alt text-ink-faint px-1.5 py-0.5 rounded-full font-normal">🔒</span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">

        {/* Ha az aktív tab zárolva van → beküldési form */}
        {isCurrentLocked ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-[13px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <span className="text-base mt-0.5">🔐</span>
              <span>
                {activeTab === "salary"
                  ? "Küld be a béredet, hogy lásd, mások mennyit keresnek a szakmádban!"
                  : "Küld be a lakbéredet, hogy lásd a kantonos átlagokat!"}
              </span>
            </div>
            <BenchmarkForm
              tab={activeTab}
              mode="submit"
              onSuccess={fetchStats}
            />
          </div>
        ) : (
          <>
            {/* Szerkesztési mód */}
            {isEditing ? (
              <BenchmarkForm
                tab={activeTab}
                mode="edit"
                initialData={myData}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingTab(null)}
              />
            ) : (
              /* Saját adat kártya */
              <MyDataCard
                tab={activeTab}
                myData={myData}
                onEdit={() => setEditingTab(activeTab)}
              />
            )}

            {/* Szűrők */}
            {!isEditing && (
              <div className="space-y-2">
                {activeTab === "salary" && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-sm">🔍</span>
                    <input
                      type="search"
                      placeholder="Iparág keresése…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-xl border border-line bg-surface-alt pl-8 pr-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                    />
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <select
                    value={canton}
                    onChange={(e) => setCanton(e.target.value)}
                    className="flex-1 min-w-0 rounded-xl border border-line bg-surface-alt px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  >
                    <option value="all">🇨🇭 Egész Svájc</option>
                    {CANTONS.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>

                  <div className="flex rounded-xl border border-line overflow-hidden shrink-0">
                    {PERIODS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className={`px-3 py-2 text-[12px] font-bold transition-colors
                          ${period === p.value
                            ? "bg-primary text-white"
                            : "bg-surface-alt text-ink-muted hover:text-ink"}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Statisztikák */}
            {!isEditing && (
              loading ? (
                <Spinner />
              ) : activeTab === "salary" ? (
                filteredSalary.length === 0 ? (
                  <div className="py-10 text-center text-ink-muted text-[14px]">
                    {search ? "Nincs találat." : "Nincs elég adat ebben az időszakban."}
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredSalary.map((s, i) => (
                      <StatCard key={i} title={s.industry} badge={`${s.entry_count} adat`}
                        avg={s.avg_salary} min={s.min_salary} max={s.max_salary} maxValue={200000} />
                    ))}
                  </div>
                )
              ) : (
                rentStats.length === 0 ? (
                  <div className="py-10 text-center text-ink-muted text-[14px]">
                    Nincs elég adat ebben az időszakban.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {rentStats.map((r, i) => (
                      <StatCard key={i} title={`${r.rooms} szobás lakás`} badge={`${r.entry_count} adat`}
                        avg={r.avg_rent} min={r.min_rent} max={r.max_rent} maxValue={5000} />
                    ))}
                  </div>
                )
              )
            )}

            {/* Másik tab ösztönzés */}
            {!isEditing && lock[activeTab === "salary" ? "rent" : "salary"] && (
              <div className="border-t border-line pt-4">
                <p className="text-[12px] text-ink-faint text-center">
                  A {activeTab === "salary" ? "🏠 Lakbérek" : "💰 Bérek"} fül még nincs feloldva.
                  Küld be a {activeTab === "salary" ? "lakbéredet" : "béredet"} is a teljes képhez!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
