"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * „Foglald el a vállalkozásod" kártya a nem megerősített (claimed=0) listákon.
 * A tulajdonos beküld egy igénylést → admin jóváhagyja → kezelő-linket kap.
 */
export function BusinessClaimCard({ businessId, businessName }: { businessId: string; businessName: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Adj meg egy érvényes e-mail-címet.");
      return;
    }
    setPhase("sending");
    try {
      const res = await fetch(`/api/szaknevsor/${encodeURIComponent(businessId)}/claim`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Nem sikerült elküldeni. Próbáld újra.");
        setPhase("error");
        return;
      }
      setPhase("sent");
    } catch {
      setError("Hálózati hiba.");
      setPhase("error");
    }
  }

  return (
    <section className="rounded-card border-2 border-dashed border-[#e3a233]/40 bg-[#e3a233]/5 p-4">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e3a233]/15 text-[#e3a233]">
          <Icon name="flag" size={16} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13.5px] font-extrabold text-ink">Nem megerősített lista</h3>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
            Ezt a vállalkozást nyilvános adatokból listáztuk, a tulajdonos még nem vette át.
            Tiéd a <strong className="text-ink">{businessName}</strong>? Foglald el, és szerkeszd
            az adatokat (logó, nyitvatartás, leírás, kapcsolat).
          </p>
        </div>
      </div>

      {phase === "sent" ? (
        <div className="mt-3 rounded-[10px] border border-success/30 bg-success/10 px-3 py-2.5 text-[12.5px] font-semibold text-success">
          ✅ Köszönjük! Az igénylést megkaptuk. Ellenőrzés után e-mailben küldjük a kezelő-linket.
        </div>
      ) : !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-pill bg-[#e3a233] text-[14px] font-extrabold text-white shadow-card transition active:scale-[0.98]"
        >
          <Icon name="check" size={15} strokeWidth={2.6} /> Ez a vállalkozásom — átveszem
        </button>
      ) : (
        <form onSubmit={submit} className="mt-3 space-y-2">
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Neved" maxLength={120} className={inputCls}
          />
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail (ide küldjük a kezelő-linket) *" autoComplete="email" maxLength={160} className={inputCls}
          />
          <input
            type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefon (opcionális)" maxLength={40} className={inputCls}
          />
          <textarea
            value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Pár szó, hogy ez tényleg a te vállalkozásod (opcionális)" rows={2} maxLength={1000}
            className={cn(inputCls, "resize-none")}
          />
          {error && <p className="text-[11.5px] font-semibold text-accent">{error}</p>}
          <button
            type="submit" disabled={phase === "sending"}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-pill bg-[#e3a233] text-[14px] font-extrabold text-white shadow-card transition active:scale-[0.98] disabled:opacity-60"
          >
            {phase === "sending" ? "Küldés…" : "Igénylés elküldése"}
          </button>
          <p className="px-1 text-[10.5px] leading-snug text-ink-faint">
            Az igénylést admin ellenőrzi. Ha nem a tiéd, kérjük ne küldd el. Eltávolítás:
            írj az <a href="mailto:info@kinti.app" className="underline">info@kinti.app</a> címre.
          </p>
        </form>
      )}
    </section>
  );
}

const inputCls =
  "w-full rounded-[12px] border border-line bg-surface px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-[#e3a233]/30";
