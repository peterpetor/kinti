/**
 * recheck-websites-browser.mjs — a gyanús linkek ÚJRAELLENŐRZÉSE VALÓDI BÖNGÉSZŐVEL.
 *
 * ⚠️⚠️ MIÉRT KELL EZ A MÁSODIK KÖR: a `check-blurb-websites.mjs` sima `fetch`-et
 * használ, és a találatai MINDKÉT IRÁNYBAN hazudhatnak:
 *   • 403 / 503 / 401 → többnyire BOT-VÉDELEM (Cloudflare/WAF), az oldal ÉL.
 *     Ha ezek alapján törölnék linket, ÉLŐ weboldalakat vennék ki.
 *   • egyetlen sikertelen DNS-lekérés még lehet átmeneti hiba is.
 * Böngészővel (valódi user-agent, JS, TLS-ujjlenyomat) ezek nagy része átmegy.
 *
 * Csak azt tekintjük HALOTTNAK, ami BÖNGÉSZŐVEL SEM jön be.
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const j = JSON.parse(readFileSync(process.argv[2] || "web-dead.json", "utf8"));
const sorok = [...j.halott, ...j.hibas, ...j.parkolt];
const PARKOLT =
  /(hugedomains|sedo\.com|afternic|dan\.com|nameshift|domain (is )?for sale|buy this domain|zum verkauf|website has expired|account suspended|parkingcrew|bodis\.com)/i;

const b = await chromium.launch();
const out = [];

/**
 * ⚠️⚠️ MINDEN URL-HEZ ÚJ LAP (sőt új kontextus). Az első változat EGYETLEN
 * lapot használt újra mind a 104 címre — és a sok sikertelen navigáció után a
 * lap beragadt: onnantól MINDEN cím „halott" lett, köztük olyanok is, amikről
 * kézzel ellenőrizve kiderült, hogy 200-at adnak (amigohungaro.es).
 * 104/104 bukás egy vegyes halmazon = a MÉRŐESZKÖZ hibás, nem az adat.
 * A hibaüzenetet ezért ki is írjuk, hogy egy ilyen csendes torzulás látszódjon.
 */
for (let i = 0; i < sorok.length; i++) {
  const t = sorok[i];
  const url = t.url.startsWith("http") ? t.url : "https://" + t.url;
  let allapot = "HALOTT", kod = 0, parkolt = false, hiba;
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, ignoreHTTPSErrors: true });
  const p = await ctx.newPage();
  try {
    const r = await p.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    kod = r ? r.status() : 0;
    const szoveg = await p.evaluate(() => document.body?.innerText?.slice(0, 4000) || "").catch(() => "");
    parkolt = PARKOLT.test(szoveg);
    if (kod >= 200 && kod < 400 && !parkolt) allapot = "ÉL";
    else if (parkolt) allapot = "PARKOLT";
    else allapot = "HIBA-" + kod;
  } catch (e) {
    hiba = String(e).split("\n")[0].slice(0, 70);
  }
  await ctx.close().catch(() => {});
  out.push({ ...t, allapot, ujKod: kod, parkolt, hiba });
  console.log(`${allapot.padEnd(9)} ${t.cc} ${t.name.slice(0, 34).padEnd(36)} ${t.url.slice(0, 38).padEnd(40)} ${hiba || ""}`);
}

writeFileSync(process.argv[3] || "web-recheck.json", JSON.stringify(out, null, 1), "utf8");
const halott = out.filter((x) => x.allapot === "HALOTT");
const parkoltak = out.filter((x) => x.allapot === "PARKOLT");
console.log(`\n⛔ ${halott.length} VALÓBAN halott   🅿️ ${parkoltak.length} parkolt   ✓ ${out.filter((x) => x.allapot === "ÉL").length} mégis él`);
await b.close();
