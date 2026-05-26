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
import { getBusinesses, getEvents } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const [featured, events] = await Promise.all([
    getBusinesses({ featured: true }),
    getEvents({ limit: 3 }),
  ]);

  return (
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
            className="h-[18px] w-[18px] rounded-[4px] object-contain select-none"
          />
        </div>
        <div className="flex-1" />
        <DropdownMenu />
      </header>

      {/* svájci időjárás — a kiválasztott kanton székhelye (MeteoSwiss ICON) */}
      <WeatherWidget />

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
    </div>
  );
}
