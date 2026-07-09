import Link from "next/link";
import {
  Icon,
  KintiLogo,
  SectionHeader,
  DropdownMenu,
} from "@/components/ui";
import { WeatherWidget } from "@/components/weather-widget";
import { HomeCountryFlag, HomePrimaryActions, HomeChCards } from "@/components/home-country-aware";
import { MyPostsBanner } from "@/components/my-posts-banner";
import { DailyStreak } from "@/components/daily-streak";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { ReviewFollowupCard } from "@/components/review-followup-card";
import { GlobalSearch } from "@/components/global-search";
import { PwaInstallCard } from "@/components/pwa-install-card";
import { RelocationReminderBanner } from "@/components/relocation-reminder-banner";
import { ExchangeRateWidget } from "@/components/exchange-rate-widget";
import { KvizDailyCard } from "@/components/kviz-daily-card";
import { NapiSzoCard } from "@/components/napi-szo-card";
import { HomePlatformGrid } from "@/components/home-platform-grid";
import { ReferralHomeCard } from "@/components/referral-home-card";
import { TrustBar } from "@/components/trust-bar";
import { NewsletterCtaCard } from "@/components/newsletter-cta-card";
import { NearbyBusinesses } from "@/components/nearby-businesses";
import { HomeWidgets } from "@/components/home-widgets";
import { getBusinessesForList } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function FeedPage() {
  // Karcsú vetület + saját (3 perces) cache a repóban — a /szaknevsor oldallal
  // KÖZÖS kulcson, így a két oldal TTL-enként EGYSZER megy D1-re.
  const allBusinesses = await getBusinessesForList();
  // „A közeledben" csak a koordinátával rendelkezőkből válogat (kliensoldali
  // GPS-rendezéshez). Trükkös payload-méret ellen: max 200 rekord.
  const nearby = allBusinesses
    .filter((b) => b.lat != null && b.lng != null)
    .slice(0, 200);

  return (
    <>
      <div className="space-y-6 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <KintiLogo size={28} />
          <span className="text-[22px] font-extrabold tracking-tight text-ink">kinti</span>
          <HomeCountryFlag />
        </div>
        <div className="flex-1" />
        <GlobalSearch />
        <DropdownMenu />
      </header>

      <MyPostsBanner />
      {/* Aktivációs checklist — az új felhasználót 3 lépésben teszi „lakóvá"
          (régió → push → első kedvenc); kész/bezárt állapotban null. */}
      <OnboardingChecklist />
      {/* Hívás-utáni vélemény-kérő (2 óra – 14 nap ablak, cégenként egyszer). */}
      <ReviewFollowupCard />
      <DailyStreak />
      <RelocationReminderBanner />

      {/* Fő belépési pontok — „mit hol találok" (nagy, érthető célok) */}
      <section className="space-y-3">
        <SectionHeader>Mit szeretnél?</SectionHeader>
        <HomePrimaryActions />
      </section>

      {/* Teljes platform — a modulok szélessége egy helyen */}
      <HomePlatformGrid />

      <section className="space-y-3">
        <SectionHeader
          right={
            <Link href="/szaknevsor" className="text-[13px] font-bold text-primary">
              Mind ›
            </Link>
          }
        >
          A közeledben
        </SectionHeader>
        <NearbyBusinesses businesses={nearby} />
      </section>

      {/* Napi infó — testreszabható: átrendezhető / elrejthető (kliensoldali) */}
      <HomeWidgets
        widgets={[
          { id: "weather", label: "Időjárás", node: <WeatherWidget /> },
          { id: "exchange", label: "Árfolyam", node: <ExchangeRateWidget /> },
          { id: "kviz", label: "Napi kvíz", node: <KvizDailyCard /> },
          { id: "napiszo", label: "Napi szó", node: <NapiSzoCard /> },
        ]}
      />

      <HomeChCards />

      {/* Organikus növekedés — anonim meghívó-link megosztása */}
      <ReferralHomeCard />

      <NewsletterCtaCard />
      <PwaInstallCard />
      <TrustBar />
      </div>
    </>
  );
}

