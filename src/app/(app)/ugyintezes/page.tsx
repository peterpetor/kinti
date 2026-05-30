import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { CHECKLISTS } from "@/lib/admin-checklists";
import { LegalDisclaimer } from "@/components/legal-disclaimer";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = {
  title: "Ügyintézés Varázsló — Svájci papírmunka",
  description:
    "Interaktív csekklisták a tipikus svájci adminisztratív ügyekhez: bejelentkezés, jogosítvány-csere, C-engedély, Krankenkasse, adóbevallás.",
};

export default function UgyintezesPage() {
  return (
    <div className="space-y-5 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
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
              Svájci papírmunka — egyszerűen
            </h1>
            <p className="mt-1 text-[13px] leading-snug text-ink-muted">
              Pipálható lépésekkel, hivatalos linkekkel. A pipák a böngésződben tárolódnak.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
          Milyen helyzetben vagy?
        </h2>
        <div className="grid gap-2">
          {CHECKLISTS.map((c) => (
            <Link
              key={c.slug}
              href={`/ugyintezes/${c.slug}`}
              className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card transition active:scale-[0.99]"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-2xl">
                {c.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14.5px] font-extrabold tracking-[-0.01em] text-ink">
                  {c.title}
                </h3>
                <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
                  {c.summary}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                  {c.deadline && (
                    <span className="inline-flex items-center gap-1 rounded-pill bg-accent/10 px-2 py-0.5 font-bold text-accent">
                      ⏰ {c.deadline}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-pill bg-surface-alt px-2 py-0.5 font-bold text-ink-muted">
                    {c.steps.length} lépés
                  </span>
                </div>
              </div>
              <Icon name="chevR" size={14} className="mt-2 shrink-0 text-ink-muted" />
            </Link>
          ))}
        </div>
      </section>

      <LegalDisclaimer
        toolName="ügyintézés varázsló"
        variant="legal"
        notAdviceFor="jogi vagy hatósági"
        extraWarning="A svájci ügyintézés kantononként és községenként ELTÉR — a csekklisták általános minták, nem a te konkrét helyzeted. Mindig a lakhelyed kantoni Migrationsamt-jánál vagy a helyi Gemeinde-nél tájékozódj."
        officialSources={[
          { label: "ch.ch — Hivatalos info-portál", url: "https://www.ch.ch/" },
          { label: "SEM — Migráció", url: "https://www.sem.admin.ch/" },
        ]}
      />
    </div>
  );
}
