import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { ChecklistList } from "./ChecklistList";
import { CountryGuard } from "@/components/country-guard";

export const dynamic = "force-static";

export const metadata = {
  title: "Ügyintézés Varázsló — Hivatalos papírmunka",
  description:
    "Interaktív csekklisták a tipikus adminisztratív ügyekhez Svájcban, Ausztriában és Németországban: lakcímbejelentés, jogosítvány, engedélyek, egészségbiztosítás, adóbevallás.",
};

export default function UgyintezesPage() {
  return (
    <div className="space-y-5 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <CountryGuard feature="ugyintezes" />
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">
          Ügyintézés Varázsló
        </span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <section className="rounded-card border border-primary/20 bg-primary-soft p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-primary text-white text-2xl">
            📋
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold tracking-tight text-ink">
              Hivatalos papírmunka — egyszerűen
            </h1>
            <p className="mt-1 text-[13px] leading-snug text-ink-muted">
              Pipálható lépésekkel, hivatalos linkekkel. A pipák a böngésződben tárolódnak.
            </p>
          </div>
        </div>
      </section>

      <Link
        href="/tudasbazis/hivatalos"
        className="flex items-center gap-3 rounded-card border border-line bg-surface p-4 shadow-card transition active:scale-[0.99]"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-xl">🇭🇺</span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-extrabold tracking-[-0.01em] text-ink">Hivatalos ügyek és konzulátus</p>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
            Útlevél, jogsi, lakcím, adó: egy kattintással a helyes hivatalos oldalra — magyar konzulátus, időpontfoglalás.
          </p>
        </div>
        <Icon name="arrowRight" size={16} strokeWidth={2.4} className="shrink-0 text-ink-muted" />
      </Link>

      <ChecklistList />
    </div>
  );
}
