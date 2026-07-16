"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { COUNTRIES } from "@/lib/countries";
import {
  HOUSING_CONSENT_TEXT,
  HOUSING_CURRENCIES,
  HOUSING_TYPE_LABELS,
  HOUSING_TYPES,
  validateHousingInput,
  type HousingType,
} from "@/lib/housing";

/**
 * Új hirdetés feladása. Kontrollált űrlap (a kódbázis mintája — nincs RHF/Zod
 * dependencia); a kliens UGYANAZT a validateHousingInput-ot futtatja, mint a
 * szerver, így a hibaüzenetek egyeznek. A jogi pajzs checkbox KIADÓ hirdetésnél
 * kötelező — enélkül a beküldés-gomb inaktív (és a szerver is elutasítja).
 */
export function ComposerModal({
  open,
  onClose,
  onCreated,
  defaultCountry,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultCountry: string;
}) {
  const [type, setType] = useState<HousingType>("room_offered");
  const [country, setCountry] = useState(defaultCountry);
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A nyilatkozat kiadó hirdetésre vonatkozik (albérletbe adás) — kereső
  // hirdetésnél nincs mit engedélyeztetni, ott nem jelenik meg.
  const needsConsent = type !== "looking_for_room";
  const submitDisabled = sending || (needsConsent && !consent);

  async function submit() {
    setError(null);
    const body = {
      type, country, city, price: Number(price), currency,
      description, contact, consent,
    };
    const v = validateHousingInput(body);
    if (!v.ok) { setError(v.error); return; }

    setSending(true);
    try {
      const res = await fetch("/api/housing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { setError(data.error ?? "Nem sikerült feladni a hirdetést."); return; }
      // Siker: űrlap-nullázás a következő nyitáshoz.
      setCity(""); setPrice(""); setDescription(""); setContact(""); setConsent(false);
      onCreated();
    } catch {
      setError("Hálózati hiba. Próbáld újra.");
    } finally {
      setSending(false);
    }
  }

  const fieldCls =
    "w-full rounded-[12px] border border-line bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30";
  const labelCls = "mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-ink-muted";

  return (
    <BottomSheet open={open} onClose={onClose} title="Új hirdetés feladása">
      <div className="space-y-3 pb-2">
        <div>
          <label htmlFor="h-type" className={labelCls}>Típus</label>
          <select id="h-type" value={type} onChange={(e) => setType(e.target.value as HousingType)} className={fieldCls}>
            {HOUSING_TYPES.map((t) => (
              <option key={t} value={t}>{HOUSING_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="h-country" className={labelCls}>Ország</label>
            <select id="h-country" value={country} onChange={(e) => setCountry(e.target.value)} className={fieldCls}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="h-city" className={labelCls}>Település</label>
            <input id="h-city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={60}
              placeholder="pl. Zürich" className={fieldCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="h-price" className={labelCls}>
              {type === "looking_for_room" ? "Max havi keret" : "Havi ár"}
            </label>
            <input id="h-price" type="number" inputMode="numeric" min={1} max={20000} value={price}
              onChange={(e) => setPrice(e.target.value)} placeholder="pl. 850" className={fieldCls} />
          </div>
          <div>
            <label htmlFor="h-currency" className={labelCls}>Deviza</label>
            <select id="h-currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={fieldCls}>
              {HOUSING_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="h-desc" className={labelCls}>Leírás</label>
          <textarea id="h-desc" value={description} onChange={(e) => setDescription(e.target.value)}
            rows={4} maxLength={1200}
            placeholder="Mekkora a szoba/lakás, mettől elérhető, rezsivel vagy anélkül, mi fontos neked…"
            className={cn(fieldCls, "resize-none")} />
        </div>

        <div>
          <label htmlFor="h-contact" className={labelCls}>Elérhetőség (e-mail vagy telefon)</label>
          <input id="h-contact" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={200}
            placeholder="pl. nev@email.com vagy +41 79 …" className={fieldCls} />
          <p className="mt-1 text-[11px] leading-snug text-ink-faint">
            Az elérhetőséged csak Kinti PRO-tagok láthatják — a nyilvános listában nem jelenik meg.
          </p>
        </div>

        {needsConsent && (
          <label className="flex items-start gap-2.5 rounded-[12px] border border-line bg-surface-alt p-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
            />
            <span className="text-[11.5px] leading-relaxed text-ink-muted">{HOUSING_CONSENT_TEXT}</span>
          </label>
        )}

        {error && <p className="text-[11.5px] font-semibold text-accent">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={submitDisabled}
          className={cn(
            "flex h-12 w-full items-center justify-center rounded-pill bg-primary text-[14px] font-extrabold text-white transition active:scale-[0.99]",
            submitDisabled && "cursor-not-allowed opacity-50",
          )}
        >
          {sending ? "Küldés…" : "Hirdetés feladása"}
        </button>
      </div>
    </BottomSheet>
  );
}
