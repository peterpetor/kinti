import type { Lesson } from "./data";

/**
 * Holland (Nederlands) kurzus — a Hollandiában élő magyaroknak. A svájci Mundart
 * (data.ts), az osztrák (data-at.ts) és a német (data-de.ts) ország-megfelelője,
 * AZONOS terjedelemmel: 100 lecke, 20 fejezet (5/fejezet). Cél a hétköznapi,
 * túlélő holland: köszönés, vásárlás, hivatal (gemeente), munka, egészség,
 * lakhatás, közlekedés, család, pénzügy, ügyintézés.
 *
 * A lecke-id-k „nl" előtaggal, a kérdés-id-k „nq" előtaggal, hogy NE ütközzenek a
 * CH („l"/„q"), AT („al"/„aq") és DE („dl"/„dq") id-kkel. A TTS nl-NL.
 */
export const LESSONS_NL: Lesson[] = [
  // ══ 1. Fejezet: Alapok ══════════════════════════════
  { id: "nl1", title: "Köszönés", description: "Hallo, Goedemorgen, Goedendag.", chapter: 1, xpReward: 10, questions: [
    { id: "nq1", type: "multiple_choice", prompt: "Hogy mondod semlegesen: 'Jó napot'?", options: [{ id: "o1", text: "Goedendag" }, { id: "o2", text: "Grüezi" }, { id: "o3", text: "Bonjour" }], correctOptionId: "o1" },
    { id: "nq2", type: "flashcard", prompt: "Informális köszönés (szia, helló)?", backText: "Hallo", phonetic: "Halló" },
    { id: "nq3", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Jó reggelt", right: "Goedemorgen" }, { id: "p2", left: "Jó estét", right: "Goedenavond" }, { id: "p3", left: "Helló", right: "Hallo" }] } ] },
  { id: "nl2", title: "Búcsúzás", description: "Doei, Tot ziens, Tot morgen.", chapter: 1, xpReward: 10, questions: [
    { id: "nq4", type: "multiple_choice", prompt: "Informális 'szia' búcsúzáskor?", options: [{ id: "o1", text: "Doei" }, { id: "o2", text: "Tschüss" }, { id: "o3", text: "Ciao" }], correctOptionId: "o1" },
    { id: "nq5", type: "flashcard", prompt: "'Viszontlátásra' (semleges)?", backText: "Tot ziens", phonetic: "Tot zíensz" },
    { id: "nq6", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Szia (búcsú)", right: "Doei" }, { id: "p2", left: "Viszontlátásra", right: "Tot ziens" }, { id: "p3", left: "Holnap talizunk", right: "Tot morgen" }] } ] },
  { id: "nl3", title: "Udvariasság", description: "Alsjeblieft, Dank je wel, Sorry.", chapter: 1, xpReward: 10, questions: [
    { id: "nq7", type: "multiple_choice", prompt: "Hogy mondod, hogy 'köszönöm'?", options: [{ id: "o1", text: "Dank je wel" }, { id: "o2", text: "Bitte schön" }, { id: "o3", text: "Grazie" }], correctOptionId: "o1" },
    { id: "nq8", type: "flashcard", prompt: "'Kérlek' / 'tessék'?", backText: "Alsjeblieft", phonetic: "Alsjeblíft" },
    { id: "nq9", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Köszönöm", right: "Dank je wel" }, { id: "p2", left: "Kérlek / tessék", right: "Alsjeblieft" }, { id: "p3", left: "Elnézést", right: "Sorry" }] } ] },
  { id: "nl4", title: "Bemutatkozás", description: "Ik heet…, Hoe heet je?", chapter: 1, xpReward: 10, questions: [
    { id: "nq10", type: "multiple_choice", prompt: "Hogy kérdezed: 'Hogy hívnak?'", options: [{ id: "o1", text: "Hoe heet je?" }, { id: "o2", text: "Hoe gaat het?" }, { id: "o3", text: "Waar woon je?" }], correctOptionId: "o1" },
    { id: "nq11", type: "flashcard", prompt: "'Engem … hívnak'", backText: "Ik heet…", phonetic: "Ik héét" },
    { id: "nq12", type: "multiple_choice", prompt: "Mit jelent: 'Hoe gaat het?'", options: [{ id: "o1", text: "Hogy vagy?" }, { id: "o2", text: "Hol laksz?" }, { id: "o3", text: "Mennyi az idő?" }], correctOptionId: "o1" } ] },
  { id: "nl5", title: "Igen, nem, talán", description: "Ja, nee, misschien.", chapter: 1, xpReward: 10, questions: [
    { id: "nq13", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Igen", right: "Ja" }, { id: "p2", left: "Nem", right: "Nee" }, { id: "p3", left: "Talán", right: "Misschien" }] },
    { id: "nq14", type: "flashcard", prompt: "'Nem tudom'", backText: "Ik weet het niet", phonetic: "Ik vét het nít" },
    { id: "nq15", type: "multiple_choice", prompt: "Mit jelent 'graag'?", options: [{ id: "o1", text: "szívesen / kérem" }, { id: "o2", text: "soha" }, { id: "o3", text: "talán" }], correctOptionId: "o1" } ] },
  { id: "nl6", title: "Kérdőszavak", description: "Wat, waar, wie, wanneer, hoe.", chapter: 1, xpReward: 10, questions: [
    { id: "nq16", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Mi?", right: "Wat?" }, { id: "p2", left: "Hol?", right: "Waar?" }, { id: "p3", left: "Ki?", right: "Wie?" }] },
    { id: "nq17", type: "flashcard", prompt: "'Mikor?'", backText: "Wanneer?", phonetic: "Vannér" },
    { id: "nq18", type: "multiple_choice", prompt: "Mit jelent 'waarom'?", options: [{ id: "o1", text: "miért" }, { id: "o2", text: "hogyan" }, { id: "o3", text: "mennyi" }], correctOptionId: "o1" } ] },

  // ══ 2. Fejezet: Számok & idő ═════════════════════════
  { id: "nl7", title: "Számok 1–10", description: "een, twee, drie…", chapter: 2, xpReward: 10, questions: [
    { id: "nq19", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "1", right: "een" }, { id: "p2", left: "2", right: "twee" }, { id: "p3", left: "3", right: "drie" }] },
    { id: "nq20", type: "flashcard", prompt: "'öt'", backText: "vijf", phonetic: "fájf" },
    { id: "nq21", type: "multiple_choice", prompt: "Mennyi a 'tien'?", options: [{ id: "o1", text: "10" }, { id: "o2", text: "3" }, { id: "o3", text: "100" }], correctOptionId: "o1" } ] },
  { id: "nl8", title: "Idő és napszak", description: "ochtend, middag, avond, nacht.", chapter: 2, xpReward: 10, questions: [
    { id: "nq22", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "reggel", right: "ochtend" }, { id: "p2", left: "délután", right: "middag" }, { id: "p3", left: "este", right: "avond" }] },
    { id: "nq23", type: "flashcard", prompt: "'éjszaka'", backText: "nacht", phonetic: "nakht" },
    { id: "nq24", type: "multiple_choice", prompt: "Mit jelent 'vandaag'?", options: [{ id: "o1", text: "ma" }, { id: "o2", text: "holnap" }, { id: "o3", text: "tegnap" }], correctOptionId: "o1" } ] },
  { id: "nl9", title: "Hasznos mondatok", description: "Spreekt u Engels? Ik begrijp het niet.", chapter: 2, xpReward: 10, questions: [
    { id: "nq25", type: "multiple_choice", prompt: "'Beszél angolul?'", options: [{ id: "o1", text: "Spreekt u Engels?" }, { id: "o2", text: "Waar is het?" }, { id: "o3", text: "Hoeveel kost het?" }], correctOptionId: "o1" },
    { id: "nq26", type: "flashcard", prompt: "'Nem értem'", backText: "Ik begrijp het niet", phonetic: "Ik begrájp het nít" },
    { id: "nq27", type: "flashcard", prompt: "'Tudna segíteni?'", backText: "Kunt u mij helpen?", phonetic: "Kunt ü máj helpen" } ] },
  { id: "nl10", title: "A hét napjai", description: "maandag, dinsdag, woensdag…", chapter: 2, xpReward: 10, questions: [
    { id: "nq28", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "hétfő", right: "maandag" }, { id: "p2", left: "kedd", right: "dinsdag" }, { id: "p3", left: "szerda", right: "woensdag" }] },
    { id: "nq29", type: "flashcard", prompt: "'péntek'", backText: "vrijdag", phonetic: "frájdakh" },
    { id: "nq30", type: "multiple_choice", prompt: "Mit jelent 'zaterdag'?", options: [{ id: "o1", text: "szombat" }, { id: "o2", text: "vasárnap" }, { id: "o3", text: "csütörtök" }], correctOptionId: "o1" } ] },
  { id: "nl11", title: "Időjárás", description: "Het regent. Het is koud.", chapter: 2, xpReward: 10, questions: [
    { id: "nq31", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "eső", right: "regen" }, { id: "p2", left: "nap", right: "zon" }, { id: "p3", left: "szél", right: "wind" }] },
    { id: "nq32", type: "flashcard", prompt: "'Esik az eső'", backText: "Het regent", phonetic: "Het régent" },
    { id: "nq33", type: "multiple_choice", prompt: "Mit jelent 'het is koud'?", options: [{ id: "o1", text: "hideg van" }, { id: "o2", text: "meleg van" }, { id: "o3", text: "süt a nap" }], correctOptionId: "o1" } ] },

  // ══ 3. Fejezet: Vásárlás & étterem ═══════════════════
  { id: "nl12", title: "Vásárlás", description: "boodschappen, pinnen, de bon.", chapter: 3, xpReward: 10, questions: [
    { id: "nq34", type: "multiple_choice", prompt: "'Mennyibe kerül?'", options: [{ id: "o1", text: "Hoeveel kost het?" }, { id: "o2", text: "Waar is het?" }, { id: "o3", text: "Hoe laat is het?" }], correctOptionId: "o1" },
    { id: "nq35", type: "flashcard", prompt: "'kártyával fizetni'", backText: "pinnen", phonetic: "pinnen" },
    { id: "nq36", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Bevásárlás", right: "boodschappen" }, { id: "p2", left: "Nyugta", right: "de bon" }, { id: "p3", left: "Akció", right: "aanbieding" }] } ] },
  { id: "nl13", title: "Élelmiszer", description: "brood, kaas, melk, eieren.", chapter: 3, xpReward: 10, questions: [
    { id: "nq37", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kenyér", right: "brood" }, { id: "p2", left: "sajt", right: "kaas" }, { id: "p3", left: "tej", right: "melk" }] },
    { id: "nq38", type: "flashcard", prompt: "'tojás'", backText: "eieren", phonetic: "éjeren" },
    { id: "nq39", type: "multiple_choice", prompt: "Mit jelent 'vlees'?", options: [{ id: "o1", text: "hús" }, { id: "o2", text: "hal" }, { id: "o3", text: "kenyér" }], correctOptionId: "o1" } ] },
  { id: "nl14", title: "Étterem", description: "het menu, bestellen, de rekening.", chapter: 3, xpReward: 10, questions: [
    { id: "nq40", type: "multiple_choice", prompt: "'A számlát, kérem'", options: [{ id: "o1", text: "De rekening, graag" }, { id: "o2", text: "Tot ziens" }, { id: "o3", text: "Hoe heet je?" }], correctOptionId: "o1" },
    { id: "nq41", type: "flashcard", prompt: "'rendelni'", backText: "bestellen", phonetic: "besztellen" },
    { id: "nq42", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "étlap", right: "het menu" }, { id: "p2", left: "pincér", right: "de ober" }, { id: "p3", left: "asztal", right: "de tafel" }] } ] },
  { id: "nl15", title: "Fizetés", description: "contant, pinnen, fooi.", chapter: 3, xpReward: 10, questions: [
    { id: "nq43", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "készpénz", right: "contant" }, { id: "p2", left: "kártya", right: "pinpas" }, { id: "p3", left: "borravaló", right: "fooi" }] },
    { id: "nq44", type: "flashcard", prompt: "'Lehet kártyával fizetni?'", backText: "Kan ik pinnen?", phonetic: "Kan ik pinnen" },
    { id: "nq45", type: "multiple_choice", prompt: "Mit jelent 'iDEAL'?", options: [{ id: "o1", text: "holland online banki fizetés" }, { id: "o2", text: "egy bolt" }, { id: "o3", text: "egy étel" }], correctOptionId: "o1" } ] },

  // ══ 4. Fejezet: Hivatal, munka, egészség ═════════════
  { id: "nl16", title: "A hivatalban", description: "gemeente, afspraak, inschrijven, BSN.", chapter: 4, xpReward: 15, questions: [
    { id: "nq46", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "önkormányzat", right: "gemeente" }, { id: "p2", left: "időpont", right: "afspraak" }, { id: "p3", left: "bejelentkezni", right: "inschrijven" }] },
    { id: "nq47", type: "flashcard", prompt: "Személyi azonosító szám", backText: "BSN (Burgerservicenummer)", phonetic: "Bé-esz-en" },
    { id: "nq48", type: "multiple_choice", prompt: "Mi a DigiD?", options: [{ id: "o1", text: "Digitális azonosító az ügyintézéshez" }, { id: "o2", text: "Egy bank" }, { id: "o3", text: "Egy bolt" }], correctOptionId: "o1" } ] },
  { id: "nl17", title: "Munka", description: "werk, baan, salaris, contract.", chapter: 4, xpReward: 15, questions: [
    { id: "nq49", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "munka", right: "werk" }, { id: "p2", left: "állás", right: "baan" }, { id: "p3", left: "fizetés", right: "salaris" }] },
    { id: "nq50", type: "flashcard", prompt: "'szerződés'", backText: "contract", phonetic: "kontrakt" },
    { id: "nq51", type: "multiple_choice", prompt: "Mit jelent 'sollicitatie'?", options: [{ id: "o1", text: "álláspályázat" }, { id: "o2", text: "felmondás" }, { id: "o3", text: "szabadság" }], correctOptionId: "o1" } ] },
  { id: "nl18", title: "Egészség", description: "huisarts, ziek, apotheek.", chapter: 4, xpReward: 15, questions: [
    { id: "nq52", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "háziorvos", right: "huisarts" }, { id: "p2", left: "beteg", right: "ziek" }, { id: "p3", left: "gyógyszertár", right: "apotheek" }] },
    { id: "nq53", type: "flashcard", prompt: "'Beteg vagyok'", backText: "Ik ben ziek", phonetic: "Ik ben zík" },
    { id: "nq54", type: "multiple_choice", prompt: "Ki a 'huisarts'?", options: [{ id: "o1", text: "a háziorvos" }, { id: "o2", text: "a fogorvos" }, { id: "o3", text: "a gyógyszerész" }], correctOptionId: "o1" } ] },
  { id: "nl19", title: "Lakhatás", description: "huren, huur, borg, kale huur.", chapter: 4, xpReward: 15, questions: [
    { id: "nq55", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bérelni", right: "huren" }, { id: "p2", left: "lakbér", right: "huur" }, { id: "p3", left: "kaució", right: "borg" }] },
    { id: "nq56", type: "flashcard", prompt: "'lakás'", backText: "woning", phonetic: "vóning" },
    { id: "nq57", type: "multiple_choice", prompt: "Mit jelent 'kale huur'?", options: [{ id: "o1", text: "rezsi nélküli lakbér" }, { id: "o2", text: "bútorozott lakás" }, { id: "o3", text: "albérlet" }], correctOptionId: "o1" } ] },
  { id: "nl20", title: "Közlekedés", description: "fiets, trein, bus, OV-chipkaart.", chapter: 4, xpReward: 15, questions: [
    { id: "nq58", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bicikli", right: "fiets" }, { id: "p2", left: "vonat", right: "trein" }, { id: "p3", left: "busz", right: "bus" }] },
    { id: "nq59", type: "flashcard", prompt: "'becsekkolni'", backText: "inchecken", phonetic: "incsekken" },
    { id: "nq60", type: "multiple_choice", prompt: "Mivel fizetsz a tömegközlekedésen?", options: [{ id: "o1", text: "OV-chipkaart vagy bankkártya" }, { id: "o2", text: "Bélyeggel" }, { id: "o3", text: "Zsetonnal" }], correctOptionId: "o1" } ] },

  // ══ 5. Fejezet: Emberek & érzések ════════════════════
  { id: "nl21", title: "Család", description: "moeder, vader, kind, broer, zus.", chapter: 5, xpReward: 15, questions: [
    { id: "nq61", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "anya", right: "moeder" }, { id: "p2", left: "apa", right: "vader" }, { id: "p3", left: "gyerek", right: "kind" }] },
    { id: "nq62", type: "flashcard", prompt: "'testvér (fiú)'", backText: "broer", phonetic: "brúr" },
    { id: "nq63", type: "multiple_choice", prompt: "Mit jelent 'zus'?", options: [{ id: "o1", text: "lánytestvér" }, { id: "o2", text: "nagymama" }, { id: "o3", text: "feleség" }], correctOptionId: "o1" } ] },
  { id: "nl22", title: "Emberek", description: "man, vrouw, vriend, buurman.", chapter: 5, xpReward: 15, questions: [
    { id: "nq64", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "férfi", right: "man" }, { id: "p2", left: "nő", right: "vrouw" }, { id: "p3", left: "barát", right: "vriend" }] },
    { id: "nq65", type: "flashcard", prompt: "'szomszéd'", backText: "buurman", phonetic: "búrman" },
    { id: "nq66", type: "multiple_choice", prompt: "Mit jelent 'collega'?", options: [{ id: "o1", text: "munkatárs" }, { id: "o2", text: "rokon" }, { id: "o3", text: "főnök" }], correctOptionId: "o1" } ] },
  { id: "nl23", title: "Kor és állapot", description: "jaar, oud, jong, getrouwd.", chapter: 5, xpReward: 15, questions: [
    { id: "nq67", type: "flashcard", prompt: "'Hány éves vagy?'", backText: "Hoe oud ben je?", phonetic: "Hú aud ben je" },
    { id: "nq68", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "öreg", right: "oud" }, { id: "p2", left: "fiatal", right: "jong" }, { id: "p3", left: "év", right: "jaar" }] },
    { id: "nq69", type: "multiple_choice", prompt: "Mit jelent 'getrouwd'?", options: [{ id: "o1", text: "házas" }, { id: "o2", text: "egyedülálló" }, { id: "o3", text: "elvált" }], correctOptionId: "o1" } ] },
  { id: "nl24", title: "Tulajdonságok", description: "groot, klein, mooi, snel.", chapter: 5, xpReward: 15, questions: [
    { id: "nq70", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "nagy", right: "groot" }, { id: "p2", left: "kicsi", right: "klein" }, { id: "p3", left: "szép", right: "mooi" }] },
    { id: "nq71", type: "flashcard", prompt: "'gyors'", backText: "snel", phonetic: "sznel" },
    { id: "nq72", type: "multiple_choice", prompt: "Mit jelent 'duur'?", options: [{ id: "o1", text: "drága" }, { id: "o2", text: "olcsó" }, { id: "o3", text: "új" }], correctOptionId: "o1" } ] },
  { id: "nl25", title: "Érzések", description: "blij, moe, boos, bang.", chapter: 5, xpReward: 15, questions: [
    { id: "nq73", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "boldog", right: "blij" }, { id: "p2", left: "fáradt", right: "moe" }, { id: "p3", left: "mérges", right: "boos" }] },
    { id: "nq74", type: "flashcard", prompt: "'félek'", backText: "Ik ben bang", phonetic: "Ik ben bang" },
    { id: "nq75", type: "multiple_choice", prompt: "Mit jelent 'honger'?", options: [{ id: "o1", text: "éhség" }, { id: "o2", text: "szomjúság" }, { id: "o3", text: "fáradtság" }], correctOptionId: "o1" } ] },

  // ══ 6. Fejezet: Test & egészség ══════════════════════
  { id: "nl26", title: "Testrészek", description: "hoofd, hand, been, oog.", chapter: 6, xpReward: 15, questions: [
    { id: "nq76", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "fej", right: "hoofd" }, { id: "p2", left: "kéz", right: "hand" }, { id: "p3", left: "láb", right: "been" }] },
    { id: "nq77", type: "flashcard", prompt: "'szem'", backText: "oog", phonetic: "óh" },
    { id: "nq78", type: "multiple_choice", prompt: "Mit jelent 'buik'?", options: [{ id: "o1", text: "has" }, { id: "o2", text: "hát" }, { id: "o3", text: "kar" }], correctOptionId: "o1" } ] },
  { id: "nl27", title: "Fájdalom", description: "pijn, hoofdpijn, koorts.", chapter: 6, xpReward: 15, questions: [
    { id: "nq79", type: "flashcard", prompt: "'Fáj a fejem'", backText: "Ik heb hoofdpijn", phonetic: "Ik heb hófdpájn" },
    { id: "nq80", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "fájdalom", right: "pijn" }, { id: "p2", left: "láz", right: "koorts" }, { id: "p3", left: "köhögés", right: "hoest" }] },
    { id: "nq81", type: "multiple_choice", prompt: "Mit jelent 'keelpijn'?", options: [{ id: "o1", text: "torokfájás" }, { id: "o2", text: "gyomorfájás" }, { id: "o3", text: "fogfájás" }], correctOptionId: "o1" } ] },
  { id: "nl28", title: "Tünetek", description: "verkouden, griep, misselijk.", chapter: 6, xpReward: 15, questions: [
    { id: "nq82", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "megfázott", right: "verkouden" }, { id: "p2", left: "influenza", right: "griep" }, { id: "p3", left: "hányinger", right: "misselijk" }] },
    { id: "nq83", type: "flashcard", prompt: "'Rosszul vagyok'", backText: "Ik voel me niet goed", phonetic: "Ik fúl me nít hút" },
    { id: "nq84", type: "multiple_choice", prompt: "Mit jelent 'moe'?", options: [{ id: "o1", text: "fáradt" }, { id: "o2", text: "egészséges" }, { id: "o3", text: "éhes" }], correctOptionId: "o1" } ] },
  { id: "nl29", title: "Vészhelyzet", description: "112, brand, politie, ambulance.", chapter: 6, xpReward: 15, questions: [
    { id: "nq85", type: "multiple_choice", prompt: "Mi a segélyhívó szám Hollandiában?", options: [{ id: "o1", text: "112" }, { id: "o2", text: "911" }, { id: "o3", text: "144" }], correctOptionId: "o1" },
    { id: "nq86", type: "flashcard", prompt: "'Segítség!'", backText: "Help!", phonetic: "Help" },
    { id: "nq87", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "tűz", right: "brand" }, { id: "p2", left: "rendőrség", right: "politie" }, { id: "p3", left: "mentő", right: "ambulance" }] } ] },
  { id: "nl30", title: "Gyógyszertár", description: "medicijn, recept, pijnstiller.", chapter: 6, xpReward: 15, questions: [
    { id: "nq88", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "gyógyszer", right: "medicijn" }, { id: "p2", left: "recept", right: "recept" }, { id: "p3", left: "fájdalomcsillapító", right: "pijnstiller" }] },
    { id: "nq89", type: "flashcard", prompt: "'Van valami megfázásra?'", backText: "Heeft u iets tegen verkoudheid?", phonetic: "Héft ü íts tégen verkaudhájd" },
    { id: "nq90", type: "multiple_choice", prompt: "Mit jelent 'drogist'?", options: [{ id: "o1", text: "drogéria (recept nélküli)" }, { id: "o2", text: "kórház" }, { id: "o3", text: "fogorvos" }], correctOptionId: "o1" } ] },

  // ══ 7. Fejezet: Otthon & szolgáltatások ══════════════
  { id: "nl31", title: "A lakásban", description: "keuken, slaapkamer, badkamer.", chapter: 7, xpReward: 15, questions: [
    { id: "nq91", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "konyha", right: "keuken" }, { id: "p2", left: "hálószoba", right: "slaapkamer" }, { id: "p3", left: "fürdőszoba", right: "badkamer" }] },
    { id: "nq92", type: "flashcard", prompt: "'nappali'", backText: "woonkamer", phonetic: "vónkamer" },
    { id: "nq93", type: "multiple_choice", prompt: "Mit jelent 'tuin'?", options: [{ id: "o1", text: "kert" }, { id: "o2", text: "pince" }, { id: "o3", text: "erkély" }], correctOptionId: "o1" } ] },
  { id: "nl32", title: "Telefon & internet", description: "bellen, simkaart, wifi.", chapter: 7, xpReward: 15, questions: [
    { id: "nq94", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "telefonálni", right: "bellen" }, { id: "p2", left: "sim-kártya", right: "simkaart" }, { id: "p3", left: "feltöltés", right: "beltegoed" }] },
    { id: "nq95", type: "flashcard", prompt: "'Mi a wifi-jelszó?'", backText: "Wat is het wifi-wachtwoord?", phonetic: "Vat isz het vájfáj vakhtvórd" },
    { id: "nq96", type: "multiple_choice", prompt: "Mit jelent 'abonnement'?", options: [{ id: "o1", text: "előfizetés" }, { id: "o2", text: "feltöltőkártya" }, { id: "o3", text: "számla" }], correctOptionId: "o1" } ] },
  { id: "nl33", title: "Bank", description: "rekening, pinpas, overschrijven.", chapter: 7, xpReward: 15, questions: [
    { id: "nq97", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "számla", right: "rekening" }, { id: "p2", left: "bankkártya", right: "pinpas" }, { id: "p3", left: "átutalás", right: "overschrijving" }] },
    { id: "nq98", type: "flashcard", prompt: "'Szeretnék számlát nyitni'", backText: "Ik wil een rekening openen", phonetic: "Ik vil en rékening ópenen" },
    { id: "nq99", type: "multiple_choice", prompt: "Mit jelent 'IBAN'?", options: [{ id: "o1", text: "nemzetközi bankszámlaszám" }, { id: "o2", text: "egy bank neve" }, { id: "o3", text: "egy kártyatípus" }], correctOptionId: "o1" } ] },
  { id: "nl34", title: "Posta", description: "post, brief, pakket, postzegel.", chapter: 7, xpReward: 15, questions: [
    { id: "nq100", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "levél", right: "brief" }, { id: "p2", left: "csomag", right: "pakket" }, { id: "p3", left: "bélyeg", right: "postzegel" }] },
    { id: "nq101", type: "flashcard", prompt: "'Hol van a postafiók?'", backText: "Waar is de brievenbus?", phonetic: "Vár isz de brívenbusz" },
    { id: "nq102", type: "multiple_choice", prompt: "Mit jelent 'PostNL'?", options: [{ id: "o1", text: "a holland postaszolgáltató" }, { id: "o2", text: "egy bank" }, { id: "o3", text: "egy bolt" }], correctOptionId: "o1" } ] },
  { id: "nl35", title: "Irányok", description: "links, rechts, rechtdoor.", chapter: 7, xpReward: 15, questions: [
    { id: "nq103", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "balra", right: "links" }, { id: "p2", left: "jobbra", right: "rechts" }, { id: "p3", left: "egyenesen", right: "rechtdoor" }] },
    { id: "nq104", type: "flashcard", prompt: "'Hol van…?'", backText: "Waar is…?", phonetic: "Vár isz" },
    { id: "nq105", type: "multiple_choice", prompt: "Mit jelent 'dichtbij'?", options: [{ id: "o1", text: "közel" }, { id: "o2", text: "messze" }, { id: "o3", text: "fent" }], correctOptionId: "o1" } ] },

  // ══ 8. Fejezet: Étel részletesen ═════════════════════
  { id: "nl36", title: "Gyümölcsök", description: "appel, banaan, sinaasappel.", chapter: 8, xpReward: 15, questions: [
    { id: "nq106", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "alma", right: "appel" }, { id: "p2", left: "banán", right: "banaan" }, { id: "p3", left: "narancs", right: "sinaasappel" }] },
    { id: "nq107", type: "flashcard", prompt: "'eper'", backText: "aardbei", phonetic: "árdbáj" },
    { id: "nq108", type: "multiple_choice", prompt: "Mit jelent 'druiven'?", options: [{ id: "o1", text: "szőlő" }, { id: "o2", text: "körte" }, { id: "o3", text: "cseresznye" }], correctOptionId: "o1" } ] },
  { id: "nl37", title: "Zöldségek", description: "aardappel, ui, wortel, sla.", chapter: 8, xpReward: 15, questions: [
    { id: "nq109", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "krumpli", right: "aardappel" }, { id: "p2", left: "hagyma", right: "ui" }, { id: "p3", left: "répa", right: "wortel" }] },
    { id: "nq110", type: "flashcard", prompt: "'saláta'", backText: "sla", phonetic: "szlá" },
    { id: "nq111", type: "multiple_choice", prompt: "Mit jelent 'tomaat'?", options: [{ id: "o1", text: "paradicsom" }, { id: "o2", text: "uborka" }, { id: "o3", text: "paprika" }], correctOptionId: "o1" } ] },
  { id: "nl38", title: "Italok", description: "water, koffie, thee, bier.", chapter: 8, xpReward: 15, questions: [
    { id: "nq112", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "víz", right: "water" }, { id: "p2", left: "kávé", right: "koffie" }, { id: "p3", left: "tea", right: "thee" }] },
    { id: "nq113", type: "flashcard", prompt: "'sör'", backText: "bier", phonetic: "bír" },
    { id: "nq114", type: "multiple_choice", prompt: "Mit jelent 'jus d'orange' (jus)?", options: [{ id: "o1", text: "narancslé" }, { id: "o2", text: "tej" }, { id: "o3", text: "bor" }], correctOptionId: "o1" } ] },
  { id: "nl39", title: "Reggeli", description: "ontbijt, boterham, hagelslag.", chapter: 8, xpReward: 15, questions: [
    { id: "nq115", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "reggeli", right: "ontbijt" }, { id: "p2", left: "vajas kenyér", right: "boterham" }, { id: "p3", left: "csokiszórat", right: "hagelslag" }] },
    { id: "nq116", type: "flashcard", prompt: "'Jó étvágyat!'", backText: "Eet smakelijk!", phonetic: "Ét szmákelek" },
    { id: "nq117", type: "multiple_choice", prompt: "Mi a 'hagelslag'?", options: [{ id: "o1", text: "csokiszórat kenyérre" }, { id: "o2", text: "leves" }, { id: "o3", text: "sajt" }], correctOptionId: "o1" } ] },
  { id: "nl40", title: "Főzés", description: "koken, bakken, snijden.", chapter: 8, xpReward: 15, questions: [
    { id: "nq118", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "főzni", right: "koken" }, { id: "p2", left: "sütni", right: "bakken" }, { id: "p3", left: "vágni", right: "snijden" }] },
    { id: "nq119", type: "flashcard", prompt: "'só'", backText: "zout", phonetic: "zaut" },
    { id: "nq120", type: "multiple_choice", prompt: "Mit jelent 'peper'?", options: [{ id: "o1", text: "bors" }, { id: "o2", text: "cukor" }, { id: "o3", text: "olaj" }], correctOptionId: "o1" } ] },

  // ══ 9. Fejezet: Ruházat & boltok ═════════════════════
  { id: "nl41", title: "Ruhák", description: "jas, broek, shirt, schoenen.", chapter: 9, xpReward: 15, questions: [
    { id: "nq121", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kabát", right: "jas" }, { id: "p2", left: "nadrág", right: "broek" }, { id: "p3", left: "ing/póló", right: "shirt" }] },
    { id: "nq122", type: "flashcard", prompt: "'cipő'", backText: "schoenen", phonetic: "szkúnen" },
    { id: "nq123", type: "multiple_choice", prompt: "Mit jelent 'jurk'?", options: [{ id: "o1", text: "ruha (női)" }, { id: "o2", text: "sapka" }, { id: "o3", text: "zokni" }], correctOptionId: "o1" } ] },
  { id: "nl42", title: "Cipő és méret", description: "maat, passen, te klein.", chapter: 9, xpReward: 15, questions: [
    { id: "nq124", type: "flashcard", prompt: "'Felpróbálhatom?'", backText: "Mag ik het passen?", phonetic: "Makh ik het passzen" },
    { id: "nq125", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "méret", right: "maat" }, { id: "p2", left: "túl kicsi", right: "te klein" }, { id: "p3", left: "túl nagy", right: "te groot" }] },
    { id: "nq126", type: "multiple_choice", prompt: "Mit jelent 'paskamer'?", options: [{ id: "o1", text: "próbafülke" }, { id: "o2", text: "pénztár" }, { id: "o3", text: "raktár" }], correctOptionId: "o1" } ] },
  { id: "nl43", title: "Színek", description: "rood, blauw, groen, zwart.", chapter: 9, xpReward: 15, questions: [
    { id: "nq127", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "piros", right: "rood" }, { id: "p2", left: "kék", right: "blauw" }, { id: "p3", left: "zöld", right: "groen" }] },
    { id: "nq128", type: "flashcard", prompt: "'fekete'", backText: "zwart", phonetic: "zvárt" },
    { id: "nq129", type: "multiple_choice", prompt: "Mit jelent 'oranje'?", options: [{ id: "o1", text: "narancssárga" }, { id: "o2", text: "fehér" }, { id: "o3", text: "barna" }], correctOptionId: "o1" } ] },
  { id: "nl44", title: "Üzletek", description: "supermarkt, bakker, markt.", chapter: 9, xpReward: 15, questions: [
    { id: "nq130", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "szupermarket", right: "supermarkt" }, { id: "p2", left: "pékség", right: "bakker" }, { id: "p3", left: "piac", right: "markt" }] },
    { id: "nq131", type: "flashcard", prompt: "'nyitva'", backText: "open", phonetic: "ópen" },
    { id: "nq132", type: "multiple_choice", prompt: "Mit jelent 'gesloten'?", options: [{ id: "o1", text: "zárva" }, { id: "o2", text: "nyitva" }, { id: "o3", text: "akció" }], correctOptionId: "o1" } ] },
  { id: "nl45", title: "Akciók", description: "aanbieding, korting, gratis.", chapter: 9, xpReward: 15, questions: [
    { id: "nq133", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "akció", right: "aanbieding" }, { id: "p2", left: "kedvezmény", right: "korting" }, { id: "p3", left: "ingyenes", right: "gratis" }] },
    { id: "nq134", type: "flashcard", prompt: "'kiárusítás'", backText: "uitverkoop", phonetic: "ájtferkóp" },
    { id: "nq135", type: "multiple_choice", prompt: "Mit jelent '2e gratis'?", options: [{ id: "o1", text: "a második ingyen" }, { id: "o2", text: "féláras" }, { id: "o3", text: "lejárt" }], correctOptionId: "o1" } ] },

  // ══ 10. Fejezet: Munka részletesen ═══════════════════
  { id: "nl46", title: "Foglalkozások", description: "leraar, arts, monteur, kok.", chapter: 10, xpReward: 15, questions: [
    { id: "nq136", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "tanár", right: "leraar" }, { id: "p2", left: "orvos", right: "arts" }, { id: "p3", left: "szerelő", right: "monteur" }] },
    { id: "nq137", type: "flashcard", prompt: "'szakács'", backText: "kok", phonetic: "kok" },
    { id: "nq138", type: "multiple_choice", prompt: "Mit jelent 'verpleegkundige'?", options: [{ id: "o1", text: "ápoló" }, { id: "o2", text: "ügyvéd" }, { id: "o3", text: "sofőr" }], correctOptionId: "o1" } ] },
  { id: "nl47", title: "Álláskeresés", description: "vacature, cv, sollicitatiegesprek.", chapter: 10, xpReward: 15, questions: [
    { id: "nq139", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "álláshirdetés", right: "vacature" }, { id: "p2", left: "önéletrajz", right: "cv" }, { id: "p3", left: "állásinterjú", right: "sollicitatiegesprek" }] },
    { id: "nq140", type: "flashcard", prompt: "'Munkát keresek'", backText: "Ik zoek werk", phonetic: "Ik zúk verk" },
    { id: "nq141", type: "multiple_choice", prompt: "Mit jelent 'uitzendbureau'?", options: [{ id: "o1", text: "munkaerő-közvetítő" }, { id: "o2", text: "bank" }, { id: "o3", text: "iskola" }], correctOptionId: "o1" } ] },
  { id: "nl48", title: "Munkahely", description: "collega, baas, pauze, vergadering.", chapter: 10, xpReward: 15, questions: [
    { id: "nq142", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "munkatárs", right: "collega" }, { id: "p2", left: "főnök", right: "baas" }, { id: "p3", left: "szünet", right: "pauze" }] },
    { id: "nq143", type: "flashcard", prompt: "'értekezlet'", backText: "vergadering", phonetic: "fergádering" },
    { id: "nq144", type: "multiple_choice", prompt: "Mit jelent 'overuren'?", options: [{ id: "o1", text: "túlóra" }, { id: "o2", text: "szabadság" }, { id: "o3", text: "fizetés" }], correctOptionId: "o1" } ] },
  { id: "nl49", title: "Szerződés", description: "vast contract, tijdelijk, opzeggen.", chapter: 10, xpReward: 15, questions: [
    { id: "nq145", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "határozatlan szerződés", right: "vast contract" }, { id: "p2", left: "határozott idejű", right: "tijdelijk contract" }, { id: "p3", left: "felmondani", right: "opzeggen" }] },
    { id: "nq146", type: "flashcard", prompt: "'próbaidő'", backText: "proeftijd", phonetic: "prúftájd" },
    { id: "nq147", type: "multiple_choice", prompt: "Mit jelent 'ontslag'?", options: [{ id: "o1", text: "elbocsátás" }, { id: "o2", text: "fizetésemelés" }, { id: "o3", text: "szabadság" }], correctOptionId: "o1" } ] },
  { id: "nl50", title: "Fizetés és adó", description: "loon, belasting, vakantiegeld.", chapter: 10, xpReward: 15, questions: [
    { id: "nq148", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bér", right: "loon" }, { id: "p2", left: "adó", right: "belasting" }, { id: "p3", left: "szabadságpénz", right: "vakantiegeld" }] },
    { id: "nq149", type: "flashcard", prompt: "'bérpapír'", backText: "loonstrook", phonetic: "lónsztrók" },
    { id: "nq150", type: "multiple_choice", prompt: "Mit jelent 'nettoloon'?", options: [{ id: "o1", text: "nettó bér" }, { id: "o2", text: "bruttó bér" }, { id: "o3", text: "adó" }], correctOptionId: "o1" } ] },

  // ══ 11. Fejezet: Naptár & idő ════════════════════════
  { id: "nl51", title: "Hónapok", description: "januari, februari, maart…", chapter: 11, xpReward: 15, questions: [
    { id: "nq151", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "január", right: "januari" }, { id: "p2", left: "május", right: "mei" }, { id: "p3", left: "december", right: "december" }] },
    { id: "nq152", type: "flashcard", prompt: "'augusztus'", backText: "augustus", phonetic: "augusztusz" },
    { id: "nq153", type: "multiple_choice", prompt: "Mit jelent 'maand'?", options: [{ id: "o1", text: "hónap" }, { id: "o2", text: "hét" }, { id: "o3", text: "év" }], correctOptionId: "o1" } ] },
  { id: "nl52", title: "Évszakok", description: "lente, zomer, herfst, winter.", chapter: 11, xpReward: 15, questions: [
    { id: "nq154", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "tavasz", right: "lente" }, { id: "p2", left: "nyár", right: "zomer" }, { id: "p3", left: "tél", right: "winter" }] },
    { id: "nq155", type: "flashcard", prompt: "'ősz'", backText: "herfst", phonetic: "herfszt" },
    { id: "nq156", type: "multiple_choice", prompt: "Mit jelent 'seizoen'?", options: [{ id: "o1", text: "évszak" }, { id: "o2", text: "ünnep" }, { id: "o3", text: "nap" }], correctOptionId: "o1" } ] },
  { id: "nl53", title: "Pontos idő", description: "Hoe laat? half, kwart.", chapter: 11, xpReward: 15, questions: [
    { id: "nq157", type: "flashcard", prompt: "'Hány óra van?'", backText: "Hoe laat is het?", phonetic: "Hú lát isz het" },
    { id: "nq158", type: "multiple_choice", prompt: "Mit jelent 'half drie'?", options: [{ id: "o1", text: "fél három (2:30)" }, { id: "o2", text: "három óra" }, { id: "o3", text: "negyed három" }], correctOptionId: "o1" },
    { id: "nq159", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "óra", right: "uur" }, { id: "p2", left: "perc", right: "minuut" }, { id: "p3", left: "negyed", right: "kwart" }] } ] },
  { id: "nl54", title: "Gyakoriság", description: "altijd, soms, nooit.", chapter: 11, xpReward: 15, questions: [
    { id: "nq160", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "mindig", right: "altijd" }, { id: "p2", left: "néha", right: "soms" }, { id: "p3", left: "soha", right: "nooit" }] },
    { id: "nq161", type: "flashcard", prompt: "'gyakran'", backText: "vaak", phonetic: "fák" },
    { id: "nq162", type: "multiple_choice", prompt: "Mit jelent 'elke dag'?", options: [{ id: "o1", text: "minden nap" }, { id: "o2", text: "tegnap" }, { id: "o3", text: "egyszer" }], correctOptionId: "o1" } ] },
  { id: "nl55", title: "Ünnepek", description: "Koningsdag, Sinterklaas, Kerst.", chapter: 11, xpReward: 15, questions: [
    { id: "nq163", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Királynap", right: "Koningsdag" }, { id: "p2", left: "Mikulás", right: "Sinterklaas" }, { id: "p3", left: "Karácsony", right: "Kerst" }] },
    { id: "nq164", type: "flashcard", prompt: "'Boldog új évet!'", backText: "Gelukkig nieuwjaar!", phonetic: "Helükkekh nívjár" },
    { id: "nq165", type: "multiple_choice", prompt: "Mikor van Koningsdag?", options: [{ id: "o1", text: "Április 27." }, { id: "o2", text: "December 5." }, { id: "o3", text: "Május 5." }], correctOptionId: "o1" } ] },

  // ══ 12. Fejezet: Város & utazás ══════════════════════
  { id: "nl56", title: "Helyek a városban", description: "station, ziekenhuis, school.", chapter: 12, xpReward: 15, questions: [
    { id: "nq166", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "pályaudvar", right: "station" }, { id: "p2", left: "kórház", right: "ziekenhuis" }, { id: "p3", left: "iskola", right: "school" }] },
    { id: "nq167", type: "flashcard", prompt: "'könyvtár'", backText: "bibliotheek", phonetic: "biblioték" },
    { id: "nq168", type: "multiple_choice", prompt: "Mit jelent 'gemeentehuis'?", options: [{ id: "o1", text: "városháza" }, { id: "o2", text: "templom" }, { id: "o3", text: "park" }], correctOptionId: "o1" } ] },
  { id: "nl57", title: "Útbaigazítás", description: "Hoe kom ik bij…? straat, hoek.", chapter: 12, xpReward: 15, questions: [
    { id: "nq169", type: "flashcard", prompt: "'Hogy jutok el a…?'", backText: "Hoe kom ik bij…?", phonetic: "Hú kom ik báj" },
    { id: "nq170", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "utca", right: "straat" }, { id: "p2", left: "sarok", right: "hoek" }, { id: "p3", left: "tér", right: "plein" }] },
    { id: "nq171", type: "multiple_choice", prompt: "Mit jelent 'oversteken'?", options: [{ id: "o1", text: "átkelni az úton" }, { id: "o2", text: "befordulni" }, { id: "o3", text: "megállni" }], correctOptionId: "o1" } ] },
  { id: "nl58", title: "Tömegközlekedés", description: "trein, tram, metro, halte.", chapter: 12, xpReward: 15, questions: [
    { id: "nq172", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "villamos", right: "tram" }, { id: "p2", left: "metró", right: "metro" }, { id: "p3", left: "megálló", right: "halte" }] },
    { id: "nq173", type: "flashcard", prompt: "'Melyik peronról indul?'", backText: "Van welk spoor vertrekt hij?", phonetic: "Fan velk szpór fertrekt háj" },
    { id: "nq174", type: "multiple_choice", prompt: "Mit jelent 'overstappen'?", options: [{ id: "o1", text: "átszállni" }, { id: "o2", text: "kiszállni" }, { id: "o3", text: "késni" }], correctOptionId: "o1" } ] },
  { id: "nl59", title: "Autó & vezetés", description: "auto, benzine, parkeren.", chapter: 12, xpReward: 15, questions: [
    { id: "nq175", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "autó", right: "auto" }, { id: "p2", left: "benzin", right: "benzine" }, { id: "p3", left: "parkolni", right: "parkeren" }] },
    { id: "nq176", type: "flashcard", prompt: "'jogosítvány'", backText: "rijbewijs", phonetic: "rájbevájsz" },
    { id: "nq177", type: "multiple_choice", prompt: "Mit jelent 'file'?", options: [{ id: "o1", text: "forgalmi dugó" }, { id: "o2", text: "benzinkút" }, { id: "o3", text: "parkoló" }], correctOptionId: "o1" } ] },
  { id: "nl60", title: "Jegyek", description: "kaartje, enkele reis, retour.", chapter: 12, xpReward: 15, questions: [
    { id: "nq178", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "jegy", right: "kaartje" }, { id: "p2", left: "oda", right: "enkele reis" }, { id: "p3", left: "oda-vissza", right: "retour" }] },
    { id: "nq179", type: "flashcard", prompt: "'Egy jegyet kérek Amszterdamba'", backText: "Een kaartje naar Amsterdam, graag", phonetic: "En kártje nár Amszterdam, hrákh" },
    { id: "nq180", type: "multiple_choice", prompt: "Mit jelent 'dalkorting'?", options: [{ id: "o1", text: "csúcsidőn kívüli kedvezmény" }, { id: "o2", text: "diákbérlet" }, { id: "o3", text: "pótdíj" }], correctOptionId: "o1" } ] },

  // ══ 13. Fejezet: Számok & mértékek ═══════════════════
  { id: "nl61", title: "Számok 11–20", description: "elf, twaalf, dertien…", chapter: 13, xpReward: 15, questions: [
    { id: "nq181", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "11", right: "elf" }, { id: "p2", left: "12", right: "twaalf" }, { id: "p3", left: "13", right: "dertien" }] },
    { id: "nq182", type: "flashcard", prompt: "'húsz'", backText: "twintig", phonetic: "tvintekh" },
    { id: "nq183", type: "multiple_choice", prompt: "Mennyi a 'vijftien'?", options: [{ id: "o1", text: "15" }, { id: "o2", text: "50" }, { id: "o3", text: "5" }], correctOptionId: "o1" } ] },
  { id: "nl62", title: "Tízesek & százak", description: "dertig, honderd, duizend.", chapter: 13, xpReward: 15, questions: [
    { id: "nq184", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "30", right: "dertig" }, { id: "p2", left: "100", right: "honderd" }, { id: "p3", left: "1000", right: "duizend" }] },
    { id: "nq185", type: "flashcard", prompt: "'ötven'", backText: "vijftig", phonetic: "fájftekh" },
    { id: "nq186", type: "multiple_choice", prompt: "Mennyi a 'tweehonderd'?", options: [{ id: "o1", text: "200" }, { id: "o2", text: "2000" }, { id: "o3", text: "20" }], correctOptionId: "o1" } ] },
  { id: "nl63", title: "Sorszámok", description: "eerste, tweede, derde.", chapter: 13, xpReward: 15, questions: [
    { id: "nq187", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "első", right: "eerste" }, { id: "p2", left: "második", right: "tweede" }, { id: "p3", left: "harmadik", right: "derde" }] },
    { id: "nq188", type: "flashcard", prompt: "'utolsó'", backText: "laatste", phonetic: "látszte" },
    { id: "nq189", type: "multiple_choice", prompt: "Mit jelent 'de eerste verdieping'?", options: [{ id: "o1", text: "az első emelet" }, { id: "o2", text: "a földszint" }, { id: "o3", text: "a pince" }], correctOptionId: "o1" } ] },
  { id: "nl64", title: "Mértékegységek", description: "kilo, liter, gram, stuk.", chapter: 13, xpReward: 15, questions: [
    { id: "nq190", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kiló", right: "kilo" }, { id: "p2", left: "liter", right: "liter" }, { id: "p3", left: "darab", right: "stuk" }] },
    { id: "nq191", type: "flashcard", prompt: "'fél kiló'", backText: "een pond / een half kilo", phonetic: "en pont" },
    { id: "nq192", type: "multiple_choice", prompt: "Mit jelent 'een ons'?", options: [{ id: "o1", text: "10 deka (100 g)" }, { id: "o2", text: "1 kg" }, { id: "o3", text: "1 liter" }], correctOptionId: "o1" } ] },
  { id: "nl65", title: "Ár és jelzők", description: "goedkoop, duur, korting.", chapter: 13, xpReward: 15, questions: [
    { id: "nq193", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "olcsó", right: "goedkoop" }, { id: "p2", left: "drága", right: "duur" }, { id: "p3", left: "ingyen", right: "gratis" }] },
    { id: "nq194", type: "flashcard", prompt: "'Túl drága'", backText: "Te duur", phonetic: "Te dűr" },
    { id: "nq195", type: "multiple_choice", prompt: "Mit jelent 'inclusief btw'?", options: [{ id: "o1", text: "áfával együtt" }, { id: "o2", text: "áfa nélkül" }, { id: "o3", text: "akciós" }], correctOptionId: "o1" } ] },

  // ══ 14. Fejezet: Lakhatás részletesen ════════════════
  { id: "nl66", title: "Lakáskeresés", description: "te huur, kamer, appartement.", chapter: 14, xpReward: 15, questions: [
    { id: "nq196", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kiadó", right: "te huur" }, { id: "p2", left: "szoba", right: "kamer" }, { id: "p3", left: "lakás", right: "appartement" }] },
    { id: "nq197", type: "flashcard", prompt: "'Van szabad lakás?'", backText: "Is er een woning vrij?", phonetic: "Isz er en vóning fráj" },
    { id: "nq198", type: "multiple_choice", prompt: "Mit jelent 'gemeubileerd'?", options: [{ id: "o1", text: "bútorozott" }, { id: "o2", text: "üres" }, { id: "o3", text: "felújított" }], correctOptionId: "o1" } ] },
  { id: "nl67", title: "Bérleti szerződés", description: "huurcontract, borg, opzegtermijn.", chapter: 14, xpReward: 15, questions: [
    { id: "nq199", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bérleti szerződés", right: "huurcontract" }, { id: "p2", left: "kaució", right: "borg" }, { id: "p3", left: "felmondási idő", right: "opzegtermijn" }] },
    { id: "nq200", type: "flashcard", prompt: "'bérbeadó'", backText: "verhuurder", phonetic: "ferhűrder" },
    { id: "nq201", type: "multiple_choice", prompt: "Mit jelent 'huurder'?", options: [{ id: "o1", text: "bérlő" }, { id: "o2", text: "tulajdonos" }, { id: "o3", text: "szomszéd" }], correctOptionId: "o1" } ] },
  { id: "nl68", title: "Rezsi", description: "gas, water, licht, servicekosten.", chapter: 14, xpReward: 15, questions: [
    { id: "nq202", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "gáz", right: "gas" }, { id: "p2", left: "víz", right: "water" }, { id: "p3", left: "áram", right: "elektriciteit" }] },
    { id: "nq203", type: "flashcard", prompt: "'rezsi / mellékköltség'", backText: "servicekosten", phonetic: "szervisz-kosten" },
    { id: "nq204", type: "multiple_choice", prompt: "Mit jelent 'energierekening'?", options: [{ id: "o1", text: "energiaszámla" }, { id: "o2", text: "lakbér" }, { id: "o3", text: "biztosítás" }], correctOptionId: "o1" } ] },
  { id: "nl69", title: "Házszabályok", description: "stil, afval, scheiden.", chapter: 14, xpReward: 15, questions: [
    { id: "nq205", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "szemét", right: "afval" }, { id: "p2", left: "csendes", right: "stil" }, { id: "p3", left: "szétválogatni", right: "scheiden" }] },
    { id: "nq206", type: "flashcard", prompt: "'újrahasznosítás'", backText: "recyclen", phonetic: "riszájklen" },
    { id: "nq207", type: "multiple_choice", prompt: "Mit jelent 'GFT'?", options: [{ id: "o1", text: "bio/zöldhulladék" }, { id: "o2", text: "papír" }, { id: "o3", text: "üveg" }], correctOptionId: "o1" } ] },
  { id: "nl70", title: "Lakásproblémák", description: "kapot, lekkage, reparatie.", chapter: 14, xpReward: 15, questions: [
    { id: "nq208", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "elromlott", right: "kapot" }, { id: "p2", left: "beázás", right: "lekkage" }, { id: "p3", left: "javítás", right: "reparatie" }] },
    { id: "nq209", type: "flashcard", prompt: "'A fűtés nem működik'", backText: "De verwarming doet het niet", phonetic: "De fervarming dút het nít" },
    { id: "nq210", type: "multiple_choice", prompt: "Mit jelent 'storing'?", options: [{ id: "o1", text: "üzemzavar / meghibásodás" }, { id: "o2", text: "lakbér" }, { id: "o3", text: "költözés" }], correctOptionId: "o1" } ] },

  // ══ 15. Fejezet: Gyerekek & iskola ═══════════════════
  { id: "nl71", title: "Gyerekek", description: "baby, peuter, opvoeden.", chapter: 15, xpReward: 15, questions: [
    { id: "nq211", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "csecsemő", right: "baby" }, { id: "p2", left: "kisgyerek", right: "peuter" }, { id: "p3", left: "gyerek", right: "kind" }] },
    { id: "nq212", type: "flashcard", prompt: "'nevelni'", backText: "opvoeden", phonetic: "opfúden" },
    { id: "nq213", type: "multiple_choice", prompt: "Mit jelent 'luier'?", options: [{ id: "o1", text: "pelenka" }, { id: "o2", text: "cumi" }, { id: "o3", text: "babakocsi" }], correctOptionId: "o1" } ] },
  { id: "nl72", title: "Óvoda & bölcsőde", description: "kinderdagverblijf, opvang.", chapter: 15, xpReward: 15, questions: [
    { id: "nq214", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bölcsőde", right: "kinderdagverblijf" }, { id: "p2", left: "gyermekfelügyelet", right: "kinderopvang" }, { id: "p3", left: "dadus", right: "oppas" }] },
    { id: "nq215", type: "flashcard", prompt: "'gyermekfelügyeleti támogatás'", backText: "kinderopvangtoeslag", phonetic: "kinderopfang-túszlakh" },
    { id: "nq216", type: "multiple_choice", prompt: "Mit jelent 'peuterspeelzaal'?", options: [{ id: "o1", text: "óvodai játszócsoport" }, { id: "o2", text: "kórház" }, { id: "o3", text: "egyetem" }], correctOptionId: "o1" } ] },
  { id: "nl73", title: "Iskola", description: "basisschool, juf, meester.", chapter: 15, xpReward: 15, questions: [
    { id: "nq217", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "általános iskola", right: "basisschool" }, { id: "p2", left: "tanító néni", right: "juf" }, { id: "p3", left: "tanító bácsi", right: "meester" }] },
    { id: "nq218", type: "flashcard", prompt: "'középiskola'", backText: "middelbare school", phonetic: "middelbáre szkól" },
    { id: "nq219", type: "multiple_choice", prompt: "Mit jelent 'groep 1'?", options: [{ id: "o1", text: "az első osztály (kb. 4 éves)" }, { id: "o2", text: "az érettségi" }, { id: "o3", text: "az egyetem" }], correctOptionId: "o1" } ] },
  { id: "nl74", title: "Tantárgyak", description: "rekenen, taal, gym.", chapter: 15, xpReward: 15, questions: [
    { id: "nq220", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "számolás", right: "rekenen" }, { id: "p2", left: "nyelv", right: "taal" }, { id: "p3", left: "testnevelés", right: "gym" }] },
    { id: "nq221", type: "flashcard", prompt: "'házi feladat'", backText: "huiswerk", phonetic: "hájszverk" },
    { id: "nq222", type: "multiple_choice", prompt: "Mit jelent 'rapport'?", options: [{ id: "o1", text: "bizonyítvány" }, { id: "o2", text: "szünet" }, { id: "o3", text: "tankönyv" }], correctOptionId: "o1" } ] },
  { id: "nl75", title: "Szülői ügyek", description: "ouderavond, toestemming.", chapter: 15, xpReward: 15, questions: [
    { id: "nq223", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "szülői értekezlet", right: "ouderavond" }, { id: "p2", left: "engedély", right: "toestemming" }, { id: "p3", left: "igazolás", right: "briefje" }] },
    { id: "nq224", type: "flashcard", prompt: "'A gyermekem beteg'", backText: "Mijn kind is ziek", phonetic: "Májn kind isz zík" },
    { id: "nq225", type: "multiple_choice", prompt: "Mit jelent 'schoolreisje'?", options: [{ id: "o1", text: "osztálykirándulás" }, { id: "o2", text: "óra" }, { id: "o3", text: "vizsga" }], correctOptionId: "o1" } ] },

  // ══ 16. Fejezet: Pénzügyek ═══════════════════════════
  { id: "nl76", title: "Bankszámla", description: "betaalrekening, spaarrekening.", chapter: 16, xpReward: 15, questions: [
    { id: "nq226", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "folyószámla", right: "betaalrekening" }, { id: "p2", left: "megtakarítási számla", right: "spaarrekening" }, { id: "p3", left: "egyenleg", right: "saldo" }] },
    { id: "nq227", type: "flashcard", prompt: "'Mennyi az egyenlegem?'", backText: "Wat is mijn saldo?", phonetic: "Vat isz májn szaldó" },
    { id: "nq228", type: "multiple_choice", prompt: "Mit jelent 'rood staan'?", options: [{ id: "o1", text: "mínuszban lenni" }, { id: "o2", text: "spórolni" }, { id: "o3", text: "fizetni" }], correctOptionId: "o1" } ] },
  { id: "nl77", title: "Kártya & ATM", description: "pinpas, geldautomaat, pincode.", chapter: 16, xpReward: 15, questions: [
    { id: "nq229", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bankkártya", right: "pinpas" }, { id: "p2", left: "bankautomata", right: "geldautomaat" }, { id: "p3", left: "PIN-kód", right: "pincode" }] },
    { id: "nq230", type: "flashcard", prompt: "'készpénzt felvenni'", backText: "geld opnemen", phonetic: "helt opnemen" },
    { id: "nq231", type: "multiple_choice", prompt: "Mit jelent 'contactloos betalen'?", options: [{ id: "o1", text: "érintéses fizetés" }, { id: "o2", text: "készpénz" }, { id: "o3", text: "átutalás" }], correctOptionId: "o1" } ] },
  { id: "nl78", title: "Utalás & számlák", description: "overschrijven, factuur, automatische incasso.", chapter: 16, xpReward: 15, questions: [
    { id: "nq232", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "átutalni", right: "overschrijven" }, { id: "p2", left: "számla (kiállított)", right: "factuur" }, { id: "p3", left: "csoportos beszedés", right: "automatische incasso" }] },
    { id: "nq233", type: "flashcard", prompt: "'határidő'", backText: "uiterste betaaldatum", phonetic: "ájterszte betál-dátum" },
    { id: "nq234", type: "multiple_choice", prompt: "Mit jelent 'aanmaning'?", options: [{ id: "o1", text: "fizetési felszólítás" }, { id: "o2", text: "nyugta" }, { id: "o3", text: "kedvezmény" }], correctOptionId: "o1" } ] },
  { id: "nl79", title: "Megtakarítás & hitel", description: "sparen, lening, hypotheek.", chapter: 16, xpReward: 15, questions: [
    { id: "nq235", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "megtakarítani", right: "sparen" }, { id: "p2", left: "kölcsön", right: "lening" }, { id: "p3", left: "jelzáloghitel", right: "hypotheek" }] },
    { id: "nq236", type: "flashcard", prompt: "'kamat'", backText: "rente", phonetic: "rente" },
    { id: "nq237", type: "multiple_choice", prompt: "Mit jelent 'schuld'?", options: [{ id: "o1", text: "adósság" }, { id: "o2", text: "megtakarítás" }, { id: "o3", text: "fizetés" }], correctOptionId: "o1" } ] },
  { id: "nl80", title: "Biztosítás", description: "verzekering, eigen risico, premie.", chapter: 16, xpReward: 15, questions: [
    { id: "nq238", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "biztosítás", right: "verzekering" }, { id: "p2", left: "önrész", right: "eigen risico" }, { id: "p3", left: "díj", right: "premie" }] },
    { id: "nq239", type: "flashcard", prompt: "'egészségbiztosítás'", backText: "zorgverzekering", phonetic: "zorg-ferzékering" },
    { id: "nq240", type: "multiple_choice", prompt: "Mit jelent 'aansprakelijkheidsverzekering' (WA)?", options: [{ id: "o1", text: "felelősségbiztosítás" }, { id: "o2", text: "lakásbiztosítás" }, { id: "o3", text: "életbiztosítás" }], correctOptionId: "o1" } ] },

  // ══ 17. Fejezet: Egészségügy ═════════════════════════
  { id: "nl81", title: "Orvostípusok", description: "huisarts, tandarts, specialist.", chapter: 17, xpReward: 15, questions: [
    { id: "nq241", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "háziorvos", right: "huisarts" }, { id: "p2", left: "fogorvos", right: "tandarts" }, { id: "p3", left: "szakorvos", right: "specialist" }] },
    { id: "nq242", type: "flashcard", prompt: "'szülésznő'", backText: "verloskundige", phonetic: "ferlosz-kündege" },
    { id: "nq243", type: "multiple_choice", prompt: "Mit jelent 'doorverwijzing'?", options: [{ id: "o1", text: "beutaló" }, { id: "o2", text: "recept" }, { id: "o3", text: "számla" }], correctOptionId: "o1" } ] },
  { id: "nl82", title: "Kórház", description: "ziekenhuis, spoedeisende hulp (SEH).", chapter: 17, xpReward: 15, questions: [
    { id: "nq244", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kórház", right: "ziekenhuis" }, { id: "p2", left: "sürgősségi", right: "spoedeisende hulp" }, { id: "p3", left: "műtét", right: "operatie" }] },
    { id: "nq245", type: "flashcard", prompt: "'Mentőt kérek!'", backText: "Ik heb een ambulance nodig!", phonetic: "Ik heb en ambülansze nódekh" },
    { id: "nq246", type: "multiple_choice", prompt: "Mi a 'huisartsenpost'?", options: [{ id: "o1", text: "ügyeleti háziorvosi rendelő (esténként/hétvégén)" }, { id: "o2", text: "gyógyszertár" }, { id: "o3", text: "biztosító" }], correctOptionId: "o1" } ] },
  { id: "nl83", title: "Időpontkérés", description: "afspraak maken, spreekuur.", chapter: 17, xpReward: 15, questions: [
    { id: "nq247", type: "flashcard", prompt: "'Szeretnék időpontot kérni'", backText: "Ik wil een afspraak maken", phonetic: "Ik vil en afszprák máken" },
    { id: "nq248", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "időpont", right: "afspraak" }, { id: "p2", left: "rendelési idő", right: "spreekuur" }, { id: "p3", left: "sürgős", right: "spoed" }] },
    { id: "nq249", type: "multiple_choice", prompt: "Mit jelent 'wachtkamer'?", options: [{ id: "o1", text: "váróterem" }, { id: "o2", text: "rendelő" }, { id: "o3", text: "labor" }], correctOptionId: "o1" } ] },
  { id: "nl84", title: "Biztosítókártya", description: "zorgpas, polis, vergoeding.", chapter: 17, xpReward: 15, questions: [
    { id: "nq250", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "biztosítókártya", right: "zorgpas" }, { id: "p2", left: "kötvény", right: "polis" }, { id: "p3", left: "térítés", right: "vergoeding" }] },
    { id: "nq251", type: "flashcard", prompt: "'Be vagyok biztosítva?'", backText: "Ben ik verzekerd?", phonetic: "Ben ik ferzékerd" },
    { id: "nq252", type: "multiple_choice", prompt: "Mit jelent 'eigen risico'?", options: [{ id: "o1", text: "az éves önrész, amit te fizetsz" }, { id: "o2", text: "a havi díj" }, { id: "o3", text: "a recept ára" }], correctOptionId: "o1" } ] },
  { id: "nl85", title: "Betegállomány", description: "ziekmelden, beter melden.", chapter: 17, xpReward: 15, questions: [
    { id: "nq253", type: "flashcard", prompt: "'Beteget jelentek (a munkahelyen)'", backText: "Ik meld me ziek", phonetic: "Ik meld me zík" },
    { id: "nq254", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "betegszabadság", right: "ziekteverlof" }, { id: "p2", left: "üzemorvos", right: "bedrijfsarts" }, { id: "p3", left: "felépülni", right: "herstellen" }] },
    { id: "nq255", type: "multiple_choice", prompt: "Mit kell tenni betegség esetén először?", options: [{ id: "o1", text: "szólni a munkáltatónak (ziekmelden)" }, { id: "o2", text: "kórházba menni" }, { id: "o3", text: "felmondani" }], correctOptionId: "o1" } ] },

  // ══ 18. Fejezet: Ügyintézés & okmányok ═══════════════
  { id: "nl86", title: "Okmányok", description: "paspoort, id-kaart, verblijfsdocument.", chapter: 18, xpReward: 15, questions: [
    { id: "nq256", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "útlevél", right: "paspoort" }, { id: "p2", left: "személyi igazolvány", right: "id-kaart" }, { id: "p3", left: "tartózkodási okmány", right: "verblijfsdocument" }] },
    { id: "nq257", type: "flashcard", prompt: "'érvényes'", backText: "geldig", phonetic: "heldekh" },
    { id: "nq258", type: "multiple_choice", prompt: "Mit jelent 'verlopen'?", options: [{ id: "o1", text: "lejárt" }, { id: "o2", text: "érvényes" }, { id: "o3", text: "új" }], correctOptionId: "o1" } ] },
  { id: "nl87", title: "Bejelentkezés", description: "inschrijven, BRP, BSN.", chapter: 18, xpReward: 15, questions: [
    { id: "nq259", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bejelentkezni", right: "inschrijven" }, { id: "p2", left: "lakcímnyilvántartás", right: "BRP" }, { id: "p3", left: "kijelentkezni", right: "uitschrijven" }] },
    { id: "nq260", type: "flashcard", prompt: "'Be szeretnék jelentkezni'", backText: "Ik wil me inschrijven", phonetic: "Ik vil me inszkrájven" },
    { id: "nq261", type: "multiple_choice", prompt: "Hol kapod a BSN-t?", options: [{ id: "o1", text: "a gemeentén (önkormányzat)" }, { id: "o2", text: "a banknál" }, { id: "o3", text: "a rendőrségen" }], correctOptionId: "o1" } ] },
  { id: "nl88", title: "Adóügyek", description: "Belastingdienst, aangifte, toeslag.", chapter: 18, xpReward: 15, questions: [
    { id: "nq262", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "adóhivatal", right: "Belastingdienst" }, { id: "p2", left: "adóbevallás", right: "aangifte" }, { id: "p3", left: "juttatás", right: "toeslag" }] },
    { id: "nq263", type: "flashcard", prompt: "'adóvisszatérítés'", backText: "belastingteruggave", phonetic: "belaszting-terükháve" },
    { id: "nq264", type: "multiple_choice", prompt: "Mit jelent 'huurtoeslag'?", options: [{ id: "o1", text: "lakbértámogatás" }, { id: "o2", text: "családi pótlék" }, { id: "o3", text: "nyugdíj" }], correctOptionId: "o1" } ] },
  { id: "nl89", title: "Családi támogatás", description: "kinderbijslag, kindgebonden budget.", chapter: 18, xpReward: 15, questions: [
    { id: "nq265", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "családi pótlék", right: "kinderbijslag" }, { id: "p2", left: "gyermekekhez kötött támogatás", right: "kindgebonden budget" }, { id: "p3", left: "kérelmezni", right: "aanvragen" }] },
    { id: "nq266", type: "flashcard", prompt: "'Társadalombiztosítási Bank (családi ellátások)'", backText: "SVB", phonetic: "esz-fé-bé" },
    { id: "nq267", type: "multiple_choice", prompt: "Ki fizeti a kinderbijslagot?", options: [{ id: "o1", text: "az SVB (Sociale Verzekeringsbank)" }, { id: "o2", text: "a bank" }, { id: "o3", text: "a munkáltató" }], correctOptionId: "o1" } ] },
  { id: "nl90", title: "Munkanélküliség", description: "WW-uitkering, UWV.", chapter: 18, xpReward: 15, questions: [
    { id: "nq268", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "munkanélküli ellátás", right: "WW-uitkering" }, { id: "p2", left: "munkaügyi hivatal", right: "UWV" }, { id: "p3", left: "álláskeresés", right: "werk zoeken" }] },
    { id: "nq269", type: "flashcard", prompt: "'Elvesztettem a munkámat'", backText: "Ik ben mijn baan kwijt", phonetic: "Ik ben májn bán kvájt" },
    { id: "nq270", type: "multiple_choice", prompt: "Mit jelent 'uitkering'?", options: [{ id: "o1", text: "(állami) ellátás / segély" }, { id: "o2", text: "fizetés" }, { id: "o3", text: "adó" }], correctOptionId: "o1" } ] },

  // ══ 19. Fejezet: Társalgás ═══════════════════════════
  { id: "nl91", title: "Smalltalk", description: "Hoe gaat het? Goed, hoor.", chapter: 19, xpReward: 15, questions: [
    { id: "nq271", type: "flashcard", prompt: "'Jól vagyok, köszönöm'", backText: "Goed, dank je", phonetic: "Hút, dank je" },
    { id: "nq272", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Honnan jössz?", right: "Waar kom je vandaan?" }, { id: "p2", left: "Magyarországról", right: "Uit Hongarije" }, { id: "p3", left: "Hol laksz?", right: "Waar woon je?" }] },
    { id: "nq273", type: "multiple_choice", prompt: "Mit jelent 'lekker weer, hè?'", options: [{ id: "o1", text: "Jó idő van, ugye?" }, { id: "o2", text: "Hány óra?" }, { id: "o3", text: "Hol vagy?" }], correctOptionId: "o1" } ] },
  { id: "nl92", title: "Vélemény", description: "Ik vind, leuk, saai.", chapter: 19, xpReward: 15, questions: [
    { id: "nq274", type: "flashcard", prompt: "'Szerintem…'", backText: "Ik vind…", phonetic: "Ik fint" },
    { id: "nq275", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "jó/szuper", right: "leuk" }, { id: "p2", left: "unalmas", right: "saai" }, { id: "p3", left: "szép", right: "mooi" }] },
    { id: "nq276", type: "multiple_choice", prompt: "Mit jelent 'Ik hou ervan'?", options: [{ id: "o1", text: "Szeretem" }, { id: "o2", text: "Nem érdekel" }, { id: "o3", text: "Nem tudom" }], correctOptionId: "o1" } ] },
  { id: "nl93", title: "Egyetértés", description: "Ja, klopt. Mee eens.", chapter: 19, xpReward: 15, questions: [
    { id: "nq277", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Így van / stimmel", right: "Dat klopt" }, { id: "p2", left: "Egyetértek", right: "Mee eens" }, { id: "p3", left: "Nem értek egyet", right: "Niet mee eens" }] },
    { id: "nq278", type: "flashcard", prompt: "'Természetesen'", backText: "Natuurlijk", phonetic: "Natűrlek" },
    { id: "nq279", type: "multiple_choice", prompt: "Mit jelent 'precies'?", options: [{ id: "o1", text: "pontosan / úgy van" }, { id: "o2", text: "talán" }, { id: "o3", text: "soha" }], correctOptionId: "o1" } ] },
  { id: "nl94", title: "Meghívás", description: "Zin in koffie? Gezellig!", chapter: 19, xpReward: 15, questions: [
    { id: "nq280", type: "flashcard", prompt: "'Van kedved egy kávéhoz?'", backText: "Heb je zin in koffie?", phonetic: "Heb je zin in koffi" },
    { id: "nq281", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Szívesen", right: "Graag" }, { id: "p2", left: "Talán máskor", right: "Misschien een andere keer" }, { id: "p3", left: "hangulatos", right: "gezellig" }] },
    { id: "nq282", type: "multiple_choice", prompt: "Mit jelent 'afspreken'?", options: [{ id: "o1", text: "találkozót megbeszélni" }, { id: "o2", text: "lemondani" }, { id: "o3", text: "fizetni" }], correctOptionId: "o1" } ] },
  { id: "nl95", title: "Bocsánat & köszönet", description: "Sorry, excuses, bedankt.", chapter: 19, xpReward: 15, questions: [
    { id: "nq283", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Bocsánat", right: "Sorry" }, { id: "p2", left: "Elnézést kérek", right: "Mijn excuses" }, { id: "p3", left: "Nagyon köszönöm", right: "Hartelijk bedankt" }] },
    { id: "nq284", type: "flashcard", prompt: "'Semmi gond'", backText: "Geen probleem", phonetic: "Hén próbléem" },
    { id: "nq285", type: "multiple_choice", prompt: "Mit jelent 'graag gedaan'?", options: [{ id: "o1", text: "Szívesen (válasz köszönetre)" }, { id: "o2", text: "Köszönöm" }, { id: "o3", text: "Sajnálom" }], correctOptionId: "o1" } ] },

  // ══ 20. Fejezet: Túlélő mondatok ═════════════════════
  { id: "nl96", title: "Segítségkérés", description: "Kunt u mij helpen?", chapter: 20, xpReward: 20, questions: [
    { id: "nq286", type: "flashcard", prompt: "'Tudna segíteni?'", backText: "Kunt u mij helpen?", phonetic: "Kunt ü máj helpen" },
    { id: "nq287", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Eltévedtem", right: "Ik ben verdwaald" }, { id: "p2", left: "Elveszett a táskám", right: "Ik ben mijn tas kwijt" }, { id: "p3", left: "Hol a WC?", right: "Waar is het toilet?" }] },
    { id: "nq288", type: "multiple_choice", prompt: "Mit jelent 'Mag ik iets vragen?'", options: [{ id: "o1", text: "Kérdezhetek valamit?" }, { id: "o2", text: "Hol vagy?" }, { id: "o3", text: "Mennyi az idő?" }], correctOptionId: "o1" } ] },
  { id: "nl97", title: "Ha nem értem", description: "Langzamer, alstublieft.", chapter: 20, xpReward: 20, questions: [
    { id: "nq289", type: "flashcard", prompt: "'Lassabban, kérem'", backText: "Langzamer, alstublieft", phonetic: "Langzámer, alsztüblíft" },
    { id: "nq290", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Megismételné?", right: "Kunt u dat herhalen?" }, { id: "p2", left: "Beszél angolul?", right: "Spreekt u Engels?" }, { id: "p3", left: "Nem értem", right: "Ik begrijp het niet" }] },
    { id: "nq291", type: "multiple_choice", prompt: "Mit jelent 'Wat betekent dat?'", options: [{ id: "o1", text: "Mit jelent ez?" }, { id: "o2", text: "Hol van?" }, { id: "o3", text: "Mennyibe kerül?" }], correctOptionId: "o1" } ] },
  { id: "nl98", title: "Vészmondatok", description: "Bel 112! Ik heb hulp nodig.", chapter: 20, xpReward: 20, questions: [
    { id: "nq292", type: "flashcard", prompt: "'Hívja a 112-t!'", backText: "Bel 112!", phonetic: "Bel hondert-tválf" },
    { id: "nq293", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Segítségre van szükségem", right: "Ik heb hulp nodig" }, { id: "p2", left: "Baleset történt", right: "Er is een ongeluk" }, { id: "p3", left: "Hívjon orvost!", right: "Bel een dokter!" }] },
    { id: "nq294", type: "multiple_choice", prompt: "Mit jelent 'Het is dringend'?", options: [{ id: "o1", text: "Sürgős" }, { id: "o2", text: "Ráér" }, { id: "o3", text: "Kész" }], correctOptionId: "o1" } ] },
  { id: "nl99", title: "Telefonálás", description: "Met… Kunt u terugbellen?", chapter: 20, xpReward: 20, questions: [
    { id: "nq295", type: "flashcard", prompt: "'…vagyok' (telefonban bemutatkozás)", backText: "Met…", phonetic: "Met" },
    { id: "nq296", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Visszahívna?", right: "Kunt u terugbellen?" }, { id: "p2", left: "Egy pillanat", right: "Een moment" }, { id: "p3", left: "Rossz számot hívott", right: "U heeft verkeerd verbonden" }] },
    { id: "nq297", type: "multiple_choice", prompt: "Mit jelent 'in gesprek'?", options: [{ id: "o1", text: "foglalt (a vonal)" }, { id: "o2", text: "kikapcsolva" }, { id: "o3", text: "csörög" }], correctOptionId: "o1" } ] },
  { id: "nl100", title: "Búcsú & jókívánság", description: "Fijne dag! Veel succes!", chapter: 20, xpReward: 20, questions: [
    { id: "nq298", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Szép napot!", right: "Fijne dag!" }, { id: "p2", left: "Sok sikert!", right: "Veel succes!" }, { id: "p3", left: "Jó hétvégét!", right: "Fijn weekend!" }] },
    { id: "nq299", type: "flashcard", prompt: "'Vigyázz magadra!'", backText: "Het beste!", phonetic: "Het beszte" },
    { id: "nq300", type: "multiple_choice", prompt: "Mit jelent 'Tot de volgende keer'?", options: [{ id: "o1", text: "A következő alkalomig" }, { id: "o2", text: "Jó éjt" }, { id: "o3", text: "Köszönöm" }], correctOptionId: "o1" } ] },
];
