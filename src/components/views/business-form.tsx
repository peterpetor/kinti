"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { cn } from "@/lib/cn";
import { CANTONS, isSwissAddress } from "@/lib/cantons";
import { BUSINESS_LIMITS, type BusinessValidationError } from "@/lib/business";
import type { Category } from "@/lib/types";
import { PostSavePrompt } from "@/components/post-save-prompt";

/**
 * Engedélyköteles kategóriák (SZF 3.1) — ha valaki ilyen kategóriát választ,
 * az UI automatikusan kéri az engedélyszámot.
 */
const LICENSED_CATEGORY_IDS = new Set([
  // Egészségügy
  "orvos", "fogorvos", "gyogyszeresz", "pszichologus", "fizioterapia",
  "nogyogyasz", "gyermekorvos", "borgyogyasz", "ortopedus", "pszichiater",
  "urologus", "belgyogyasz", "kardiologus", "sebesz", "szemesz", "ful-orr-gege",
  "radiologus", "neurologist",
  // Jog és pénz
  "ugyvéd", "ugyvéd", "kozjegyzo", "adotanacsado", "befektetési-tanácsadó",
  "biztositaskozveto", "vagyonkezelo",
  // Építészet
  "epitesz", "statikus", "energetikai-tanusite",
  // Gyermek és gondozás
  "gyermekgondozo", "idosgondozo", "oktatas", "magantanar",
]);

function isLicensedCategory(categoryId: string): boolean {
  return LICENSED_CATEGORY_IDS.has(categoryId.toLowerCase());
}

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
  licenseNumber: string;
  licenseAccepted: boolean; // nyilatkozat engedélyköteles kategóriákhoz
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
  licenseNumber: "",
  licenseAccepted: false,
  website: "",
  acceptTerms: false,
  ageConfirmed: false,
};

interface AiSuggestion {
  polishedDescription: string | null;
  suggestedCategoryId: string | null;
  reasoning: string;
}

export function BusinessForm({ categories, turnstileSiteKey }: BusinessFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiBusy, setAiBusy] = useState(false);
  const [aiResult, setAiResult] = useState<AiSuggestion | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [global, setGlobal] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const [published, setPublished] = useState<{ id: string; manageToken: string; manageUrl: string } | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function handleAiHelp() {
    if (form.blurb.trim().length < 10) {
      setAiError("Írj legalább 10 karakteres leírást, hogy tudjak segíteni.");
      return;
    }
    setAiBusy(true);
    setAiError(null);
    setAiResult(null);
    try {
      const res = await fetch("/api/ai/business-helper", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          description: form.blurb,
          currentCategoryId: form.categoryId || undefined,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setAiError(j.error ?? "Az AI nem tudott segíteni most.");
        setAiBusy(false);
        return;
      }
      const data = (await res.json()) as AiSuggestion;
      setAiResult(data);
      setAiBusy(false);
    } catch {
      setAiError("Hálózati hiba.");
      setAiBusy(false);
    }
  }

  function applyAiSuggestion(applyDesc: boolean, applyCat: boolean) {
    if (!aiResult) return;
    if (applyDesc && aiResult.polishedDescription) {
      setField("blurb", aiResult.polishedDescription);
    }
    if (applyCat && aiResult.suggestedCategoryId) {
      const cat = categories.find((c) => c.id === aiResult.suggestedCategoryId);
      if (cat) {
        setField("categoryId", cat.id);
        setField("categoryLabel", cat.label);
      }
    }
    setAiResult(null);
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
        let errMsg = data.error ?? "Hiba történt. Próbáld újra.";
        if (data.detail) errMsg += " (" + data.detail + ")";
        setGlobal(errMsg);
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

  if (phase === "sent") {
    // Local-first publikálás → PostSavePrompt
    if (published) {
      return (
        <div className="rounded-card border border-line bg-surface p-6 shadow-card">
          <div className="mb-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-success/15 text-success">
              <Icon name="check" size={22} strokeWidth={2.4} />
            </div>
            <h2 className="mt-3 text-[18px] font-extrabold tracking-tight text-ink">
              A vállalkozásod fent van!
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-pretty text-[13.5px] leading-relaxed text-ink-muted">
              Megjelent a Szaknévsorban. A részleteket (logó, nyitvatartás, leírás)
              a kezelő-linkről állíthatod be.
            </p>
          </div>
          <PostSavePrompt
            type="business"
            id={published.id}
            manageToken={published.manageToken}
            title={form.name}
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
            Másik vállalkozás hozzáadása
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
        <div className="mt-2 rounded-[10px] border border-accent/30 bg-accent/5 px-3 py-2 text-[11px] leading-snug text-ink-muted">
          <strong className="text-accent">⚠ Felelősség:</strong> A leírás
          tartalmáért, valóságtartalmáért és a megadott szakképesítésekért
          kizárólag <strong>te felelsz</strong>. Engedélyköteles tevékenységeket
          (orvosi, jogi, befektetési-tanácsadói, gyógyszerészeti stb.) csak
          érvényes hatósági engedélyszámmal jeleníthetsz meg. A feketemunka és
          a hatósági engedély nélküli tevékenység hirdetése tilos.
        </div>

        {/* AI-segéd: leírás-csiszolás + kategória-javaslat */}
        <div className="mt-2">
          <button
            type="button"
            onClick={handleAiHelp}
            disabled={aiBusy || form.blurb.trim().length < 10}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11.5px] font-extrabold transition active:scale-95",
              aiBusy || form.blurb.trim().length < 10
                ? "bg-surface-alt text-ink-muted cursor-not-allowed"
                : "border border-primary/30 bg-primary-soft/40 text-primary hover:bg-primary-soft/60",
            )}
          >
            <Icon name="sparkles" size={11} strokeWidth={2.4} />
            {aiBusy ? "AI gondolkodik…" : "AI segítség (csiszolás + kategória-javaslat)"}
          </button>
          {aiError && (
            <p className="mt-1 text-[11px] font-bold text-accent">{aiError}</p>
          )}
        </div>

        {aiResult && (
          <div className="mt-2 rounded-card border-2 border-primary/30 bg-primary-soft/40 p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <Icon name="sparkles" size={12} strokeWidth={2.4} className="text-primary" />
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-primary">
                AI javaslat — Te döntesz, elfogadod-e
              </span>
            </div>

            {aiResult.polishedDescription && (
              <div className="rounded-[10px] border border-primary/20 bg-surface p-2.5">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
                  Csiszolt leírás:
                </p>
                <p className="mt-1 text-[12.5px] text-ink leading-relaxed">
                  {aiResult.polishedDescription}
                </p>
                <button
                  type="button"
                  onClick={() => applyAiSuggestion(true, false)}
                  className="mt-2 text-[11px] font-bold text-primary underline"
                >
                  Ezt használom
                </button>
              </div>
            )}

            {aiResult.suggestedCategoryId &&
              aiResult.suggestedCategoryId !== form.categoryId && (
                <div className="rounded-[10px] border border-primary/20 bg-surface p-2.5">
                  <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
                    Javasolt kategória:
                  </p>
                  <p className="mt-1 text-[12.5px] font-bold text-ink">
                    {categories.find((c) => c.id === aiResult.suggestedCategoryId)?.label ||
                      aiResult.suggestedCategoryId}
                  </p>
                  {aiResult.reasoning && (
                    <p className="mt-0.5 text-[11px] text-ink-muted italic">
                      {aiResult.reasoning}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => applyAiSuggestion(false, true)}
                    className="mt-2 text-[11px] font-bold text-primary underline"
                  >
                    Kategória átállítása
                  </button>
                </div>
              )}

            {aiResult.polishedDescription &&
              aiResult.suggestedCategoryId &&
              aiResult.suggestedCategoryId !== form.categoryId && (
                <button
                  type="button"
                  onClick={() => applyAiSuggestion(true, true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-[12px] font-extrabold text-white shadow-card active:scale-95"
                >
                  Mindkét javaslat elfogadása
                </button>
              )}
            <button
              type="button"
              onClick={() => setAiResult(null)}
              className="block w-full text-center text-[10.5px] text-ink-faint underline"
            >
              Mégse, hagyom úgy
            </button>
          </div>
        )}
      </Section>

      {/* Engedélyköteles kategória — hatósági engedélyszám */}
      {isLicensedCategory(form.categoryId) && (
        <section className="rounded-card border-2 border-[#e3a233]/50 bg-[#fff8ed] p-4 shadow-card space-y-3">
          <div className="flex items-start gap-2.5">
            <span className="text-xl shrink-0">⚠️</span>
            <div className="min-w-0">
              <h3 className="text-[12px] font-extrabold uppercase tracking-wide text-[#b8860b]">Engedélyköteles tevékenység</h3>
              <p className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">
                A választott kategória hatósági engedélyhez vagy szakképesítéshez kötött (ÁSZF 3.1).
                Az <strong className="text-ink">engedélyszámot</strong> (pl. FMH-szám, GLN, ügyvédi
                kamarai szám, adótanácsadói igazolvány száma) meg kell adnod a profilodon.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
              Hatósági engedélyszám / Kamarai szám
            </label>
            <input
              type="text"
              value={form.licenseNumber}
              onChange={(e) => setField("licenseNumber", e.target.value)}
              placeholder="Pl. FMH 12345 · GLN 7601003456789 · ZH RA 2024/001"
              maxLength={120}
              className={inputCls(errors.licenseNumber)}
            />
            <FieldError msg={errors.licenseNumber} />
            <p className="mt-1.5 text-[10.5px] leading-snug text-ink-faint">
              Az engedélyszám a profilodon fog megjelenni a bizalom növelése érdekében.
              Engedély nélküli hirdetés a platform szabályait sérti és azonnal törölhető (ÁSZF 4. §).
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-[10px] border border-[#e3a233]/40 bg-white/60 px-3 py-2">
            <input
              type="checkbox"
              checked={form.licenseAccepted}
              onChange={(e) => setField("licenseAccepted", e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-none cursor-pointer accent-primary"
            />
            <span className="text-[11.5px] leading-relaxed text-ink">
              <strong>Kijelentem</strong>, hogy rendelkezem az érvényes, hatályos hatósági engedéllyel /
              szakmai kamarai tagsággal az általam meghirdetett tevékenységhez, és az
              adatok valóságtartalmáért kizárólagos felelősséget vállalok.
            </span>
          </label>
          {errors.licenseAccepted && (
            <p className="text-[11.5px] font-semibold text-accent" role="alert">{errors.licenseAccepted}</p>
          )}
        </section>
      )}

      {/* Email — OPCIONÁLIS */}
      <Section title="Email (opcionális)">
        <input
          type="email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="te@example.ch (nem kötelező)"
          autoComplete="email"
          maxLength={BUSINESS_LIMITS.emailMax}
          className={inputCls(errors.email)}
        />
        <FieldError msg={errors.email} />
        <p className="mt-2 text-[11px] leading-snug text-ink-muted">
          <strong className="text-ink">Email nem szükséges.</strong> Ha üresen hagyod,
          a vállalkozás azonnal megjelenik, és kapsz egy kezelő-linket (QR-kód is jön)
          a részletek beállításához. Részletek:{" "}
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
        disabled={
          phase === "submitting" ||
          !form.acceptTerms ||
          !form.ageConfirmed ||
          (isLicensedCategory(form.categoryId) && !form.licenseAccepted)
        }
        className={cn(
          "flex h-12 w-full items-center justify-center gap-1.5 rounded-pill bg-primary text-[14px] font-extrabold tracking-[-0.01em] text-white shadow-card-hover transition active:scale-[0.99]",
          (phase === "submitting" || !form.acceptTerms || !form.ageConfirmed ||
            (isLicensedCategory(form.categoryId) && !form.licenseAccepted)) &&
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
