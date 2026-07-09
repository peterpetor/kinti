import type { Metadata } from "next";
import Link from "next/link";
import { Icon, KintiLogo } from "@/components/ui";
import { GUIDES } from "@/lib/tudastar";
import { TudastarCatalog } from "@/components/views/tudastar-catalog";

// Statikus katalógus (a szűrés/keresés kliens-oldali) → SSG, nincs edge-route.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Tudástár — útmutatók külföldön élő magyaroknak | Kinti",
  description:
    "Gyakorlati útmutatók magyaroknak Németországban, Ausztriában, Svájcban és Hollandiában: hivatalos ügyintézés, adózás, családi támogatások, egészségügy és munka — érthetően, magyarul.",
  alternates: { canonical: "/tudastar" },
  openGraph: {
    title: "Kinti Tudástár — expat útmutatók magyaroknak",
    description:
      "Ügyintézés, adózás, családi támogatások, egészségügy — országonként, magyarul, egy helyen.",
    url: "/tudastar",
    type: "website",
    siteName: "Kinti",
  },
};

// A kliens-katalógusnak a nagy `contentHtml` NEM kell → karcsú vetület (kis payload).
const catalogGuides = GUIDES.map((g) => ({
  slug: g.slug,
  country: g.country,
  category: g.category,
  title: g.title,
  description: g.description,
  readTime: g.readTime,
}));

export default function TudastarPage() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <header className="flex items-center gap-3">
        <KintiLogo size={28} />
        <span className="text-[16px] font-extrabold tracking-tight text-ink">Tudástár</span>
        <Link
          href="/"
          aria-label="Vissza a Főoldalra"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-line bg-surface text-ink active:scale-95"
        >
          <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
        </Link>
      </header>

      <div className="space-y-1.5">
        <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-ink text-balance">
          Útmutatók a kinti élethez
        </h1>
        <p className="text-[13px] leading-snug text-ink-muted">
          Hivatalos ügyintézés, adózás, családi támogatások, egészségügy és munka —
          országonként, érthetően, magyarul. A részletekhez mindig a hivatalos forrást is jelöljük.
        </p>
      </div>

      <TudastarCatalog guides={catalogGuides} />
    </div>
  );
}
