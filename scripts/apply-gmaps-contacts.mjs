/**
 * apply-gmaps-contacts.mjs — a Google Maps-kutatás jelöltjeiből SQL-előkészítés.
 *
 * ⚠️ NÉGY NORMALIZÁLÁS, mind egy-egy korábbi hibaosztályból:
 *  1) TELEFON nemzetközire, a CSOPORTOSÍTÁS megtartásával („0676 3165255" →
 *     „+43 676 3165255"). A célközönség külföldön él, más előhívóval — helyi
 *     alakban nem hívható. Az összefolyó számjegyek olvashatatlanok.
 *  2) KÖVETŐ-PARAMÉTEREK LEVÁGÁSA: a Maps `?utm_source=…&utm_campaign=…`-t ad
 *     vissza. Ezt tárolni hibás (csúnya, törékeny, és a Google-t követi).
 *  3) GYÖKÉR PREFERÁLÁSA: ha az aloldal (pl. `/booking`) helyett a gyökér is
 *     él, azt tároljuk — rövidebb és tartósabb.
 *  4) HTTPS-MÉRÉS: a `contact-links.ts` a protokoll nélküli címhez MINDIG
 *     https-t told; a csak-HTTP-s oldalak ettől időtúllépést adnának (47 cégnél
 *     előfordult). Ha csak http megy, a TELJES `http://` URL-t tároljuk.
 */
import { readFileSync, writeFileSync } from "node:fs";

const HIVOSZAM = { AT: "43", DE: "49", CH: "41", NL: "31", GB: "44", ES: "34" };
const rows = JSON.parse(readFileSync("gmaps-candidates.json", "utf8"));

function telNorm(tel, orszag) {
  if (!tel) return null;
  const t = tel.trim();
  if (t.startsWith("+")) return t.replace(/\s+/g, " ");
  const cc = HIVOSZAM[orszag];
  if (!cc) return null;
  // a csoportosítást MEGTARTJUK: csak a vezető 0-t cseréljük az ország-kódra
  const nulla = t.replace(/^00/, "+").trim();
  if (nulla.startsWith("+")) return nulla.replace(/\s+/g, " ");
  return `+${cc} ${t.replace(/^0/, "").replace(/\s+/g, " ")}`.trim();
}

async function el(url) {
  try {
    const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(12000) });
    return r.status < 400;
  } catch { return false; }
}

/**
 * ⚠️ Közösségi platformnál az ÚTVONAL az azonosság: a `facebook.com/HULebensmittel`
 * gyökérre rövidítve `facebook.com` lenne — a Facebook kezdőlapja, nem a boltê.
 * Ezeknél SOHA nem rövidítünk.
 */
const SOCIAL = /^(www\.)?(facebook|instagram|tiktok|linkedin|youtube|m\.facebook)\./i;

async function webNorm(raw) {
  if (!raw) return null;
  let host = raw.replace(/^https?:\/\//, "");
  host = host.split("#")[0].split("?")[0].replace(/\/+$/, "");   // követő-paraméter + fragment le
  const gyoker = host.split("/")[0];
  if (SOCIAL.test(gyoker)) {
    if (await el("https://" + host)) return host;
    if (await el("http://" + host)) return "http://" + host;
    return null;
  }
  // 1) a gyökér a preferált, ha él
  if (await el("https://" + gyoker)) return gyoker;
  if (await el("http://" + gyoker)) return "http://" + gyoker;
  // 2) különben a teljes útvonal
  if (host !== gyoker) {
    if (await el("https://" + host)) return host;
    if (await el("http://" + host)) return "http://" + host;
  }
  return null;
}

const out = [];
for (const r of rows) {
  const phone = telNorm(r.phone, r.country_code);
  const web = await webNorm(r.website);
  out.push({ ...r, phoneNorm: phone, webNorm: web });
  console.log(`${r.id}`);
  console.log(`   tel: ${r.phone || "—"}  →  ${phone || "—"}`);
  console.log(`   web: ${(r.website || "—").slice(0, 64)}  →  ${web || "—"}`);
}
writeFileSync("gmaps-normalized.json", JSON.stringify(out, null, 1), "utf8");
const jo = out.filter((r) => r.phoneNorm || r.webNorm).length;
console.log(`\n${jo} tétel kapott elérhetőséget (${out.length} jelöltből) → gmaps-normalized.json`);
