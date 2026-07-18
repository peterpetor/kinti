import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { ScreenHeader } from "@/components/ui/headers";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { getHousingListings, getHousingListingForNotify } from "@/lib/repo";
import { isPro } from "@/lib/subscriptions";
import { formatHousingPrice, HOUSING_TYPE_LABELS, type HousingType } from "@/lib/housing";
import { regionName } from "@/lib/regions";
import { housingListingJsonLd, safeJsonLdStringify } from "@/lib/json-ld";
import { PiacterTabs, type PiacterTab } from "./piacter-tabs";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const DEFAULT_METADATA: Metadata = {
  title: "Piactér — albérlet-börze, lakbér-kalkulátor és költöztetés",
  description:
    "Kiadó szobák és albérletek a kinti magyar közösségtől, lakásbérlés rejtett-költség kalkulátor, és segítség a költöztetéshez — egy helyen.",
};

/**
 * Megosztott hirdetés-linkre (?hirdetes=<id>) a cím/leírás a HIRDETÉSÉ —
 * így a Facebookon/WhatsAppon megosztott link beszédes előnézetet kap
 * (típus — város, ár). Csak publikus mezők (kontakt/leírás soha); csak
 * jóváhagyott hirdetésre — egyébként az alap Piactér-meta.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { hirdetes?: string };
}): Promise<Metadata> {
  const id = typeof searchParams?.hirdetes === "string" ? searchParams.hirdetes : "";
  if (id) {
    try {
      const l = await getHousingListingForNotify(id);
      if (l) {
        const typeLabel = HOUSING_TYPE_LABELS[l.type as HousingType] ?? "Hirdetés";
        const region = l.regionCode ? regionName(l.country, l.regionCode) : null;
        const title = `${typeLabel} — ${l.city} | Kinti`;
        const description = `${formatHousingPrice(l.type as HousingType, l.price, l.currency)}${
          region ? ` · ${region}` : ""
        } · Albérlet-börze a kinti magyar közösségtől.`;
        const image = "https://kinti.app/icons/og-default.png";
        const url = `https://kinti.app/piacter?hirdetes=${encodeURIComponent(id)}`;
        return {
          title,
          description,
          openGraph: {
            title,
            description,
            url,
            siteName: "Kinti",
            type: "website",
            images: [{ url: image, width: 1200, height: 630, alt: title }],
          },
          twitter: { card: "summary_large_image", title, description, images: [image] },
        };
      }
    } catch {
      /* hibánál az alap meta */
    }
  }
  return DEFAULT_METADATA;
}

/**
 * Piactér — a „keres-kínál" funkciók KÖZÖS oldala (2026-07-16 összevonás,
 * user-döntés): Börze (a korábbi /szallas-borze), Lakbér-kalkulátor (a korábbi
 * /lakberles) és Költöztetés-hub egy füles felületen. A régi útvonalak
 * permanent redirecttel ide érkeznek (?tab=…). A börze-adat + PRO-státusz
 * szerveren számolódik (a kontakt-kapuőr változatlan).
 */
/** A ?tab= validálása ITT (szerver-oldalon) — a piacter-tabs "use client"
 *  modul függvényei client reference-ként nem hívhatók szerver-komponensből.
 *  A kivezetett ?tab=sajatjaim (a rövid életű redirect-célpont) a Börzére
 *  esik vissza — a Saját posztjaim újra a /sajatjaim oldalon él; ide NEM
 *  redirectelünk vissza, mert a böngészőben cache-elt 308 végtelen hurkot adna. */
function parseTab(v: string | undefined): PiacterTab {
  return v === "kalkulator" || v === "koltoztetes" ? v : "borze";
}

export default function PiacterPage({
  searchParams,
}: {
  searchParams: { tab?: string; hirdetes?: string };
}) {
  return (
    <PiacterContent
      tab={parseTab(searchParams.tab)}
      hirdetesId={typeof searchParams.hirdetes === "string" ? searchParams.hirdetes : null}
    />
  );
}

/** RealEstateListing JSON-LD a megosztott ?hirdetes= mély-linkhez — csak a
 *  FELKÍNÁLT típusokra (nem a "keresek" hirdetésre, az nem ingatlan-ajánlat).
 *  AEO-stratégia 2. pontja, ld. memória [[aeo-strategy]]. */
async function HousingListingJsonLd({ id }: { id: string }) {
  const l = await getHousingListingForNotify(id);
  if (!l || (l.type !== "room_offered" && l.type !== "apartment_offered")) return null;
  const jsonLd = housingListingJsonLd({
    id,
    type: l.type,
    city: l.city,
    regionName: l.regionCode ? regionName(l.country, l.regionCode) : null,
    country: l.country,
    price: l.price,
    currency: l.currency,
    createdAt: l.createdAt,
    url: `https://kinti.app/piacter?hirdetes=${encodeURIComponent(id)}`,
  });
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
    />
  );
}

async function PiacterContent({ tab, hirdetesId }: { tab: PiacterTab; hirdetesId: string | null }) {
  const { userId } = await auth();
  const [listings, pro] = await Promise.all([
    getHousingListings(null, userId),
    isPro(userId),
  ]);

  return (
    <PullToRefresh>
      <div className="mx-auto max-w-md space-y-4 px-5 pb-12 pt-[calc(env(safe-area-inset-top)+2rem)]">
        {hirdetesId && <HousingListingJsonLd id={hirdetesId} />}
        {/* ROOT tab-oldal (TabBar 4. fül) → nincs back, a „…" menü látszik —
            ugyanaz a gomb, ugyanott, mint a többi fő oldalon (user-jelzés;
            a ScreenHeader root-szabálya adja automatikusan). */}
        <ScreenHeader eyebrow="Piactér" title="Albérlet és hirdetések" />

        <PiacterTabs
          initialTab={tab}
          listings={listings}
          isPro={pro}
          signedIn={!!userId}
        />
      </div>
    </PullToRefresh>
  );
}
