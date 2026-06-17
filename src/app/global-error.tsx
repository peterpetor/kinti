"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/report-client-error";

/**
 * Globális hiba-határ (App Router). Akkor lép életbe, ha a gyökér-layout
 * (pl. a Clerk-provider) renderelés közben elhasal — leggyakrabban
 * SANDBOXOLT környezetben (beépített böngésző, kiegészítő-preview), ahol a
 * `localStorage` / `serviceWorker` tiltott, és a Clerk `SecurityError`-t dob.
 *
 * Mivel a gyökér-layoutot helyettesíti, saját <html>/<body> kell, és a
 * stílusok inline-ok (a globals.css betöltése sem garantált ilyenkor).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isStorageBlocked =
    typeof error?.message === "string" &&
    /localStorage|sandbox|serviceWorker|SecurityError/i.test(error.message);

  useEffect(() => {
    // A sandbox-tiltás várt környezeti hiba, NEM jelentjük (zaj lenne).
    if (!isStorageBlocked) reportClientError(error);
  }, [error, isStorageBlocked]);

  return (
    <html lang="hu">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#f4ede0",
          color: "#0e1f17",
          fontFamily:
            "'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            background: "#ffffff",
            border: "1px solid rgba(28,61,46,0.10)",
            borderRadius: 20,
            boxShadow: "0 8px 28px rgba(14,31,23,0.12)",
            padding: 24,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              margin: "0 auto 12px",
              borderRadius: 16,
              background: "#1d4434",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            k
          </div>

          {isStorageBlocked ? (
            <>
              <h1 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 8px" }}>
                Nem támogatott böngésző-környezet
              </h1>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: "#5c6d63", margin: "0 0 16px" }}>
                Úgy tűnik, a kinti egy korlátozott környezetben (pl. egy alkalmazás
                beépített böngészőjében vagy egy kiegészítő előnézetében) nyílt meg,
                ahol a tárhely-hozzáférés tiltott. Nyisd meg{" "}
                <strong style={{ color: "#0e1f17" }}>rendes böngészőben</strong>{" "}
                (Chrome, Safari, Firefox) a{" "}
                <strong style={{ color: "#0e1f17" }}>kinti.app</strong> címen.
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 8px" }}>
                Hoppá, valami hiba történt
              </h1>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: "#5c6d63", margin: "0 0 16px" }}>
                Átmeneti hiba lépett fel. Próbáld újratölteni az oldalt — ha
                továbbra is fennáll, írj nekünk: info@kinti.app.
              </p>
            </>
          )}

          <button
            type="button"
            onClick={() => reset()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "12px 20px",
              borderRadius: 999,
              border: "none",
              background: "#1d4434",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Újratöltés
          </button>
        </div>
      </body>
    </html>
  );
}
