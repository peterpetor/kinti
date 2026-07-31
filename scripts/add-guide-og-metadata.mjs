/**
 * add-guide-og-metadata.mjs — EGYSZERI segéd: megosztási metaadat a tudásbázis
 * önálló aloldalaira.
 *
 * ⚠️ MIÉRT KELLETT: a `/tudasbazis/[slug]` útvonal rendesen ad `openGraph`-ot,
 * de NYOLC téma önálló oldalként létezik (allampolgarsag, bussen, hivatalos,
 * iskolarendszer, kikoltozes, osszehasonlitas, vam, vizum), és ezek közül
 * HÉTNEK nem volt sem megosztási adata, sem kanonikus URL-je. Facebookra vagy
 * WhatsAppra illesztve mind az ÁLTALÁNOS oldalcímet mutatta volna
 * („Kinti — Találj magyart a közeledben"), nem a cikkét — pedig a tudásbázis a
 * legmegoszthatóbb tartalom, vagyis pont az indulási csatorna sérült.
 */
import { readFileSync, writeFileSync } from "node:fs";

const BASE = "src/app/(app)/tudasbazis";

// slug → új cím (null = marad a meglévő).
// ⚠️ A cím-tisztítás oka: a gyökér-elrendezés sablonja „%s · Kinti", tehát a
// címben lévő „| Kinti" / „— Kinti" DUPLÁN írná ki a márkát. A „&" és a
// Nagybetűs Szavak a ház-stílussal is ütköznek (mondatkezdő nagybetű).
const PAGES = {
  allampolgarsag: "Letelepedés és állampolgárság — engedély-varázsló",
  bussen: null,
  hivatalos: null,
  iskolarendszer: null,
  vam: "Vám-kalkulátor — mit vihetsz be Svájcba és Angliába",
  vizum: null,
};

const START = "export const metadata = {";

for (const [slug, newTitle] of Object.entries(PAGES)) {
  const file = `${BASE}/${slug}/page.tsx`;
  const src = readFileSync(file, "utf8");

  const from = src.indexOf(START);
  if (from < 0) {
    console.log("kihagyva (nincs metadata):", slug);
    continue;
  }
  const to = src.indexOf("\n};", from);
  if (to < 0) {
    console.log("kihagyva (nem záródik):", slug);
    continue;
  }
  const block = src.slice(from, to + 3);
  if (block.includes("openGraph")) {
    console.log("kihagyva (már van openGraph):", slug);
    continue;
  }

  const titleM = block.match(/title:\s*"([^"]*)"/);
  const descM = block.match(/description:\s*\n?\s*"([^"]*)"/);
  if (!titleM || !descM) {
    console.log("kihagyva (nem olvasható cím/leírás):", slug);
    continue;
  }
  const title = newTitle ?? titleM[1];
  const desc = descM[1];
  const path = `/tudasbazis/${slug}`;

  const next = [
    "export const metadata = {",
    `  title: "${title}",`,
    "  description:",
    `    "${desc}",`,
    `  alternates: { canonical: "${path}" },`,
    "  // ⚠️ Megosztási előnézet: e nélkül a Facebookra/WhatsAppra illesztett link",
    "  // az ÁLTALÁNOS oldalcímet mutatta, nem a cikkét.",
    "  openGraph: {",
    `    title: "${title}",`,
    `    description: "${desc}",`,
    `    url: "https://kinti.app${path}",`,
    '    siteName: "Kinti",',
    '    type: "article",',
    '    locale: "hu_HU",',
    '    images: [{ url: "/icons/og-default.png", width: 1200, height: 630, alt: "Kinti Tudásbázis" }],',
    "  },",
    "  twitter: {",
    '    card: "summary_large_image",',
    `    title: "${title}",`,
    `    description: "${desc}",`,
    '    images: ["/icons/og-default.png"],',
    "  },",
    "};",
  ].join("\n");

  writeFileSync(file, src.slice(0, from) + next + src.slice(to + 3), "utf8");
  console.log("ok:", slug, "→", title.slice(0, 52));
}
