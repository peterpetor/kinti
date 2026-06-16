import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, KintiLogo } from "@/components/ui";
import { LogoUploader } from "@/components/views/logo-uploader";
import { GalleryUploader } from "@/components/views/gallery-uploader";
import { BusinessManageForm } from "@/components/views/business-manage-form";
import { BusinessAnalyticsDashboard } from "@/components/views/business-analytics-card";
import {
  getBusinessAnalytics,
  getBusinessByManageToken,
  getBusinessSubmissionByManageToken,
} from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Vállalkozás kezelése", robots: { index: false, follow: false } };

/**
 * /szaknevsor/kezeles/<token> — a feladó saját vállalkozásának kezelő oldala.
 *
 * Auth nincs — a token (122 bit entrópia) maga a bizonyíték, hogy a feladó vagyunk.
 * Az URL-t a megerősítő e-mailben kapja, csak az ő postafiókjában van.
 *
 * Két lehetséges állapot a tokennel:
 *   1) Megerősített → létezik `businesses` rekord → szerkesztő
 *   2) Még confirm előtt → létezik `business_submissions` rekord → "először confirmolj"
 *   3) Nincs sehol → 404
 */
export default async function BusinessManagePage({ params }: { params: { token: string } }) {
  const business = await getBusinessByManageToken(params.token);

  if (!business) {
    // Lehet hogy még confirm-click előtt vagyunk — nézzük a piszkozat-táblát.
    const pending = await getBusinessSubmissionByManageToken(params.token);
    if (pending) {
      return <PendingConfirmView submission={pending} />;
    }
    notFound();
  }

  // A statisztika Szaknévsor PRO (featured) funkció — csak nekik kérjük le/mutatjuk.
  const analytics = business.featured ? await getBusinessAnalytics(business.id) : null;

  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          Vállalkozás kezelése
        </span>
      </header>

      <div className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
        <strong className="text-ink">{business.name}</strong> — ez a kezelő oldal csak ezzel a
        linkkel érhető el. Tedd el a böngésződ könyvjelzői közé, vagy az emailedben tartsd meg
        (a Resend e-mailben kaptad).
      </div>

      {business.featured ? (
        <>
          {analytics && <BusinessAnalyticsDashboard stats={analytics} />}

          <LogoUploader
            currentKey={business.logoKey}
            fallbackGradient={business.photo}
            manageToken={params.token}
          />

          <GalleryUploader
            currentKeys={business.galleryKeys || []}
            manageToken={params.token}
          />
        </>
      ) : (
        <div className="rounded-card border-2 border-[#ff9600]/20 bg-[#ff9600]/5 p-5 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff9600]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="mb-2 text-3xl">📊</div>
          <h3 className="mb-1 text-[17px] font-black text-[#ff9600] tracking-tight">Szaknévsor PRO</h3>
          <p className="mb-3 text-[13px] font-medium text-ink-muted leading-snug">
            Lásd, <strong className="text-ink">hányan nézték meg és hívták</strong> a vállalkozásod —
            részletes statisztikák, egyedi borítókép, bővített referenciagaléria és top pozíció a
            találati listákban, mindössze 19 CHF/hó áron. A vásárlást jelenleg ügyfélszolgálatunkon
            keresztül intézheted.
          </p>
          <div className="mb-4 flex flex-wrap justify-center gap-1.5">
            {["Megtekintés", "Hívás", "14 napos trend"].map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1 rounded-pill bg-[#ff9600]/10 px-2.5 py-1 text-[11px] font-bold text-[#ff9600]"
              >
                🔒 {m}
              </span>
            ))}
          </div>
          <a
            href="mailto:info@kinti.app?subject=Szaknévsor PRO előfizetés"
            className="flex w-full items-center justify-center gap-2 rounded-pill bg-[#ff9600] px-4 py-3 text-[15px] font-black text-white shadow-[0_4px_0_0_#cc7700] transition active:translate-y-1 active:shadow-none hover:bg-[#e68600]"
          >
            Váltás PRO-ra (Email)
          </a>
        </div>
      )}

      <BusinessManageForm business={business} token={params.token} />

      <Link
        href="/szaknevsor"
        className="block self-start text-[12.5px] font-semibold text-ink-muted underline"
      >
        ← Vissza a Szaknévsorhoz
      </Link>
    </div>
  );
}

// --- "Még meg kell erősíteni" nézet -----------------------------------------

function PendingConfirmView({
  submission,
}: {
  submission: { name: string; email: string; confirmToken: string; expiresAt: string };
}) {
  const confirmUrl = `/api/business/confirm/${submission.confirmToken}`;
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          Először erősítsd meg az e-mailedet
        </span>
      </header>

      <section className="rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon name="send" size={22} strokeWidth={2.2} />
        </div>
        <h2 className="mt-3 text-center text-[17px] font-extrabold tracking-tight text-ink">
          Még nincs publikálva
        </h2>
        <p className="mt-2 text-center text-pretty text-[13.5px] leading-relaxed text-ink-muted">
          A <strong className="text-ink">{submission.name}</strong> vállalkozás beküldve, de
          a megerősítő e-mailre még nem kattintottál. Ellenőrizd a postafiókodat
          (<strong className="text-ink">{submission.email}</strong>) és kattints a
          „Vállalkozásom megerősítése" gombra.
        </p>
        <p className="mt-3 text-center text-[11.5px] text-ink-faint">
          Nem találod? Itt is megerősítheted:
        </p>
        <a
          href={confirmUrl}
          className="mt-3 flex h-12 w-full items-center justify-center gap-1.5 rounded-pill bg-primary text-[14px] font-extrabold text-white shadow-card-hover active:scale-[0.99]"
        >
          Vállalkozásom megerősítése
          <Icon name="arrowRight" size={15} strokeWidth={2.4} />
        </a>
        <p className="mt-3 text-center text-[11.5px] text-ink-faint">
          Megerősítés után a kezelő-link automatikusan ezen az URL-en lesz elérhető — tedd el a könyvjelzők közé.
        </p>
      </section>

      <Link
        href="/szaknevsor"
        className="block self-start text-[12.5px] font-semibold text-ink-muted underline"
      >
        ← Vissza a Szaknévsorhoz
      </Link>
    </div>
  );
}
