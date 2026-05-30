"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { LIMITS, type ValidationError } from "@/lib/bulletin";
import type { BulletinKind } from "@/lib/types";
import { cn } from "@/lib/cn";
import { BulletinImageUploader } from "./bulletin-image-uploader";
import { CANTONS } from "@/lib/cantons";
import { PostSavePrompt } from "@/components/post-save-prompt";
import { loadFormPrefs, saveFormPrefs } from "@/lib/form-prefs";

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
  /** Telefonszám (opcionális). */
  phone: string;
  /** WhatsApp szám (opcionális). Ha üres, a phone-ra megy a WA-link. */
  whatsapp: string;
  kindId: string;
  title: string;
  meta: string;
  body: string;
  poster: string;
  imageKey: string | null;
  cantonCode: string;
  /** Opcionális strukturált ár (CHF) — string a beviteli mezőből. */
  price: string;
  /** Honeypot — bot kitölti, ember nem. Tailwind `hidden`-nel rejtve. */
  website: string;
  /** Kötelező: ÁSZF + Adatkezelési Tájékoztató elfogadása. */
  acceptTerms: boolean;
  /** Kötelező: 18+ nyilatkozat (Ptk. 2:10 §). */
  ageConfirmed: boolean;
}

const INITIAL: FormState = {
  email: "",
  phone: "",
  whatsapp: "",
  kindId: "",
  title: "",
  meta: "",
  body: "",
  poster: "",
  imageKey: null,
  cantonCode: "",
  price: "",
  website: "",
  acceptTerms: false,
  ageConfirmed: false,
};

export function BulletinForm({ kinds, turnstileSiteKey }: BulletinFormProps) {
  const router = useRouter();
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

  // Mount-on: utoljára használt értékek előkitöltése (kanton, név, telefon, email)
  useEffect(() => {
    const prefs = loadFormPrefs();
    setForm((f) => ({
      ...f,
      cantonCode: f.cantonCode || prefs.cantonCode || "",
      poster: f.poster || prefs.posterName || "",
      phone: f.phone || prefs.phone || "",
      whatsapp: f.whatsapp || prefs.whatsapp || "",
      email: f.email || prefs.email || "",
    }));
  }, []);

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
      // Local-first publish: a manage_token AZONNAL visszaérkezik
      if (data.published && data.id && data.manageToken && data.manageUrl) {
        setPublished({ id: data.id, manageToken: data.manageToken, manageUrl: data.manageUrl });
      }
      // Sikeres beküldés: lementjük az utoljára használt értékeket következő űrlap-megnyitáshoz
      saveFormPrefs({
        cantonCode: form.cantonCode || undefined,
        posterName: form.poster || undefined,
        phone: form.phone || undefined,
        whatsapp: form.whatsapp || undefined,
        email: form.email || undefined,
      });
      setPhase("sent");
      router.refresh();
    } catch (err) {
      setGlobal(err instanceof Error ? err.message : "Hálózati hiba.");
      setPhase("error");
      turnstileRef.current?.reset();
    }
  }

  // --- siker-állapot
  if (phase === "sent") {
    // Local-first (nincs email): azonnal publikus + PostSavePrompt
    if (published) {
      return (
        <div className="rounded-card border border-line bg-surface p-6 shadow-card">
          <div className="mb-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-success/15 text-success">
              <Icon name="check" size={22} strokeWidth={2.4} />
            </div>
            <h2 className="mt-3 text-[18px] font-extrabold tracking-tight text-ink">
              Hirdetésed beérkezett!
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-pretty text-[13.5px] leading-relaxed text-ink-muted">
              Az adminisztrátor hamarosan ellenőrzi és aktiválja (általában 24 órán belül).
              A kezelő-linkkel addig is bármikor szerkesztheted vagy törölheted.
            </p>
          </div>
          <PostSavePrompt
            type="bulletin"
            id={published.id}
            manageToken={published.manageToken}
            title={form.title}
            manageUrl={published.manageUrl}
          />
          <button
            type="button"
            onClick={() => {
              setForm(INITIAL);
              setTurnstileToken("");
              setPublished(null);
              setPhase("idle");
            }}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-pill border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink"
          >
            Új hirdetés feladása
          </button>
        </div>
      );
    }
    // Legacy email-confirm flow
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
          linkre kattintva véglegesítheted a hirdetés feladását. A link 24 órán át érvényes.
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

      {/* Hirdetés címe */}
      <Section title="Hirdetés címe" required>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Pl. 2.5-szobás lakás kiadó, Fodrászt keresünk"
          maxLength={LIMITS.titleMax}
          className={inputCls(errors.title)}
        />
        <FieldError msg={errors.title} />
      </Section>

      {/* Helyszín és ár */}
      <Section title="Helyszín és Ár" required>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <select
              value={form.cantonCode}
              onChange={(e) => setField("cantonCode", e.target.value)}
              className={inputCls(errors.cantonCode)}
            >
              <option value="" className="text-ink-faint">Melyik kantonban?</option>
              {CANTONS.map((c) => (
                <option key={c.code} value={c.code} className="text-ink">
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
            <FieldError msg={errors.cantonCode} />
          </div>
          <div>
            <div className="flex items-center gap-2 rounded-[12px] border border-line bg-surface-alt focus-within:ring-2 focus-within:ring-primary/30">
              <span className="pl-3 text-[12px] font-bold uppercase tracking-wide text-ink-muted">
                Ár
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={100000000}
                step={1}
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                placeholder="Pl. 1980"
                className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-[14px] text-ink placeholder:text-ink-faint outline-none"
              />
              <span className="pr-3 text-[12.5px] font-bold text-ink-muted">CHF</span>
            </div>
            <p className="mt-1 px-1 text-[10.5px] leading-snug text-ink-faint">
              Üres = nem ismert / ingyenes / álláshirdetés.
            </p>
            <FieldError msg={errors.price} />
          </div>
        </div>
      </Section>

      {/* További részletek (opcionális) */}
      <Section title="További részletek">
        <input
          type="text"
          value={form.meta}
          onChange={(e) => setField("meta", e.target.value)}
          placeholder='Pl. bútorozott, lift, parking, 3 szoba'
          maxLength={LIMITS.metaMax}
          className={inputCls(errors.meta)}
        />
        <p className="mt-1 px-1 text-[10.5px] leading-snug text-ink-faint">
          Rövid főbb jellemzők a keresési kártyán. Max {LIMITS.metaMax} karakter.
        </p>
        <FieldError msg={errors.meta} />
      </Section>

      {/* Hosszabb leírás */}
      <Section title="Leírás">
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
        <div className="mt-2 rounded-[10px] border border-accent/30 bg-accent/5 px-3 py-2 text-[11px] leading-snug text-ink-muted">
          <strong className="text-accent">⚠ Adatvédelem:</strong> Csak a saját
          adataidat tüntesd fel (név, telefon, email). Idegen személy adatát
          (pl. mások telefonszámát) <strong>NE add meg</strong> — ez sérti a
          GDPR-t és a feladó (te) felelős érte. Engedélyköteles tevékenységeket
          (orvosi, jogi, pénzügyi tanácsadás stb.) csak hivatalos engedélyszámmal
          hirdethetsz.
        </div>
      </Section>

      {/* Képek feltöltése */}
      <Section title="Képek">
        <BulletinImageUploader
          value={form.imageKey}
          onChange={(val) => setField("imageKey", val)}
          maxImages={3}
          onAnalysisComplete={(data) => {
            setForm((f) => {
              const next = { ...f };
              if (!f.title && data.title) next.title = data.title;
              if (!f.body && data.description) next.body = data.description;
              if (!f.kindId && data.categoryId) {
                const match = kinds.find((k) =>
                  k.label.toLowerCase().includes(data.categoryId!.toLowerCase()) ||
                  data.categoryId!.toLowerCase().includes(k.label.toLowerCase())
                );
                if (match) next.kindId = match.id;
              }
              return next;
            });
          }}
        />
      </Section>

      {/* Megjelenő név — kötelező */}
      <Section title="Megjelenő név" required>
        <input
          type="text"
          value={form.poster}
          onChange={(e) => setField("poster", e.target.value)}
          placeholder="Pl. Tímea"
          maxLength={LIMITS.posterMax}
          className={inputCls(errors.poster)}
        />
        <FieldError msg={errors.poster} />
        <p className="mt-2 text-[11px] leading-snug text-ink-muted">
          Ezen a néven jelensz meg a hirdetésed mellett.
        </p>
      </Section>

      {/* Elérhetőség — egyetlen TELEFON elsődleges, többi a "Több opció" alatt */}
      <Section title="Elérhetőség" required>
        <p className="mb-3 text-[11.5px] leading-snug text-ink-muted">
          Hogyan érjenek el? <strong className="text-ink">Legalább egy módon legyél elérhető</strong> —
          a többit elhagyhatod.
        </p>

        {/* TELEFON — elsődleges, mindig látható */}
        <label className="block mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          📞 Telefonszám
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setField("phone", e.target.value)}
          placeholder="+41 79 123 45 67"
          autoComplete="tel"
          maxLength={LIMITS.phoneMax}
          className={inputCls(errors.phone)}
        />
        <FieldError msg={errors.phone} />
        <p className="mt-1 text-[10.5px] leading-snug text-ink-faint">
          Erre megy a <strong>Hívás</strong> ÉS a <strong>WhatsApp</strong> gomb is.
        </p>

        {/* Több opció — collapsed alapból, csak ha valakinek külön WA/email kell */}
        <details className="mt-4 group">
          <summary className="cursor-pointer text-[12px] font-bold text-primary hover:underline list-none flex items-center gap-1.5">
            <span className="transition group-open:rotate-90">▶</span>
            Másik WhatsApp szám vagy email is van?
          </summary>

          <div className="mt-3 space-y-3 rounded-[12px] border border-line bg-surface-alt/50 p-3">
            <div>
              <label className="block mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                💬 Másik WhatsApp szám
              </label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => setField("whatsapp", e.target.value)}
                placeholder="+41 78 ..."
                autoComplete="off"
                maxLength={LIMITS.phoneMax}
                className={inputCls(errors.whatsapp)}
              />
              <FieldError msg={errors.whatsapp} />
              <p className="mt-1 text-[10.5px] leading-snug text-ink-faint">
                Csak ha a WhatsApp-od másik számon van, mint a telefonszámod.
              </p>
            </div>

            <div>
              <label className="block mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                ✉️ Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="email@pelda.hu"
                autoComplete="email"
                maxLength={LIMITS.emailMax}
                className={inputCls(errors.email)}
              />
              <FieldError msg={errors.email} />
              <p className="mt-1 text-[10.5px] leading-snug text-ink-faint">
                Email megadása esetén először megerősítő linket küldünk rá — csak utána jelenik meg a hirdetés.
              </p>
            </div>
          </div>
        </details>

        <p className="mt-3 text-[10.5px] leading-snug text-ink-faint">
          Részletek a tárolásról:{" "}
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

      {/* Feketemunka (Schwarzarbeit) figyelmeztetés állás és szolgáltatás esetén */}
      {["allas", "szolg"].includes(form.kindId) && (
        <div className="rounded-[12px] border border-accent/40 bg-accent/5 p-4 text-[13px] leading-relaxed text-ink-muted shadow-sm">
          <p className="font-bold text-accent mb-1 flex items-center gap-1.5">
            <span>⚠️</span> Fontos jogi figyelmeztetés
          </p>
          <p>
            Svájcban a munkavégzés <strong>kizárólag érvényes munkavállalási engedéllyel</strong> és társadalombiztosítási bejelentéssel (AHV) legális. A feketemunka (Schwarzarbeit) hirdetése szigorúan tilos. Engedélyköteles szakmákat csak engedély birtokában hirdethetsz.
          </p>
        </div>
      )}

      {/* Kötelező nyilatkozatok — Ptk. 2:10 § (18+) + szabad hozzájárulás */}
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

      {/* Turnstile */}
      <div className="px-1">
        <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
      </div>

      {/* Global hiba */}
      {global && (
        <div className="rounded-card border border-accent/30 bg-accent-soft px-4 py-3 text-[12.5px] font-semibold text-accent">
          {global}
        </div>
      )}

      {/* Beküldés gomb — csak akkor aktív, ha mindkét hozzájárulás megvan */}
      <button
        type="submit"
        disabled={
          phase === "submitting" || !form.acceptTerms || !form.ageConfirmed
        }
        className={cn(
          "flex h-12 w-full items-center justify-center gap-1.5 rounded-pill bg-primary text-[14px] font-extrabold tracking-[-0.01em] text-white shadow-card-hover transition active:scale-[0.99]",
          (phase === "submitting" || !form.acceptTerms || !form.ageConfirmed) &&
            "cursor-not-allowed opacity-50",
        )}
      >
        {phase === "submitting" ? "Küldés…" : "Hirdetés beküldése"}
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
