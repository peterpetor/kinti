import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { PresenceView } from "@/components/views/presence-view";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ki költözött melléd? — Anonim magyar térkép",
  description:
    "Nézd meg, hányan vagyunk magyarok a környékeden — Svájcban, Ausztriában, Németországban, Hollandiában. Nulla regisztráció, teljesen anonim: egy kérdés, egy pont a térképen.",
};

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
