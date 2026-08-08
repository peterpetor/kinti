/**
 * cegjegyzek-searchch-harvest.mjs — magyar név keresése a svájci search.ch-n.
 *
 * ⚠️⚠️ EZ TELEFONKÖNYV, NEM CÉGJEGYZÉK. Magánszemélyek is benne vannak, és
 * magánszemély lakcíme/telefonja SOHA nem kerülhet a szaknévsorba. Szerencsére
 * a lap KÉT FÜGGETLEN üzleti jelet ad, és mindkettőt megköveteljük:
 *   1. `.tel-categories` — szakma-megjelölés; magánszemélynél EGYÁLTALÁN NINCS
 *   2. `a.tel-callable[data-entrytype="Business"]` — explicit típus-jelölés
 * Mérve: „Dr Perrelet-Szabo Isabelle" (magánszemély) egyiket sem hordozza,
 * a „Szabo Haustechnik" mindkettőt.
 *
 * ⭐ AMI ITT JOBB, MINT A NÉMET FORRÁSOKNÁL: a cím eleve tartalmazza a
 * KANTON-KÓDOT (`.region`), tehát nincs szükség irányítószám → régió térképre,
 * ami a német oldalon két mért hibát okozott (Zweibrücken, Lindau).
 *
 * ⚠️ A találati sor DUPLÁN szerepel a DOM-ban: az `article.tel-resultentry`
 * belsejében van egy azonos osztályú `table` is. Csak az `article`-t vesszük.
 *
 * Futtatás: node scripts/cegjegyzek-searchch-harvest.mjs nevek.json out.json
 */
import { chromium } from "playwright";
import { writeFileSync, existsSync, readFileSync } from "node:fs";

const nevek = JSON.parse(readFileSync(process.argv[2], "utf8"));
const OUT = process.argv[3];
/** Hány találati oldalt kérünk le nevenként (10 tétel/oldal). */
const OLDALAK = Number(process.argv[4] || 4);

const eddigi = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
const talalt = new Map(eddigi.map((x) => [x.kulcs, x]));

const b = await chromium.launch();
const ctx = await b.newContext({ locale: "de-CH", viewport: { width: 1400, height: 950 } });
const p = await ctx.newPage();
let cookieKesz = false;

for (let i = 0; i < nevek.length; i++) {
  const nev = nevek[i];
  let ujOsszesen = 0;
  let talalatOsszesen = 0;
  for (let oldal = 0; oldal < OLDALAK; oldal++) {
    try {
      // ⚠️ A LAPOZÓ PARAMÉTER `pos`, NEM `start`/`page`/`pageNumber`. Mérve:
      // a másik három NÉMÁN ugyanazt az első oldalt adja vissza, tehát a futás
      // háromszor aratja le ugyanazt a 10 tételt, és „talált 30"-at jelent.
      // A „Mehr" gomb sem lapoz — az egy menü, kattintásra nem tölt be újat.
      const u = `https://tel.search.ch/?was=${encodeURIComponent(nev)}${oldal ? `&pos=${oldal * 10}` : ""}`;
      await p.goto(u, { waitUntil: "domcontentloaded", timeout: 60000 });
      await p.waitForTimeout(1200);
      if (!cookieKesz) {
        for (const sel of ["#onetrust-accept-btn-handler", 'button:has-text("Akzeptieren")', 'button:has-text("Einverstanden")']) {
          const c = p.locator(sel).first();
          if (await c.count()) {
            await c.click({ timeout: 4000 }).catch(() => {});
            await p.waitForTimeout(1200);
            break;
          }
        }
        cookieKesz = true;
      }

      const items = await p.evaluate(() => {
        const t = (el, sel) => (el.querySelector(sel)?.textContent || "").replace(/\s+/g, " ").trim();
        const ki = [];
        for (const sor of Array.from(document.querySelectorAll("article.tel-resultentry"))) {
          const nev = t(sor, "h1 a");
          if (!nev) continue;
          const telElem = sor.querySelector("a.tel-callable");
          ki.push({
            nev,
            szakma: t(sor, ".tel-categories"),
            utca: (sor.querySelector(".tel-address")?.childNodes[0]?.textContent || "").replace(/[\s,]+$/, "").trim(),
            irsz: t(sor, ".postal-code"),
            telepules: t(sor, ".locality"),
            kanton: t(sor, ".region"),
            tel: telElem?.textContent?.replace(/\s+/g, " ").trim() || "",
            // ⚠️ EZ A MAGÁNSZEMÉLY-SZŰRŐ MÁSODIK JELE.
            tipus: telElem?.getAttribute("data-entrytype") || "",
          });
        }
        return ki;
      });
      if (!items.length) break; // nincs több oldal
      talalatOsszesen += items.length;
      for (const it of items) {
        const kulcs = (it.nev + "|" + it.utca + "|" + it.irsz).toLowerCase();
        if (talalt.has(kulcs)) continue;
        talalt.set(kulcs, { kulcs, keresoszo: nev, ...it });
        ujOsszesen++;
      }
      await p.waitForTimeout(400);
    } catch (e) {
      console.log(`! ${nev} (oldal ${oldal}) — ${String(e).slice(0, 60)}`);
      break;
    }
  }
  console.log(
    `[${i + 1}/${nevek.length}] ${nev.padEnd(14)} ${String(talalatOsszesen).padStart(3)} találat  +${ujOsszesen} új (össz ${talalt.size})`,
  );
  writeFileSync(OUT, JSON.stringify([...talalt.values()], null, 1), "utf8");
}
console.log(`\nÖssz: ${talalt.size} → ${OUT}`);
await b.close();
