import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Icon } from "@/components/ui";
import { getB2bAccess, getB2bProjects, getCategories, toB2bProjectView } from "@/lib/repo";
import { countryAdjective } from "@/lib/countries";
import { B2bPaywall } from "@/components/views/b2b-paywall";
import { B2bComposer } from "@/components/views/b2b-composer";
import { B2bFeed } from "@/components/views/b2b-feed";

// Zárt, PRO-only prémium útvonal → mindig dinamikus, sose gyorsítótárazott.
export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "B2B Hub — Zárt projektpiac",
  description: "Zárt körű alvállalkozó- és projektpiac magyar PRO cégeknek.",
};

export default async function B2bPage() {
  const { userId } = await auth();
  if (!userId) redirect("/belepes?redirect_url=/b2b");

  // ── SZERVER-GATE: a hozzáférést a CÉG-szintű PRO (featured=1) adja. ──────────
  // Nem-PRO (vagy cég nélküli) user a paywallt látja — a valódi feedet NEM.
  const { business, isPro, isApproved } = await getB2bAccess(userId);
  if (!business || !isPro) {
    return <B2bPaywall businessId={business?.id ?? null} />;
  }

  // PRO, de a cégprofil még admin-jóváhagyásra vár → nem a paywall (már fizetett!),
  // hanem türelmi képernyő. Az API-oldali gate ugyanezt kényszeríti ki.
  if (!isApproved) {
    return (
      <div className="space-y-4 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <header className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary text-white">
            <Icon name="briefcase" size={16} strokeWidth={2.4} />
          </span>
          <h1 className="text-[20px] font-extrabold tracking-tight text-ink">B2B Hub</h1>
          <Link
            href="/profil"
            aria-label="Vissza"
            className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink"
          >
            <Icon name="arrowLeft" size={16} strokeWidth={2.2} />
          </Link>
        </header>
        <div className="rounded-card border border-star/30 bg-star/10 p-4 text-[13px] leading-snug text-ink">
          <strong>A cégprofilod jóváhagyásra vár.</strong> A PRO csomagod aktív, de a zárt
          projektpiacra a moderáció után léphetsz be — jellemzően 24 órán belül megtörténik.
          Addig a <Link href="/profil" className="font-bold underline">műszerfaladon</Link> mindent
          előkészíthetsz.
        </div>
      </div>
    );
  }

  const [rawProjects, categories] = await Promise.all([
    getB2bProjects({ limit: 100 }),
    getCategories(),
  ]);
  // Kliens-alak: authorId nélkül (Clerk user-id ne kerüljön más tagok böngészőjébe),
  // az isMine-t itt, a szerveren számoljuk.
  const projects = rawProjects.map((p) => toB2bProjectView(p, userId));
  const cats = categories.filter((c) => c.id !== "all");

  return (
    <div className="space-y-5 px-5 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary text-white">
              <Icon name="briefcase" size={16} strokeWidth={2.4} />
            </span>
            <h1 className="text-[21px] font-extrabold leading-tight tracking-tight text-ink">
              B2B Hub
            </h1>
            <span className="rounded-pill bg-star/15 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-star">
              PRO
            </span>
          </div>
          <p className="mt-1.5 text-[13px] leading-snug text-ink-muted">
            Zárt projektpiac ellenőrzött magyar cégeknek. Írj ki alvállalkozói munkát, vagy
            jelentkezz másokéra — jutalék nélkül.
          </p>
        </div>
        <Link
          href="/profil"
          aria-label="Vissza a műszerfalra"
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.2} />
        </Link>
      </header>

      {/* Kiíró cég kártyája (a saját, ellenőrzött PRO cég) */}
      <div className="flex items-center gap-2.5 rounded-card border border-primary/20 bg-primary-soft/40 p-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-primary text-[15px] font-extrabold text-white">
          {business.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-bold text-ink">{business.name}</p>
          <p className="text-[11.5px] text-ink-muted">
            {countryAdjective(business.country)} PRO cég • ellenőrzött kiíró
          </p>
        </div>
        <Icon name="check" size={16} strokeWidth={2.8} className="shrink-0 text-primary" />
      </div>

      {/* Új projekt kiírása */}
      <B2bComposer categories={cats} defaultCountry={business.country} defaultPhone={business.phone} />

      {/* Feed — nyitott projektek, kliens-oldali ország/szakma szűrővel */}
      <B2bFeed projects={projects} categories={cats} />
    </div>
  );
}
