import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";
import { CommunityView } from "@/components/views/community-view";
import { PushOptin } from "@/components/push-optin";
import { getBulletinKinds, getBulletinPosts, getEvents } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Közösség" };

export default async function KozossegPage() {
  const [events, kinds, posts] = await Promise.all([
    getEvents(),
    getBulletinKinds(),
    getBulletinPosts(),
  ]);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <div className="space-y-4 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="px-5">
        <ScreenHeader
          eyebrow="Közösség · Svájc"
          title={
            <>
              Kint vagy, de
              <br />
              nem vagy egyedül.
            </>
          }
        />
      </div>

      {/* A két legkeresettebb téma — dedikált börze */}
      <div className="grid grid-cols-2 gap-2.5 px-5">
        <Link
          href="/alberlet"
          className="flex items-center gap-2.5 rounded-card border border-line bg-surface p-3 shadow-card transition active:scale-[0.98]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary">
            <Icon name="home" size={19} strokeWidth={2.3} />
          </span>
          <span className="min-w-0">
            <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
              Albérlet
            </span>
            <span className="block text-[11px] text-ink-muted">lakás · szoba</span>
          </span>
        </Link>
        <Link
          href="/allas"
          className="flex items-center gap-2.5 rounded-card border border-line bg-surface p-3 shadow-card transition active:scale-[0.98]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary">
            <Icon name="trending" size={19} strokeWidth={2.3} />
          </span>
          <span className="min-w-0">
            <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
              Állás
            </span>
            <span className="block text-[11px] text-ink-muted">munka · alkalmi</span>
          </span>
        </Link>
      </div>

      {/* Telekocsi — Svájc ↔ Magyarország */}
      <div className="px-5">
        <Link
          href="/telekocsi"
          className="flex items-center gap-3 rounded-card border border-[#3a6ea5]/20 bg-[#3a6ea5]/10 p-3 shadow-card transition active:scale-[0.98]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#3a6ea5] text-white text-lg">
            🚗
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">
              Telekocsi
            </span>
            <span className="block text-[11px] text-ink-muted">szabad helyes utazások kintiek között</span>
          </span>
          <Icon name="chevR" size={16} strokeWidth={2.2} className="shrink-0 text-[#3a6ea5]" />
        </Link>
      </div>

      {/* Push-értesítés feliratkozás (új esemény a kantonodban) */}
      <div className="px-5">
        <PushOptin />
      </div>

      <CommunityView events={events} kinds={kinds} posts={posts} turnstileSiteKey={turnstileSiteKey} />
    </div>
  );
}
