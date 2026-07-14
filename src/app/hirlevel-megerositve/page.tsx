import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = { title: "Hírlevél megerősítve" };

/**
 * /hirlevel-megerositve — az API redirect-jei ide jönnek.
 *   ?status=confirmed   → kész, a feliratkozás aktív
 *   ?status=unsubscribed → leiratkozva
 *   ?status=expired      → lejárt/érvénytelen link
 */
export default function HirlevelMegerositvePage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status ?? "confirmed";

  let title: string;
  let message: string;
  let success = true;

  if (status === "unsubscribed") {
    title = "Leiratkoztál ✓";
    message = "Sikeresen leiratkoztál a Kinti heti hírlevelünkről. Nem fogsz több emailt kapni. Bármikor visszairatkozhatsz, ha mégis szeretnéd.";
  } else if (status === "expired") {
    title = "Lejárt vagy érvénytelen link";
    message = "Ez a link már nem érvényes — előfordulhat, hogy időközben leiratkoztál, vagy a megerősítő link elavult. Iratkozz fel újra, ha szeretnéd.";
    success = false;
  } else {
    title = "Feliratkoztál a hírlevélre! 🎉";
    message = "Kész — mostantól megkapod az összes releváns és fontos információt a választott országgal kapcsolatban. Bármikor leiratkozhatsz az emailek alján található linkkel.";
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-[20px] border border-line bg-surface shadow-card">
        <KintiLogo size={32} />
      </div>

      <div
        className={`grid h-12 w-12 place-items-center rounded-2xl ${
          success ? "bg-success/15 text-success" : "bg-accent/15 text-accent"
        }`}
      >
        <Icon name={success ? "check" : "close"} size={22} strokeWidth={2.4} />
      </div>

      <h1 className="text-balance text-[22px] font-extrabold tracking-tight text-ink">{title}</h1>
      <p className="text-pretty text-[14px] leading-relaxed text-ink-muted">{message}</p>

      <div className="flex flex-col gap-2 self-stretch">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-primary px-5 text-[13.5px] font-bold text-white shadow-card-hover"
        >
          Vissza a főoldalra <Icon name="arrowRight" size={15} strokeWidth={2.4} />
        </Link>
        {!success && (
          <Link
            href="/hirlevel"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-line bg-surface px-5 text-[13.5px] font-bold text-ink"
          >
            Új feliratkozás
          </Link>
        )}
      </div>
    </div>
  );
}
