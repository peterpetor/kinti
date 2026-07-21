// scripts/prepare-business-import.mjs
//
// A scripts/businesses.csv-ből legenerálja a scripts/import_businesses.sql-t a
// VALÓDI businesses-séma szerint (canton_code, blurb, lat/lng, pin_x/pin_y,
// source stb.), kategória-leképezéssel a kanonikus categories ID-kre, és
// régió/koordináta-feloldással a városból. moderation_status=1 (jóváhagyva,
// azonnal látszik), claimed=0 (a tulaj átveheti). Idempotens (INSERT OR IGNORE,
// determinisztikus id). Futtatás:  node scripts/prepare-business-import.mjs
// Élesítés:  npx wrangler d1 execute kinti-db --remote --file=scripts/import_businesses.sql

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_FILE = path.join(__dirname, "businesses.csv");
const SQL_OUTPUT = path.join(__dirname, "import_businesses.sql");

// RFC4180-szerű CSV-parser: idézőjeles mezők (vesszővel), "" = escaped idézőjel.
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      if (field !== "" || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).filter((r) => r.some((v) => v.trim() !== "")).map((r) => {
    const o = {}; headers.forEach((h, i) => (o[h] = (r[i] ?? "").trim())); return o;
  });
}

// CSV category_id → [kanonikus categories.id, megjelenített címke].
// A kanonikus ID-k a prod `categories` tábla ellen ellenőrizve; ahol a CSV ID
// nem létezik, a legközelebbi valódi kategóriára képezve (de a CÍMKE a tényleges
// szakma marad).
const CATEGORY = {
  fodrasz: ["fodrasz", "Fodrász"],
  fogorvos: ["fogorvos", "Fogorvos"],
  ugyved: ["ugyved", "Ügyvéd"],
  konyvelo: ["konyveles", "Könyvelés"],
  nogyogyasz: ["nogyogyasz", "Nőgyógyász / Szülész"],
  autoszerelo: ["autoszer", "Autószerelő"],
  pszichologus: ["pszichologus", "Pszichológus / Coach"],
  haziorvos: ["orvos", "Háziorvos"],
  gyermekgyogyasz: ["gyermekorvos", "Gyermekorvos"],
  fordito: ["fordito", "Fordító"],
  etterem: ["etterem", "Étterem"],
  kozmetikus: ["szepseg", "Kozmetikus"],
  szemelyiedzo: ["szemelyi_edzo", "Személyi edző"],
  biztosito: ["biztositas", "Biztosítás"],
  // 2026-07-03: van már `elelmiszer` kategória (a generált SQL hozza létre,
  // INSERT OR IGNORE) — a magyar boltok a szaknévsorban kereshetők, ahogy a
  // /magyarbolt kivezetésekor a döntés szólt.
  elelmiszerbolt: ["elelmiszer", "Élelmiszerbolt"],
  // "bolt" alias — a CSV-ben így is szerepel; a kulcs hiánya miatt 14 bolt-sor
  // csendben kimaradt a korábbi importokból (2026-07-04-ig).
  bolt: ["elelmiszer", "Élelmiszerbolt"],
  allatorvos: ["allatorvos", "Állatorvos"],
  borgyogyasz: ["borgyogyasz", "Bőrgyógyász"],
  // 2026-07-04: a CSV-ben régóta használt, de eddig leképezetlen kulcsok —
  // 42 sor (orvosok, pékségek, takarítók, szerelők…) maradt ki emiatt minden
  // korábbi importból. Kanonikus ID-k a prod `categories` ellen ellenőrizve.
  orvos: ["orvos", "Orvos"],
  pekseg: ["pek", "Pékség"],
  festo: ["festo", "Szobafestő"],
  takaritas: ["takarito", "Takarítás"],
  fuvarozas: ["futas", "Fuvarozás"],
  vizszerelo: ["gazvez", "Víz-gáz szerelő"],
  villanyszerelo: ["villany", "Villanyszerelő"],
  szabo: ["varrono", "Varrónő"],
  autosiskola: ["gepijarmu_oktato", "Autósiskola / Oktató"],
  kerekparszerelo: ["kerekpar", "Kerékpárszerviz"],
  cukraszda: ["cukrasz", "Cukrász / Torták"],
  belsoepitesz: ["lakberendezes", "Belsőépítészet"],
  manikurpedikur: ["manikur", "Manikűr / Műköröm"],
  tolmacs: ["nemet_tolmacs", "Tolmács / Konferenciatolmács"],
  penzugyitanacsadas: ["penzugyi_tanacsado", "Pénzügyi tanácsadó"],
  adotanacsado: ["adotanacsado", "Adótanácsadó"],
  napelemszerelo: ["solar_technikus", "Napelem technikus / Szerelő"],
  kutyafodrasz: ["kutyafodrasz", "Kutyafodrász"],
  kozjegyzo: ["kozjegyzo", "Közjegyző"],
  autokereskedes: ["autokereskedes", "Autókereskedés"],
  karszakerto: ["karszakerto", "Kárszakértő"],
  hotelpanzio: ["szallas", "Szálláshely / Panzió"],
  szemesz: ["szemesz", "Szemész / Optikus"],
  masszazs: ["masszazs", "Masszázs"],
  legkondiszerelo: ["haztartasigep_szerelo", "Háztartásigép- / Légkondiszerelő"],
  ortopedus: ["ortopedus", "Ortopédorvos / Sebész"],
  pszichiater: ["pszichiater", "Pszichiáter"],
  sebesz: ["sebesz", "Sebész"],
  urologus: ["urologus", "Urológus"],
  belgyogyasz: ["belgyogyasz", "Belgyógyász"],
  fulorrgege: ["fül_orr_gege", "Fül-orr-gégész"],
  ideggyogyasz: ["epileptologus", "Neurológus / Ideggyógyász"],
  pedikur: ["pedikur", "Pedikűr / Lábápolás"],
  gyogyszeresz: ["gyogyszeresz", "Gyógyszerész"],
  komuves: ["kőműves", "Kőműves"],
  kertesz: ["kertesz", "Kertész"],
  felujitas: ["lakasfelujitas", "Felújítás / Kivitelezés"],
  epites: ["epitoipar", "Építőipar"],
  fizioterap: ["gyogytornasz", "Fizioterapeuta"],
  allatgyogyasz: ["allatorvos", "Állatorvos"],
  alternativgyogyasz: ["termeszetgyogyasz", "Természetgyógyász"],
  ingatlan: ["ingatlan", "Ingatlan"],
  it: ["it", "Informatikus"],
  // 2026-07-21 (16. kör, OSM regionális harvest): a `husszek`/`kavez`/
  // `zoldseges` KANONIKUS kategóriák már léteztek a `categories` táblában
  // (a régi harvest-osm-hu-biz.mjs / db/seed-osm-biz.sql pipeline hozta létre),
  // de a CSV-importos útnak eddig nem volt hozzájuk alias-kulcsa — az ilyen
  // category_id-jú sorok csendben kimaradtak volna (ugyanaz a hibaosztály,
  // mint a korábbi bolt/orvos-hiányok).
  hentes: ["husszek", "Hentes / Húsbolt"],
  kavezo: ["kavez", "Kávézó / Cukrászda"],
  zoldseges: ["zoldseges", "Zöldséges / Hofladen"],
};

// Város (kisbetűs részlet) → [régiókód, lat, lng].
const CITY = {
  // Ezt a kettőt ELŐRE kell venni: a kulcsuk másik, később definiált kulcs
  // ALSTRINGJE is (pl. "bellinzona" tartalmazza a "linz" szót) — a resolveCity
  // az ELSŐ substring-találatot fogadja el, sorrend-függő, ezért muszáj előbbre.
  "altdorf ur": ["UR", 46.8781, 8.6431], // Altdorf UR (nem a bajor Altdorf bei Landshut)
  "bellinzona": ["TI", 46.1944, 9.0175], // ne a "linz" (AT) kulcs egyezzen bele
  // Élő bug volt: "überlingen" tartalmazza a "berlin" alstringet → BW-s orvos
  // Berlin (BE) régiókódot kapott. Előre kell venni, hogy előbb saját magára illeszkedjen.
  "überlingen": ["BW", 47.7686, 9.1758],
  "münchenstein": ["BL", 47.5219, 7.6236], // ne a "münchen" (DE) kulcs egyezzen bele
  "wiener neustadt": ["NOE", 47.8151, 16.2436], // ne a "wien"/"bécs" (W) kulcs egyezzen bele — más tartomány!
  // 2026-07-16: "Bernstein" (Burgenland) tartalmazza a "bern" (CH) alstringet;
  // "Baden bei Wien" (NOE) tartalmazza a "wien"-t ÉS a "baden" (CH, AG) kulcsot is —
  // mindkettő élő bug volt (rossz kanton/canton_code egy valós AT orvosnál).
  "bernstein": ["BGL", 47.4056116, 16.2582365],
  "baden bei wien": ["NOE", 48.0045, 16.2313],
  "weilheim in oberbayern": ["BY", 47.8395, 11.1416], // ne a "weilheim" (BW, Weilheim an der Teck) kulcs egyezzen bele — más tartomány!
  "tägerwilen": ["TG", 47.651, 9.176],
  "bottighofen": ["TG", 47.6423, 9.2153],
  "zürich": ["ZH", 47.3769, 8.5417],
  "unterföhring": ["BY", 48.1927, 11.644],
  "kempten": ["BY", 47.7267, 10.3161],
  "rosenheim": ["BY", 47.857, 12.116],
  "münchen": ["BY", 48.1351, 11.582],
  "berlin": ["BE", 52.52, 13.405],
  "frankfurt": ["HE", 50.1109, 8.6821],
  "rattersdorf": ["BGL", 47.43, 16.43],
  "oberwart": ["BGL", 47.2895, 16.2059],
  "bécs": ["W", 48.2082, 16.3738],
  "wien": ["W", 48.2082, 16.3738],
  "amszterdam": ["NH", 52.3676, 4.9041],
  "amsterdam": ["NH", 52.3676, 4.9041],
  "rotterdam": ["ZH", 51.9244, 4.4777],
  "schiedam": ["ZH", 51.92, 4.4],
  "vlaardingen": ["ZH", 51.9121, 4.3419],
  "leiden": ["ZH", 52.1601, 4.497],
  "utrecht": ["UT", 52.0907, 5.1214],
  "groningen": ["GR", 53.2194, 6.5665],
  "purmerend": ["NH", 52.505, 4.9592],
  // 2026-07-04 bővítés — a CSV-ben szereplő, addig hiányzó városok:
  "graz": ["STM", 47.0707, 15.4395],
  "linz": ["OOE", 48.3069, 14.2858],
  "innsbruck": ["TIR", 47.2692, 11.4041],
  "köln": ["NW", 50.9375, 6.9603],
  "düsseldorf": ["NW", 51.2277, 6.7735],
  "leverkusen": ["NW", 51.0459, 6.9853],
  "bergisch gladbach": ["NW", 50.9856, 7.1324],
  "stuttgart": ["BW", 48.7758, 9.1829],
  "mannheim": ["BW", 49.4875, 8.466],
  "hamburg": ["HH", 53.5511, 9.9937],
  "hannover": ["NI", 52.3759, 9.732],
  "leipzig": ["SN", 51.3397, 12.3731],
  "nürnberg": ["BY", 49.4521, 11.0767],
  "basel": ["BS", 47.5596, 7.5886],
  "arbon": ["TG", 47.5136, 9.434],
  "egnach": ["TG", 47.5333, 9.3667],
  "den haag": ["ZH", 52.0705, 4.3007],
  "arnhem": ["GE", 51.9851, 5.8987],
  "thalheim bei wels": ["OOE", 48.1611, 14.0264],
  "pernitz": ["NOE", 47.9, 15.9333],
  "breda": ["NB", 51.5719, 4.7683],
  "almere": ["FL", 52.3508, 5.2647],
  "de rijp": ["NH", 52.5583, 4.8447],
  "alkmaar": ["NH", 52.6324, 4.7534],
  "tresdorf": ["NOE", 48.3936, 16.3521],
  "geisenfeld": ["BY", 48.6851, 11.6136],
  "st. anton am arlberg": ["TIR", 47.1297, 10.2657], // javítva: "T" nem a kanonikus AT-kód (TIR az)
  "gloggnitz": ["NOE", 47.6764, 15.9382],
  // 2026-07-05 bővítés — új autószervizek/boltok városai:
  "deutsch-wagram": ["NOE", 48.2986, 16.5583],
  "velden": ["KTN", 46.6114, 14.0417], // Velden am Wörthersee (9220), Karintia
  "salzburg": ["SBG", 47.8095, 13.0550],
  "eisenstadt": ["BGL", 47.8457, 16.5278],
  "wels": ["OOE", 48.1575, 14.0289],
  // 2026-07-06 bővítés — új szakemberek városai (mind a 4 országra):
  "dachau": ["BY", 48.2604, 11.4342],
  "schriesheim": ["BW", 49.4692, 8.6667],
  "hilden": ["NW", 51.1682, 6.9337],
  "röhrmoos": ["BY", 48.3167, 11.4167],
  "wallersdorf": ["BY", 48.7167, 12.75],
  "altdorf": ["BY", 48.6167, 12.1], // Altdorf bei Landshut (nem az Altdorf UR/Nürnberg)
  "rastatt": ["BW", 48.8589, 8.2072],
  "hockenheim": ["BW", 49.3167, 8.55],
  "zug": ["ZG", 47.1662, 8.5155],
  "glattpark": ["ZH", 47.4308, 8.5611], // Glattpark/Opfikon, Zürich mellett
  "opfikon": ["ZH", 47.4308, 8.5611],
  "gouda": ["ZH", 52.0116, 4.7106],
  // 2026-07-06 bővítés (2. kör) — további szakemberek városai:
  "krimpen aan den ijssel": ["ZH", 51.9167, 4.6167],
  "waalwijk": ["NB", 51.6858, 5.0725],
  "heerlen": ["LI", 50.8882, 5.9795],
  "apeldoorn": ["GE", 52.2112, 5.9699],
  "horb am neckar": ["BW", 48.4453, 8.6844],
  "metzingen": ["BW", 48.5372, 9.2814],
  "schillingsfürst": ["BY", 49.2925, 10.4667],
  "groß-gerau": ["HE", 49.9167, 8.4833], // Wallerstädten (Groß-Gerau városrésze)
  "dornstadt": ["BW", 48.4453, 9.9394],
  "fichtenberg": ["BW", 49.0167, 9.65],
  // 2026-07-06 bővítés (3. kör) — nőgyógyászok + biztosítási tanácsadó városai:
  "karlsruhe": ["BW", 49.0069, 8.4037],
  "achern": ["BW", 48.6297, 8.0781],
  "senden": ["BY", 48.3667, 10.05], // Senden bei Neu-Ulm (Bajorország)
  "bad windsheim": ["BY", 49.5019, 10.4022],
  "heilbronn": ["BW", 49.1427, 9.2109],
  "lauf an der pegnitz": ["BY", 49.5089, 11.2803],
  "regensburg": ["BY", 49.0134, 12.1016],
  "gräfelfing": ["BY", 48.1167, 11.4333],
  // 2026-07-06 bővítés (4. kör) — magyar fogorvos-katalógus (nemetorszagi-magyarok.de) városai:
  "otterstadt": ["RP", 49.3667, 8.4167],
  "bammental": ["BW", 49.3667, 8.7667],
  "erbach": ["BW", 48.3167, 9.9], // Erbach (Alb-Donau-Kreis, BW) — nem a hesseni Erbach
  "böfingen": ["BW", 48.4167, 9.9833], // Ulm városrésze
  "gernsbach": ["BW", 48.8, 8.35],
  "schwäbisch gmünd": ["BW", 48.7994, 9.7981],
  "mühlacker": ["BW", 48.9483, 8.8419],
  "wartenberg": ["BY", 48.4667, 12.05],
  "neu-ulm": ["BY", 48.3967, 10.0122],
  "fürth": ["BY", 49.4783, 10.9903],
  "kaufbeuren": ["BY", 47.8803, 10.6197],
  "zirndorf": ["BY", 49.4453, 10.9553],
  "freising": ["BY", 48.4028, 11.7489],
  // 2026-07-06 bővítés (5. kör):
  "sulzbach an der murr": ["BW", 49.0167, 9.4833],
  "germering": ["BY", 48.1333, 11.35],
  "dingolfing": ["BY", 48.6386, 12.4894],
  // 2026-07-06 bővítés (6. kör) — magyar ügyvéd-katalógus (nemetorszagi-magyarok.de) városai:
  "rheda-wiedenbrück": ["NW", 51.8419, 8.3],
  "ostfildern": ["BW", 48.7167, 9.2667],
  "göppingen": ["BW", 48.7028, 9.6522],
  "pforzheim": ["BW", 48.8922, 8.6946],
  "berchtesgaden": ["BY", 47.63, 13.0025],
  "leichlingen": ["NW", 51.1, 7.0167],
  "riedstadt": ["HE", 49.85, 8.5],
  "siegen": ["NW", 50.8747, 8.0243],
  "paderborn": ["NW", 51.7189, 8.7544],
  "merzenich": ["NW", 50.8167, 6.5667],
  "beuron": ["BW", 48.05, 8.9833],
  "reutlingen": ["BW", 48.4919, 9.2042],
  "bobenheim-roxheim": ["RP", 49.5333, 8.3333],
  // 2026-07-06 bővítés (7. kör) — magyar könyvelő-katalógus városai:
  "ebeleben": ["TH", 51.2, 10.8],
  "gaggenau": ["BW", 48.8069, 8.3197],
  "herrenberg": ["BW", 48.5958, 8.8664],
  // 2026-07-06 bővítés (8. kör) — nőgyógyász-katalógus 2-4. oldala:
  "bonn": ["NW", 50.7374, 7.0982],
  "wegberg": ["NW", 51.1461, 6.2778],
  "marktredwitz": ["BY", 50.0, 12.0833],
  "ulm": ["BW", 48.4011, 9.9876],
  "saarlouis": ["SL", 49.3144, 6.7519],
  "augsburg": ["BY", 48.3705, 10.8978],
  "wiesbaden": ["HE", 50.0782, 8.2398],
  "heidelberg": ["BW", 49.3988, 8.6724],
  "backnang": ["BW", 48.9439, 9.4308],
  "ludwigsburg": ["BW", 48.8974, 9.1917],
  "kernen": ["BW", 48.8, 9.3167],
  "münchberg": ["BY", 50.1878, 11.7856],
  "marktheidenfeld": ["BY", 49.85, 9.6],
  "bad aibling": ["BY", 47.8667, 12.0],
  // 2026-07-06 bővítés (9. kör):
  "solingen": ["NW", 51.1657, 7.0674],
  "ichenhausen": ["BY", 48.3667, 10.3],
  "maintal": ["HE", 50.15, 8.8333],
  "mainz-ebersheim": ["RP", 49.95, 8.2833],
  "freiburg": ["BW", 47.9959, 7.8522],
  // 2026-07-06 bővítés (10. kör):
  "aachen": ["NW", 50.7753, 6.0839],
  "erding": ["BY", 48.3058, 11.9075],
  "weidenstetten": ["BW", 48.5333, 9.9667],
  "hausham": ["BY", 47.7333, 11.8333],
  "neufra": ["BW", 48.2833, 9.1],
  "mettmann": ["NW", 51.25, 6.9667],
  "garching": ["BY", 48.2489, 11.6511],
  // 2026-07-06 bővítés (11. kör):
  "offenbach am main": ["HE", 50.1055, 8.7761],
  "mülheim an der ruhr": ["NW", 51.4266, 6.8825],
  "straelen": ["NW", 51.4436, 6.2667],
  "starnberg": ["BY", 47.9975, 11.3428],
  "mendig": ["RP", 50.3667, 7.3],
  "worms": ["RP", 49.6333, 8.3667],
  // 2026-07-06 bővítés (12. kör) — peiermusik.de orvosok_egeszseg katalógusa:
  "trier": ["RP", 49.7596, 6.6442],
  "böblingen": ["BW", 48.685, 9.0113],
  "magstadt": ["BW", 48.7424, 8.9628],
  "sindelfingen": ["BW", 48.7084, 9.0035],
  "aidlingen": ["BW", 48.6786, 8.8983],
  "freiberg": ["BW", 50.9169, 13.3429],
  "marbach": ["BW", 48.9402, 9.2564],
  "neckarsulm": ["BW", 49.1917, 9.2249],
  "esslingen am neckar": ["BW", 48.7428, 9.3072],
  "nürtingen": ["BW", 48.6266, 9.3365],
  "kirchheim unter teck": ["BW", 48.6481, 9.451],
  "weilheim": ["BW", 48.6167, 9.5333], // Weilheim an der Teck (javítva: korábban tévesen a bajor Weilheim koordinátái szerepeltek itt)
  "geislingen": ["BW", 48.623, 9.8357],
  "winterlingen": ["BW", 48.1782, 9.1144],
  "sigmaringen": ["BW", 48.0869, 9.2165],
  "knittlingen": ["BW", 49.0239, 8.7579],
  "ettlingen": ["BW", 48.9414, 8.4076],
  "murg": ["BW", 48.6978, 8.3502],
  "hayingen": ["BW", 48.2752, 9.4781],
  "langenau": ["BY", 48.4996, 10.1211],
  "altenstadt": ["BY", 47.8237, 10.8735],
  "rothenburg ob der tauber": ["BY", 49.3658, 10.1629],
  "nattheim": ["BY", 48.6995, 10.2419],
  "ingolstadt": ["BY", 48.763, 11.425],
  "regenstauf": ["BY", 49.1549, 12.1697],
  "passau": ["BY", 48.5748, 13.461],
  "freyung": ["BY", 48.8307, 13.5494],
  "pocking": ["BY", 48.4015, 13.3108],
  "bad griesbach i. rottal": ["BY", 48.4513, 13.1931],
  "tittling": ["BY", 48.7339, 13.3638],
  "obernzell": ["BY", 48.555, 13.6361],
  "röhrnbach": ["BY", 48.7396, 13.5224],
  "plattling": ["BY", 48.7767, 12.8734],
  "vilshofen": ["BY", 49.2979, 11.953],
  "deggendorf": ["BY", 48.7814, 13.0006],
  "bad homburg": ["HE", 50.2284, 8.613],
  "rüsselsheim": ["HE", 49.9917, 8.4138],
  "krefeld": ["NW", 51.3331, 6.5623],
  "gießen": ["HE", 50.5862, 8.6742],
  "arzberg": ["SN", 50.0567, 12.1859],
  "schramberg": ["BW", 48.2255, 8.3852],
  "vaihingen an der enz": ["BW", 48.9321, 8.9568],
  "plochingen": ["BW", 48.7215, 9.4164],
  "wendlingen": ["BW", 48.6728, 9.3838],
  "kernen im remstal": ["BW", 48.7965, 9.3286],
  "kehl": ["BW", 48.5734, 7.8114],
  "siegburg": ["NW", 50.7928, 7.2071],
  "kreuztal": ["NW", 50.9599, 7.9896],
  "pfaffenhofen": ["BY", 49.0642, 8.9754],
  "königsbrunn": ["BY", 48.268, 10.8884],
  "kelheim": ["BY", 48.9185, 11.8723],
  "schwäbisch hall": ["BW", 49.1124, 9.7371],
  "eppelheim": ["BW", 49.4025, 8.6331],
  "darmstadt": ["HE", 49.8728, 8.6512],
  "burghausen": ["BY", 48.1589, 12.8329],
  "friedberg": ["BY", 48.3552, 10.9786],
  "straubing": ["BY", 48.8839, 12.5956],
  "tuttlingen": ["BW", 47.9844, 8.8187],
  "munich": ["BY", 48.1371, 11.5754],
  "grünwald": ["BY", 48.0487, 11.5301],
  "baden-baden": ["BW", 48.7606, 8.2422],
  // 2026-07-06 bővítés — CH kantonális lefedettség (eddig Zürich/Basel/Arbon-heavy volt):
  "muri bei bern": ["BE", 46.9276, 7.4901],
  "bern": ["BE", 46.948, 7.4474],
  "genève": ["GE", 46.2044, 6.1432],
  "geneve": ["GE", 46.2044, 6.1432],
  "carouge": ["GE", 46.1817, 6.1367],
  "lausanne": ["VD", 46.5197, 6.6323],
  "luzern": ["LU", 47.0502, 8.3093],
  "rapperswil": ["SG", 47.2266, 8.8184],
  "gächlingen": ["SH", 47.7167, 8.5],
  "schaffhausen": ["SH", 47.6960, 8.6376],
  "nidau": ["BE", 47.1181, 7.2444],
  "reinach bl": ["BL", 47.4922, 7.5919],
  "davos": ["GR", 46.8027, 9.8361],
  "martigny": ["VS", 46.1027, 7.0736],
  "flamatt": ["FR", 46.8888, 7.3306],
  "gebenstorf": ["AG", 47.4715, 8.2455],
  "lugano": ["TI", 46.0037, 8.9511],
  "muralto": ["TI", 46.1745, 8.7998],
  "le locle": ["NE", 47.0567, 6.7503],
  "delémont": ["JU", 47.365, 7.3444],
  "delemont": ["JU", 47.365, 7.3444],
  "netstal": ["GL", 47.0619, 9.0644],
  "sarnen": ["OW", 46.8969, 8.2458],
  "stans": ["NW", 46.9581, 8.3661],
  "oberdorf bl": ["BL", 47.4325, 7.6875],
  "olten": ["SO", 47.3518, 7.9046],
  "wil sg": ["SG", 47.4642, 9.0459],
  "schönbühl": ["BE", 47.0, 7.4667],
  "capelle aan den ijssel": ["ZH", 51.9297, 4.5764],
  "beverwijk": ["NH", 52.4864, 4.6573],
  "rupperswil": ["AG", 47.3852, 8.1875],
  "sirnach": ["TG", 47.5219, 9.0],
  "thun": ["BE", 46.7580, 7.6280],
  "heidenheim": ["BW", 48.6763, 10.1526],
  "karlsfeld": ["BY", 48.2478, 11.4645],
  "bad liebenzell": ["BW", 48.7597, 8.7297],
  "büren": ["NW", 51.5333, 8.5667],
  "bretten": ["BW", 49.0333, 8.7167],
  "westerheim": ["BY", 47.9333, 10.3167], // Westerheim (Unterallgäu, Bajorország) — nem a BW-i azonos nevű falu
  "butzbach": ["HE", 50.4333, 8.6667],
  "leinfelden": ["BW", 48.6967, 9.16],
  "günzburg": ["BY", 48.4569, 10.2765],
  "sankt augustin": ["NW", 50.7706, 7.1922],
  "saulheim": ["RP", 49.9, 8.15],
  "neuhof an der zenn": ["BY", 49.4167, 10.6667],
  "reichertshofen": ["BY", 48.6667, 11.5833],
  "altötting": ["BY", 48.2264, 12.6789],
  "alfdorf": ["BW", 48.8167, 9.7167],
  "burladingen": ["BW", 48.2667, 9.1],
  "st. johann im pongau": ["SBG", 47.35, 13.2],
  "bad wimsbach-neydharting": ["OOE", 48.05, 13.9],
  "penzberg": ["BY", 47.75, 11.3833],
  "unterschleißheim": ["BY", 48.2775, 11.5747],
  "landshut": ["BY", 48.5372, 12.1522],
  "st. pölten": ["NOE", 48.2, 15.6167],
  "neusiedl am see": ["BGL", 47.95, 16.8333],
  "ebreichsdorf": ["NOE", 47.9667, 16.4],
  "mödling": ["NOE", 48.0858, 16.2833],
  "stettlen": ["BE", 46.9647, 7.5153],
  "gümligen": ["BE", 46.9270, 7.4854],
  "schlieren": ["ZH", 47.3967, 8.4472],
  "döttingen": ["AG", 47.5731, 8.2517],
  "kloten": ["ZH", 47.4508, 8.5825],
  "baar": ["ZG", 47.1961, 8.5297],
  "allschwil": ["BL", 47.5511, 7.5486],
  "bülach": ["ZH", 47.5219, 8.5406],
  "langenthal": ["BE", 47.2144, 7.7936],
  "abtwil": ["SG", 47.4183, 9.3103],
  "magden": ["AG", 47.5469, 7.8306],
  "karlstein": ["BY", 50.0167, 9.1333],
  "groß-bieberau": ["HE", 49.7969, 8.8181],
  "hochheim am main": ["HE", 50.0122, 8.3489],
  "eichenau": ["BY", 48.1667, 11.3167],
  "neutraubling": ["BY", 48.9667, 12.2],
  "lichtenfels": ["BY", 50.1333, 11.05],
  "feldkirchen-westerham": ["BY", 47.8833, 12.0167],
  "feldkirchen": ["BY", 48.15, 11.7167],
  // 2026-07-06 bővítés (13. kör) — svájcinfo.ch étel-ital katalógusa; "baden" a végén, hogy
  // NE előzze meg a wiesbaden/baden-baden (DE) kulcsokat:
  "romanshorn": ["TG", 47.5661, 9.3792],
  "salmsach": ["TG", 47.5701, 9.3618],
  "berg tg": ["TG", 47.6367, 9.2489],
  "oetwil am see": ["ZH", 47.2394, 8.6961],
  "lutzenberg": ["AR", 47.4419, 9.5883],
  "reichenburg": ["SZ", 47.1667, 8.9833],
  "niederbipp": ["BE", 47.2833, 7.65],
  "baden": ["AG", 47.4744, 8.3059],
  // 2026-07-06 bővítés (14. kör) — nemetorszagi-magyarok.de fodrász/bolt/étterem katalógusa:
  "leimen": ["BW", 49.3489, 8.6858],
  "michelfeld": ["BW", 49.1167, 9.6333],
  "burgau": ["BY", 48.4333, 10.4],
  "essen": ["NW", 51.4556, 7.0116],
  // 2026-07-06 bővítés (16. kör) — alulreprezentált kantonok/tartományok (Vaud, Luzern, Graubünden,
  // Vorarlberg, Kärnten) feltöltése egy nagy svájci orvos/ügyvéd-katalógusból:
  "echandens": ["VD", 46.5333, 6.5667],
  "pompaples": ["VD", 46.6667, 6.5],
  "clarens": ["VD", 46.4333, 6.9],
  "epalinges": ["VD", 46.5500, 6.6667],
  "nyon": ["VD", 46.3830, 6.2396],
  "hochdorf": ["LU", 47.1667, 8.2833],
  "sursee": ["LU", 47.1667, 8.1000],
  "horw": ["LU", 47.0167, 8.3167],
  "scuol": ["GR", 46.7975, 10.2986],
  "st. moritz": ["GR", 46.4908, 9.8355],
  "chur": ["GR", 46.8499, 9.5329],
  "samedan": ["GR", 46.5333, 9.8833],
  "bregenz": ["VBG", 47.5031, 9.7471],
  "bludenz": ["VBG", 47.1552, 9.8228],
  "altach": ["VBG", 47.3667, 9.6333],
  "hard": ["VBG", 47.4833, 9.6833],
  "bezau": ["VBG", 47.3833, 9.9000],
  "wolfsberg": ["KTN", 46.8394, 14.8447],
  "moosburg": ["KTN", 46.6667, 14.2000],
  "klagenfurt": ["KTN", 46.6249, 14.3050],
  "villach": ["KTN", 46.6111, 13.8558],
  "frickenhausen": ["BW", 48.6167, 9.3833],
  "radolfzell am bodensee": ["BW", 47.7333, 8.9667],
  "haigerloch": ["BW", 48.3667, 8.8],
  "marxzell": ["BW", 48.8833, 8.4833],
  "großschirma": ["SN", 50.9333, 13.2833],
  "bad herrenalb": ["BW", 48.8, 8.4333],
  // 2026-07-06 bővítés (15. kör) — szaknevsor.hollandhirek.nl + hollandhirek.nl cikk:
  "swalmen": ["LI", 51.2167, 6.0333],
  "scherpenzeel": ["GE", 52.1167, 5.5833],
  "vlissingen": ["ZE", 51.4426, 3.5736],
  "delft": ["ZH", 52.0116, 4.3571],
  "moerdijk": ["NB", 51.6833, 4.6167],
  "krumbach": ["BY", 48.2489, 10.3653],
  "eindhoven": ["NB", 51.4416, 5.4697],
  "voorburg": ["ZH", 52.0716, 4.3644],
  "tilburg": ["NB", 51.5555, 5.0913],
  // 2026-07-06 bővítés (17. kör) — a korábbi kantonális-lefedettség forrásból
  // (arkadasi.hu/svajc) eddig kihagyott Solothurn/Appenzell szekciók pótlása:
  "appenzell": ["AI", 47.3316, 9.4092],
  "schönengrund": ["AR", 47.2833, 9.2000],
  "herisau": ["AR", 47.3833, 9.2833],
  "teufen": ["AR", 47.3667, 9.3500],
  "solothurn": ["SO", 47.2088, 7.5323],
  "grenchen": ["SO", 47.1917, 7.3958],
  "oesingen": ["SO", 47.2333, 7.7167],
  "dornach": ["SO", 47.4833, 7.6167],
  // 2026-07-06 bővítés (18. kör) — nemetorszagi-magyarok.de tartomány-szűrős
  // orvos-katalógusa (Sachsen-Anhalt/Schleswig-Holstein/Thüringen, eddig üres/gyér):
  "halle": ["ST", 51.4825, 11.9699],
  "osterburg": ["ST", 52.7864, 11.7539],
  "merseburg": ["ST", 51.3541, 11.9973],
  "norderstedt": ["SH", 53.6883, 9.9761],
  "saalfeld": ["TH", 50.6503, 11.3667],
  "berga": ["TH", 50.7333, 11.7667],
  // 2026-07-06 bővítés (19. kör) — arkadasi.hu/ausztria Salzburg-szekciója
  // (a korábbi Vorarlberg/Kärnten körben kimaradt, pedig már megvolt az adat):
  "zell am see": ["SBG", 47.3244, 12.7972],
  "tamsweg": ["SBG", 47.1281, 13.8114],
  "bruck an der großglocknerstraße": ["SBG", 47.2833, 12.8333],
  // 2026-07-06 bővítés (20. kör) — hollandhirek.nl szaknévsor API-ból (Directorist
  // REST-endpoint, 85 valódi bejegyzés) + arkadasi.hu/belgium-hollandia-luxemburg;
  // Flevoland eddig teljesen üres tartomány volt:
  "milsbeek": ["LI", 51.7303, 5.9533],
  // 2026-07-07 bővítés (21. kör) — nemetorszagi-magyarok.de Drupal JSON:API
  // (jsonapi/node/szolgaltatok, 823 valódi bejegyzés) — pontos utcacímes találatok:
  "pfarrkirchen": ["BY", 48.4167, 12.9333],
  // 2026-07-08 bővítés (22. kör) — arkadasi.hu/belgium-hollandia-luxemburg +
  // szaknevsor.hollandhirek.nl (Directorist REST API, saját geokóddal) — NL volt
  // a leggyengébb ország (67 cég) és 0 orvos/fogorvos-eltolódás nélküli tartomány;
  // Flevoland/Friesland eddig üres/gyér tartományok is bővültek:
  "wateringen": ["ZH", 52.0167, 4.2667],
  "veenendaal": ["UT", 52.0382, 5.5363],
  "amstelveen": ["NH", 52.3014, 4.8687],
  "zaandam": ["NH", 52.4396, 4.8236],
  "bergen op zoom": ["NB", 51.4948, 4.2897],
  "bosschenhoofd": ["NB", 51.5667, 4.5333],
  "nagele": ["FL", 52.6389, 5.7256],
  "koudum": ["FR", 52.9167, 5.4667],
  "maastricht": ["LI", 50.8514, 5.6910],
  "zwolle": ["OV", 52.5090, 6.0944],
  // 2026-07-08 bővítés (23. kör) — arkadasi.hu/svajc: CH „bolt" (élelmiszer) kategória
  // volt a legalulreprezentáltabb az 5 prioritás-kategória közül (1 db a 182-ből):
  "deitingen": ["SO", 47.2167, 7.6167],
  "widen": ["AG", 47.2967, 8.4192],
  "salez": ["SG", 47.1667, 9.4667],
  // 2026-07-19 bővítés — Thalwil (Nominatim-mal ellenőrizve): a "hard" kulcs
  // (VBG, Bregenz-környék) a "Gotthardstrasse" utcanévben SUBSTRING-ként
  // illeszkedett, hibás VBG kantont adva egy zürichi címre (CITY-map
  // substring-shadow csapda, ld. [[precise-address-seed]] linz/bellinzona
  // esete) — az explicit kulcs a hibás egyezés ELŐTT oldódik fel.
  "thalwil": ["ZH", 47.2960, 8.5630],
  "bergdietikon": ["AG", 47.3881, 8.3930],
  "wädenswil": ["ZH", 47.2297, 8.6725],
  "waedenswil": ["ZH", 47.2297, 8.6725],
  "horgenberg": ["ZH", 47.2578, 8.5987],
  // 2026-07-08 bővítés (24. kör) — arkadasi.hu/ausztria-_liechtenstein: AT fodrász-
  // aránya volt a legalacsonyabb a 4 ország közül (6/280); fodrászt/éttermet nem
  // találtam ÚJ, ellenőrizhető cím alatt (a legtöbb arkadasi-jelölt már bent volt
  // korábbi körökből) — bolt+szépség kategóriában maradt valódi, új tétel:
  "steyr": ["OOE", 48.0453, 14.4211],
  // 2026-07-08 bővítés (25. kör) — nemetorszagi-magyarok.de JSON:API (Drupal
  // jsonapi/node/szolgaltatok) TELJES lapozása (99 bejegyzés — a korábban
  // feljegyzett "823" elavult/téves szám volt) — a fodrász/étterem/bolt
  // kategóriák eddig alig lettek innen merítve (a korábbi körök inkább
  // orvos/ügyvéd/fogorvos-ra fókuszáltak ugyanebből a forrásból):
  "höhenkirchen": ["BY", 48.0333, 11.6833],
  "ittlingen": ["BW", 49.1967, 8.9333],
  "büchlberg": ["BY", 48.6167, 13.5667],
  "muhr am see": ["BY", 49.1667, 10.8500],
  "bad wörishofen": ["BY", 48.0000, 10.6000],
  // 2026-07-16 bővítés (26. kör) — arkadasi.hu/ausztria-_liechtenstein: a
  // leggyérebb AT tartományok (Kärnten/Tirol/Vorarlberg) + Burgenland/Alsó-
  // Ausztria/Felső-Ausztria/Stájerország eddig hiányzó városai. "schladming",
  // "braunau am inn" és "gänserndorf" SZÁNDÉKOSAN önálló kulcsok (nem csak a
  // COUNTRY_FALLBACK-ra hagyva) — élő bug volt, hogy a cím szövegében szereplő
  // utcanév ("Salzburger Straße", "Wiener Straße") tévesen a "salzburg"/"wien"
  // kulcsra illesztett rossz tartományt adva.
  "seiersberg": ["STM", 47.0086779, 15.3996846],
  "weiz": ["STM", 47.2184821, 15.6297247],
  "schladming": ["STM", 47.3914551, 13.6755975],
  "matrei in osttirol": ["TIR", 47.0035971, 12.5392621],
  "rum": ["TIR", 47.2875296, 11.4583051],
  "kitzbühel": ["TIR", 47.4492104, 12.3920215],
  "hall in tirol": ["TIR", 47.2834143, 11.5084233],
  "deutsch tschantschendorf": ["BGL", 47.1084801, 16.2861123],
  "wolfau": ["BGL", 47.2814, 16.1315],
  "horitschon": ["BGL", 47.5918178, 16.5385309],
  "frauenkirchen": ["BGL", 47.8358262, 16.9255664],
  "mönchhof": ["BGL", 47.8823505, 16.9361618],
  "rechnitz": ["BGL", 47.305217, 16.4411963],
  "marz": ["BGL", 47.7193518, 16.4155333],
  "nikitsch": ["BGL", 47.5226278, 16.6422628],
  "schattendorf": ["BGL", 47.7132474, 16.513704],
  "güssing": ["BGL", 47.0589336, 16.3221597],
  "andau": ["BGL", 47.7756211, 17.0325576],
  "kittsee": ["BGL", 48.0901584, 17.0660273],
  "bruck an der leitha": ["NOE", 48.0243071, 16.7794963],
  "bad tatzmannsdorf": ["BGL", 47.3339539, 16.230238],
  "oberpullendorf": ["BGL", 47.4952149, 16.5059755],
  "wagram": ["NOE", 48.4338521, 15.7761423],
  "aspang-markt": ["NOE", 47.558371, 16.0914643],
  "zwettl": ["NOE", 48.6034264, 15.1655621],
  "gänserndorf": ["NOE", 48.35, 16.7167],
  "gallneukirchen": ["OOE", 48.349664, 14.4127334],
  "marchtrenk": ["OOE", 48.1946007, 14.1124927],
  "braunau am inn": ["OOE", 48.2575, 13.0389],
  "mondsee": ["OOE", 47.8572837, 13.3487084],
  "gallspach": ["OOE", 48.2084689, 13.8109364],
  "pramet": ["OOE", 48.1333, 13.4667],
  // 2026-07-16 bővítés (27. kör) — NL, katalogus.nl + szaknevsor.hollandhirek.nl
  // (Directorist-forrás), a leggyérebb NL tartományok (Overijssel/Limburg/
  // Noord-Brabant) eddig hiányzó városai:
  "hengelo": ["OV", 52.2659, 6.7930],
  "almelo": ["OV", 52.3567, 6.6625],
  "roosendaal": ["NB", 51.5326, 4.4653],
  "middelbeers": ["NB", 51.5167, 5.2667],
  "helmond": ["NB", 51.4793, 5.6572],
  "'s-hertogenbosch": ["NB", 51.6978, 5.3037],
  "geleen": ["LI", 50.9750, 5.8283],
  "haarlem": ["NH", 52.3874, 4.6462],
  // 2026-07-16 bővítés (28. kör) — DE, nemetorszagi-magyarok.de JSON:API,
  // München környéki autószerelő-kategória (autoszer=0 volt a nagyvárosi
  // audit szerint München/Berlin/Hamburg/Köln/Frankfurt/Düsseldorfban):
  "riemerling": ["BY", 48.0522, 11.6667],
  "geretsried": ["BY", 47.8667, 11.4833],
  "schondorf am ammersee": ["BY", 47.9667, 11.1833],
  "warngau": ["BY", 47.7667, 11.7333],
  "grevenbroich": ["NW", 51.0908, 6.5828],
  "königsfeld": ["NW", 50.6167, 6.9333],
  // 2026-07-21 bővítés (14. kör) — herold.at "ungarisch" tolmács/fordító találat:
  // Neuzeug (Sierning község, Steyr-Land, Felső-Ausztria) hiányzott, ORSZÁG-KÖZÉP
  // fallbackra esett (hibás pin + NULL canton) — Nominatim-mal ellenőrzött koordináta.
  "neuzeug": ["OOE", 48.0455687, 14.3351690],
};
// Ország-középpont, ha a város ismeretlen (pl. csak „Hollandia").
const COUNTRY_FALLBACK = { CH: [46.8, 8.23], AT: [47.6, 14.5], DE: [51.1, 10.4], NL: [52.13, 5.29] };

// A régió/fallback-koordináta a városból VAGY a cím szövegéből (a CSV-ben a
// city néha csak „Hollandia", de a cím tartalmazza a valódi települést).
// ELŐBB a city-mező önmagában — az utcanév becsaphat (a nürnbergi
// „Düsseldorfer Straße" a cím-szövegben Düsseldorfra illeszkedett).
function resolveCity(city, address, country) {
  const cityOnly = (city || "").toLowerCase();
  for (const k of Object.keys(CITY)) if (cityOnly.includes(k)) return CITY[k];
  const c = `${cityOnly} ${(address || "").toLowerCase()}`;
  for (const k of Object.keys(CITY)) if (c.includes(k)) return CITY[k];
  const f = COUNTRY_FALLBACK[country] || [47.3769, 8.5417];
  return [null, f[0], f[1]];
}

// Nominatim addressdetails ISO3166-2-lvl4 → app canton_code. CH/DE/NL: a
// hivatalos ISO alrégió-kód MEGEGYEZIK az app kódjával (csak az "XX-"
// ország-előtag esik le). AT: a Nominatim/OSM a HIVATALOS NUMERIKUS
// ISO 3166-2:AT kódot adja (AT-1..AT-9), az app viszont betűs rövidítést
// használ (W/NOE/OOE/...) — itt fordítás kell.
// 2026-07-19: ennek a hiányának ára volt — a canton_code korábban KIZÁRÓLAG a
// kézzel karbantartott CITY-térkép várostalálatából jött, sosem a tényleges
// geokód-eredményből. Egy pontosan geokódolt cím is NULL kantont kapott, ha a
// városa nem volt a térképben (189 élő sor derült ki élesben, 3 nap alatt
// felgyűlve — [[business-address-geocode]]). A "hard" kulcs (VBG, Bregenz
// mellett) a "Gotthardstrasse" utcanévben SUBSTRING-ként illeszkedve rossz
// kantont is adott (CITY-map substring-shadow csapda).
const AT_ISO_TO_CANTON = {
  "AT-1": "BGL", "AT-2": "KTN", "AT-3": "NOE", "AT-4": "OOE",
  "AT-5": "SBG", "AT-6": "STM", "AT-7": "TIR", "AT-8": "VBG", "AT-9": "W",
};
function isoToCanton(iso, country) {
  if (!iso) return null;
  if (country === "AT") return AT_ISO_TO_CANTON[iso] ?? null;
  return iso.split("-")[1] || null; // CH-ZH → ZH, DE-BW → BW, NL-NH → NH
}

// --- Nominatim geokódolás: a PONTOS cím → házszám-szintű lat/lng -------------
// A [[precise-address-seed]] elv: sosem tippelünk — a megadott címet a Nominatim
// oldja fel, országra szűrve; bbox-validálás után fogadjuk csak el. Cache-fájl
// (geocode-cache.json), hogy az újrafuttatás ne kérdezzen újra (1,15s/kérés limit).
const CACHE_FILE = path.join(__dirname, "geocode-cache.json");
const BBOX = {
  CH: [45.8, 47.9, 5.9, 10.6], AT: [46.3, 49.1, 9.4, 17.2],
  DE: [47.2, 55.1, 5.8, 15.1], NL: [50.7, 53.6, 3.3, 7.3],
};
const inBbox = (cc, lat, lng) => {
  const b = BBOX[cc];
  return !!b && lat >= b[0] && lat <= b[1] && lng >= b[2] && lng <= b[3];
};
let cache = {};
try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); } catch { /* első futás */ }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Bécsi/holland címek lépcsőház-emelet jelölései ("8-12/1/25", "Top 203",
// "(18. ker)") megzavarják a Nominatimot → egyszerűsített változat a retry-hoz:
// csak utca + első házszám + irányítószám/város marad.
function simplifyAddress(address) {
  let a = address
    .replace(/\(([^)]*)\)/g, " ")                    // zárójeles rész ki
    .replace(/\b(Top|Stiege|Tür|St\.?g\.?)\s*\S+/gi, " ") // Top 203 / Stiege ki
    .replace(/(\d+)[a-z]?\s*[-–]\s*\d+/gi, "$1")     // 8-12 → 8
    .replace(/(\d+)\/[\w/.]+/g, "$1")                // 17/3, 24/1/16 → első szám
    .replace(/\d+\.\s*ker(ület|\.)?/gi, "Wien")      // "14. ker" → Wien
    .replace(/\s*\/\s*(?=,|$)/g, "")                 // lógó "/" ki
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .trim();
  return a;
}

async function fetchNominatim(query, country) {
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1` +
    `&countrycodes=${country.toLowerCase()}&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { "user-agent": "kinti-import/1.0 (kinti.app)" } });
    const data = await res.json();
    const hit = Array.isArray(data) && data[0];
    if (hit) {
      const lat = Number(hit.lat), lng = Number(hit.lon);
      if (inBbox(country, lat, lng)) {
        const canton = isoToCanton(hit.address?.["ISO3166-2-lvl4"], country);
        return { lat, lng, canton };
      }
    }
  } catch { /* hálózati hiba → null */ }
  return null;
}

async function geocode(address, country) {
  if (!address || !/\d/.test(address)) return null; // házszám nélkül nincs mit pontosítani
  const key = `${country}|${address}`;
  if (key in cache && cache[key] !== null) return cache[key];
  let out = await fetchNominatim(address, country);
  await sleep(1150); // Nominatim usage policy: max ~1 kérés/mp
  if (!out) {
    const simple = simplifyAddress(address);
    if (simple && simple !== address) {
      out = await fetchNominatim(simple, country);
      await sleep(1150);
    }
  }
  cache[key] = out; // a null-t is cache-eljük (a retry-ág null-nál újrapróbál)
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 1), "utf8");
  return out;
}

function slugify(country, name) {
  const m = { á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o", ú: "u", ü: "u", ű: "u", ä: "a", ß: "ss" };
  return country.toLowerCase() + "-imp-" +
    name.toLowerCase().replace(/[áéíóöőúüűäß]/g, (ch) => m[ch] || ch)
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56);
}
const esc = (s) => (s == null ? null : String(s).replace(/'/g, "''"));
const q = (s) => (s == null || s === "" ? "NULL" : `'${esc(s)}'`);

const records = parseCSV(fs.readFileSync(CSV_FILE, "utf8"));
const seen = new Set();
const skipped = [];
const lines = [
  "-- scripts/import_businesses.sql — AUTOGENERÁLT (prepare-business-import.mjs). NE szerkeszd kézzel.",
  "-- Valódi magyar szakemberek (CH/AT/DE/NL), per-cég kategóriával, jóváhagyva (moderation_status=1),",
  "-- átvehető (claimed=0). UPSERT: a meglévő (nem-claimolt, csv-import) sorok cím/koordináta/blurb",
  "-- mezői frissülnek — a tulaj által átvett sorokat NEM írja felül.",
  "-- Élesítés: wrangler d1 execute kinti-db --remote --file=scripts/import_businesses.sql",
  "",
  "-- Élelmiszer-kategória (a /magyarbolt kivezetésekor a döntés: a boltok a szaknévsorban kereshetők)",
  "INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('elelmiszer', 'Élelmiszerbolt', '🛒', 900);",
  "-- 'it' kategória már létezik ('Informatikus', csak 1 teszt-sora volt) — csak dokumentáló bootstrap, nem ír felül.",
  "INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('it', 'Informatikus', '⌘', 901);",
  "-- 'villany' kategória: a category-icon.tsx már régóta ismeri az ikonját (villám), a categories tábla eddig nem.",
  "INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('villany', 'Villanyszerelő', '⚡', 902);",
  "-- ÚJ kategóriák (a user 2026-07-06-i engedélyével, korábban nem volt hova kötni ezeket):",
  "INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('autokereskedes', 'Autókereskedés', '🚗', 903);",
  "INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('karszakerto', 'Kárszakértő', '🔍', 904);",
  "INSERT OR IGNORE INTO categories (id, label, glyph, sort_order) VALUES ('haztartasigep_szerelo', 'Háztartásigép- / Légkondiszerelő', '🔧', 905);",
  "",
];
let count = 0, geocoded = 0;
const perCountry = {};

for (const r of records) {
  if (!r.name || !r.country_code) continue;
  const cat = CATEGORY[r.category_id];
  if (!cat) { skipped.push(`${r.name} — ismeretlen kategória: "${r.category_id}"`); continue; }
  const [catId, catLabel] = cat;
  const country = r.country_code.toUpperCase();
  const [cityRegion, cityLat, cityLng] = resolveCity(r.city, r.address, country);
  // Pontos cím → Nominatim (házszám-szintű koordináta); ha nem oldódik fel,
  // a város-koordináta marad, és a [FIGYELEM] log jelzi kézi ellenőrzésre.
  const geo = await geocode(r.address, country);
  const lat = geo?.lat ?? cityLat;
  const lng = geo?.lng ?? cityLng;
  // A kanton ELSŐDLEGESEN a Nominatim tényleges geokód-eredményéből (ISO3166-2)
  // jön — ez a valódi cím szerinti, hiteles régió. A CITY-térkép csak akkor
  // esik latba, ha a geokódolás sikertelen (nincs mit reverse-geocode-olni).
  const region = geo?.canton ?? cityRegion;
  if (geo) geocoded++;
  else if (region === null) {
    // Se Nominatim, se ismert város → ORSZÁG-KÖZÉP koordináta + NULL canton.
    // Ez a pin a térképen az ország kellős közepén jelenne meg (2026-07-18-i
    // audit: 9 ilyen élő sort kellett kézzel javítani) — hangosan, KÜLÖN
    // jelöljük, hogy az alkalmazás előtt kézzel geokódolható legyen.
    skipped.push(`!! ORSZÁG-KÖZÉP FALLBACK (HIBÁS PIN + nincs canton — kézi geokódolás kell): ${r.name} — ${r.address || r.city}`);
  }
  else if (r.address && /\d/.test(r.address)) skipped.push(`(geokód-fallback, város-pont) ${r.name} — ${r.address}`);

  let id = slugify(country, r.name);
  while (seen.has(id)) id += "-x";
  seen.add(id);

  const website = r.website ? r.website.replace(/^https?:\/\//, "").replace(/\/$/, "") : null;
  const blurb = [r.description, website].filter(Boolean).join(" · ");
  const address = r.address || r.city || null;

  const cols =
    "(id, name, category_id, category_label, address, phone, blurb, languages, lat, lng, pin_x, pin_y, " +
    "rating, reviews, featured, open_now, moderation_status, claimed, hidden, verified, source, country_code, canton_code)";
  const vals = [
    q(id), q(r.name), q(catId), q(catLabel), q(address), q(r.phone), q(blurb),
    `'["Magyar"]'`, lat, lng, 50, 50, 0, 0, 0, 0, 1, 0, 0, 0, "'csv-import'", q(country), q(region),
  ].join(", ");
  lines.push(
    `INSERT INTO businesses ${cols} VALUES (${vals})`,
    `  ON CONFLICT(id) DO UPDATE SET address=excluded.address, lat=excluded.lat, lng=excluded.lng,`,
    `    blurb=excluded.blurb, phone=excluded.phone, category_id=excluded.category_id,`,
    `    category_label=excluded.category_label, canton_code=excluded.canton_code`,
    `  WHERE businesses.claimed = 0 AND businesses.source = 'csv-import';`,
  );
  count++;
  perCountry[country] = (perCountry[country] || 0) + 1;
}

fs.writeFileSync(SQL_OUTPUT, lines.join("\n") + "\n", "utf8");
console.log(`[Siker] ${count} vállalkozás (${geocoded} házszám-pontos geokóddal) → ${SQL_OUTPUT}`);
console.log("  Ország szerint:", JSON.stringify(perCountry));
if (skipped.length) console.log("[FIGYELEM]\n  " + skipped.join("\n  "));
