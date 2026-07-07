import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, KintiLogo } from "@/components/ui";
import { LogoUploader } from "@/components/views/logo-uploader";
import { GalleryUploader } from "@/components/views/gallery-uploader";
import { BusinessManageForm } from "@/components/views/business-manage-form";
import { BusinessAnalyticsDashboard } from "@/components/views/business-analytics-card";
import { ReviewReplyForm } from "@/components/views/review-reply-form";
import { handleFromId } from "@/lib/handle";
import {
  getBusinessAnalytics,
  getBusinessByManageToken,
  getBusinessSubmissionByManageToken,
  getReviewsByBusiness,
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
  // Vélemények — a tulajdonos nyilvánosan válaszolhat rájuk (ingyenes bizalmi jel).
  const reviews = await getReviewsByBusiness(business.id);

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

      {/* PRO: statisztikák + arculat. Nem-PRO esetén az egyetlen upsell a
          BusinessManageForm-ban van (valódi checkout), hogy ne legyen két kártya. */}
      {business.featured && (
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
      )}

      <BusinessManageForm business={business} token={params.token} />

      {/* Vélemények — nyilvános válaszadás (ingyenes; a válasz a publikus profilon
          is megjelenik). */}
      {reviews.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-muted">
            Vélemények — válaszolj nyilvánosan
          </h2>
          {reviews.map((r) => {
            const who = r.reviewerName?.trim() || handleFromId(r.id);
            return (
              <article key={r.id} className="rounded-card border border-line bg-surface p-3.5 shadow-card">
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                    {who.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-bold text-ink">{who}</div>
                  </div>
                  <div className="flex gap-px text-star">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Icon key={i} name="star" size={12} filled />
                    ))}
                  </div>
                </div>
                {r.body?.trim() && (
                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink">{r.body.trim()}</p>
                )}
                <ReviewReplyForm
                  reviewId={r.id}
                  endpoint={`/api/business/manage/${params.token}/review-response`}
                  initialResponse={r.ownerResponse}
                />
              </article>
            );
          })}
        </section>
      )}

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
