import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { KvizGame } from "@/components/views/kviz-game";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = {
  title: "Napi Kvíz — 3 kérdés naponta",
  description:
    "Mindennap 3 új kérdés a kinti életről — földrajz, történelem, kultúra, nyelv, étel, közlekedés. Streak-számláló, 30 másodperc. (Svájc & Ausztria)",
};

export default function KvizPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          Napi Kvíz
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <KvizGame />
    </div>
  );
}
