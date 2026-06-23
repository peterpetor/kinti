/**
 * Osztrák Kvíz — kérdés-bank (a napi 3 kérdéses kvíz AT-változata).
 *
 * Témák: földrajz, történelem, kultúra, nyelv (osztrák német), étel & ital,
 * közlekedés, intézmények, hétköznapok. Minden kérdés 4 választás + magyarázat.
 *
 * Forrás: általános osztrák köztudás (oesterreich.gv.at nagyságrendek).
 */

import type { QuizCategory, QuizQuestion } from "./quiz-bank";

/** Kategória-meta az AT kvízhez (a „hétköznapok" zászlója 🇦🇹). */
export const AT_QUIZ_CATEGORY_META: Record<QuizCategory, { label: string; emoji: string }> = {
  geography:    { label: "Földrajz",       emoji: "🗺️" },
  history:      { label: "Történelem",     emoji: "📜" },
  culture:      { label: "Kultúra",        emoji: "🎭" },
  language:     { label: "Nyelv",          emoji: "💬" },
  food:         { label: "Étel & ital",    emoji: "🍽️" },
  transport:    { label: "Közlekedés",     emoji: "🚆" },
  institutions: { label: "Intézmények",    emoji: "🏛️" },
  everyday:     { label: "Hétköznapok",    emoji: "🇦🇹" },
};

export const AT_QUIZ_BANK: QuizQuestion[] = [
  // === FÖLDRAJZ ===
  { id: "at-geo-laender", category: "geography", question: "Hány szövetségi tartománya (Bundesland) van Ausztriának?", options: ["6", "8", "9", "16"], correct: 2, explanation: "9 Bundesland — Ausztria szövetségi köztársaság." },
  { id: "at-geo-capital", category: "geography", question: "Mi Ausztria fővárosa?", options: ["Graz", "Salzburg", "Bécs (Wien)", "Linz"], correct: 2, explanation: "Bécs (Wien) — egyben önálló tartomány és a legnagyobb város." },
  { id: "at-geo-glockner", category: "geography", question: "Mi Ausztria legmagasabb hegye?", options: ["Großglockner", "Zugspitze", "Dachstein", "Kitzsteinhorn"], correct: 0, explanation: "A Großglockner (3798 m)." },
  { id: "at-geo-donau", category: "geography", question: "Melyik nagy folyó folyik át Bécsen?", options: ["Rajna", "Duna (Donau)", "Inn", "Mura"], correct: 1, explanation: "A Duna — nyugatról keletre szeli át az országot." },
  { id: "at-geo-neighbors", category: "geography", question: "Hány országgal határos Ausztria?", options: ["4", "6", "8", "10"], correct: 2, explanation: "8: Németország, Csehország, Szlovákia, Magyarország, Szlovénia, Olaszország, Svájc, Liechtenstein." },
  { id: "at-geo-burgenland", category: "geography", question: "Melyik Ausztria legkeletibb tartománya (a magyar határnál)?", options: ["Steiermark", "Burgenland", "Kärnten", "Tirol"], correct: 1, explanation: "Burgenland — 1921-ben került Ausztriához, itt a Fertő tó." },
  { id: "at-geo-bodensee", category: "geography", question: "Melyik nagy tó van Ausztria nyugati csücskénél (Vorarlberg)?", options: ["Neusiedler See", "Bodeni-tó (Bodensee)", "Wörthersee", "Attersee"], correct: 1, explanation: "A Bodeni-tó — Ausztria, Németország és Svájc osztozik rajta." },
  { id: "at-geo-graz", category: "geography", question: "Melyik Ausztria második legnagyobb városa?", options: ["Linz", "Salzburg", "Graz", "Innsbruck"], correct: 2, explanation: "Graz (Stájerország) — óvárosa UNESCO-világörökség." },

  // === TÖRTÉNELEM ===
  { id: "at-his-republik", category: "history", question: "Mikor lett Ausztria köztársaság a Monarchia után?", options: ["1867", "1918", "1938", "1955"], correct: 1, explanation: "1918 — az I. világháború és a Monarchia felbomlása után." },
  { id: "at-his-anschluss", category: "history", question: "Mit jelent az 'Anschluss' 1938-ban?", options: ["EU-csatlakozás", "A náci Németország bekebelezte Ausztriát", "A köztársaság kikiáltása", "A semlegesség"], correct: 1, explanation: "1938: a náci Németország annektálta Ausztriát (1945-ig)." },
  { id: "at-his-staatsvertrag", category: "history", question: "Mit hozott az 1955-ös Staatsvertrag?", options: ["EU-tagság", "Ausztria független és szabad lett, a megszállók kivonultak", "NATO-tagság", "Monarchia visszaállítása"], correct: 1, explanation: "1955: 'Österreich ist frei!' — a 4 megszálló hatalom kivonult." },
  { id: "at-his-eu", category: "history", question: "Mikor csatlakozott Ausztria az EU-hoz?", options: ["1989", "1995", "2002", "2004"], correct: 1, explanation: "1995. január 1. (Finnországgal és Svédországgal együtt)." },
  { id: "at-his-sisi", category: "history", question: "Ki volt 'Sisi' (Erzsébet királyné) férje?", options: ["I. Ferenc József", "Miksa", "Rudolf", "Ferenc Ferdinánd"], correct: 0, explanation: "I. Ferenc József osztrák császár és magyar király. Sisi máig kultikus alak." },
  { id: "at-his-monarchie", category: "history", question: "Hogy hívták az államot 1867–1918 között?", options: ["Német Szövetség", "Osztrák–Magyar Monarchia", "Habsburg Köztársaság", "Szent Római Birodalom"], correct: 1, explanation: "Az Osztrák–Magyar Monarchia (k. u. k.)." },

  // === KULTÚRA ===
  { id: "at-cul-mozart", category: "culture", question: "Melyik osztrák városban született Mozart?", options: ["Bécs", "Salzburg", "Linz", "Graz"], correct: 1, explanation: "W. A. Mozart Salzburgban született (1756)." },
  { id: "at-cul-klimt", category: "culture", question: "Mi Gustav Klimt leghíresebb festménye?", options: ["A csók (Der Kuss)", "A sikoly", "Guernica", "Csillagos éj"], correct: 0, explanation: "'A csók' (Der Kuss) — a bécsi szecesszió ikonikus, aranyozott képe." },
  { id: "at-cul-lipizzaner", category: "culture", question: "Milyen lovak lépnek fel a bécsi Spanyol Lovasiskolában?", options: ["Arab telivérek", "Lipicai lovak", "Haflingerek", "Furiosók"], correct: 1, explanation: "A fehér lipicai lovak (Lipizzaner) — a Hofburgban tartanak bemutatókat." },
  { id: "at-cul-neujahr", category: "culture", question: "Melyik világhírű koncertet közvetítik Bécsből minden január 1-jén?", options: ["Eurovízió", "Újévi koncert (Bécsi Filharmonikusok)", "Wacken", "Salzburgi ünnepi játékok"], correct: 1, explanation: "A Bécsi Filharmonikusok újévi koncertje — sok Strauss-keringővel." },
  { id: "at-cul-falco", category: "culture", question: "Melyik világsláger fűződik az osztrák Falco nevéhez?", options: ["Rock Me Amadeus", "Africa", "Tarzan Boy", "Words"], correct: 0, explanation: "'Rock Me Amadeus' (1985) — Falco a US listák élére is felért vele." },
  { id: "at-cul-stillenacht", category: "culture", question: "Melyik világhírű karácsonyi dal született Ausztriában (Oberndorf)?", options: ["Jingle Bells", "Csendes éj (Stille Nacht)", "Last Christmas", "O Tannenbaum"], correct: 1, explanation: "A 'Stille Nacht' (Csendes éj) 1818-ban, Oberndorfban csendült fel először." },
  { id: "at-cul-krampus", category: "culture", question: "Ki a Krampusz az osztrák hagyományban?", options: ["A Mikulás segítője/ellentéte, aki a rosszakat ijeszti", "Egy húsvéti figura", "Egy keringő", "Egy hegycsúcs"], correct: 0, explanation: "December elején a Krampusz (szőrös, szarvas alak) kíséri a Mikulást (Nikolaus)." },

  // === NYELV (osztrák német) ===
  { id: "at-lang-erdaepfel", category: "language", question: "Mit jelent osztrákul az 'Erdäpfel'?", options: ["Földieper", "Burgonya", "Alma", "Répa"], correct: 1, explanation: "Erdäpfel = burgonya (a németországi 'Kartoffel' helyett)." },
  { id: "at-lang-paradeiser", category: "language", question: "Mi a 'Paradeiser' osztrákul?", options: ["Paprika", "Paradicsom", "Padlizsán", "Saláta"], correct: 1, explanation: "Paradeiser = paradicsom (a 'Tomate' osztrák megfelelője)." },
  { id: "at-lang-jaenner", category: "language", question: "Melyik hónap a 'Jänner' osztrákul?", options: ["Január", "Június", "Július", "Június"], correct: 0, explanation: "Jänner = január (Németországban 'Januar')." },
  { id: "at-lang-marille", category: "language", question: "Mi a 'Marille'?", options: ["Eper", "Sárgabarack", "Cseresznye", "Szilva"], correct: 1, explanation: "Marille = sárgabarack (híres a Wachau-i marille és a Marillenknödel)." },
  { id: "at-lang-servus", category: "language", question: "Melyik informális köszönés tipikusan osztrák/dél-német?", options: ["Moin", "Servus", "Tschüss", "Hallöchen"], correct: 1, explanation: "'Servus' — informális 'szia' érkezéskor és búcsúzáskor is. A formális: 'Grüß Gott'." },
  { id: "at-lang-sackerl", category: "language", question: "Mi a 'Sackerl' osztrákul?", options: ["Kabát", "Zacskó / szatyor", "Zseb", "Doboz"], correct: 1, explanation: "Sackerl = (kis) zacskó/szatyor. A boltban kérdezik: 'Brauchen Sie ein Sackerl?'" },
  { id: "at-lang-topfen", category: "language", question: "Mi a 'Topfen' osztrákul?", options: ["Túró", "Tejföl", "Vaj", "Sajt"], correct: 0, explanation: "Topfen = túró (Németországban 'Quark'). Pl. Topfenstrudel." },

  // === ÉTEL & ITAL ===
  { id: "at-food-schnitzel", category: "food", question: "Az IGAZI Wiener Schnitzel hagyományosan miből készül?", options: ["Csirke", "Sertés", "Borjú", "Pulyka"], correct: 2, explanation: "Borjúhúsból — a sertésből készült verzió neve 'Schnitzel Wiener Art'." },
  { id: "at-food-sacher", category: "food", question: "Mi a Sachertorte jellegzetes rétege a csokoládé mellett?", options: ["Sárgabaracklekvár", "Tejszín", "Dió", "Mogyorókrém"], correct: 0, explanation: "Csokitorta sárgabaracklekvárral (Marillenmarmelade) + csokimáz. A bécsi Sacher hotel specialitása." },
  { id: "at-food-tafelspitz", category: "food", question: "Mi a 'Tafelspitz'?", options: ["Sült krumpli", "Főtt marhahús (klasszikus bécsi fogás)", "Halétel", "Sütemény"], correct: 1, explanation: "Főtt marhahús (a fartő egy része), almatorma-mártással. Ferenc József kedvence volt." },
  { id: "at-food-kaiserschmarrn", category: "food", question: "Milyen étel a 'Kaiserschmarrn'?", options: ["Leves", "Felaprított, cukrozott palacsinta-féle desszert", "Kolbász", "Saláta"], correct: 1, explanation: "Édes, felaprított, megcukrozott palacsinta, gyakran szilvalekvárral vagy almapürével." },
  { id: "at-food-almdudler", category: "food", question: "Mi az 'Almdudler'?", options: ["Sajtféle", "Gyógynövényes üdítőital (osztrák klasszikus)", "Sör", "Sütemény"], correct: 1, explanation: "Gyógynövényes, alpesi limonádé — kultikus osztrák üdítő." },
  { id: "at-food-melange", category: "food", question: "Mi a 'Wiener Melange' a kávéházban?", options: ["Eszpresszó", "Tejes kávé (a cappuccinóhoz hasonló)", "Jeges tea", "Forró csoki"], correct: 1, explanation: "Eszpresszó tejhabbal — a bécsi kávéház-kultúra alapdarabja (UNESCO-szellemi örökség)." },

  // === KÖZLEKEDÉS ===
  { id: "at-tr-oebb", category: "transport", question: "Mi az osztrák állami vasúttársaság neve?", options: ["SBB", "ÖBB", "DB", "MÁV"], correct: 1, explanation: "ÖBB (Österreichische Bundesbahnen)." },
  { id: "at-tr-klimaticket", category: "transport", question: "Mi a 'Klimaticket'?", options: ["Repülőjegy", "Országos éves bérlet az összes tömegközlekedésre", "Autópálya-matrica", "Múzeumi belépő"], correct: 1, explanation: "Egész Ausztriára érvényes éves bérlet a vasútra és a helyi közlekedésre." },
  { id: "at-tr-vignette", category: "transport", question: "Mi kell az osztrák autópályák használatához?", options: ["Vignette (matrica/Pickerl)", "Készpénzes kapu", "Semmi, ingyenes", "Külön app előfizetés"], correct: 0, explanation: "Vignette (autópálya-matrica) — a szélvédőn vagy digitálisan." },
  { id: "at-tr-bim", category: "transport", question: "Hogy becézik a bécsiek a villamost?", options: ["Bim", "Tram", "Metro", "Bus"], correct: 0, explanation: "'Bim' — a villamos beceneve (a csengőhangja után)." },
  { id: "at-tr-wienerlinien", category: "transport", question: "Melyik cég üzemelteti a bécsi metrót/villamost/buszt?", options: ["ÖBB", "Wiener Linien", "VOR", "Westbahn"], correct: 1, explanation: "Wiener Linien — a bécsi U-Bahn, Straßenbahn és busz üzemeltetője." },

  // === INTÉZMÉNYEK ===
  { id: "at-inst-oegk", category: "institutions", question: "Melyik a legnagyobb osztrák egészségbiztosító?", options: ["ÖGK", "AOK", "Krankenkasse AG", "Suva"], correct: 0, explanation: "ÖGK (Österreichische Gesundheitskasse) — a munkaviszonnyal automatikusan ide kerülsz, jön az e-card." },
  { id: "at-inst-ams", category: "institutions", question: "Hová fordulsz álláskereséskor / munkanélküliként?", options: ["AMS", "ÖGK", "AK", "ORF"], correct: 0, explanation: "AMS (Arbeitsmarktservice) — az osztrák munkaügyi szolgálat." },
  { id: "at-inst-finanzamt", category: "institutions", question: "Melyik hivatalnál intézed az adóügyeket (pl. Arbeitnehmerveranlagung)?", options: ["Finanzamt", "Magistrat", "AMS", "ÖGK"], correct: 0, explanation: "Finanzamt — az adóhivatal; online a FinanzOnline portál." },
  { id: "at-inst-orf", category: "institutions", question: "Mi az ORF?", options: ["Egy bank", "Az osztrák közszolgálati média (rádió/TV)", "Egy vasúttársaság", "Egy biztosító"], correct: 1, explanation: "ORF (Österreichischer Rundfunk) — a közszolgálati rádió és televízió." },
  { id: "at-inst-ak", category: "institutions", question: "Mi az Arbeiterkammer (AK)?", options: ["Munkaadói szövetség", "Munkavállalói érdekképviselet (tanácsadás, jogsegély)", "Adóhivatal", "Egészségpénztár"], correct: 1, explanation: "AK — a munkavállalók kötelező kamarája; ingyenes munkajogi/fogyasztói tanácsadás." },

  // === HÉTKÖZNAPOK ===
  { id: "at-day-trafik", category: "everyday", question: "Hol veszel hagyományosan cigit, újságot és autópálya-matricát?", options: ["Trafik", "Apotheke", "Bäckerei", "Greißler"], correct: 0, explanation: "Trafik (Tabak-Trafik) — dohány, újság, jegyek, matrica, sorsjegy." },
  { id: "at-day-heuriger", category: "everyday", question: "Mi a 'Heuriger'?", options: ["Hegycsúcs", "Bortermelő saját borát kínáló vendéglője (új bor)", "Ünnep", "Sajtfajta"], correct: 1, explanation: "Heuriger — a bortermelő kis vendéglője, ahol az aktuális évi (új) borát méri, hidegtálakkal. Bécs körül népszerű." },
  { id: "at-day-sonntag", category: "everyday", question: "Mi jellemző a boltokra vasárnap Ausztriában?", options: ["Tovább nyitva, mint hétköznap", "Általában ZÁRVA (kevés kivétel: pályaudvar, benzinkút)", "Csak délelőtt nyitva", "Ingyenes parkolás miatt zsúfolt"], correct: 1, explanation: "Vasárnap a boltok többsége zárva — bevásárolj előtte! Kivétel pl. a pályaudvari boltok." },
  { id: "at-day-pfand", category: "everyday", question: "Mit jelent a 'Pfand' egyes palackokon/üvegeken?", options: ["Akció", "Visszaváltási betétdíj", "Lejárati idő", "Bio-jelölés"], correct: 1, explanation: "Pfand — betétdíj; visszaváltáskor visszakapod. 2025-től PET/fém italcsomagolásra is bővült." },
  { id: "at-day-14", category: "everyday", question: "Hány havi fizetés szokásos évente az osztrák munkaviszonyban?", options: ["12", "13", "14", "15"], correct: 2, explanation: "14 — a 12 rendes mellett az Urlaubsgeld (13.) és a Weihnachtsgeld (14.), kedvező adózással." },
  { id: "at-day-meldezettel", category: "everyday", question: "Hogy hívják a lakcímbejelentő igazolást Ausztriában?", options: ["Anmeldung", "Meldezettel", "Ausweis", "Personalausweis"], correct: 1, explanation: "Meldezettel — a beköltözéstől 3 napon belül kötelező a Meldeamtnál; sok ügyhöz kell." },
];
