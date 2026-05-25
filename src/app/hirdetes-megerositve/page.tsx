import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Hirdetés megerősítve" };

/**
 * /hirdetes-megerositve  — a confirm-route ide redirektel.
 *
 * Status query-paraméterek:
 *   ?status=published&manage=<token>  → minden rendben, ki van rakva
 *   ?status=pending&manage=<token>    → admin-moderációra vár (REQUIRE_ADMIN_APPROVAL=true)
 *   ?status=expired                   → lejárt vagy érvénytelen token
 *
 * Az oldalon az APP-layout kívül van (gyökér app/ alatt), hogy a TabBar és
 * a saláta header ne látszódjon — ez egy önálló "köztes" oldal a kapcsolódáson.
 */
export default function HirdetesMegerositvePage({
  searchParams,
}: {
  searchParams: { status?: string; manage?: string };
}) {
  const status = searchParams.status ?? "published";
  const manageUrl = searchParams.manage ? `/hirdetes-kezeles/${searchParams.manage}` : null;

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
            A megerősítő link 24 óráig érvényes, és ez letelt — vagy a link nem érvényes.
            Add fel a hirdetést újra, és kattints az új linkre időben.
          </p>
          <Link
            href="/kozosseg/uj-hirdetes"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-primary px-5 text-[13.5px] font-bold text-white shadow-card-hover"
          >
            Új hirdetés feladása
            <Icon name="arrowRight" size={15} strokeWidth={2.4} />
          </Link>
        </>
      ) : status === "pending" ? (
        <>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Icon name="clock" size={22} strokeWidth={2.2} />
          </div>
          <h1 className="text-balance text-[22px] font-extrabold tracking-tight text-ink">
            Megerősítve — admin-jóváhagyásra vár
          </h1>
          <p className="text-pretty text-[14px] leading-relaxed text-ink-muted">
            Köszi! Mivel ez az első hirdetésed, gyorsan átnézzük (általában 24 órán belül).
            Utána automatikusan publikus lesz a hirdetőfalon. Értesítést küldünk az emailedre.
          </p>
          <PrimaryLinks manageUrl={manageUrl} />
        </>
      ) : (
        <>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-success/15 text-success">
            <Icon name="check" size={22} strokeWidth={2.4} />
          </div>
          <h1 className="text-balance text-[22px] font-extrabold tracking-tight text-ink">
            Kint van a hirdetésed!
          </h1>
          <p className="text-pretty text-[14px] leading-relaxed text-ink-muted">
            Megjelent a kinti közösségi hirdetőfalon. 30 napig lesz látható.
            A megerősítő emailedben őrizd meg a kezelő linket — onnan tudod később törölni.
          </p>
          <PrimaryLinks manageUrl={manageUrl} />
        </>
      )}
    </div>
  );
}

function PrimaryLinks({ manageUrl }: { manageUrl: string | null }) {
  return (
    <div className="flex flex-col gap-2 self-stretch">
      <Link
        href="/kozosseg"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-primary px-5 text-[13.5px] font-bold text-white shadow-card-hover"
      >
        Közösség megnyitása
        <Icon name="arrowRight" size={15} strokeWidth={2.4} />
      </Link>
      {manageUrl && (
        <Link
          href={manageUrl}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-line bg-surface px-5 text-[13.5px] font-bold text-ink"
        >
          Hirdetés kezelése
        </Link>
      )}
    </div>
  );
}
