"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Icon } from "@/components/ui";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { cn } from "@/lib/cn";
import { RIDE_LIMITS, MAX_WAYPOINTS, type RideValidationError } from "@/lib/rides";

/**
 * RideForm — telekocsi-feladás. NEM kötelező a Clerk-belépés.
 *  • Vendég: a posterName a form-on, kötelező.
 *  • Belépett Clerk-user: a posterName a fiókból (a mező rejtett).
 */
type Phase = "idle" | "submitting" | "sent" | "error";

interface FormState {
  departureCity: string;
  destinationCity: string;
  departureTime: string;
  seats: string;
  priceText: string;
  contactPhone: string;
  notes: string;
  posterName: string;
  waypoints: string[];
}

const INITIAL: FormState = {
  departureCity: "",
  destinationCity: "",
  departureTime: "",
  seats: "1",
  priceText: "",
  contactPhone: "",
  notes: "",
  posterName: "",
  waypoints: [],
};

export function RideForm({ turnstileSiteKey = "" }: { turnstileSiteKey?: string }) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const showPosterName = isLoaded && !isSignedIn;
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [global, setGlobal] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [manageUrl, setManageUrl] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

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
      const res = await fetch("/api/rides/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          seats: Number(form.seats) || 1,
          waypoints: form.waypoints.filter((w) => w.trim().length > 0),
          turnstileToken,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: RideValidationError[];
        manageUrl?: string;
      };
      if (!res.ok) {
        if (data.details?.length) {
          const map: Record<string, string> = {};
          for (const d of data.details) map[d.field as string] = d.message;
          setErrors(map);
        }
        setGlobal(data.error ?? "Hiba történt. Próbáld újra.");
        setPhase("error");
        turnstileRef.current?.reset();
        return;
      }
      setManageUrl(data.manageUrl ?? null);
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
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#3a6ea5]/15 text-[#3a6ea5] text-lg">
          🚗
        </div>
        <h2 className="mt-3 text-[18px] font-extrabold tracking-tight text-ink">
          A fuvarod fent van!
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-pretty text-[13.5px] leading-relaxed text-ink-muted">
          Megjelent a telekocsi-listán. Az indulás + 24 óra után automatikusan eltűnik.
        </p>

        {manageUrl && (
          <div className="mt-4 rounded-card border border-primary/30 bg-primary-soft/40 p-3 text-left">
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-primary">
              🔑 Kezelő-link — tedd el!
            </p>
            <p className="mt-1 text-[11.5px] leading-snug text-ink-muted">
              Bármikor szerkesztheted vagy törölheted a fuvart ezen a linken (regisztráció nélkül):
            </p>
            <a
              href={manageUrl}
              className="mt-1.5 block break-all text-[11.5px] font-mono text-primary underline"
            >
              {typeof window !== "undefined" ? `${window.location.origin}${manageUrl}` : manageUrl}
            </a>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          {manageUrl && (
            <button
              type="button"
              onClick={() => router.push(manageUrl)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-primary px-5 text-[13.5px] font-bold text-white"
            >
              Kezelő oldal megnyitása <Icon name="arrowRight" size={15} strokeWidth={2.4} />
            </button>
          )}
          <button
            type="button"
            onClick={() => router.push("/telekocsi")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-line bg-surface px-5 text-[13.5px] font-bold text-ink"
          >
            Telekocsi-lista megnyitása
          </button>
          <button
            type="button"
            onClick={() => { setForm(INITIAL); setPhase("idle"); setManageUrl(null); }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-line bg-surface px-5 text-[13.5px] font-bold text-ink"
          >
            Másik fuvar feladása
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <Section title="Honnan – hová" required>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <input
              type="text"
              value={form.departureCity}
              onChange={(e) => setField("departureCity", e.target.value)}
              placeholder="Indulás helye (pl. Zürich HB)"
              maxLength={RIDE_LIMITS.cityMax}
              className={inputCls(errors.departureCity)}
            />
            <FieldError msg={errors.departureCity} />
          </div>
          <div>
            <input
              type="text"
              value={form.destinationCity}
              onChange={(e) => setField("destinationCity", e.target.value)}
              placeholder="Érkezés helye (pl. Budapest Kelenföld)"
              maxLength={RIDE_LIMITS.cityMax}
              className={inputCls(errors.destinationCity)}
            />
            <FieldError msg={errors.destinationCity} />
          </div>
        </div>
      </Section>

      {/* Közbeeső megállók */}
      <Section title="Közbeeső megállók">
        <div className="space-y-2">
          {form.waypoints.map((wp, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#3a6ea5]/15 text-[10px] font-bold text-[#3a6ea5]">
                {i + 1}
              </span>
              <input
                type="text"
                value={wp}
                onChange={(e) => {
                  const next = [...form.waypoints];
                  next[i] = e.target.value;
                  setForm((f) => ({ ...f, waypoints: next }));
                }}
                placeholder={`${i + 1}. megálló (pl. Győr)`}
                maxLength={RIDE_LIMITS.cityMax}
                className={inputCls(errors.waypoints)}
              />
              <button
                type="button"
                onClick={() => {
                  const next = form.waypoints.filter((_, j) => j !== i);
                  setForm((f) => ({ ...f, waypoints: next }));
                }}
                aria-label="Megálló törlése"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-alt text-ink-muted active:scale-90"
              >
                <Icon name="close" size={14} strokeWidth={2.4} />
              </button>
            </div>
          ))}
          {form.waypoints.length < MAX_WAYPOINTS && (
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, waypoints: [...f.waypoints, ""] }))}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#3a6ea5] active:scale-95"
            >
              <Icon name="plus" size={14} strokeWidth={2.6} /> Megálló hozzáadása
            </button>
          )}
          <FieldError msg={errors.waypoints} />
        </div>
        <p className="mt-1 px-1 text-[10.5px] leading-snug text-ink-faint">
          Opcionális. Ott szállsz meg útközben, ahova útitársat keresel (pl. Győr, Hegyeshalom).
        </p>
      </Section>

      <Section title="Mikor indulsz?" required>
        <input
          type="datetime-local"
          value={form.departureTime}
          onChange={(e) => setField("departureTime", e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          className={inputCls(errors.departureTime)}
        />
        <FieldError msg={errors.departureTime} />
      </Section>

      <Section title="Részletek">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Szabad helyek
            </label>
            <select
              value={form.seats}
              onChange={(e) => setField("seats", e.target.value)}
              className={inputCls(errors.seats)}
            >
              {[1,2,3,4,5,6,7,8].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <FieldError msg={errors.seats} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Ár
            </label>
            <input
              type="text"
              value={form.priceText}
              onChange={(e) => setField("priceText", e.target.value)}
              placeholder="Pl. 40 CHF, Megegyezés szerint"
              maxLength={RIDE_LIMITS.priceMax}
              className={inputCls(errors.priceText)}
            />
            <FieldError msg={errors.priceText} />
          </div>
        </div>
      </Section>

      {showPosterName && (
        <Section title="Megjelenített név" required>
          <input
            type="text"
            value={form.posterName}
            onChange={(e) => setField("posterName", e.target.value)}
            placeholder="Pl. Kovács Anna"
            maxLength={RIDE_LIMITS.posterNameMax}
            className={inputCls(errors.posterName)}
          />
          <FieldError msg={errors.posterName} />
          <p className="mt-1 px-1 text-[10.5px] leading-snug text-ink-faint">
            Ez fog megjelenni a fuvar mellett a Telekocsi listán.
          </p>
        </Section>
      )}

      <Section title="Telefonszám" required>
        <input
          type="tel"
          value={form.contactPhone}
          onChange={(e) => setField("contactPhone", e.target.value)}
          placeholder="+41 79 123 45 67 vagy +36 30 123 4567"
          maxLength={RIDE_LIMITS.phoneMax}
          className={inputCls(errors.contactPhone)}
        />
        <FieldError msg={errors.contactPhone} />
        <p className="mt-1 px-1 text-[10.5px] leading-snug text-ink-faint">
          Ezen a számon keresnek meg a jelentkezők (hívás + WhatsApp). Nemzetközi formátum ajánlott.
        </p>
      </Section>

      <Section title="Megjegyzés">
        <textarea
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
          placeholder="Pl. Kutyát hozhatsz, 2 bőrönd fér, dohányzom…"
          maxLength={RIDE_LIMITS.notesMax}
          rows={3}
          className={cn(inputCls(errors.notes), "resize-none")}
        />
        <div className="mt-1 flex justify-between text-[10.5px] text-ink-faint">
          <span>Max {RIDE_LIMITS.notesMax} karakter</span>
          <span>{form.notes.length} / {RIDE_LIMITS.notesMax}</span>
        </div>
        <FieldError msg={errors.notes} />
      </Section>

      {turnstileSiteKey && (
        <div className="px-1">
          <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
        </div>
      )}

      {global && (
        <div className="rounded-card border border-accent/30 bg-accent-soft px-4 py-3 text-[12.5px] font-semibold text-accent">
          {global}
        </div>
      )}

      <button
        type="submit"
        disabled={phase === "submitting"}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-1.5 rounded-pill bg-[#3a6ea5] text-[14px] font-extrabold tracking-[-0.01em] text-white shadow-card-hover transition active:scale-[0.99]",
          phase === "submitting" && "cursor-not-allowed opacity-50",
        )}
      >
        {phase === "submitting" ? "Küldés…" : "Fuvar meghirdetése"}
        {phase !== "submitting" && <Icon name="arrowRight" size={15} strokeWidth={2.4} />}
      </button>

      <p className="px-1 text-center text-[10.5px] leading-snug text-ink-faint">
        A Kinti platform az utazásért és a felek közötti megállapodásért felelősséget nem vállal.
      </p>
    </form>
  );
}

// --- segédek ---------------------------------------------------------------

function Section({ title, required, children }: { title: string; required?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">{title}</h3>
        <span className={cn("text-[10.5px] font-semibold uppercase tracking-wide", required ? "text-accent" : "text-ink-faint")}>
          {required ? "kötelező" : "opcionális"}
        </span>
      </div>
      {children}
    </section>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-[11.5px] font-semibold text-accent" role="alert">{msg}</p>;
}

function inputCls(error?: string): string {
  return cn(
    "w-full rounded-[12px] border bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint",
    "focus:outline-none focus:ring-2 focus:ring-primary/30",
    error ? "border-accent/40" : "border-line",
  );
}
