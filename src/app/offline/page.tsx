import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";

// FONTOS: statikusan prerendereljük, hogy a Service Worker az `install` lépésben
// (még online) gyorsítótárba tudja tenni. Dynamic data tilos itt.
export const dynamic = "force-static";

export const metadata = { title: "Offline" };

/**
 * Offline fallback — ide téríti a SW a navigációs kéréseket, ha a hálózat
 * elérhetetlen ÉS a cél-oldal sincs még a PAGES cache-ben.
 *
 * Tartalmilag visszafogott: márkajel, magyarázó szöveg, retry gomb és linkek
 * azokra a route-okra, amelyeket nagy eséllyel cache-elt már a böngésző.
 */
export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-[20px] border border-line bg-surface shadow-card">
        <KintiLogo size={32} />
      </div>

      <div className="space-y-2">
        <h1 className="text-balance text-[22px] font-extrabold tracking-tight text-ink">
          Most épp nincs net.
        </h1>
        <p className="text-pretty text-[14px] leading-relaxed text-ink-muted">
          Úgy tűnik, megszakadt a kapcsolat. A korábban megnyitott oldalak és a kép-cache
          továbbra is elérhető — vagy próbálkozz újra, ha visszajött a hálózat.
        </p>
      </div>

      <div className="flex flex-col gap-2 self-stretch">
        {/* A `<a>` (nem Link) szándékos: így a böngésző újra-fetcheli az URL-t, és a SW
            újra végigfuttatja a network-first stratégiát. */}
        <a
          href="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-primary px-5 text-[13.5px] font-bold text-white shadow-card-hover"
        >
          <Icon name="arrowRight" size={15} strokeWidth={2.4} />
          Újrapróbálás
        </a>
        <Link
          href="/szaknevsor"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-line bg-surface px-5 text-[13.5px] font-bold text-ink"
        >
          <Icon name="list" size={15} strokeWidth={2.2} className="text-primary" />
          Szaknévsor (gyorsítótár)
        </Link>
      </div>

      <p className="text-[11px] text-ink-faint">
        Tipp: ha telepítve van a Kinti a kezdőképernyődre, offline is elindul.
      </p>
    </div>
  );
}
