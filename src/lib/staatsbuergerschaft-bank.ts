/**
 * Staatsbürgerschaftstest-szimulátor — osztrák kérdés-bank.
 *
 * FONTOS: ez NEM hivatalos teszt. A valódi osztrák állampolgársági teszt
 * (Staatsbürgerschaftstest) egy SZÖVETSÉGI rész (történelem, demokrácia,
 * intézmények) + a lakóhely szerinti BUNDESLAND rész kérdéseiből áll. Ez egy
 * FELKÉSZÍTŐ szimulátor a tipikus témakörökhöz.
 *
 * Forrás: oesterreich.gv.at, BMI, a hivatalos felkészítő-anyagok témakörei
 * alapján — közelítő megfogalmazással, nem a hivatalos kérdés-szöveggel.
 */

import type { EbQuestion, EbTopic } from "./einburgerung-bank";

export const AT_TOPIC_META: Record<EbTopic, { label: string; emoji: string; color: string }> = {
  federal:   { label: "Demokrácia / Bund", emoji: "🏛️", color: "#1d4434" },
  history:   { label: "Történelem",         emoji: "📜", color: "#7f4a1d" },
  geography: { label: "Földrajz",           emoji: "🗺️", color: "#2c7a7b" },
  civic:     { label: "Jogok / EU",         emoji: "🗳️", color: "#5b21b6" },
  canton:    { label: "Bundesland",         emoji: "🇦🇹", color: "#c8102e" },
};

/** Bundesländer, ahol vannak specifikus kérdések (a regions.ts AT-kódjaival). */
export const AT_BUNDESLAENDER = [
  { code: "W", name: "Bécs" },
  { code: "NOE", name: "Alsó-A." },
  { code: "OOE", name: "Felső-A." },
  { code: "STM", name: "Stájer." },
  { code: "TIR", name: "Tirol" },
  { code: "KTN", name: "Karintia" },
  { code: "SBG", name: "Salzburg" },
  { code: "VBG", name: "Vorarlb." },
  { code: "BGL", name: "Burgenl." },
];

export const AT_BANK: EbQuestion[] = [
  // ════════════ FEDERAL — Demokrácia, intézmények, állam ════════════
  {
    id: "at-f-nationalrat",
    topic: "federal",
    question: "Hány képviselője van a Nationalratnak (Nemzeti Tanács)?",
    options: ["100", "150", "183", "200"],
    correct: 2,
    explanation: "183 képviselő. A Nationalrat a parlament alsó (fő) háza, 5 évre választják.",
  },
  {
    id: "at-f-zweikammer",
    topic: "federal",
    question: "Melyik a két kamarája az osztrák parlamentnek?",
    options: ["Nationalrat és Bundesrat", "Bundestag és Senat", "Landtag és Senat", "Nationalrat és Landtag"],
    correct: 0,
    explanation: "Nationalrat (a nép képviselete) + Bundesrat (a Bundesländer képviselete). Együtt a Bundesversammlung.",
  },
  {
    id: "at-f-bundespraesident-term",
    topic: "federal",
    question: "Hány évre választják a szövetségi elnököt (Bundespräsident)?",
    options: ["4 év", "5 év", "6 év", "7 év"],
    correct: 2,
    explanation: "6 évre, közvetlenül a nép választja. Egyszer újraválasztható. Ő nevezi ki a kancellárt.",
  },
  {
    id: "at-f-bundeskanzler",
    topic: "federal",
    question: "Ki a szövetségi kormány (Bundesregierung) feje?",
    options: ["A Bundespräsident", "A Bundeskanzler", "A Nationalrat elnöke", "A Bundesrat elnöke"],
    correct: 1,
    explanation: "A Bundeskanzler (szövetségi kancellár) a kormányfő. A Bundespräsident államfő, de a kormányt a kancellár vezeti.",
  },
  {
    id: "at-f-laender",
    topic: "federal",
    question: "Hány szövetségi tartományból (Bundesland) áll Ausztria?",
    options: ["6", "8", "9", "16"],
    correct: 2,
    explanation: "9 Bundesland. Ausztria szövetségi köztársaság (Bundesstaat), minden tartománynak saját Landtagja és kormánya van.",
  },
  {
    id: "at-f-staatsform",
    topic: "federal",
    question: "Milyen államforma Ausztria?",
    options: ["Alkotmányos monarchia", "Szövetségi köztársaság", "Konföderáció", "Központosított köztársaság"],
    correct: 1,
    explanation: "Demokratikus szövetségi köztársaság (demokratische Bundesrepublik). 1918 óta köztársaság, 9 tartománnyal.",
  },
  {
    id: "at-f-neutralitaet",
    topic: "federal",
    question: "Mi jellemzi Ausztria katonai státuszát 1955 óta?",
    options: ["NATO-tag", "Állandó semlegesség (Neutralität)", "Katonai szövetség nélkül, de NATO-jelölt", "Németország szövetségese"],
    correct: 1,
    explanation: "Állandó (örökös) semlegesség — az 1955-ös Neutralitätsgesetz rögzítette. Ausztria nem lép katonai szövetségbe.",
  },
  {
    id: "at-f-eu",
    topic: "federal",
    question: "Mióta tagja Ausztria az Európai Uniónak?",
    options: ["1955", "1989", "1995", "2004"],
    correct: 2,
    explanation: "1995. január 1. óta EU-tag (Finnországgal és Svédországgal együtt). 2002 óta az euró a fizetőeszköz.",
  },
  {
    id: "at-f-verfassung",
    topic: "federal",
    question: "Hogy hívják Ausztria alkotmányának alaptörvényét?",
    options: ["Grundgesetz", "Bundes-Verfassungsgesetz (B-VG)", "Verfassungscharta", "Staatsgrundgesetz"],
    correct: 1,
    explanation: "Bundes-Verfassungsgesetz (B-VG), 1920-ból, Hans Kelsen közreműködésével. Ez az alkotmányos rend alapja.",
  },
  {
    id: "at-f-vfgh",
    topic: "federal",
    question: "Melyik bíróság őrködik az alkotmány felett?",
    options: ["Oberster Gerichtshof (OGH)", "Verfassungsgerichtshof (VfGH)", "Verwaltungsgerichtshof (VwGH)", "Landesgericht"],
    correct: 1,
    explanation: "A Verfassungsgerichtshof (VfGH, Alkotmánybíróság) vizsgálja a törvények alkotmányosságát.",
  },
  {
    id: "at-f-hymne",
    topic: "federal",
    question: "Mi Ausztria himnuszának kezdősora?",
    options: ["„Land der Berge, Land am Strome”", "„Gott erhalte”", "„Einigkeit und Recht und Freiheit”", "„Österreich, mein Heimatland”"],
    correct: 0,
    explanation: "„Land der Berge, Land am Strome…” (Hegyek országa, folyam menti ország). A dallam Mozartnak tulajdonított.",
  },

  // ════════════ HISTORY — Történelem ════════════
  {
    id: "at-h-republik-1918",
    topic: "history",
    question: "Mikor lett Ausztria köztársaság a Habsburg-monarchia után?",
    options: ["1867", "1918", "1938", "1955"],
    correct: 1,
    explanation: "1918-ban, az első világháború és az Osztrák–Magyar Monarchia felbomlása után kiáltották ki a köztársaságot.",
  },
  {
    id: "at-h-anschluss",
    topic: "history",
    question: "Mi történt 1938-ban (Anschluss)?",
    options: ["Ausztria EU-tag lett", "A náci Németország bekebelezte Ausztriát", "Kikiáltották a köztársaságot", "Aláírták az államszerződést"],
    correct: 1,
    explanation: "1938: az „Anschluss” — a náci Németország annektálta Ausztriát. 1945-ig a Harmadik Birodalom része volt.",
  },
  {
    id: "at-h-1945",
    topic: "history",
    question: "Mi történt 1945-ben?",
    options: ["EU-csatlakozás", "A II. világháború vége, Ausztria felszabadult, 4 megszállási zóna", "Az euró bevezetése", "A semlegesség kihirdetése"],
    correct: 1,
    explanation: "1945: a háború vége. Ausztriát a győztes hatalmak (USA, SZU, UK, Franciaország) 4 zónára osztották 1955-ig.",
  },
  {
    id: "at-h-staatsvertrag",
    topic: "history",
    question: "Mit jelentett az 1955-ös Staatsvertrag (államszerződés)?",
    options: ["Ausztria EU-tag lett", "Ausztria visszanyerte függetlenségét, a megszálló csapatok kivonultak", "Ausztria NATO-tag lett", "Ausztria monarchiává vált"],
    correct: 1,
    explanation: "1955: az államszerződéssel Ausztria szabad és független lett („Österreich ist frei!”), a 4 hatalom kivonult.",
  },
  {
    id: "at-h-nationalfeiertag",
    topic: "history",
    question: "Melyik nap az osztrák nemzeti ünnep (Nationalfeiertag)?",
    options: ["március 15.", "május 1.", "október 26.", "december 6."],
    correct: 2,
    explanation: "Október 26. — 1955-ben e napon fogadták el a semlegességi törvényt (Neutralitätsgesetz).",
  },
  {
    id: "at-h-monarchie",
    topic: "history",
    question: "Hogy hívták az államot, amelynek Ausztria 1867–1918 közt a része volt?",
    options: ["Német Szövetség", "Osztrák–Magyar Monarchia", "Szent Római Birodalom", "Habsburg Köztársaság"],
    correct: 1,
    explanation: "Az Osztrák–Magyar Monarchia (k. u. k.), a Habsburgok kettős birodalma, 1918-ban bomlott fel.",
  },

  // ════════════ GEOGRAPHY — Földrajz ════════════
  {
    id: "at-g-hauptstadt",
    topic: "geography",
    question: "Mi Ausztria fővárosa?",
    options: ["Graz", "Salzburg", "Bécs (Wien)", "Linz"],
    correct: 2,
    explanation: "Bécs (Wien) — egyben önálló Bundesland és a legnagyobb város (~2 millió fő).",
  },
  {
    id: "at-g-glockner",
    topic: "geography",
    question: "Mi Ausztria legmagasabb hegye?",
    options: ["Großglockner", "Zugspitze", "Matterhorn", "Dachstein"],
    correct: 0,
    explanation: "A Großglockner (3798 m) a legmagasabb. Ausztria nagy részét az Alpok borítják.",
  },
  {
    id: "at-g-donau",
    topic: "geography",
    question: "Melyik nagy folyó szeli át Ausztriát (Bécset is)?",
    options: ["Rajna", "Duna (Donau)", "Elba", "Inn"],
    correct: 1,
    explanation: "A Duna (Donau) — nyugatról keletre folyik, érinti Linzet és Bécset is.",
  },
  {
    id: "at-g-nachbarn",
    topic: "geography",
    question: "Hány országgal határos Ausztria?",
    options: ["4", "6", "8", "10"],
    correct: 2,
    explanation: "8 szomszéd: Németország, Csehország, Szlovákia, Magyarország, Szlovénia, Olaszország, Svájc, Liechtenstein.",
  },
  {
    id: "at-g-neusiedler",
    topic: "geography",
    question: "Melyik Ausztria legnagyobb (sztyeppei) tava keleten?",
    options: ["Bodeni-tó", "Neusiedler See (Fertő)", "Wörthersee", "Attersee"],
    correct: 1,
    explanation: "A Neusiedler See (Fertő tó) Burgenlandban — sekély, sztyeppei tó, részben Magyarországra is átnyúlik.",
  },

  // ════════════ CIVIC — Jogok, demokrácia, EU ════════════
  {
    id: "at-c-wahlalter",
    topic: "civic",
    question: "Hány éves kortól lehet szavazni Ausztriában (Nationalrat-választás)?",
    options: ["16", "18", "21", "14"],
    correct: 0,
    explanation: "16 éves kortól — Ausztria az EU-ban az elsők közt vezette be a 16 éves választójogot.",
  },
  {
    id: "at-c-schulpflicht",
    topic: "civic",
    question: "Hány év a tankötelezettség Ausztriában?",
    options: ["8 év", "9 év", "10 év", "12 év"],
    correct: 1,
    explanation: "9 év tankötelezettség (kb. 6–15 éves kor). Az állami iskola ingyenes.",
  },
  {
    id: "at-c-gewaltenteilung",
    topic: "civic",
    question: "Mit jelent a hatalmi ágak szétválasztása (Gewaltenteilung)?",
    options: ["A tartományok függetlensége", "Törvényhozó, végrehajtó és bírói hatalom elkülönülése", "Az egyház és állam szétválasztása", "A kétkamarás parlament"],
    correct: 1,
    explanation: "A törvényhozó (parlament), a végrehajtó (kormány) és a bírói (független bíróságok) hatalom elkülönül — a jogállam alapja.",
  },
  {
    id: "at-c-euro",
    topic: "civic",
    question: "Mi Ausztria pénzneme?",
    options: ["Osztrák schilling", "Euró", "Svájci frank", "Korona"],
    correct: 1,
    explanation: "Az euró (2002 óta). Korábban az osztrák schilling (ATS) volt a fizetőeszköz.",
  },
  {
    id: "at-c-sozialpartner",
    topic: "civic",
    question: "Mi a Sozialpartnerschaft (szociális partnerség) lényege Ausztriában?",
    options: ["Pártszövetség", "A munkaadók és munkavállalók érdekképviseleteinek együttműködése", "Egyházi jótékonyság", "EU-s támogatási rendszer"],
    correct: 1,
    explanation: "A munkaadói (WKO) és munkavállalói (AK, ÖGB) kamarák/szakszervezetek egyeztetése — az osztrák gazdaság- és bérpolitika jellemzője.",
  },

  // ════════════ BUNDESLAND — tartomány-specifikus ════════════
  // Bécs (W)
  { id: "at-bl-w-1", topic: "canton", cantonCode: "W", question: "Mi jellemző Bécsre (Wien)?", options: ["Csak város, nem tartomány", "Egyszerre város ÉS önálló Bundesland", "Alsó-Ausztria fővárosa", "Nem osztrák terület"], correct: 1, explanation: "Bécs egyszerre város és önálló Bundesland — egyben Ausztria fővárosa és legnépesebb városa." },
  { id: "at-bl-w-2", topic: "canton", cantonCode: "W", question: "Melyik híres gótikus dóm áll Bécs központjában?", options: ["Kölni dóm", "Stephansdom (Szent István-dóm)", "Salzburgi dóm", "Linzi dóm"], correct: 1, explanation: "A Stephansdom (Szent István-székesegyház) Bécs jelképe, a Stephansplatzon." },
  // Alsó-Ausztria (NOE)
  { id: "at-bl-noe-1", topic: "canton", cantonCode: "NOE", question: "Mi Alsó-Ausztria (Niederösterreich) fővárosa?", options: ["Krems", "St. Pölten", "Wiener Neustadt", "Bécs"], correct: 1, explanation: "St. Pölten — 1986 óta Alsó-Ausztria fővárosa. NÖ a legnagyobb területű Bundesland." },
  { id: "at-bl-noe-2", topic: "canton", cantonCode: "NOE", question: "Melyik tartomány veszi körül teljesen Bécset?", options: ["Burgenland", "Niederösterreich (Alsó-Ausztria)", "Steiermark", "Oberösterreich"], correct: 1, explanation: "Alsó-Ausztria gyűrűként veszi körül Bécset." },
  // Felső-Ausztria (OOE)
  { id: "at-bl-ooe-1", topic: "canton", cantonCode: "OOE", question: "Mi Felső-Ausztria (Oberösterreich) fővárosa?", options: ["Wels", "Steyr", "Linz", "Gmunden"], correct: 2, explanation: "Linz — a Duna mentén, Ausztria harmadik legnagyobb városa, fontos ipari központ." },
  { id: "at-bl-ooe-2", topic: "canton", cantonCode: "OOE", question: "Melyik folyó mellett fekszik Linz?", options: ["Inn", "Duna (Donau)", "Mur", "Salzach"], correct: 1, explanation: "Linz a Duna partján fekszik." },
  // Stájerország (STM)
  { id: "at-bl-stm-1", topic: "canton", cantonCode: "STM", question: "Mi Stájerország (Steiermark) fővárosa?", options: ["Graz", "Leoben", "Bruck", "Kapfenberg"], correct: 0, explanation: "Graz — Ausztria második legnagyobb városa, óvárosa UNESCO-világörökség." },
  { id: "at-bl-stm-2", topic: "canton", cantonCode: "STM", question: "Milyen melléknévvel illetik gyakran Stájerországot?", options: ["„Ausztria tengere”", "„Ausztria zöld szíve” (das grüne Herz)", "„A jég országa”", "„A nyugati kapu”"], correct: 1, explanation: "Stájerország „Ausztria zöld szíve” — erdős, mezőgazdasági tartomány." },
  // Tirol (TIR)
  { id: "at-bl-tir-1", topic: "canton", cantonCode: "TIR", question: "Mi Tirol fővárosa?", options: ["Kitzbühel", "Innsbruck", "Kufstein", "Lienz"], correct: 1, explanation: "Innsbruck — kétszer rendezett téli olimpiát (1964, 1976), az Alpok közt fekszik." },
  { id: "at-bl-tir-2", topic: "canton", cantonCode: "TIR", question: "Mi jellemzi Tirol földrajzát?", options: ["Sík, alföldi", "Magashegységi (Alpok), két részre osztva Kelet- és Észak-Tirolra", "Tengerparti", "Sztyeppei"], correct: 1, explanation: "Tirol erősen hegyvidéki; Osttirol (Kelet-Tirol) földrajzilag elkülönül Észak-Tiroltól." },
  // Karintia (KTN)
  { id: "at-bl-ktn-1", topic: "canton", cantonCode: "KTN", question: "Mi Karintia (Kärnten) fővárosa?", options: ["Villach", "Klagenfurt", "Spittal", "Wolfsberg"], correct: 1, explanation: "Klagenfurt am Wörthersee — a déli, tavairól ismert tartomány központja." },
  { id: "at-bl-ktn-2", topic: "canton", cantonCode: "KTN", question: "Miről híres Karintia (turisztikailag)?", options: ["Sivatagok", "Meleg tavai (pl. Wörthersee)", "Tengerpart", "Vulkánok"], correct: 1, explanation: "Karintia a déli, napos tartomány — fürdésre alkalmas meleg tavakkal (Wörthersee, Millstätter See)." },
  // Salzburg (SBG)
  { id: "at-bl-sbg-1", topic: "canton", cantonCode: "SBG", question: "Melyik világhírű zeneszerző született Salzburgban?", options: ["Beethoven", "W. A. Mozart", "J. Strauss", "Schubert"], correct: 1, explanation: "Wolfgang Amadeus Mozart Salzburgban született (1756). A városban van a híres Salzburgi Ünnepi Játékok." },
  { id: "at-bl-sbg-2", topic: "canton", cantonCode: "SBG", question: "Mi Salzburg tartomány fővárosa?", options: ["Hallein", "Salzburg városa", "Zell am See", "Saalfelden"], correct: 1, explanation: "Salzburg városa — óvárosa UNESCO-világörökség, a Festunggal (Hohensalzburg vár)." },
  // Vorarlberg (VBG)
  { id: "at-bl-vbg-1", topic: "canton", cantonCode: "VBG", question: "Mi Vorarlberg fővárosa?", options: ["Dornbirn", "Feldkirch", "Bregenz", "Bludenz"], correct: 2, explanation: "Bregenz — a Bodeni-tó (Bodensee) partján; híres a tavi színpadáról (Bregenzer Festspiele)." },
  { id: "at-bl-vbg-2", topic: "canton", cantonCode: "VBG", question: "Hol fekszik Vorarlberg, Ausztria legnyugatibb tartománya?", options: ["A Bodeni-tó és az Alpok közt, Svájc/Liechtenstein mellett", "A magyar határnál", "A Duna torkolatánál", "Karintia mellett délen"], correct: 0, explanation: "Vorarlberg a legnyugatibb tartomány, a Bodeni-tónál, Svájccal és Liechtensteinnel határos." },
  // Burgenland (BGL)
  { id: "at-bl-bgl-1", topic: "canton", cantonCode: "BGL", question: "Mi Burgenland fővárosa?", options: ["Eisenstadt", "Neusiedl", "Oberwart", "Mattersburg"], correct: 0, explanation: "Eisenstadt — a legkisebb tartományi főváros; itt élt és alkotott Joseph Haydn." },
  { id: "at-bl-bgl-2", topic: "canton", cantonCode: "BGL", question: "Mi jellemző Burgenlandra?", options: ["A legnyugatibb, hegyvidéki tartomány", "A legkeletibb tartomány, a magyar határ mentén, a Fertő tóval", "Tengerparti tartomány", "Ausztria legmagasabb hegyei"], correct: 1, explanation: "Burgenland a legkeletibb tartomány, Magyarországgal határos; 1921-ben került Ausztriához. Itt fekszik a Fertő tó." },
];

export const AT_QUIZ_LENGTH = 15;
export const AT_PASS_THRESHOLD = 80; // %

const AT_MIX: { topic: EbTopic; count: number }[] = [
  { topic: "federal",   count: 5 },
  { topic: "history",   count: 3 },
  { topic: "geography", count: 2 },
  { topic: "civic",     count: 2 },
  { topic: "canton",    count: 3 },
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
export function generateQuizAT(bundeslandCode: string | null): EbQuestion[] {
  const result: EbQuestion[] = [];
  const used = new Set<string>();

  for (const mix of AT_MIX) {
    let pool: EbQuestion[];
    if (mix.topic === "canton") {
      pool = bundeslandCode
        ? AT_BANK.filter((q) => q.topic === "canton" && q.cantonCode === bundeslandCode)
        : [];
    } else {
      pool = AT_BANK.filter((q) => q.topic === mix.topic);
    }

    const available = shuffle(pool.filter((q) => !used.has(q.id)));
    const picked = available.slice(0, mix.count);
    for (const p of picked) {
      used.add(p.id);
      result.push(p);
    }

    // Hiány esetén federal-lal pótolunk.
    if (picked.length < mix.count) {
      const missing = mix.count - picked.length;
      const fallback = shuffle(AT_BANK.filter((q) => q.topic === "federal" && !used.has(q.id))).slice(0, missing);
      for (const f of fallback) {
        used.add(f.id);
        result.push(f);
      }
    }
  }

  return shuffle(result);
}
