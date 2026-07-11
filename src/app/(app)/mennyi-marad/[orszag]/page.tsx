import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Icon, KintiLogo } from "@/components/ui";
import { BudgetPlannerView } from "@/components/views/budget-planner-view";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { BUDGET_LANDINGS, budgetLandingBySlug } from "@/lib/budget-landing";
import { safeJsonLdStringify } from "@/lib/json-ld";

// SSG ország-céloldalak (0 edge-route): a „X bruttóból meg lehet élni kint?"
// keresési szándékra célzott, országonként EGYEDI tartalommal + FAQ rich-snippet
// adattal. A [param] route-oknak általában edge-runtime kell — az SSG
// (force-static + generateStaticParams + dynamicParams=false) a kivétel.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return BUDGET_LANDINGS.map((l) => ({ orszag: l.slug }));
}

export function generateMetadata({ params }: { params: { orszag: string } }): Metadata {
  const l = budgetLandingBySlug(params.orszag);
  if (!l) return { title: "Mennyi marad?" };
  return {
    title: `${l.title} — Mennyi marad?`,
    description: l.description,
    alternates: { canonical: `https://kinti.app/mennyi-marad/${l.slug}` },
    openGraph: {
      title: l.title,
      description: l.description,
      images: [{ url: "/icons/og-mennyi-marad.png", width: 1200, height: 630, alt: `${l.title} — kinti.app` }],
    },
    twitter: { card: "summary_large_image", images: ["/icons/og-mennyi-marad.png"] },
  };
}

export default function BudgetCountryPage({ params }: { params: { orszag: string } }) {
  const l = budgetLandingBySlug(params.orszag);
  if (!l) notFound();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: l.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(faqJsonLd) }}
      />

      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="truncate text-[16px] font-extrabold tracking-tight text-ink">
          Mennyi marad?
        </span>
        <Link
          href="/mennyi-marad"
          aria-label="Vissza a kalkulátorhoz"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink transition-transform active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <section className="animate-fade-up space-y-2">
        <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-ink text-balance">
          {l.flag} {l.title}
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-muted">{l.intro}</p>
      </section>

      <div className="animate-fade-up animate-delay-100">
        <BudgetPlannerView initialCountry={l.cc} />
      </div>

      {/* FAQ — a JSON-LD-vel AZONOS tartalom láthatóan is (Google-követelmény). */}
      <section className="animate-fade-up space-y-2">
        <h2 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Gyakori kérdések — {l.name}
        </h2>
        <div className="space-y-2">
          {l.faq.map((f) => (
            <details key={f.q} className="group rounded-card border border-line bg-surface p-4 shadow-card">
              <summary className="cursor-pointer list-none text-[14px] font-bold text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
              </summary>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Ország-oldalak keresztlinkjei (belső linkháló). */}
      <section className="space-y-2">
        <h2 className="px-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-muted">
          Másik országba mennél?
        </h2>
        <div className="flex flex-wrap gap-2">
          {BUDGET_LANDINGS.filter((o) => o.slug !== l.slug).map((o) => (
            <Link
              key={o.slug}
              href={`/mennyi-marad/${o.slug}`}
              className="rounded-pill border border-line bg-surface px-3.5 py-2 text-[13px] font-bold text-ink transition active:scale-95"
            >
              {o.flag} {o.name}
            </Link>
          ))}
        </div>
      </section>

      <LegalDisclaimer
        toolName="Kiköltözési költségvetés-tervező"
        variant="info"
        notAdviceFor="adóügyi, pénzügyi vagy munkajogi"
        extraWarning="A nettó bér 2025/2026-os adó- és járulék-paraméterekkel készült EGYSZERŰSÍTETT becslés (a tényleges levonás munkáltatónként/községenként eltérhet); a költségek és a gyerek-juttatások közösségi beküldésekből és referencia-szintekből származó BECSLÉSEK. A tényleges béredről mindig a munkaszerződés és a bérjegyzék dönt."
      />
    </div>
  );
}
