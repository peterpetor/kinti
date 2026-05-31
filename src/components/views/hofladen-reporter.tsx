"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";
import { HOFLADEN_CATEGORIES, PAYMENT_METHODS } from "@/lib/hofladen";
import { readPreferredCanton } from "@/lib/canton-pref";

export function HofladenReporter({
  turnstileSiteKey,
  onClose,
  onSuccess,
}: {
  turnstileSiteKey: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [cantonCode, setCantonCode] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  // Kanton-személyre szabás: a preferált kantont ajánljuk fel alapból.
  useEffect(() => {
    const pref = readPreferredCanton();
    if (pref) setCantonCode((c) => c || pref);
  }, []);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [open24h, setOpen24h] = useState(true);
  const [openText, setOpenText] = useState("");
  const [note, setNote] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  function toggleCategory(id: string) {
    setCategories((cs) => (cs.includes(id) ? cs.filter((c) => c !== id) : [...cs, id]));
  }

  function togglePayment(id: string) {
    setPaymentMethods((ps) => (ps.includes(id) ? ps.filter((p) => p !== id) : [...ps, id]));
  }

  async function handleSubmit() {
    setErr(null);
    if (name.trim().length < 3) {
      setErr("Add meg a hely nevét (min. 3 karakter).");
      return;
    }
    if (categories.length === 0) {
      setErr("Válassz legalább egy kategóriát.");
      return;
    }
    if (paymentMethods.length === 0) {
      setErr("Válassz legalább egy fizetési módot.");
      return;
    }
    if (!turnstileToken) {
      setErr("Várd meg a robot-ellenőrzést.");
      return;
    }
    if (!acceptedTerms) {
      setErr("Az ÁSZF és az adatkezelési nyilatkozat elfogadása kötelező.");
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
          const res = await fetch("/api/hofladen", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: name.trim(),
              locationName: locationName.trim() || null,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              cantonCode: cantonCode.trim() || null,
              categories,
              paymentMethods,
              open24h,
              openText: open24h ? null : (openText.trim() || null),
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
        className="w-full max-w-md rounded-card border border-line bg-surface p-5 shadow-card-strong space-y-4 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-extrabold text-ink">🌾 Új hofladen</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-surface-alt text-ink-muted"
          >
            ✕
          </button>
        </div>

        <p className="text-[11px] leading-snug text-ink-muted">
          A pont a te aktuális helyzetedhez kerül a térképre. Engedélyezd a helymeghatározást amikor küldöd.
        </p>

        <div>
          <label className="block mb-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
            Név
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pl. Hof Hardegg, Eier-Automat Birrwil"
            maxLength={80}
            className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[14px] text-ink"
          />
        </div>

        <div>
          <label className="block mb-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
            Hely / falu (opcionális)
          </label>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Pl. Bonstetten, Maur"
            maxLength={100}
            className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[14px] text-ink"
          />
        </div>

        <div>
          <label className="block mb-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
            Kanton (rövidítés, opcionális)
          </label>
          <input
            type="text"
            value={cantonCode}
            onChange={(e) => setCantonCode(e.target.value.toUpperCase())}
            placeholder="Pl. ZH, BE, VS"
            maxLength={4}
            className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[14px] text-ink"
          />
        </div>

        {/* Kategóriák */}
        <div>
          <label className="block mb-2 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
            Mit árulnak? (több is választható)
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {HOFLADEN_CATEGORIES.map((c) => {
              const on = categories.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-[10px] border px-2.5 py-2 text-[11.5px] font-bold transition",
                    on ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-ink-muted",
                  )}
                >
                  <span>{c.emoji}</span>
                  <span className="truncate">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fizetési mód */}
        <div>
          <label className="block mb-2 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
            Fizetési mód
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {PAYMENT_METHODS.map((p) => {
              const on = paymentMethods.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePayment(p.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-[10px] border px-2.5 py-2 text-[11.5px] font-bold transition",
                    on ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-ink-muted",
                  )}
                >
                  <span>{p.emoji}</span>
                  <span className="truncate">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nyitvatartás */}
        <div className="space-y-2">
          <label className="block text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
            Nyitvatartás
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen24h(true)}
              className={cn(
                "flex-1 rounded-pill px-3 py-2 text-[12px] font-bold transition",
                open24h ? "bg-success text-white" : "border border-line bg-surface text-ink-muted",
              )}
            >
              🕐 24/7
            </button>
            <button
              type="button"
              onClick={() => setOpen24h(false)}
              className={cn(
                "flex-1 rounded-pill px-3 py-2 text-[12px] font-bold transition",
                !open24h ? "bg-[#e3a233] text-white" : "border border-line bg-surface text-ink-muted",
              )}
            >
              📅 Korlátozott
            </button>
          </div>
          {!open24h && (
            <input
              type="text"
              value={openText}
              onChange={(e) => setOpenText(e.target.value)}
              placeholder="Pl. H-Szo 8-19, Csak hétvégén"
              maxLength={80}
              className="h-10 w-full rounded-[10px] border border-line bg-surface-alt px-3 text-[14px] text-ink"
            />
          )}
        </div>

        <div>
          <label className="block mb-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
            Megjegyzés (opcionális)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Pl. 'Friss tej hajnali 6-tól', 'Téli szezonban szünetel'"
            maxLength={300}
            rows={2}
            className="w-full rounded-[10px] border border-line bg-surface-alt px-3 py-2 text-[13px] text-ink resize-none"
          />
        </div>

        {turnstileSiteKey && (
          <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
        )}

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

        {err && <p className="text-[12px] font-bold text-accent">{err}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 rounded-pill border border-line bg-surface-alt py-2.5 text-[12.5px] font-bold text-ink-muted"
          >
            Mégsem
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy || !turnstileToken}
            className="flex-1 rounded-pill bg-primary py-2.5 text-[12.5px] font-bold text-white shadow-card disabled:opacity-60"
          >
            <Icon name="pin" size={12} strokeWidth={2.4} className="inline mr-1" />
            {busy ? "Helymeghatározás…" : "Térképre"}
          </button>
        </div>

        <p className="text-[10px] leading-snug text-ink-faint">
          A pont a te aktuális GPS-pozíciódra kerül — ne add fel ha nincs ott helyben.
        </p>
      </div>
    </div>
  );
}
