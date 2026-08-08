/**
 * filter-hu-searchch.mjs — a svájci search.ch-s aratás szűrése.
 *
 * ⚠️⚠️ A LEGFONTOSABB KÜLÖNBSÉG A NÉMET KÖRÖKHÖZ KÉPEST: a search.ch
 * TELEFONKÖNYV, tehát MAGÁNSZEMÉLYEKET is tartalmaz. Magánszemély lakcíme és
 * telefonja SOHA nem kerülhet a szaknévsorba, ezért KÉT FÜGGETLEN üzleti jelet
 * követelünk meg, és mindkettőnek meg kell lennie:
 *   1. van szakma-megjelölés (`.tel-categories`) — magánszemélynél nincs
 *   2. `data-entrytype="Business"` a telefonszám-linken
 * Mérve: „Dr Perrelet-Szabo Isabelle" (magánszemély) egyiket sem hordozza.
 *
 * ⭐ A KANTON-KÓD KÉSZEN JÖN a forrásból (`.region`), tehát nincs irányítószám →
 * régió térkép, és nincs olyan hibalehetőség, mint a németnél (Zweibrücken,
 * Lindau). Csak azt ellenőrizzük, hogy valóban svájci kanton-kód-e.
 *
 * A szakma-illesztés és a magyar hitelesség-vizsgálat ugyanaz, mint a német
 * köröknél — egy logika, egy helyen (`filter-hu-11880.mjs`, `filter-hu-vezeteknev.mjs`).
 *
 * Futtatás: node scripts/filter-hu-searchch.mjs nyers.json ki.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { kategoria } from "./filter-hu-11880.mjs";
import { hitelesseg } from "./filter-hu-vezeteknev.mjs";

const BE = process.argv[2];
const KI = process.argv[3];

/** A 26 svájci kanton kódja — bármi más adathiba. */
const KANTONOK = new Set(
  "AG AI AR BE BL BS FR GE GL GR JU LU NE NW OW SG SH SO SZ TG TI UR VD VS ZG ZH".split(" "),
);

/**
 * CH-specifikus szakma-nevek, amelyeket a német minta-lista nem fed le.
 * A search.ch svájci német / francia megnevezéseket is használ.
 */
const CH_EXTRA = [
  [/sanitäre anlagen|sanitärinstallation|spengler/i, "gazvez", "Víz-gáz szerelő"],
  [/plattenbeläge|plattenleger/i, "burkolo", "Burkoló / Csempéző"],
  [/bodenbeläge|unterlagsböden/i, "parkettazas", "Padlóburkolás / Parkettázás"],
  [/gipserarbeiten|gipser/i, "fuggesztett_menyezet", "Álmennyezet / Gipszkarton"],
  [/schreinerei|zimmerei/i, "asztalos", "Asztalos"],
  [/coiffeur/i, null, null], // NEM rés-szakma: fodrászból van bőven
  [/carrosserie/i, "karosszeria", "Karosszérialakatos"],
  [/garage|autoreparaturen/i, "autoszer", "Autószerelő"],
  [/umzüge|déménagement/i, "koltoztetes", "Költöztetés"],
  [/reinigungen|nettoyage/i, "takarito", "Takarítás"],
  [/hauswartung|conciergerie/i, "hazaszerkeszto", "Házmester"],
  [/gartenunterhalt|paysagiste/i, "kertesz", "Kertészet"],
  [/malergeschäft|gipser-?maler|peintre/i, "festo", "Szobafestő / Tapétázó"],
  [/fusspflege|pédicure/i, "pedikur", "Pedikűr / Lábápolás"],
  [/fahrschule|auto-?école/i, "gepijarmu_oktato", "Autósiskola / Oktató"],
  [/bäckerei|boulangerie/i, "pek", "Pék"],
  [/storen\b|sonnenstoren/i, "arnyekolastechnika", "Árnyékolástechnika / Redőny"],
];

function chKategoria(szoveg) {
  for (const [minta, id, cimke] of CH_EXTRA) {
    if (minta.test(szoveg)) return id ? [id, cimke] : null;
  }
  return kategoria(szoveg);
}

const nyers = JSON.parse(readFileSync(BE, "utf8"));
const ki = [];
let magan = 0;
for (const x of nyers) {
  // ⚠️ KÉT FÜGGETLEN ÜZLETI JEL — mindkettő kell.
  if (!x.szakma || x.tipus !== "Business") {
    magan++;
    continue;
  }
  const m = chKategoria(x.szakma);
  if (!m) continue;
  if (!x.tel || x.tel.replace(/\D/g, "").length < 8) continue;
  if (!x.utca || !/\d/.test(x.utca)) continue; // házszám nélkül nincs pontos hely
  if (!KANTONOK.has(x.kanton)) continue;
  const h = hitelesseg(x.nev || "");
  if (!h.elfogad) continue;
  ki.push({
    ...x,
    cim: `${x.utca}, ${x.irsz} ${x.telepules}`,
    kategoria: m[0],
    kategoria_cimke: m[1],
    pont: h.pont,
    okok: h.okok,
  });
}
ki.sort((a, b) => b.pont - a.pont || a.kategoria.localeCompare(b.kategoria));
writeFileSync(KI, JSON.stringify(ki, null, 1), "utf8");

const cnt = {};
for (const x of ki) cnt[x.kategoria] = (cnt[x.kategoria] || 0) + 1;
console.log(`${nyers.length} nyers → ${ki.length} elfogadott jelölt  (${magan} magánszemély/jelöletlen kihagyva)`);
console.log(
  Object.entries(cnt)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}:${v}`)
    .join("  "),
);
