/**
 * Einbürgerungstest („Leben in Deutschland”) szimulátor — német kérdés-bank.
 *
 * FONTOS: ez NEM hivatalos teszt. A valódi német Einbürgerungstest 33 kérdésből
 * áll (300 általános + 10 tartomány-specifikus katalógusból), 17 helyes = átment.
 * Ez egy FELKÉSZÍTŐ szimulátor a tipikus témakörökhöz — közelítő megfogalmazással,
 * nem a hivatalos kérdés-szöveggel.
 *
 * Forrás: a hivatalos BAMF „Leben in Deutschland” témakörök (Grundgesetz,
 * történelem, föderalizmus, jogok) alapján.
 */
import type { EbQuestion, EbTopic } from "./einburgerung-bank";

export const DE_TOPIC_META: Record<EbTopic, { label: string; emoji: string; color: string }> = {
  federal:   { label: "Politika / GG", emoji: "🏛️", color: "#1d4434" },
  history:   { label: "Történelem",    emoji: "📜", color: "#7f4a1d" },
  geography: { label: "Földrajz",      emoji: "🗺️", color: "#2c7a7b" },
  civic:     { label: "Alapjogok",     emoji: "🗳️", color: "#5b21b6" },
  canton:    { label: "Bundesland",    emoji: "🇩🇪", color: "#dc2626" },
};

/** Bundesländer, ahol vannak specifikus kérdések (a regions.ts DE-kódjaival). */
export const DE_BUNDESLAENDER = [
  { code: "BY", name: "Bayern" },
  { code: "BW", name: "Baden-Württemberg" },
  { code: "BE", name: "Berlin" },
  { code: "NW", name: "Nordrhein-Westfalen" },
  { code: "HH", name: "Hamburg" },
  { code: "HE", name: "Hessen" },
  { code: "SN", name: "Sachsen" },
];

export const DE_BANK: EbQuestion[] = [
  // ============ FEDERAL — Politikai rendszer / Grundgesetz ============
  { id: "d-f-gg", topic: "federal", question: "Mi a neve Németország alkotmányának?", options: ["Verfassung", "Grundgesetz", "Bundescharta", "Reichsgesetz"], correct: 1, explanation: "A Grundgesetz (Alaptörvény), 1949-ben lépett hatályba." },
  { id: "d-f-gg-jahr", topic: "federal", question: "Mikor lépett hatályba a Grundgesetz?", options: ["1919", "1933", "1949", "1990"], correct: 2, explanation: "1949 — a Németországi Szövetségi Köztársaság (BRD) megalapításakor." },
  { id: "d-f-bundestag", topic: "federal", question: "Hogy hívják a német szövetségi parlamentet?", options: ["Bundesrat", "Bundestag", "Reichstag", "Nationalrat"], correct: 1, explanation: "A Bundestag — a polgárok közvetlenül választják. (A Reichstag az épület neve Berlinben.)" },
  { id: "d-f-kanzler", topic: "federal", question: "Ki a kormányfő Németországban?", options: ["A Bundespräsident", "A Bundeskanzler", "A Bundesratspräsident", "A király"], correct: 1, explanation: "A Bundeskanzler(in) — a kormány vezetője, a Bundestag választja." },
  { id: "d-f-praesident", topic: "federal", question: "Mi a Bundespräsident szerepe?", options: ["A kormányt vezeti", "Főleg reprezentatív államfő", "A hadsereget vezényli", "A Bundestagot vezeti"], correct: 1, explanation: "Az államfő — főleg reprezentatív/protokolláris szerep; 5 évre választják." },
  { id: "d-f-laender", topic: "federal", question: "Hány tartományból (Bundesland) áll Németország?", options: ["13", "16", "18", "20"], correct: 1, explanation: "16 Bundesland — Németország szövetségi állam (föderáció)." },
  { id: "d-f-bundesrat", topic: "federal", question: "Mit képvisel a Bundesrat?", options: ["A polgárokat", "A tartományokat (Länder)", "Az EU-t", "A bíróságokat"], correct: 1, explanation: "A Bundesrat a 16 tartomány képviselete a szövetségi törvényhozásban." },
  { id: "d-f-wahl", topic: "federal", question: "Hány évente tartanak rendes Bundestag-választást?", options: ["2 év", "4 év", "5 év", "6 év"], correct: 1, explanation: "4 évente (a Grundgesetz szerint)." },
  { id: "d-f-parteien", topic: "federal", question: "Melyik NEM egy német párt?", options: ["CDU", "SPD", "ÖVP", "Die Grünen"], correct: 2, explanation: "Az ÖVP osztrák párt. A CDU/CSU, SPD, Grüne, FDP, AfD, Linke németek." },
  { id: "d-f-rechtsstaat", topic: "federal", question: "Mit jelent a „Rechtsstaat”?", options: ["Vallási állam", "Jogállam — mindenki a törvénynek van alávetve", "Katonai állam", "Egypártrendszer"], correct: 1, explanation: "Jogállam: az állami hatalmat is a törvény köti; független bíróságok." },
  { id: "d-f-gewalt", topic: "federal", question: "A hatalmi ágak szétválasztása szerint NEM önálló ág:", options: ["Törvényhozás", "Végrehajtás", "Igazságszolgáltatás", "Sajtó"], correct: 3, explanation: "A három ág: törvényhozó, végrehajtó, bírói. A sajtó a „negyedik hatalom”, de nem alkotmányos ág." },

  // ============ HISTORY — Történelem ============
  { id: "d-h-ns", topic: "history", question: "Mikor volt hatalmon a nemzetiszocialista (náci) rezsim?", options: ["1918–1933", "1933–1945", "1945–1949", "1949–1990"], correct: 1, explanation: "1933–1945 — Hitler diktatúrája, a II. világháború és a Holokauszt." },
  { id: "d-h-holocaust", topic: "history", question: "Mi volt a Holokauszt?", options: ["Gazdasági válság", "A zsidóság és más csoportok népirtása a nácik által", "Egy csata", "Egy békeszerződés"], correct: 1, explanation: "A náci rezsim hatmillió zsidót és más üldözött csoportokat gyilkolt meg." },
  { id: "d-h-teilung", topic: "history", question: "Hogy hívták a két német államot 1949–1990 között?", options: ["BRD és DDR", "Bayern és Preußen", "Nyugat és Kelet-Poroszország", "BRD és ÖVP"], correct: 0, explanation: "BRD (NSZK, nyugat) és DDR (NDK, kelet) — a hidegháború megosztotta Németországot." },
  { id: "d-h-mauer", topic: "history", question: "Mikor épült a berlini fal?", options: ["1949", "1961", "1989", "1990"], correct: 1, explanation: "1961-ben emelte az NDK; 1989. november 9-én bontották le." },
  { id: "d-h-mauerfall", topic: "history", question: "Mikor dőlt le a berlini fal?", options: ["1985", "1989", "1991", "1993"], correct: 1, explanation: "1989. november 9. — a békés forradalom (Wende) része." },
  { id: "d-h-einheit", topic: "history", question: "Mikor egyesült újra Németország?", options: ["1989", "1990", "1991", "1995"], correct: 1, explanation: "1990. október 3. — ez ma a Tag der Deutschen Einheit (nemzeti ünnep)." },
  { id: "d-h-weimar", topic: "history", question: "Mi volt a Weimari Köztársaság?", options: ["Németország első demokráciája (1919–1933)", "Egy középkori város", "A náci párt", "Egy gyarmat"], correct: 0, explanation: "Az első német demokratikus köztársaság, amely a náci hatalomátvétellel bukott el." },

  // ============ GEOGRAPHY — Földrajz ============
  { id: "d-g-hauptstadt", topic: "geography", question: "Mi Németország fővárosa?", options: ["München", "Hamburg", "Berlin", "Frankfurt"], correct: 2, explanation: "Berlin — egyben tartomány (Stadtstaat) is." },
  { id: "d-g-flagge", topic: "geography", question: "Milyen színű a német zászló (fentről)?", options: ["Fekete-piros-arany", "Piros-fehér-fekete", "Fekete-arany-piros", "Piros-arany-fekete"], correct: 0, explanation: "Schwarz-Rot-Gold (fekete-piros-arany), vízszintes sávok." },
  { id: "d-g-fluss", topic: "geography", question: "Melyik a leghosszabb, Németországon átfolyó folyó?", options: ["Elba", "Rajna (Rhein)", "Duna", "Majna"], correct: 1, explanation: "A Rajna a legfontosabb német folyó (a Duna délen folyik át)." },
  { id: "d-g-nachbarn", topic: "geography", question: "Hány szomszédos országa van Németországnak?", options: ["5", "7", "9", "11"], correct: 2, explanation: "9 ország — a legtöbb szomszédja Európában (pl. Franciaország, Lengyelország, Ausztria, Csehország…)." },
  { id: "d-g-groesste", topic: "geography", question: "Melyik a legnagyobb német város (lakosság)?", options: ["Hamburg", "München", "Berlin", "Köln"], correct: 2, explanation: "Berlin (~3,7 millió), majd Hamburg, München, Köln." },
  { id: "d-g-stadtstaat", topic: "geography", question: "Melyik egy „város-tartomány” (Stadtstaat)?", options: ["Bayern", "Hamburg", "Hessen", "Sachsen"], correct: 1, explanation: "Hamburg, Bremen és Berlin a három Stadtstaat (egyszerre város és tartomány)." },

  // ============ CIVIC — Alapjogok / társadalom ============
  { id: "d-c-grundrechte", topic: "civic", question: "Hol vannak rögzítve az alapjogok (Grundrechte)?", options: ["A büntető törvénykönyvben", "A Grundgesetz első cikkeiben", "Az EU-szerződésben", "Egy rendeletben"], correct: 1, explanation: "A Grundgesetz 1–19. cikkei. Az 1. cikk: „Az emberi méltóság sérthetetlen.”" },
  { id: "d-c-wuerde", topic: "civic", question: "Mit mond ki a Grundgesetz 1. cikke?", options: ["Az állam szent", "Az emberi méltóság sérthetetlen", "A király sérthetetlen", "A vagyon szent"], correct: 1, explanation: "„Die Würde des Menschen ist unantastbar.” — a német alkotmány alapelve." },
  { id: "d-c-religion", topic: "civic", question: "A vallásszabadság Németországban:", options: ["Csak keresztényeknek", "Mindenkit megillet", "Tilos", "Csak állami engedéllyel"], correct: 1, explanation: "A vallás (és a vallás nélküliség) szabadsága mindenkit megillet (GG 4. cikk)." },
  { id: "d-c-meinung", topic: "civic", question: "A véleménynyilvánítás szabadsága azt jelenti:", options: ["Bármit, korlát nélkül", "Szabadon kifejezheted a véleményed, de tilos pl. a gyűlöletre uszítás", "Csak a kormányt dicsérheted", "Csak írásban"], correct: 1, explanation: "Szabad vélemény — de a méltóság, a rágalmazás és az uszítás tilalma korlátot szab." },
  { id: "d-c-wahlalter", topic: "civic", question: "Hány évesen lehet először szavazni a Bundestag-választáson?", options: ["16", "18", "21", "25"], correct: 1, explanation: "18 év (aktív választójog a szövetségi választáson)." },
  { id: "d-c-gleich", topic: "civic", question: "A férfiak és nők jogai Németországban:", options: ["A nőknek kevesebb", "Egyenlők (GG 3. cikk)", "A férfiaknak kevesebb", "Tartományonként eltér"], correct: 1, explanation: "A férfiak és nők egyenjogúak — alkotmányos alapelv." },
  { id: "d-c-presse", topic: "civic", question: "A sajtószabadság azt jelenti:", options: ["Az állam írja a híreket", "A média az államtól függetlenül tudósíthat", "Csak engedéllyel lehet újságot kiadni", "Tilos a kritika"], correct: 1, explanation: "A független sajtó a demokrácia alappillére (GG 5. cikk)." },
  { id: "d-c-ehe", topic: "civic", question: "Az azonos neműek házassága Németországban:", options: ["Tilos", "Legális (2017 óta)", "Csak bejegyzett élettárs", "Tartományonként eltér"], correct: 1, explanation: "2017 óta („Ehe für alle”) az azonos neműek is házasodhatnak." },

  // ============ BUNDESLAND — tartomány-specifikus ============
  { id: "d-by-hs", topic: "canton", cantonCode: "BY", question: "Mi Bayern (Bajorország) fővárosa?", options: ["Nürnberg", "München", "Augsburg", "Regensburg"], correct: 1, explanation: "München — Bayern a legnagyobb területű német tartomány." },
  { id: "d-bw-hs", topic: "canton", cantonCode: "BW", question: "Mi Baden-Württemberg fővárosa?", options: ["Karlsruhe", "Mannheim", "Stuttgart", "Freiburg"], correct: 2, explanation: "Stuttgart — az autóipar (Mercedes, Porsche) központja." },
  { id: "d-be-stadt", topic: "canton", cantonCode: "BE", question: "Berlin egyszerre:", options: ["Csak város", "Város ÉS tartomány (Stadtstaat)", "Csak tartomány", "Egy kerület"], correct: 1, explanation: "Berlin a főváros és egyben önálló tartomány." },
  { id: "d-nw-hs", topic: "canton", cantonCode: "NW", question: "Mi Nordrhein-Westfalen fővárosa?", options: ["Köln", "Düsseldorf", "Dortmund", "Essen"], correct: 1, explanation: "Düsseldorf — NRW a legnépesebb német tartomány (~18 millió)." },
  { id: "d-hh-stadt", topic: "canton", cantonCode: "HH", question: "Hamburg jellemzője:", options: ["Tengeri kikötőváros és Stadtstaat", "Alpesi tartomány", "A főváros", "Egy sziget"], correct: 0, explanation: "Hamburg Németország legnagyobb kikötője, egyben Stadtstaat." },
  { id: "d-he-hs", topic: "canton", cantonCode: "HE", question: "Melyik nagyváros van Hessen tartományban (pénzügyi központ)?", options: ["Stuttgart", "Frankfurt am Main", "Köln", "Leipzig"], correct: 1, explanation: "Frankfurt — az Európai Központi Bank (EZB) és a tőzsde székhelye." },
  { id: "d-sn-hs", topic: "canton", cantonCode: "SN", question: "Mi Sachsen (Szászország) fővárosa?", options: ["Leipzig", "Dresden", "Chemnitz", "Erfurt"], correct: 1, explanation: "Dresden — Lipcse (Leipzig) a nagyobb város, de a főváros Dresden." },
];

export const DE_QUIZ_LENGTH = 15;
export const DE_PASS_THRESHOLD = 60; // %

const DE_MIX: { topic: EbTopic; count: number }[] = [
  { topic: "federal",   count: 5 },
  { topic: "history",   count: 3 },
  { topic: "geography", count: 2 },
  { topic: "civic",     count: 3 },
  { topic: "canton",    count: 2 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Egy menet sorsolása — szövetségi témák + a választott Bundesland kérdései. */
export function generateQuizDE(bundeslandCode: string | null): EbQuestion[] {
  const result: EbQuestion[] = [];
  const used = new Set<string>();
  for (const mix of DE_MIX) {
    let pool: EbQuestion[];
    if (mix.topic === "canton") {
      pool = bundeslandCode
        ? DE_BANK.filter((q) => q.topic === "canton" && q.cantonCode === bundeslandCode)
        : DE_BANK.filter((q) => q.topic === "canton");
    } else {
      pool = DE_BANK.filter((q) => q.topic === mix.topic);
    }
    for (const q of shuffle(pool)) {
      if (result.length >= DE_QUIZ_LENGTH) break;
      if (!used.has(q.id)) { used.add(q.id); result.push(q); }
      if (result.filter((r) => r.topic === mix.topic).length >= mix.count) break;
    }
  }
  // Feltöltés a kívánt hosszra bármely még nem használt kérdéssel.
  for (const q of shuffle(DE_BANK)) {
    if (result.length >= DE_QUIZ_LENGTH) break;
    if (!used.has(q.id)) { used.add(q.id); result.push(q); }
  }
  return shuffle(result).slice(0, DE_QUIZ_LENGTH);
}
