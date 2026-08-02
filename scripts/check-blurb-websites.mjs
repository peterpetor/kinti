/**
 * check-blurb-websites.mjs — a szaknévsorban szereplő weboldalak életjel-ellenőrzése.
 *
 * A weboldal a `blurb` végén, PROTOKOLL NÉLKÜL áll („… · maosz.org.uk"), lásd
 * `lib/contact-links.ts` → `extractContactFromBlurb`. Sok tételnél ez az EGYETLEN
 * elérhetőség — ha meghal, a tétel zsákutcává válik anélkül, hogy bármi jelezné.
 *
 * ⚠️⚠️ A HTTP-STÁTUSZ ÖNMAGÁBAN NEM ELÉG. 2026-08-03-án három különböző módon
 * adott 200-at egy halott cím:
 *   • `paprikagourmet.com` → hugedomains.com eladó-oldal
 *   • `balint.at`          → Nameshift „Buy this domain"
 *   • `gastrovinumfuengirola.com` → „website has expired" tárhely-üzenet
 * Ezért a TARTALMAT is nézzük, nem csak a kódot. Ld. [[directory-candidate-death-modes]].
 *
 * Kimenet: JSON a gyanús tételekről. ⚠️ Ez FELDERÍTÉS, nem automatikus javítás —
 * a találatokat egyenként kell eldönteni (a cég élhet úgy is, hogy a site meghalt).
 */
import { readFileSync, writeFileSync } from "node:fs";

const BE = process.argv[2] || "weburls.json";
const KI = process.argv[3] || "web-dead.json";
const PARHUZAM = 12;
const IDOTULLEPES = 15000;

/** Parkoltatás / lejárat jelei a lap SZÖVEGÉBEN. */
const PARKOLT =
  /(hugedomains|sedo\.com|afternic|dan\.com|nameshift|domain (is )?for sale|buy this domain|diese domain (steht )?zum verkauf|deze domeinnaam|website has expired|account suspended|coming soon|under construction|parkingcrew|bodis\.com)/i;

async function ellenoriz(t) {
  const url = t.url.startsWith("http") ? t.url : "https://" + t.url;
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), IDOTULLEPES);
  try {
    const r = await fetch(url, { redirect: "follow", signal: ac.signal, headers: { "User-Agent": "Mozilla/5.0 (compatible; kinti-linkcheck/1.0)" } });
    const szoveg = (await r.text().catch(() => "")).slice(0, 20000);
    clearTimeout(id);
    const parkolt = PARKOLT.test(szoveg);
    return { ...t, kod: r.status, parkolt, vegsoUrl: r.url !== url ? r.url : undefined };
  } catch (e) {
    clearTimeout(id);
    // Sok kisvállalkozói oldal csak http-n él — a https bukása még nem halál.
    if (url.startsWith("https://")) {
      try {
        const r2 = await fetch("http://" + t.url.replace(/^https?:\/\//, ""), { redirect: "follow", signal: AbortSignal.timeout(IDOTULLEPES) });
        return { ...t, kod: r2.status, parkolt: false, csakHttp: true };
      } catch {}
    }
    return { ...t, kod: 0, hiba: String(e.name || e).slice(0, 40) };
  }
}

const sorok = JSON.parse(readFileSync(BE, "utf8"));
const eredmeny = [];
for (let i = 0; i < sorok.length; i += PARHUZAM) {
  const batch = sorok.slice(i, i + PARHUZAM);
  eredmeny.push(...(await Promise.all(batch.map(ellenoriz))));
  if ((i / PARHUZAM) % 5 === 0) console.log(`  ${Math.min(i + PARHUZAM, sorok.length)}/${sorok.length}`);
}

const halott = eredmeny.filter((x) => x.kod === 0);
const hibas = eredmeny.filter((x) => x.kod >= 400);
const parkolt = eredmeny.filter((x) => x.parkolt);
const jo = eredmeny.filter((x) => x.kod >= 200 && x.kod < 400 && !x.parkolt);

console.log(`\n✓ ${jo.length} él   ⛔ ${halott.length} nem oldódik fel   ⚠️ ${hibas.length} hibakód   🅿️ ${parkolt.length} PARKOLTATVA`);
writeFileSync(KI, JSON.stringify({ halott, hibas, parkolt }, null, 1), "utf8");
for (const x of [...halott, ...hibas, ...parkolt]) {
  console.log(`  ${String(x.kod).padStart(3)}${x.parkolt ? " 🅿️" : "   "} ${x.cc} ${x.name.slice(0, 40).padEnd(42)} ${x.url}`);
}
