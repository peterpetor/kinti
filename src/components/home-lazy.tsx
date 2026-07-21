"use client";

import dynamic from "next/dynamic";

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

export const MyPostsBannerLazy = dynamic(
  () => import("./my-posts-banner").then((m) => m.MyPostsBanner),
  { ssr: false },
);
export const ReviewFollowupCardLazy = dynamic(
  () => import("./review-followup-card").then((m) => m.ReviewFollowupCard),
  { ssr: false },
);
export const RelocationReminderBannerLazy = dynamic(
  () => import("./relocation-reminder-banner").then((m) => m.RelocationReminderBanner),
  { ssr: false },
);
export const PersonalizedHomeLazy = dynamic(
  () => import("./personalized-home").then((m) => m.PersonalizedHome),
  { ssr: false },
);
export const OnboardingChecklistLazy = dynamic(
  () => import("./onboarding-checklist").then((m) => m.OnboardingChecklist),
  { ssr: false },
);
export const DailyStreakLazy = dynamic(
  () => import("./daily-streak").then((m) => m.DailyStreak),
  { ssr: false },
);
export const HomeWidgetsSectionLazy = dynamic(
  () => import("./home-widgets-section").then((m) => m.HomeWidgetsSection),
  { ssr: false, loading: box("min-h-[128px]") },
);
export const NearbyBusinessesLazy = dynamic(
  () => import("./nearby-businesses").then((m) => m.NearbyBusinesses),
  { ssr: false, loading: box("min-h-[120px]") },
);
export const HomePlatformGridLazy = dynamic(
  () => import("./home-platform-grid").then((m) => m.HomePlatformGrid),
  { ssr: false, loading: box("min-h-[300px]") },
);
export const ReferralHomeCardLazy = dynamic(
  () => import("./referral-home-card").then((m) => m.ReferralHomeCard),
  { ssr: false },
);
export const NewsletterCtaCardLazy = dynamic(
  () => import("./newsletter-cta-card").then((m) => m.NewsletterCtaCard),
  { ssr: false },
);
export const PwaInstallCardLazy = dynamic(
  () => import("./pwa-install-card").then((m) => m.PwaInstallCard),
  { ssr: false },
);
