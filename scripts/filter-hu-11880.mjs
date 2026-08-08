/**
 * filter-hu-11880.mjs — a 11880.com-os aratás szűrése.
 *
 * ⚠️ MIÉRT KELL HARMADIK SZŰRŐ: a gelbeseiten TAXONÓMIÁT ad („Dachdeckereien"),
 * amit kulcs szerint le lehet képezni. A 11880 SZABAD SZÖVEGET ad, több szakmát
 * egy sorban: „Landschaftsbau, Garten- und Landschaftspflege & Fensterreinigung".
 * Itt tehát kulcsszóra kell illeszteni — és épp ez a veszélyes rész.
 *
 * ⚠️⚠️ A SORREND SZÁMÍT, mert a német összetett szavak egymásba érnek:
 *   • „Fensterreinigung" (ablaktisztítás) tartalmazza a „Fenster"-t → ablakosnak
 *     minősülne, pedig takarítás.
 *   • „Autolackiererei" tartalmazza a „lackier"-t → szobafestőnek minősülne.
 *   • „Vereinigung" (egyesület) tartalmazza a „reinigung"-ot → takarítócégnek
 *     minősült egy magyar egyházközség (valós hiba 2026-08-07-én).
 * Ezért: (1) a minták a LEGSPECIFIKUSABBTÓL haladnak, az ELSŐ találat nyer,
 * (2) a „reinigung" SZÓHATÁRRAL illeszkedik, (3) a fedő-szavakat előre kizárjuk.
 *
 * A magyar hitelesség-vizsgálat a `filter-hu-vezeteknev.mjs`-ből jön — egy
 * logika, egy helyen.
 *
 * Futtatás: node scripts/filter-hu-11880.mjs nyers.json ki.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { hitelesseg } from "./filter-hu-vezeteknev.mjs";

const BE = process.argv[2];
const KI = process.argv[3];

/**
 * Szabad szövegű szakma → a mi kategóriánk. SORREND-FÜGGŐ: az első illeszkedő
 * minta nyer, ezért a specifikusabb (összetett) szó ELŐBB áll.
 */
const MINTAK = [
  [/autolackier|fahrzeuglackier/i, "autofenyezo", "Autófényező"],
  [/karosserie/i, "karosszeria", "Karosszérialakatos"],
  [/fensterreinigung|glasreinigung|gebäudereinigung|reinigungsservice|\breinigung\b|\breinigungen\b/i, "takarito", "Takarítás"],
  [/schornsteinfeger|kaminkehrer/i, "kemenysepro", "Kéményseprő"],
  [/dachdecker|dachdeckung|bedachung/i, "tetofedo", "Tetőfedő / Ács"],
  [/fliesenleger|fliesen|plattenleger|mosaikleger/i, "burkolo", "Burkoló / Csempéző"],
  [/parkett|bodenleger|bodenbeläge|fußbodenverleg/i, "parkettazas", "Padlóburkolás / Parkettázás"],
  [/\btaxi\b|taxiunternehmen|mietwagen mit fahrer/i, "taxis", "Taxis / Sofőr"],
  [/umzug|umzüge|umzugsunternehmen|möbeltransport/i, "koltoztetes", "Költöztetés"],
  [/wärmedämmung|fassadendämmung/i, "homlokzatszigetelo", "Homlokzatszigetelő / Dryvit"],
  [/isolierung|isolierarbeiten|abdichtung/i, "szigetelo", "Víz- és hőszigetelő"],
  [/bestattung|beerdigung/i, "temetkezes", "Temetkezés"],
  [/trockenbau|gipskarton|akustikbau/i, "fuggesztett_menyezet", "Álmennyezet / Gipszkarton"],
  [/heizung|klimatechnik|klimaanlage|lüftungsbau|kältetechnik/i, "klima", "Klíma / Fűtés"],
  [/polsterei|polstermöbel|raumpolster/i, "karpitos", "Kárpitos"],
  [/goldschmied|juwelier|uhrmacher/i, "ekszer", "Ékszerész / Órás"],
  [/sanitär|installateur|klempner|rohrreinig/i, "gazvez", "Víz-gáz szerelő"],
  [/elektroinstallation|elektrotechnik|elektriker|elektroanlagen/i, "villany", "Villanyszerelő"],
  [/maler|lackierer|tapezier|anstreicher/i, "festo", "Szobafestő / Tapétázó"],
  [/tischler|schreiner|möbelbau/i, "asztalos", "Asztalos"],
  [/gerüstbau/i, "allvanyozo", "Állványozó"],
  [/pflasterarbeiten|straßenbau|tiefbau|pflasterbau/i, "terkovezes", "Térkövezés / Útépítés"],
  [/maurer|bauunternehm|hochbau|rohbau|betonbau/i, "kőműves", "Kőműves / Betonozó"],
  [/sanierung|renovierung|handwerkerservice|montageservice|innenausbau/i, "lakasfelujitas", "Lakásfelújítás / Kivitelezés"],
  [/hausmeister|objektbetreuung/i, "hazaszerkeszto", "Házmester"],
  [/landschaftsbau|gartenpflege|gartenbau|garten- und/i, "kertesz", "Kertészet"],
  [/spedition/i, "szallitmanyozo", "Szállítmányozó / Speditőr"],
  [/kurierdienst|botendienst/i, "futar", "Futárszolgálat"],
  [/transporte|transportunternehmen|güterverkehr/i, "futas", "Fuvarozás"],
  [/schlüsseldienst|schlosser|metallbau|schlosserei/i, "lakatos", "Lakatos"],
  [/schweißtechnik|schweißerei/i, "hegeszto", "Hegesztő / Fémszerkezet"],
  [/kfz|autoreparatur|autowerkstatt|automechanik|autoservice|fahrzeugtechnik/i, "autoszer", "Autószerelő"],
  [/bäckerei|bäcker\b|konditorei/i, "pek", "Pék"],
  [/fußpflege|podolog/i, "pedikur", "Pedikűr / Lábápolás"],
  [/fahrschule/i, "gepijarmu_oktato", "Autósiskola / Oktató"],
  [/fahrrad|zweirad/i, "kerekpar", "Kerékpárszerviz"],
  [/reifen/i, "gumiszerviz", "Gumiszerviz"],
  [/glaserei|glaser\b|glasbau/i, "uveges", "Üveges"],
  [/schuhmacher|schuhreparatur/i, "cipesz", "Cipész / Kulcsmásoló"],
  [/änderungsschneiderei|schneiderei|näherei/i, "varrono", "Varrónő"],
  [/raumausstatt|innenarchitekt/i, "lakberendezes", "Belsőépítészet"],
  [/rollladen|rolladen|jalousie|markise/i, "arnyekolastechnika", "Árnyékolástechnika / Redőny"],
  [/fensterbau|fenstermontage/i, "nyilaszaros", "Nyílászáró / Ablak-ajtó"],
];

function kategoria(szoveg) {
  for (const [minta, id, cimke] of MINTAK) if (minta.test(szoveg)) return [id, cimke];
  return null;
}

/**
 * A 11880 a települést a cím VÉGÉRE is odaírja („…, 06108 Halle (Altstadt), Halle").
 * A duplikált farok zavaró a felhasználónak és a geokódolásnak is.
 */
function cimTisztit(cim) {
  let c = (cim || "").replace(/\s+/g, " ").trim();
  const reszek = c.split(",").map((x) => x.trim()).filter(Boolean);
  if (reszek.length >= 2) {
    const utolso = reszek[reszek.length - 1].toLowerCase();
    const elozo = reszek[reszek.length - 2].toLowerCase();
    if (elozo.includes(utolso)) reszek.pop();
  }
  return reszek.join(", ");
}

const nyers = JSON.parse(readFileSync(BE, "utf8"));
const ki = [];
for (const x of nyers) {
  // ⚠️ MAGÁNSZEMÉLY-SOR: a 11880 külön „Personeneinträge" sávot kínál. Ez nem
  // cég, és magánszemély lakcíme/telefonja SOHA nem kerülhet a szaknévsorba.
  if (/personeneinträge/i.test(x.nev || "")) continue;
  const m = kategoria(x.szakma || "");
  if (!m) continue;
  if (!x.tel || x.tel.replace(/\D/g, "").length < 7) continue;
  const cim = cimTisztit(x.cim);
  if (!/\b\d{5}\b/.test(cim)) continue; // irányítószám nélkül nincs régió
  const h = hitelesseg(x.nev || "");
  if (!h.elfogad) continue;
  ki.push({ ...x, cim, kategoria: m[0], kategoria_cimke: m[1], pont: h.pont, okok: h.okok });
}
ki.sort((a, b) => b.pont - a.pont || a.kategoria.localeCompare(b.kategoria));
writeFileSync(KI, JSON.stringify(ki, null, 1), "utf8");

const cnt = {};
for (const x of ki) cnt[x.kategoria] = (cnt[x.kategoria] || 0) + 1;
console.log(`${nyers.length} nyers → ${ki.length} elfogadott jelölt`);
console.log(
  Object.entries(cnt)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}:${v}`)
    .join("  "),
);
