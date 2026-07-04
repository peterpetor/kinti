"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { ReportButton } from "@/components/report-button";
import type { SosAlert } from "@/lib/sos-repo";

/**
 * SosDetailsCard — egy aktív SOS riasztás felugró-kártyája.
 *
 * Megjelenik a térképen klikkkelt SOS-pinhez. Tartalom: leírás, hívás gomb,
 * "Megoldódott" gomb (csak a feladónak, mySosAlerts localStorage alapján).
 */
export function SosDetailsCard({ sos, onClose }: { sos: SosAlert; onClose: () => void }) {
  const [isMine, setIsMine] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const myAlerts = JSON.parse(localStorage.getItem("mySosAlerts") || "[]");
        if (Array.isArray(myAlerts) && myAlerts.includes(sos.id)) setIsMine(true);
      } catch {
        /* sérült storage → nem az enyém */
      }
    }
  }, [sos.id]);

  async function handleResolve() {
    if (resolving) return;
    setResolving(true);
    try {
      // A beküldéskor kapott lezárás-titok — IP-változástól függetlenül hitelesít.
      let token: string | null = null;
      try {
        const tokens = JSON.parse(localStorage.getItem("kinti_sos_tokens") || "{}");
        if (tokens && typeof tokens[sos.id] === "string") token = tokens[sos.id];
      } catch {
        /* nincs token → a szerver IP-fallbackje dönt (régi riasztás) */
      }
      const res = await fetch(`/api/sos/${sos.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        if (typeof window !== "undefined") {
          try {
            const myAlerts = JSON.parse(localStorage.getItem("mySosAlerts") || "[]");
            if (Array.isArray(myAlerts)) {
              localStorage.setItem("mySosAlerts", JSON.stringify(myAlerts.filter((id: string) => id !== sos.id)));
            }
            const tokens = JSON.parse(localStorage.getItem("kinti_sos_tokens") || "{}");
            if (tokens && typeof tokens === "object") {
              delete tokens[sos.id];
              localStorage.setItem("kinti_sos_tokens", JSON.stringify(tokens));
            }
          } catch {
            /* takarítás best-effort */
          }
          window.dispatchEvent(new Event("sos-submitted"));
        }
        onClose();
      } else {
        alert("Sikertelen lezárás. (Csak az tudja lezárni, aki feladta!)");
      }
    } catch {
      alert("Hiba történt a lezárás során.");
    } finally {
      setResolving(false);
    }
  }

  if (!sos) return null;

  return (
    <div className="relative w-full max-w-sm rounded-[20px] border border-red-500/20 bg-surface p-5 shadow-2xl">
      <button
        onClick={onClose}
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-surface-alt text-ink-muted hover:bg-line"
        aria-label="Bezárás"
      >
        ✕
      </button>

      <div className="mb-4 flex items-center gap-2 text-red-600">
        <span className="text-2xl">🆘</span>
        <h3 className="text-lg font-bold tracking-tight">Közösségi S.O.S.</h3>
        <span className="flex-1" />
        <div className="pr-8">
          <ReportButton contentType="sos" contentId={sos.id} />
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-red-50 p-4 text-[14px] leading-relaxed text-red-900 border border-red-100">
        {sos.description}
      </div>

      <div className="flex flex-col gap-2">
        <a
          href={`tel:${sos.contactPhone}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 font-bold text-surface shadow-md transition-transform hover:bg-accent active:scale-95"
        >
          <Icon name="phone" size={18} />
          Hívás ({sos.contactPhone})
        </a>

        {isMine && (
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-success-soft py-3 font-bold text-success-heavy transition-colors hover:bg-success/20 disabled:opacity-50"
          >
            {resolving ? "Folyamatban..." : "Megoldódott (Lezárás)"}
          </button>
        )}
      </div>
    </div>
  );
}
