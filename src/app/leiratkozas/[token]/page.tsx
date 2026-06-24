import { UnsubscribeConfirm } from "./unsubscribe-confirm";

// FONTOS: dinamikus route → KELL az edge runtime, különben a next-on-pages
// (Cloudflare) build elszáll: „Unable to find lambda for route". A többi
// dinamikus route is így van konfigurálva.
export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leiratkozás — Kinti hírlevél",
  robots: { index: false, follow: false },
};

export default function UnsubscribePage({ params }: { params: { token: string } }) {
  return <UnsubscribeConfirm token={params.token} />;
}
