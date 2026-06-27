import type { Metadata } from "next";
import { InviteLanding } from "@/components/views/invite-landing";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Egy magyar meghívott a Kintire 🇭🇺",
  description:
    "A Kinti a kint élő magyaroké: szakember-kereső, állások, ügyintézés-segéd, közösség. Ingyen, fiók nélkül, anonim.",
  openGraph: {
    title: "Egy magyar meghívott a Kintire 🇭🇺",
    description: "Szakember-kereső, állások, ügyintézés, közösség — kint élő magyaroknak. Ingyen, anonim.",
    url: "https://kinti.app/meghivo",
    siteName: "kinti",
    type: "website",
    images: [{ url: "https://kinti.app/icons/og-default.png", width: 1200, height: 630, alt: "Kinti" }],
  },
};

export default function InvitePage({ params }: { params: { code: string } }) {
  return <InviteLanding code={params.code} />;
}
