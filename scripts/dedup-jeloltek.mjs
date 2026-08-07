// Dedup HÁROM kulccsal — a memória mérése szerint mindhárom kell:
// a NÉV ékezetben tér el, a CÍM írásmódban, és 2026-08-03-án 7 duplikátumot
// CSAK a számjegyre normalizált TELEFON fogott meg.
import { readFileSync, writeFileSync } from "node:fs";

const jeloltek = JSON.parse(readFileSync(process.argv[2], "utf8"));
const megl = JSON.parse(readFileSync(process.argv[3], "utf8"));

const ekezet = (s) =>
  (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const nevKulcs = (s) =>
  [...new Set(ekezet(s).replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 2 &&
    !["gmbh","und","der","die","das","inh","kft","str","fur","für"].includes(t)))]
    .sort().join("-");
const cimKulcs = (s) => {
  const t = ekezet(s)
    .replace(/\(.*?\)/g, " ")
    .replace(/stra(ss|ß)e|str\.?\b/g, "str")
    .replace(/[^a-z0-9]/g, "");
  return t.slice(0, 34);
};
const telKulcs = (s) => {
  const d = (s || "").replace(/\D/g, "").replace(/^00/, "");
  if (d.length < 7) return null;
  // országhívó és a vezető 0 levágása, hogy 0176… és +49176… egyezzen
  return d.replace(/^(49|43|41|31|44|34)/, "").replace(/^0/, "").slice(-9);
};

const N = new Set(), C = new Set(), T = new Set();
for (const m of megl) {
  N.add(nevKulcs(m.name));
  if (m.address) C.add(cimKulcs(m.address));
  const t = telKulcs(m.phone);
  if (t) T.add(t);
}

const ki = [], utkozes = [];
const belsoN = new Set(), belsoC = new Set(), belsoT = new Set();
for (const j of jeloltek) {
  const n = nevKulcs(j.nev), c = j.cim ? cimKulcs(j.cim) : null, t = telKulcs(j.tel);
  const okok = [];
  if (N.has(n)) okok.push("DB-név");
  if (c && C.has(c)) okok.push("DB-cím");
  if (t && T.has(t)) okok.push("DB-telefon");
  if (belsoN.has(n)) okok.push("kötegen belüli név");
  if (c && belsoC.has(c)) okok.push("kötegen belüli cím");
  if (t && belsoT.has(t)) okok.push("kötegen belüli telefon");
  if (okok.length) { utkozes.push({ ...j, okok }); continue; }
  belsoN.add(n); if (c) belsoC.add(c); if (t) belsoT.add(t);
  ki.push(j);
}
writeFileSync(process.argv[4], JSON.stringify(ki, null, 1), "utf8");
writeFileSync(process.argv[5], JSON.stringify(utkozes, null, 1), "utf8");
console.log(`${jeloltek.length} jelölt → ${ki.length} egyedi, ${utkozes.length} duplikátum`);
for (const u of utkozes) console.log(`  dup: ${u.nev.slice(0, 46).padEnd(48)} ${u.okok.join(",")}`);
