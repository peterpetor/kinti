/**
 * osm-kisipar-harvest.mjs — magyar nevű KISIPAROSOK az OpenStreetMapból.
 *
 * ⭐ MIÉRT EZ AZ IRÁNY: a nemzeti cégjegyzékek Ausztriában mind zárva vannak
 * (herold.at fejetlen böngészővel nem kereshető, `firmen.wko.at` 403,
 * `firmenabc.at` 429 majd 404, `cylex.at` 403). Az OSM viszont nyílt, és a
 * kisiparra KÜLÖN CÍMKE-CSALÁDJA van: `craft=*`. Ez egy eddig nem próbált
 * tengely — a korábbi OSM-aratások éttermet kerestek (`cuisine=hungarian`).
 *
 * ⚠️ AZ OSM-BEN A NÉV-EGYEZÉS ÖNMAGÁBAN GYENGE JEL. A `name` szabad szöveg, és
 * a korábbi étterem-körben a „Gulaschkanone" (általános német mezei-konyha)
 * hamis pozitívként jött be. Ezért a kimenet itt is CSAK jelölt-lista: a
 * magyar hitelesség-szűrő és a Maps-hitelesítés utána következik.
 *
 * ⚠️ ELÉRHETŐSÉG KÖTELEZŐ: az OSM-tételek nagy részén nincs telefon. Csak az
 * marad, ahol van telefon VAGY teljes utca+házszám+település.
 *
 * ⚠️ Az Overpass IP-alapon korlátoz: egy lekérdezés/ország, köztük szünettel.
 *
 * Futtatás: node scripts/osm-kisipar-harvest.mjs AT,CH,DE out.json
 */
import { writeFileSync } from "node:fs";

const ORSZAGOK = (process.argv[2] || "AT").split(",").map((x) => x.trim().toUpperCase());
const OUT = process.argv[3] || "osm-kisipar.json";

/**
 * A magyar vezetéknevek, amelyekre az Overpass `name`-regexe illeszt.
 *
 * ⚠️⚠️ ÉKEZET NÉLKÜL, SZÁNDÉKOSAN. Mérve: ha a listában ékezetes alak is van
 * („Szabó", „Kovács"), az Overpass NÉMÁN NULLA elemet ad vissza az EGÉSZ
 * lekérdezésre — nem hibát, hanem üres eredményt. Ugyanaz a lekérdezés ékezet
 * nélkül 13 elemet adott. A `,i` kapcsoló kis-nagybetűre süket, ékezetre nem.
 *
 * ⚠️ Csak azok a nevek, amelyek helyesírása gyakorlatilag csak magyar lehet —
 * ugyanaz az elv, mint a `filter-hu-vezeteknev.mjs` SZIGORU listájánál.
 */
const NEVEK = [
  "Szabo", "Kovacs", "Toth", "Horvath", "Nemeth", "Takacs", "Meszaros", "Szilagyi", "Feher",
  "Szucs", "Kocsis", "Pinter", "Hegedus", "Gulyas", "Lukacs", "Szanto", "Kertesz", "Csordas",
  "Borbely", "Dudas", "Pasztor", "Juhasz", "Balogh", "Papp", "Kiraly", "Somogyi", "Sipos",
  "Balazs", "Torok", "Hajdu", "Racz", "Olah", "Bognar", "Illes", "Vincze", "Biro", "Vamos",
  "Nagy", "Varga", "Molnar", "Fodor", "Kelemen", "Fulop", "Farkas", "Csiszar", "Gyori",
  "Lorincz", "Madarasz", "Kaszas", "Szekely", "Zsoldos", "Ujvari", "Halasz", "Revesz", "Vago",
  "Voros", "Banyai", "Bartha", "Erdelyi", "Deak", "Magyar", "Ferencz", "Mezei", "Pataki",
  "Kozma", "Kardos", "Kerekes", "Dobos",
];

/** OSM `craft`/`shop` értékek → a mi kategóriánk. */
const CRAFT = {
  carpenter: ["asztalos", "Asztalos"],
  joiner: ["asztalos", "Asztalos"],
  cabinet_maker: ["asztalos", "Asztalos"],
  plumber: ["gazvez", "Víz-gáz szerelő"],
  electrician: ["villany", "Villanyszerelő"],
  painter: ["festo", "Szobafestő / Tapétázó"],
  roofer: ["tetofedo", "Tetőfedő / Ács"],
  tiler: ["burkolo", "Burkoló / Csempéző"],
  gardener: ["kertesz", "Kertészet"],
  shoemaker: ["cipesz", "Cipész / Kulcsmásoló"],
  tailor: ["varrono", "Varrónő"],
  dressmaker: ["varrono", "Varrónő"],
  glaziery: ["uveges", "Üveges"],
  locksmith: ["lakatos", "Lakatos"],
  hvac: ["klima", "Klíma / Fűtés"],
  floorer: ["parkettazas", "Padlóburkolás / Parkettázás"],
  plasterer: ["fuggesztett_menyezet", "Álmennyezet / Gipszkarton"],
  stonemason: ["kőműves", "Kőműves / Betonozó"],
  bricklayer: ["kőműves", "Kőműves / Betonozó"],
  metal_construction: ["lakatos", "Lakatos"],
  upholsterer: ["karpitos", "Kárpitos"],
  window_construction: ["nyilaszaros", "Nyílászáró / Ablak-ajtó"],
  chimney_sweeper: ["kemenysepro", "Kéményseprő"],
  insulation: ["szigetelo", "Víz- és hőszigetelő"],
  scaffolder: ["allvanyozo", "Állványozó"],
  jeweller: ["ekszer", "Ékszerész / Órás"],
  sun_protection: ["arnyekolastechnika", "Árnyékolástechnika / Redőny"],
  bakery: ["pek", "Pék"],
  caterer: ["etterem", "Étterem"],
};
const SHOP = {
  car_repair: ["autoszer", "Autószerelő"],
  bakery: ["pek", "Pék"],
  shoe_repair: ["cipesz", "Cipész / Kulcsmásoló"],
  tyres: ["gumiszerviz", "Gumiszerviz"],
  bicycle: ["kerekpar", "Kerékpárszerviz"],
  hairdresser: null, // NEM rés-szakma
};

const alszik = (ms) => new Promise((r) => setTimeout(r, ms));

/** ⚠️ A regexben az OSM `name` mezőjét vizsgáljuk, kis-nagybetű-érzéketlenül. */
const nevRegex = [...new Set(NEVEK)].join("|");

/**
 * ⚠️ A `craft` és a `shop` ág KÜLÖN lekérdezés. Egy unióba téve az Overpass
 * HTTP 504-re fut (mérve) — a két külön kérés viszont másodpercek alatt lefut.
 */
async function lekerdez(cc, szures) {
  const q = `[out:json][timeout:180];
area["ISO3166-1"="${cc}"][admin_level=2]->.a;
nwr${szures}["name"~"${nevRegex}",i](area.a);
out center tags;`;
  const r = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // ⚠️ User-Agent NÉLKÜL az Overpass HTTP 406-ot ad (mérve).
      "User-Agent": "kinti.app szaknevsor seed (snyggdam@gmail.com)",
    },
    body: "data=" + encodeURIComponent(q),
  });
  if (!r.ok) throw new Error("Overpass HTTP " + r.status);
  return r.json();
}

const ki = [];
for (const cc of ORSZAGOK) {
  try {
    const agak = ['["craft"]', '["shop"~"^(car_repair|bakery|shoe_repair|tyres|bicycle)$"]'];
    const elemek = [];
    for (const ag of agak) {
      const rj = await lekerdez(cc, ag);
      elemek.push(...(rj.elements || []));
      await alszik(3000);
    }
    const j = { elements: elemek };
    let elfogad = 0;
    for (const el of j.elements || []) {
      const t = el.tags || {};
      const m = t.craft ? CRAFT[t.craft] : t.shop ? SHOP[t.shop] : null;
      if (!m) continue;
      const tel = t.phone || t["contact:phone"] || t["contact:mobile"] || "";
      const utca = t["addr:street"];
      const hsz = t["addr:housenumber"];
      const varos = t["addr:city"];
      const irsz = t["addr:postcode"];
      // ⚠️ Elérhetőség NÉLKÜL zsákutca: kell telefon VAGY teljes cím.
      const vanCim = Boolean(utca && hsz && varos);
      if (!tel && !vanCim) continue;
      ki.push({
        orszag: cc,
        osm: `${el.type}/${el.id}`,
        nev: t.name,
        kategoria: m[0],
        kategoria_cimke: m[1],
        craft: t.craft || t.shop,
        cim: vanCim ? `${utca} ${hsz}, ${irsz ? irsz + " " : ""}${varos}` : "",
        tel,
        web: t.website || t["contact:website"] || null,
        lat: el.lat ?? el.center?.lat ?? null,
        lng: el.lon ?? el.center?.lon ?? null,
      });
      elfogad++;
    }
    console.log(`${cc}: ${(j.elements || []).length} nyers OSM-elem → ${elfogad} elérhetőséggel`);
  } catch (e) {
    console.log(`${cc}: HIBA — ${String(e).slice(0, 80)}`);
  }
  await alszik(4000); // ⚠️ Overpass IP-korlát
}

writeFileSync(OUT, JSON.stringify(ki, null, 1), "utf8");
console.log(`\nÖssz: ${ki.length} → ${OUT}`);
