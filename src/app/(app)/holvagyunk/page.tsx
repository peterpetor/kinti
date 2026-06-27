import Link from "next/link";
import type { Metadata } from "next";
import { Icon, KintiLogo } from "@/components/ui";
import { PresenceView } from "@/components/views/presence-view";
import { getPresenceTotal } from "@/lib/repo-presence";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const OG_IMAGE = "https://kinti.app/icons/og-default.png";

/** Dinamikus megosztó-előnézet: az ÉLŐ összlétszám a címben/leírásban (a meglévő
 *  OG-képpel — nincs kép-generálási kockázat). Így a megosztott link rögtön a
 *  „nézd, hányan vagyunk" hookkal jelenik meg. */
export async function generateMetadata(): Promise<Metadata> {
  let total = 0;
  try { total = await getPresenceTotal(); } catch { /* D1-hiba → semleges fallback */ }
  const title = total > 0
    ? `Már ${total.toLocaleString("hu-HU")} magyar tette fel magát a térképre 🇭🇺`
    : "Ki költözött melléd? — Anonim magyar térkép";
  const description = total > 0
    ? `Eddig legalább ${total.toLocaleString("hu-HU")} magyar jelzett be Svájcban, Ausztriában, Németországban és Hollandiában. Nézd meg, hányan vagytok a környékeden — nulla regisztráció, teljesen anonim.`
    : "Nézd meg, hányan vagyunk magyarok a környékeden — Svájcban, Ausztriában, Németországban, Hollandiában. Nulla regisztráció, teljesen anonim.";
  return {
    title,
    description,
    openGraph: { title, description, url: "https://kinti.app/holvagyunk", siteName: "kinti", type: "website", images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Ki költözött melléd?" }] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
  };
}

export default function HolVagyunkPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <div className="space-y-4 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">Ki költözött melléd?</span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <PresenceView turnstileSiteKey={turnstileSiteKey} />
    </div>
  );
}
