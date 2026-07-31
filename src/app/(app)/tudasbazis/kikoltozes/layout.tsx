import type { Metadata } from "next";

/**
 * ⚠️ MIÉRT VAN ITT KÜLÖN ELRENDEZÉS: a `kikoltozes/page.tsx` KLIENS-komponens
 * (`"use client"`), és kliens-komponens NEM tud `metadata`-t exportálni. Emiatt
 * ennek az oldalnak EGYÁLTALÁN nem volt saját címe, leírása és megosztási
 * előnézete — mindent a gyökér-elrendezésből örökölt, vagyis Facebookra vagy
 * WhatsAppra illesztve az általános „Kinti — Találj magyart a közeledben"
 * jelent meg egy kiköltözési teendőlista helyett.
 *
 * A metaadat ezért ide, egy szerver-oldali elrendezésbe kerül; a lap maga
 * változatlan marad.
 */
const title = "Kiköltözési teendőlista — mit intézz indulás előtt és után";
const description =
  "Lépésről lépésre teendőlista kiköltözéshez: mit intézz még itthon (okmányok, biztosítás, kijelentkezés) és mit az első hetekben kint (bejelentkezés, bankszámla, egészségbiztosítás). Menthető és megosztható.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tudasbazis/kikoltozes" },
  openGraph: {
    title,
    description,
    url: "https://kinti.app/tudasbazis/kikoltozes",
    siteName: "Kinti",
    type: "article",
    locale: "hu_HU",
    images: [{ url: "/icons/og-default.png", width: 1200, height: 630, alt: "Kinti Tudásbázis" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/icons/og-default.png"],
  },
};

export default function KikoltozesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
