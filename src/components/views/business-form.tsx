"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { cn } from "@/lib/cn";
import { CANTONS, isSwissAddress } from "@/lib/cantons";
import { BUSINESS_LIMITS, type BusinessValidationError } from "@/lib/business";
import type { Category } from "@/lib/types";

/**
 * Self-service vállalkozás-feladó űrlap (account nélkül). A flow megegyezik a
 * hirdetésével: kitöltés → Turnstile token → submit → megerősítő email →
 * kattintás → AZONNAL fent a Szaknévsorban.
 */
export interface BusinessFormProps {
  categories: Category[];
  turnstileSiteKey: string;
}

type Phase = "idle" | "submitting" | "sent" | "error";

interface FormState {
  email: string;
  name: string;
  categoryId: string;
  categoryLabel: string;
  cantonCode: string;
  address: string;
  phone: string;
  blurb: string;
  website: string; // honeypot
  acceptTerms: boolean;
  ageConfirmed: boolean;
}

const INITIAL: FormState = {
  email: "",
  name: "",
  categoryId: "",
  categoryLabel: "",
  cantonCode: "",
  address: "",
  phone: "",
  blurb: "",
  website: "",
  acceptTerms: false,
  ageConfirmed: false,
};

export function BusinessForm({ categories, turnstileSiteKey }: BusinessFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [global, setGlobal] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  const addressInvalid = form.address.trim().length > 0 && !isSwissAddress(form.address);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGlobal(null);

    if (addressInvalid) {
      setErrors((p) => ({ ...p, address: "Csak svájci cím adható meg (pl. 8001 Zürich)." }));
      return;
    }
    if (!turnstileToken) {
      setGlobal("Várd meg a robot-ellenőrzést, mielőtt elküldöd.");
      return;
    }

    setPhase("submitting");
    try {
      const res = await fetch("/api/business/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        detail?: string;
        details?: BusinessValidationError[];
      };
      if (!res.ok) {
        if (data.details?.length) {
          const map: Record<string, string> = {};
          for (const d of data.details) map[d.field as string] = d.message;
          setErrors(map);
        }
        let errMsg = data.error ?? "Hiba történt. Próbáld újra.";
        if (data.detail) errMsg += " (" + data.detail + ")";
        setGlobal(errMsg);
        setPhase("error");
        turnstileRef.current?.reset();
        return;
      }
      setPhase("sent");
    } catch (err) {
      setGlobal(err instanceof Error ? err.message : "Hálózati hiba.");
      setPhase("error");
      turnstileRef.current?.reset();
    }
  }

  if (phase === "sent") {
    return (
      <div className="rounded-card border border-line bg-surface p-6 text-center shadow-card">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white">
          <Icon name="send" size={22} strokeWidth={2.2} />
        </div>
        <h2 className="mt-3 text-[18px] font-extrabold tracking-tight text-ink">
          Nézd meg a postafiókodat!
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-pretty text-[13.5px] leading-relaxed text-ink-muted">
          Küldtünk egy emailt a <strong className="text-ink">{form.email}</strong> címre.
          A megerősítő linkre kattintva a vállalkozásod <strong>azonnal</strong> megjelenik a
          Szaknévsorban. A link 24 órán át érvényes.
        </p>
        <p className="mt-3 text-[11.5px] text-ink-faint">
          Spam mappa? Néha oda kerül — engedélyezd, ha úgy van.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(INITIAL);
            setTurnstileToken("");
            setPhase("idle");
          }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink"
        >
          Másik vállalkozás hozzáadása
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {/* Név */}
      <Section title="Vállalkozás neve" required>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="Pl. Kovács Anna Fodrászat"
          maxLength={BUSINESS_LIMITS.nameMax}
          className={inputCls(errors.name)}
        />
        <FieldError msg={errors.name} />
      </Section>

      {/* Kategória + pontos szakma */}
      <Section title="Kategória" required>
        <select
          value={form.categoryId}
          onChange={(e) => setField("categoryId", e.target.value)}
          className={inputCls(errors.categoryId)}
        >
          <option value="">Válassz kategóriát…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <FieldError msg={errors.categoryId} />
        <input
          type="text"
          value={form.categoryLabel}
          onChange={(e) => setField("categoryLabel", e.target.value)}
          placeholder="Pontos szakma (opcionális) — pl. Női fodrász, Burkoló"
          maxLength={BUSINESS_LIMITS.labelMax}
          className={cn(inputCls(errors.categoryLabel), "mt-2")}
        />
        <FieldError msg={errors.categoryLabel} />
      </Section>

      {/* Hely: kanton + cím */}
      <Section title="Hol dolgozol?" required>
        <select
          value={form.cantonCode}
          onChange={(e) => setField("cantonCode", e.target.value)}
          className={inputCls(errors.cantonCode)}
        >
          <option value="">Melyik kantonban?</option>
          {CANTONS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
        <FieldError msg={errors.cantonCode} />
        <input
          type="text"
          value={form.address}
          onChange={(e) => setField("address", e.target.value)}
          placeholder="Cím (opcionális) — pl. Bahnhofstrasse 10, 8001 Zürich"
          maxLength={BUSINESS_LIMITS.addressMax}
          aria-invalid={addressInvalid}
          className={cn(inputCls(errors.address || (addressInvalid ? "x" : "")), "mt-2")}
        />
        {addressInvalid ? (
          <p className="mt-1 flex items-start gap-1 text-[11.5px] font-semibold text-accent">
            <Icon name="close" size={12} strokeWidth={2.4} className="mt-0.5 shrink-0" />
            Csak svájci cím adható meg — tüntesd fel a svájci várost és irányítószámot.
          </p>
        ) : (
          <FieldError msg={errors.address} />
        )}
        <p className="mt-1 px-1 text-[10.5px] leading-snug text-ink-faint">
          A kanton kötelező (ide kerül a térképen). A pontos cím opcionális — mobil
          szolgáltatóknál (pl. villanyszerelő) elhagyható.
        </p>
      </Section>

      {/* Elérhetőség: telefon + leírás */}
      <Section title="Telefon és leírás">
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setField("phone", e.target.value)}
          placeholder="Telefonszám (pl. +41 79 123 45 67)"
          maxLength={BUSINESS_LIMITS.phoneMax}
          className={inputCls(errors.phone)}
        />
        <FieldError msg={errors.phone} />
        <textarea
          value={form.blurb}
          onChange={(e) => setField("blurb", e.target.value)}
          placeholder="Pár mondat a szolgáltatásodról…"
          maxLength={BUSINESS_LIMITS.blurbMax}
          rows={3}
          className={cn(inputCls(errors.blurb), "mt-2 resize-none")}
        />
        <div className="mt-1 flex justify-between text-[10.5px] text-ink-faint">
          <span>Max {BUSINESS_LIMITS.blurbMax} karakter</span>
          <span>{form.blurb.length} / {BUSINESS_LIMITS.blurbMax}</span>
        </div>
        <FieldError msg={errors.blurb} />
      </Section>

      {/* Email a megerősítéshez */}
      <Section title="Email a megerősítéshez" required>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="te@example.ch"
          autoComplete="email"
          maxLength={BUSINESS_LIMITS.emailMax}
          className={inputCls(errors.email)}
        />
        <FieldError msg={errors.email} />
        <p className="mt-2 text-[11px] leading-snug text-ink-muted">
          Az emailedet csak a megerősítéshez használjuk — a Szaknévsorban
          <strong> nem jelenik meg</strong>. Részletek:{" "}
          <Link href="/adatvedelem" className="underline">Adatkezelési Tájékoztató</Link>.
        </p>
      </Section>

      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => setField("website", e.target.value)}
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
      />

      {/* Kötelező nyilatkozatok */}
      <section className="space-y-2.5 rounded-card border border-line bg-surface p-4 shadow-card">
        <Consent
          checked={form.ageConfirmed}
          onChange={(v) => setField("ageConfirmed", v)}
          error={errors.ageConfirmed}
        >
          Kijelentem, hogy elmúltam 18 éves, és jogosult vagyok a vállalkozás bejelentésére.
        </Consent>
        <Consent
          checked={form.acceptTerms}
          onChange={(v) => setField("acceptTerms", v)}
          error={errors.acceptTerms}
        >
          Elolvastam és elfogadom az{" "}
          <Link href="/aszf" target="_blank" className="underline">ÁSZF</Link>-et és az{" "}
          <Link href="/adatvedelem" target="_blank" className="underline">
            Adatkezelési Tájékoztatót
          </Link>
          .
        </Consent>
      </section>

      <div className="px-1">
        <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
      </div>

      {global && (
        <div className="rounded-card border border-accent/30 bg-accent-soft px-4 py-3 text-[12.5px] font-semibold text-accent">
          {global}
        </div>
      )}

      <button
        type="submit"
        disabled={phase === "submitting" || !form.acceptTerms || !form.ageConfirmed}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-1.5 rounded-pill bg-primary text-[14px] font-extrabold tracking-[-0.01em] text-white shadow-card-hover transition active:scale-[0.99]",
          (phase === "submitting" || !form.acceptTerms || !form.ageConfirmed) &&
            "cursor-not-allowed opacity-50",
        )}
      >
        {phase === "submitting" ? "Küldés…" : "Vállalkozás beküldése"}
        {phase !== "submitting" && <Icon name="arrowRight" size={15} strokeWidth={2.4} />}
      </button>
    </form>
  );
}

// --- segéd-komponensek ------------------------------------------------------

function Section({
  title,
  required,
  children,
}: {
  title: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">{title}</h3>
        <span
          className={cn(
            "text-[10.5px] font-semibold uppercase tracking-wide",
            required ? "text-accent" : "text-ink-faint",
          )}
        >
          {required ? "kötelező" : "opcionális"}
        </span>
      </div>
      {children}
    </section>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-[11.5px] font-semibold text-accent" role="alert">
      {msg}
    </p>
  );
}

function inputCls(error?: string): string {
  return cn(
    "w-full rounded-[12px] border bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint",
    "focus:outline-none focus:ring-2 focus:ring-primary/30",
    error ? "border-accent/40" : "border-line",
  );
}

function Consent({
  checked,
  onChange,
  error,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-relaxed text-ink">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-none cursor-pointer accent-primary"
        />
        <span>{children}</span>
      </label>
      <FieldError msg={error} />
    </div>
  );
}
