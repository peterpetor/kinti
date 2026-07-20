"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { COUNTRIES } from "@/lib/countries";
import type { Category } from "@/lib/types";

/**
 * B2bComposer — új projekt kiírása (csak PRO cég látja, mert a /b2b page a
 * paywall mögött rendereli). A POST /api/b2b/projects szerveroldalon ÚJRA
 * ellenőrzi a PRO-t; ez a form csak a kényelmes UI.
 */
export function B2bComposer({
  categories,
  defaultCountry,
  defaultPhone,
}: {
  categories: Category[];
  defaultCountry: string;
  defaultPhone: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState(defaultCountry);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [hp, setHp] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle(""); setDescription(""); setCity(""); setCategory("");
    setPhone(defaultPhone ?? ""); setCountry(defaultCountry); setError(null);
  }

  async function submit() {
    setError(null);
    if (title.trim().length < 6) { setError("A projekt címe legyen legalább 6 karakter."); return; }
    if (description.trim().length < 20) { setError("A leírás legyen legalább 20 karakter."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/b2b/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, targetCountry: country, targetCity: city,
          categoryNeeded: category, contactPhone: phone, _hp: hp,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { setError(data.error || "Nem sikerült kiírni a projektet."); return; }
      reset();
      setOpen(false);
      router.refresh();
    } catch {
      setError("Hálózati hiba. Próbáld újra.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-card border-2 border-dashed border-primary/30 bg-primary-soft/30 px-4 py-3.5 text-[14px] font-bold text-primary transition active:scale-[0.99]"
      >
        <Icon name="plus" size={17} strokeWidth={2.6} />
        Új projekt kiírása
      </button>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[14px] text-ink outline-none transition focus:border-primary";

  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[14px] font-extrabold text-ink">Új projekt kiírása</p>
        <button type="button" onClick={() => { setOpen(false); reset(); }} aria-label="Bezárás" className="grid h-7 w-7 place-items-center rounded-lg text-ink-muted hover:bg-surface-alt">
          <Icon name="close" size={15} strokeWidth={2.4} />
        </button>
      </div>

      <div className="space-y-2.5">
        <input
          className={inputCls}
          placeholder="Projekt címe (pl. 2 festőt keresek bécsi munkára)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
        <textarea
          className={`${inputCls} min-h-[90px] resize-y`}
          placeholder="Részletek: mikor, meddig, milyen feltételekkel, mit kell tudni…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <select className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
            ))}
          </select>
          <input
            className={inputCls}
            placeholder="Város (opcionális)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            maxLength={80}
          />
        </div>
        <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Milyen szakma kell? (opcionális)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <input
          className={inputCls}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Kapcsolat-telefon (a jelentkezőknek)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={40}
        />

        {/* Honeypot — rejtett, ember sose tölti ki. */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
          aria-hidden="true"
        />

        {error && <p className="text-[12.5px] font-semibold text-accent">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="w-full rounded-pill bg-primary px-4 py-2.5 text-[14px] font-extrabold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "Kiírás…" : "Projekt kiírása"}
        </button>
        <p className="text-center text-[11px] text-ink-faint">
          A projektet csak PRO cégek látják. Ne ossz meg bizalmas adatot.
        </p>
      </div>
    </div>
  );
}
