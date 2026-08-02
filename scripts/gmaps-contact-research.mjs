/**
 * gmaps-contact-research.mjs — hiányzó elérhetőségek kézi kutatása Google Maps-ből.
 *
 * ⚠️ FEGYELEM („inkább nincs adat, mint rossz"): egy találat CSAK akkor fogadható el, ha
 *   • a Maps-beli NÉV token-szinten egyezik a mienkkel (nem nyers substring — az
 *     „Abel" ⊂ „Izabella" hibaosztály), ÉS
 *   • a CÍM is egyezik (irányítószám VAGY utcanév), mert a puszta névegyezés
 *     szomszéd várost is adhat.
 * ⚠️ NEM másolunk értékelést/nyitvatartást (ToS + EU adatbázisjog + a saját
 *    véleményrendszerünkkel ütközne) — CSAK telefon és weboldal.
 *
 * Kimenet: gmaps-candidates.json — az ALKALMAZÁS külön, kézi ellenőrzés után.
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const LIMIT = Number(process.argv[2] || 0) || Infinity;
const rows = JSON.parse(readFileSync("research_targets.json", "utf8")).slice(0, LIMIT);

const STOP = new Set(["magyar","ungarische","ungarisches","hungarian","restaurant","etterem","étterem",
  "bolt","shop","store","market","gmbh","kft","ltd","und","der","die","das","the","and",
  "coiffure","coiffeur","hair","hairdressers","kfz","auto","autó","szalon","salon","büfé","bufe"]);
const norm = (s) => (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const toks = (s) => new Set(norm(s).replace(/[^a-z0-9]+/g," ").split(" ").filter(t=>t.length>=3 && !STOP.has(t)));

function nevEgyezik(mienk, ovek) {
  const a = toks(mienk), b = toks(ovek);
  if (!a.size || !b.size) return false;
  const kozos = [...a].filter(t=>b.has(t));
  if (kozos.length >= 2) return true;
  // egyetlen közös token csak ha ritka tulajdonnév (>=6 karakter)
  return kozos.length === 1 && kozos[0].length >= 6;
}
function cimEgyezik(mienk, ovek) {
  const m = norm(mienk), o = norm(ovek);
  const irsz = (m.match(/\b\d{4,5}\b/) || [])[0];
  if (irsz && o.includes(irsz)) return true;
  const utca = (m.match(/([a-zäöüß]+(?:strasse|straße|str|gasse|weg|platz|road|street|allee|ut|utca))/i)||[])[1];
  return !!(utca && utca.length >= 5 && o.includes(utca));
}

const b = await chromium.launch();
const ctx = await b.newContext({ locale: "hu-HU", viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const out = [];

for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  const q = `${r.name} ${r.address}`.replace(/\s+/g," ").trim();
  try {
    await p.goto("https://www.google.com/maps/search/" + encodeURIComponent(q), { waitUntil: "domcontentloaded", timeout: 40000 });
    await p.waitForTimeout(1200);
    // sütikonszent
    const cons = p.locator('button:has-text("Összes elfogadása"), button:has-text("Accept all"), form[action*="consent"] button').first();
    if (await cons.count()) { await cons.click({ timeout: 4000 }).catch(()=>{}); await p.waitForTimeout(1500); }
    await p.waitForTimeout(3200);

    const d = await p.evaluate(() => {
      const txt = (sel) => document.querySelector(sel)?.textContent?.trim() || null;
      const nev = txt("h1") || null;
      const tel = Array.from(document.querySelectorAll('button[data-item-id^="phone"], [data-tooltip="Telefonszám másolása"]'))
        .map(e => (e.getAttribute("aria-label")||e.textContent||"").replace(/^.*?:\s*/,"").trim())
        .find(t => /\+?[\d][\d\s\-()\/]{6,}/.test(t)) || null;
      const web = Array.from(document.querySelectorAll('a[data-item-id="authority"], a[aria-label^="Webhely"], a[aria-label^="Website"]'))
        .map(e => e.getAttribute("href")).find(Boolean) || null;
      const cim = Array.from(document.querySelectorAll('button[data-item-id="address"]'))
        .map(e => (e.getAttribute("aria-label")||"").replace(/^.*?:\s*/,"").trim()).find(Boolean) || null;
      return { nev, tel, web, cim };
    });

    const okNev = d.nev ? nevEgyezik(r.name, d.nev) : false;
    const okCim = d.cim ? cimEgyezik(r.address, d.cim) : false;
    const elfogad = okNev && okCim && (d.tel || d.web);
    if (elfogad) out.push({ ...r, mapsNev: d.nev, mapsCim: d.cim, phone: d.tel, website: d.web });
    console.log(`${elfogad?"✓":"·"} [${i+1}/${rows.length}] ${r.name.slice(0,34).padEnd(36)} nev:${okNev?"i":"n"} cim:${okCim?"i":"n"} ${d.tel||""} ${d.web?"web":""}`);
  } catch (e) {
    console.log(`! [${i+1}/${rows.length}] ${r.name.slice(0,34)} — ${String(e).slice(0,44)}`);
  }
  await p.waitForTimeout(900);
}
writeFileSync("gmaps-candidates.json", JSON.stringify(out, null, 1), "utf8");
console.log(`\nÖSSZESEN ${out.length} elfogadott jelölt a ${rows.length}-ből → gmaps-candidates.json`);
await b.close();
