"use client";

import { useState, useEffect } from "react";
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
  "Egyéb"
];

export default function BenchmarkClient() {
  const [locked, setLocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [salaryStats, setSalaryStats] = useState<any[]>([]);
  const [rentStats, setRentStats] = useState<any[]>([]);
  const [cantonFilter, setCantonFilter] = useState("all");

  const [activeTab, setActiveTab] = useState<"salary" | "rent">("salary");
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Form states
  const [formCanton, setFormCanton] = useState("ZH");
  const [formIndustry, setFormIndustry] = useState(INDUSTRIES[0]);
  const [formExp, setFormExp] = useState(3);
  const [formSalary, setFormSalary] = useState(80000);

  const [formRooms, setFormRooms] = useState(3.5);
  const [formRent, setFormRent] = useState(1800);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [cantonFilter]);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch(`/api/benchmark?canton=${cantonFilter}`);
      const data: any = await res.json();
      if (data.locked) {
        setLocked(true);
      } else {
        setLocked(false);
        setSalaryStats(data.salary || []);
        setRentStats(data.rent || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!turnstileToken) {
      setErrorMsg("Kérjük, igazold, hogy nem vagy robot (CAPTCHA).");
      return;
    }
    setSubmitting(true);

    const payload = activeTab === "salary" 
      ? { type: "salary", cantonCode: formCanton, industry: formIndustry, yearsExperience: formExp, grossSalaryChf: formSalary, turnstileToken }
      : { type: "rent", cantonCode: formCanton, rooms: formRooms, rentChf: formRent, turnstileToken };

    try {
      const res = await fetch("/api/benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data: any = await res.json();
      
      if (res.ok) {
        setLocked(false);
        fetchStats(); // Refresh stats immediately
      } else {
        setErrorMsg(data.error || "Hiba történt a beküldés során.");
      }
    } catch (err) {
      setErrorMsg("Hálózati hiba történt.");
    }
    setSubmitting(false);
  }

  if (loading && locked) {
    return <div className="flex justify-center p-10"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
      
      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button 
          onClick={() => setActiveTab("salary")}
          className={`flex-1 py-4 text-center font-semibold text-lg transition-colors ${activeTab === "salary" ? "text-primary border-b-2 border-primary dark:text-primary-soft dark:border-primary bg-primary/5 dark:bg-primary/10" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
        >
          💰 Fizetések (Bérek)
        </button>
        <button 
          onClick={() => setActiveTab("rent")}
          className={`flex-1 py-4 text-center font-semibold text-lg transition-colors ${activeTab === "rent" ? "text-primary border-b-2 border-primary dark:text-primary-soft dark:border-primary bg-primary/5 dark:bg-primary/10" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
        >
          🏠 Lakbérek (Albérlet)
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 md:p-10">
        
        {locked ? (
          // DATAWALL: The user must submit data
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-3 mb-8">
              <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-soft rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Statisztikák Feloldása</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Lásd, mennyit keresnek vagy fizetnek albérletre a svájci magyarok! 
                <strong> Add meg a saját adataidat (teljesen anonim), és cserébe azonnal hozzáférsz az összes közösségi statisztikához.</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-xl border border-neutral-100 dark:border-neutral-800">
              {activeTab === "salary" ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Kanton (Munkavégzés helye)</label>
                      <select value={formCanton} onChange={e => setFormCanton(e.target.value)} className="w-full rounded-lg border-neutral-300 bg-white dark:bg-neutral-900 dark:border-neutral-700 py-2.5 px-3 focus:ring-primary focus:border-primary">
                        {CANTONS.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Iparág</label>
                      <select value={formIndustry} onChange={e => setFormIndustry(e.target.value)} className="w-full rounded-lg border-neutral-300 bg-white dark:bg-neutral-900 dark:border-neutral-700 py-2.5 px-3 focus:ring-primary focus:border-primary">
                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tapasztalat (Szakmában eltöltött évek)</label>
                      <input type="number" min="0" max="50" value={formExp} onChange={e => setFormExp(parseInt(e.target.value)||0)} className="w-full rounded-lg border-neutral-300 bg-white dark:bg-neutral-900 dark:border-neutral-700 py-2.5 px-3 focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Bruttó Éves Bér (CHF) *</label>
                      <p className="text-xs text-neutral-500 mb-2">Példa: 85000. Célbónusszal, 13. havival együtt számolva.</p>
                      <input type="number" min="20000" max="300000" step="500" value={formSalary} onChange={e => setFormSalary(parseInt(e.target.value)||0)} required className="w-full rounded-lg border-neutral-300 bg-white dark:bg-neutral-900 dark:border-neutral-700 py-2.5 px-3 text-lg font-semibold focus:ring-primary focus:border-primary" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Kanton (Lakhely)</label>
                      <select value={formCanton} onChange={e => setFormCanton(e.target.value)} className="w-full rounded-lg border-neutral-300 bg-white dark:bg-neutral-900 dark:border-neutral-700 py-2.5 px-3 focus:ring-primary focus:border-primary">
                        {CANTONS.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Szobák száma</label>
                      <select value={formRooms} onChange={e => setFormRooms(parseFloat(e.target.value))} className="w-full rounded-lg border-neutral-300 bg-white dark:bg-neutral-900 dark:border-neutral-700 py-2.5 px-3 focus:ring-primary focus:border-primary">
                        <option value={1}>1 szoba (Stúdió)</option>
                        <option value={1.5}>1.5 szoba</option>
                        <option value={2}>2 szoba</option>
                        <option value={2.5}>2.5 szoba</option>
                        <option value={3}>3 szoba</option>
                        <option value={3.5}>3.5 szoba</option>
                        <option value={4}>4 szoba</option>
                        <option value={4.5}>4.5 szoba</option>
                        <option value={5}>5+ szoba</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Havi Lakbér (CHF) *</label>
                      <p className="text-xs text-neutral-500 mb-2">Rezsi nélkül (Netto-Mietzins) vagy bruttó, ahogy fizeted.</p>
                      <input type="number" min="300" max="10000" step="50" value={formRent} onChange={e => setFormRent(parseInt(e.target.value)||0)} required className="w-full rounded-lg border-neutral-300 bg-white dark:bg-neutral-900 dark:border-neutral-700 py-2.5 px-3 text-lg font-semibold focus:ring-primary focus:border-primary" />
                    </div>
                  </div>
                </>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {errorMsg}
                </div>
              )}

              <TurnstileWidget siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} onToken={setTurnstileToken} />

              <button disabled={submitting || !turnstileToken} type="submit" className="w-full flex items-center justify-center space-x-2 bg-primary hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? (
                   <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <span>Anonim Beküldés & Feloldás</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          // UNLOCKED VIEW: Show the actual stats
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
              <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3 sm:mb-0">
                Szűrés kanton szerint:
              </div>
              <select 
                value={cantonFilter} 
                onChange={e => setCantonFilter(e.target.value)} 
                className="w-full sm:w-64 rounded-lg border-neutral-300 bg-white dark:bg-neutral-900 dark:border-neutral-700 py-2 px-3 focus:ring-primary focus:border-primary"
              >
                <option value="all">🇨🇭 Egész Svájc (Összesített)</option>
                {CANTONS.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
              </select>
            </div>

            {loading && <div className="py-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>}
            
            {!loading && activeTab === "salary" && (
              <div className="space-y-4">
                {salaryStats.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500">Még nincs elég adat ehhez a kantonhoz. Légy te az első, aki kitölti!</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {salaryStats.map((stat, i) => (
                      <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 hover:border-primary/50 dark:hover:border-primary/50 transition-colors shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-lg">{stat.industry}</h3>
                          <span className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-soft text-xs font-bold px-2.5 py-1 rounded-full">
                            {stat.entry_count} adat
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-neutral-500">Átlagos bruttó bér (CHF)</span>
                            <span className="font-bold text-primary dark:text-primary-soft text-lg">{stat.avg_salary.toLocaleString("hu-HU")}</span>
                          </div>
                          <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                             {/* Simple visual bar based on 200k max */}
                             <div className="bg-primary h-2.5 rounded-full" style={{ width: `${Math.min(100, (stat.avg_salary / 150000) * 100)}%` }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-neutral-400 pt-1">
                            <span>Min: {stat.min_salary.toLocaleString("hu-HU")}</span>
                            <span>Max: {stat.max_salary.toLocaleString("hu-HU")}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!loading && activeTab === "rent" && (
              <div className="space-y-4">
                {rentStats.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500">Még nincs elég adat ehhez a kantonhoz. Légy te az első, aki kitölti!</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {rentStats.map((stat, i) => (
                      <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 hover:border-primary/50 dark:hover:border-primary/50 transition-colors shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-lg">{stat.rooms} szobás lakás</h3>
                          <span className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-soft text-xs font-bold px-2.5 py-1 rounded-full">
                            {stat.entry_count} adat
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-neutral-500">Átlagos lakbér (CHF)</span>
                            <span className="font-bold text-primary dark:text-primary-soft text-lg">{stat.avg_rent.toLocaleString("hu-HU")}</span>
                          </div>
                          <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                             {/* Simple visual bar based on 4000 max */}
                             <div className="bg-primary h-2.5 rounded-full" style={{ width: `${Math.min(100, (stat.avg_rent / 4000) * 100)}%` }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-neutral-400 pt-1">
                            <span>Min: {stat.min_rent.toLocaleString("hu-HU")}</span>
                            <span>Max: {stat.max_rent.toLocaleString("hu-HU")}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
