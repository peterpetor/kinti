"use client";

import { useEffect, useRef, useState } from "react";

import { isSafeToReload } from "@/lib/auto-update-safety";

/**
 * Service Worker regisztrálás + NÉMA, automatikus frissítés.
 *
 *   • Csak production buildben fut (dev alatt a Next HMR-jét megzavarná).
 *   • ⚠️ 2026-07-28 (user-döntés: „idegesítő a gomb, frissítsen magától"):
 *     a régi „Új verzió érhető el — Frissítés" banner ALAPESETBEN NEM
 *     jelenik meg. Helyette az app magától frissül, de CSAK olyan
 *     pillanatban, amikor az nem szakít félbe semmit:
 *       1. „hideg indítás" — a frissítést az app megnyitása utáni pár
 *          másodpercben vesszük észre → azonnal alkalmazzuk (a user még
 *          nem csinál semmit, gyakorlatilag láthatatlan);
 *       2. hosszabb távollét utáni VISSZATÉRÉS (AWAY_MS) → ilyenkor egy
 *          friss betöltés amúgy is természetes érzés.
 *     Aktív használat közben SOHA nem rántjuk ki a lábad alól a szőnyeget.
 *   • Két biztonsági fék:
 *       – `isSafeToReload()`: ha bármelyik űrlapmezőbe írtál, vagy épp
 *         szól egy hang/videó, az automatikus frissítés KIMARAD;
 *       – `MAX_AUTO_TRIES`: ha az automata már kétszer próbálkozott és a
 *         verzió MÉGSEM változott (pl. edge-cache régi HTML-t ad), akkor
 *         feladja és inkább megmutatja a kézi gombot — így egy hibás
 *         deploy nem tud végtelen újratöltés-hurokba vinni.
 *   • Végső háló: ha egy frissítés GRACE_MS-nél régebb óta függ (mert pl.
 *     mindig volt félkész űrlap), a banner nem-elutasíthatóvá válik és
 *     FORCE_COUNTDOWN_S látható visszaszámlálás után magától lefut.
 *
 * A SW bejegyzése `/sw.js` — public/-ból a Cloudflare Pages közvetlenül szolgálja ki.
 */

// Ennyi ideig függőben lehet egy frissítés, mielőtt kényszerítjük.
const GRACE_MS = 3 * 24 * 60 * 60 * 1000; // 3 nap
// A kényszerített módban ennyi másodperc látható visszaszámlálás után fut le a reload.
const FORCE_COUNTDOWN_S = 20;
// A "mióta függ ez a build frissítése" localStorage-kulcs — a SAJÁT (jelenleg
// futó) build-hez kötött, hogy egy sikeres frissítés után természetesen
// nullázódjon (a következő stale-észlelésnél a myBuild már más lesz).
const PENDING_KEY = "kinti_update_pending_since";

// ── Néma automatika ─────────────────────────────────────────────────────────
/** Az oldal betöltése után ennyi ideig számít „épp most nyitotta meg". */
const COLD_START_MS = 10_000;
/** Ennyi távollét után a visszatérés már „friss indulásnak" érződik. */
const AWAY_MS = 3 * 60 * 1000; // 3 perc
/** Hányszor próbálkozhat az automata ugyanarról a buildről, mielőtt feladja. */
const MAX_AUTO_TRIES = 2;
const AUTO_KEY = "kinti_auto_update_tries";

interface PendingRecord {
  build: string;
  since: number;
}

function readPending(): PendingRecord | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<PendingRecord>;
    if (v && typeof v.build === "string" && typeof v.since === "number") return v as PendingRecord;
    return null;
  } catch {
    return null;
  }
}

/** Rögzíti (perzisztensen), mióta függ a frissítés EHHEZ a saját build-hez —
 * visszaadja az eredeti "since" időpontot (epoch ms), akkor is, ha már korábban rögzült. */
function markPending(myBuild: string): number {
  try {
    const existing = readPending();
    if (existing && existing.build === myBuild) return existing.since;
    const since = Date.now();
    localStorage.setItem(PENDING_KEY, JSON.stringify({ build: myBuild, since }));
    return since;
  } catch {
    return Date.now();
  }
}

function clearPending(): void {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/** Hányszor próbált már az automata EBBŐL a buildből frissíteni. A rekord a
 * SAJÁT build-hez kötött, így egy sikeres frissítés után magától nullázódik
 * (az új buildre még 0 próbálkozás tartozik) — nem kell takarítani. */
function readTries(myBuild: string): number {
  try {
    const raw = localStorage.getItem(AUTO_KEY);
    if (!raw) return 0;
    const v = JSON.parse(raw) as { build?: string; n?: number };
    if (v && v.build === myBuild && typeof v.n === "number") return v.n;
    return 0;
  } catch {
    return 0;
  }
}

function bumpTries(myBuild: string): void {
  try {
    localStorage.setItem(AUTO_KEY, JSON.stringify({ build: myBuild, n: readTries(myBuild) + 1 }));
  } catch {
    /* ignore */
  }
}

export function SWRegister() {
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);
  // Verzió-eltérés (új deploy) észlelve — akkor is, ha nincs „waiting" SW.
  const [versionStale, setVersionStale] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [pendingSince, setPendingSince] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  // Az automata feladta (MAX_AUTO_TRIES elfogyott) → jöhet a kézi gomb.
  const [autoExhausted, setAutoExhausted] = useState(false);
  // Biztonsági háló a "Frissítés" gombhoz — ld. applyUpdate.
  const fallbackReload = useRef<number | null>(null);
  const countdownTimer = useRef<number | null>(null);
  const applyUpdateRef = useRef<() => void>(() => {});
  // Mikor töltődött be ez az oldal, és mikor tűnt el a szem elől.
  const mountedAt = useRef(Date.now());
  const hiddenAt = useRef<number | null>(null);

  const updateReady = !!waitingSW || versionStale;

  // Build-ID alapú frissítés-figyelő: melegindításnál is elkapja az új verziót.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "production") return;
    const myBuild = process.env.NEXT_PUBLIC_BUILD_ID;
    if (!myBuild) return;

    let lastCheck = 0;
    let stopped = false;

    const check = async () => {
      // Throttle: legfeljebb 30 mp-enként.
      const now = Date.now();
      if (now - lastCheck < 30_000) return;
      lastCheck = now;
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { buildId?: string };
        if (!stopped && data.buildId && data.buildId !== myBuild) {
          setVersionStale(true);
        }
      } catch {
        /* hálózati hiba — csendben kihagyjuk */
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);
    check(); // induláskor is

    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "production") return;

    // FONTOS: sandboxolt iframe-ben (beépített böngésző, kiegészítő-preview)
    // a `"serviceWorker" in navigator` IGAZ, de a `navigator.serviceWorker`
    // OLVASÁSA `SecurityError`-t dob. Ezért try/catch — ilyenkor nem
    // regisztrálunk, és nem omlik össze az app.
    let sw: ServiceWorkerContainer | undefined;
    try {
      if (!("serviceWorker" in navigator)) return;
      sw = navigator.serviceWorker;
    } catch {
      return;
    }
    if (!sw) return;
    const swc = sw;

    let cancelled = false;

    const handleControllerChange = () => {
      if (fallbackReload.current != null) {
        window.clearTimeout(fallbackReload.current);
        fallbackReload.current = null;
      }
      clearPending();
      // Az új SW átvette az irányítást → friss kód, friss oldal.
      window.location.reload();
    };
    swc.addEventListener("controllerchange", handleControllerChange);

    // A build-ID-t a regisztrációs URL-be tesszük: deployonként változik
    // (CF_PAGES_COMMIT_SHA), így a böngésző "új" SW-t lát és lefut az
    // updatefound → frissítés-folyamat. Build-ID nélkül (régi cache) sima
    // /sw.js-re esünk vissza.
    const buildId = process.env.NEXT_PUBLIC_BUILD_ID;
    const swUrl = buildId ? `/sw.js?v=${encodeURIComponent(buildId)}` : "/sw.js";

    swc
      .register(swUrl, { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        if (cancelled) return;

        // 1) Ha most rögtön van „waiting” SW — már települt új verzió.
        if (reg.waiting && swc.controller) {
          setWaitingSW(reg.waiting);
        }

        // 2) Frissítések figyelése.
        reg.addEventListener("updatefound", () => {
          const next = reg.installing;
          if (!next) return;
          next.addEventListener("statechange", () => {
            if (next.state === "installed" && swc.controller) {
              setWaitingSW(next);
            }
          });
        });

        // Óránkénti enyhe update-ellenőrzés a háttérben.
        const interval = window.setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
        return () => window.clearInterval(interval);
      })
      .catch((err) => {
        console.warn("[SW] regisztráció sikertelen:", err);
      });

    return () => {
      cancelled = true;
      swc.removeEventListener("controllerchange", handleControllerChange);
      if (fallbackReload.current != null) window.clearTimeout(fallbackReload.current);
    };
  }, []);

  // Amint egy frissítés függőben van, perzisztensen rögzítjük (a SAJÁT jelenlegi
  // build-hez kötve), hogy a kényszer-küszöböt akkor is tudjuk mérni, ha a user
  // közben be- és kikapcsolja az appot, vagy napokig nem nyitja meg.
  useEffect(() => {
    if (!updateReady) return;
    const myBuild = process.env.NEXT_PUBLIC_BUILD_ID ?? "unknown";
    setPendingSince(markPending(myBuild));
  }, [updateReady]);

  const forced = pendingSince != null && Date.now() - pendingSince >= GRACE_MS;

  const applyUpdate = () => {
    if (countdownTimer.current != null) {
      window.clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
    if (waitingSW) {
      // A SW átveszi → controllerchange → automatikus reload. DE: a sw.js
      // `install` handlere MINDIG lefuttat egy skipWaiting-et (a régi SW
      // esetleg már korábban, a user tudta nélkül átvette az irányítást),
      // ezért előfordulhat, hogy EZ a controllerchange már nem sül el —
      // ilyenkor a gomb kattintása némán semmit nem csinálna. Biztonsági
      // háló: ha 2,5 mp múlva sincs reload, kényszerítjük.
      waitingSW.postMessage({ type: "SKIP_WAITING" });
      fallbackReload.current = window.setTimeout(() => window.location.reload(), 2500);
    } else {
      // Csak verzió-eltérés (nincs waiting SW) → friss oldalbetöltés.
      window.location.reload();
    }
  };
  applyUpdateRef.current = applyUpdate;

  // ── NÉMA AUTOMATIKUS FRISSÍTÉS ────────────────────────────────────────────
  // Nem kérdezünk, csak megvárjuk a megfelelő pillanatot: vagy épp most indult
  // az app, vagy a user hosszabb távollét után tér vissza. Aktív használat
  // közben nem nyúlunk hozzá semmihez.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "production") return;
    if (!updateReady) return;
    const myBuild = process.env.NEXT_PUBLIC_BUILD_ID ?? "unknown";

    const tryAuto = () => {
      // Ha az automata már MAX_AUTO_TRIES-szor nekifutott EBBŐL a buildből és
      // még mindig itt vagyunk, akkor nem működik (rossz deploy / stale edge
      // cache) — ne pörögjünk hurokban, adjuk vissza a döntést a usernek.
      if (readTries(myBuild) >= MAX_AUTO_TRIES) {
        setAutoExhausted(true);
        return;
      }
      if (!isSafeToReload()) return;
      bumpTries(myBuild);
      applyUpdateRef.current();
    };

    const onVis = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = Date.now();
        return;
      }
      const away = hiddenAt.current == null ? 0 : Date.now() - hiddenAt.current;
      hiddenAt.current = null;
      if (away >= AWAY_MS) tryAuto();
    };
    document.addEventListener("visibilitychange", onVis);

    // Hideg indítás: a frissítést az app megnyitása utáni pár másodpercben
    // vettük észre → most a legolcsóbb alkalmazni, a user még nem csinál semmit.
    if (Date.now() - mountedAt.current < COLD_START_MS) tryAuto();

    return () => document.removeEventListener("visibilitychange", onVis);
  }, [updateReady]);

  // Kényszerített visszaszámlálás — csak akkor indul, amikor a "forced" állapot
  // igazzá válik; a user még ekkor is lát egy pár másodperces figyelmeztetést
  // (nincs előzmény nélküli reload egy épp kitöltött űrlap alatt).
  useEffect(() => {
    if (!forced) {
      setCountdown(null);
      return;
    }
    setCountdown(FORCE_COUNTDOWN_S);
    countdownTimer.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c == null || c <= 1) {
          if (countdownTimer.current != null) {
            window.clearInterval(countdownTimer.current);
            countdownTimer.current = null;
          }
          applyUpdateRef.current();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (countdownTimer.current != null) {
        window.clearInterval(countdownTimer.current);
        countdownTimer.current = null;
      }
    };
  }, [forced]);

  if (!updateReady) return null;
  // ⚠️ ALAPESETBEN NINCS BANNER: az automata majd elintézi a következő
  // alkalmas pillanatban. Csak akkor szólunk, ha az automata feladta
  // (autoExhausted), vagy ha már napok óta függ a frissítés (forced).
  if (!forced && !autoExhausted) return null;
  // Kényszerített módban a "Később" hatástalan lenne — a bannernek látszania
  // KELL, hogy a visszaszámlálás ne legyen meglepetés.
  if (!forced && dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-50 mx-auto max-w-md"
    >
      <div className="glass flex items-center gap-3 rounded-pill px-4 py-2.5 shadow-pop">
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-primary-ink ${forced ? "bg-accent-soft text-accent" : "bg-primary-soft"}`}>
          {/* mini "arrow-rotate" — inline SVG, hogy ne kelljen új Icon név */}
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 0 1 15.5-6.3" />
            <path d="M21 4v5h-5" />
          </svg>
        </span>
        <span className="flex-1 text-[12.5px] font-semibold text-ink">
          {forced
            ? `Ez a frissítés már napok óta vár — automatikus frissítés ${countdown ?? FORCE_COUNTDOWN_S} mp múlva.`
            : "Új verzió érhető el."}
        </span>
        {!forced && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-full px-2.5 py-1 text-[12px] font-bold text-ink-muted"
          >
            Később
          </button>
        )}
        <button
          type="button"
          onClick={applyUpdate}
          className={`rounded-full px-3 py-1 text-[12px] font-bold text-white ${forced ? "bg-accent" : "bg-primary"}`}
        >
          Frissítés{forced ? " most" : ""}
        </button>
      </div>
    </div>
  );
}
