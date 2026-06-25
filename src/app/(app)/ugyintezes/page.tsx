import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { ChecklistList } from "./ChecklistList";
import { CountryGuard } from "@/components/country-guard";

export const runtime = "edge";
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

      <ChecklistList />
    </div>
  );
}
