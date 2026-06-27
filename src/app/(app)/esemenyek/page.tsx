import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { EventsMapView } from "@/components/views/events-map-view";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Magyar események a térképen",
  description:
    "Magyar vonatkozású események, koncertek, találkozók, boltok és éttermek a térképen — Svájcban, Ausztriában, Németországban. Küldj be te is egyet (jóváhagyással).",
};

export default function EsemenyekPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  return (
    <div className="space-y-4 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">Magyar események a térképen</span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <p className="text-[12.5px] leading-snug text-ink-muted">
        Koncertek, találkozók, magyar boltok és éttermek a környékeden. Ismersz egyet? Küldd be — jóváhagyás után felkerül.
      </p>

      <EventsMapView turnstileSiteKey={turnstileSiteKey} />
    </div>
  );
}
