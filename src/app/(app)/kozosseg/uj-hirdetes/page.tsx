import Link from "next/link";
import { Icon, ScreenHeader } from "@/components/ui";
import { BulletinForm } from "@/components/views/bulletin-form";
import { getBulletinKinds } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Új hirdetés" };

/**
 * /kozosseg/uj-hirdetes — account-mentes hirdetés-feladó oldal.
 *
 * A taxonómiát szerverről hozzuk (a kindId-kat kötjük az adatbázishoz),
 * a site-key publikus env-változó (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY).
 *
 * NEM Clerk-védett: a kinti közösség bármely tagja feladhat hirdetést, a
 * spam-szűrés a Turnstile + email-megerősítés rétegen történik.
 */
export default async function UjHirdetesPage() {
  const kinds = (await getBulletinKinds()).filter((k) => k.id !== "all");
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <div className="px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <ScreenHeader
        title="Új hirdetés"
        left={
          <Link
            href="/kozosseg"
            aria-label="Vissza"
            className="grid h-9 w-9 place-items-center rounded-[12px] border border-line bg-surface text-ink"
          >
            <Icon name="arrowLeft" size={16} strokeWidth={2.2} />
          </Link>
        }
      />

      <div className="mb-4 rounded-card border border-line bg-surface-alt px-4 py-3 text-[12.5px] leading-relaxed text-ink-muted">
        <strong className="text-ink">Nem kell regisztráció.</strong> Add meg az emailedet,
        kapsz egy megerősítő linket — egy kattintás, és a hirdetésed fent van a falon.
        30 nap után automatikusan eltűnik.
      </div>

      <BulletinForm kinds={kinds} turnstileSiteKey={turnstileSiteKey} />
    </div>
  );
}
