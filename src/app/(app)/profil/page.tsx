import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { ClaimDemoButton } from "@/components/views/claim-demo-button";
import { LogoUploader } from "@/components/views/logo-uploader";
import { ProfileEditor } from "@/components/views/profile-editor";
import { InstallPrompt } from "@/components/install-prompt";
import {
  Icon,
  type IconName,
  SectionHeader,
  Sparkline,
  StatCard,
  DropdownMenu,
} from "@/components/ui";
import { getBusinessByOwner, getDashboard, getReviewsByBusiness } from "@/lib/repo";
import { mediaUrl } from "@/lib/media";
import type { Business } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Profilom" };

const HU_MONTH = ["Jan", "Feb", "Már", "Ápr", "Máj", "Jún", "Júl", "Aug", "Szep", "Okt", "Nov", "Dec"];
function fmtDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${HU_MONTH[Number(m) - 1] ?? ""} ${Number(d)}`;
}

function getRelativeTime(isoString: string | null): string {
  if (!isoString) return "nemrég";
  const formatted = isoString.includes("T") ? isoString : `${isoString.replace(" ", "T")}Z`;
  const date = new Date(formatted);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (isNaN(date.getTime())) return "nemrég";
  if (diffMins < 1) return "épp most";
  if (diffMins < 60) return `${diffMins} perce`;
  if (diffHours < 24) return `${diffHours} órája`;
  if (diffDays === 1) return "tegnap";
  return `${diffDays} napja`;
}

export default async function ProfilPage() {
  const { userId } = await auth();
  if (!userId) redirect("/belepes");

  const business = await getBusinessByOwner(userId);
  const avatarUrl = mediaUrl(business?.logoKey);

  return (
    <div className="space-y-4 px-[18px] pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <span
          className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[14px] border-2 border-surface bg-primary-soft shadow-card"
          style={!avatarUrl && business?.photo ? { background: business.photo } : undefined}
        >
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-ink-muted">Szia,</div>
          <div className="truncate text-[17px] font-extrabold tracking-tight text-ink">
            {business?.name ?? "Vállalkozói profil"} 👋
          </div>
        </div>
        <DropdownMenu />
      </header>

      {business ? (
        <OwnerDashboard business={business} />
      ) : (
        <EmptyOwnerState />
      )}

      {/* PWA — telepítés a kezdőképernyőre (csak ha még nem standalone) */}
      <InstallPrompt />

      <section className="space-y-2">
        <SectionHeader>Megjelenés</SectionHeader>
        <div className="flex items-center justify-between rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-sm font-semibold text-ink">Téma</span>
          <ThemeToggle />
        </div>
      </section>
    </div>
  );
}

// --- Üres állapot: nincs még a fiókhoz kötött vállalkozás -------------------
function EmptyOwnerState() {
  return (
    <section className="space-y-3 rounded-card border border-line bg-surface p-6 text-center shadow-card">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
        <Icon name="trending" size={22} strokeWidth={2.2} />
      </div>
      <h2 className="text-lg font-extrabold tracking-tight text-ink">Még nincs vállalkozásod</h2>
      <p className="text-sm leading-relaxed text-ink-muted">
        Kösd a fiókodat egy vállalkozáshoz, és lásd a valós statisztikákat a D1-ből. Demóként
        igényeld Kovács Anna fodrászatát — a Clerk user_id-d bekerül az{" "}
        <code className="font-mono text-[12px]">owner_user_id</code> mezőbe.
      </p>
      <ClaimDemoButton businessId="kovacs-anna" />
    </section>
  );
}

// --- A tulajdonos saját dashboardja (valós D1-adat) -------------------------
async function OwnerDashboard({
  business,
}: {
  business: Business;
}) {
  const data = await getDashboard(business.id);
  if (!data) return null;

  const { stats } = data;
  const total14 = stats.trend.reduce((sum, p) => sum + p.views, 0);
  const trendData = stats.trend.map((p) => p.views);
  const labels = stats.trend.length
    ? [
        fmtDate(stats.trend[0].date),
        fmtDate(stats.trend[Math.floor(stats.trend.length / 2)].date),
        fmtDate(stats.trend[stats.trend.length - 1].date),
      ]
    : [];

  // Dinamikus, valódi aktivitások összeállítása
  const reviews = await getReviewsByBusiness(business.id);
  const activities: { icon: IconName; text: string; time: string }[] = [];

  // 1) Valódi vélemények
  reviews.slice(0, 4).forEach((r) => {
    activities.push({
      icon: "star",
      text: `Új ${r.rating}★ vélemény tőle: ${r.reviewerName}`,
      time: getRelativeTime(r.publishedAt),
    });
  });

  // 2) Dinamikus statisztikai hírek (ha van rá adat)
  if (stats.weekViews > 0) {
    activities.push({
      icon: "eye",
      text: `${stats.weekViews} kinti kereste fel a profilodat ezen a héten`,
      time: "ezen a héten",
    });
  }
  if (stats.weekCalls > 0) {
    activities.push({
      icon: "phone",
      text: `Összesen ${stats.weekCalls} hívást kezdeményeztek a profilról`,
      time: "ezen a héten",
    });
  }

  // 3) Üdvözlő kártya ha teljesen üres lenne
  if (activities.length === 0) {
    activities.push({
      icon: "trending",
      text: "A vállalkozásod létrejött és aktív a Szaknévsorban!",
      time: "épp most",
    });
  }

  return (
    <>
      {/* logó / borítókép feltöltő (R2) */}
      <LogoUploader currentKey={business.logoKey} fallbackGradient={business.photo} />

      {/* Vállalkozói adatok szerkesztése form */}
      <ProfileEditor
        businessId={business.id}
        initialName={business.name}
        initialPhone={business.phone}
        initialBlurb={business.blurb}
        initialAddress={business.address}
        initialCategoryLabel={business.categoryLabel}
        initialOpenText={business.openText}
        initialWorkingHours={business.workingHours ?? null}
        initialSocialLinks={business.socialLinks ?? null}
      />

      {/* heti összegző hero */}
      <section className="relative overflow-hidden rounded-card bg-primary p-[18px] text-white">
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/[0.06]" />
        <div className="relative">
          <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-pill bg-white/[0.18] px-2.5 py-1 text-[10.5px] font-bold tracking-wide">
            <Icon name="trending" size={11} strokeWidth={2.4} /> Ez a hét
          </span>
          <p className="text-[13.5px] leading-snug opacity-90 text-pretty">
            <strong className="font-bold">{stats.weekViews} kinti</strong> nézte meg a profilodat az
            elmúlt 7 napban. <strong>{stats.weekViewsDelta}</strong> a múlt héthez képest.
          </p>
        </div>
      </section>

      {/* KPI trió */}
      <section className="grid grid-cols-3 gap-2">
        <StatCard icon="eye" value={stats.weekViews} label="Megtekintés" delta={stats.weekViewsDelta} />
        <StatCard icon="cursor" value={stats.weekClicks} label="Profil-megnyitás" delta={stats.weekClicksDelta} />
        <StatCard icon="phone" value={stats.weekCalls} label="Hívás" delta={stats.weekCallsDelta} accent />
      </section>

      {/* trendvonal */}
      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="mb-2">
          <div className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">
            Megtekintések · 14 nap
          </div>
          <div className="text-[22px] font-extrabold tracking-tight text-ink">
            {total14}
            <span className="ml-1.5 text-[13px] font-bold text-success">↑ +41%</span>
          </div>
        </div>
        <Sparkline data={trendData} />
        <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-ink-faint">
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      </section>

      {/* mai aktivitás */}
      <section className="space-y-2">
        <SectionHeader>Valós aktivitás</SectionHeader>
        {activities.map((a, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary-soft text-primary">
              <Icon name={a.icon} size={14} strokeWidth={2.2} />
            </span>
            <span className="flex-1 text-[13.5px] font-semibold text-ink">{a.text}</span>
            <span className="text-[11.5px] font-medium text-ink-muted">{a.time}</span>
          </div>
        ))}
      </section>
    </>
  );
}
