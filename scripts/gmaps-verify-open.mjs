/**
 * gmaps-verify-open.mjs — jelöltek hitelesítése Google Maps-en, BEZÁRÁS-ellenőrzéssel.
 *
 * Miben több a `gmaps-verify-places.mjs`-nél: kiolvassa a „Véglegesen bezárt" /
 * „Cerrado permanentemente" / „Permanently closed" jelzést is.
 *
 * ⚠️⚠️ MIÉRT KELL: egy régi cégjegyzékből származó tétel háromféleképpen lehet
 * halott, és MINDHÁRMAT külön kell kiszűrni:
 *   1. a weboldal eltűnt              → HTTP-ellenőrzés fogja meg
 *   2. a weboldal PARKOLTATVA van     → HTTP 200-at ad! (hugedomains, sedo, afternic)
 *   3. a cég bezárt, a Maps-tétel él  → csak ez a bezárás-jelző fogja meg
 * A 2-es a legalattomosabb: a puszta státuszkód HAMIS POZITÍVOT ad.
 *
 * ⚠️ Csak TÉNYT olvasunk ki (név/cím/telefon/web/bezárás) — értékelést,
 * nyitvatartást NEM (idegen pontszám a blurb-ben tilos, ld. blurb-public-text-rules).
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const tetelek = JSON.parse(readFileSync(process.argv[2], "utf8"));
const OUT = process.argv[3] || "verified-open.json";

/** Bezárás-jelzők a Maps felületén, több nyelven. */
const BEZART = /(véglegesen bezárt|cerrado permanentemente|permanently closed|dauerhaft geschlossen|definitief gesloten)/i;
const IDEIGLENES = /(ideiglenesen bezárt|cerrado temporalmente|temporarily closed)/i;
/** Magyar kötődés jelei a lap szövegében. */
const MAGYAR_JEL = /(húngaro|hungarian|ungarisch|magyar|hongaars|gulyás|goulash|lángos|langos|kürtős|kurtos|pálinka)/i;

const b = await chromium.launch();
const ctx = await b.newContext({ locale: "es-ES", viewport: { width: 1300, height: 950 } });
const p = await ctx.newPage();
const out = [];

for (const t of tetelek) {
  try {
    await p.goto("https://www.google.com/maps/search/" + encodeURIComponent(t.q), {
      waitUntil: "domcontentloaded",
      timeout: 40000,
    });
    await p.waitForTimeout(1000);
    const c = p
      .locator('button:has-text("Aceptar todo"), button:has-text("Accept all"), button:has-text("Összes elfogadása")')
      .first();
    if (await c.count()) {
      await c.click({ timeout: 4000 }).catch(() => {});
      await p.waitForTimeout(1800);
    }
    await p.waitForTimeout(3200);

    const d = await p.evaluate(() => {
      const pick = (sel, attr) =>
        [...document.querySelectorAll(sel)]
          .map((e) => (attr ? e.getAttribute(attr) : e.textContent) || "")
          .map((s) => s.replace(/^.*?:\s*/, "").trim())
          .find(Boolean) || null;
      return {
        nev: document.querySelector("h1")?.textContent?.trim() || null,
        cim: pick('button[data-item-id="address"]', "aria-label"),
        tel: pick('button[data-item-id^="phone"]', "aria-label"),
        web: pick('a[data-item-id="authority"]', "href"),
        szoveg: document.body.innerText.replace(/\s+/g, " ").slice(0, 4000),
      };
    });

    // „Resultados" / „Results" = találati LISTA jött vissza, nem egy konkrét hely.
    const lista = !d.nev || /^(resultados|results|találatok)$/i.test(d.nev);
    const r = {
      ...t,
      nev: lista ? null : d.nev,
      cim: d.cim,
      tel: d.tel,
      web: d.web,
      bezart: BEZART.test(d.szoveg),
      ideiglenes: IDEIGLENES.test(d.szoveg),
      magyarJel: MAGYAR_JEL.test(d.szoveg),
      egyertelmu: !lista,
    };
    out.push(r);
    const jel = r.bezart ? "⛔BEZÁRT" : !r.egyertelmu ? "·lista  " : r.magyarJel ? "✓magyar " : "✓       ";
    console.log(`${jel} ${t.q.slice(0, 38).padEnd(40)} ${(r.nev || "—").slice(0, 30).padEnd(32)} ${r.tel || "—"}`);
  } catch (e) {
    console.log(`! ${t.q.slice(0, 38)} — ${String(e).slice(0, 40)}`);
    out.push({ ...t, hiba: String(e).slice(0, 80) });
  }
  await p.waitForTimeout(900);
}

writeFileSync(OUT, JSON.stringify(out, null, 1), "utf8");
const jo = out.filter((x) => x.egyertelmu && !x.bezart);
console.log(`\n${jo.length} / ${out.length} nyitva és egyértelmű  (${out.filter((x) => x.bezart).length} bezárt)`);
await b.close();
