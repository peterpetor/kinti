"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/cn";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, countryLocative } from "@/lib/countries";
import { getRegions, getRegion } from "@/lib/regions";
import { COST_CATEGORIES, costCategory } from "@/lib/cost-categories";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";

interface Result {
  category: string;
  count: number;
  scope: "canton" | "country";
  sizeScoped: boolean;
  locked: boolean;
  median: number | null;
  p25: number | null;
  p75: number | null;
  percentile: number | null;
  yourAmount: number | null;
}

export function CostBenchmarkView({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const cur = country === "CH" ? "CHF" : "EUR";
  const regions = getRegions(country);
  const countryRef = useRef(country);
  countryRef.current = country;

  const [canton, setCanton] = useState("all");
  const [household, setHousehold] = useState<number | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/benchmark/cost?country=${country}&canton=${canton}&household=${household ?? ""}`);
      const data = (await res.json()) as { results?: Result[]; householdSize?: number | null };
      if (countryRef.current !== country) return; // stale (országváltás közben)
      setResults(data.results ?? []);
      // Első betöltéskor előkitöltjük a háztartásméretet a korábbi beküldésből.
      if (household == null && data.householdSize != null) setHousehold(data.householdSize);
    } catch { /* marad */ }
  }, [country, canton, household]);
  useEffect(() => { load(); }, [load]);

  async function submit(category: string) {
    setErr(null);
    const raw = inputs[category]?.replace(/[^\d]/g, "") ?? "";
    const amount = Number(raw);
    if (!amount) { setErr("Adj meg egy összeget."); return; }
    if (canton === "all" || !getRegion(country, canton)) { setErr("Válassz régiót felül."); return; }
    if (!token) { setErr("Várd meg a robot-ellenőrzést."); return; }
    setBusy(category);
    try {
      const res = await fetch("/api/benchmark/cost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ country, cantonCode: canton, category, amount, householdSize: household, turnstileToken: token }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; results?: Result[]; error?: string };
      if (!res.ok) { setErr(data.error ?? "Nem sikerült."); turnstileRef.current?.reset(); setToken(""); setBusy(null); return; }
      setResults(data.results ?? results);
    } catch { setErr("Hálózati hiba."); }
    setBusy(null);
  }

  const regionLabel = canton === "all" ? countryLocative(country) : getRegion(country, canton)?.name ?? canton;

  function share() {
    const text = `Mennyit költesz külföldön? 🇭🇺 Hasonlítsd össze anonim módon — albérlet, Krankenkasse, kaja — a Kintin:`;
    const url = "https://kinti.app/mennyit-koltesz";
    if (typeof navigator !== "undefined" && navigator.share) navigator.share({ title: "Mennyit költesz?", text, url }).catch(() => {});
    else if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
  }

  return (
    <div className="space-y-4">
      {/* Régió + háztartásméret-választó */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[12px] font-bold text-ink-muted">Hol élsz?</label>
          <select value={canton} onChange={(e) => setCanton(e.target.value)}
            className="h-11 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[14px] font-semibold text-ink">
            <option value="all">Válassz régiót…</option>
            {regions.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-bold text-ink-muted">Hányan éltek?</label>
          <select value={household ?? ""} onChange={(e) => setHousehold(e.target.value ? Number(e.target.value) : null)}
            className="h-11 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[14px] font-semibold text-ink">
            <option value="">Háztartásméret…</option>
            <option value="1">1 fő</option>
            <option value="2">2 fő</option>
            <option value="3">3 fő</option>
            <option value="4">4 fő</option>
            <option value="5">5 fő</option>
            <option value="6">6+ fő</option>
          </select>
        </div>
      </div>
      {household != null && (
        <p className="-mt-1 text-[11px] text-ink-faint">
          A {household === 6 ? "6+" : household}-fős háztartásokhoz hasonlítunk (ha kevés az adat, a régió/ország összesére esünk vissza).
        </p>
      )}

      {turnstileSiteKey && <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setToken} />}
      {err && <p className="text-[12px] font-bold text-accent">{err}</p>}

      <div className="space-y-2.5">
        {COST_CATEGORIES.map((c) => {
          const r = results.find((x) => x.category === c.id);
          const unlocked = r && !r.locked && r.median != null;
          return (
            <article key={c.id} className="rounded-card border border-line bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-primary/10 text-lg">{c.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14px] font-extrabold text-ink">{c.label}</h3>
                  <p className="text-[11px] text-ink-faint">{c.hint} · {cur}/hó</p>
                </div>
              </div>

              {unlocked ? (
                <CostResult r={r!} cur={cur} regionLabel={regionLabel} />
              ) : (
                <div className="mt-3">
                  <div className="flex gap-2">
                    <input
                      inputMode="numeric"
                      value={inputs[c.id] ?? ""}
                      onChange={(e) => setInputs((s) => ({ ...s, [c.id]: e.target.value }))}
                      placeholder={`Te mennyit? (${cur}/hó)`}
                      className="h-10 flex-1 rounded-[10px] border border-line bg-surface-alt px-3 text-[14px] text-ink"
                    />
                    <button type="button" onClick={() => submit(c.id)} disabled={busy === c.id || !token}
                      className="shrink-0 rounded-pill bg-primary px-4 text-[13px] font-black text-white disabled:opacity-60">
                      {busy === c.id ? "…" : "Megnézem"}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-ink-muted">
                    {r && r.count > 0
                      ? `🔒 ${r.count} ember már megosztotta ${r.scope === "country" ? countryLocative(country) : regionLabel}. Add meg a tiéd, és lásd a mediánt + hol állsz.`
                      : "Legyél te az első — add meg, és lásd, mihez képest sok vagy kevés."}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <button type="button" onClick={share}
        className="w-full rounded-pill border border-line bg-surface py-3 text-[13.5px] font-bold text-ink-muted transition active:scale-[0.98]">
        🔗 Küldd el egy barátodnak: „Te mennyit fizetsz?"
      </button>

      <p className="text-center text-[11px] leading-snug text-ink-faint">
        Anonim, közösségi adat — nincs fiók, az IP-det nem tároljuk. Nem tanácsadás, csak amit a közösség beadott.
      </p>
    </div>
  );
}

function CostResult({ r, cur, regionLabel }: { r: Result; cur: string; regionLabel: string }) {
  const p = r.percentile ?? 50;
  const fmt = (n: number | null) => (n == null ? "–" : n.toLocaleString("hu-HU"));
  // Költségnél a KEVESEBB a jó. percentile = hány % költ kevesebbet nálad.
  const verdict =
    p >= 75 ? { cls: "text-accent", text: `⚠️ A felső ${100 - p}%-ban költesz — többet, mint a ${p}%.` }
    : p <= 25 ? { cls: "text-success", text: `✅ Az alsó ${p}%-ban — kevesebbet költesz, mint a ${100 - p}%! 👏` }
    : { cls: "text-ink", text: `Az átlag környékén (${p}. percentilis).` };

  // Pozíció-sáv: p25 .. p75 közötti tartomány + a te jelölőd (a percentilis alapján).
  return (
    <div className="mt-3 space-y-2">
      <p className="text-[13px] text-ink">
        <strong>{regionLabel}</strong> mediánja: <strong className="text-primary">{fmt(r.median)} {cur}</strong>
        {" · "}te: <strong>{fmt(r.yourAmount)} {cur}</strong>
      </p>
      <div className="relative h-2 rounded-full bg-surface-alt">
        <div className="absolute inset-y-0 rounded-full bg-primary/20" style={{ left: "25%", right: "25%" }} />
        <div className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow"
          style={{ left: `${Math.min(98, Math.max(2, p))}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-ink-faint">
        <span>kevesebb ({fmt(r.p25)})</span>
        <span>több ({fmt(r.p75)})</span>
      </div>
      <p className={cn("text-[12.5px] font-bold", verdict.cls)}>{verdict.text}</p>
      <p className="text-[10.5px] text-ink-faint">{r.count} válaszból{r.scope === "country" ? " (országos)" : ""}{r.sizeScoped ? " · azonos háztartásméret" : ""}.</p>
    </div>
  );
}
