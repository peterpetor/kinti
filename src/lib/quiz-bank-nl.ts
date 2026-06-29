/**
 * Holland Kvíz — kérdés-bank (a napi 3 kérdéses kvíz NL-változata).
 *
 * Témák: földrajz, történelem, kultúra, nyelv (Nederlands), étel & ital,
 * közlekedés, intézmények, hétköznapok. Minden kérdés 4 választás + magyarázat.
 *
 * Forrás: általános holland köztudás + hivatalos ügyintézési alapok (BSN, DigiD,
 * zorgverzekering, gemeente). Tájékoztató jellegű, nem hivatalos tanácsadás.
 */

import type { QuizCategory, QuizQuestion } from "./quiz-bank";

/** Kategória-meta az NL kvízhez (a hétköznapok zászlója 🇳🇱). */
export const NL_QUIZ_CATEGORY_META: Record<QuizCategory, { label: string; emoji: string }> = {
  geography:    { label: "Földrajz",       emoji: "🗺️" },
  history:      { label: "Történelem",     emoji: "📜" },
  culture:      { label: "Kultúra",        emoji: "🎭" },
  language:     { label: "Nyelv",          emoji: "💬" },
  food:         { label: "Étel & ital",    emoji: "🍽️" },
  transport:    { label: "Közlekedés",     emoji: "🚆" },
  institutions: { label: "Intézmények",    emoji: "🏛️" },
  everyday:     { label: "Hétköznapok",    emoji: "🇳🇱" },
};

export const NL_QUIZ_BANK: QuizQuestion[] = [
  // === FÖLDRAJZ ===
  { id: "nl-geo-provinces", category: "geography", question: "Hány tartománya (provincia) van Hollandiának?", options: ["10", "12", "14", "16"], correct: 1, explanation: "12 provincia — pl. Noord-Holland, Zuid-Holland, Utrecht, Limburg." },
  { id: "nl-geo-capital", category: "geography", question: "Mi Hollandia hivatalos fővárosa?", options: ["Hága", "Rotterdam", "Amszterdam", "Utrecht"], correct: 2, explanation: "Amszterdam a főváros — bár a kormány és a parlament Hágában székel." },
  { id: "nl-geo-government", category: "geography", question: "Melyik városban van a holland kormány, a parlament és a királyi hivatal?", options: ["Amszterdam", "Hága (Den Haag)", "Rotterdam", "Eindhoven"], correct: 1, explanation: "Hága (Den Haag) — itt ülésezik a kormány, és itt van a Nemzetközi Bíróság is." },
  { id: "nl-geo-port", category: "geography", question: "Melyik Európa legnagyobb tengeri kikötője?", options: ["Hamburg", "Antwerpen", "Rotterdam", "Amszterdam"], correct: 2, explanation: "Rotterdam — Európa legnagyobb és legforgalmasabb kikötője." },
  { id: "nl-geo-sealevel", category: "geography", question: "Mi igaz Hollandia földrajzára?", options: ["Legmagasabb hegye 2000 m fölött van", "Területének nagy része tengerszint alatt vagy közelében fekszik", "Nincs tengerpartja", "Teljesen hegyvidék"], correct: 1, explanation: "A Nederland szó alföldet jelent; nagy részét gátak és polderek védik a tengertől." },
  { id: "nl-geo-neighbors", category: "geography", question: "Mely országokkal határos Hollandia szárazföldön?", options: ["Németország és Belgium", "Franciaország és Belgium", "Csak Németország", "Dánia és Németország"], correct: 0, explanation: "Keleten Németország, délen Belgium határolja." },

  // === TÖRTÉNELEM ===
  { id: "nl-his-goldenage", category: "history", question: "Melyik században élte Hollandia az aranykorát (Gouden Eeuw)?", options: ["15.", "17.", "19.", "20."], correct: 1, explanation: "A 17. század — világkereskedelem, festészet (Rembrandt), tudomány." },
  { id: "nl-his-voc", category: "history", question: "Mi volt a VOC (1602)?", options: ["Egy folyó", "A Holland Kelet-indiai Társaság", "Egy király", "Egy festő"], correct: 1, explanation: "A Vereenigde Oostindische Compagnie — gyakran a világ első részvénytársaságaként említik." },
  { id: "nl-his-oranje", category: "history", question: "Kit tartanak a haza atyjának Hollandiában?", options: ["Rembrandt", "Oránai Vilmos (Willem van Oranje)", "Erasmus", "Johan Cruyff"], correct: 1, explanation: "Oránai Vilmos vezette a spanyolok elleni függetlenségi harcot (80 éves háború)." },
  { id: "nl-his-liberation", category: "history", question: "Mikor van a felszabadulás napja (Bevrijdingsdag)?", options: ["Május 5.", "Június 4.", "Október 3.", "Január 1."], correct: 0, explanation: "Május 5. — 1945-ben ekkor szabadult fel az ország a náci megszállás alól." },
  { id: "nl-his-annefrank", category: "history", question: "Melyik városban rejtőzött Anne Frank?", options: ["Rotterdam", "Utrecht", "Amszterdam", "Haarlem"], correct: 2, explanation: "Amszterdam — a rejtekhely ma az Anne Frank Ház múzeum." },
  { id: "nl-his-king", category: "history", question: "Ki Hollandia jelenlegi királya?", options: ["Willem-Alexander", "Frederik", "Filip", "Harald"], correct: 0, explanation: "Willem-Alexander király (2013 óta); a felesége Máxima királyné." },

  // === KULTÚRA ===
  { id: "nl-cul-vangogh", category: "culture", question: "Melyik világhírű festő volt holland?", options: ["Picasso", "Vincent van Gogh", "Claude Monet", "Salvador Dalí"], correct: 1, explanation: "Van Gogh holland volt; Amszterdamban saját múzeuma van." },
  { id: "nl-cul-rijks", category: "culture", question: "Melyik múzeumban van Rembrandt Éjjeli őrjárat című festménye?", options: ["Louvre", "Rijksmuseum", "Prado", "Uffizi"], correct: 1, explanation: "A Rijksmuseumban, Amszterdamban." },
  { id: "nl-cul-tulip", category: "culture", question: "Melyik virág Hollandia egyik jelképe (Keukenhof)?", options: ["Rózsa", "Tulipán", "Levendula", "Napraforgó"], correct: 1, explanation: "A tulipán — tavasszal a Keukenhof a világ leghíresebb tulipánkertje." },
  { id: "nl-cul-kinderdijk", category: "culture", question: "Miről híres Kinderdijk?", options: ["Sajtpiac", "Történelmi szélmalmok", "Tulipánmezők", "Sörfőzde"], correct: 1, explanation: "19 régi szélmalom — UNESCO világörökség." },
  { id: "nl-cul-holland", category: "culture", question: "Mi a pontos a Holland és a Nederland szóhasználatban?", options: ["Pontosan ugyanaz", "A Holland szigorúan csak 2 tartomány (Noord- és Zuid-Holland)", "A Holland egy város", "A Nederland egy sziget"], correct: 1, explanation: "A Holland valójában 2 tartomány, de gyakran az egész országra használják." },

  // === NYELV ===
  { id: "nl-lang-official", category: "language", question: "Mi Hollandia hivatalos nyelve?", options: ["Német", "Holland (Nederlands)", "Angol", "Flamand"], correct: 1, explanation: "A holland (Nederlands); Frízföldön a fríz (Frysk) is hivatalos." },
  { id: "nl-lang-thanks", category: "language", question: "Hogy mondják hollandul, hogy köszönöm?", options: ["Dank je wel", "Bitte schön", "Grazie", "Tack"], correct: 0, explanation: "Dank je wel (közvetlen) vagy Dank u wel (formális)." },
  { id: "nl-lang-fiets", category: "language", question: "Mit jelent a fiets szó?", options: ["Sajt", "Kerékpár", "Csatorna", "Szélmalom"], correct: 1, explanation: "Fiets = kerékpár — Hollandiában több a bicikli, mint a lakos." },
  { id: "nl-lang-gezellig", category: "language", question: "Mit jelent a tipikus holland szó, a gezellig?", options: ["Drága", "Hangulatos, kellemes együttlét", "Gyors", "Hideg"], correct: 1, explanation: "A gezellig barátságos, otthonos hangulat; nehezen fordítható." },
  { id: "nl-lang-morning", category: "language", question: "Hogy köszönsz reggel hollandul?", options: ["Goedemorgen", "Guten Morgen", "Bonjour", "God morgon"], correct: 0, explanation: "Goedemorgen = jó reggelt." },

  // === ÉTEL & ITAL ===
  { id: "nl-food-stroopwafel", category: "food", question: "Mi a stroopwafel?", options: ["Sajtféle", "Két vékony ostya karamellszirup-töltelékkel", "Halétel", "Sörfajta"], correct: 1, explanation: "Stroopwafel — méltán híres holland édesség, gyakran a kávé tetejére teszik." },
  { id: "nl-food-haring", category: "food", question: "Hogyan eszik a hollandok klasszikusan a haringot (heringet)?", options: ["Sütve", "Nyersen, apróra vágott hagymával", "Levesben", "Mézzel füstölve"], correct: 1, explanation: "Nyers hering hagymával — utcai klasszikus (Hollandse Nieuwe)." },
  { id: "nl-food-cheese", category: "food", question: "Melyik világhírű sajt holland?", options: ["Gouda", "Cheddar", "Parmezán", "Brie"], correct: 0, explanation: "Gouda (és Edam) — a róluk elnevezett városokról kapták a nevüket." },
  { id: "nl-food-hagelslag", category: "food", question: "Mi a hagelslag, amit reggelire kenyérre szórnak?", options: ["Csokiszórat (reszelék)", "Só", "Cukor", "Fűszerkeverék"], correct: 0, explanation: "Hagelslag — csokiszórat vajas kenyéren; tipikus holland reggeli." },
  { id: "nl-food-patat", category: "food", question: "Mivel eszik a hollandok klasszikusan a sült krumplit (patat/friet)?", options: ["Ketchuppal", "Majonézzel", "Mézzel", "Tejföllel"], correct: 1, explanation: "Majonézzel (patatje met) — gyakran hagymával és szatészósszal." },

  // === KÖZLEKEDÉS ===
  { id: "nl-trans-ns", category: "transport", question: "Mi az NS Hollandiában?", options: ["A posta", "A vasúttársaság (Nederlandse Spoorwegen)", "Egy bank", "Egy áruházlánc"], correct: 1, explanation: "Nederlandse Spoorwegen — a fő vasúttársaság." },
  { id: "nl-trans-ovchip", category: "transport", question: "Mivel fizetsz a tömegközlekedésen Hollandiában?", options: ["OV-chipkaart vagy érintéses bankkártya", "Csak készpénz", "Bélyeggel", "Zsetonnal"], correct: 0, explanation: "OV-chipkaart vagy OVpay (érintéses bankkártya) — be- és kicsekkolsz." },
  { id: "nl-trans-bike", category: "transport", question: "Mi jellemző a holland közlekedésre?", options: ["Nincs bicikliút", "Több kerékpár van, mint ember", "Tilos a bicikli", "Csak autóval lehet közlekedni"], correct: 1, explanation: "Hollandiában több a bicikli, mint a lakos; kiépített fietspad-hálózat." },
  { id: "nl-trans-schiphol", category: "transport", question: "Mi a Schiphol?", options: ["Egy sziget", "Amszterdam nemzetközi repülőtere", "Egy sajtfajta", "Egy folyó"], correct: 1, explanation: "Schiphol — Hollandia fő repülőtere, részben tengerszint alatt." },
  { id: "nl-trans-fietspad", category: "transport", question: "Mi a fietspad?", options: ["Autópálya", "Kerékpárút", "Vasútvonal", "Sétálóutca"], correct: 1, explanation: "Fietspad = kerékpárút — külön jelzett, gyakran piros aszfaltú sáv." },

  // === INTÉZMÉNYEK ===
  { id: "nl-inst-bsn", category: "institutions", question: "Mi a BSN Hollandiában?", options: ["Egy bérlet", "A személyi azonosító szám (Burgerservicenummer)", "Egy bank", "Egy adónem"], correct: 1, explanation: "BSN (Burgerservicenummer) — szinte minden ügyintézéshez kell; a gemeentén kapod." },
  { id: "nl-inst-digid", category: "institutions", question: "Mi a DigiD?", options: ["Egy közösségi app", "Digitális azonosító az állami ügyintézéshez", "Egy bolt", "Egy adófajta"], correct: 1, explanation: "DigiD — ezzel lépsz be a hivatali online rendszerekbe (gemeente, Belastingdienst, zorg)." },
  { id: "nl-inst-zorg", category: "institutions", question: "Mi kötelező (kb. 18 évtől) minden Hollandiában élőnek?", options: ["Autó", "Alap-egészségbiztosítás (zorgverzekering)", "Kerékpár", "TV-előfizetés"], correct: 1, explanation: "A basisverzekering kötelező; magán biztosítóknál kötöd meg." },
  { id: "nl-inst-gemeente", category: "institutions", question: "Hol kell bejelentkezned, amikor Hollandiába költözöl?", options: ["A rendőrségen", "A gemeente (önkormányzat) lakcímnyilvántartásában", "A postán", "A bankban"], correct: 1, explanation: "A gemeentén regisztrálsz (inschrijven) — ehhez kötődik a BSN is." },
  { id: "nl-inst-huisarts", category: "institutions", question: "Ki a huisarts?", options: ["Fogorvos", "A háziorvos — a kapuőr az egészségügyben", "Ügyvéd", "Tanár"], correct: 1, explanation: "A huisarts a háziorvos; rajta keresztül jutsz el a szakorvoshoz." },

  // === HÉTKÖZNAPOK ===
  { id: "nl-every-currency", category: "everyday", question: "Mi a fizetőeszköz Hollandiában?", options: ["Holland forint", "Euró", "Gulden", "Korona"], correct: 1, explanation: "Euró (2002 óta); korábban a holland gulden volt." },
  { id: "nl-every-tikkie", category: "everyday", question: "Mi a Tikkie?", options: ["Egy étel", "Fizetési kérés / utalás-link app", "Egy ünnep", "Egy sajt"], correct: 1, explanation: "Tikkie — egyszerű fizetési kérés (pl. közös számla megosztása) linkkel." },
  { id: "nl-every-kingsday", category: "everyday", question: "Mikor van a Királynap (Koningsdag), amikor minden narancssárga?", options: ["Április 27.", "Május 1.", "December 5.", "Március 15."], correct: 0, explanation: "Április 27. — a király születésnapja; az ország narancsba (Oranje) öltözik." },
  { id: "nl-every-sint", category: "everyday", question: "Mikor hozza az ajándékot a Sinterklaas (a holland Mikulás)?", options: ["December 5. este (Pakjesavond)", "December 24.", "November 11.", "Január 6."], correct: 0, explanation: "December 5. este (Pakjesavond) a fő ajándékozás — nem karácsonykor." },
  { id: "nl-every-coffeeshop", category: "everyday", question: "Mi a különbség a coffeeshop és a café között Hollandiában?", options: ["Semmi", "A coffeeshop kannabiszt árul, a café kávézó/kocsma", "A café drágább", "A coffeeshop csak teát ad"], correct: 1, explanation: "Figyelem: a coffeeshop nem kávézó — ott puhadrogot árulnak; a kávé/sör helye a café." },
];
