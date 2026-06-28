import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { MagyarBoltView } from "@/components/views/magyar-bolt-view";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = {
  title: "Magyar bolt a sarkon — otthoni ízek térképe",
  description:
    "Magyar pékség, hentes, bolt, étterem, cukrászda a környékeden. Közösségi térkép — bárki bejelölheti, ahol otthoni ízeket kapni. Anonim, ingyenes.",
};

export default function MagyarBoltPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  return (
    <div className="space-y-4 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">Magyar bolt a sarkon</span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <p className="text-[12.5px] leading-snug text-ink-muted">
        Hol kapsz <strong>otthoni ízeket</strong> a környékeden? Magyar pékség, hentes, bolt, étterem — a közösség jelöli be. Tudsz egyet? Tedd fel egy koppintással. 🥖🥩
      </p>

      <MagyarBoltView turnstileSiteKey={turnstileSiteKey} />
    </div>
  );
}
