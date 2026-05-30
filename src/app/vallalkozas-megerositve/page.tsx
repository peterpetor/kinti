import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Vállalkozás megerősítve" };

/**
 * /vallalkozas-megerositve — a business confirm-route ide redirektel.
 *
 *   ?status=published&id=<slug>  → kint van a Szaknévsorban
 *   ?status=expired              → lejárt vagy érvénytelen token
 */
export default function VallalkozasMegerositvePage({
  searchParams,
}: {
  searchParams: { status?: string; id?: string; manage?: string };
}) {
  const status = searchParams.status ?? "published";
  const profileUrl = searchParams.id ? `/szaknevsor/${searchParams.id}` : null;
  const manageUrl = searchParams.manage ? `/szaknevsor/kezeles/${searchParams.manage}` : null;

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
            A megerősítő link 24 óráig érvényes, és ez letelt — vagy a link már felhasználásra került.
            <br/><br/>
            <strong>Tipp:</strong> Bizonyos levelezők (pl. Gmail, céges rendszerek) biztonsági okokból automatikusan rákattintanak a linkekre a háttérben. Ha ez történt, a vállalkozásod <strong>már sikeresen megjelent</strong>! Ellenőrizd a Szaknévsorban.
          </p>
          <Link
            href="/szaknevsor/uj"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-primary px-5 text-[13.5px] font-bold text-white shadow-card-hover"
          >
            Vállalkozás újraküldése
            <Icon name="arrowRight" size={15} strokeWidth={2.4} />
          </Link>
        </>
      ) : (
        <>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-success/15 text-success">
            <Icon name="check" size={22} strokeWidth={2.4} />
          </div>
          <h1 className="text-balance text-[22px] font-extrabold tracking-tight text-ink">
            Kint van a vállalkozásod!
          </h1>
          <p className="text-pretty text-[14px] leading-relaxed text-ink-muted">
            A vállalkozásod beérkezett, és az adminisztrátor hamarosan ellenőrzi
            (általában <strong>24 órán belül</strong>). Utána azonnal megjelenik a
            Szaknévsorban. A kezelő-linkkel addig is szerkesztheted az adatokat
            (logó, nyitvatartás, linkek).
          </p>
          <div className="flex flex-col gap-2 self-stretch">
            {manageUrl && (
              <Link
                href={manageUrl}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-primary px-5 text-[13.5px] font-bold text-white shadow-card-hover"
              >
                Adatok beállítása / szerkesztés
                <Icon name="arrowRight" size={15} strokeWidth={2.4} />
              </Link>
            )}
            {profileUrl && (
              <Link
                href={profileUrl}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-line bg-surface px-5 text-[13.5px] font-bold text-ink"
              >
                Publikus profil megnyitása
              </Link>
            )}
            <Link
              href="/szaknevsor"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-line bg-surface px-5 text-[13.5px] font-bold text-ink"
            >
              Szaknévsor
            </Link>
          </div>
          {manageUrl && (
            <p className="mt-3 px-4 text-[11px] leading-relaxed text-ink-faint text-pretty">
              💡 A kezelő-link az emailedben is megérkezett. <strong>Tedd el</strong> —
              ezzel bármikor szerkesztheted vagy törölheted a vállalkozást, regisztráció nélkül.
            </p>
          )}
        </>
      )}
    </div>
  );
}
