import Link from "next/link";
import {
  Icon,
  KintiLogo,
  SectionHeader,
  DropdownMenu,
} from "@/components/ui";
import { WeatherWidget } from "@/components/weather-widget";
import { HomeCountryFlag, HomePrimaryActions, HomeEvents, HomeChCards } from "@/components/home-country-aware";
import { MyPostsBanner } from "@/components/my-posts-banner";
import { DailyStreak } from "@/components/daily-streak";
import { GlobalSearch } from "@/components/global-search";
import { PwaInstallCard } from "@/components/pwa-install-card";
import { RelocationReminderBanner } from "@/components/relocation-reminder-banner";
import { ExchangeRateWidget } from "@/components/exchange-rate-widget";
import { KvizDailyCard } from "@/components/kviz-daily-card";
import { NapiSzoCard } from "@/components/napi-szo-card";
import { HomePlatformGrid } from "@/components/home-platform-grid";
import { TrustBar } from "@/components/trust-bar";
import { NewsletterCtaCard } from "@/components/newsletter-cta-card";
import { NearbyBusinesses } from "@/components/nearby-businesses";
import { getBusinesses, getEvents } from "@/lib/repo";
import { cached } from "@/lib/edge-cache";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** A kezdőlap listái mindenkinek azonosak (nincs per-user szerver-adat) →
 *  izolátum-szintű TTL-cache, hogy ne minden kérés érje a D1-et. */
const HOME_TTL_MS = 300_000; // 5 perc

export default async function FeedPage() {
  const [allBusinesses, events] = await Promise.all([
    cached("home:businesses", HOME_TTL_MS, () => getBusinesses()),
    cached("home:events:12", HOME_TTL_MS, () => getEvents({ limit: 12 })),
  ]);
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

      <HomeEvents events={events} />

      {/* Napi infó — másodlagos, a tartalom alatt */}
      <WeatherWidget />
      <ExchangeRateWidget />
      <KvizDailyCard />
      <NapiSzoCard />

      <HomeChCards />

      <NewsletterCtaCard />
      <PwaInstallCard />
      <TrustBar />
      </div>
    </>
  );
}

