"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/cn";
import type { ServiceRequest } from "@/lib/repo-requests";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, countryLocative } from "@/lib/countries";
import { getPresenceCities } from "@/lib/presence-cities";
import { SERVICE_CATEGORIES, serviceCategory } from "@/lib/service-categories";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { ReportButton } from "@/components/report-button";

function fmtAgo(iso: string): string {
  const t = Date.parse(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z"));
  const days = Math.floor((Date.now() - t) / 86_400_000);
  if (days <= 0) return "ma";
  if (days === 1) return "tegnap";
  return `${days} napja`;
}

export function KeresekView({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const countryRef = useRef(country);
  countryRef.current = country;
  const cityList = getPresenceCities(country);

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/keresek?country=${country}&category=${filter}`);
      const data = (await res.json()) as { requests?: ServiceRequest[] };
      if (countryRef.current !== country) return; // stale (országváltás közben)
      setRequests(data.requests ?? []);
    } catch { /* marad */ }
    setLoading(false);
  }, [country, filter]);
  useEffect(() => { load(); }, [load]);

  // Beküldő-mező állapot
  const [category, setCategory] = useState("villanyszerelo");
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [whenText, setWhenText] = useState("");
  const [desc, setDesc] = useState("");
  const [contact, setContact] = useState("");
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  function resetForm() {
    setCategory("villanyszerelo"); setTitle(""); setCity(""); setWhenText(""); setDesc(""); setContact("");
    setToken(""); setErr(null); setDone(false); turnstileRef.current?.reset();
  }

  async function submit() {
    setErr(null);
    if (title.trim().length < 5) { setErr("Írd le, mit keresel (min. 5 karakter)."); return; }
    if (contact.trim().length < 3) { setErr("Adj meg egy elérhetőséget."); return; }
    if (!token) { setErr("Várd meg a robot-ellenőrzést."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/keresek", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          country, category, title: title.trim(), description: desc.trim() || null,
          city: city || null, whenText: whenText.trim() || null, contact: contact.trim(),
          turnstileToken: token,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) { setErr(data.error ?? "Nem sikerült a beküldés."); turnstileRef.current?.reset(); setToken(""); setSubmitting(false); return; }
      setDone(true);
    } catch { setErr("Hálózati hiba."); }
    setSubmitting(false);
  }

  return (
    <div className="space-y-4">
      {/* Kategória-szűrő */}
      <div className="no-scrollbar kinti-hfade -mx-5 flex gap-2 overflow-x-auto px-5">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")} label="Mind" />
        {SERVICE_CATEGORIES.map((c) => (
          <FilterPill key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)} label={`${c.emoji} ${c.label}`} />
        ))}
      </div>

      <button type="button" onClick={() => { resetForm(); setModal(true); }}
        className="w-full rounded-pill bg-primary py-3.5 text-[15px] font-black text-white shadow-card transition active:scale-[0.98]">
        ➕ Keresek… — adj fel egy hirdetést
      </button>

      {/* Lista */}
      {loading ? (
        <p className="py-8 text-center text-[13px] text-ink-muted">Betöltés…</p>
      ) : requests.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface px-6 py-10 text-center text-[13px] text-ink-muted">
          Még nincs nyitott keresés {countryLocative(country)}. Legyél te az első — add fel, mit keresel!
        </div>
      ) : (
        <div className="space-y-2.5">
          {requests.map((r) => {
            const cat = serviceCategory(r.category ?? "");
            return (
              <article key={r.id} className="rounded-card border border-line bg-surface p-4 shadow-card">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  {cat && <span className="inline-flex items-center gap-1 rounded-pill bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">{cat.emoji} {cat.label}</span>}
                  {r.city && <span className="inline-flex items-center gap-1 rounded-pill bg-surface-alt px-2 py-0.5 text-[11px] font-bold text-ink-muted">📍 {r.city}</span>}
                  {r.whenText && <span className="inline-flex items-center gap-1 rounded-pill bg-star/10 px-2 py-0.5 text-[11px] font-bold text-star">🗓️ {r.whenText}</span>}
                  <span className="ml-auto text-[10.5px] text-ink-faint">{fmtAgo(r.createdAt)}</span>
                </div>
                <h3 className="text-[14.5px] font-extrabold tracking-[-0.01em] text-ink">{r.title}</h3>
                {r.description && <p className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">{r.description}</p>}
                <div className="mt-2 flex items-center gap-1.5 rounded-[10px] bg-primary-soft/60 px-3 py-2 text-[12.5px] font-bold text-primary">
                  📞 {r.contact}
                </div>
                {/* DSA notice-and-action: publikus hirdetésen bejelentő-út. */}
                <div className="mt-1.5 flex justify-end">
                  <ReportButton contentType="request" contentId={r.id} variant="link" />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Beküldő modal */}
      {modal && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-3 bg-ink/40 backdrop-blur-sm" onClick={() => !submitting && setModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-card border border-line bg-surface p-5 shadow-card-strong space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-extrabold text-ink">➕ Mit keresel?</h3>
              <button type="button" onClick={() => setModal(false)} className="grid h-8 w-8 place-items-center rounded-full bg-surface-alt text-ink-muted">✕</button>
            </div>

            {done ? (
              <div className="space-y-3 py-4 text-center">
                <p className="text-3xl">🎉</p>
                <p className="text-[14px] font-bold text-ink">Köszönjük! Jóváhagyás után megjelenik a listában.</p>
                <button type="button" onClick={() => setModal(false)} className="w-full rounded-pill bg-primary py-2.5 text-[13px] font-bold text-white">Rendben</button>
              </div>
            ) : (
              <>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13.5px] text-ink">
                  {SERVICE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                </select>
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
                  placeholder="Pl. Magyarul beszélő villanyszerelőt keresek" className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13.5px] text-ink" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13px] text-ink">
                    <option value="">Hol? (város)</option>
                    {cityList.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  <input value={whenText} onChange={(e) => setWhenText(e.target.value)} maxLength={60}
                    placeholder="Mikorra? (pl. jövő hét)" className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13px] text-ink" />
                </div>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={600} rows={2}
                  placeholder="Részletek (opcionális)" className="w-full rounded-[10px] border border-line bg-surface-alt px-3 py-2 text-[13px] text-ink" />
                <div>
                  <input value={contact} onChange={(e) => setContact(e.target.value)} maxLength={120}
                    placeholder="Elérhetőség: telefon, WhatsApp, e-mail…" className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13.5px] text-ink" />
                  <p className="mt-1 text-[11px] text-ink-faint">Ez <strong>nyilvánosan</strong> megjelenik a hirdetésen, hogy a szakik elérjenek. Csak annyit adj meg, amit megosztanál.</p>
                </div>

                {turnstileSiteKey && <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setToken} />}
                {err && <p className="text-[12px] font-bold text-accent">{err}</p>}

                <button type="button" onClick={submit} disabled={submitting || !token}
                  className="w-full rounded-pill bg-primary py-3 text-[14px] font-black text-white shadow-card disabled:opacity-60">
                  {submitting ? "Beküldés…" : "Beküldöm jóváhagyásra"}
                </button>
                <p className="text-[11px] leading-snug text-ink-faint">A hirdetést jóváhagyás után tesszük közzé, és 30 nap után lejár. Jóváhagyáskor a kategóriádba vágó magyar vállalkozásokat értesítjük is róla — így gyorsabban jelentkeznek.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("shrink-0 rounded-pill px-3 py-1.5 text-[12px] font-bold transition", active ? "bg-primary text-white shadow-card" : "border border-line bg-surface text-ink-muted")}>
      {label}
    </button>
  );
}
