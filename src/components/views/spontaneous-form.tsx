"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { SPONTANEOUS_LIMITS, type SpontaneousValidationError } from "@/lib/spontaneous";
import { CANTONS } from "@/lib/cantons";
import { PostSavePrompt } from "@/components/post-save-prompt";
import { loadFormPrefs, saveFormPrefs } from "@/lib/form-prefs";

/**
 * SpontaneousForm — 24-48h spontán mikro-esemény feladás.
 * Kompakt egy-formás layout, hasonló mint a ride-form.
 */
type Phase = "idle" | "submitting" | "sent" | "error";

interface FormState {
  title: string;
  locationName: string;
  cantonCode: string;
  meetupTime: string;
  maxPeople: string;
  contactPhone: string;
  contactWhatsapp: string;
  poster: string;
  notes: string;
  website: string; // honeypot
  acceptTerms: boolean;
  ageConfirmed: boolean;
}

const INITIAL: FormState = {
  title: "",
  locationName: "",
  cantonCode: "",
  meetupTime: "",
  maxPeople: "2",
  contactPhone: "",
  contactWhatsapp: "",
  poster: "",
  notes: "",
  website: "",
  acceptTerms: false,
  ageConfirmed: false,
};

interface SubmitResponse {
  ok?: boolean;
  id?: string;
  manageToken?: string;
  manageUrl?: string;
  error?: string;
  details?: SpontaneousValidationError[];
}

export function SpontaneousForm({ turnstileSiteKey = "", onClose }: { turnstileSiteKey?: string; onClose?: () => void }) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [global, setGlobal] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [published, setPublished] = useState<{ id: string; manageToken: string; manageUrl: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  // Mount-on: utoljára használt értékek
  useEffect(() => {
    const prefs = loadFormPrefs();
    setForm((f) => ({
      ...f,
      cantonCode: f.cantonCode || prefs.cantonCode || "",
      poster: f.poster || prefs.posterName || "",
      contactPhone: f.contactPhone || prefs.phone || "",
      contactWhatsapp: f.contactWhatsapp || prefs.whatsapp || "",
    }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGlobal(null);

    if (!turnstileToken) {
      setGlobal("Várd meg a robot-ellenőrzést.");
      return;
    }

    setPhase("submitting");
    try {
      const res = await fetch("/api/spontaneous/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxPeople: Number(form.maxPeople) || 2,
          turnstileToken,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SubmitResponse;
      if (!res.ok) {
        if (data.details?.length) {
          const map: Record<string, string> = {};
          for (const d of data.details) map[d.field as string] = d.message;
          setErrors(map);
        }
        setGlobal(data.error ?? "Hiba történt.");
        setPhase("error");
        turnstileRef.current?.reset();
        return;
      }

      if (data.id && data.manageToken && data.manageUrl) {
        setPublished({ id: data.id, manageToken: data.manageToken, manageUrl: data.manageUrl });
      }
      saveFormPrefs({
        cantonCode: form.cantonCode || undefined,
        posterName: form.poster || undefined,
        phone: form.contactPhone || undefined,
        whatsapp: form.contactWhatsapp || undefined,
      });
      setPhase("sent");
    } catch (err) {
      setGlobal(err instanceof Error ? err.message : "Hálózati hiba.");
      setPhase("error");
      turnstileRef.current?.reset();
    }
  }

  if (phase === "sent" && published) {
    return (
      <div className="rounded-card border border-line bg-surface p-5 shadow-card space-y-4">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-success/15 text-success">
            <Icon name="check" size={22} strokeWidth={2.4} />
          </div>
          <h2 className="mt-3 text-[18px] font-extrabold tracking-tight text-ink">
            Spontán meetup fent van! 🎲
          </h2>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Megjelenik a Közösség → Spontán fülön. 1 órával a találkozó után automatikusan eltűnik.
          </p>
        </div>
        <PostSavePrompt
          type="spontan"
          id={published.id}
          manageToken={published.manageToken}
          title={form.title}
          manageUrl={published.manageUrl}
        />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-pill border border-line bg-surface-alt py-2.5 text-[13px] font-bold text-ink-muted active:scale-95"
          >
            Vissza a listához
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section title="Mit szervezel?" required>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Pl. Bringázás a Zürich-tó körül, szombat délelőtt"
          maxLength={SPONTANEOUS_LIMITS.titleMax}
          className={inputCls(errors.title)}
        />
        <FieldError msg={errors.title} />
      </Section>

      <Section title="Hol találkoztok?" required>
        <input
          type="text"
          value={form.locationName}
          onChange={(e) => setField("locationName", e.target.value)}
          placeholder="Pl. Zürich, Bürkliplatz / Bázel, Marktplatz"
          maxLength={SPONTANEOUS_LIMITS.locationMax}
          className={inputCls(errors.locationName)}
        />
        <FieldError msg={errors.locationName} />

        <div className="mt-3">
          <label className="block mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Kanton (opcionális)
          </label>
          <select
            value={form.cantonCode}
            onChange={(e) => setField("cantonCode", e.target.value)}
            className={inputCls(errors.cantonCode)}
          >
            <option value="">Nincs megadva</option>
            {CANTONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Mikor?" required>
        <input
          type="datetime-local"
          value={form.meetupTime}
          onChange={(e) => setField("meetupTime", e.target.value)}
          className={inputCls(errors.meetupTime)}
        />
        <FieldError msg={errors.meetupTime} />
        <p className="mt-1 text-[10.5px] leading-snug text-ink-faint">
          Max 48 órával előre. Hosszabbra a normál Események közé tedd.
        </p>
      </Section>

      <Section title="Hány embert vársz?" required>
        <input
          type="number"
          min={SPONTANEOUS_LIMITS.peopleMin}
          max={SPONTANEOUS_LIMITS.peopleMax}
          value={form.maxPeople}
          onChange={(e) => setField("maxPeople", e.target.value)}
          className={inputCls(errors.maxPeople)}
        />
        <FieldError msg={errors.maxPeople} />
      </Section>

      <Section title="Telefonszám (kötelező)" required>
        <input
          type="tel"
          value={form.contactPhone}
          onChange={(e) => setField("contactPhone", e.target.value)}
          placeholder="+41 79 123 45 67"
          autoComplete="tel"
          className={inputCls(errors.contactPhone)}
        />
        <FieldError msg={errors.contactPhone} />
        <p className="mt-1 text-[10.5px] leading-snug text-ink-faint">
          Erre hívnak / WhatsApp-olnak. A kinti.app nem közvetít üzeneteket.
        </p>
      </Section>

      <Section title="WhatsApp szám (csak ha eltér)">
        <input
          type="tel"
          value={form.contactWhatsapp}
          onChange={(e) => setField("contactWhatsapp", e.target.value)}
          placeholder="Üresen: a fenti telefonra megy a WhatsApp is"
          className={inputCls(errors.contactWhatsapp)}
        />
        <FieldError msg={errors.contactWhatsapp} />
      </Section>

      <Section title="Megjelenő név (opcionális)">
        <input
          type="text"
          value={form.poster}
          onChange={(e) => setField("poster", e.target.value)}
          placeholder="Pl. Tímea"
          maxLength={SPONTANEOUS_LIMITS.posterMax}
          className={inputCls(errors.poster)}
        />
        <FieldError msg={errors.poster} />
      </Section>

      <Section title="Megjegyzés (opcionális)">
        <textarea
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
          placeholder="Pl. Kerékpárod legyen, könnyű tempó, kávézás után. Sárga sapkában leszek."
          maxLength={SPONTANEOUS_LIMITS.notesMax}
          rows={3}
          className={cn(inputCls(errors.notes), "resize-none")}
        />
        <FieldError msg={errors.notes} />
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
          Kijelentem, hogy elmúltam 18 éves.
        </Consent>
        <Consent
          checked={form.acceptTerms}
          onChange={(v) => setField("acceptTerms", v)}
          error={errors.acceptTerms}
        >
          Elolvastam és elfogadom az{" "}
          <a href="/aszf" target="_blank" className="underline">
            ÁSZF
          </a>
          -et és az{" "}
          <a href="/adatvedelem" target="_blank" className="underline">
            Adatkezelési Tájékoztatót
          </a>
          .
        </Consent>
      </section>

      {turnstileSiteKey && (
        <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
      )}

      {global && (
        <div className="rounded-card border border-accent/30 bg-accent-soft px-4 py-3 text-[12.5px] font-semibold text-accent">
          {global}
        </div>
      )}

      <div className="flex gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={phase === "submitting"}
            className="flex-1 rounded-pill border border-line bg-surface-alt py-3 text-[13px] font-bold text-ink-muted active:scale-95"
          >
            Mégsem
          </button>
        )}
        <button
          type="submit"
          disabled={phase === "submitting" || !turnstileToken || !form.acceptTerms || !form.ageConfirmed}
          className={cn(
            "flex-1 rounded-pill bg-primary py-3 text-[13.5px] font-extrabold text-white shadow-card active:scale-95",
            (phase === "submitting" || !turnstileToken || !form.acceptTerms || !form.ageConfirmed) && "opacity-60",
          )}
        >
          {phase === "submitting" ? "Küldés…" : "🎲 Spontán meetup közzététele"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, required, children }: { title: string; required?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">{title}</h3>
        <span className={cn(
          "text-[10.5px] font-semibold uppercase tracking-wide",
          required ? "text-accent" : "text-ink-faint",
        )}>
          {required ? "kötelező" : "opcionális"}
        </span>
      </div>
      {children}
    </section>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-[11.5px] font-semibold text-accent">{msg}</p>;
}

function inputCls(err?: string): string {
  return cn(
    "h-11 w-full rounded-[12px] border bg-surface-alt px-3 text-[14px] font-medium text-ink outline-none placeholder:text-ink-faint focus:bg-surface focus:ring-2 focus:ring-primary/30",
    err ? "border-accent" : "border-line",
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
