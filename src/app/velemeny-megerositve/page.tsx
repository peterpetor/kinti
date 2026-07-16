import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Vélemény megerősítve" };

/**
 * /velemeny-megerositve — a /api/reviews/confirm/<token> redirektel ide.
 *
 *   ?status=published&business=<id>&manage=<token>
 *   ?status=duplicate                            → már volt vélemény innen
 *   ?status=expired                              → 24h-s ablak letelt
 */
export default function VelemenyMegerositvePage({
  searchParams,
}: {
  searchParams: { status?: string; business?: string; manage?: string };
}) {
  const status = searchParams.status ?? "published";
  const businessUrl = searchParams.business
    ? `/szaknevsor/${searchParams.business}`
    : "/szaknevsor";
  const manageUrl = searchParams.manage
    ? `/velemeny-kezeles/${searchParams.manage}`
    : null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-[20px] border border-line bg-surface shadow-card">
        <KintiLogo size={32} />
      </div>

      {status === "expired" ? (
        <>
          <h1 className="text-balance text-[22px] font-extrabold tracking-tight text-ink">
            Lejárt megerősítő link
          </h1>
          <p className="text-pretty text-[14px] leading-relaxed text-ink-muted">
            A vélemény-megerősítő link 24 óráig érvényes, és ez letelt — vagy
            a link már felhasználásra került.
            <br/><br/>
            <strong>Tipp:</strong> Bizonyos levelezők (pl. Gmail) automatikusan rákattintanak a linkekre biztonsági ellenőrzés céljából. Ha ez történt, a véleményed <strong>már megerősítésre került</strong>, és jóváhagyás után megjelenik a vállalkozás adatlapján.
          </p>
          <Link
            href="/szaknevsor"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-primary px-5 text-[13.5px] font-bold text-white shadow-card-hover"
          >
            Vissza a szaknévsorhoz
            <Icon name="arrowRight" size={15} strokeWidth={2.4} />
          </Link>
        </>
      ) : status === "duplicate" ? (
        <>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 text-accent">
            <Icon name="close" size={22} strokeWidth={2.4} />
          </div>
          <h1 className="text-balance text-[22px] font-extrabold tracking-tight text-ink">
            Már van véleményed innen
          </h1>
          <p className="text-pretty text-[14px] leading-relaxed text-ink-muted">
            Erről az email-címről már van publikált véleményed ehhez a
            vállalkozáshoz. Ha módosítanád, töröld az előzőt a régi
            megerősítő emailedben található kezelő linkkel — utána új
            véleményt írhatsz.
          </p>
          <Link
            href={businessUrl}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-primary px-5 text-[13.5px] font-bold text-white shadow-card-hover"
          >
            Vissza a vállalkozáshoz
          </Link>
        </>
      ) : (
        <>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-success/15 text-success">
            <Icon name="check" size={22} strokeWidth={2.4} />
          </div>
          <h1 className="text-balance text-[22px] font-extrabold tracking-tight text-ink">
            Megerősítve — köszönjük!
          </h1>
          <p className="text-pretty text-[14px] leading-relaxed text-ink-muted">
            Az értékelésed egy rövid jóváhagyás után jelenik meg (jellemzően 24 órán
            belül) — segítesz a Kinti közösségnek, hogy jobban válasszanak.
            A megerősítő emailedben őrizd meg a kezelő linket: onnan tudod
            később törölni.
          </p>
          <div className="flex flex-col gap-2 self-stretch">
            <Link
              href={businessUrl}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-primary px-5 text-[13.5px] font-bold text-white shadow-card-hover"
            >
              Vissza a vállalkozáshoz
              <Icon name="arrowRight" size={15} strokeWidth={2.4} />
            </Link>
            {manageUrl && (
              <Link
                href={manageUrl}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-line bg-surface px-5 text-[13.5px] font-bold text-ink"
              >
                Vélemény kezelése
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
