/**
 * cegjegyzek-11880-harvest.mjs — magyar név keresése a 11880.com-on.
 *
 * ⭐ MIÉRT EZ A MÁSODIK FORRÁS: a gelbeseiten.de és a 11880.com KÜLÖN adatbázis.
 * Mérve 2026-08-07: a gelbeseiten telítődése után (1454 új nyers → 2 jelölt) a
 * 11880 ugyanazzal a névkészlettel 72 új jelöltet adott.
 *
 * ⚠️ NE KATTINTS a „Mehr anzeigen"-re: elnavigál a találati listáról, és a
 * futás NULLA tétellel zárul (mérve). Az első oldal ~30 találata elég.
 *
 * ⚠️ A kimenet NYERS jelölt-lista, nem import. Szűrni kell
 * (`filter-hu-vezeteknev.mjs` / `filter-hu-keresztnev.mjs`), majd Google
 * Mapsen KÉT szűrővel hitelesíteni (`verify-strict-match.mjs`) — a cégjegyzék
 * bent tartja a megszűnt cégeket is.
 *
 * Futtatás:  node scripts/cegjegyzek-11880-harvest.mjs nevek.json out.json
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
    const [szo, hol] = nev.split("|");
    await p.goto(
      `https://www.11880.com/suche/${encodeURIComponent(szo)}/${encodeURIComponent(hol || "deutschland")}`,
      { waitUntil: "domcontentloaded", timeout: 90000 },
    );
    await p.waitForTimeout(1400);
    for (const sel of [
      'button:has-text("Alle akzeptieren")',
      'button:has-text("Akzeptieren")',
      "#didomi-notice-agree-button",
      'button[aria-label*="Zustimmen"]',
    ]) {
      const c = p.locator(sel).first();
      if (await c.count()) {
        await c.click({ timeout: 3000 }).catch(() => {});
        await p.waitForTimeout(900);
        break;
      }
    }

    // ⚠️ MÉRT SZELEKTOROK (2026-08-08). A kártya `li.search-result-list-item`;
    // a nevet ATTRIBÚTUM hordozza (`data-name`), a szakma szabad szöveg a
    // `.trades-list`-ben, a cím KÉT elemre bontva (utca + település), és
    // ⚠️ IRÁNYÍTÓSZÁM NINCS a találati listán — azt geokódolásból pótoljuk.
    // ⚠️ A `--info` osztályú sor NEM cég: „Es wurden auch N Personeneinträge…"
    // — MAGÁNSZEMÉLYEK, ezek soha nem kerülhetnek a szaknévsorba.
    const items = await p.evaluate(() => {
      // ⚠️ A whitespace-minta `\s`, NEM `s`: az utóbbi minden „s" betűt kitörölne
      // a szövegből („Landschaftsbau" → „Landchaftbau"). Egyszer így ment ki.
      const t = (el, sel) => (el.querySelector(sel)?.textContent || "").replace(/\s+/g, " ").trim();
      const ki = [];
      for (const kartya of Array.from(document.querySelectorAll("li.search-result-list-item"))) {
        const nev = kartya.getAttribute("data-name") || t(kartya, ".result-list-entry-title__headline");
        if (!nev) continue;
        const utca = t(kartya, ".result-list-entry-address");
        const telepules = t(kartya, ".js-address-locality");
        ki.push({
          nev,
          cim: [utca, telepules].filter(Boolean).join(", "),
          tel: t(kartya, ".result-list-entry-phone-number__label") || t(kartya, ".result-list-entry-phone-number"),
          szakma: t(kartya, ".trades-list"),
          web: kartya.querySelector("a[href^='http']:not([href*='11880'])")?.href || null,
        });
      }
      return ki;
    });

    let uj = 0;
    for (const it of items) {
      const kulcs = (it.nev + "|" + it.cim).toLowerCase();
      if (talalt.has(kulcs)) continue;
      talalt.set(kulcs, { kulcs, keresoszo: nev, ...it });
      uj++;
    }
    console.log(
      `[${i + 1}/${nevek.length}] ${nev.padEnd(14)} ${String(items.length).padStart(3)} találat  +${uj} új (össz ${talalt.size})`,
    );
  } catch (e) {
    console.log(`! [${i + 1}/${nevek.length}] ${nev} — ${String(e).slice(0, 70)}`);
  }
  writeFileSync(OUT, JSON.stringify([...talalt.values()], null, 1), "utf8");
  await p.waitForTimeout(500);
}
console.log(`\nÖssz: ${talalt.size} → ${OUT}`);
await b.close();
