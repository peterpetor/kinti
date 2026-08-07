/**
 * cegjegyzek-keresztnev-harvest.mjs — magyar KERESZTNÉV országos keresése a
 * német Aranyoldalakon (gelbeseiten.de).
 *
 * ⭐ MIÉRT EZ A MÓDSZER: a kivándorolt kisiparos NÉMETÜL hirdet a német
 * ügyfélnek, tehát a „magyar <szakma>" keresés Google Mapsen NEM találja meg
 * (mérve: 10 lekérdezés → 64 találat → 2 valódi jelölt). A KERESZTNEVE viszont
 * ott van a cégnévben, és a nemzeti cégjegyzék egyetlen lekérdezéssel az egész
 * országot lefedi — teljes címmel, telefonnal és szakma-besorolással.
 * Mérés 2026-08-07: 50 keresztnév → 1246 nyers tétel → 56 felvett cég.
 *
 * ⚠️ Ez FELDERÍTÉS, nem import. A kimenet nyers jelölt-lista, amit
 * `filter-hu-keresztnev.mjs`-szel kell szűrni (KÉT független magyar jel kell),
 * majd Google Mapsen hitelesíteni: az Aranyoldalak BENT TARTJA a megszűnt
 * cégeket (ebben a körben 120-ból 7 véglegesen bezárt volt).
 *
 * Futtatás:  node scripts/cegjegyzek-keresztnev-harvest.mjs nevek.json out.json
 */
import { chromium } from "playwright";
import { writeFileSync, existsSync, readFileSync } from "node:fs";

const nevek = JSON.parse(readFileSync(process.argv[2], "utf8"));
const OUT = process.argv[3];
const eddigi = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
const talalt = new Map(eddigi.map((x) => [x.kulcs, x]));

const b = await chromium.launch();
const ctx = await b.newContext({ locale: "de-DE", viewport: { width: 1500, height: 1000 } });
const p = await ctx.newPage();

for (let i = 0; i < nevek.length; i++) {
  const nev = nevek[i];
  try {
    await p.goto(`https://www.gelbeseiten.de/Suche/${encodeURIComponent(nev)}/Bundesweit`, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    await p.waitForTimeout(1200);
    for (const sel of ['button:has-text("Alle akzeptieren")', "#cmpwelcomebtnyes", 'button:has-text("Akzeptieren")']) {
      const c = p.locator(sel).first();
      if (await c.count()) { await c.click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(900); break; }
    }
    // „Mehr anzeigen” gomb addig, amíg van (max 6-szor = ~200 találat)
    for (let k = 0; k < 6; k++) {
      const tovabb = p.locator('[data-wipe-action="load-more"], button:has-text("Mehr anzeigen"), #mod-LoadMore--button').first();
      if (!(await tovabb.count())) break;
      if (!(await tovabb.isVisible().catch(() => false))) break;
      await tovabb.click({ timeout: 5000 }).catch(() => {});
      await p.waitForTimeout(1400);
    }

    const items = await p.evaluate(() => {
      const ki = [];
      for (const art of Array.from(document.querySelectorAll("article, [class*='mod-Treffer']"))) {
        const cim = art.querySelector("h2, [class*='mod-Treffer__name']");
        if (!cim) continue;
        const t = (s) => (art.querySelector(s)?.textContent || "").replace(/\s+/g, " ").trim();
        ki.push({
          nev: (cim.textContent || "").replace(/\s+/g, " ").trim(),
          cim: t("[data-wipe-name='Adresse'], [class*='mod-AdresseKompakt__adress-text']"),
          tel: t("[data-wipe-name='Telefonnummer'], [class*='mod-TelefonnummerKompakt']"),
          szakma: t(".mod-Treffer--besteBranche"),
          web: art.querySelector(".mod-WebseiteKompakt a[href^='http']")?.href || null,
          reszletek: art.querySelector("a[href*='/gsbiz/']")?.href || null,
        });
      }
      return ki;
    });

    let uj = 0;
    for (const it of items) {
      if (!it.nev) continue;
      const kulcs = (it.nev + "|" + it.cim).toLowerCase();
      if (talalt.has(kulcs)) continue;
      talalt.set(kulcs, { kulcs, keresoszo: nev, ...it });
      uj++;
    }
    console.log(`[${i + 1}/${nevek.length}] ${nev.padEnd(14)} ${String(items.length).padStart(4)} találat  +${uj} új (össz ${talalt.size})`);
  } catch (e) {
    console.log(`! [${i + 1}/${nevek.length}] ${nev} — ${String(e).slice(0, 70)}`);
  }
  writeFileSync(OUT, JSON.stringify([...talalt.values()], null, 1), "utf8");
  await p.waitForTimeout(600);
}
console.log(`\nÖssz: ${talalt.size} → ${OUT}`);
await b.close();
