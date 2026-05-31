import Link from "next/link";
import {
  BusinessCard,
  GlassPill,
  Icon,
  KintiLogo,
  SectionHeader,
  DropdownMenu,
} from "@/components/ui";
import { WeatherWidget } from "@/components/weather-widget";
import { OnboardingTour } from "@/components/onboarding-tour";
import { MyPostsBanner } from "@/components/my-posts-banner";
import { GlobalSearch } from "@/components/global-search";
import { PwaInstallCard } from "@/components/pwa-install-card";
import { ExchangeRateWidget } from "@/components/exchange-rate-widget";
import { KvizDailyCard } from "@/components/kviz-daily-card";
import { getBusinesses, getEvents } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const [featured, events] = await Promise.all([
    getBusinesses({ featured: true }),
    getEvents({ limit: 3 }),
  ]);

  return (
    <>
      <div className="space-y-6 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+2rem)]">
      {/* fejléc */}
      <header className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <KintiLogo size={28} />
          <span className="text-[22px] font-extrabold tracking-tight text-ink">kinti</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/switzerland-flag.png"
            alt="Svájc"
            className="h-[36px] w-[36px] rounded-[6px] object-contain select-none"
          />
        </div>
        <div className="flex-1" />
        <GlobalSearch />
        <DropdownMenu />
      </header>

      {/* helyi posztok banner — csak ha vannak */}
      <MyPostsBanner />

      {/* svájci időjárás — a kiválasztott kanton székhelye (MeteoSwiss ICON) */}
      <WeatherWidget />

      {/* CHF/HUF árfolyam widget — gyors elérés a kalkulátorhoz */}
      <ExchangeRateWidget />

      {/* Napi kvíz widget — 3 kérdés naponta */}
      <KvizDailyCard />

      {/* friss / közeli vállalkozások — szerkesztői válogatás */}
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
        <div className="grid gap-2.5">
          {featured.map((b) => (
            <BusinessCard key={b.id} business={b} href={`/szaknevsor/${b.id}`} />
          ))}
        </div>
      </section>

      {/* legközelebbi események */}
      <section className="space-y-3">
        <SectionHeader
          right={
            <Link href="/kozosseg" className="text-[13px] font-bold text-primary">
              Mind ›
            </Link>
          }
        >
          Következő események
        </SectionHeader>
        <div className="grid gap-2.5">
          {events.map((e) => (
            <Link
              key={e.id}
              href="/kozosseg"
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-card transition active:scale-[0.99]"
            >
              <div className="w-[50px] shrink-0 rounded-xl border border-line bg-surface-alt py-1.5 text-center">
                <div className="text-[9px] font-extrabold uppercase tracking-wide text-primary">
                  {e.dateMonth}
                </div>
                <div className="text-xl font-extrabold leading-none text-ink">{e.dateDay}</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14.5px] font-bold tracking-[-0.01em] text-ink">
                  {e.title}
                </div>
                <div className="mt-0.5 text-xs text-ink-muted">
                  {e.venue} · {e.going} fő megy
                </div>
              </div>
              <Icon name="chevR" size={14} className="text-ink-muted" />
            </Link>
          ))}
        </div>
      </section>

      {/* Kiköltözés Tracker — új modul */}
      <Link
        href="/kikoltozes"
        className="flex items-center gap-3 rounded-card border border-accent/20 bg-accent-soft px-4 py-3.5 shadow-card transition active:scale-[0.99]"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-accent text-white">
          <Icon name="check" size={19} strokeWidth={2.3} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-extrabold tracking-[-0.01em] text-ink">
            Kiköltözés Tracker
          </span>
          <span className="block text-[12px] text-ink-muted">
            Személyre szabott, lépésről-lépésre checklist Svájcba költözőknek
          </span>
        </span>
        <Icon name="chevR" size={16} strokeWidth={2.2} className="shrink-0 text-accent" />
      </Link>

      {/* Tudásbázis — hivatalos útmutatók */}
      <Link
        href="/tudasbazis"
        className="flex items-center gap-3 rounded-card border border-primary/20 bg-primary-soft px-4 py-3.5 shadow-card transition active:scale-[0.99]"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary text-white">
          <Icon name="globe" size={19} strokeWidth={2.3} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-extrabold tracking-[-0.01em] text-ink">
            Tudásbázis — hasznos tudnivalók
          </span>
          <span className="block text-[12px] text-ink-muted">
            Bejelentkezés, Krankenkasse, adó, iskola — hivatalos forrásból
          </span>
        </span>
        <Icon name="chevR" size={16} strokeWidth={2.2} className="shrink-0 text-primary" />
      </Link>

      {/* PWA install prompt — chrome/edge/android natív; iOS Safari instrukció */}
      <PwaInstallCard />
      </div>

      {/* első látogatáskor — 5 lépcsős mini-tour (moved outside space-y-6 to fix margin bug) */}
      <OnboardingTour />
    </>
  );
}
