/**
 * verify-places.mjs — konkrét vállalkozások ellenőrzése Google Maps-en.
 * Bemenet: JSON tömb { q, hint } elemekkel. Kimenet: név, cím, telefon, weboldal.
 * ⚠️ Csak TÉNYT olvasunk ki (név/cím/telefon/web) — értékelést, nyitvatartást NEM.
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const tetelek = JSON.parse(readFileSync(process.argv[2], "utf8"));
const b = await chromium.launch();
const ctx = await b.newContext({ locale: "es-ES", viewport: { width: 1300, height: 900 } });
const p = await ctx.newPage();
const out = [];

for (const t of tetelek) {
  try {
    await p.goto("https://www.google.com/maps/search/" + encodeURIComponent(t.q), {
      waitUntil: "domcontentloaded",
      timeout: 40000,
    });
    await p.waitForTimeout(1000);
    const c = p.locator('button:has-text("Aceptar todo"), button:has-text("Accept all"), button:has-text("Összes elfogadása")').first();
    if (await c.count()) {
      await c.click({ timeout: 4000 }).catch(() => {});
      await p.waitForTimeout(1800);
    }
    await p.waitForTimeout(3200);
    const d = await p.evaluate(() => {
      const nev = document.querySelector("h1")?.textContent?.trim() || null;
      const cim =
        [...document.querySelectorAll('button[data-item-id="address"]')]
          .map((e) => (e.getAttribute("aria-label") || "").replace(/^.*?:\s*/, "").trim())
          .find(Boolean) || null;
      const tel =
        [...document.querySelectorAll('button[data-item-id^="phone"]')]
          .map((e) => (e.getAttribute("aria-label") || "").replace(/^.*?:\s*/, "").trim())
          .find(Boolean) || null;
      const web =
        [...document.querySelectorAll('a[data-item-id="authority"]')]
          .map((e) => e.getAttribute("href"))
          .find(Boolean) || null;
      const kat =
        document.querySelector('button[jsaction*="category"]')?.textContent?.trim() || null;
      return { nev, cim, tel, web, kat };
    });
    out.push({ ...t, ...d });
    console.log(`${d.nev ? "✓" : "·"} ${t.q.slice(0, 42).padEnd(44)} ${d.nev || "—"} | ${d.cim || "—"} | ${d.tel || "—"}`);
  } catch (e) {
    console.log(`! ${t.q.slice(0, 42)} — ${String(e).slice(0, 40)}`);
  }
  await p.waitForTimeout(900);
}
writeFileSync(process.argv[3] || "verified-places.json", JSON.stringify(out, null, 1), "utf8");
console.log(`\n${out.filter((x) => x.nev).length} / ${out.length} azonosítva`);
await b.close();
