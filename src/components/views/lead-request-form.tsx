"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/types";
import { usePreferredCountry } from "@/lib/country-pref";
import { getCountry, DEFAULT_COUNTRY } from "@/lib/countries";
import { getRegions } from "@/lib/regions";

interface Props {
  categories: Category[];
}

type Step = "form" | "success";

export function LeadRequestForm({ categories }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [cantonCode, setCantonCode] = useState("all");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState(""); // bot-szűrő

  const selectedCategory = categories.find((c) => c.id === categoryId);

  // Ország-tudatos régió-lista + példák (CH: kanton/Zürich/+41, AT: Bundesland/Bécs/+43).
  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const countryName = getCountry(country)?.name ?? "Svájc";
  const regions = getRegions(country);
  const cityExample = country === "AT" ? "Bécsben" : country === "DE" ? "Berlinben" : country === "NL" ? "Amszterdamban" : "Zürichben";
  const phoneExample = country === "AT" ? "+43 660 123 4567" : country === "DE" ? "+49 151 23456789" : country === "NL" ? "+31 6 12345678" : "+41 79 123 45 67";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError("Kérjük add meg a neved."); return; }
    if (!email.trim()) { setError("Kérjük add meg az e-mail-cím."); return; }
    if (!categoryId) { setError("Válassz kategóriát!"); return; }
    if (message.trim().length < 20) {
      setError("Kérjük írj részletesebb üzenetet (min. 20 karakter).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/szaknevsor/ajanlatkeres", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          categoryId,
          categoryLabel: selectedCategory?.label ?? categoryId,
          cantonCode,
          message: message.trim(),
          _hp: honeypot, // honeypot mező — bot detektálás
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        sent?: number;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Hiba történt. Próbáld újra!");
        return;
      }

      setSentCount(data.sent ?? 1);
      setStep("success");
    } catch {
      setError("Hálózati hiba. Ellenőrizd az internetkapcsolatot.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 text-center animate-fade-up">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-success/10 text-success shadow-sm">
          <Icon name="check" size={40} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-[22px] font-extrabold tracking-tight text-ink">
            Kérésed elküldve! 🎉
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
            <strong className="text-success">{sentCount} vállalkozó</strong> kapta meg az
            árajánlat-kérésed.
            <br />
            Hamarosan keresni fognak e-mailben vagy telefonon!
          </p>
        </div>
        <div className="w-full rounded-card border border-line bg-surface-alt p-4 text-left">
          <p className="text-[12px] font-bold uppercase tracking-wide text-ink-muted mb-2">
            Mi a következő lépés?
          </p>
          <ul className="space-y-2 text-[13px] text-ink-muted">
            <li className="flex items-start gap-2">
              <span className="text-success font-bold">1.</span>
              A vállalkozók átnézik a kérésedet, és válaszolnak e-mailben.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success font-bold">2.</span>
              Hasonlítsd össze az ajánlatokat, és válaszd a legjobbat.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success font-bold">3.</span>
              48 óra után ha nincs válasz, böngészd a Szaknévsort közvetlenül.
            </li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => {
            setStep("form");
            setName(""); setEmail(""); setPhone("");
            setCategoryId(""); setCantonCode("all"); setMessage("");
            setSentCount(0);
          }}
          className="text-[13px] font-bold text-primary hover:underline"
        >
          Új árajánlat-kérés küldése
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up">
      {/* Honeypot — botok kitöltik, emberek soha nem látják */}
      <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <label htmlFor="lrf-hp">Ne töltsd ki</label>
        <input
          id="lrf-hp"
          type="text"
          name="_hp"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Kategória */}
      <div className="space-y-1.5">
        <label htmlFor="lrf-category" className="block text-[13px] font-bold text-ink">
          Milyen szolgáltatást keresel? <span className="text-accent">*</span>
        </label>
        <select
          id="lrf-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={loading}
          className="h-12 w-full rounded-card border border-line bg-surface px-3 text-[14px] font-medium text-ink outline-none focus:border-primary/50 disabled:opacity-50"
          required
        >
          <option value="">— Válassz kategóriát —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.glyph ? `${c.glyph} ` : ""}{c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Kanton */}
      <div className="space-y-1.5">
        <label htmlFor="lrf-canton" className="block text-[13px] font-bold text-ink">
          Melyik régióban? <span className="text-[11px] font-medium text-ink-muted">(opcionális)</span>
        </label>
        <select
          id="lrf-canton"
          value={cantonCode}
          onChange={(e) => setCantonCode(e.target.value)}
          disabled={loading}
          className="h-12 w-full rounded-card border border-line bg-surface px-3 text-[14px] font-medium text-ink outline-none focus:border-primary/50 disabled:opacity-50"
        >
          <option value="all">Egész {countryName} (mind)</option>
          {regions.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Név */}
      <div className="space-y-1.5">
        <label htmlFor="lrf-name" className="block text-[13px] font-bold text-ink">
          A neved <span className="text-accent">*</span>
        </label>
        <input
          id="lrf-name"
          type="text"
          autoComplete="name"
          placeholder="pl. Kovács Péter"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          className="h-12 w-full rounded-card border border-line bg-surface px-3 text-[14px] font-medium text-ink outline-none focus:border-primary/50 disabled:opacity-50"
          required
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="lrf-email" className="block text-[13px] font-bold text-ink">
          E-mail-cím <span className="text-accent">*</span>
        </label>
        <input
          id="lrf-email"
          type="email"
          autoComplete="email"
          placeholder="pelda@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="h-12 w-full rounded-card border border-line bg-surface px-3 text-[14px] font-medium text-ink outline-none focus:border-primary/50 disabled:opacity-50"
          required
        />
        <p className="text-[11.5px] text-ink-muted">
          A vállalkozók erre az e-mail-re válaszolnak neked.
        </p>
      </div>

      {/* Telefon */}
      <div className="space-y-1.5">
        <label htmlFor="lrf-phone" className="block text-[13px] font-bold text-ink">
          Telefonszám <span className="text-[11px] font-medium text-ink-muted">(opcionális)</span>
        </label>
        <input
          id="lrf-phone"
          type="tel"
          autoComplete="tel"
          placeholder={phoneExample}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
          className="h-12 w-full rounded-card border border-line bg-surface px-3 text-[14px] font-medium text-ink outline-none focus:border-primary/50 disabled:opacity-50"
        />
      </div>

      {/* Leírás */}
      <div className="space-y-1.5">
        <label htmlFor="lrf-message" className="block text-[13px] font-bold text-ink">
          Mire van szükséged? <span className="text-accent">*</span>
        </label>
        <textarea
          id="lrf-message"
          rows={5}
          placeholder={`Pl. "Könyvelőt keresek egyéni vállalkozáshoz ${cityExample}. Éves zárást és áfa-bevallást kellene csinálni. Mikor tudna időpontot adni, és mi a díjszabása?"`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          className="w-full rounded-card border border-line bg-surface px-3 py-3 text-[14px] leading-relaxed font-medium text-ink outline-none focus:border-primary/50 disabled:opacity-50 resize-none"
          required
        />
        <p className={cn(
          "text-right text-[11px] font-medium transition-colors",
          message.length < 20 ? "text-accent" : "text-ink-muted"
        )}>
          {message.length} / min. 20 karakter
        </p>
      </div>

      {error && (
        <div className="rounded-card border border-accent/30 bg-accent/5 px-4 py-3 text-[13px] font-medium text-accent">
          {error}
        </div>
      )}

      {/* Jogi nyilatkozat */}
      <p className="text-[11.5px] leading-relaxed text-ink-muted">
        Az árajánlat-kérés elküldésével hozzájárulsz, hogy a megadott adataidat (név, e-mail, telefon, leírás) a kinti.app megossza a kiválasztott kategória vállalkozóival árajánlat céljából. A kinti.app nem vállal felelősséget a beérkező ajánlatok tartalmáért.
      </p>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "flex h-14 w-full items-center justify-center gap-2 rounded-pill text-[16px] font-extrabold shadow-card transition-all active:scale-[0.98]",
          loading
            ? "bg-surface-alt text-ink-muted"
            : "bg-primary text-white hover:shadow-card-hover",
        )}
      >
        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Küldés folyamatban…
          </>
        ) : (
          <>
            <Icon name="send" size={20} strokeWidth={2.5} />
            Árajánlat-kérés Küldése
          </>
        )}
      </button>
    </form>
  );
}
