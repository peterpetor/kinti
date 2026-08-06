"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

/**
 * A kezdőlap HAJTÁS ALATTI (és feltételes) komponenseinek LAZY betöltése —
 * a `global-search-lazy.tsx` bevált mintája szerint (`ssr:false` + dynamic).
 *
 * Miért biztonságos ez vizuálisan? A legtöbb itteni komponens amúgy is CSAK a
 * kliens-mount UTÁN rendel tartalmat (localStorage / GPS / `!mounted`-őr —
 * bannerek, streak, personalized, widgetek), tehát az SSR-jük eddig is üres volt.
 * Így a lazy-vé tétel a first-load JS-t csökkenti anélkül, hogy a megjelenés
 * érezhetően változna. A NAGYOBB, valós tartalmú szekciók (widget-board,
 * közeledben-lista, modul-rács) magasság-tartó helyőrzőt kapnak (CLS-védelem,
 * ha a felhasználó gyorsan görget, mielőtt a chunk beér).
 *
 * FENT MARAD (eager, first paint): fejléc, HomeGreeting, KintiAssistant (hero),
 * HomePrimaryActions + HomeChCards (a home-country-aware modul amúgy is eager).
 */

/** Egyszerű, aria-rejtett magasság-tartó helyőrző a nagyobb szekciókhoz. */
function box(cls: string) {
  const Placeholder = () => <div className={cls} aria-hidden />;
  return Placeholder;
}

/**
 * ⚠️⚠️ MINDEN `ssr: false`-HOZ KELL SAJÁT `<Suspense>` — KÜLÖNBEN AZ EGÉSZ LAP
 * KLIENSRE ESIK.
 *
 * VALÓS, MÉRT HIBA (2026-08-06). A kezdőlap kiszolgált HTML-jében ez állt:
 *   <!--$?--><template id="B:0">    ← a lap-szintű határ SOHA nem fejeződött be
 *   <!--$!--><template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING">
 *
 * A `dynamic(..., { ssr: false, loading: NINCS_HELYORZO })` SSR közben „kliens-oldali renderre bailoutol”.
 * Ha van `loading`, a bailout ODA korlátozódik — az a komponens saját határa.
 * `loading` NÉLKÜL viszont a legközelebbi Suspense-határig kúszik fel, és mivel
 * a kezdőlapon nincs saját határ, ez a ROUTE-SZINTŰ határ (loading.tsx) lett:
 * a szerver a teljes lap helyett a betöltő csontvázat küldte, a tartalmat pedig
 * a böngészőnek kellett felépítenie. Kívülről csak annyi látszott, hogy a lap
 * „működik” — közben minden szerver-render kárba ment, és a konzol React #419-et
 * dobott (a határ megszakadt).
 *
 * ⚠️ A `loading:` NEM ELÉG — ezt megmértem. A `loading` a kliens-oldali
 * chunk-betöltés állapotát adja, az SSR-bailoutot NEM fogja meg: hozzáadása
 * után a `<!--$?-->` függő határ és a hiányzó lezárás VÁLTOZATLAN maradt.
 * Ami megfogja, az egy VALÓDI `<Suspense>` határ a komponens körül — ezért
 * néz ki tisztán a /szaknevsor, ahol a lusta térkép saját `<Suspense>`-ben ül.
 *
 * Bizonyíték a kiszolgált HTML-ből (javítás előtt):
 *   <!--$?--><template id="B:0">   ← nyitva marad
 *   completeBoundary ($RC): 0      ← SOHA nem záródik le
 *   a „Mit szeretnél?" felirat csak az RSC-adatban van, a DOM-ban nincs
 * Vagyis a szerver a betöltő csontvázat küldte ki, a lapot a böngésző rajzolta.
 */
const NINCS_HELYORZO = box("");

/**
 * `ssr: false` komponens SAJÁT határral. A bailout így ide korlátozódik, és a
 * lap többi része szerver-oldalon renderelt marad.
 */
function hatarral<P extends object>(C: React.ComponentType<P>, Fallback: () => JSX.Element) {
  const Wrapped = (props: P) => (
    <Suspense fallback={<Fallback />}>
      <C {...props} />
    </Suspense>
  );
  Wrapped.displayName = "Hatarral";
  return Wrapped;
}

export const MyPostsBannerLazy = hatarral(
  dynamic(
  () => import("./my-posts-banner").then((m) => m.MyPostsBanner),
  { ssr: false },
),
  NINCS_HELYORZO,
);
export const ReviewFollowupCardLazy = hatarral(
  dynamic(
  () => import("./review-followup-card").then((m) => m.ReviewFollowupCard),
  { ssr: false },
),
  NINCS_HELYORZO,
);
export const RelocationReminderBannerLazy = hatarral(
  dynamic(
  () => import("./relocation-reminder-banner").then((m) => m.RelocationReminderBanner),
  { ssr: false },
),
  NINCS_HELYORZO,
);
export const PersonalizedHomeLazy = hatarral(
  dynamic(
  () => import("./personalized-home").then((m) => m.PersonalizedHome),
  { ssr: false },
),
  NINCS_HELYORZO,
);
export const OnboardingChecklistLazy = hatarral(
  dynamic(
  () => import("./onboarding-checklist").then((m) => m.OnboardingChecklist),
  { ssr: false },
),
  NINCS_HELYORZO,
);
export const DailyStreakLazy = hatarral(
  dynamic(
  () => import("./daily-streak").then((m) => m.DailyStreak),
  { ssr: false },
),
  NINCS_HELYORZO,
);
export const HomeWidgetsSectionLazy = hatarral(
  dynamic(
  () => import("./home-widgets-section").then((m) => m.HomeWidgetsSection),
  { ssr: false },
),
  box("min-h-[128px]"),
);
export const NearbyBusinessesLazy = hatarral(
  dynamic(
  () => import("./nearby-businesses").then((m) => m.NearbyBusinesses),
  { ssr: false },
),
  // ⚠️ MÉRT: a tényleges magasság 411 px, a helyőrző 120 volt — a NEGYEDE,
  // vagyis 291 px-es ugrás. A blokk MINDIG 3 kártyát mutat (`slice(0, 3)`),
  // tehát a magassága stabil, nem találat-függő.
  box("min-h-[380px]"),
);
export const HomePlatformGridLazy = hatarral(
  dynamic(
  () => import("./home-platform-grid").then((m) => m.HomePlatformGrid),
  { ssr: false },
),
  // ⚠️ MÉRT ÉRTÉK, nem becslés (éles Playwright-mérés, 390 px széles nézet):
  // a rács TÉNYLEGES magassága 439 px, a helyőrző 300 volt — vagyis minden
  // betöltéskor 139 px-et ugrott a lap alsó fele. A 430 szándékosan épphogy a
  // mért alatt van: így összecsukott állapotban sem marad üres rés.
  box("min-h-[430px]"),
);
export const ReferralHomeCardLazy = hatarral(
  dynamic(
  () => import("./referral-home-card").then((m) => m.ReferralHomeCard),
  { ssr: false },
),
  NINCS_HELYORZO,
);
export const NewsletterCtaCardLazy = hatarral(
  dynamic(
  () => import("./newsletter-cta-card").then((m) => m.NewsletterCtaCard),
  { ssr: false },
),
  NINCS_HELYORZO,
);
export const PwaInstallCardLazy = hatarral(
  dynamic(
  () => import("./pwa-install-card").then((m) => m.PwaInstallCard),
  { ssr: false },
),
  NINCS_HELYORZO,
);
