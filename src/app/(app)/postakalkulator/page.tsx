import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { PostageCalculator } from "@/components/views/postage-calculator";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Svájci Postaköltség Kalkulátor – Swiss Post díjak 2025",
  description:
    "Számold ki a Swiss Post postaköltségét! Levél, csomag, belföldi és nemzetközi küldés — A-Post, B-Post, PostPac Priority/Economy díjszabás 2025.",
};

export default function PostageCalculatorPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <div className="min-w-0 flex-1">
          <span className="block text-[16px] font-extrabold tracking-tight text-ink truncate">
            Postaköltség Kalkulátor
          </span>
          <span className="block text-[11px] text-ink-muted">Swiss Post 2025 · Azonnal</span>
        </div>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95 transition-transform"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <PostageCalculator />
    </div>
  );
}
