"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { LIMITS, type ValidationError } from "@/lib/bulletin";
import type { BulletinKind } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Hirdetés-feladó űrlap (account nélküli). Liquid Glass kártyák szekciókba
 * rendezve. A flow:
 *
 *   1) felhasználó kitölti → 2) Turnstile widget tokent ad → 3) submit POST →
 *   4) email-megerősítő link → 5) klikk → /hirdetes-megerositve
 *
 * Visszajelzés: hibák mező-szinten + globális szövegmező az aljon.
 * Sikeres beküldés után az űrlap törlődik, és egy "Nézd meg a postafiókodat"
 * panel jelenik meg.
 */
export interface BulletinFormProps {
  kinds: BulletinKind[];
  turnstileSiteKey: string;
}

type Phase = "idle" | "submitting" | "sent" | "error";

interface FormState {
  email: string;
  kindId: string;
  title: string;
  meta: string;
  body: string;
  poster: string;
  /** Honeypot — bot kitölti, ember nem. Tailwind `hidden`-nel rejtve. */
  website: string;
}

const INITIAL: FormState = {
  email: "",
  kindId: "",
  title: "",
  meta: "",
  body: "",
  poster: "",
  website: "",
};

export function BulletinForm({ kinds, turnstileSiteKey }: BulletinFormProps) {
  const router = useRouter();
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
      const res = await fetch("/api/bulletin/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: ValidationError[];
      };
      if (!res.ok) {
        if (data.details?.length) {
          const map: Record<string, string> = {};
          for (const d of data.details) map[d.field as string] = d.message;
          setErrors(map);
        }
        setGlobal(data.error ?? "Hiba történt. Próbáld újra.");
        setPhase("error");
        return;
      }
      setPhase("sent");
      router.refresh();
    } catch (err) {
      setGlobal(err instanceof Error ? err.message : "Hálózati hiba.");
      setPhase("error");
    }
  }

  // --- siker-állapot — az űrlap helyén egy „Nézd meg a postafiókodat” panel
  if (phase === "sent") {
    return (
      <div className="rounded-card border border-line bg-surface p-6 text-center shadow-card">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white">
          <Icon name="send" size={22} strokeWidth={2.2} />
        </div>
        <h2 className="mt-3 text-[18px] font-extrabold tracking-tight text-ink">
          Megnéznéd a postafiókodat?
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-pretty text-[13.5px] leading-relaxed text-ink-muted">
          Küldtünk egy emailt a <strong className="text-ink">{form.email}</strong> címre. A megerősítő
          linkre kattintva azonnal megjelenik a hirdetésed. A link 24 órán át érvényes.
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
          Új hirdetés feladása
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {/* Kategória */}
      <Section title="Kategória" required>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {kinds.map((k) => {
            const active = form.kindId === k.id;
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => setField("kindId", k.id)}
                className={cn(
                  "rounded-[12px] border px-2 py-2 text-[12.5px] font-bold transition",
                  active
                    ? "border-transparent bg-primary text-white shadow-card"
                    : "border-line bg-surface-alt text-ink hover:bg-surface",
                )}
                style={
                  active && k.color
                    ? { backgroundColor: k.color, borderColor: k.color }
                    : undefined
                }
              >
                {k.label}
              </button>
            );
          })}
        </div>
        <FieldError msg={errors.kindId} />
      </Section>

      {/* Cím + meta */}
      <Section title="Mit ajánlasz?" required>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Pl. 2.5-szobás Kreis 4-ben kiadó"
          maxLength={LIMITS.titleMax}
          className={inputCls(errors.title)}
        />
        <FieldError msg={errors.title} />

        <input
          type="text"
          value={form.meta}
          onChange={(e) => setField("meta", e.target.value)}
          placeholder='Pl. "Zürich · 1 980 CHF / hó" (opcionális)'
          maxLength={LIMITS.metaMax}
          className={cn(inputCls(errors.meta), "mt-2")}
        />
        <FieldError msg={errors.meta} />
      </Section>

      {/* Hosszabb leírás */}
      <Section title="Leírás (opcionális)">
        <textarea
          value={form.body}
          onChange={(e) => setField("body", e.target.value)}
          placeholder="Pár sor a hirdetésről…"
          maxLength={LIMITS.bodyMax}
          rows={4}
          className={cn(inputCls(errors.body), "resize-none")}
        />
        <div className="mt-1 flex justify-between text-[10.5px] text-ink-faint">
          <span>Max {LIMITS.bodyMax} karakter</span>
          <span>{form.body.length} / {LIMITS.bodyMax}</span>
        </div>
        <FieldError msg={errors.body} />
      </Section>

      {/* Feladó-név + email */}
      <Section title="Tetőtér" required>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <input
              type="text"
              value={form.poster}
              onChange={(e) => setField("poster", e.target.value)}
              placeholder="Megjelenő név (pl. Tímea)"
              maxLength={LIMITS.posterMax}
              className={inputCls(errors.poster)}
            />
            <FieldError msg={errors.poster} />
          </div>
          <div>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="Email a megerősítéshez"
              autoComplete="email"
              maxLength={LIMITS.emailMax}
              className={inputCls(errors.email)}
            />
            <FieldError msg={errors.email} />
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-ink-muted">
          Az emailedet csak a megerősítő és kezelő linkek elküldésére használjuk.
          A hirdetésen csak a megjelenő név látszik, az email nem. Részletek:{" "}
          <Link href="/adatvedelem" className="underline">Adatkezelési Tájékoztató</Link>.
        </p>
      </Section>

      {/* Bot-csapda — sose lássa az ember */}
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

      {/* Turnstile */}
      <div className="px-1">
        <TurnstileWidget siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
      </div>

      {/* Global hiba */}
      {global && (
        <div className="rounded-card border border-accent/30 bg-accent-soft px-4 py-3 text-[12.5px] font-semibold text-accent">
          {global}
        </div>
      )}

      {/* Beküldés gomb */}
      <button
        type="submit"
        disabled={phase === "submitting"}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-1.5 rounded-pill bg-primary text-[14px] font-extrabold tracking-[-0.01em] text-white shadow-card-hover transition active:scale-[0.99]",
          phase === "submitting" && "opacity-60",
        )}
      >
        {phase === "submitting" ? "Küldés…" : "Hirdetés beküldése"}
        {phase !== "submitting" && <Icon name="arrowRight" size={15} strokeWidth={2.4} />}
      </button>

      <p className="px-1 text-center text-[11px] leading-snug text-ink-faint">
        A beküldéssel elfogadod az{" "}
        <Link href="/aszf" className="underline">ÁSZF</Link>-et.
      </p>
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
        <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          {title}
        </h3>
        {required && (
          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-accent">
            kötelező
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

function inputCls(error?: string): string {
  return cn(
    "w-full rounded-[12px] border bg-surface-alt px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint",
    "focus:outline-none focus:ring-2 focus:ring-primary/30",
    error ? "border-accent/40" : "border-line",
  );
}
