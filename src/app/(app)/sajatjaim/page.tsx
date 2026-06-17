import Link from "next/link";
import { MyPostsManager } from "@/components/views/my-posts-manager";
import { GamificationCard } from "@/components/views/gamification-card";
import { Icon, KintiLogo } from "@/components/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Saját posztjaim",
  description: "A böngésződben tárolt manage-link-jeid — szerkesztés, törlés, backup, sync.",
  robots: { index: false, follow: false },
};

/**
 * /sajatjaim — a felhasználó lokálisan tárolt poszt-tokenjeinek kezelője.
 *
 * Nincs szerver-oldali adat. A teljes tartalmat a kliens olvassa be a
 * localStorage-ból. Az oldal force-static — semmilyen Edge-erőforrás nem fogyy.
 */
export default function MyPostsPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          Saját posztjaim
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <div className="rounded-card border border-line bg-surface-alt/60 px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
        <strong className="text-ink">Csak a böngésződben látható.</strong> A kinti szerveren nincs felhasználói azonosítód —
        ezt a listát a böngésző localStorage-ja tárolja. Ha cache-t törölsz vagy másik eszközön nyitod meg,
        eltűnik. Másik eszközhöz: <strong className="text-ink">letöltés / import</strong> vagy{" "}
        <strong className="text-ink">email-küldés</strong>.
      </div>

      <GamificationCard />

      <Link
        href="/ranglista"
        className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card transition active:scale-[0.99]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[#e3a233]/15 text-lg">🏆</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">Közösségi ranglista</span>
          <span className="block text-[11.5px] text-ink-muted">Opcionális, becenévvel — hasonlítsd a pontod másokéval.</span>
        </span>
        <Icon name="chevR" size={16} strokeWidth={2.4} className="shrink-0 text-ink-faint" />
      </Link>

      <MyPostsManager turnstileSiteKey={turnstileSiteKey} />
    </div>
  );
}
