import type { Lesson } from "./data";

/**
 * Holland (Nederlands) kurzus — a Hollandiában élő magyaroknak. A svájci Mundart
 * (data.ts), az osztrák (data-at.ts) és a német (data-de.ts) ország-megfelelője.
 * Cél a hétköznapi, túlélő holland: köszönés, vásárlás, hivatal (gemeente), munka,
 * lakhatás, közlekedés — amit egy újonnan érkezőnek azonnal használnia kell.
 *
 * A lecke-id-k „nl" előtaggal, a kérdés-id-k „nq" előtaggal, hogy NE ütközzenek a
 * CH („l"/„q"), AT („al"/„aq") és DE („dl"/„dq") id-kkel (a lejátszó mindegyik
 * készletben keres). Bővíthető: ugyanebben a formátumban új fejezetek/leckék.
 */
export const LESSONS_NL: Lesson[] = [
  // ══ 1. Fejezet: Alapok ══════════════════════════════
  {
    id: "nl1", title: "Köszönés", description: "Hallo, Goedemorgen, Goedendag — így köszönnek Hollandiában.", chapter: 1, xpReward: 10,
    questions: [
      { id: "nq1", type: "multiple_choice", prompt: "Hogy mondod semlegesen: 'Jó napot'?", options: [{ id: "o1", text: "Goedendag" }, { id: "o2", text: "Grüezi" }, { id: "o3", text: "Bonjour" }], correctOptionId: "o1" },
      { id: "nq2", type: "flashcard", prompt: "Informális köszönés (szia, helló)?", backText: "Hallo", phonetic: "Halló" },
      { id: "nq3", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Jó reggelt", right: "Goedemorgen" }, { id: "p2", left: "Jó estét", right: "Goedenavond" }, { id: "p3", left: "Helló (informális)", right: "Hallo" }] },
    ],
  },
  {
    id: "nl2", title: "Búcsúzás", description: "Doei, Tot ziens, Tot morgen.", chapter: 1, xpReward: 10,
    questions: [
      { id: "nq4", type: "multiple_choice", prompt: "Informális 'szia' búcsúzáskor?", options: [{ id: "o1", text: "Doei" }, { id: "o2", text: "Tschüss" }, { id: "o3", text: "Ciao" }], correctOptionId: "o1" },
      { id: "nq5", type: "flashcard", prompt: "'Viszontlátásra' (semleges)?", backText: "Tot ziens", phonetic: "Tot zíensz" },
      { id: "nq6", type: "match", prompt: "Párosítsd a búcsúzásokat!", pairs: [{ id: "p1", left: "Szia (búcsú)", right: "Doei" }, { id: "p2", left: "Viszontlátásra", right: "Tot ziens" }, { id: "p3", left: "Holnap talizunk", right: "Tot morgen" }] },
    ],
  },
  {
    id: "nl3", title: "Udvariasság", description: "Alsjeblieft, Dank je wel, Sorry.", chapter: 1, xpReward: 10,
    questions: [
      { id: "nq7", type: "multiple_choice", prompt: "Hogy mondod, hogy 'köszönöm'?", options: [{ id: "o1", text: "Dank je wel" }, { id: "o2", text: "Bitte schön" }, { id: "o3", text: "Grazie" }], correctOptionId: "o1" },
      { id: "nq8", type: "flashcard", prompt: "'Kérlek' / 'tessék'?", backText: "Alsjeblieft", phonetic: "Alsjeblíft" },
      { id: "nq9", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Köszönöm", right: "Dank je wel" }, { id: "p2", left: "Kérlek / tessék", right: "Alsjeblieft" }, { id: "p3", left: "Elnézést", right: "Sorry" }] },
    ],
  },
  {
    id: "nl4", title: "Bemutatkozás", description: "Ik heet…, Hoe heet je?, Hoe gaat het?", chapter: 1, xpReward: 15,
    questions: [
      { id: "nq10", type: "multiple_choice", prompt: "Hogy kérdezed: 'Hogy hívnak?'", options: [{ id: "o1", text: "Hoe heet je?" }, { id: "o2", text: "Hoe gaat het?" }, { id: "o3", text: "Waar woon je?" }], correctOptionId: "o1" },
      { id: "nq11", type: "flashcard", prompt: "'Engem … hívnak'", backText: "Ik heet…", phonetic: "Ik héét" },
      { id: "nq12", type: "multiple_choice", prompt: "Mit jelent: 'Hoe gaat het?'", options: [{ id: "o1", text: "Hogy vagy?" }, { id: "o2", text: "Hol laksz?" }, { id: "o3", text: "Mennyi az idő?" }], correctOptionId: "o1" },
    ],
  },

  // ══ 2. Fejezet: Hétköznapok ══════════════════════════
  {
    id: "nl5", title: "Számok 1–10", description: "een, twee, drie, vier, vijf…", chapter: 2, xpReward: 15,
    questions: [
      { id: "nq13", type: "match", prompt: "Párosítsd a számokat!", pairs: [{ id: "p1", left: "1", right: "een" }, { id: "p2", left: "2", right: "twee" }, { id: "p3", left: "3", right: "drie" }] },
      { id: "nq14", type: "flashcard", prompt: "'öt'", backText: "vijf", phonetic: "fájf" },
      { id: "nq15", type: "multiple_choice", prompt: "Mennyi a 'tien'?", options: [{ id: "o1", text: "10" }, { id: "o2", text: "3" }, { id: "o3", text: "100" }], correctOptionId: "o1" },
    ],
  },
  {
    id: "nl6", title: "Vásárlás", description: "boodschappen, pinnen, de bon.", chapter: 2, xpReward: 15,
    questions: [
      { id: "nq16", type: "multiple_choice", prompt: "Hogy kérdezed: 'Mennyibe kerül?'", options: [{ id: "o1", text: "Hoeveel kost het?" }, { id: "o2", text: "Waar is het?" }, { id: "o3", text: "Hoe laat is het?" }], correctOptionId: "o1" },
      { id: "nq17", type: "flashcard", prompt: "'Kártyával fizetni'", backText: "pinnen", phonetic: "pinnen" },
      { id: "nq18", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Bevásárlás", right: "boodschappen" }, { id: "p2", left: "Blokk / nyugta", right: "de bon" }, { id: "p3", left: "Akció", right: "aanbieding" }] },
    ],
  },
  {
    id: "nl7", title: "Étel & ital", description: "brood, kaas, koffie, water.", chapter: 2, xpReward: 15,
    questions: [
      { id: "nq19", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kenyér", right: "brood" }, { id: "p2", left: "sajt", right: "kaas" }, { id: "p3", left: "kávé", right: "koffie" }] },
      { id: "nq20", type: "flashcard", prompt: "'víz'", backText: "water", phonetic: "váter" },
      { id: "nq21", type: "multiple_choice", prompt: "Mit jelent a tipikus szó: 'lekker'?", options: [{ id: "o1", text: "finom / jó" }, { id: "o2", text: "drága" }, { id: "o3", text: "hideg" }], correctOptionId: "o1" },
    ],
  },
  {
    id: "nl8", title: "A kávézóban", description: "Een koffie, alsjeblieft. De rekening, graag.", chapter: 2, xpReward: 20,
    questions: [
      { id: "nq22", type: "multiple_choice", prompt: "Hogy kéred a számlát?", options: [{ id: "o1", text: "De rekening, graag" }, { id: "o2", text: "Tot ziens" }, { id: "o3", text: "Hoe heet je?" }], correctOptionId: "o1" },
      { id: "nq23", type: "flashcard", prompt: "'Egy kávét kérek'", backText: "Een koffie, alsjeblieft", phonetic: "En koffi, alsjeblíft" },
      { id: "nq24", type: "multiple_choice", prompt: "Mit jelent a 'graag'?", options: [{ id: "o1", text: "kérem / szívesen" }, { id: "o2", text: "talán" }, { id: "o3", text: "soha" }], correctOptionId: "o1" },
    ],
  },

  // ══ 3. Fejezet: Ügyintézés & munka ═══════════════════
  {
    id: "nl9", title: "A hivatalban (gemeente)", description: "gemeente, afspraak, inschrijven, BSN.", chapter: 3, xpReward: 20,
    questions: [
      { id: "nq25", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "önkormányzat", right: "gemeente" }, { id: "p2", left: "időpont", right: "afspraak" }, { id: "p3", left: "bejelentkezni", right: "inschrijven" }] },
      { id: "nq26", type: "flashcard", prompt: "Személyi azonosító szám", backText: "BSN (Burgerservicenummer)", phonetic: "Bé-esz-en" },
      { id: "nq27", type: "multiple_choice", prompt: "Mi a DigiD?", options: [{ id: "o1", text: "Digitális azonosító az ügyintézéshez" }, { id: "o2", text: "Egy bank" }, { id: "o3", text: "Egy bolt" }], correctOptionId: "o1" },
    ],
  },
  {
    id: "nl10", title: "Munka", description: "werk, baan, salaris, contract.", chapter: 3, xpReward: 20,
    questions: [
      { id: "nq28", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "munka", right: "werk" }, { id: "p2", left: "állás", right: "baan" }, { id: "p3", left: "fizetés", right: "salaris" }] },
      { id: "nq29", type: "flashcard", prompt: "'szerződés'", backText: "contract", phonetic: "kontrakt" },
      { id: "nq30", type: "multiple_choice", prompt: "Mit jelent a 'sollicitatie'?", options: [{ id: "o1", text: "álláspályázat" }, { id: "o2", text: "felmondás" }, { id: "o3", text: "szabadság" }], correctOptionId: "o1" },
    ],
  },
  {
    id: "nl11", title: "Lakhatás", description: "huren, huur, borg, kale huur.", chapter: 3, xpReward: 20,
    questions: [
      { id: "nq31", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bérelni", right: "huren" }, { id: "p2", left: "lakbér", right: "huur" }, { id: "p3", left: "kaució", right: "borg" }] },
      { id: "nq32", type: "flashcard", prompt: "'lakás'", backText: "woning / appartement", phonetic: "vóning" },
      { id: "nq33", type: "multiple_choice", prompt: "Mit jelent a 'kale huur'?", options: [{ id: "o1", text: "rezsi nélküli lakbér" }, { id: "o2", text: "bútorozott lakás" }, { id: "o3", text: "albérlet" }], correctOptionId: "o1" },
    ],
  },

  // ══ 4. Fejezet: Közlekedés & idő ═════════════════════
  {
    id: "nl12", title: "Közlekedés", description: "fiets, trein, bus, OV-chipkaart.", chapter: 4, xpReward: 20,
    questions: [
      { id: "nq34", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bicikli", right: "fiets" }, { id: "p2", left: "vonat", right: "trein" }, { id: "p3", left: "busz", right: "bus" }] },
      { id: "nq35", type: "flashcard", prompt: "'becsekkolni' (járművön)", backText: "inchecken", phonetic: "incsekken" },
      { id: "nq36", type: "multiple_choice", prompt: "Mivel fizetsz a tömegközlekedésen?", options: [{ id: "o1", text: "OV-chipkaart vagy bankkártya" }, { id: "o2", text: "Bélyeggel" }, { id: "o3", text: "Zsetonnal" }], correctOptionId: "o1" },
    ],
  },
  {
    id: "nl13", title: "Idő & napok", description: "maandag, vandaag, morgen, Hoe laat is het?", chapter: 4, xpReward: 20,
    questions: [
      { id: "nq37", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "hétfő", right: "maandag" }, { id: "p2", left: "ma", right: "vandaag" }, { id: "p3", left: "holnap", right: "morgen" }] },
      { id: "nq38", type: "flashcard", prompt: "'Hány óra van?'", backText: "Hoe laat is het?", phonetic: "Hú lát isz het" },
      { id: "nq39", type: "multiple_choice", prompt: "Mit jelent a 'weekend'?", options: [{ id: "o1", text: "hétvége" }, { id: "o2", text: "hónap" }, { id: "o3", text: "óra" }], correctOptionId: "o1" },
    ],
  },
];
