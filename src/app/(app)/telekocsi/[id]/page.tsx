import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getRideById } from "@/lib/repo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * /telekocsi/[id] — egyedi fuvar-oldal.
 *
 * Fő célja: OpenGraph meta, hogy ha valaki megoszt egy fuvart Facebookon /
 * Messengerben / WhatsApp-on, szép kártya jelenjen meg (útvonal, dátum, sofőr).
 * A tényleges render a /telekocsi listára dob vissza (nincs külön részlet-nézet).
 */

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const ride = await getRideById(params.id);
  if (!ride) return { title: "Fuvar nem található" };

  const route = [
    ride.departureCity,
    ...ride.waypoints.map((wp) => wp.city),
    ride.destinationCity,
  ].join(" → ");

  const depDate = ride.departureTime.replace("T", " ").slice(0, 16);
  const typeLabel = ride.isRequest ? "Fuvart keres" : "Fuvart kínál";

  const title = `${route} — ${typeLabel}`;
  const description = `🚗 ${route} · 📅 ${depDate} · 👥 ${ride.seats} hely${ride.priceText ? ` · ${ride.priceText}` : ""} — ${ride.posterName}`;

  const url = `https://kinti.app/telekocsi/${ride.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "kinti",
      type: "website",
      images: [{ url: "https://kinti.app/icons/og-ride.png", width: 1200, height: 630, alt: route }],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

/**
 * A tényleges oldalon nem renderelünk különálló UI-t: a felhasználó a /telekocsi
 * listára kerül vissza, ahol a fuvar kártyája megtalálható.
 */
export default function RideDetailPage() {
  redirect("/telekocsi");
}
