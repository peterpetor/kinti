/**
 * Német Kvíz — kérdés-bank (a napi 3 kérdéses kvíz DE-változata).
 *
 * Témák: földrajz, történelem, kultúra, nyelv (Hochdeutsch), étel & ital,
 * közlekedés, intézmények, hétköznapok. Minden kérdés 4 választás + magyarázat.
 *
 * Forrás: általános német köztudás. Tájékoztató jellegű, nem hivatalos.
 */

import type { QuizCategory, QuizQuestion } from "./quiz-bank";

/** Kategória-meta a DE kvízhez (a „hétköznapok" zászlója 🇩🇪). */
export const DE_QUIZ_CATEGORY_META: Record<QuizCategory, { label: string; emoji: string }> = {
  geography:    { label: "Földrajz",       emoji: "🗺️" },
  history:      { label: "Történelem",     emoji: "📜" },
  culture:      { label: "Kultúra",        emoji: "🎭" },
  language:     { label: "Nyelv",          emoji: "💬" },
  food:         { label: "Étel & ital",    emoji: "🍽️" },
  transport:    { label: "Közlekedés",     emoji: "🚆" },
  institutions: { label: "Intézmények",    emoji: "🏛️" },
  everyday:     { label: "Hétköznapok",    emoji: "🇩🇪" },
};

export const DE_QUIZ_BANK: QuizQuestion[] = [
  // === FÖLDRAJZ ===
  { id: "de-geo-laender", category: "geography", question: "Hány szövetségi tartománya (Bundesland) van Németországnak?", options: ["9", "12", "16", "20"], correct: 2, explanation: "16 Bundesland — Németország szövetségi köztársaság." },
  { id: "de-geo-capital", category: "geography", question: "Mi Németország fővárosa?", options: ["München", "Frankfurt", "Berlin", "Hamburg"], correct: 2, explanation: "Berlin — egyben önálló tartomány (Stadtstaat) és a legnagyobb város." },
  { id: "de-geo-zugspitze", category: "geography", question: "Mi Németország legmagasabb hegye?", options: ["Zugspitze", "Brocken", "Feldberg", "Watzmann"], correct: 0, explanation: "A Zugspitze (2962 m) a bajor Alpokban, az osztrák határnál." },
  { id: "de-geo-rhein", category: "geography", question: "Melyik nagy folyó folyik át Kölnön?", options: ["Elba", "Rajna (Rhein)", "Duna", "Majna"], correct: 1, explanation: "A Rajna (Rhein) — Németország egyik legfontosabb folyója." },
  { id: "de-geo-neighbors", category: "geography", question: "Hány országgal határos Németország?", options: ["6", "7", "9", "11"], correct: 2, explanation: "9: Dánia, Lengyelország, Csehország, Ausztria, Svájc, Franciaország, Luxemburg, Belgium, Hollandia." },
  { id: "de-geo-hamburg", category: "geography", question: "Melyik Németország második legnagyobb városa?", options: ["München", "Köln", "Hamburg", "Frankfurt"], correct: 2, explanation: "Hamburg — nagy kikötőváros, egyben önálló tartomány." },
  { id: "de-geo-bayern", category: "geography", question: "Melyik Németország legnagyobb területű tartománya?", options: ["Bayern", "Nordrhein-Westfalen", "Niedersachsen", "Baden-Württemberg"], correct: 0, explanation: "Bayern (Bajorország) — délen, fővárosa München." },
  { id: "de-geo-bodensee", category: "geography", question: "Melyik nagy tó van Németország déli határán (Svájc/Ausztria felé)?", options: ["Müritz", "Bodensee (Bodeni-tó)", "Chiemsee", "Starnberger See"], correct: 1, explanation: "A Bodeni-tó — Németország, Svájc és Ausztria osztozik rajta." },
  { id: "de-geo-schwarzwald", category: "geography", question: "Melyik tartományban van a Fekete-erdő (Schwarzwald)?", options: ["Bayern", "Hessen", "Baden-Württemberg", "Sachsen"], correct: 2, explanation: "Baden-Württemberg, délnyugaton — innen ered a Duna is." },
  { id: "de-geo-nrw", category: "geography", question: "Melyik a legnépesebb német tartomány?", options: ["Bayern", "Nordrhein-Westfalen", "Berlin", "Hessen"], correct: 1, explanation: "Nordrhein-Westfalen (NRW) — kb. 18 millió lakos, fővárosa Düsseldorf." },

  // === TÖRTÉNELEM ===
  { id: "de-his-einheit", category: "history", question: "Mikor egyesült újra Németország (NSZK + NDK)?", options: ["1945", "1961", "1989", "1990"], correct: 3, explanation: "1990. október 3. — ez a 'Tag der Deutschen Einheit', a nemzeti ünnep." },
  { id: "de-his-mauer", category: "history", question: "Mikor dőlt le a berlini fal?", options: ["1961", "1985", "1989", "1991"], correct: 2, explanation: "1989. november 9. — a fal 1961 óta osztotta ketté Berlint." },
  { id: "de-his-ddr", category: "history", question: "Mit jelölt az 'NDK' (DDR)?", options: ["Nyugat-Németország", "Kelet-Németország", "Ausztria", "Egyesült Németország"], correct: 1, explanation: "Deutsche Demokratische Republik — a szocialista Kelet-Németország (1949–1990)." },
  { id: "de-his-brd", category: "history", question: "Mikor alapították az NSZK-t (Bundesrepublik Deutschland)?", options: ["1919", "1945", "1949", "1955"], correct: 2, explanation: "1949 — a nyugati megszállási övezetekből jött létre a Grundgesetzzel." },
  { id: "de-his-adenauer", category: "history", question: "Ki volt az NSZK első szövetségi kancellárja?", options: ["Willy Brandt", "Konrad Adenauer", "Helmut Kohl", "Ludwig Erhard"], correct: 1, explanation: "Konrad Adenauer (1949–1963) — a háború utáni újjáépítés meghatározó alakja." },
  { id: "de-his-luther", category: "history", question: "Ki indította el a reformációt 1517-ben Wittenbergben?", options: ["Luther Márton", "Kálvin János", "Goethe", "Nagy Károly"], correct: 0, explanation: "Luther Márton — a 95 tézis és a Biblia német fordítása." },
  { id: "de-his-ww2", category: "history", question: "Melyik évben ért véget a II. világháború Európában?", options: ["1939", "1943", "1945", "1948"], correct: 2, explanation: "1945 — Németország kapitulációja május 8-án (a háború utáni felosztás kezdete)." },

  // === KULTÚRA ===
  { id: "de-cul-beethoven", category: "culture", question: "Melyik német városban született Beethoven?", options: ["Bécs", "Lipcse", "Bonn", "Berlin"], correct: 2, explanation: "Ludwig van Beethoven Bonnban született (1770)." },
  { id: "de-cul-goethe", category: "culture", question: "Ki írta a 'Faust' című művet?", options: ["Schiller", "Goethe", "Kafka", "Thomas Mann"], correct: 1, explanation: "Johann Wolfgang von Goethe — a német irodalom egyik óriása." },
  { id: "de-cul-oktoberfest", category: "culture", question: "Melyik városban tartják az Oktoberfestet?", options: ["Berlin", "Köln", "München", "Hamburg"], correct: 2, explanation: "München — a világ legnagyobb sörfesztiválja, bajor hagyomány." },
  { id: "de-cul-grimm", category: "culture", question: "Mivel váltak híressé a Grimm testvérek?", options: ["Festészet", "Népmesék gyűjtése", "Zeneszerzés", "Autógyártás"], correct: 1, explanation: "Jacob és Wilhelm Grimm gyűjtötték a klasszikus német népmeséket (Hófehérke, Jancsi és Juliska)." },
  { id: "de-cul-weihnachtsmarkt", category: "culture", question: "Mi a 'Weihnachtsmarkt'?", options: ["Bolhapiac", "Karácsonyi vásár", "Halpiac", "Könyvvásár"], correct: 1, explanation: "Adventi karácsonyi vásár — Glühweinnel, mézeskaláccsal; Nürnberg a leghíresebb." },
  { id: "de-cul-cars", category: "culture", question: "Melyik autómárka NEM német?", options: ["BMW", "Volvo", "Audi", "Mercedes-Benz"], correct: 1, explanation: "A Volvo svéd. A BMW, Audi, Mercedes (és VW, Porsche) német márkák." },

  // === NYELV (Hochdeutsch) ===
  { id: "de-lang-genau", category: "language", question: "Mit jelent a gyakori 'Genau'?", options: ["Talán", "Pontosan / Úgy van", "Soha", "Talán holnap"], correct: 1, explanation: "'Genau' = pontosan, úgy van — a beszélgetés egyik leggyakoribb megerősítő szava." },
  { id: "de-lang-tschuess", category: "language", question: "Mit jelent a 'Tschüss'?", options: ["Köszönöm", "Szia (búcsúzáskor)", "Bocsánat", "Jó étvágyat"], correct: 1, explanation: "'Tschüss' = szia/viszlát búcsúzáskor (kötetlen)." },
  { id: "de-lang-feierabend", category: "language", question: "Mit jelent a 'Feierabend'?", options: ["Hétvégi buli", "A munkanap vége / utáni szabadidő", "Ünnepnap", "Esti mise"], correct: 1, explanation: "'Feierabend' = a munka utáni szabad idő. 'Schönen Feierabend!' = szép pihenést munka után." },
  { id: "de-lang-termin", category: "language", question: "Mit jelent a 'Termin'?", options: ["Végállomás", "Időpont / megbeszélt találkozó", "Számla", "Határidő-túllépés"], correct: 1, explanation: "'Termin' = (egyeztetett) időpont. Hivatalokhoz szinte mindig kell." },
  { id: "de-lang-sie", category: "language", question: "Hogyan szólítasz meg formálisan (magázás) egy idegent?", options: ["du", "Sie", "ihr", "man"], correct: 1, explanation: "'Sie' = magázás. A 'du' a tegezés (barátok, fiatalok, család)." },
  { id: "de-lang-articles", category: "language", question: "Hány nyelvtani neme van a német főneveknek?", options: ["1", "2", "3", "4"], correct: 2, explanation: "Három: der (hím), die (nő), das (semleges) — érdemes a névelővel együtt tanulni a szót." },

  // === ÉTEL & ITAL ===
  { id: "de-food-currywurst", category: "food", question: "Melyik városhoz kötődik leginkább a Currywurst?", options: ["München", "Berlin", "Stuttgart", "Köln"], correct: 1, explanation: "Berlin — sült kolbász curry-s paradicsomszósszal, klasszikus utcai étel." },
  { id: "de-food-brezel", category: "food", question: "Mi a 'Brezel'?", options: ["Sörfajta", "Sós perec", "Sajtféle", "Húsleves"], correct: 1, explanation: "Brezel (perec) — különösen Bajorországban és délen népszerű pékáru." },
  { id: "de-food-pfand", category: "food", question: "Mit jelent a 'Pfand' az üvegeken/dobozokon?", options: ["Ára kedvezményes", "Visszaváltási betétdíj", "Lejárati idő", "Bio minősítés"], correct: 1, explanation: "Pfand = betétdíj — a palackot/dobozt az automatánál (Pfandautomat) visszaváltod." },
  { id: "de-food-brot", category: "food", question: "Miről híres a német konyha a pékségben?", options: ["Sokféle kenyér (Brot)", "Sushi", "Tészták", "Tofu"], correct: 0, explanation: "Németországban több száz kenyérfajta van — a 'Brotkultur' UNESCO szellemi örökség." },

  // === KÖZLEKEDÉS ===
  { id: "de-trans-bahn", category: "transport", question: "Mi a Deutsche Bahn (DB)?", options: ["Légitársaság", "A német vasúttársaság", "Autópálya-üzemeltető", "Bankhálózat"], correct: 1, explanation: "A Deutsche Bahn a fő vasúttársaság; az ICE a gyorsvonata." },
  { id: "de-trans-autobahn", category: "transport", question: "Mi igaz a német Autobahn nagy részére?", options: ["Fizetős mindenhol", "Sok szakaszon nincs általános sebességkorlát", "Max 100 km/h", "Csak teherautóknak"], correct: 1, explanation: "Sok szakaszon nincs általános limit, csak ajánlott sebesség (Richtgeschwindigkeit) 130 km/h." },
  { id: "de-trans-dticket", category: "transport", question: "Mi a Deutschlandticket?", options: ["Repülőjegy-bérlet", "Országos havi tömegközlekedési bérlet", "Múzeumbelépő", "Vasúti étkezőjegy"], correct: 1, explanation: "Havi előfizetéses bérlet a regionális tömegközlekedésre (busz, villamos, S-/U-Bahn, regionális vonatok)." },
  { id: "de-trans-ice", category: "transport", question: "Mi az ICE?", options: ["Jégpálya", "A német nagysebességű vonat", "Sörmárka", "Egy tartomány"], correct: 1, explanation: "InterCity Express — a Deutsche Bahn nagysebességű vonata." },

  // === INTÉZMÉNYEK ===
  { id: "de-inst-buergeramt", category: "institutions", question: "Hol intézed a lakcímbejelentést (Anmeldung)?", options: ["Finanzamt", "Bürgeramt / Bürgerbüro", "Krankenkasse", "Arbeitsamt"], correct: 1, explanation: "A Bürgeramt (Einwohnermeldeamt) — beköltözés után 14 napon belül kötelező." },
  { id: "de-inst-finanzamt", category: "institutions", question: "Melyik hivatal felel az adóügyekért?", options: ["Finanzamt", "Bürgeramt", "Standesamt", "Ordnungsamt"], correct: 0, explanation: "A Finanzamt — ide megy az adóbevallás (Steuererklärung), pl. ELSTER-en." },
  { id: "de-inst-bundestag", category: "institutions", question: "Mi a Bundestag?", options: ["A legfelsőbb bíróság", "A szövetségi parlament", "A hadsereg", "Az államfő hivatala"], correct: 1, explanation: "A Bundestag a szövetségi parlament (törvényhozás), Berlinben a Reichstag épületében." },
  { id: "de-inst-kanzler", category: "institutions", question: "Ki a német kormány vezetője?", options: ["A Bundespräsident", "A Bundeskanzler(in)", "A király", "A Bürgermeister"], correct: 1, explanation: "A Bundeskanzler(in) — szövetségi kancellár vezeti a kormányt. A Bundespräsident az államfő (reprezentatív)." },
  { id: "de-inst-krankenkasse", category: "institutions", question: "Mi a Krankenkasse szerepe?", options: ["Bankszámla-vezetés", "Egészségbiztosítás", "Lakásügynökség", "Nyugdíjfolyósítás kizárólag"], correct: 1, explanation: "A Krankenkasse a (törvényes) egészségbiztosító — pl. TK, AOK, Barmer." },

  // === HÉTKÖZNAPOK ===
  { id: "de-day-anmeldung", category: "everyday", question: "Hány napon belül kell bejelentkezni (Anmeldung) beköltözés után?", options: ["3 nap", "14 nap", "30 nap", "90 nap"], correct: 1, explanation: "14 napon belül a Bürgeramtnál — kell hozzá a Wohnungsgeberbestätigung (főbérlői igazolás)." },
  { id: "de-day-sonntag", category: "everyday", question: "Mi jellemző a vasárnapokra (Sonntag) Németországban?", options: ["A boltok többsége zárva", "Minden bolt nyitva", "Ingyenes tömegközlekedés", "Kötelező munkanap"], correct: 0, explanation: "Vasárnap a legtöbb üzlet zárva (Ladenschluss) — csak pályaudvari/benzinkúti boltok, pékségek nyitnak korlátozottan." },
  { id: "de-day-muell", category: "everyday", question: "Mi a 'Mülltrennung'?", options: ["Költözés", "Szelektív hulladékgyűjtés", "Lakásfelújítás", "Adóbevallás"], correct: 1, explanation: "Szelektív szemétgyűjtés: papír (blau), csomagolás (gelb), bio, üveg színek szerint, maradék (Restmüll)." },
  { id: "de-day-rundfunk", category: "everyday", question: "Mi a 'Rundfunkbeitrag' (korábban GEZ)?", options: ["Internetdíj", "Kötelező média-/közszolgálati járulék háztartásonként", "Parkolási bírság", "Kutyaadó"], correct: 1, explanation: "Háztartásonként fizetendő közmédia-járulék (kb. havi 18-19 €), tévé/rádió nélkül is." },
  { id: "de-day-pfand", category: "everyday", question: "Hol váltod vissza a betétes (Pfand) palackokat?", options: ["A postán", "A bolt Pfandautomatjánál", "A bankban", "A Bürgeramtnál"], correct: 1, explanation: "A szupermarket visszaváltó automatájánál (Pfandautomat) — bonod a kasszánál levásárolható." },
  { id: "de-day-ruhe", category: "everyday", question: "Mit jelent a 'Ruhezeit' a lakóházakban?", options: ["Fűtési időszak", "Csendrendelet (pl. este 22h után, vasárnap)", "Takarítási kötelezettség", "Szabadságolás"], correct: 1, explanation: "Pihenőidő — éjszaka (kb. 22–6h) és gyakran vasárnap kerülni kell a zajt (fúrás, hangos zene)." },
];
