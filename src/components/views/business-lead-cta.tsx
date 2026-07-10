"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { BottomSheet } from "@/components/bottom-sheet";

/**
 * BusinessLeadCta — cég-specifikus árajánlatkérés a profil-oldalon.
 *
 * Eddig a lead-rendszert (business_leads → inbox → freemium → PRO) csak a
 * kategória-szintű űrlap táplálta; aki EGY konkrét cégtől akart ajánlatot,
 * telefonon/emailen „elszivárgott" mellette. Ez a gomb a meglévő
 * /api/szaknevsor/ajanlatkeres DIREKT módjára küld (businessId) — ugyanaz a
 * honeypot/rate-limit/dedup/freemium-lock/email folyam fut le, egyetlen
 * célponttal. A gombot a profil szerver-oldala csak akkor rendereli, ha a
 * cég fogad leadet (van kontakt-email és nincs lead_opt_out).
 */
export function BusinessLeadCta({
  businessId,
  businessName,
  className,
}: {
  businessId: string;
  businessName: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"form" | "busy" | "done">("form");
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState("");

  const inputCls =
    "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[14px] text-ink outline-none transition focus:border-primary";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) { setError("Add meg a neved."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Érvényes e-mail-címet adj meg (erre válaszol a vállalkozó)."); return; }
    if (message.trim().length < 20) { setError("Írd le röviden, mire kérsz ajánlatot (min. 20 karakter)."); return; }
    setPhase("busy");
    try {
      const res = await fetch("/api/szaknevsor/ajanlatkeres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, name, email, phone, message, _hp: hp }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Nem sikerült elküldeni. Próbáld újra.");
        setPhase("form");
        return;
      }
      setPhase("done");
    } catch {
      setError("Hálózati hiba. Próbáld újra.");
      setPhase("form");
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <Icon name="send" size={16} strokeWidth={2.2} />
        <span>Árajánlat</span>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={`Ajánlatkérés — ${businessName}`}>
        {phase === "done" ? (
          <div className="space-y-3 pb-2 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
              <Icon name="check" size={28} strokeWidth={2.6} />
            </div>
            <p className="text-[15px] font-extrabold text-ink">Elküldve! ✉️</p>
            <p className="mx-auto max-w-xs text-[12.5px] leading-snug text-ink-muted">
              A vállalkozó e-mailben kapja a kérésed, és közvetlenül neked válaszol.
              A megadott címedre visszaigazolást küldtünk.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mx-auto rounded-pill bg-primary px-6 py-2.5 text-[14px] font-extrabold text-white active:scale-[0.98]"
            >
              Rendben
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-2.5 pb-2">
            <p className="text-[12.5px] leading-snug text-ink-muted">
              Írd le, mire kérsz ajánlatot — a vállalkozó közvetlenül a megadott
              e-mail-címedre válaszol.
            </p>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Neved *" maxLength={80} autoComplete="name" />
            <input className={inputCls} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail címed *" maxLength={200} autoComplete="email" />
            <input className={inputCls} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefonszám (opcionális)" maxLength={40} autoComplete="tel" />
            <textarea className={`${inputCls} min-h-[96px] resize-y`} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mire kérsz ajánlatot? (mit, hol, mikor…) *" maxLength={2000} />
            {/* Honeypot — botok kitöltik, emberek nem. */}
            <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
            {error && <p className="text-[12.5px] font-semibold text-accent">{error}</p>}
            <button
              type="submit"
              disabled={phase === "busy"}
              className="w-full rounded-pill bg-pro px-4 py-3 text-[14.5px] font-extrabold text-white shadow-card transition active:scale-[0.98] disabled:opacity-60"
            >
              {phase === "busy" ? "Küldés…" : "Ajánlatkérés elküldése"}
            </button>
            <p className="text-center text-[10.5px] leading-snug text-ink-faint">
              A kérésed a vállalkozóhoz kerül (név + elérhetőség + üzenet).{" "}
              Az elküldéssel elfogadod az adatkezelést — részletek:{" "}
              <a href="/adatvedelem" target="_blank" className="underline">Adatvédelem</a>.
            </p>
          </form>
        )}
      </BottomSheet>
    </>
  );
}
