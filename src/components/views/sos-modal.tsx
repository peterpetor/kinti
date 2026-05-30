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

          const data = await res.json() as any;
          if (!res.ok) {
            turnstileRef.current?.reset();
            setTurnstileToken("");
            throw new Error(data.error || "Hiba történt a küldés során.");
          }

          if (data.id && typeof window !== 'undefined') {
            const myAlerts = JSON.parse(localStorage.getItem('mySosAlerts') || '[]');
            myAlerts.push(data.id);
            localStorage.setItem('mySosAlerts', JSON.stringify(myAlerts));
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
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
          <h2 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-2">
            🆘 S.O.S. Segítségkérés
          </h2>
          <p className="text-sm text-red-800 font-medium">
            Figyelem! Ez egy közösségi funkció. Életveszély vagy baleset esetén azonnal hívd a <strong>112</strong>-t! A platform nem garantálja a segítség érkezését.
          </p>
        </div>

        <div className="mb-4 rounded-lg bg-yellow-50 p-3 border border-yellow-300 text-xs text-yellow-900 leading-relaxed">
          📢 <strong>Fontos:</strong> Az elküldött telefonszámod és GPS-pozíciód <strong>nyilvánosan megjelenik a térképen</strong>, ahol más felhasználók is láthatják. A riasztás 3 óra múlva automatikusan törlődik.
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mi a probléma? (Röviden)
            </label>
            <textarea
              required
              rows={3}
              maxLength={300}
              placeholder="Pl. Lerobbant az autóm az A1-esen, segítség kellene a vontatáshoz..."
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Telefonszám
            </label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>

          <div className="mt-2 text-xs text-gray-500">
            A kérés elküldésekor az app rögzíti a jelenlegi GPS pozíciódat. A riasztás 3 óra múlva automatikusan törlődik.
          </div>

          <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-red-600"
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
            className="mt-2 w-full rounded-xl bg-red-600 py-3 text-center font-bold text-white shadow-lg transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Küldés..." : "Riasztás Leadása"}
          </button>
        </form>
      </div>
    </div>
  );
}
