import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Vállalkozás igénylés" };

/**
 * /vallalkozas-igenyles — a claim confirm-route ide redirektel.
 *
 *   ?status=success&id=<slug>          → sikeres igénylés, a fiókhoz kötve
 *   ?status=already_claimed&id=<slug>  → időközben más igényelte
 *   ?status=expired                    → lejárt / érvénytelen token
 */
export default function VallalkozasIgenylesPage({
  searchParams,
}: {
  searchParams: { status?: string; id?: string };
}) {
  const status = searchParams.status ?? "success";
  const profileUrl = searchParams.id ? `/szaknevsor/${searchParams.id}` : null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-[20px] border border-line bg-surface shadow-card">
        <KintiLogo size={32} />
      </div>

      {status === "expired" && (
        <>
          <h1 className="text-balance text-[22px] font-extrabold tracking-tight text-ink">
            Lejárt vagy érvénytelen link
          </h1>
          <p className="text-pretty text-[14px] leading-relaxed text-ink-muted">
            Az igénylő link 24 óráig érvényes, és ez letelt — vagy már fel lett használva.
            Indítsd újra az igénylést a Szaknévsorból.
          </p>
          <Link
            href="/szaknevsor"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-primary px-5 text-[13.5px] font-bold text-white shadow-card-hover"
          >
            Szaknévsor megnyitása
            <Icon name="arrowRight" size={15} strokeWidth={2.4} />
          </Link>
        </>
      )}

      {status === "already_claimed" && (
        <>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 text-accent">
            <Icon name="bell" size={22} strokeWidth={2.4} />
          </div>
          <h1 className="text-balance text-[22px] font-extrabold tracking-tight text-ink">
            Időközben már igényelték
          </h1>
          <p className="text-pretty text-[14px] leading-relaxed text-ink-muted">
            Valaki más korábban már megerősítette a vállalkozás igénylését. Ha ez tévedés,
            írj nekünk a <a href="mailto:hello@kinti.app" className="font-bold underline">hello@kinti.app</a> címre.
          </p>
          {profileUrl && (
            <Link
              href={profileUrl}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-line bg-surface px-5 text-[13.5px] font-bold text-ink"
            >
              Vállalkozás megnyitása
            </Link>
          )}
        </>
      )}

      {status === "success" && (
        <>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-success/15 text-success">
            <Icon name="check" size={22} strokeWidth={2.4} />
          </div>
          <h1 className="text-balance text-[22px] font-extrabold tracking-tight text-ink">
            Sikeresen igényelted!
          </h1>
          <p className="text-pretty text-[14px] leading-relaxed text-ink-muted">
            A vállalkozás mostantól a kinti fiókodhoz van kötve — a Vállalkozói profilban
            tudod szerkeszteni: nyitvatartás, leírás, kapcsolat, logó, beszélt nyelvek.
          </p>
          <div className="flex flex-col gap-2 self-stretch">
            <Link
              href="/profil"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-primary px-5 text-[13.5px] font-bold text-white shadow-card-hover"
            >
              Vállalkozói profil megnyitása
              <Icon name="arrowRight" size={15} strokeWidth={2.4} />
            </Link>
            {profileUrl && (
              <Link
                href={profileUrl}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-line bg-surface px-5 text-[13.5px] font-bold text-ink"
              >
                Publikus profil megnyitása
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
