import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { LogoUploader } from "@/components/views/logo-uploader";
import { OwnerDraftForm } from "@/components/views/owner-draft-form";
import { ProfileEditor } from "@/components/views/profile-editor";
import { BoostCheckoutButton } from "@/components/views/boost-checkout-button";
import { LeadInbox } from "@/components/views/lead-inbox";
import { InstallPrompt } from "@/components/install-prompt";
import { HomeCountryFlag } from "@/components/home-country-aware";
import {
  Icon,
  type IconName,
  SectionHeader,
  Sparkline,
  StatCard,
  DropdownMenu,
  KintiLogo,
} from "@/components/ui";
import { getBusinessByOwner, getEmployerByOwner, getCategories, getDashboard, getReviewsByBusiness, getBusinessLeads, countNewBusinessLeads, getLeadCounts, FREE_LEADS_PER_MONTH, getTopSearchTerms } from "@/lib/repo";
import type { LeadCard } from "@/components/views/lead-inbox";
import { mediaUrl } from "@/lib/media";
import { handleFromId } from "@/lib/handle";
import type { Business, Category } from "@/lib/types";



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

export default async function ProfilPage({
  searchParams,
}: {
  searchParams?: { pro?: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/belepes");

  const business = await getBusinessByOwner(userId);
  const categories = business ? [] : (await getCategories()).filter((c) => c.id !== "all");
  // Közös cégprofil-élmény: mindig tudjuk, van-e Munkáltatói profil is. Ha nincs
  // Szaknévsor-vállalkozás, de VAN munkáltatói profil, a user szinte biztos összekeverte
  // a kettőt (a Szaknévsor PRO ≠ álláshirdetés). Ha VAN vállalkozás de nincs munkáltató,
  // felkínáljuk az állás-hirdetést is (egy cég, két kapcsoló).
  const employer = await getEmployerByOwner(userId);
  const proIntent = !business && searchParams?.pro === "1";

  return (
    <div className="space-y-4 px-[18px] pt-[calc(env(safe-area-inset-top)+2rem)] pb-28">
      {/* fejléc */}
      <header className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <KintiLogo size={28} />
          <span className="text-[22px] font-extrabold tracking-tight text-ink">kinti</span>
          <HomeCountryFlag />
        </div>
        <div className="flex-1" />
        <DropdownMenu />
      </header>

      {/*
        * LEGACY / ADMIN FELÜLET.
        * A nyilvános vállalkozói flow most már 100%-ban email-only (Clerk nélkül):
        *   - Feladás:    /szaknevsor/uj
        *   - Szerkesztés: /szaknevsor/kezeles/<token>  (manage URL e-mailben)
        * Ez a /profil oldal egy Clerk-belépést igénylő admin/legacy dashboard,
        * megőrizve azoknak, akik még Clerk-fiókkal lépnek be (pl. te magad).
        */}
      {business ? (
        <OwnerDashboard business={business} hasEmployer={!!employer} />
      ) : (
        <OnboardingCTA categories={categories} proIntent={proIntent} employerName={employer?.companyName ?? null} />
      )}

      {/* PWA — telepítés a kezdőképernyőre (csak ha még nem standalone) */}
      <InstallPrompt />

      {/* A /profil kizárólag a vállalkozásodról szól. A személyes eszközök (Kinti
          Radar / árfolyam-figyelő) a „…” menü → Pénzügyek → Árfolyam-figyelő alatt,
          az alkalmazás-beállítások (Megjelenés, Hírlevél, Értesítések) a „…” menü →
          Alkalmazás beállítások alatt érhetők el — ne terheljék a dashboardot. */}
    </div>
  );
}

// --- Onboarding: belépett userhez még nincs vállalkozás --------------------
function OnboardingCTA({
  categories,
  proIntent = false,
  employerName = null,
}: {
  categories: Category[];
  proIntent?: boolean;
  employerName?: string | null;
}) {
  const features: { icon: IconName; title: string; body: string }[] = [
    { icon: "list", title: "Céges adatok", body: "Név, kategória, rövid bemutatkozás" },
    { icon: "phone", title: "Kapcsolat", body: "Telefon, e-mail, weboldal, közösségi linkek" },
    { icon: "nav", title: "Cím + térkép", body: "Cím, régió, megjelenés a térképen" },
    { icon: "calendar", title: "Nyitvatartás", body: "Heti beosztás, „nyitva most” jelző" },
    { icon: "globe", title: "Beszélt nyelvek", body: "Magyar + DE/FR/IT/EN jelzések" },
    { icon: "star", title: "Vélemények", body: "Csillagos értékelések, válaszadás" },
  ];

  // Akinek MÁR van Munkáltatói profilja, annak NEM mutatunk teljes „üdvözlő + hozd létre”
  // onboardingot (az zavaró és redundánsnak hat). Helyette tömör „utolsó lépés” nézet:
  // a cégadatokat átvettük, csak a Szaknévsorhoz szükséges 2 extra mező kell (kategória +
  // régió), őszinte indoklással, félrevezető linkek nélkül.
  if (employerName) {
    return (
      <section className="space-y-4">
        <div className="rounded-card border border-pro/40 bg-pro/5 p-5">
          <h2 className="text-[19px] font-extrabold leading-tight tracking-tight text-ink">
            🚀 Utolsó lépés a Szaknévsorhoz
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted text-pretty">
            A cégadataidat <strong className="text-ink">(„{employerName}")</strong> átvettük a
            munkáltatói profilodból — <strong>nem kell újra begépelned</strong>, és ott nincs
            semmi teendőd. A Szaknévsor viszont <strong>szakma- és hely-alapú</strong> (az ügyfelek
            így keresnek: „magyar fodrász, Zürich”, és a térképen is látszol), ezért <strong>csak
            ehhez</strong> kell még két adat: <strong>mivel foglalkozol</strong> és <strong>hol</strong>.
            Ennyi — utána jön a PRO-előfizetés.
          </p>
        </div>

        <OwnerDraftForm categories={categories} initialName={employerName} />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* PRO-szándékkal érkezett (a /pro „Szaknévsor PRO” gombjáról): egyértelműsítjük,
          hogy előbb a listázás kell, utána egy gombbal előfizethet — ne fusson körbe. */}
      {proIntent && (
        <div className="rounded-card border border-pro/40 bg-pro/5 px-4 py-3">
          <p className="text-[13.5px] font-extrabold text-ink">🚀 Már csak egy lépés a Szaknévsor PRO</p>
          <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
            A PRO a <strong>Szaknévsor-listázásodat</strong> emeli ki. Előbb hozd létre a
            vállalkozásod (lent, 1 perc) — utána egyetlen gombbal előfizethetsz a Kiemelésre.
          </p>
        </div>
      )}

      <div className="rounded-card border border-line bg-gradient-to-br from-primary to-accent p-5 text-white shadow-card">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/20 px-2.5 py-1 text-[11.5px] font-extrabold uppercase tracking-wide">
          Üdvözlünk! 👋
        </span>
        <h2 className="mt-2.5 text-[22px] font-extrabold leading-tight tracking-tight text-balance">
          Hozd létre a vállalkozói profilod
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-snug opacity-90 text-pretty">
          Pár adat — név, kategória, régió — és máris kész vagy. A részleteket
          (kapcsolat, nyitvatartás, nyelvek, logó) utána állítod be.
        </p>
      </div>

      <OwnerDraftForm categories={categories} />

      <div className="rounded-card border border-line bg-surface p-4 shadow-card">
        <SectionHeader>Mit fogsz beállítani</SectionHeader>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {features.map((f) => (
            <div key={f.title} className="flex h-full items-start gap-2 rounded-2xl border border-line bg-surface-alt/50 p-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-primary/10 text-primary">
                <Icon name={f.icon} size={13} strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <div className="text-[12px] font-extrabold leading-tight text-ink">{f.title}</div>
                <div className="mt-0.5 text-[11.5px] leading-snug text-ink-muted">{f.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-card border border-line bg-surface-alt/60 p-3.5 text-center space-y-1.5">
        <p className="text-[12px] leading-snug text-ink-muted">
          Már szerepelsz a Szaknévsorban?
        </p>
        <Link href="/szaknevsor?claim=1" className="inline-block text-[12.5px] font-bold text-primary underline">
          Igényeld a vállalkozásod →
        </Link>
      </div>
    </section>
  );
}

// --- A tulajdonos saját dashboardja (valós D1-adat) -------------------------
async function OwnerDashboard({
  business,
  hasEmployer = false,
}: {
  business: Business;
  hasEmployer?: boolean;
}) {
  const data = await getDashboard(business.id);
  if (!data) return null;

  // Ajánlatkérés-postaláda — FREEMIUM: havi 5 ingyenes lead teljesen látszik, a többi
  // ZÁROLT (kontakt elrejtve) → PRO oldja fel. A szakember fizet (ő keres a leadekből).
  const isPro = business.featured;
  const newLeadCount = await countNewBusinessLeads(business.id);
  const [rawLeads, leadCounts] = await Promise.all([
    getBusinessLeads(business.id),
    getLeadCounts(business.id),
  ]);
  // Havi 5 ingyenes: egy lead INGYENES, ha a naptári hónapjában az első 5 között
  // érkezett (kronologikus sorrend) — így a 6.+ (a legfrissebb) zárolt → erős FOMO,
  // és egyezik az email-kapuval (létrehozáskori darabszám). A zárolt lead kontakt-
  // adatát SZERVEROLDALON kiszedjük (valódi gate, nem csak vizuális).
  const ascRank: Record<string, number> = {};
  const lockedSet = new Set<string>();
  for (const l of [...rawLeads].reverse()) {
    const ym = l.createdAt.slice(0, 7);
    const rank = (ascRank[ym] = (ascRank[ym] ?? 0) + 1);
    if (!isPro && rank > FREE_LEADS_PER_MONTH) lockedSet.add(l.id);
  }
  const leads: LeadCard[] = rawLeads.map((l) =>
    lockedSet.has(l.id)
      ? { ...l, locked: true, senderName: "", senderEmail: "", senderPhone: null, message: "" }
      : { ...l, locked: false },
  );
  const lockedCount = lockedSet.size;

  // Review Response Counter: megkeresések a vélemény-válaszadás óta.

  // Analytics: top keresőszavak ("honnan jönnek") — PRO.
  const topSearchTerms = business.featured ? await getTopSearchTerms(business.id) : [];

  const { stats } = data;
  const total14 = stats.trend.reduce((sum, p) => sum + p.views, 0);
  const trendData = stats.trend.map((p) => p.views);
  // A tengelycímkék: első / középső / utolsó nap. Kevés adatnál (1-2 nap) az
  // indexek egybeesnének → ismétlődő dátumok ("Jún 20 · Jún 20"). Ezért az
  // index-halmazt deduplikáljuk, így csak a ténylegesen eltérő napok jelennek meg.
  const labelIdxs = Array.from(
    new Set(
      stats.trend.length
        ? [0, Math.floor((stats.trend.length - 1) / 2), stats.trend.length - 1]
        : [],
    ),
  );
  const labels = labelIdxs.map((i) => fmtDate(stats.trend[i].date));

  // Dinamikus, valódi aktivitások összeállítása
  const reviews = await getReviewsByBusiness(business.id);
  const activities: { icon: IconName; text: string; time: string }[] = [];

  // 1) Valódi vélemények
  reviews.slice(0, 4).forEach((r) => {
    activities.push({
      icon: "star",
      text: `Új ${r.rating}★ vélemény tőle: ${r.reviewerName?.trim() || handleFromId(r.id)}`,
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
      <div className="min-w-0 py-1">
        <div className="text-xs font-semibold text-ink-muted">Szia,</div>
        <div className="truncate text-[20px] font-extrabold tracking-tight text-ink">
          {business.name} 👋
        </div>
      </div>

      {/* Ajánlatkérés-postaláda — FREEMIUM (havi 5 ingyenes, felette PRO) */}
      <section className="space-y-2">
        <SectionHeader>
          Ajánlatkérések{newLeadCount > 0 ? ` · ${newLeadCount} új` : ""}
        </SectionHeader>

        {/* FOMO-számláló */}
        {leadCounts.month > 0 && (
          <div className="rounded-card border border-line bg-surface px-4 py-3 shadow-card">
            <p className="text-[13.5px] font-extrabold text-ink">
              📥 {leadCounts.week} árajánlat-kérést kaptál ezen a héten
            </p>
            {!isPro ? (
              leadCounts.month >= FREE_LEADS_PER_MONTH ? (
                <p className="mt-0.5 text-[12px] font-bold text-pro">
                  ⭐ Elérted a havi 5 ingyenes ajánlatkérést — {lockedCount} továbbit zároltunk. PRO-val mindet eléred.
                </p>
              ) : (
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  Ebben a hónapban {leadCounts.month}/{FREE_LEADS_PER_MONTH} ingyenes ajánlatkérésed van — még {FREE_LEADS_PER_MONTH - leadCounts.month} fér bele.
                </p>
              )
            ) : (
              <p className="mt-0.5 text-[12px] font-semibold text-pro">PRO aktív — korlátlan ajánlatkérést fogadsz. 🚀</p>
            )}
          </div>
        )}

        <LeadInbox leads={leads} businessId={business.id} />
      </section>

      {/* Szaknévsor PRO — korlátlan lead + kiemelés (csak ha még nem PRO) */}
      {isPro ? (
        <div className="flex items-center gap-2 rounded-card border border-pro/30 bg-pro/5 px-4 py-3 text-[13px] font-bold text-pro">
          <Icon name="star" size={15} filled /> PRO aktív — korlátlan ajánlatkérés + kiemelés a Szaknévsorban.
        </div>
      ) : (
        <div className="rounded-card border border-pro/30 bg-pro/5 px-4 py-3">
          <p className="text-[13px] font-bold text-ink">🚀 Szaknévsor PRO — korlátlan ajánlatkérés + kiemelt láthatóság</p>
          <p className="mt-0.5 mb-2.5 text-[12px] text-ink-muted">
            {lockedCount > 0
              ? `🔒 ${lockedCount} ajánlatkérés zárolva vár rád. PRO-val mindet eléred — plusz sárga kiemelés és top pozíció.`
              : "Az első 5 ajánlatkérés/hó ingyenes. PRO-val korlátlanul fogadod őket, sárga kiemelés, top pozíció a kategóriádban."}
          </p>
          <BoostCheckoutButton
            product="business_pro_monthly"
            customData={{ type: "business_pro", businessId: business.id }}
            label="Kiemelés vásárlása (19 € / hó)"
            className="bg-pro text-white hover:bg-[#e68600]"
          />
        </div>
      )}


      {/* Egy cég, két kapcsoló: ha még nincs Munkáltatói profil, felkínáljuk az
          álláshirdetést is — a cég adatait átvisszük (adat-újrahasznosítás). */}
      {!hasEmployer && (
        <Link
          href="/munkaltato/regisztracio"
          className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 shadow-card active:scale-[0.99] transition"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-accent/10 text-accent">
            <Icon name="users" size={16} strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-extrabold text-ink">Állást is hirdetnél?</span>
            <span className="block text-[12px] leading-snug text-ink-muted">
              Ugyanennek a cégnek feladhatsz álláshirdetést — a „{business.name}" adatait átvisszük.
            </span>
          </div>
          <Icon name="chevR" size={16} className="text-ink-faint shrink-0" />
        </Link>
      )}

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
        initialYearsHere={business.yearsHere}
        initialLanguages={business.languages}
        initialLogoKey={business.logoKey}
        initialGalleryKeys={business.galleryKeys}
        initialAccentColor={business.accentColor ?? null}
        initialRating={business.rating}
        initialReviews={business.reviews}
        isFeatured={business.featured}
      />

      {/* heti összegző hero */}
      <section className="relative overflow-hidden rounded-card bg-primary p-[18px] text-white">
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/[0.06]" />
        <div className="relative">
          <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-pill bg-white/[0.18] px-2.5 py-1 text-[11.5px] font-bold tracking-wide">
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

      {/* CTR — hívási arány (hívás / megtekintés) */}
      {stats.weekViews > 0 && (
        <div className="rounded-card border border-line bg-surface px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[12.5px] font-bold text-ink">Hívási arány (CTR)</p>
            <p className="text-[11.5px] text-ink-muted">A megtekintők hány %-a hívott / nyitotta meg a profilt.</p>
          </div>
          <span className="text-[22px] font-black text-primary">
            {Math.round(((stats.weekCalls + stats.weekClicks) / stats.weekViews) * 100)}%
          </span>
        </div>
      )}

      {/* Honnan jönnek — top keresőszavak (PRO) */}
      {topSearchTerms.length > 0 && (
        <section className="rounded-card border border-line bg-surface p-4 shadow-card">
          <SectionHeader>Honnan jönnek</SectionHeader>
          <p className="mt-0.5 mb-2.5 text-[11.5px] text-ink-muted">A leggyakoribb keresőszavak, amikből rád kattintottak.</p>
          <div className="flex flex-wrap gap-2">
            {topSearchTerms.map((t) => (
              <span key={t.term} className="inline-flex items-center gap-1.5 rounded-pill bg-primary/10 px-2.5 py-1 text-[12px] font-bold text-primary">
                {t.term} <span className="text-primary/60">{t.count}×</span>
              </span>
            ))}
          </div>
        </section>
      )}

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
        <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-ink-faint">
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

      {/* Vélemények — a tulajdonos válaszolhat */}
      {reviews.length > 0 && (
        <section className="space-y-2">
          <SectionHeader>Vélemények — válaszolj!</SectionHeader>
          {reviews.map((r) => {
            const reviewerHandle = r.reviewerName?.trim() || handleFromId(r.id);
            return (
              <div key={r.id} className="rounded-card border border-line bg-surface p-3.5 shadow-card">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                    {reviewerHandle.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-bold text-ink">{reviewerHandle}</div>
                    <div className="text-[11px] text-ink-muted">{getRelativeTime(r.publishedAt)}</div>
                  </div>
                  <div className="flex gap-px text-star">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Icon key={i} name="star" size={12} filled />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </>
  );
}
