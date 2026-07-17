"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";

/**
 * LocationSettings — helymeghatározás-engedély kezelése az appon belül.
 *
 * A böngésző-engedélyt programból nem lehet visszaállítani: ha a felhasználó
 * egyszer letiltotta, a getCurrentPosition azonnal PERMISSION_DENIED-del bukik,
 * prompt nélkül. Ezért három állapotot kezelünk:
 *   - "prompt"  → gombbal AZONNAL feldobjuk a böngésző engedély-kérdését
 *   - "granted" → pipa + próba-lekérés (látszik, hogy tényleg működik)
 *   - "denied"  → platform-felismert, lépésenkénti útmutató a feloldáshoz,
 *                 és a Permissions API onchange-e élőben átvált, amint a
 *                 felhasználó a böngészőben engedélyezi.
 */
type PermState = "checking" | "unsupported" | "prompt" | "granted" | "denied";

function detectPlatform(): "android" | "ios" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  return "desktop";
}

export function LocationSettings() {
  const [state, setState] = useState<PermState>("checking");
  const [busy, setBusy] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const platform = detectPlatform();

  // Engedély-állapot beolvasása + élő követése (ha a user a böngészőben
  // közben feloldja, itt magától átvált — nem kell újratölteni).
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState("unsupported");
      return;
    }
    let cancelled = false;
    let statusRef: PermissionStatus | null = null;
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((status) => {
          if (cancelled) return;
          statusRef = status;
          setState(status.state === "granted" ? "granted" : status.state === "denied" ? "denied" : "prompt");
          status.onchange = () => {
            setState(status.state === "granted" ? "granted" : status.state === "denied" ? "denied" : "prompt");
          };
        })
        .catch(() => setState("prompt")); // Permissions API híján a kérés-gomb dönt
    } else {
      setState("prompt");
    }
    return () => {
      cancelled = true;
      if (statusRef) statusRef.onchange = null;
    };
  }, []);

  /** "prompt" állapotban feldobja a böngésző kérdését; "granted"-nél próba-lekérés. */
  function request() {
    setBusy(true);
    setTestResult(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false);
        setState("granted");
        setTestResult(`Pontosság: ~${Math.round(pos.coords.accuracy)} m — működik ✓`);
      },
      (err) => {
        setBusy(false);
        if (err.code === err.PERMISSION_DENIED) setState("denied");
        else setTestResult("Nem sikerült lekérni a helyzeted — próbáld újra később.");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 0 },
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="mb-1 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary/10 text-primary">
            <Icon name="pin" size={16} strokeWidth={2.2} />
          </span>
          <h2 className="text-[15px] font-extrabold tracking-tight text-ink">Helymeghatározás</h2>
        </div>
        <p className="mb-3 text-[12.5px] leading-snug text-ink-muted">
          A helyzeteddel működik a Szaknévsor „Közelemben&rdquo; szűrője, a térképen a saját
          pozíciód, és a távolság-kijelzés a vállalkozásoknál. A helyzeted{" "}
          <strong className="text-ink">soha nem hagyja el a készüléked</strong> — csak a
          böngésződben használjuk a szűréshez.
        </p>

        {state === "checking" && <div className="h-20 animate-pulse rounded-xl bg-surface-alt/50" />}

        {state === "unsupported" && (
          <p className="rounded-xl bg-surface-alt px-3 py-2.5 text-[12.5px] text-ink-muted">
            A böngésződ nem támogatja a helymeghatározást.
          </p>
        )}

        {state === "prompt" && (
          <button
            type="button"
            onClick={request}
            disabled={busy}
            className="w-full rounded-pill bg-primary px-4 py-3 text-[14px] font-extrabold text-white shadow-card transition active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "Helymeghatározás…" : "Helymeghatározás engedélyezése"}
          </button>
        )}

        {state === "granted" && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2.5 text-[13px] font-bold text-success">
              <Icon name="check" size={15} strokeWidth={2.6} /> A helymeghatározás engedélyezve van.
            </div>
            <button
              type="button"
              onClick={request}
              disabled={busy}
              className="w-full rounded-pill border border-line bg-surface-alt px-4 py-2.5 text-[13px] font-bold text-ink transition active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? "Helymeghatározás…" : "Kipróbálás — hol lát engem az app?"}
            </button>
            {testResult && (
              <p className="rounded-xl bg-surface-alt px-3 py-2 text-[12.5px] text-ink-muted">{testResult}</p>
            )}
          </div>
        )}

        {state === "denied" && (
          <div className="space-y-3">
            <p className="rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 text-[12.5px] leading-snug text-accent">
              A helymeghatározás jelenleg le van tiltva a kinti.app-hoz. A böngésző ezt csak a
              saját beállításai közt engedi feloldani — appból nem lehet újra megkérdezni.
            </p>
            <div className="rounded-xl bg-surface-alt px-3.5 py-3 text-[12.5px] leading-relaxed text-ink">
              <p className="mb-1.5 font-extrabold">Így oldod fel:</p>
              {platform === "android" && (
                <ol className="list-decimal space-y-1 pl-4">
                  <li>Koppints a címsor melletti lakat- vagy hangoló-ikonra</li>
                  <li>Engedélyek → Helyadatok → Engedélyezés</li>
                  <li>Ha nem látod: Chrome menü (⋮) → Beállítások → Webhelybeállítások → Helyadatok → kinti.app</li>
                  <li>Ha a Kinti alkalmazásból használod: a rendszer-Beállítások → Alkalmazások → Chrome → Engedélyek → Helyzet is legyen engedélyezve</li>
                </ol>
              )}
              {platform === "ios" && (
                <ol className="list-decimal space-y-1 pl-4">
                  <li>Safariban koppints a címsor „AA&rdquo; (vagy hangoló) ikonjára</li>
                  <li>Webhelybeállítások → Helyzet → Engedélyezés</li>
                  <li>Ha nem segít: Beállítások → Adatvédelem és biztonság → Helymeghatározás → Safari-webhelyek → Kérdezzen rá</li>
                </ol>
              )}
              {platform === "desktop" && (
                <ol className="list-decimal space-y-1 pl-4">
                  <li>Kattints a címsor elején lévő lakat- vagy hangoló-ikonra</li>
                  <li>Helymeghatározás → Engedélyezés</li>
                  <li>Töltsd újra az oldalt</li>
                </ol>
              )}
            </div>
            <p className="text-[11.5px] leading-snug text-ink-faint">
              Amint a böngészőben feloldod, ez az oldal magától átvált — nem kell újraindítani.
            </p>
            <button
              type="button"
              onClick={request}
              disabled={busy}
              className="w-full rounded-pill border border-line bg-surface-alt px-4 py-2.5 text-[13px] font-bold text-ink transition active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? "Ellenőrzés…" : "Újraellenőrzés"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
