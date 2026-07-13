"use client";

/**
 * Android-app (Google Play / TWA) kontextus-detektálás.
 *
 * MIÉRT: a Google Play szabályzata szerint az áruházból telepített appban
 * digitális termék CSAK a Google Play fizetési rendszerén át árulható — a
 * webes (Paddle) checkout és annak minden említése TILOS ott. Ezért az app
 * (Trusted Web Activity) a `/?source=twa` címmel indul, amit egy fej-szkript
 * (layout.tsx: ANDROID_APP_SCRIPT) még az első festés előtt észlel, eltárol
 * (`localStorage: kinti.androidApp`) és kitesz a `<html data-android-app>`
 * attribútumba. Innentől:
 *   • CSS: a `.web-only-payment` elemek rejtve, az `.android-only-payment`
 *     elemek látszanak (globals.css) — szerver-oldali (jogi) oldalakon is,
 *     hidratálás-villanás nélkül;
 *   • JS: a useCheckout Paddle helyett a Google Play Billingre vált
 *     (lib/play-billing.ts).
 *
 * A flag TARTÓS (localStorage): a TWA minden navigációja app-kontextus marad,
 * akkor is, ha a source= paraméter az első oldal után eltűnik.
 */
import { useEffect, useState } from "react";

const STORAGE_KEY = "kinti.androidApp";

/** Szinkron ellenőrzés (nem-React kódból, pl. useCheckout belsejéből). */
export function isAndroidApp(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Hidratálás-biztos hook: az első (szerverrel egyező) render mindig `false`,
 * mount után vált a valós értékre — a bevett mounted-gate minta.
 */
export function useIsAndroidApp(): boolean {
  const [is, setIs] = useState(false);
  useEffect(() => {
    setIs(isAndroidApp());
  }, []);
  return is;
}
