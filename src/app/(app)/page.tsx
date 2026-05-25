import Link from "next/link";
import {
  BusinessCard,
  GlassPill,
  Icon,
  IconButton,
  KintiLogo,
  SectionHeader,
} from "@/components/ui";
import { AuthControl } from "@/components/auth-control";
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
        <KintiLogo size={28} />
        <span className="flex-1 text-[22px] font-extrabold tracking-tight text-ink">kinti</span>
        <IconButton variant="surface" aria-label="Értesítések" className="relative">
          <Icon name="bell" size={18} />
          <span className="absolute right-2.5 top-2 h-[7px] w-[7px] rounded-full border-[1.5px] border-surface bg-accent" />
        </IconButton>
        <AuthControl />
      </header>

      {/* kereső-belépő (Szaknévsorra visz) */}
      <Link
        href="/szaknevsor"
        className="flex items-center gap-2.5 rounded-[18px] border border-line bg-surface px-3.5 py-3 text-[15px] font-medium text-ink-faint shadow-card"
      >
        <Icon name="search" size={20} className="text-ink-muted" />
        <span className="flex-1">Mit keresel?</span>
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary-soft text-primary">
          <Icon name="sliders" size={16} strokeWidth={2.2} />
        </span>
      </Link>

      <GlassPill>
        <Icon name="pin" size={14} strokeWidth={2.2} className="text-accent" />
        Zürich · Kreis 3
        <Icon name="chevD" size={13} strokeWidth={2.2} className="text-ink-muted" />
      </GlassPill>

      {/* kiemelt vállalkozások */}
      <section className="space-y-3">
        <SectionHeader
          right={
            <Link href="/szaknevsor" className="text-[13px] font-bold text-primary">
              Mind ›
            </Link>
          }
        >
          Kiemelt a közeledben
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
