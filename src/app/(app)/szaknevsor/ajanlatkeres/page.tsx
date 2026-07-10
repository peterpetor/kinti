import { getCategories } from "@/lib/repo";
import { Icon } from "@/components/ui";
import { LeadRequestForm } from "@/components/views/lead-request-form";
import Link from "next/link";
import type { Metadata } from "next";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Csoportos árajánlat-kérés — Kinti Szaknévsor",
  description:
    "Egyetlen űrlappal kérj árajánlatot Svájc összes magyar vállalkozójától. Könyvelő, fodrász, költöztető — add meg, mit keresel, és a vállalkozók megkeresnek téged!",
};

export default async function AjanlatkeresPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const categories = await getCategories();
  // Előválasztott kategória a Szaknévsor üres-találat CTA-jából (?cat=…) —
  // a form maga is validálja a létező kategóriák ellen.
  const initialCategoryId = typeof searchParams?.cat === "string" ? searchParams.cat : undefined;

  return (
    <div className="mx-auto max-w-md space-y-6 px-5 pb-24 pt-[calc(env(safe-area-inset-top)+2rem)]">
      {/* Fejléc */}
      <header className="flex items-center gap-3">
        <Link
          href="/szaknevsor"
          className="ml-auto order-last grid h-[38px] w-[38px] place-items-center rounded-[12px] border border-line bg-surface text-ink shadow-card transition-all active:scale-95"
        >
          <Icon name="arrowLeft" size={18} strokeWidth={2.4} />
        </Link>
        <span className="text-[13px] font-bold text-ink-muted uppercase tracking-wide">
          Szaknévsor
        </span>
      </header>

      {/* Hero */}
      <section className="animate-fade-up space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[12px] font-extrabold uppercase tracking-wide text-primary">
          <Icon name="send" size={13} strokeWidth={2.5} />
          Csoportos Árajánlat
        </div>
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink text-balance">
          Kérj árajánlatot egyszerre több vállalkozótól
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-muted text-balance">
          Töltsd ki az alábbi űrlapot egyszer, és az összes releváns magyar vállalkozó megkapja a kérésedet a környékeden. Ők keresnek meg téged — nem kell mindenkinek külön írni!
        </p>
      </section>

      {/* Hogyan működik mini-kártya */}
      <section className="animate-fade-up animate-delay-50">
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: "document" as const, label: "1. Kitöltöd az űrlapot" },
            { icon: "send" as const, label: "2. Elküldjük a vállalkozóknak" },
            { icon: "check" as const, label: "3. Ők keresnek meg téged" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-card border border-line bg-surface-alt p-3 text-center"
            >
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon name={icon} size={18} strokeWidth={2} />
              </div>
              <p className="text-[11px] font-bold leading-tight text-ink-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Űrlap */}
      <section className="animate-fade-up animate-delay-100">
        <div className="rounded-card border border-line bg-surface p-5 shadow-card">
          <h2 className="mb-4 text-[15px] font-extrabold text-ink">Az árajánlat-kérés részletei</h2>
          <LeadRequestForm categories={categories} initialCategoryId={initialCategoryId} />
        </div>
      </section>

      {/* Adatvédelem info */}
      <section className="animate-fade-up animate-delay-200">
        <div className="flex items-start gap-3 rounded-card border border-line/50 bg-surface-alt/50 p-4">
          <Icon name="eye" size={16} className="mt-0.5 shrink-0 text-ink-muted" strokeWidth={2} />
          <p className="text-[12px] leading-relaxed text-ink-muted">
            A kinti.app csak közvetíti az árajánlat-kérést a vállalkozóknak. Az adataid (név,
            e-mail, leírás) kizárólag a kiválasztott kategória vállalkozói látják, harmadik félnek
            nem adjuk ki.{" "}
            <Link href="/adatvedelem" className="font-bold text-primary hover:underline">
              Adatvédelmi szabályzat →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
