import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { HivatalosView } from "@/components/views/hivatalos-view";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = {
  title: "Hivatalos ügyek — konzulátus és linkek egy helyen",
  description:
    "Útlevél, jogosítvány, lakcím, adó, biztosítás: megmutatjuk, melyik HIVATALOS oldalon intézheted, magyarul elmagyarázva. A magyar konzulátus és időpontfoglalás egy kattintásra.",
};

export default function HivatalosPage() {
  return (
    <div className="space-y-4 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">Hivatalos ügyek</span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <section className="rounded-card border border-primary/20 bg-primary-soft p-5 shadow-card">
        <h1 className="text-[20px] font-extrabold tracking-tight text-ink">Egyenesen a hivatalos forráshoz</h1>
        <p className="mt-1 text-[13px] leading-snug text-ink-muted">
          „Lejár az útlevelem", „át kell írni a jogsim" — nem mi mondjuk meg, mit csinálj, hanem egy kattintással a helyes hivatalos oldalra viszünk.
        </p>
      </section>

      <HivatalosView />
    </div>
  );
}
