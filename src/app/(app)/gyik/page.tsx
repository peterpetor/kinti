import Link from "next/link";
import type { Metadata } from "next";
import { Icon, ScreenHeader } from "@/components/ui";
import { FAQ_PAGES } from "@/lib/faq-pages";

// SSG (statikus adat) — nem fogyaszt edge-route-ot (deploy-plafon).
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Gyakori kérdések külföldön élő magyaroknak",
  description:
    "Lakásbérlés, magyar szakember-keresés és hivatalos ügyintézés külföldön — a leggyakoribb kérdések érthető, azonnali válaszokkal (Svájc, Ausztria, Németország, Hollandia).",
  alternates: { canonical: "/gyik" },
};

/**
 * /gyik — az AEO GYIK-oldalak indexe. A részletes kérdés-válasz oldalak a
 * /gyik/[slug] alatt élnek (lib/faq-pages) — ez a belépő + belső-link csomópont.
 */
export default function GyikIndexPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <ScreenHeader
        eyebrow="Tudásbázis"
        title="Gyakori kérdések"
        back={
          <Link
            href="/tudasbazis"
            aria-label="Vissza a Tudásbázisba"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
          >
            <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
          </Link>
        }
      />

      <p className="text-[13.5px] leading-relaxed text-ink-muted">
        A külföldön élő magyarok leggyakoribb kérdései — azonnali, érthető válaszokkal,
        országonkénti összehasonlító táblázatokkal, és kattintható úttal a Kinti
        megfelelő eszközéhez.
      </p>

      <div className="grid gap-2.5">
        {FAQ_PAGES.map((p) => (
          <Link
            key={p.slug}
            href={`/gyik/${p.slug}`}
            className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 shadow-card transition active:scale-[0.99]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-xl">{p.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-extrabold leading-snug tracking-[-0.01em] text-ink">
                {p.title}
              </span>
              <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-muted">
                {p.faqs.length} kérdés · frissítve {p.updatedAt}
              </span>
            </span>
            <Icon name="chevR" size={16} strokeWidth={2.2} className="shrink-0 text-ink-faint" />
          </Link>
        ))}
      </div>

      <p className="text-[12px] leading-relaxed text-ink-muted">
        Nem találod a kérdésed? Böngéssz a{" "}
        <Link href="/tudasbazis" className="font-bold text-primary underline">Tudásbázis</Link>{" "}
        81 útmutatója között, vagy kérdezd a kezdőlapi asszisztenst.
      </p>
    </div>
  );
}
