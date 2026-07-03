"use client";

import { useRef, useState } from "react";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { cn } from "@/lib/cn";

/**
 * Munkáltatói megkeresés-űrlap a /kozvetites B2B oldalhoz.
 * POST /api/kozvetites → email az adminnak. CH szándékosan nincs a listában
 * (a svájci közvetítés SECO-engedélyköteles).
 */
export function PlacementInquiryForm({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [form, setForm] = useState({
    company: "", name: "", email: "", phone: "", country: "AT", position: "", message: "", website: "",
  });
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErr(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!token) { setErr("Várd meg a robot-ellenőrzést."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/kozvetites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken: token }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Hiba történt — próbáld újra.");
        turnstileRef.current?.reset();
        setToken("");
        return;
      }
      setDone(true);
    } catch {
      setErr("Hálózati hiba — próbáld újra.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-card border border-success/30 bg-surface p-5 text-center shadow-card">
        <p className="text-3xl">🤝</p>
        <p className="mt-2 text-[15px] font-extrabold text-ink">Köszönjük a megkeresést!</p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
          24–48 órán belül jelentkezünk a megadott email-címen, és egyeztetjük a
          részleteket — kötelezettség nélkül.
        </p>
      </div>
    );
  }

  const inputCls =
    "h-11 w-full rounded-[12px] border border-line bg-surface-alt px-3 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div className="grid grid-cols-2 gap-2">
        <input value={form.company} onChange={(e) => set("company", e.target.value)} maxLength={120}
          placeholder="Cég neve *" required className={inputCls} />
        <select value={form.country} onChange={(e) => set("country", e.target.value)} className={inputCls}>
          <option value="AT">Ausztria</option>
          <option value="DE">Németország</option>
          <option value="NL">Hollandia</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={80}
          placeholder="Kapcsolattartó neve *" required className={inputCls} />
        <input value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={40}
          placeholder="Telefon (opcionális)" className={inputCls} />
      </div>
      <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={254}
        placeholder="Email *" required autoComplete="email" className={inputCls} />
      <input value={form.position} onChange={(e) => set("position", e.target.value)} maxLength={120}
        placeholder="Milyen pozícióra keresel? * (pl. szakács, villanyszerelő, ápoló)" required className={inputCls} />
      <textarea value={form.message} onChange={(e) => set("message", e.target.value)} maxLength={1200} rows={3}
        placeholder="Röviden a feltételekről: hány fő, mikortól, bér-sáv, helyszín… (opcionális)"
        className="w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30" />

      {/* Honeypot */}
      <input type="text" value={form.website} onChange={(e) => set("website", e.target.value)}
        name="website" autoComplete="off" tabIndex={-1} aria-hidden="true" className="hidden" />

      {turnstileSiteKey && (
        <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setToken} />
      )}
      {err && <p className="text-[12.5px] font-bold text-accent">{err}</p>}

      <button
        type="submit"
        disabled={busy}
        className={cn(
          "flex h-12 w-full items-center justify-center rounded-pill bg-primary text-[14.5px] font-extrabold text-white shadow-card-hover transition active:scale-[0.99]",
          busy && "cursor-wait opacity-60",
        )}
      >
        {busy ? "Küldés…" : "Ajánlatot kérek — kötelezettség nélkül"}
      </button>
      <p className="text-[11px] leading-snug text-ink-faint">
        Az adataidat kizárólag a megkeresés megválaszolásához használjuk. Szolgáltató:
        Feedback Jobs S.R.L. (lásd Impresszum).
      </p>
    </form>
  );
}
