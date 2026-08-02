/**
 * magyarok-uk-directory.mjs — a magyarok.co.uk brit magyar CÉGJEGYZÉK kiolvasása.
 *
 * A kategória-oldalak JS-sel töltik a listát, ezért Playwright kell.
 * ⚠️ Ez FELDERÍTÉS: a kimenetet egyenként kell ellenőrizni (működik-e még,
 * nem duplikátum-e), mielőtt bármi bekerül a szaknévsorba.
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const KATEGORIAK = [
  ["autoszereles-jarmuvek-javitasa", "autoszerelo"],
  ["fodrasz-pedikur-manikur", "fodrasz"],
  ["etel-elelmiszer-magyar-boltok", "bolt"],
  ["fogaszat-fogorvos", "fogorvos"],
  ["forditas-tolmacsolas", "fordito"],
  ["konyveles-adotanacsadas", "konyveles"],
];

const b = await chromium.launch();
const ctx = await b.newContext({ locale: "hu-HU", viewport: { width: 1400, height: 1000 } });
const p = await ctx.newPage();
const out = [];

for (const [slug, kat] of KATEGORIAK) {
  try {
    await p.goto(`https://magyarok.co.uk/directory/categories/${slug}`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    await p.waitForTimeout(4500);
    // görgetés, hátha lusta betöltés van
    for (let i = 0; i < 3; i++) {
      await p.evaluate(() => window.scrollBy(0, 1400));
      await p.waitForTimeout(900);
    }
    const items = await p.evaluate(() => {
      const res = [];
      // a listing-kártyák: a /directory/<slug> alakú linkek, a kategória-oldalon kívül
      for (const a of Array.from(document.querySelectorAll('a[href*="/directory/"]'))) {
        const href = a.getAttribute("href") || "";
        if (/\/categories/.test(href) || /dashboard|add-directory/.test(href)) continue;
        const nev = (a.textContent || "").replace(/\s+/g, " ").trim();
        if (nev.length < 3 || nev.length > 90) continue;
        const kartya = (a.closest("article,li,div") || a).textContent?.replace(/\s+/g, " ").trim() || "";
        res.push({ nev, href, kartya: kartya.slice(0, 300) });
      }
      return res;
    });
    const egyedi = new Map();
    for (const it of items) if (!egyedi.has(it.href)) egyedi.set(it.href, it);
    for (const it of egyedi.values()) out.push({ ...it, kat, slug });
    console.log(`${slug.padEnd(34)} ${egyedi.size} tétel`);
  } catch (e) {
    console.log(`! ${slug} — ${String(e).slice(0, 50)}`);
  }
}
writeFileSync("magyarok-uk.json", JSON.stringify(out, null, 1), "utf8");
console.log(`\nÖSSZESEN ${out.length} tétel → magyarok-uk.json`);
await b.close();
