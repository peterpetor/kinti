"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { EVENT_LIMITS } from "@/lib/events-validation";
import { cn } from "@/lib/cn";

const EVENT_TAGS = [
  { id: "piknik",    label: "🧺 Piknik" },
  { id: "liturgia",  label: "⛪ Mise / Ima" },
  { id: "sport",     label: "⚽ Sport" },
  { id: "ünnep",     label: "🎉 Ünnep" },
  { id: "iskola",    label: "📚 Iskola" },
  { id: "cserkész",  label: "⚜️ Cserkészet" },
  { id: "gyerek",    label: "🧒 Gyerekprogram" },
  { id: "bál",       label: "💃 Bál / Tánc" },
  { id: "kultúra",   label: "🎭 Kultúra" },
  { id: "gasztro",   label: "🍲 Gasztro" },
  { id: "egyéb",     label: "📌 Egyéb" },
];

type Phase = "idle" | "submitting" | "sent" | "error";

interface FormState {
  email: string;
  title: string;
  eventDate: string;
  startTime: string;
  venue: string;
  tag: string;
  description: string;
  imageKey: string | null;
  website: string; // honeypot
  acceptTerms: boolean;
  ageConfirmed: boolean;
}

const INITIAL: FormState = {
  email: "",
  title: "",
  eventDate: "",
  startTime: "",
  venue: "",
  tag: "",
  description: "",
  imageKey: null,
  website: "",
  acceptTerms: false,
  ageConfirmed: false,
};

const inputCls = (err?: string) =>
  cn(
    "w-full rounded-[12px] border bg-surface-alt px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint outline-none transition",
    "focus:ring-2 focus:ring-primary/30 focus:border-primary/60",
    err ? "border-accent" : "border-line",
  );

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
        <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          {title}
        </h3>
        {required ? (
          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-accent">
            kötelező
          </span>
        ) : (
          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">
            opcionális
          </span>
        )}
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

export function EventForm({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [global, setGlobal] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGlobal(null);

    if (!turnstileToken) {
      setGlobal("Várd meg a robot-ellenőrzést, mielőtt elküldöd.");
      return;
    }

    setPhase("submitting");
    try {
      const res = await fetch("/api/events/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          acceptTerms: form.acceptTerms,
          ageConfirmed: form.ageConfirmed,
          turnstileToken,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: { field: string; message: string }[];
      };

      if (!res.ok) {
        if (data.details?.length) {
          const errs: Record<string, string> = {};
          for (const d of data.details) errs[d.field] = d.message;
          setErrors(errs);
          setPhase("idle");
        } else {
          setGlobal(data.error ?? "Ismeretlen hiba. Próbáld újra.");
          setPhase("error");
        }
        return;
      }

      setPhase("sent");
    } catch {
      setGlobal("Hálózati hiba. Ellenőrizd az internetkapcsolatodat.");
      setPhase("error");
    }
  }

  // Success state
  if (phase === "sent") {
    return (
      <div className="rounded-card border border-line bg-surface p-6 text-center shadow-card">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white">
          <Icon name="send" size={22} strokeWidth={2.2} />
        </div>
        <h2 className="mt-3 text-[18px] font-extrabold tracking-tight text-ink">
          Nézd meg a postafiókodat! 📬
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-pretty text-[13.5px] leading-relaxed text-ink-muted">
          Küldtünk egy megerősítő emailt a{" "}
          <strong className="text-ink">{form.email}</strong> címre.
          Egy kattintás, és az eseményed moderátor elé kerül — ha minden
          rendben van, néhány órán belül megjelenik az eseménynaptárban! 🎉
        </p>
        <p className="mt-2 text-[11.5px] text-ink-faint">
          Spam mappát is érdemes megnézni — néha oda kerül.
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
          Újabb esemény beküldése
        </button>
      </div>
    );
  }

  const busy = phase === "submitting";

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <input
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setField("website", e.target.value)}
        />
      </div>

      {/* Email */}
      <Section title="Kapcsolat" required>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="Az emailedre küldünk megerősítő linket"
          autoComplete="email"
          maxLength={EVENT_LIMITS.emailMax}
          className={inputCls(errors.email)}
        />
        <FieldError msg={errors.email} />
      </Section>

      {/* Cím */}
      <Section title="Esemény neve" required>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Pl. Magyar Piknik a Sihl-parton"
          maxLength={EVENT_LIMITS.titleMax}
          className={inputCls(errors.title)}
        />
        <FieldError msg={errors.title} />
      </Section>

      {/* Dátum és idő */}
      <Section title="Dátum és kezdési idő" required>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) => setField("eventDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className={inputCls(errors.eventDate)}
            />
            <FieldError msg={errors.eventDate} />
          </div>
          <div>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setField("startTime", e.target.value)}
              className={inputCls(errors.startTime)}
            />
            <FieldError msg={errors.startTime} />
          </div>
        </div>
      </Section>

      {/* Helyszín */}
      <Section title="Helyszín" required>
        <input
          type="text"
          value={form.venue}
          onChange={(e) => setField("venue", e.target.value)}
          placeholder="Pl. Allmend Brunau, Zürich"
          maxLength={EVENT_LIMITS.venueMax}
          className={inputCls(errors.venue)}
        />
        <FieldError msg={errors.venue} />
      </Section>

      {/* Típus */}
      <Section title="Esemény típusa" required>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {EVENT_TAGS.map((t) => {
            const active = form.tag === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setField("tag", t.id)}
                className={cn(
                  "rounded-[12px] border px-2 py-2 text-[12px] font-bold transition",
                  active
                    ? "border-transparent bg-primary text-white shadow-card"
                    : "border-line bg-surface-alt text-ink hover:bg-surface",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <FieldError msg={errors.tag} />
      </Section>

      {/* Leírás */}
      <Section title="Leírás">
        <textarea
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Pár sor az eseményről (program, kinek szól, belépő stb.)…"
          maxLength={EVENT_LIMITS.descriptionMax}
          rows={4}
          className={cn(inputCls(errors.description), "resize-none")}
        />
        <div className="mt-1 flex justify-between text-[10.5px] text-ink-faint">
          <span>Max {EVENT_LIMITS.descriptionMax} karakter</span>
          <span>{form.description.length} / {EVENT_LIMITS.descriptionMax}</span>
        </div>
        <FieldError msg={errors.description} />
      </Section>

      {/* Feltételek */}
      <Section title="Nyilatkozatok" required>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={form.acceptTerms}
            onChange={(e) => setField("acceptTerms", e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
          />
          <span className="text-[12.5px] leading-snug text-ink-muted">
            Elolvastam és elfogadom az{" "}
            <a href="/aszf" target="_blank" className="text-primary underline">
              ÁSZF
            </a>
            -et és az{" "}
            <a href="/adatvedelem" target="_blank" className="text-primary underline">
              Adatkezelési Tájékoztatót
            </a>
            .
          </span>
        </label>
        <FieldError msg={errors.acceptTerms} />
        <label className="mt-2 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={form.ageConfirmed}
            onChange={(e) => setField("ageConfirmed", e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
          />
          <span className="text-[12.5px] leading-snug text-ink-muted">
            Nyilatkozom, hogy elmúltam 18 éves.
          </span>
        </label>
        <FieldError msg={errors.ageConfirmed} />
      </Section>

      {/* Turnstile CAPTCHA */}
      <TurnstileWidget siteKey={turnstileSiteKey} onToken={setTurnstileToken} />

      {global && (
        <p className="rounded-xl bg-accent/10 px-4 py-3 text-[12.5px] font-semibold text-accent">
          {global}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className={cn(
          "w-full rounded-pill bg-primary px-4 py-3.5 text-[14px] font-extrabold text-white shadow-card transition",
          busy ? "opacity-60" : "active:scale-[.98]",
        )}
      >
        {busy ? "Küldés…" : "Esemény beküldése →"}
      </button>

      <p className="px-1 text-center text-[10.5px] text-ink-faint">
        Az esemény moderátor jóváhagyása után jelenik meg a kinti.app naptárban.
        Trágár vagy sértő tartalom esetén elutasítjuk.
      </p>
    </form>
  );
}
