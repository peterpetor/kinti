"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SosModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function SosModal({ onClose, onSuccess }: SosModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("+41");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
            }),
          });

          const data = await res.json() as any;
          if (!res.ok) {
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
            Figyelem! Ez egy közösségi funkció. Életveszély vagy baleset esetén azonnal hívd a 112-t! A platform nem garantálja a segítség érkezését.
          </p>
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
              Telefonszám (WhatsApp / Hívás)
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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-red-600 py-3 text-center font-bold text-white shadow-lg transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Küldés..." : "Riasztás Leadása"}
          </button>
        </form>
      </div>
    </div>
  );
}
