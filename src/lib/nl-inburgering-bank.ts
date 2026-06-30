/**
 * Inburgering (KNM — „Kennis van de Nederlandse Maatschappij”) szimulátor —
 * holland kérdés-bank.
 *
 * FONTOS: ez NEM hivatalos vizsga. A valódi holland beilleszkedési vizsga (KNM)
 * a holland társadalom, történelem, földrajz és normák ismeretét méri. Ez egy
 * FELKÉSZÍTŐ szimulátor a tipikus témakörökhöz — közelítő megfogalmazással.
 *
 * Forrás: a KNM hivatalos témakörei (államszervezet, történelem, földrajz,
 * társadalmi normák) alapján.
 */
import type { EbQuestion, EbTopic } from "./einburgerung-bank";

export const NL_TOPIC_META: Record<EbTopic, { label: string; emoji: string; color: string }> = {
  federal:   { label: "Államszervezet", emoji: "🏛️", color: "#1d4434" },
  history:   { label: "Történelem",     emoji: "📜", color: "#7f4a1d" },
  geography: { label: "Földrajz",       emoji: "🗺️", color: "#2c7a7b" },
  civic:     { label: "Társadalom",     emoji: "🗳️", color: "#5b21b6" },
  canton:    { label: "Provincia",      emoji: "🇳🇱", color: "#ae1c28" },
};

/** Provinciák, ahol vannak specifikus kérdések (a regions.ts NL-kódjaival). */
export const NL_PROVINCES = [
  { code: "NH", name: "Noord-Holland" },
  { code: "ZH", name: "Zuid-Holland" },
  { code: "UT", name: "Utrecht" },
  { code: "NB", name: "Noord-Brabant" },
];

export const NL_BANK: EbQuestion[] = [
  // ============ FEDERAL — Államszervezet ============
  { id: "n-f-monarchia", topic: "federal", question: "Milyen államforma Hollandia?", options: ["Köztársaság", "Alkotmányos monarchia", "Diktatúra", "Szövetségi állam"], correct: 1, explanation: "Alkotmányos monarchia — a király az államfő, de a hatalmat a kormány és a parlament gyakorolja." },
  { id: "n-f-koning", topic: "federal", question: "Ki Hollandia jelenlegi királya?", options: ["Beatrix", "Willem-Alexander", "Maxima", "Bernhard"], correct: 1, explanation: "Willem-Alexander király 2013 óta (Beatrix királynő lemondása után)." },
  { id: "n-f-parlament", topic: "federal", question: "Hogy hívják a holland parlamentet?", options: ["Bundestag", "Staten-Generaal", "Riksdag", "Cortes"], correct: 1, explanation: "Staten-Generaal — két kamarája a Tweede Kamer és az Eerste Kamer." },
  { id: "n-f-tweede", topic: "federal", question: "Hány tagja van a Tweede Kamernek (alsóház)?", options: ["75", "100", "150", "200"], correct: 2, explanation: "150 képviselő — közvetlenül választják, ez a fő törvényhozó kamara." },
  { id: "n-f-premier", topic: "federal", question: "Ki a kormányfő Hollandiában?", options: ["A király", "A minister-president (miniszterelnök)", "A polgármester", "Az EU-biztos"], correct: 1, explanation: "A minister-president vezeti a kormányt; a király szerepe főleg szimbolikus." },
  { id: "n-f-provincie", topic: "federal", question: "Hány provinciából áll Hollandia?", options: ["10", "12", "14", "16"], correct: 1, explanation: "12 provincia (pl. Noord-Holland, Zuid-Holland, Utrecht…)." },
  { id: "n-f-grondwet", topic: "federal", question: "Hogy hívják a holland alkotmányt?", options: ["Grondwet", "Grundgesetz", "Constitutie", "Statuut"], correct: 0, explanation: "A Grondwet — rögzíti az alapjogokat és az államszervezetet." },
  { id: "n-f-waterschap", topic: "federal", question: "Mi a „waterschap” (vízügyi hatóság) feladata?", options: ["Az oktatás", "A vízgazdálkodás és árvízvédelem", "A rendőrség", "Az adózás"], correct: 1, explanation: "A waterschappen Hollandia legrégebbi kormányzati szervei — a víz elleni védelmet intézik." },
  { id: "n-f-eu", topic: "federal", question: "Hollandia az EU-nak:", options: ["Nem tagja", "Alapító tagja", "2004 óta tagja", "Csak megfigyelő"], correct: 1, explanation: "Hollandia az Európai Unió egyik alapító tagja (1957, Római Szerződés)." },

  // ============ HISTORY — Történelem ============
  { id: "n-h-wo2", topic: "history", question: "Mikor szállta meg Németország Hollandiát a II. világháborúban?", options: ["1939", "1940", "1942", "1944"], correct: 1, explanation: "1940 májusában; a megszállás 1945-ig tartott." },
  { id: "n-h-bevrijding", topic: "history", question: "Mikor szabadult fel Hollandia a náci megszállás alól?", options: ["1944", "1945", "1946", "1948"], correct: 1, explanation: "1945. május 5. — ezt ünneplik a Bevrijdingsdag (Felszabadulás napja) alkalmából." },
  { id: "n-h-annefrank", topic: "history", question: "Ki volt Anne Frank?", options: ["Egy királynő", "Egy zsidó lány, akinek a naplója a Holokauszt ismert tanúsága", "Egy festő", "Egy miniszterelnök"], correct: 1, explanation: "Amszterdamban bujkált, naplója világhírű; a háborúban koncentrációs táborban halt meg." },
  { id: "n-h-voc", topic: "history", question: "Mi volt a VOC (17. század)?", options: ["Egy párt", "A Holland Kelet-indiai Társaság (kereskedelmi/gyarmati)", "Egy folyó", "Egy templom"], correct: 1, explanation: "A világ egyik első részvénytársasága; a holland „aranykor” gyarmati kereskedelmét vezette." },
  { id: "n-h-oranje", topic: "history", question: "Ki Hollandia „atyja”, a függetlenségi harc vezére?", options: ["Rembrandt", "Willem van Oranje (Orániai Vilmos)", "Erasmus", "Cruijff"], correct: 1, explanation: "Orániai Vilmos vezette a spanyolok elleni felkelést; az uralkodóház róla származik." },
  { id: "n-h-watersnood", topic: "history", question: "Mi történt 1953-ban Zeeland tartományban?", options: ["Földrengés", "Nagy árvíz (Watersnoodramp)", "Háború", "Aszály"], correct: 1, explanation: "Az 1953-as északi-tengeri árvíz után épültek a Delta-művek (Deltawerken) a védelemre." },

  // ============ GEOGRAPHY — Földrajz ============
  { id: "n-g-hoofdstad", topic: "geography", question: "Mi Hollandia fővárosa?", options: ["Den Haag", "Rotterdam", "Amszterdam", "Utrecht"], correct: 2, explanation: "Amszterdam a főváros — DE a kormány és a parlament székhelye Den Haag." },
  { id: "n-g-regering", topic: "geography", question: "Hol van a kormány és a király székhelye?", options: ["Amszterdam", "Den Haag (Hága)", "Rotterdam", "Eindhoven"], correct: 1, explanation: "Den Haag — itt ülésezik a kormány, a parlament és a Nemzetközi Bíróság is." },
  { id: "n-g-zeespiegel", topic: "geography", question: "Hollandia területének kb. mekkora része van a tengerszint alatt?", options: ["Szinte semmi", "Kb. egyharmada", "A fele", "A teljes ország"], correct: 1, explanation: "Az ország jelentős része (kb. 1/3) tengerszint alatt van — gátak és szivattyúk védik." },
  { id: "n-g-polder", topic: "geography", question: "Mi a „polder”?", options: ["Egy étel", "Tengertől/víztől elhódított, gátakkal védett földterület", "Egy tánc", "Egy hegy"], correct: 1, explanation: "Lecsapolt, mesterségesen szárazon tartott terület — a holland tájkép jellegzetessége." },
  { id: "n-g-rotterdam", topic: "geography", question: "Melyik Európa egyik legnagyobb tengeri kikötője?", options: ["Amszterdam", "Rotterdam", "Utrecht", "Groningen"], correct: 1, explanation: "Rotterdam kikötője Európa legnagyobbja." },
  { id: "n-g-randstad", topic: "geography", question: "Mi a „Randstad”?", options: ["Egy sziget", "A nyugati nagyvárosi agglomeráció (Amszterdam–Rotterdam–Den Haag–Utrecht)", "Egy folyó", "Egy provincia"], correct: 1, explanation: "A négy nagyváros sűrűn lakott gazdasági magterülete." },
  { id: "n-g-buurland", topic: "geography", question: "Mely országokkal határos Hollandia (szárazföldön)?", options: ["Németország és Belgium", "Franciaország és Németország", "Belgium és Luxemburg", "Csak Németország"], correct: 0, explanation: "Keleten Németország, délen Belgium; nyugaton az Északi-tenger." },

  // ============ CIVIC — Társadalmi normák ============
  { id: "n-c-gelijk", topic: "civic", question: "A holland alkotmány első cikke kimondja:", options: ["A király szent", "Mindenkit egyenlő bánásmód illet, a hátrányos megkülönböztetés tilos", "A vagyon szent", "A katonaság kötelező"], correct: 1, explanation: "A Grondwet 1. cikke: egyenlőség és a diszkrimináció tilalma." },
  { id: "n-c-homo", topic: "civic", question: "Az azonos neműek házassága Hollandiában:", options: ["Tilos", "Legális — a világon ELSŐként (2001)", "Csak élettársi kapcsolat", "Provinciánként eltér"], correct: 1, explanation: "Hollandia vezette be elsőként a világon az azonos neműek házasságát (2001)." },
  { id: "n-c-religie", topic: "civic", question: "A vallásszabadság Hollandiában:", options: ["Csak a protestánsoknak", "Mindenkit megillet (a vallás és a vallás-nélküliség is)", "Tilos", "Csak engedéllyel"], correct: 1, explanation: "A vallás szabad gyakorlása alkotmányos jog; az állam és az egyház elválik." },
  { id: "n-c-zorg", topic: "civic", question: "Az egészségbiztosítás (zorgverzekering) Hollandiában:", options: ["Ingyenes", "Kötelező — mindenkinek alapbiztosítást kell kötnie", "Tilos", "Csak nyugdíjasoknak"], correct: 1, explanation: "Minden lakos köteles alap-egészségbiztosítást kötni egy magánbiztosítónál." },
  { id: "n-c-stem", topic: "civic", question: "Hány évesen lehet szavazni a Tweede Kamer választáson?", options: ["16", "18", "21", "25"], correct: 1, explanation: "18 éves kortól." },
  { id: "n-c-tolerantie", topic: "civic", question: "Mi a holland társadalom egyik fő alapértéke?", options: ["Egyetlen állami vallás", "Tolerancia és vélemény-szabadság", "Cenzúra", "Kötelező katonaság"], correct: 1, explanation: "A tolerancia, a szólásszabadság és a mások véleményének tisztelete kulcsérték." },
  { id: "n-c-koningsdag", topic: "civic", question: "Mikor van a Koningsdag (Király napja)?", options: ["Január 1.", "Április 27.", "Május 5.", "December 6."], correct: 1, explanation: "Április 27. — a király születésnapja, országos ünnep (narancssárga ruhák)." },

  // ============ PROVINCIE — provincia-specifikus ============
  { id: "n-nh-amsterdam", topic: "canton", cantonCode: "NH", question: "Melyik provinciában van Amszterdam?", options: ["Zuid-Holland", "Noord-Holland", "Utrecht", "Flevoland"], correct: 1, explanation: "Amszterdam Noord-Holland provinciában fekszik." },
  { id: "n-zh-denhaag", topic: "canton", cantonCode: "ZH", question: "Melyik provinciában van Den Haag és Rotterdam?", options: ["Noord-Holland", "Zuid-Holland", "Zeeland", "Utrecht"], correct: 1, explanation: "Mindkettő Zuid-Holland provinciában." },
  { id: "n-ut-stad", topic: "canton", cantonCode: "UT", question: "Az ország közlekedési csomópontja, központi fekvésű város:", options: ["Groningen", "Utrecht", "Maastricht", "Leeuwarden"], correct: 1, explanation: "Utrecht az ország közepén — a vasúthálózat központja." },
  { id: "n-nb-eindhoven", topic: "canton", cantonCode: "NB", question: "Melyik technológiai város (Philips, ASML) van Noord-Brabantban?", options: ["Tilburg", "Eindhoven", "Breda", "Den Bosch"], correct: 1, explanation: "Eindhoven — a holland high-tech ipar központja." },
];

export const NL_QUIZ_LENGTH = 15;
export const NL_PASS_THRESHOLD = 60; // %

const NL_MIX: { topic: EbTopic; count: number }[] = [
  { topic: "federal",   count: 5 },
  { topic: "history",   count: 3 },
  { topic: "geography", count: 3 },
  { topic: "civic",     count: 3 },
  { topic: "canton",    count: 1 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Egy menet sorsolása — országos témák + a választott provincia kérdése. */
export function generateQuizNL(provinceCode: string | null): EbQuestion[] {
  const result: EbQuestion[] = [];
  const used = new Set<string>();
  for (const mix of NL_MIX) {
    let pool: EbQuestion[];
    if (mix.topic === "canton") {
      pool = provinceCode
        ? NL_BANK.filter((q) => q.topic === "canton" && q.cantonCode === provinceCode)
        : NL_BANK.filter((q) => q.topic === "canton");
    } else {
      pool = NL_BANK.filter((q) => q.topic === mix.topic);
    }
    for (const q of shuffle(pool)) {
      if (result.length >= NL_QUIZ_LENGTH) break;
      if (!used.has(q.id)) { used.add(q.id); result.push(q); }
      if (result.filter((r) => r.topic === mix.topic).length >= mix.count) break;
    }
  }
  for (const q of shuffle(NL_BANK)) {
    if (result.length >= NL_QUIZ_LENGTH) break;
    if (!used.has(q.id)) { used.add(q.id); result.push(q); }
  }
  return shuffle(result).slice(0, NL_QUIZ_LENGTH);
}
