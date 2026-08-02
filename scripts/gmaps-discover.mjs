/**
 * gmaps-discover.mjs — ÚJ magyar vállalkozások felderítése Google Maps-ből.
 *
 * A bevált technika (ld. gb-/ch-szaknevsor-seed memóriák): NEM az „ungarisch"
 * kulcsszó (az alig ad találatot), hanem MAGYAR VEZETÉKNÉV + SZAKMA + VÁROS.
 * A kivándorolt szakemberek a saját nevükön hirdetnek, nem a nemzetiségükön.
 *
 * ⚠️ Ez FELDERÍTÉS, nem import: a kimenet jelölt-lista, amit EGYENKÉNT kell
 * ellenőrizni (valóban magyar kötődés? működik? nem duplikátum?).
 * ⚠️ NEM másolunk értékelést/nyitvatartást — csak név, cím, telefon, weboldal.
 */
import { chromium } from "playwright";
import { writeFileSync, existsSync, readFileSync } from "node:fs";

const queries = JSON.parse(readFileSync(process.argv[2], "utf8"));
const OUT = process.argv[3] || "discover-candidates.json";
const meglevo = existsSync("existing-names.json")
  ? new Set(JSON.parse(readFileSync("existing-names.json", "utf8")).map((s) => s.toLowerCase()))
  : new Set();

const b = await chromium.launch();
const ctx = await b.newContext({ locale: "en-GB", viewport: { width: 1400, height: 950 } });
const p = await ctx.newPage();
const talalt = new Map();

for (let qi = 0; qi < queries.length; qi++) {
  const { q, country, category } = queries[qi];
  try {
    await p.goto("https://www.google.com/maps/search/" + encodeURIComponent(q), { waitUntil: "domcontentloaded", timeout: 40000 });
    await p.waitForTimeout(1000);
    const cons = p.locator('button:has-text("Accept all"), button:has-text("Összes elfogadása")').first();
    if (await cons.count()) { await cons.click({ timeout: 4000 }).catch(()=>{}); await p.waitForTimeout(1800); }
    await p.waitForTimeout(3000);
    // találati lista görgetése
    const feed = p.locator('div[role="feed"]').first();
    if (await feed.count()) { for (let i=0;i<2;i++){ await feed.evaluate(e=>e.scrollBy(0,1600)).catch(()=>{}); await p.waitForTimeout(1200);} }

    const items = await p.evaluate(() => {
      const out = [];
      for (const a of Array.from(document.querySelectorAll('a[href*="/maps/place/"]'))) {
        const card = a.closest('div[jsaction], div.Nv2PK') || a.parentElement;
        const nev = a.getAttribute("aria-label") || "";
        if (!nev) continue;
        const txt = (card?.textContent || "").replace(/\s+/g, " ");
        out.push({ nev: nev.trim(), txt: txt.slice(0, 260), href: a.getAttribute("href") });
      }
      return out;
    });

    let uj = 0;
    for (const it of items) {
      const kulcs = it.nev.toLowerCase();
      if (meglevo.has(kulcs) || talalt.has(kulcs)) continue;
      // cím + telefon kiszedése a kártya-szövegből
      const tel = (it.txt.match(/(\+?\d[\d\s().\-\/]{8,})/) || [])[1]?.trim() || null;
      talalt.set(kulcs, { nev: it.nev, country, category, q, kartya: it.txt, tel, href: it.href });
      uj++;
    }
    console.log(`[${qi+1}/${queries.length}] ${q.slice(0,52).padEnd(54)} +${uj} (össz ${talalt.size})`);
  } catch (e) {
    console.log(`! [${qi+1}/${queries.length}] ${q.slice(0,40)} — ${String(e).slice(0,40)}`);
  }
  await p.waitForTimeout(700);
}
writeFileSync(OUT, JSON.stringify([...talalt.values()], null, 1), "utf8");
console.log(`\n${talalt.size} jelölt → ${OUT}`);
await b.close();
