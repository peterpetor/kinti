/**
 * Einbürgerungstest-szimulátor — kérdés-bank.
 *
 * FONTOS: ez NEM hivatalos teszt. A valódi állampolgársági teszt
 * kantononként és községenként különböző (Svájcban nincs egységes
 * szövetségi vizsga). Ez egy FELKÉSZÍTŐ szimulátor — a tipikus
 * témakörök tudás-szintjének ellenőrzésére.
 *
 * Témakörök:
 *   - federal: szövetségi politikai rendszer
 *   - history: történelem
 *   - geography: földrajz (kantonok, város, természet)
 *   - civic: állampolgári jogok, kötelességek, népszavazás
 *   - canton: kanton-specifikus
 *
 * Forrás: ch.ch, swissinfo, kantoni hivatali tájékoztatók.
 */

export type EbTopic = "federal" | "history" | "geography" | "civic" | "canton";

export interface EbQuestion {
  id: string;
  topic: EbTopic;
  /** Csak ha topic === "canton". */
  cantonCode?: string;
  question: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
}

export const EB_TOPIC_META: Record<EbTopic, { label: string; emoji: string; color: string }> = {
  federal:   { label: "Szöv. politika", emoji: "🏛️", color: "#1d4434" },
  history:   { label: "Történelem",     emoji: "📜", color: "#7f4a1d" },
  geography: { label: "Földrajz",       emoji: "🗺️", color: "#2c7a7b" },
  civic:     { label: "Polg. jogok",    emoji: "🗳️", color: "#5b21b6" },
  canton:    { label: "Kanton",         emoji: "🇨🇭", color: "#dc2626" },
};

/** Kantonok ahol vannak specifikus kérdések. */
export const EB_CANTONS = [
  { code: "ZH", name: "Zürich" },
  { code: "BE", name: "Bern" },
  { code: "BS", name: "Basel-Stadt" },
  { code: "GE", name: "Genf" },
  { code: "VD", name: "Waadt" },
  { code: "LU", name: "Luzern" },
  { code: "TI", name: "Tessin" },
  { code: "SG", name: "St. Gallen" },
  { code: "AG", name: "Aargau" },
];

export const EB_BANK: EbQuestion[] = [
  // ============ FEDERAL — Szövetségi politikai rendszer (25) ============
  {
    id: "f-bundesrat",
    topic: "federal",
    question: "Hány tagja van a Szövetségi Tanácsnak (Bundesrat)?",
    options: ["5", "7", "9", "11"],
    correct: 1,
    explanation: "7 tag — a végrehajtó hatalom kollektív vezetése. Évente egyikük az 'elnök' (csak protokolláris szerep).",
  },
  {
    id: "f-bundespraesident",
    topic: "federal",
    question: "Meddig tart a Bundespräsident (szövetségi elnök) mandátuma?",
    options: ["1 év", "2 év", "4 év", "5 év"],
    correct: 0,
    explanation: "1 év — rotáció a Bundesrat 7 tagja közt. NEM 'elnök' a klasszikus értelemben, csak 'primus inter pares'.",
  },
  {
    id: "f-nationalrat",
    topic: "federal",
    question: "Hány képviselő van a Nationalrat-ban?",
    options: ["100", "150", "200", "300"],
    correct: 2,
    explanation: "200 — a 'nép képviselete', kantonokra arányosan a lakosság szerint.",
  },
  {
    id: "f-staenderat",
    topic: "federal",
    question: "Hány tag van a Ständerat-ban?",
    options: ["26", "46", "50", "60"],
    correct: 1,
    explanation: "46 — minden kanton 2 főt küld (kivéve a 6 fél-kanton, 1-1 főt). 'Kantonok kamarája'.",
  },
  {
    id: "f-parliament",
    topic: "federal",
    question: "Mi az 'Bundesversammlung' (Szövetségi Gyűlés)?",
    options: [
      "A Bundesrat és a Bundesgericht összesen",
      "A Nationalrat és a Ständerat közösen",
      "A 26 kanton vezetői",
      "A miniszterek",
    ],
    correct: 1,
    explanation: "A két kamara együtt = Bundesversammlung. Ez választja a Bundesrat-ot.",
  },
  {
    id: "f-magic-formula",
    topic: "federal",
    question: "Mi a 'Zauberformel' (Mágikus formula)?",
    options: [
      "Egy adózási képlet",
      "A Bundesrat 7 helyének arányos pártmegosztása",
      "Egy közlekedési szabály",
      "Egy egészségbiztosítási szabály",
    ],
    correct: 1,
    explanation: "2003-tól: 2 SVP + 2 SP + 2 FDP + 1 Mitte (régen 2 CVP). A 4 nagy párt megosztja a Bundesrat helyeit.",
  },
  {
    id: "f-election-cycle",
    topic: "federal",
    question: "Milyen időközönként van Nationalrat-választás?",
    options: ["2 év", "3 év", "4 év", "5 év"],
    correct: 2,
    explanation: "4 év — októberben tartják. A Ständerat választás kantonok szerint változik (jellemzően ugyanakkor).",
  },
  {
    id: "f-government-form",
    topic: "federal",
    question: "Milyen állam-forma Svájc?",
    options: [
      "Alkotmányos monarchia",
      "Föderatív szövetségi köztársaság (Bundesstaat)",
      "Egyesült királyság",
      "Egységes (centralizált) köztársaság",
    ],
    correct: 1,
    explanation: "Föderatív Bundesstaat 1848 óta. Három szint: szövetség, kanton, község. Mindegyiknek saját autonómiája van.",
  },
  {
    id: "f-supreme-court",
    topic: "federal",
    question: "Hol székel a Szövetségi Bíróság (Bundesgericht)?",
    options: ["Bern", "Lausanne", "Zürich", "Basel"],
    correct: 1,
    explanation: "Lausanne — a klasszikus 'Genfi-tó parti' bírósági fellebbviteli fórum. Bern a végrehajtó, Lausanne az igazságszolgáltatás.",
  },
  {
    id: "f-direct-democracy",
    topic: "federal",
    question: "Mi a 'direkte Demokratie' (közvetlen demokrácia)?",
    options: [
      "A polgárok közvetlenül választanak a Bundesrat-ba",
      "A polgárok népszavazáson dönthetnek törvényekről, alkotmányról",
      "Minden polgár közvetlenül beszélhet a miniszterrel",
      "A Bundesrat közvetlenül a néppel kommunikál",
    ],
    correct: 1,
    explanation: "A polgárok aláírás-gyűjtéssel kezdeményezhetnek (Initiative) vagy népszavazásra vihetnek törvényt (Referendum).",
  },
  {
    id: "f-initiative",
    topic: "federal",
    question: "Hány aláírás kell egy szövetségi népi kezdeményezéshez (Initiative)?",
    options: ["10 000", "50 000", "100 000", "250 000"],
    correct: 2,
    explanation: "100 000 érvényes aláírás 18 hónapon belül. Ez után népszavazásra kerül az alkotmány-módosítási javaslat.",
  },
  {
    id: "f-referendum",
    topic: "federal",
    question: "Hány aláírás kell egy fakultatív szövetségi referendumhoz?",
    options: ["10 000", "50 000", "100 000", "250 000"],
    correct: 1,
    explanation: "50 000 aláírás 100 nap alatt. Új törvényre népszavazás kérhető ezzel — ha kérik, és a többség 'nem'-mel szavaz, a törvény nem lép életbe.",
  },
  {
    id: "f-voting-frequency",
    topic: "federal",
    question: "Hány alkalommal van népszavazás (Volksabstimmung) szövetségi szinten egy évben?",
    options: ["1-szer", "2-szer", "3-4-szer", "Havonta"],
    correct: 2,
    explanation: "3-4 alkalom évente (március, június, szeptember, november 4 vasárnapja). Egy-egy alkalommal akár 3-5 javaslat is.",
  },
  {
    id: "f-parties",
    topic: "federal",
    question: "Melyik a legnagyobb svájci párt képviselő-szám szerint?",
    options: ["SP (Szociáldemokrata)", "FDP (Liberális)", "SVP (Néppárt)", "Mitte"],
    correct: 2,
    explanation: "SVP (Schweizerische Volkspartei) — a 2023-as választáson kb. 28%. Konzervatív, nemzeti-orientált.",
  },
  {
    id: "f-svp-position",
    topic: "federal",
    question: "Politikai irányultságában az SVP:",
    options: ["Bal-zöld", "Liberális", "Konzervatív / jobboldali", "Anarchista"],
    correct: 2,
    explanation: "Konzervatív, EU-szkeptikus, bevándorlás-kritikus. A 'Magic Formula' jobboldali párja.",
  },
  {
    id: "f-no-prime-minister",
    topic: "federal",
    question: "Ki Svájc miniszterelnöke?",
    options: [
      "A Bundespräsident",
      "Az SVP elnöke",
      "Nincs miniszterelnök — 7 fős kollektív kormány (Bundesrat)",
      "A Bundesgericht elnöke",
    ],
    correct: 2,
    explanation: "Nincs egyetlen 'PM' — a 7 fős Bundesrat együttes vezetés. Az éves 'Bundespräsident' csak protokolláris.",
  },
  {
    id: "f-laws-source",
    topic: "federal",
    question: "Melyik a legmagasabb jogforrás Svájcban?",
    options: [
      "A Bundesverfassung (Szövetségi Alkotmány)",
      "A Bundesgericht ítéletei",
      "A kantonális alkotmányok",
      "A nemzetközi szerződések",
    ],
    correct: 0,
    explanation: "A Szövetségi Alkotmány (1848, 1999 reform). Csak népszavazáson módosítható (kettős többség kell).",
  },
  {
    id: "f-double-majority",
    topic: "federal",
    question: "Mi a 'doppeltes Mehr' (kettős többség)?",
    options: [
      "Két alkalommal kell szavazni",
      "Népi többség + kantonális többség (a többség kantonok többségében is)",
      "A Bundesrat + a Bundesgericht egyetértése",
      "Két párt egyetértése",
    ],
    correct: 1,
    explanation: "Alkotmány-módosításhoz kell: a választók többsége + a kantonok többsége. Így a kis kantonok véleménye is számít.",
  },
  {
    id: "f-army",
    topic: "federal",
    question: "Milyen jellegű a svájci hadsereg?",
    options: [
      "Kötelező katonai szolgálat férfiaknak (Milizarmee)",
      "Önkéntes hivatásos hadsereg",
      "NATO-tag",
      "Nincs hadserege",
    ],
    correct: 0,
    explanation: "Milizarmee — kötelező a 18-25 éves férfiaknak (~18 hét alapkiképzés + évek 3 hetes tartalékos szolgálat).",
  },
  {
    id: "f-military-alternatives",
    topic: "federal",
    question: "Mit tehet az, aki nem akar katonai szolgálatot?",
    options: [
      "Semmit — kötelező mindenkinek",
      "Civil szolgálatot (Zivildienst) — 1.5× hosszabb",
      "Pénzbüntetést fizet",
      "Csak külföldre költözhet",
    ],
    correct: 1,
    explanation: "Zivildienst (civil szolgálat) — kórházban, idősotthonban, környezetvédelmi szervezetnél. Hosszabb, de elismert.",
  },
  {
    id: "f-foreign-policy",
    topic: "federal",
    question: "Melyik nemzetközi szervezetnek NEM tagja Svájc?",
    options: ["ENSZ", "EFTA", "EU", "WTO"],
    correct: 2,
    explanation: "Az EU-nak NEM tagja. Tagja: ENSZ (2002 óta), EFTA, WTO, OECD. Bilaterális megállapodásokkal kapcsolódik az EU-hoz.",
  },
  {
    id: "f-neutrality",
    topic: "federal",
    question: "Mit jelent a svájci semlegesség (Neutralität)?",
    options: [
      "Nem szövetkezik katonai szövetségekkel, és nem vesz részt mások háborúiban",
      "Nincs hadserege",
      "Minden konfliktusban közvetít",
      "Nem küld diplomatákat",
    ],
    correct: 0,
    explanation: "Önként vállalt, 1815 óta nemzetközileg elismert. Hadserege VAN, csak nem szövetkezik (pl. NATO-nem-tag).",
  },
  {
    id: "f-kantonal-autonomy",
    topic: "federal",
    question: "Melyik NEM kantonális hatáskör?",
    options: ["Adózás (részben)", "Oktatás", "Nemzetvédelem", "Egészségügy"],
    correct: 2,
    explanation: "Nemzetvédelem = szövetségi hatáskör. Kantoni: oktatás, rendőrség, kanton-adó, egészségügy nagy része.",
  },
  {
    id: "f-cantons-count",
    topic: "federal",
    question: "Hány kanton-szavazat van egy szövetségi referendumon?",
    options: ["20", "23", "26", "20.5 (a fél-kantonok ½-et érnek)"],
    correct: 3,
    explanation: "20 teljes kanton (1-1 szavazat) + 6 fél-kanton (½ szavazat) = 20+3 = 23 'kanton-pont'. Furcsán hangzik de hivatalos.",
  },
  {
    id: "f-flag-day",
    topic: "federal",
    question: "Mit ünnepelünk augusztus 1-jén?",
    options: [
      "A semlegesség kihirdetése (1815)",
      "Az 1291-es Rütli-eskü (Konföderáció alapítása)",
      "A modern alkotmány kihirdetése (1848)",
      "Az ENSZ-csatlakozás (2002)",
    ],
    correct: 1,
    explanation: "Augusztus 1. = 1291 — Uri, Schwyz, Unterwalden szövetsége a Rütli-réten. Nemzeti ünnep 1891 óta.",
  },

  // ============ HISTORY — Történelem (15) ============
  {
    id: "h-1291",
    topic: "history",
    question: "Mikor alapították a svájci Konföderációt?",
    options: ["1291", "1389", "1492", "1648"],
    correct: 0,
    explanation: "1291 augusztus 1. — a Rütli-eskü napja. Uri, Schwyz és Unterwalden szövetsége.",
  },
  {
    id: "h-1815",
    topic: "history",
    question: "Mikor ismerték el nemzetközileg Svájc semlegességét?",
    options: ["1648 (Vesztfáliai béke)", "1815 (Bécsi kongresszus)", "1848 (alkotmány)", "1945 (ENSZ-alapítás)"],
    correct: 1,
    explanation: "1815 — a Bécsi kongresszus. A nagyhatalmak elismerték az 'örökös semlegességet'.",
  },
  {
    id: "h-1848",
    topic: "history",
    question: "Mi történt 1848-ban Svájcban?",
    options: [
      "Az utolsó polgárháború",
      "Az új szövetségi alkotmány — Svájc modern állammá vált",
      "Belépés az ENSZ-be",
      "A frank pénznem bevezetése",
    ],
    correct: 1,
    explanation: "1848 — modern föderatív alkotmány. A laza Konföderáció helyett egységes Bundesstaat. Bern lett a főváros.",
  },
  {
    id: "h-sonderbund",
    topic: "history",
    question: "Mi volt a Sonderbundskrieg (1847)?",
    options: [
      "Háború Ausztriával",
      "Az utolsó svájci polgárháború — katolikus kantonok különszövetsége vs. protestáns többség",
      "Vallási reform",
      "A frank pénznem-vita",
    ],
    correct: 1,
    explanation: "Rövid (27 napos) belháború 1847-ben. A katolikus kantonok különszövetsége vereséget szenvedett — utat nyitva az 1848-as alkotmánynak.",
  },
  {
    id: "h-women-vote",
    topic: "history",
    question: "Mikor kaptak választójogot a nők szövetségi szinten?",
    options: ["1918", "1945", "1971", "1991"],
    correct: 2,
    explanation: "1971 — népszavazáson döntöttek. Európában nagyon későn. Appenzell Innerrhoden kantoni szinten csak 1990-ben.",
  },
  {
    id: "h-un",
    topic: "history",
    question: "Mikor lépett Svájc az ENSZ-be?",
    options: ["1945", "1971", "1992", "2002"],
    correct: 3,
    explanation: "2002. március — népszavazáson döntöttek (54%). Svájc volt az utolsó európai ország ami csatlakozott.",
  },
  {
    id: "h-eu-1992",
    topic: "history",
    question: "Mi történt 1992-ben az EU-csatlakozással?",
    options: [
      "Belépés a CSEPB (EU)-ba",
      "A nép elutasította az EGT-csatlakozást (50.3% nem)",
      "Schengen-csatlakozás",
      "ENSZ-csatlakozás",
    ],
    correct: 1,
    explanation: "1992 december 6. — az európai gazdasági térség (EGT) csatlakozást a nép 50.3%-kal elutasította. Sorsdöntő pillanat.",
  },
  {
    id: "h-1815-borders",
    topic: "history",
    question: "Mi történt 1815-ben a határokkal?",
    options: [
      "Svájc elveszítette Tessin-t",
      "Mai határok kialakultak — Wallis, Genf, Neuchâtel csatlakoztak",
      "Csehország csatlakozott",
      "Ausztria megszállta",
    ],
    correct: 1,
    explanation: "A Bécsi kongresszuson Svájc megkapta Wallis-t, Genf-et, Neuchâtel-t. 1815-től a határok lényegében változatlanok.",
  },
  {
    id: "h-jura",
    topic: "history",
    question: "Mikor jött létre Jura kanton?",
    options: ["1815", "1848", "1979", "2001"],
    correct: 2,
    explanation: "1979 — kivált Bern kantonból (francia-ajkú katolikus régió). A legújabb svájci kanton.",
  },
  {
    id: "h-banking-secret",
    topic: "history",
    question: "Mikor szűnt meg a klasszikus banktitok külföldi adóhatóságokkal szemben?",
    options: ["1990", "2009 (UBS-botrány)", "2017 (AEOI)", "Még él"],
    correct: 2,
    explanation: "2017 januárjától: automatikus információcsere (CRS/AEOI) a CH és OECD-országok közt. A klasszikus titok megszűnt.",
  },
  {
    id: "h-reformer",
    topic: "history",
    question: "Ki volt Ulrich Zwingli?",
    options: [
      "Egy 19. századi feltaláló",
      "16. századi reformátor Zürichben (a 'svájci' protestantizmus megalapítója)",
      "Egy bankár",
      "Egy festő",
    ],
    correct: 1,
    explanation: "1484-1531 — zürichi reformátor, Luther kortársa. A svájci református mozgalom alapító alakja.",
  },
  {
    id: "h-calvin",
    topic: "history",
    question: "Hol élt és tanított Jean Calvin?",
    options: ["Bern", "Lausanne", "Genf", "Zürich"],
    correct: 2,
    explanation: "Genf — 1541-től 1564-ig (halálig). A 'protestáns Rómává' tette Genfet. A kálvinizmus világméretű hatású.",
  },
  {
    id: "h-pestalozzi",
    topic: "history",
    question: "Ki volt Johann Heinrich Pestalozzi (1746-1827)?",
    options: [
      "Egy svájci hadvezér",
      "A modern pedagógia úttörője — szegény gyerekeknek hozott létre iskolákat",
      "Egy festő",
      "Egy üzletember",
    ],
    correct: 1,
    explanation: "Svájci pedagógus, a 'gyermek-központú' tanítás úttörője. A 10 frankos bankjegyen szerepel.",
  },
  {
    id: "h-einstein",
    topic: "history",
    question: "Mikor élt Einstein Svájcban?",
    options: [
      "Sosem élt itt",
      "1895-1933 (Aarau, Zürich, Bern) — a relativitás-elméletet Bernben dolgozta ki",
      "Csak látogatóként járt",
      "Csak az ETH-ban tanított rövid ideig",
    ],
    correct: 1,
    explanation: "Einstein 1895-ben jött iskolába Aarauba, ETH-n diplomázott, Bernben dolgozott a szabadalmi hivatalban — és ott írta a 1905-ös 'csoda év' tanulmányait.",
  },
  {
    id: "h-wars",
    topic: "history",
    question: "Részt vett Svájc a 20. századi világháborúkban?",
    options: [
      "Igen, mindkettőben (Tengelyhatalmak oldalán)",
      "Csak az 1. világháborúban",
      "Nem — semleges maradt, de mozgósította a hadsereget védelemre",
      "Csak a 2. világháborúban",
    ],
    correct: 2,
    explanation: "Mindkét háborúban semleges. A hadsereget viszont teljes mozgósításra hívták (1914-18, 1939-45) — főleg a határvédelemre.",
  },

  // ============ GEOGRAPHY — Földrajz (10) ============
  {
    id: "g-cantons-count",
    topic: "geography",
    question: "Hány kantonja van Svájcnak?",
    options: ["20", "23", "26", "28"],
    correct: 2,
    explanation: "26 kanton — 20 teljes + 6 fél-kanton. A fél-kantonok történelmi okokból (osztott kantonok).",
  },
  {
    id: "g-capital",
    topic: "geography",
    question: "Mi a főváros?",
    options: ["Zürich", "Genf", "Bern", "Basel"],
    correct: 2,
    explanation: "Bern — 'Bundesstadt' 1848 óta. NEM Zürich (az csak a legnagyobb város)!",
  },
  {
    id: "g-languages",
    topic: "geography",
    question: "Hány hivatalos nyelv van?",
    options: ["2", "3", "4", "5"],
    correct: 2,
    explanation: "4: német (62%), francia (23%), olasz (8%), retoromán (0.5%). Az első három 'nemzeti' nyelvként a kormányban is.",
  },
  {
    id: "g-largest-city",
    topic: "geography",
    question: "Melyik a legnagyobb város?",
    options: ["Bern", "Zürich", "Basel", "Genf"],
    correct: 1,
    explanation: "Zürich kb. 440 000 fő. Sorrend: Zürich > Genf > Basel > Lausanne > Bern.",
  },
  {
    id: "g-highest-peak",
    topic: "geography",
    question: "Mi a legmagasabb csúcs?",
    options: ["Matterhorn", "Eiger", "Dufourspitze (Monte Rosa)", "Jungfrau"],
    correct: 2,
    explanation: "Dufourspitze 4634 m (Monte Rosa-tömb, Wallis). A Matterhorn 4478 m — 'csak' a 3.",
  },
  {
    id: "g-rivers",
    topic: "geography",
    question: "Melyik svájci eredetű folyó NEM ömlik az Északi-tengerbe?",
    options: ["Rajna", "Rhône (Mediterrán-tengerbe)", "Aare", "Reuss"],
    correct: 1,
    explanation: "A Rhône Wallis-ban ered, és Franciaországon át a Földközi-tengerbe ömlik. A Rajna, Aare, Reuss Északi-tengerbe.",
  },
  {
    id: "g-neighbors",
    topic: "geography",
    question: "Hány országgal határos Svájc?",
    options: ["3", "4", "5", "6"],
    correct: 2,
    explanation: "5: Németország, Franciaország, Olaszország, Ausztria, Liechtenstein.",
  },
  {
    id: "g-lakes",
    topic: "geography",
    question: "Melyik a legnagyobb teljesen svájci tó?",
    options: ["Genfi-tó", "Neuchâteli-tó", "Bodeni-tó", "Lago Maggiore"],
    correct: 1,
    explanation: "A Neuchâteli-tó — 218 km². A Genfi, Bodeni és Maggiore mind nemzetközi vizek.",
  },
  {
    id: "g-largest-canton",
    topic: "geography",
    question: "Melyik a területileg legnagyobb kanton?",
    options: ["Bern", "Graubünden", "Wallis", "Zürich"],
    correct: 1,
    explanation: "Graubünden — 7105 km². Lakossága viszont kicsi (kb. 200 000). 3 hivatalos nyelv (DE/IT/RM).",
  },
  {
    id: "g-most-populated",
    topic: "geography",
    question: "Melyik a legnépesebb kanton?",
    options: ["Bern", "Zürich", "Aargau", "Waadt"],
    correct: 1,
    explanation: "Zürich kanton — kb. 1.6 millió lakos.",
  },

  // ============ CIVIC — Állampolgári jogok / kötelességek (10) ============
  {
    id: "c-voting-age",
    topic: "civic",
    question: "Hány éves kortól szavazhat az ember szövetségi szinten?",
    options: ["16", "18", "20", "21"],
    correct: 1,
    explanation: "18 év. Pár kanton (pl. Glarus) 16 éves kortól engedi a kantoni szavazást.",
  },
  {
    id: "c-citizenship-years",
    topic: "civic",
    question: "Hány év folyamatos tartózkodás után igényelhető a svájci állampolgárság?",
    options: ["5 év", "8 év", "10 év", "12 év"],
    correct: 2,
    explanation: "Általában 10 év (2018 óta). C-engedéllyel kell rendelkezni. Magyar állampolgárként a kettős állampolgárság engedélyezett.",
  },
  {
    id: "c-language-req",
    topic: "civic",
    question: "Milyen nyelvi szint kell az állampolgársági kérelemhez?",
    options: [
      "Nincs követelmény",
      "B1 szóban + A2 írásban (svájci hivatalos nyelven)",
      "C1 mindenből",
      "Csak német",
    ],
    correct: 1,
    explanation: "B1 szóban + A2 írásban — német, francia vagy olasz. Sok kanton ennél szigorúbb.",
  },
  {
    id: "c-buergerort",
    topic: "civic",
    question: "Mi a 'Bürgerort'?",
    options: [
      "A jelenlegi lakhely",
      "A származási / családi község — az állampolgárság történelmi alapja",
      "A munkahely címe",
      "A kanton-főváros",
    ],
    correct: 1,
    explanation: "A Bürgerort a család származási községe — történelmileg fontos. Még mindig megjelenik a passzban / iratokban.",
  },
  {
    id: "c-id-card",
    topic: "civic",
    question: "Melyik dokumentum NEM elegendő személyazonossági igazolásra Svájcban?",
    options: [
      "Útlevél",
      "Svájci személyi (Identitätskarte)",
      "Tartózkodási engedély (Ausweis B/C)",
      "Autóvezetői engedély",
    ],
    correct: 3,
    explanation: "A jogosítvány NEM hivatalos azonosító Svájcban (USA-tól eltérően). Útlevél vagy ID kell.",
  },
  {
    id: "c-permits",
    topic: "civic",
    question: "Melyik engedély a 'letelepedési' (végleges)?",
    options: ["L (rövid távú)", "B (tartózkodási)", "C (letelepedési)", "G (határátkelő)"],
    correct: 2,
    explanation: "C-engedély = letelepedési, gyakorlatilag határozatlan idejű. 5-10 év B után igényelhető. Quellensteuer megszűnik.",
  },
  {
    id: "c-school",
    topic: "civic",
    question: "Mennyi idős kortól meddig kötelező az iskola?",
    options: [
      "5-15 év (10 év)",
      "4-15 év (11 év)",
      "6-16 év (10 év)",
      "Kantontól függ, kb. 4-15",
    ],
    correct: 3,
    explanation: "Kanton-függő. Általában 4 (óvoda) - 15 (kötelező iskola vége). Az alapfok 11 év (Kindergarten + Volksschule).",
  },
  {
    id: "c-conscription",
    topic: "civic",
    question: "Kötelező-e a katonai szolgálat?",
    options: [
      "Senkinek sem",
      "Csak svájci férfiaknak (18-25 év között)",
      "Mindenkinek, beleértve a nőket",
      "Csak külföldieknek",
    ],
    correct: 1,
    explanation: "Csak svájci férfiaknak kötelező 18-25 közt. Nőknek opcionális. Külföldieknek nem. Civil szolgálat (Zivildienst) is választható.",
  },
  {
    id: "c-health-insurance",
    topic: "civic",
    question: "Kötelező-e az egészségbiztosítás (Grundversicherung)?",
    options: [
      "Igen — mindenkinek, 90 napon belül érkezéstől",
      "Csak a fizetett munkavállalóknak",
      "Csak svájci állampolgároknak",
      "Önkéntes",
    ],
    correct: 0,
    explanation: "Mindenkinek kötelező 90 napon belül. A díj saját költségen — a kanton segélyezi a kis-jövedelmű háztartásokat (Prämienverbilligung).",
  },
  {
    id: "c-tax-declaration",
    topic: "civic",
    question: "Mikor kell adóbevallást benyújtani?",
    options: ["Január 31.", "Március 31.", "Június 30.", "December 31."],
    correct: 1,
    explanation: "Március 31. — kantontól függően meghosszabbítható ápr. 30. vagy szept. 30.-ig. C-engedélyeseknek és gazdag B-eseknek kötelező.",
  },

  // ============ CANTON — Kanton-specifikus (15+ kérdés, kantonkód-tagolva) ============
  // ZÜRICH (ZH)
  {
    id: "z-zh-sechselauten",
    topic: "canton",
    cantonCode: "ZH",
    question: "Mi a Sechseläuten Zürichben?",
    options: [
      "Vasárnapi piac",
      "Tavaszi cégfesztivál — a Böögg (hóember) elégetésével",
      "Vízisport-verseny",
      "Bortermelő-fesztivál",
    ],
    correct: 1,
    explanation: "Áprilisi tavaszünnep — a céhek felvonulása és a Böögg-égetés. Cinegéből jósolják a nyarat (gyorsabb robbanás = jobb idő).",
  },
  {
    id: "z-zh-bahnhofstrasse",
    topic: "canton",
    cantonCode: "ZH",
    question: "Mi a Bahnhofstrasse Zürichben?",
    options: [
      "Pályaudvar (Hauptbahnhof)",
      "A világ egyik legdrágább bevásárló-utcája — luxusüzletek, bankok",
      "Egy iskolakerület",
      "A Limmat folyó híd-rendszere",
    ],
    correct: 1,
    explanation: "1.4 km hosszú, Zürich szíve. Luxusmárkák, svájci órák, bankok. A világ TOP 5-legdrágább kiskereskedelmi utcája közt.",
  },
  {
    id: "z-zh-eth",
    topic: "canton",
    cantonCode: "ZH",
    question: "Mi az ETH Zürich?",
    options: [
      "Egy hagyományos étterem",
      "Szövetségi műszaki egyetem — Einstein, Pauli, Röntgen és 20+ Nobel-díjas iskolája",
      "Egy kórház",
      "Egy bevásárlóközpont",
    ],
    correct: 1,
    explanation: "Eidgenössische Technische Hochschule — 1855 alapítás. A világ top 10 egyetem között.",
  },

  // BERN (BE)
  {
    id: "z-be-bundesstadt",
    topic: "canton",
    cantonCode: "BE",
    question: "Mit jelent Bern a 'Bundesstadt' címe?",
    options: [
      "Központi vasútállomás",
      "Szövetségi főváros — itt van a Bundeshaus (parlament + kormány)",
      "Bank-központ",
      "Olimpiai város",
    ],
    correct: 1,
    explanation: "Bern a SZÖVETSÉGI főváros. NEM 'Hauptstadt' a hivatalos cím, hanem 'Bundesstadt' (alkotmányos eltérés).",
  },
  {
    id: "z-be-zytglogge",
    topic: "canton",
    cantonCode: "BE",
    question: "Mi a Zytglogge?",
    options: [
      "Egy híres torony és középkori óra Bern óvárosában",
      "Egy hegyivasút",
      "Egy étterem",
      "Egy múzeum",
    ],
    correct: 0,
    explanation: "Berni középkori toronyóra (1218 alapítás, 1530-tól óra). UNESCO világörökség. Albert Einstein lakott a közelben.",
  },
  {
    id: "z-be-bear",
    topic: "canton",
    cantonCode: "BE",
    question: "Mi Bern város címerállata?",
    options: ["Sas", "Medve", "Oroszlán", "Bika"],
    correct: 1,
    explanation: "Medve — a város nevét is innen kapja (legenda szerint Berchtold von Zähringen herceg vadászott medvére).",
  },

  // BASEL (BS)
  {
    id: "z-bs-fasnacht",
    topic: "canton",
    cantonCode: "BS",
    question: "Mi a Basler Fasnacht?",
    options: [
      "Egy típusú sajt",
      "Bázel híres farsangja — UNESCO örökség, hajnali 4-kor kezdődik",
      "Egy folyópart sétány",
      "Egy gyár",
    ],
    correct: 1,
    explanation: "3 napos farsang február/márciusban. A 'Morgestraich' (hajnali 4-kor) bekapcsolja a lámpákat — UNESCO szellemi örökség.",
  },
  {
    id: "z-bs-rhein",
    topic: "canton",
    cantonCode: "BS",
    question: "Mi különleges a Rajnával kapcsolatban Bázelben?",
    options: [
      "Itt ered a Rajna",
      "Itt válik hajózhatóvá a Rajna (CH-DE-FR hármas-határ)",
      "Itt szigetelik el a tengeralattjáróktól",
      "Csak nyáron folyik",
    ],
    correct: 1,
    explanation: "Bázel a legészakibb svájci város — a Rajnán innen kezdve hajózható egészen Rotterdamig. CH-DE-FR hármas-határ.",
  },
  {
    id: "z-bs-pharma",
    topic: "canton",
    cantonCode: "BS",
    question: "Mi Bázel fő ipari profilja?",
    options: ["Óragyártás", "Pharma + bio-technológia (Roche, Novartis)", "Autógyártás", "Élelmiszer"],
    correct: 1,
    explanation: "A Roche és a Novartis központja — a 'Pharma-Vadon'. Több tízezer tudós dolgozik a vegyiparban.",
  },

  // GENF (GE)
  {
    id: "z-ge-calvin",
    topic: "canton",
    cantonCode: "GE",
    question: "Ki tette Genfet a protestáns reformáció központjává?",
    options: ["Martin Luther", "Ulrich Zwingli", "Jean Calvin", "John Knox"],
    correct: 2,
    explanation: "Jean Calvin (1509-1564). 1541-től Genfben dolgozott. A 'Genfer Reformation' világméretű hatású.",
  },
  {
    id: "z-ge-un",
    topic: "canton",
    cantonCode: "GE",
    question: "Mi a Genf nemzetközi jelentősége?",
    options: [
      "Csak a Genfi-tó turizmusa",
      "Egyezmények városa — ENSZ európai központja, WHO, ICRC, ITU itt",
      "Csak gyárai miatt",
      "Csak banki miatt",
    ],
    correct: 1,
    explanation: "Genf a klasszikus 'nemzetközi szervezetek városa'. Több mint 100 nemzetközi szervezet itt (ENSZ, WHO, ILO, ITU, ICRC).",
  },
  {
    id: "z-ge-jet-deau",
    topic: "canton",
    cantonCode: "GE",
    question: "Mi a Jet d'Eau Genfben?",
    options: [
      "Egy gyors vonat",
      "140 m magas vízsugár a Genfi-tóban — a város szimbóluma",
      "Egy étterem",
      "Egy hegyivasút",
    ],
    correct: 1,
    explanation: "Eredetileg a vízhálózat nyomás-szabályozására (1886) — ma turisztikai látnivaló. 140 m magasra szökell.",
  },

  // LUZERN (LU)
  {
    id: "z-lu-kapellbrücke",
    topic: "canton",
    cantonCode: "LU",
    question: "Mi a Kapellbrücke Luzernben?",
    options: [
      "Egy templom",
      "14. századi fedett fahíd a Reuss folyón — Európa egyik legrégibb",
      "Egy kórház",
      "Egy múzeum",
    ],
    correct: 1,
    explanation: "1333-ban épült — fedett fahíd Luzern szimbóluma. 1993-ban tűzvész elpusztította, de újjáépítették.",
  },
  {
    id: "z-lu-pilatus",
    topic: "canton",
    cantonCode: "LU",
    question: "Mi a Pilatus Luzern mellett?",
    options: [
      "Egy étterem",
      "Hegy (2128 m) — a világ legmeredekebb fogaskerekű vasútja vezet fel rá (48%)",
      "Egy múzeum",
      "Egy bankház",
    ],
    correct: 1,
    explanation: "Luzern fölött tornyosul. A Pilatus-Bahn 48%-os lejtéssel a világ legmeredekebb fogaskerekűje (1889 óta).",
  },

  // TESSIN (TI)
  {
    id: "z-ti-language",
    topic: "canton",
    cantonCode: "TI",
    question: "Melyik az egyetlen tisztán olasz-ajkú kanton?",
    options: ["Wallis", "Graubünden", "Tessin (Ticino)", "Jura"],
    correct: 2,
    explanation: "Tessin — kb. 350 000 lakos, 80% olasz anyanyelvű. Lugano, Locarno itt. Graubünden 3-nyelvű (DE/IT/RM).",
  },
  {
    id: "z-ti-castles",
    topic: "canton",
    cantonCode: "TI",
    question: "Mi a Castelli di Bellinzona?",
    options: [
      "Egy étterem-lánc",
      "3 középkori vár Bellinzona-ban — UNESCO világörökség",
      "Egy borvidék",
      "Egy múzeum-szigetet",
    ],
    correct: 1,
    explanation: "Castelgrande, Montebello, Sasso Corbaro — 3 középkori vár Bellinzona-ban. 2000 óta UNESCO világörökség.",
  },

  // WAADT (VD)
  {
    id: "z-vd-lausanne-ioc",
    topic: "canton",
    cantonCode: "VD",
    question: "Mi van Lausanne-ban a Lausanne Olympic Museum mellett?",
    options: [
      "ENSZ központ",
      "NOB (IOC) székhelye — az olimpiai mozgalom központja",
      "WHO központ",
      "WTO központ",
    ],
    correct: 1,
    explanation: "Az IOC (Nemzetközi Olimpiai Bizottság) 1915 óta Lausanne-ban. A 'Capitale Olympique' címet viseli.",
  },
  {
    id: "z-vd-lavaux",
    topic: "canton",
    cantonCode: "VD",
    question: "Mi a Lavaux Waadt-ban?",
    options: [
      "Egy halpiac",
      "UNESCO világörökség szőlőtermesztő terasz a Genfi-tó partján",
      "Egy hegyivasút",
      "Egy múzeum",
    ],
    correct: 1,
    explanation: "30 km terasz-szőlő a tó felett — 12. századi szerzetes-munka. 2007 óta UNESCO világörökség.",
  },

  // ST. GALLEN (SG)
  {
    id: "z-sg-abbey",
    topic: "canton",
    cantonCode: "SG",
    question: "Mi a St. Gallen-i Kolostor (Stiftsbibliothek)?",
    options: [
      "Egy étterem",
      "Az egyik leghíresebb középkori szerzetesi könyvtár — UNESCO világörökség",
      "Egy kórház",
      "Egy bank",
    ],
    correct: 1,
    explanation: "8. századi alapítás. A barokk könyvtárterem és a 170 000 kötetes gyűjtemény UNESCO világörökség 1983 óta.",
  },

  // AARGAU (AG)
  {
    id: "z-ag-nuclear",
    topic: "canton",
    cantonCode: "AG",
    question: "Miről híres Aargau kanton ipari szempontból?",
    options: [
      "Csokoládégyárakról",
      "Atomreaktorokról (4 db, ami Svájc atomenergiáját adja)",
      "Hajógyártásról",
      "Sajtgyártásról",
    ],
    correct: 1,
    explanation: "Aargau-ban 3 atomerőmű működik (Beznau I-II, Gösgen). Beznau a világ egyik legrégibb működő reaktora (1969).",
  },
];

/** Hány kérdés van összesen kantonra. */
export function countCantonQuestions(cantonCode: string): number {
  return EB_BANK.filter((q) => q.topic === "canton" && q.cantonCode === cantonCode).length;
}
