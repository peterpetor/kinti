"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import {
  REVIEW_LIMITS,
  type ReviewValidationError,
} from "@/lib/reviews";
import { cn } from "@/lib/cn";
import { PostSavePrompt } from "@/components/post-save-prompt";

/**
 * Account nélküli vélemény-űrlap (Liquid Glass kártyák). Flow:
 *   1) felhasználó csillagot ad, szöveget ír, nevet + emailt
 *   2) ÁSZF + 18+ checkbox
 *   3) Turnstile token
 *   4) POST → email kimegy → kattintás → publikus
 *
 * Az űrlap csak akkor látszik, ha a felhasználó megnyomja a "Vélemény írása"
 * gombot — addig kompakt CTA, hogy a vállalkozás oldal ne legyen zsúfolt.
 */
export interface ReviewFormProps {
  businessId: string;
  businessName: string;
  turnstileSiteKey: string;
  /** true = azonnal nyitva (vélemény-nudge email ?ertekeles=1 mélylinkje). */
  initialOpen?: boolean;
}

type Phase = "idle" | "submitting" | "sent" | "error";

interface FormState {
  email: string;
  rating: number;
  body: string;
  reviewerName: string;
  website: string;
  acceptTerms: boolean;
  ageConfirmed: boolean;
}

const INITIAL: FormState = {
  email: "",
  rating: 0,
  body: "",
  reviewerName: "",
  website: "",
  acceptTerms: false,
  ageConfirmed: false,
};

export function ReviewForm({
  businessId,
  businessName,
  turnstileSiteKey,
  initialOpen = false,
}: ReviewFormProps) {
  const [open, setOpen] = useState(initialOpen);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [global, setGlobal] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const [published, setPublished] = useState<{ id: string; manageToken: string; manageUrl: string } | null>(null);

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
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, businessId, turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: ReviewValidationError[];
        published?: boolean;
        id?: string;
        manageToken?: string;
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
      if (data.published && data.id && data.manageToken && data.manageUrl) {
        setPublished({ id: data.id, manageToken: data.manageToken, manageUrl: data.manageUrl });
      }
      setPhase("sent");
    } catch (err) {
      setGlobal(err instanceof Error ? err.message : "Hálózati hiba.");
      setPhase("error");
      turnstileRef.current?.reset();
    }
  }

  // Sikeres beküldés
  if (phase === "sent") {
    if (published) {
      return (
        <div className="rounded-card border border-line bg-surface p-5 shadow-card">
          <div className="mb-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-success/15 text-success">
              <Icon name="check" size={20} strokeWidth={2.4} />
            </div>
            <h3 className="mt-3 text-[16px] font-extrabold tracking-tight text-ink">
              Az értékelésed fent van!
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-pretty text-[13px] leading-relaxed text-ink-muted">
              Megjelent a <strong className="text-ink">{businessName}</strong> oldalán.
            </p>
          </div>
          <PostSavePrompt
            type="review"
            id={published.id}
            manageToken={published.manageToken}
            title={`${form.rating}★ — ${businessName}`}
            manageUrl={published.manageUrl}
          />
          <button
            type="button"
            onClick={() => {
              setForm(INITIAL);
              setTurnstileToken("");
              setPublished(null);
              setPhase("idle");
              setOpen(false);
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-pill border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink"
          >
            Bezár
          </button>
        </div>
      );
    }
    return (
      <div className="rounded-card border border-line bg-surface p-5 text-center shadow-card">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white">
          <Icon name="send" size={20} strokeWidth={2.2} />
        </div>
        <h3 className="mt-3 text-[16px] font-extrabold tracking-tight text-ink">
          Megnéznéd a postafiókodat?
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-pretty text-[13px] leading-relaxed text-ink-muted">
          Küldtünk egy emailt a <strong className="text-ink">{form.email}</strong> címre.
          A megerősítő linkre kattintva azonnal megjelenik az értékelésed itt,{" "}
          <strong className="text-ink">{businessName}</strong> oldalán. A link 24
          órán át érvényes.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(INITIAL);
            setTurnstileToken("");
            setPhase("idle");
            setOpen(false);
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink"
        >
          Bezár
        </button>
      </div>
    );
  }

  // Kompakt CTA
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary-soft/60 p-3.5 transition active:scale-[0.99]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-primary text-white">
          <Icon name="star" size={16} strokeWidth={2.4} filled />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <div className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">
            Értékeld csillaggal
          </div>
          <div className="text-[11.5px] text-ink-muted">
            Regisztráció nélkül, pár másodperc alatt
          </div>
        </div>
        <Icon name="chevR" size={14} className="text-ink-muted" />
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {/* Csillag-választó — ez a kötelező rész (a „kötelező" jelzés a csillagokra
          vonatkozik, NEM az emailre/szövegre). */}
      <Section title="Hány csillagot adsz?" required>
        <RatingPicker
          value={form.rating}
          onChange={(v) => setField("rating", v)}
        />
        <FieldError msg={errors.rating} />
      </Section>

      {/* Szöveges vélemény — OPCIONÁLIS. Minden vélemény kézi jóváhagyás után
          jelenik meg; a trágár szöveget a szerver beküldéskor elutasítja. */}
      <Section title="Írnál róla pár mondatot? (opcionális)">
        <textarea
          value={form.body}
          onChange={(e) => setField("body", e.target.value)}
          placeholder="Pl. Pontos volt, korrekt áron dolgozott, magyarul intéztünk mindent…"
          maxLength={REVIEW_LIMITS.bodyMax}
          rows={3}
          className={cn(inputCls(errors.body), "resize-y")}
        />
        <FieldError msg={errors.body} />
        <p className="mt-1.5 text-[11px] leading-snug text-ink-muted">
          Jóváhagyás után jelenik meg a vállalkozás oldalán, a csillagod mellett.
        </p>
      </Section>

      {/* Becenév — OPCIONÁLIS. Üresen hagyva auto-generált álnév (GyorsSün_15
          stílus) kerül a publikus vélemény mellé. Teljes nevet nem kérünk. */}
      <Section title="Becenév / keresztnév (opcionális)">
        <input
          type="text"
          value={form.reviewerName}
          onChange={(e) => setField("reviewerName", e.target.value)}
          placeholder="Pl. Kata — vagy hagyd üresen"
          autoComplete="given-name"
          maxLength={REVIEW_LIMITS.reviewerNameMax}
          className={inputCls(errors.reviewerName)}
        />
        <FieldError msg={errors.reviewerName} />
        <p className="mt-2 text-[11px] leading-snug text-ink-muted">
          Ez jelenik meg az értékelésed mellett. Üresen hagyva egy játékos álnevet
          kapsz (pl. „GyorsSün_15"). Elég egy keresztnév vagy becenév.
        </p>
      </Section>

      {/* Email — OPCIONÁLIS. Zéró tárolt PII. */}
      <Section title="Email (opcionális)">
        <div>
          <div>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="Email — vagy hagyd üresen"
              autoComplete="email"
              maxLength={REVIEW_LIMITS.emailMax}
              className={inputCls(errors.email)}
            />
            <FieldError msg={errors.email} />
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-ink-muted">
          <strong className="text-ink">Email nem szükséges.</strong> Email nélkül az értékelés
          azonnal megjelenik, és kapsz egy kezelő-linket. Ha emailt is megadsz, először egy
          megerősítő linket küldünk rá — csak miután rákattintasz, jelenik meg az értékelés.
          Az email sehol nem publikus, csak nálunk látható.
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

      {/* Hozzájárulások */}
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
          <Link href="/aszf" target="_blank" className="underline">
            ÁSZF
          </Link>
          -et és az{" "}
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

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex h-12 items-center justify-center rounded-pill border border-line bg-surface px-5 text-[13.5px] font-bold text-ink"
        >
          Mégse
        </button>
        <button
          type="submit"
          disabled={
            phase === "submitting" || form.rating < 1 || !form.acceptTerms || !form.ageConfirmed
          }
          className={cn(
            "flex h-12 flex-1 items-center justify-center gap-1.5 rounded-pill bg-primary text-[14px] font-extrabold tracking-[-0.01em] text-white shadow-card-hover transition active:scale-[0.99]",
            (phase === "submitting" || form.rating < 1 || !form.acceptTerms || !form.ageConfirmed) &&
              "cursor-not-allowed opacity-50",
          )}
        >
          {phase === "submitting" ? "Küldés…" : form.rating < 1 ? "Előbb adj csillagot" : "Értékelés beküldése"}
          {phase !== "submitting" && form.rating >= 1 && (
            <Icon name="arrowRight" size={15} strokeWidth={2.4} />
          )}
        </button>
      </div>
    </form>
  );
}

// --- segéd-komponensek ------------------------------------------------------

function RatingPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        return (
          <button
            key={n}
            type="button"
            aria-label={`${n} csillag`}
            onClick={() => onChange(n)}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-[12px] transition",
              active ? "text-star" : "text-line-strong hover:text-ink-muted",
            )}
          >
            <Icon name="star" size={26} strokeWidth={1.8} filled={active} />
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-[13px] font-bold text-ink-muted">
          {value}/5
        </span>
      )}
    </div>
  );
}

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
          <span className="text-[11.5px] font-semibold uppercase tracking-wide text-accent">
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
