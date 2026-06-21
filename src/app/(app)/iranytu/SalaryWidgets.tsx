"use client";

import { useState, useEffect } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { CANTONS } from "@/lib/cantons";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/push-keys";

const INDUSTRIES = [
  "Informatika (IT)", "Vendéglátás / Szálloda", "Építőipar",
  "Egészségügy / Ápolás", "Pénzügy / Bank / Biztosítás", "Mérnök / Gyártás",
  "Logisztika / Szállítás", "Oktatás / Tudomány", "Kereskedelem / Retail", "Egyéb",
];

interface SalaryExpRow { industry: string; exp_bucket: string; avg_salary: number; entry_count: number; }

/** "Mennyit kapnék?" kalkulátor — kliens-oldali összehasonlítás */
export function SalaryCalculator({ salaryByExp }: { salaryByExp: SalaryExpRow[] }) {
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [exp, setExp] = useState(3);
  const [mySalary, setMySalary] = useState(80000);

  const bucket = exp <= 2 ? "0–2 év" : exp <= 5 ? "3–5 év" : "5+ év";
  const match = salaryByExp.find(r => r.industry === industry && r.exp_bucket === bucket);
  const avg = match?.avg_salary ?? null;
  const diff = avg ? Math.round(((mySalary - avg) / avg) * 100) : null;

  const inputCls = "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 transition";

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🧮</span>
        <div>
          <p className="font-bold text-[15px] text-ink">Mennyit kapnék?</p>
          <p className="text-[12px] text-ink-muted">Hasonlítsd össze a béredet a közösség átlagával</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-ink-muted mb-1 uppercase tracking-wide">Iparág</label>
          <select value={industry} onChange={e => setIndustry(e.target.value)} className={inputCls}>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-ink-muted mb-1 uppercase tracking-wide">Tapasztalat</label>
          <input type="number" min={0} max={40} value={exp}
            onChange={e => setExp(parseInt(e.target.value) || 0)}
            className={inputCls} />
        </div>
        <div className="col-span-2">
          <label className="block text-[11px] font-bold text-ink-muted mb-1 uppercase tracking-wide">Az én bruttó éves bérem (CHF)</label>
          <input type="number" min={20000} max={300000} step={1000} value={mySalary}
            onChange={e => setMySalary(parseInt(e.target.value) || 0)}
            className={`${inputCls} text-[16px] font-bold`} />
        </div>
      </div>

      {avg !== null && diff !== null ? (
        <div className={`rounded-xl p-4 text-center space-y-1 ${diff >= 0 ? "bg-success/10 border border-success/20" : "bg-accent/10 border border-accent/20"}`}>
          <p className={`text-[28px] font-extrabold ${diff >= 0 ? "text-success" : "text-accent"}`}>
            {diff >= 0 ? "+" : ""}{diff}%
          </p>
          <p className="text-[13px] font-medium text-ink">
            {diff >= 0
              ? `A béred ${Math.abs(diff)}%-kal magasabb az átlagnál`
              : `Az átlagnál ${Math.abs(diff)}%-kal kevesebbet keresel`
            }
          </p>
          <p className="text-[11px] text-ink-faint">
            Közösségi átlag ({bucket}): {avg.toLocaleString("hu-HU")} CHF/év · {match?.entry_count} adat alapján
          </p>
        </div>
      ) : (
        <div className="rounded-xl p-4 text-center bg-surface-alt border border-line">
          <p className="text-[13px] text-ink-muted">
            Ehhez a kombinációhoz még nincs elegendő közösségi adat.
          </p>
        </div>
      )}
    </div>
  );
}

export function RentToSalaryCalculator({
  mySalary,
  myRent,
  canton,
}: {
  mySalary?: number;
  myRent?: number;
  canton: string;
}) {
  const [salary, setSalary] = useState(mySalary || 80000);
  const [rent, setRent] = useState(myRent || 1800);
  const [avgRatio, setAvgRatio] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSalary(mySalary || 80000);
    setRent(myRent || 1800);
  }, [mySalary, myRent]);

  useEffect(() => {
    let active = true;
    const fetchRatio = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/benchmark/ratio?canton=${canton}`);
        const data = await res.json() as { avg_ratio?: number | null };
        if (active) setAvgRatio(data.avg_ratio ?? null);
      } catch {
        if (active) setAvgRatio(null);
      }
      setLoading(false);
    };
    fetchRatio();
    return () => { active = false; };
  }, [canton]);

  // Védelem a 0-val osztás ellen: ha a bér mezőt kiürítik (salary=0), a ratio
  // Infinity lenne és "Infinity%"-ot írna ki.
  const userRatio = salary > 0 ? Math.round((rent * 12) / salary * 100) : 0;
  const isGood = avgRatio !== null && userRatio <= avgRatio;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚖️</span>
        <div>
          <p className="font-bold text-[15px] text-ink">Bér vs. Lakbér Arány</p>
          <p className="text-[12px] text-ink-muted">Mennyit költesz az otthonodra?</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-ink-muted mb-1 uppercase">Bruttó Bér (CHF/év)</label>
          <input type="number" value={salary} onChange={(e) => setSalary(parseInt(e.target.value) || 0)}
            className="w-full rounded-xl border border-line bg-surface-alt px-3 py-2 text-[14px] text-ink focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-ink-muted mb-1 uppercase">Lakbér (CHF/hó)</label>
          <input type="number" value={rent} onChange={(e) => setRent(parseInt(e.target.value) || 0)}
            className="w-full rounded-xl border border-line bg-surface-alt px-3 py-2 text-[14px] text-ink focus:ring-2 focus:ring-primary/40" />
        </div>
      </div>

      <div className={`mt-3 rounded-xl p-4 ${isGood ? "bg-primary/10 border border-primary/20" : "bg-accent/10 border border-accent/20"}`}>
        <p className={`text-[14px] font-medium leading-relaxed ${isGood ? "text-primary-dark" : "text-accent-dark"}`}>
          Te a béred <strong>{userRatio}%</strong>-át költöd lakbérre.
        </p>
        {loading ? (
          <p className="text-[13px] mt-1 flex items-center gap-2"><span className="animate-spin w-3 h-3 border-2 border-ink border-t-transparent rounded-full" /> Közösségi átlag számítása...</p>
        ) : avgRatio ? (
          <p className={`text-[13px] mt-1 ${isGood ? "text-primary" : "text-accent"}`}>
            A {canton === "all" ? "svájci" : `${canton} kantonban élő`} magyarok átlaga: <strong>{avgRatio}%</strong>.
            <br />
            {isGood ? "Jól gazdálkodsz, ez az átlag alatti teher!" : "Ez az átlagnál magasabb teher a fizetésedhez képest."}
          </p>
        ) : (
          <p className="text-[13px] text-ink-muted mt-1">Nincs még elég közösségi adat a párosításhoz ebben a kantonban.</p>
        )}
      </div>
    </div>
  );
}

/** Email feliratkozás értesítésre */
export function AlertSubscription({
  defaultIndustry,
  defaultAvg,
  turnstileSiteKey,
}: {
  defaultIndustry?: string;
  defaultAvg?: number | null;
  turnstileSiteKey: string;
}) {
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState(defaultIndustry ?? INDUSTRIES[0]);
  const [canton, setCanton] = useState("all");
  const [token, setToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputCls = "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 transition";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) { setError("CAPTCHA szükséges."); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/benchmark/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, industry, cantonCode: canton, currentAvg: defaultAvg ?? null, turnstileToken: token }),
      });
      const data = await res.json() as { message?: string; error?: string };
      if (res.ok) setResult(data.message ?? null);
      else setError(data.error ?? null);
    } catch { setError("Hálózati hiba."); }
    setSubmitting(false);
  }

  async function handlePushSubscribe() {
    setSubmitting(true); setError(null);
    try {
      if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setError("A böngésződ nem támogatja a push-értesítést (iPhone-on telepítsd előbb a kezdőképernyőre).");
        setSubmitting(false); return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setError("Engedélyezd az értesítéseket a push-hoz.");
        setSubmitting(false); return;
      }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        });
      }
      const res = await fetch("/api/benchmark/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pushEndpoint: sub.endpoint, industry, cantonCode: canton, currentAvg: defaultAvg ?? null }),
      });
      const data = await res.json() as { message?: string; error?: string };
      if (res.ok) setResult(data.message ?? "Push-értesítés bekapcsolva!");
      else setError(data.error ?? "Sikertelen feliratkozás.");
    } catch { setError("Hálózati hiba."); }
    setSubmitting(false);
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/10 p-5 text-center space-y-1">
        <p className="text-xl">🔔</p>
        <p className="font-bold text-[14px] text-ink">{result}</p>
        <p className="text-[12px] text-ink-muted">Értesítünk, ha az átlagbér ±10%-ot változik a kiválasztott iparágban.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔔</span>
        <div>
          <p className="font-bold text-[15px] text-ink">Értesíts, ha változik!</p>
          <p className="text-[12px] text-ink-muted">Email vagy push, ha az átlagbér ±10%-ot mozog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[11px] font-bold text-ink-muted mb-1 uppercase tracking-wide">Email-cím</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="pelda@email.com" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-ink-muted mb-1 uppercase tracking-wide">Iparág</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)} className={inputCls}>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-ink-muted mb-1 uppercase tracking-wide">Kanton</label>
            <select value={canton} onChange={e => setCanton(e.target.value)} className={inputCls}>
              <option value="all">Egész Svájc</option>
              {CANTONS.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="text-[13px] text-accent font-medium">{error}</p>}
        <TurnstileWidget siteKey={turnstileSiteKey} onToken={setToken} />
        <button type="submit" disabled={submitting || !token}
          className="w-full bg-primary hover:opacity-90 text-white font-bold py-3 rounded-xl transition disabled:opacity-40 text-[14px]">
          {submitting ? "Feliratkozás..." : "🔔 Feliratkozás emailben"}
        </button>
      </form>

      <div className="flex items-center gap-2">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">vagy</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        onClick={handlePushSubscribe}
        disabled={submitting}
        className="w-full rounded-xl border border-primary/30 bg-primary-soft/50 py-3 text-[14px] font-bold text-primary transition hover:bg-primary-soft disabled:opacity-40"
      >
        {submitting ? "…" : "📲 Push-értesítést kérek (email nélkül)"}
      </button>

      <p className="text-[11px] text-ink-faint text-center">Push esetén nem kell email — a böngésződ értesítését használjuk. Bármikor leiratkozhatsz.</p>
    </div>
  );
}
