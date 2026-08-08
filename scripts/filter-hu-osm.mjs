/**
 * filter-hu-osm.mjs — az OSM-es kisipar-aratás szűrése.
 *
 * Az Overpass már NÉVRE szűrt, tehát itt nem a keresés a feladat, hanem a
 * HITELESSÉG: ugyanaz a helyesírás-alapú vizsgálat fut, mint a német és svájci
 * köröknél (`filter-hu-vezeteknev.mjs`).
 *
 * ⚠️ MIÉRT KELL MÉGIS SZŰRNI, ha az Overpass már névre keresett: a regex
 * RÉSZLÁNCRA is illeszt. A „Nagy" benne van a „Nagyder"-ben, a „Deak" a
 * „Deakon"-ban, a „Magyar" pedig német szövegkörnyezetben is előfordulhat
 * („Ungarische…"). A hitelesség-vizsgálat SZÓHATÁRRAL dolgozik, tehát ezeket
 * kiszűri — és a lengyel/román/délszláv névvégeket is.
 *
 * ⚠️ ELÉRHETŐSÉG: az arató már megkövetelte (telefon VAGY teljes cím), itt csak
 * megismételjük, mert a szűrő önállóan is futtatható.
 *
 * Futtatás: node scripts/filter-hu-osm.mjs osm-nyers.json ki.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { hitelesseg } from "./filter-hu-vezeteknev.mjs";

const BE = process.argv[2];
const KI = process.argv[3];

const nyers = JSON.parse(readFileSync(BE, "utf8"));
const ki = [];
let nevBukas = 0;
for (const x of nyers) {
  if (!x.nev) continue;
  const vanTel = Boolean(x.tel && x.tel.replace(/\D/g, "").length >= 7);
  if (!vanTel && !x.cim) continue;
  const h = hitelesseg(x.nev);
  if (!h.elfogad) {
    nevBukas++;
    continue;
  }
  ki.push({ ...x, pont: h.pont, okok: h.okok });
}
ki.sort((a, b) => b.pont - a.pont || a.kategoria.localeCompare(b.kategoria));
writeFileSync(KI, JSON.stringify(ki, null, 1), "utf8");

const cnt = {};
for (const x of ki) cnt[x.kategoria] = (cnt[x.kategoria] || 0) + 1;
const orsz = {};
for (const x of ki) orsz[x.orszag] = (orsz[x.orszag] || 0) + 1;
console.log(`${nyers.length} nyers → ${ki.length} elfogadott jelölt  (${nevBukas} részlánc-/idegen névtalálat kiszűrve)`);
console.log("ország:", Object.entries(orsz).map(([k, v]) => `${k}:${v}`).join("  "));
console.log("kategória:", Object.entries(cnt).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join("  "));
