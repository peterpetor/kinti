"use client";

import { useEffect } from "react";
import { usePreferredCountry } from "@/lib/country-pref";

/**
 * CountryRevealer — feloldja a boot-gate-et (a fej-szkript által beállított
 * `data-country-pending` attribútumot a <html>-en), amint a kliens kiolvasta a
 * választott (nem-CH) országot ÉS a tartalom újrarenderelt rá.
 *
 * Miért így: a statikus oldal a CH-alapértelmezettel renderelődik (a szerver nem
 * tudja az országot — privacy + edge-cache). Nem-CH usernél ez „rossz” tartalom,
 * ezért a fej-szkript rejti a body-t. A `usePreferredCountry` az első renderben
 * `null`, majd egy mount-effektben a localStorage-ból a valódi országot adja —
 * ekkor a tartalom-komponensek is átrenderelnek a helyes országra. EBBEN a
 * renderben (country != null) oldjuk fel a rejtést, így a felhasználó sosem látja
 * a köztes svájci állapotot.
 *
 * Biztonsági háló: a fej-szkript egy időzítővel is feloldja (ha a hidratálás
 * valamiért elmaradna), így a body sosem ragad rejtve.
 */
export function CountryRevealer() {
  const [country] = usePreferredCountry();

  useEffect(() => {
    if (country) {
      document.documentElement.removeAttribute("data-country-pending");
    }
  }, [country]);

  return null;
}
