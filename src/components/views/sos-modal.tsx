"use client";

import { useRef, useState } from "react";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";

interface SosModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function SosModal({ onClose, onSuccess }: SosModalProps) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("+41");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!acceptedTerms) {
      setError("Az ÁSZF és az adatkezelési nyilatkozat elfogadása kötelező.");
      setLoading(false);
      return;
    }
    if (!turnstileToken) {
      setError("Várd meg a robot-ellenőrzést, mielőtt elküldöd.");
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("A böngésződ nem támogatja a helymeghatározást.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch("/api/sos/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: latitude,
              lng: longitude,
              description,
              contactPhone,
              turnstileToken,
            }),
          });

          const data = await res.json() as { error?: string; id?: string; resolveToken?: string };
          if (!res.ok) {
            turnstileRef.current?.reset();
            setTurnstileToken("");
            throw new Error(data.error || "Hiba történt a küldés során.");
          }

          if (data.id && typeof window !== 'undefined') {
            let myAlerts: unknown;
            try { myAlerts = JSON.parse(localStorage.getItem('mySosAlerts') || '[]'); } catch { myAlerts = []; }
            const list = Array.isArray(myAlerts) ? myAlerts : [];
            list.push(data.id);
            localStorage.setItem('mySosAlerts', JSON.stringify(list));
            // Lezárás-titok riasztásonként — a "Megoldódott" gomb ezzel hitelesít.
            if (data.resolveToken) {
              let tokens: Record<string, string>;
              try { tokens = JSON.parse(localStorage.getItem('kinti_sos_tokens') || '{}') || {}; } catch { tokens = {}; }
              tokens[data.id] = data.resolveToken;
              localStorage.setItem('kinti_sos_tokens', JSON.stringify(tokens));
            }
          }

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('sos-submitted'));
          }
          
          onSuccess();
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Hiba történt a küldés során.");
          }
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Kérlek engedélyezd a helymeghatározást az S.O.S. küldéséhez!");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-muted hover:text-ink"
        >
          ✕
        </button>

        <div className="mb-6 rounded-lg bg-accent/5 p-4 border border-accent/20">
          <h2 className="text-lg font-bold text-accent flex items-center gap-2 mb-2">
            🆘 S.O.S. Segítségkérés
          </h2>
          <p className="text-sm text-accent font-medium">
            Figyelem! Ez egy közösségi funkció. Életveszély vagy baleset esetén azonnal hívd a <strong>112</strong>-t! A platform nem garantálja a segítség érkezését.
          </p>
        </div>

        <div className="mb-4 rounded-lg bg-star/10 p-3 border border-star/30 text-xs text-ink leading-relaxed">
          📢 <strong>Fontos:</strong> Az elküldött telefonszámod és GPS-pozíciód <strong>nyilvánosan megjelenik a térképen</strong>, ahol más felhasználók is láthatják. A riasztás 3 óra múlva automatikusan törlődik.
        </div>

        {error && (
          <div className="mb-4 rounded bg-accent/10 p-3 text-sm text-accent">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Mi a probléma? (Röviden)
            </label>
            <textarea
              required
              rows={3}
              maxLength={300}
              placeholder="Pl. Lerobbant az autóm az A1-esen, segítség kellene a vontatáshoz..."
              className="w-full rounded-lg border border-line bg-surface text-ink p-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Telefonszám
            </label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-line bg-surface text-ink p-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>

          <div className="mt-2 text-xs text-ink-muted">
            A kérés elküldésekor az app rögzíti a jelenlegi GPS pozíciódat. A riasztás 3 óra múlva automatikusan törlődik.
          </div>

          <label className="flex items-start gap-2 text-xs text-ink-muted cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
            />
            <span>
              Tudomásul veszem, hogy a telefonszámom és a pozícióm nyilvánosan megjelenik a platformon, és elfogadom az{" "}
              <a href="/aszf" target="_blank" className="underline font-semibold">ÁSZF</a>-et és az{" "}
              <a href="/adatvedelem" target="_blank" className="underline font-semibold">Adatkezelési Tájékoztatót</a>.
            </span>
          </label>

          {turnstileSiteKey && (
            <TurnstileWidget
              ref={turnstileRef}
              siteKey={turnstileSiteKey}
              onToken={setTurnstileToken}
            />
          )}

          <button
            type="submit"
            disabled={loading || !turnstileToken || !acceptedTerms}
            className="mt-2 w-full rounded-xl bg-accent py-3 text-center font-bold text-white shadow-lg transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? "Küldés..." : "Riasztás Leadása"}
          </button>
        </form>
      </div>
    </div>
  );
}
