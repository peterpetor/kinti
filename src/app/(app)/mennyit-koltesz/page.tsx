import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { CostBenchmarkView } from "@/components/views/cost-benchmark-view";

export const runtime = "edge";
export const dynamic = "force-static";

export const metadata = {
  title: "Mennyit költesz? — anonim megélhetési benchmark",
  description:
    "Normális, hogy ennyit költök? Hasonlítsd össze anonim módon: Krankenkasse, élelmiszer, közlekedés. Aggregált közösségi adat — nem tanács, nem AI.",
};

export default function MennyitKolteszPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  return (
    <div className="space-y-4 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">Mennyit költesz?</span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <section className="rounded-card border border-primary/20 bg-primary-soft p-5 shadow-card">
        <h1 className="text-[20px] font-extrabold tracking-tight text-ink">Normális, hogy ennyit költök?</h1>
        <p className="mt-1 text-[13px] leading-snug text-ink-muted">
          Add meg anonim módon, mennyit fizetsz Krankenkasse-ra, kajára, közlekedésre — és lásd, hol állsz a régiód magyarjaihoz képest. Nem tanács, nem AI: csak amit a közösség beadott.
        </p>
      </section>

      <CostBenchmarkView turnstileSiteKey={turnstileSiteKey} />
    </div>
  );
}
