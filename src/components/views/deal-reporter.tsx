"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import {
  getDealStores,
  DEAL_CATEGORIES,
  DEAL_DISCOUNTS,
} from "@/lib/deals";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

/**
 * DealReporter — 3 lépéses modal:
 *   1) bolt-lánc (Migros, Coop, …)
 *   2) kategória (Hús, Pékáru, …)
 *   3) kedvezmény (-25%, -50%, …)
 * Plus: opcionális megjegyzés + automatikus geolokáció.
 */
export function DealReporter({
  turnstileSiteKey,
  onClose,
  onSuccess,
}: {
  turnstileSiteKey: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [prefCountry] = usePreferredCountry();
  const stores = getDealStores(prefCountry ?? DEFAULT_COUNTRY);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [storeId, setStoreId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [discountPct, setDiscountPct] = useState<number | null>(null);
  const [locationName, setLocationName] = useState("");
  const [note, setNote] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  async function handleSubmit() {
    setErr(null);

    if (!storeId || !categoryId || !discountPct) {
      setErr("Hiányzó adat.");
      return;
    }
    if (!acceptedTerms) {
      setErr("Az ÁSZF és az adatkezelési nyilatkozat elfogadása kötelező.");
      return;
    }
    if (!turnstileToken) {
      setErr("Várd meg a robot-ellenőrzést.");
      return;
    }
    if (!navigator.geolocation) {
      setErr("A böngésződ nem támogatja a helymeghatározást.");
      return;
    }

    setBusy(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/deals", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              storeId,
              categoryId,
              discountPct,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              locationName: locationName.trim() || null,
              note: note.trim() || null,
              turnstileToken,
            }),
          });
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          if (!res.ok) {
            setErr(data.error ?? "Hiba a beküldés közben.");
            turnstileRef.current?.reset();
            setBusy(false);
            return;
          }
          onSuccess();
        } catch (e) {
          setErr(e instanceof Error ? e.message : "Hálózati hiba.");
          setBusy(false);
        }
      },
      (geoErr) => {
        setErr(
          geoErr.code === geoErr.PERMISSION_DENIED
            ? "Engedélyezned kell a helymeghatározást — különben nem tudunk a térképre tűzni."
            : "Nem sikerült meghatározni a helyzeted.",
        );
        setBusy(false);
      },
      { timeout: 10_000, maximumAge: 60_000 },
    );
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-3 bg-ink/40 backdrop-blur-sm"
      onClick={() => !busy && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-card border border-line bg-surface p-5 shadow-card-strong space-y-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header + step indicator */}
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-extrabold text-ink">🏷️ Akció bejelentése</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-surface-alt text-ink-muted"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-1.5">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={cn(
                "h-1.5 flex-1 rounded-full transition",
                n <= step ? "bg-primary" : "bg-line",
              )}
            />
          ))}
        </div>

        {/* STEP 1: Bolt */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
              1/3 · Melyik bolt?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {stores.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setStoreId(s.id);
                    setStep(2);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-[12px] border-2 p-3 transition active:scale-95",
                    storeId === s.id ? "border-primary bg-primary-soft" : "border-line bg-surface",
                  )}
                >
                  <span
                    className="grid h-10 w-10 place-items-center rounded-full text-white font-extrabold text-[16px]"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.initial}
                  </span>
                  <span className="text-[11px] font-bold text-ink text-center leading-tight">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Kategória */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
              2/3 · Milyen termék?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEAL_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(c.id);
                    setStep(3);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-[12px] border-2 p-3 transition active:scale-95",
                    categoryId === c.id ? "border-primary bg-primary-soft" : "border-line bg-surface",
                  )}
                >
                  <span className="text-2xl shrink-0">{c.emoji}</span>
                  <span className="text-[12.5px] font-bold text-ink text-left">{c.label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[11.5px] font-semibold text-ink-faint underline"
            >
              ← Másik bolt
            </button>
          </div>
        )}

        {/* STEP 3: Kedvezmény + extra */}
        {step === 3 && (
          <div className="space-y-3">
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
              3/3 · Mekkora a kedvezmény?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {DEAL_DISCOUNTS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiscountPct(d)}
                  className={cn(
                    "rounded-[12px] border-2 py-3 text-[15px] font-extrabold transition active:scale-95",
                    discountPct === d
                      ? "border-accent bg-accent text-white shadow-card"
                      : "border-line bg-surface text-ink",
                  )}
                >
                  −{d}%
                </button>
              ))}
            </div>

            <div className="border-t border-dashed border-line pt-3 space-y-2">
              <div>
                <label className="block mb-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
                  Bolt-név vagy hely (opcionális)
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Pl. Migros Glattzentrum"
                  maxLength={80}
                  className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13px] text-ink"
                />
              </div>

              <div>
                <label className="block mb-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
                  Megjegyzés (opcionális)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Pl. 'Bio csirkemell', 'Csak ma estig'…"
                  maxLength={100}
                  className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[13px] text-ink"
                />
              </div>
            </div>

            {turnstileSiteKey && (
              <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
            )}

            {err && <p className="text-[12px] font-bold text-accent">{err}</p>}

            <label className="flex items-start gap-2 text-[11px] text-ink-muted cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span>
                Tudomásul veszem, hogy a GPS-pozícióm a térképen megjelenik, és elfogadom az{" "}
                <a href="/aszf" target="_blank" className="underline">ÁSZF</a>-et és az{" "}
                <a href="/adatvedelem" target="_blank" className="underline">Adatkezelési Tájékoztatót</a>.
              </span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={busy}
                className="flex-1 rounded-pill border border-line bg-surface-alt py-2.5 text-[12.5px] font-bold text-ink-muted"
              >
                ← Vissza
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={busy || !discountPct || !turnstileToken}
                className="flex-1 rounded-pill bg-primary py-2.5 text-[12.5px] font-bold text-white shadow-card disabled:opacity-60"
              >
                <Icon name="pin" size={12} strokeWidth={2.4} className="inline mr-1" />
                {busy ? "Helymeghatározás…" : "Térképre"}
              </button>
            </div>

            <p className="text-[11.5px] leading-snug text-ink-faint">
              Engedélyezd a helymeghatározást — a térképen pontosan ott jelenik meg az akció ahol vagy.
              Aznap éjfélkor automatikusan eltűnik.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
