/**
 * Spanyol Kvíz — kérdés-bank (a napi 3 kérdéses kvíz ES-változata).
 *
 * Témák: földrajz, történelem, kultúra, nyelv, étel & ital, közlekedés,
 * intézmények, hétköznapok. Minden kérdés 4 választás + magyarázat.
 *
 * ⚠️ Ez a KÖNNYED napi kvíz — szórakoztató köztudás, nem vizsga-anyag és nem
 * hivatalos tanácsadás. Ahol ügyintézési tudás szerepel (NIE, empadronamiento,
 * cita previa), ott SZÁNDÉKOSAN csak a stabil, évek óta változatlan alapot
 * kérdezzük: konkrét összeget/határidőt nem, mert az évente változik, és egy
 * elavult kvíz-válasz rosszabb, mint a hiánya. Azok a /tudasbazis cikkekben
 * vannak, dátumozva és hivatalos forrásra linkelve.
 */

import type { QuizCategory, QuizQuestion } from "./quiz-bank";

/** Kategória-meta a spanyol kvízhez. */
export const ES_QUIZ_CATEGORY_META: Record<QuizCategory, { label: string; emoji: string }> = {
  geography:    { label: "Földrajz",       emoji: "🗺️" },
  history:      { label: "Történelem",     emoji: "📜" },
  culture:      { label: "Kultúra",        emoji: "🎭" },
  language:     { label: "Nyelv",          emoji: "💬" },
  food:         { label: "Étel & ital",    emoji: "🥘" },
  transport:    { label: "Közlekedés",     emoji: "🚄" },
  institutions: { label: "Intézmények",    emoji: "🏛️" },
  everyday:     { label: "Hétköznapok",    emoji: "☀️" },
};

export const ES_QUIZ_BANK: QuizQuestion[] = [
  // === FÖLDRAJZ ===
  { id: "es-geo-communities", category: "geography", question: "Hány autonóm közösségre oszlik Spanyolország?", options: ["12", "15", "17", "22"], correct: 2, explanation: "17 autonóm közösség, plusz két autonóm város: Ceuta és Melilla — mindkettő Afrika partján." },
  { id: "es-geo-teide", category: "geography", question: "Mi Spanyolország legmagasabb pontja?", options: ["Mulhacén", "Teide", "Aneto", "Veleta"], correct: 1, explanation: "A Teide (3715 m) Tenerifén — a szárazföld legmagasabb csúcsa ehhez képest a Mulhacén (3479 m) a Sierra Nevadában." },
  { id: "es-geo-ebro", category: "geography", question: "Melyik a leghosszabb folyó, amely teljes hosszában Spanyolországban folyik?", options: ["Tajo", "Duero", "Ebro", "Guadalquivir"], correct: 2, explanation: "Az Ebro (kb. 930 km). A Tajo hosszabb, de Portugáliában ér véget — ott már Tejo a neve." },
  { id: "es-geo-second-city", category: "geography", question: "Melyik Spanyolország második legnépesebb városa?", options: ["Valencia", "Sevilla", "Barcelona", "Zaragoza"], correct: 2, explanation: "Barcelona, Katalónia fővárosa. Madrid az első, Valencia a harmadik." },
  { id: "es-geo-canarias", category: "geography", question: "Hol találhatók a Kanári-szigetek?", options: ["A Földközi-tengerben", "Az Atlanti-óceánban, Afrika partjainál", "A Vizcayai-öbölben", "A Baleár-tengerben"], correct: 1, explanation: "Az Atlanti-óceánban, Marokkó magasságában — ezért van ott egy órával kevesebb, mint a szárazföldön." },
  { id: "es-geo-baleares", category: "geography", question: "Melyik NEM tartozik a Baleár-szigetekhez?", options: ["Mallorca", "Menorca", "Ibiza", "Lanzarote"], correct: 3, explanation: "Lanzarote a Kanári-szigetek egyike. A Baleárok: Mallorca, Menorca, Ibiza, Formentera." },

  // === TÖRTÉNELEM ===
  { id: "es-hist-1492", category: "history", question: "Mi történt 1492-ben Spanyolországban?", options: ["A polgárháború kitörése", "Granada elfoglalása és Kolumbusz első útja", "Az alkotmány elfogadása", "A Habsburgok trónra lépése"], correct: 1, explanation: "A Katolikus Királyok elfoglalták Granadát (a reconquista vége), és ugyanabban az évben indult el Kolumbusz." },
  { id: "es-hist-constitution", category: "history", question: "Melyik évben fogadták el a jelenlegi spanyol alkotmányt?", options: ["1945", "1975", "1978", "1986"], correct: 2, explanation: "1978-ban, a Franco halála utáni demokratikus átmenet (la Transición) során. December 6-a azóta nemzeti ünnep." },
  { id: "es-hist-eu", category: "history", question: "Mikor csatlakozott Spanyolország az Európai Közösséghez?", options: ["1973", "1981", "1986", "1995"], correct: 2, explanation: "1986-ban, Portugáliával együtt — ez volt a demokratikus átmenet lezárása." },
  { id: "es-hist-franco", category: "history", question: "Melyik évben halt meg Franco tábornok?", options: ["1969", "1975", "1981", "1978"], correct: 1, explanation: "1975-ben — ezzel indult a demokratikus átmenet és a monarchia visszaállítása." },
  { id: "es-hist-armada", category: "history", question: "Mi volt a „Legyőzhetetlen Armada”?", options: ["Egy híres katedrális", "A spanyol hajóhad, amely 1588-ban Anglia ellen indult", "Egy középkori lovagrend", "Az első spanyol alkotmány"], correct: 1, explanation: "II. Fülöp hajóhada 1588-ban — a hadjárat kudarcba fulladt, részben a viharok miatt." },
  { id: "es-hist-alhambra", category: "history", question: "Melyik uralom emlékét őrzi a granadai Alhambra?", options: ["A római", "A vizigót", "A mór (muszlim)", "A napóleoni"], correct: 2, explanation: "A mór (muszlim) uralomét — a Nasrida-dinasztia palotaegyüttese, ma az ország leglátogatottabb műemléke." },

  // === KULTÚRA ===
  { id: "es-cult-gaudi", category: "culture", question: "Ki tervezte a barcelonai Sagrada Famíliát?", options: ["Pablo Picasso", "Antoni Gaudí", "Salvador Dalí", "Santiago Calatrava"], correct: 1, explanation: "Antoni Gaudí — az építkezés 1882-ben kezdődött, és a mai napig tart." },
  { id: "es-cult-prado", category: "culture", question: "Melyik városban van a Prado Múzeum?", options: ["Barcelona", "Madrid", "Sevilla", "Bilbao"], correct: 1, explanation: "Madridban — Velázquez, Goya és El Greco fő gyűjtőhelye." },
  { id: "es-cult-cervantes", category: "culture", question: "Ki írta a Don Quijotét?", options: ["Federico García Lorca", "Miguel de Cervantes", "Lope de Vega", "Gabriel García Márquez"], correct: 1, explanation: "Miguel de Cervantes, 1605-ben — sokan a modern regény első darabjának tartják." },
  { id: "es-cult-sanfermin", category: "culture", question: "Melyik városban tartják a San Fermín bikafuttatást?", options: ["Sevilla", "Pamplona", "Valencia", "Salamanca"], correct: 1, explanation: "Pamplonában, júliusban — Hemingway tette világhírűvé." },
  { id: "es-cult-fallas", category: "culture", question: "Melyik városhoz kötődnek a Fallas ünnepségek?", options: ["Valencia", "Granada", "Bilbao", "Málaga"], correct: 0, explanation: "Valenciához — márciusban óriási papírmasé-figurákat állítanak ki, majd elégetik őket." },
  { id: "es-cult-guggenheim", category: "culture", question: "Melyik városban áll a Guggenheim Múzeum spanyol épülete?", options: ["Barcelona", "Bilbao", "Madrid", "Valencia"], correct: 1, explanation: "Bilbaóban — Frank Gehry titánburkolatú épülete önmagában újította meg a város arculatát." },

  // === NYELV ===
  { id: "es-lang-coofficial", category: "language", question: "Melyik NEM társhivatalos nyelv Spanyolország valamelyik részén?", options: ["Katalán", "Galiciai", "Baszk", "Portugál"], correct: 3, explanation: "A kasztíliai (spanyol) mellett a katalán/valenciai, a galiciai és a baszk társhivatalos — a portugál nem." },
  { id: "es-lang-vale", category: "language", question: "Mit jelent a mindennapokban a „vale”?", options: ["Viszlát", "Rendben / oké", "Bocsánat", "Köszönöm"], correct: 1, explanation: "„Rendben, oké” — talán a leggyakrabban hallott spanyol szó a hétköznapokban." },
  { id: "es-lang-tarde", category: "language", question: "Nagyjából mikortól köszönnek „buenas tardes”-szel?", options: ["Reggel 9-től", "Dél után, jellemzően az ebéd után", "Csak este 8 után", "Éjfél után"], correct: 1, explanation: "A „tarde” a délutánt jelenti, és Spanyolországban az ebéd (kb. 14 óra) után kezdődik — nem délben." },
  { id: "es-lang-embarazada", category: "language", question: "Mit jelent spanyolul az „embarazada”?", options: ["Zavarban lévő", "Terhes", "Fáradt", "Elfoglalt"], correct: 1, explanation: "Terhes! Klasszikus félrefordítás az angol „embarrassed” miatt — a zavarban lévő spanyolul „avergonzado”." },
  { id: "es-lang-piso", category: "language", question: "Mit jelent a lakáshirdetésekben a „piso”?", options: ["Padló", "Lakás", "Emeletes ház", "Telek"], correct: 1, explanation: "Lakás. Ugyanez a szó padlót is jelent — a hirdetésekben viszont mindig lakás." },
  { id: "es-lang-quedar", category: "language", question: "Mit jelent, ha valaki azt mondja: „¿Quedamos mañana?”", options: ["Maradunk holnap?", "Találkozunk holnap?", "Fizetünk holnap?", "Kérdezünk holnap?"], correct: 1, explanation: "„Találkozunk holnap?” — a „quedar” a beszélt nyelvben találkozót beszél meg." },

  // === ÉTEL & ITAL ===
  { id: "es-food-paella", category: "food", question: "Melyik régióból származik a paella?", options: ["Andalúzia", "Valencia", "Katalónia", "Galicia"], correct: 1, explanation: "Valenciából. Az eredeti valenciai paellában csirke és nyúl van, nem tenger gyümölcsei." },
  { id: "es-food-gazpacho", category: "food", question: "Mi a gazpacho?", options: ["Forró húsleves", "Hideg zöldségleves", "Édes sütemény", "Halas rakott étel"], correct: 1, explanation: "Hideg paradicsomos zöldségleves — andalúz eredetű, nyáron mindenütt kapható." },
  { id: "es-food-mealtime", category: "food", question: "Mikor vacsoráznak jellemzően Spanyolországban?", options: ["17–18 óra", "19–20 óra", "21–22 óra", "Éjfél után"], correct: 2, explanation: "Jellemzően 21 és 22 óra között. Az ebéd (comida) is később van: 14 óra körül — ez a főétkezés." },
  { id: "es-food-menudeldia", category: "food", question: "Mi a „menú del día”?", options: ["Az étlap ajánlata csak hétvégén", "Hétköznapi, fix árú ebédmenü több fogásból", "Egy borfajta", "Egy desszert"], correct: 1, explanation: "Hétköznapi fix árú ebéd: előétel, főétel, desszert vagy kávé, sokszor itallal és kenyérrel — a legjobb ár-érték arányú ebéd." },
  { id: "es-food-tapas", category: "food", question: "Mi jellemző a tapasra?", options: ["Mindig édes", "Kis adag falatok italhoz", "Csak reggelire eszik", "Kizárólag halból készül"], correct: 1, explanation: "Kis adag falatok, amiket ital mellé esznek. Granadában és León környékén sok helyen ingyen jár az italhoz." },
  { id: "es-food-jamon", category: "food", question: "Mi a „jamón ibérico de bellota”?", options: ["Füstölt kolbász", "Makkon hizlalt ibériai sertés érlelt sonkája", "Egy sajtféle", "Sült szalonna"], correct: 1, explanation: "Makkon (bellota) hizlalt ibériai sertésből készült érlelt sonka — a legdrágább és legrangosabb kategória." },

  // === KÖZLEKEDÉS ===
  { id: "es-trans-ave", category: "transport", question: "Mit jelent az AVE?", options: ["A helyi buszhálózatot", "A nagysebességű vasutat", "Az autópálya-matricát", "A repülőtéri transzfert"], correct: 1, explanation: "Alta Velocidad Española — a nagysebességű vonat. Spanyolországnak Európa leghosszabb nagysebességű hálózata van." },
  { id: "es-trans-renfe", category: "transport", question: "Mi a Renfe?", options: ["A nemzeti vasúttársaság", "A rendőrség", "Az adóhivatal", "Egy légitársaság"], correct: 0, explanation: "A nemzeti vasúttársaság. A városkörnyéki (elővárosi) vonalait Cercanías néven ismerik." },
  { id: "es-trans-cercanias", category: "transport", question: "Mit jelent a „Cercanías”?", options: ["Éjszakai járat", "Elővárosi vonat", "Kompjárat", "Hegyi fogaskerekű"], correct: 1, explanation: "Elővárosi (agglomerációs) vonat — Madridban, Barcelonában és több nagyvárosban ez a napi ingázás gerince." },
  { id: "es-trans-itv", category: "transport", question: "Mi az ITV?", options: ["A műszaki vizsga", "A jogosítvány", "A kötelező biztosítás", "Az autópálya-díj"], correct: 0, explanation: "Inspección Técnica de Vehículos — a magyar műszaki vizsga megfelelője. Elmulasztása bírságot von maga után." },
  { id: "es-trans-dgt", category: "transport", question: "Mivel foglalkozik a DGT?", options: ["Az egészségüggyel", "A közúti közlekedéssel és a járműnyilvántartással", "Az oktatással", "A nyugdíjakkal"], correct: 1, explanation: "Dirección General de Tráfico — a közlekedési hatóság: jogosítvány, forgalmi engedély, pontrendszer, bírságok." },
  { id: "es-trans-abono", category: "transport", question: "Mi az „abono transporte”?", options: ["Egy autópálya-matrica", "Bérlet a helyi tömegközlekedésre", "Parkolójegy", "Repülőtéri illeték"], correct: 1, explanation: "Bérlet a tömegközlekedésre — Madridban a 26 év alattiaknak külön, jóval olcsóbb fiatal-bérlet (abono joven) létezik." },

  // === INTÉZMÉNYEK ===
  { id: "es-inst-nie", category: "institutions", question: "Mi a NIE?", options: ["Egy adónem", "A külföldiek azonosító száma", "Egy banki termék", "A lakcímkártya"], correct: 1, explanation: "Número de Identidad de Extranjero — a külföldiek azonosító száma. Szinte minden ügyhöz kell: munka, bankszámla, szerződés." },
  { id: "es-inst-empadronamiento", category: "institutions", question: "Hol intézed az empadronamientót (lakcím-bejelentést)?", options: ["A rendőrségen", "Az önkormányzatnál (ayuntamiento)", "Az adóhivatalban", "A bankban"], correct: 1, explanation: "Az önkormányzatnál. Az így kapott „certificado de empadronamiento” kell az egészségügyi kártyához és az iskolai beíratáshoz is." },
  { id: "es-inst-citaprevia", category: "institutions", question: "Mit jelent a „cita previa”?", options: ["Előzetes időpontfoglalás", "Egy adóbevallási űrlap", "Orvosi beutaló", "Bírósági idézés"], correct: 0, explanation: "Előzetes időpontfoglalás. A legtöbb spanyol hivatal CSAK foglalt időponttal fogad — enélkül nem is állsz sorba." },
  { id: "es-inst-hacienda", category: "institutions", question: "Mivel foglalkozik a Hacienda (Agencia Tributaria)?", options: ["Az egészségüggyel", "Az adózással", "A közlekedéssel", "Az oktatással"], correct: 1, explanation: "Az adóhatóság. Az éves személyi jövedelemadó-bevallás neve „la Renta”, az adó maga az IRPF." },
  { id: "es-inst-segsocial", category: "institutions", question: "Mire való a Seguridad Social-szám?", options: ["Csak a nyugdíjhoz", "A munkaviszony bejelentéséhez és a társadalombiztosításhoz", "A bankszámlanyitáshoz", "A jogosítványhoz"], correct: 1, explanation: "Enélkül a munkáltató nem tud bejelenteni. Ez alapozza meg az egészségügyi ellátást, a táppénzt és a nyugdíjat is." },
  { id: "es-inst-autonomo", category: "institutions", question: "Kit hívnak Spanyolországban „autónomo”-nak?", options: ["Az önfoglalkoztatót (egyéni vállalkozót)", "Az önkormányzati dolgozót", "A nyugdíjast", "A diákmunkást"], correct: 0, explanation: "Az önfoglalkoztatót. Havi járulékot (cuota) fizet, ami a bevallott jövedelemtől függ — akkor is, ha épp nincs megbízása." },

  // === HÉTKÖZNAPOK ===
  { id: "es-day-112", category: "everyday", question: "Mi Spanyolországban az egységes segélyhívó szám?", options: ["911", "112", "999", "100"], correct: 1, explanation: "112 — az egész EU-ban ugyanaz. A Policía Nacional közvetlen száma 091, a Guardia Civilé 062." },
  { id: "es-day-canarytime", category: "everyday", question: "Mennyivel tér el a Kanári-szigetek ideje a szárazföldtől?", options: ["Nincs eltérés", "Egy órával kevesebb", "Egy órával több", "Két órával kevesebb"], correct: 1, explanation: "Egy órával kevesebb. Ezért ér véget ott a tévéműsorok „hora peninsular / hora canaria” megkülönböztetése." },
  { id: "es-day-phone", category: "everyday", question: "Mi Spanyolország nemzetközi hívószáma?", options: ["+31", "+34", "+39", "+43"], correct: 1, explanation: "+34. A spanyol számok 9 jegyűek, és a mobilok 6-tal vagy 7-tel kezdődnek." },
  { id: "es-day-schoolage", category: "everyday", question: "Hány éves korig tart Spanyolországban a tankötelezettség?", options: ["14", "15", "16", "18"], correct: 2, explanation: "6-tól 16 éves korig — az ESO (középiskola alsó szakasza) végéig. Utána jön a bachillerato vagy a szakképzés (FP)." },
  { id: "es-day-siesta", category: "everyday", question: "Mi jellemző sok kisebb spanyol boltra délután?", options: ["Éjjel-nappal nyitva vannak", "Kora délután néhány órára bezárnak", "Csak hétvégén nyitnak ki", "Délelőtt zárva vannak"], correct: 1, explanation: "Kora délután (kb. 14–17 óra) sok kisbolt bezár. A nagy áruházak és a bevásárlóközpontok viszont folyamatosan nyitva tartanak." },
  { id: "es-day-reyes", category: "everyday", question: "Melyik napon kapják a spanyol gyerekek hagyományosan az ajándékot?", options: ["December 6.", "December 24.", "December 31.", "Január 6."], correct: 3, explanation: "Január 6-án, Vízkeresztkor — a Három Királyok (los Reyes Magos) hozzák. Előtte este nagy felvonulás (cabalgata) van." },
];
