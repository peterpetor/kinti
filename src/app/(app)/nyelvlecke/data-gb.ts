import type { Lesson } from "./data";

/**
 * Brit angol (British English) kurzus — az Angliában élő magyaroknak. A svájci
 * Mundart (data.ts), az osztrák (data-at.ts), a német (data-de.ts) és a holland
 * (data-nl.ts) ország-megfelelője, AZONOS terjedelemmel: 100 lecke, 20 fejezet
 * (5/fejezet), leckénként 3 kérdés.
 *
 * ⚠️ AMIBEN EZ MÁS, MINT A TÖBBI KURZUS: az angolt a legtöbb magyar TANULTA
 * valamennyire — itt nem a nulláról indulunk, hanem arra megyünk rá, ami az
 * ISKOLAI (jellemzően amerikaias) angol után ténylegesen meglepi az embert
 * Angliában: brit szóhasználat (flat, queue, cheers, fortnight), a hivatali
 * szókincs (NI number, council tax, GP, tenancy), a udvariassági fordulatok
 * („sorry" mindenre, „you alright?" mint köszönés) és a klasszikus
 * félrefordítások (pants ≠ nadrág).
 *
 * A lecke-id-k „gl" előtaggal, a kérdés-id-k „gq" előtaggal, hogy NE ütközzenek a
 * CH („l"/„q"), AT („al"/„aq"), DE („dl"/„dq") és NL („nl"/„nq") id-kkel.
 * A TTS en-GB.
 */
export const LESSONS_GB: Lesson[] = [
  // ══ 1. Fejezet: Alapok ══════════════════════════════
  { id: "gl1", title: "Köszönés", description: "Hello, Good morning, You alright?", chapter: 1, xpReward: 10, questions: [
    { id: "gq1", type: "multiple_choice", prompt: "Mit jelent hétköznapi brit köszönésként: 'You alright?'", options: [{ id: "o1", text: "Szia, hogy vagy?" }, { id: "o2", text: "Jól vagy? Rosszul nézel ki." }, { id: "o3", text: "Segítsek?" }], correctOptionId: "o1" },
    { id: "gq2", type: "flashcard", prompt: "Semleges köszönés délelőtt", backText: "Good morning", phonetic: "gud mórning" },
    { id: "gq3", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Jó reggelt", right: "Good morning" }, { id: "p2", left: "Jó estét", right: "Good evening" }, { id: "p3", left: "Szia (informális)", right: "Hiya" }] } ] },
  { id: "gl2", title: "Búcsúzás", description: "Bye, See you, Take care.", chapter: 1, xpReward: 10, questions: [
    { id: "gq4", type: "multiple_choice", prompt: "Melyik a leghétköznapibb brit búcsúzás?", options: [{ id: "o1", text: "Cheers, bye!" }, { id: "o2", text: "Farewell" }, { id: "o3", text: "Adieu" }], correctOptionId: "o1" },
    { id: "gq5", type: "flashcard", prompt: "'Vigyázz magadra' (kedves búcsú)", backText: "Take care", phonetic: "téjk keö" },
    { id: "gq6", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Viszlát később", right: "See you later" }, { id: "p2", left: "Holnap talizunk", right: "See you tomorrow" }, { id: "p3", left: "Szép napot!", right: "Have a good one" }] } ] },
  { id: "gl3", title: "Udvariasság", description: "Please, Thank you, Sorry.", chapter: 1, xpReward: 10, questions: [
    { id: "gq7", type: "multiple_choice", prompt: "⚠️ A britek mikor mondanak 'sorry'-t?", options: [{ id: "o1", text: "Szinte mindenre — ha nekimennek, ha nem értik, ha kérnek valamit" }, { id: "o2", text: "Csak komoly hibánál" }, { id: "o3", text: "Soha, udvariatlan" }], correctOptionId: "o1" },
    { id: "gq8", type: "flashcard", prompt: "'Köszönöm' informálisan (nagyon gyakori)", backText: "Cheers", phonetic: "csírz" },
    { id: "gq9", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Kérem", right: "Please" }, { id: "p2", left: "Nagyon köszönöm", right: "Thanks a lot" }, { id: "p3", left: "Elnézést (megszólítás)", right: "Excuse me" }] } ] },
  { id: "gl4", title: "Bemutatkozás", description: "I'm…, Nice to meet you.", chapter: 1, xpReward: 10, questions: [
    { id: "gq10", type: "multiple_choice", prompt: "Hogy kérdezed udvariasan: 'Hogy hívnak?'", options: [{ id: "o1", text: "What's your name?" }, { id: "o2", text: "Who are you?" }, { id: "o3", text: "How are you called?" }], correctOptionId: "o1" },
    { id: "gq11", type: "flashcard", prompt: "'Örvendek' (első találkozás)", backText: "Nice to meet you", phonetic: "nájsz tu mít jú" },
    { id: "gq12", type: "multiple_choice", prompt: "Mit jelent: 'Where are you from?'", options: [{ id: "o1", text: "Honnan jöttél?" }, { id: "o2", text: "Hol laksz?" }, { id: "o3", text: "Hova mész?" }], correctOptionId: "o1" } ] },
  { id: "gl5", title: "Igen, nem, talán", description: "Yes, no, maybe, I don't know.", chapter: 1, xpReward: 10, questions: [
    { id: "gq13", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Igen", right: "Yes" }, { id: "p2", left: "Nem", right: "No" }, { id: "p3", left: "Talán", right: "Maybe" }] },
    { id: "gq14", type: "flashcard", prompt: "'Nem tudom'", backText: "I don't know", phonetic: "áj dónt nó" },
    { id: "gq15", type: "multiple_choice", prompt: "Mit jelent: 'I'm not sure'?", options: [{ id: "o1", text: "Nem vagyok biztos benne" }, { id: "o2", text: "Nem érdekel" }, { id: "o3", text: "Nem értek egyet" }], correctOptionId: "o1" } ] },

  // ══ 2. Fejezet: Számok & idő ═════════════════════════
  { id: "gl6", title: "Számok 1–20", description: "one, two, three… twenty.", chapter: 2, xpReward: 10, questions: [
    { id: "gq16", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "három", right: "three" }, { id: "p2", left: "nyolc", right: "eight" }, { id: "p3", left: "tizenkettő", right: "twelve" }] },
    { id: "gq17", type: "flashcard", prompt: "'tizenöt'", backText: "fifteen", phonetic: "fiftín" },
    { id: "gq18", type: "multiple_choice", prompt: "Melyik a 'húsz'?", options: [{ id: "o1", text: "twenty" }, { id: "o2", text: "twelve" }, { id: "o3", text: "twenteen" }], correctOptionId: "o1" } ] },
  { id: "gl7", title: "Nagyobb számok", description: "hundred, thousand, million.", chapter: 2, xpReward: 10, questions: [
    { id: "gq19", type: "multiple_choice", prompt: "Hogy mondod: 250?", options: [{ id: "o1", text: "two hundred and fifty" }, { id: "o2", text: "two hundred fifty" }, { id: "o3", text: "twenty-five zero" }], correctOptionId: "o1" },
    { id: "gq20", type: "flashcard", prompt: "⚠️ Britül az 'and' KELL a százas után", backText: "one hundred and one (101)", phonetic: "van handred end van" },
    { id: "gq21", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "ezer", right: "thousand" }, { id: "p2", left: "millió", right: "million" }, { id: "p3", left: "fél", right: "half" }] } ] },
  { id: "gl8", title: "Óra", description: "What time is it? Half past, quarter to.", chapter: 2, xpReward: 10, questions: [
    { id: "gq22", type: "multiple_choice", prompt: "⚠️ Mit jelent 'half past seven'?", options: [{ id: "o1", text: "fél nyolc (7:30)" }, { id: "o2", text: "fél hét (6:30)" }, { id: "o3", text: "negyed nyolc" }], correctOptionId: "o1" },
    { id: "gq23", type: "flashcard", prompt: "'háromnegyed nyolc' (7:45)", backText: "quarter to eight", phonetic: "kvótö tu éjt" },
    { id: "gq24", type: "multiple_choice", prompt: "'Mennyi az idő?'", options: [{ id: "o1", text: "What time is it?" }, { id: "o2", text: "How much is the time?" }, { id: "o3", text: "Which hour?" }], correctOptionId: "o1" } ] },
  { id: "gl9", title: "A hét napjai", description: "Monday, Tuesday… Sunday.", chapter: 2, xpReward: 10, questions: [
    { id: "gq25", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "hétfő", right: "Monday" }, { id: "p2", left: "szerda", right: "Wednesday" }, { id: "p3", left: "szombat", right: "Saturday" }] },
    { id: "gq26", type: "flashcard", prompt: "'hétvége'", backText: "the weekend", phonetic: "dö víkend" },
    { id: "gq27", type: "multiple_choice", prompt: "Mit jelent: 'a fortnight'?", options: [{ id: "o1", text: "két hét" }, { id: "o2", text: "négy nap" }, { id: "o3", text: "egy éjszaka" }], correctOptionId: "o1" } ] },
  { id: "gl10", title: "Dátum", description: "Hónapok, évszámok, brit dátumforma.", chapter: 2, xpReward: 10, questions: [
    { id: "gq28", type: "multiple_choice", prompt: "⚠️ Mit jelent Angliában: 05/03/2026?", options: [{ id: "o1", text: "2026. március 5. (nap/hónap/év)" }, { id: "o2", text: "2026. május 3." }, { id: "o3", text: "2026. március 20." }], correctOptionId: "o1" },
    { id: "gq29", type: "flashcard", prompt: "'február'", backText: "February", phonetic: "februöri" },
    { id: "gq30", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "tegnap", right: "yesterday" }, { id: "p2", left: "ma", right: "today" }, { id: "p3", left: "holnap", right: "tomorrow" }] } ] },

  // ══ 3. Fejezet: Vásárlás & étterem ═══════════════════
  { id: "gl11", title: "Boltban", description: "How much is it? Card or cash?", chapter: 3, xpReward: 10, questions: [
    { id: "gq31", type: "multiple_choice", prompt: "'Mennyibe kerül?'", options: [{ id: "o1", text: "How much is it?" }, { id: "o2", text: "How many is it?" }, { id: "o3", text: "What costs it?" }], correctOptionId: "o1" },
    { id: "gq32", type: "flashcard", prompt: "'Kártyával fizetek'", backText: "I'll pay by card", phonetic: "ájl péj báj kád" },
    { id: "gq33", type: "multiple_choice", prompt: "Mit kérdez a pénztáros: 'Any cashback?'", options: [{ id: "o1", text: "Kérsz-e készpénzt is felvenni a kártyáddal?" }, { id: "o2", text: "Van-e visszajáród?" }, { id: "o3", text: "Kérsz-e visszatérítést?" }], correctOptionId: "o1" } ] },
  { id: "gl12", title: "Sorban állás", description: "⚠️ A queue szent.", chapter: 3, xpReward: 10, questions: [
    { id: "gq34", type: "multiple_choice", prompt: "Mit jelent 'queue'?", options: [{ id: "o1", text: "sor (várakozó)" }, { id: "o2", text: "kérdés" }, { id: "o3", text: "pult" }], correctOptionId: "o1" },
    { id: "gq35", type: "flashcard", prompt: "'Ön az utolsó a sorban?'", backText: "Are you last in the queue?", phonetic: "á jú lászt in dö kjú" },
    { id: "gq36", type: "multiple_choice", prompt: "⚠️ Mi a 'queue jumping'?", options: [{ id: "o1", text: "Besorolás — komoly társadalmi sértés" }, { id: "o2", text: "Gyorsított sor fizetésért" }, { id: "o3", text: "Sorban ugrálás játékból" }], correctOptionId: "o1" } ] },
  { id: "gl13", title: "Étteremben", description: "Table for two, the bill please.", chapter: 3, xpReward: 10, questions: [
    { id: "gq37", type: "multiple_choice", prompt: "⚠️ Hogy kéred a számlát britül?", options: [{ id: "o1", text: "Can I have the bill, please?" }, { id: "o2", text: "Can I have the check, please?" }, { id: "o3", text: "Give me the account" }], correctOptionId: "o1" },
    { id: "gq38", type: "flashcard", prompt: "'Asztalt szeretnénk két főre'", backText: "A table for two, please", phonetic: "ö téjbl fó tú plíz" },
    { id: "gq39", type: "multiple_choice", prompt: "Mit jelent 'service charge'?", options: [{ id: "o1", text: "A számlához adott szervizdíj (gyakran 12,5%)" }, { id: "o2", text: "Belépődíj" }, { id: "o3", text: "Foglalási díj" }], correctOptionId: "o1" } ] },
  { id: "gl14", title: "Pubban", description: "A pint, a round, last orders.", chapter: 3, xpReward: 10, questions: [
    { id: "gq40", type: "multiple_choice", prompt: "Mit jelent 'a pint'?", options: [{ id: "o1", text: "Kb. 0,57 liter sör" }, { id: "o2", text: "Fél liter" }, { id: "o3", text: "Egy korty" }], correctOptionId: "o1" },
    { id: "gq41", type: "flashcard", prompt: "'Én fizetem ezt a kört'", backText: "It's my round", phonetic: "itsz máj raund" },
    { id: "gq42", type: "multiple_choice", prompt: "Mit jelent 'last orders'?", options: [{ id: "o1", text: "Utolsó rendelés zárás előtt" }, { id: "o2", text: "Legutóbbi rendelésed" }, { id: "o3", text: "Rendelési sorrend" }], correctOptionId: "o1" } ] },
  { id: "gl15", title: "Panasz & csere", description: "Refund, exchange, receipt.", chapter: 3, xpReward: 10, questions: [
    { id: "gq43", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "blokk / nyugta", right: "receipt" }, { id: "p2", left: "visszatérítés", right: "refund" }, { id: "p3", left: "csere", right: "exchange" }] },
    { id: "gq44", type: "flashcard", prompt: "'Szeretném visszavinni ezt'", backText: "I'd like to return this", phonetic: "ájd lájk tu ritörn disz" },
    { id: "gq45", type: "multiple_choice", prompt: "Mit jelent 'faulty'?", options: [{ id: "o1", text: "hibás / meghibásodott" }, { id: "o2", text: "használt" }, { id: "o3", text: "leértékelt" }], correctOptionId: "o1" } ] },

  // ══ 4. Fejezet: Hivatal, munka, egészség ═════════════
  { id: "gl16", title: "National Insurance", description: "NI number — a brit azonosító.", chapter: 4, xpReward: 10, questions: [
    { id: "gq46", type: "multiple_choice", prompt: "Mire kell a National Insurance number?", options: [{ id: "o1", text: "Munkához, adóhoz, nyugdíjhoz" }, { id: "o2", text: "Az autó biztosításához" }, { id: "o3", text: "A lakásbérléshez" }], correctOptionId: "o1" },
    { id: "gq47", type: "flashcard", prompt: "'Igényeltem a NI-számot'", backText: "I've applied for my NI number", phonetic: "ájv eplájd fó máj en-áj namber" },
    { id: "gq48", type: "multiple_choice", prompt: "⚠️ Dolgozhatsz-e, amíg megjön a NI-szám?", options: [{ id: "o1", text: "Igen, ha van munkavállalási jogod — csak szólj a munkáltatónak" }, { id: "o2", text: "Nem, tilos" }, { id: "o3", text: "Csak részmunkaidőben" }], correctOptionId: "o1" } ] },
  { id: "gl17", title: "Orvosnál (GP)", description: "Register with a GP, book an appointment.", chapter: 4, xpReward: 10, questions: [
    { id: "gq49", type: "multiple_choice", prompt: "Ki a 'GP'?", options: [{ id: "o1", text: "A háziorvos — az NHS kapuja" }, { id: "o2", text: "Az ügyeletes szakorvos" }, { id: "o3", text: "A gyógyszerész" }], correctOptionId: "o1" },
    { id: "gq50", type: "flashcard", prompt: "'Szeretnék időpontot kérni'", backText: "I'd like to book an appointment", phonetic: "ájd lájk tu buk en epojntment" },
    { id: "gq51", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "beutaló", right: "referral" }, { id: "p2", left: "recept", right: "prescription" }, { id: "p3", left: "sürgősségi", right: "A&E" }] } ] },
  { id: "gl18", title: "Munkahelyi alapok", description: "Shift, payslip, holiday.", chapter: 4, xpReward: 10, questions: [
    { id: "gq52", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "műszak", right: "shift" }, { id: "p2", left: "bérpapír", right: "payslip" }, { id: "p3", left: "szabadság", right: "holiday" }] },
    { id: "gq53", type: "flashcard", prompt: "'Túlóra'", backText: "overtime", phonetic: "óvötájm" },
    { id: "gq54", type: "multiple_choice", prompt: "Mit jelent 'zero-hours contract'?", options: [{ id: "o1", text: "Nincs garantált óraszám — csak amennyit hívnak" }, { id: "o2", text: "Ingyenmunka" }, { id: "o3", text: "Nulla túlóra engedélyezett" }], correctOptionId: "o1" } ] },
  { id: "gl19", title: "Hivatali szavak", description: "Council, tenancy, benefit.", chapter: 4, xpReward: 10, questions: [
    { id: "gq55", type: "multiple_choice", prompt: "Mi az a 'council'?", options: [{ id: "o1", text: "A helyi önkormányzat" }, { id: "o2", text: "A parlament" }, { id: "o3", text: "A bíróság" }], correctOptionId: "o1" },
    { id: "gq56", type: "flashcard", prompt: "'lakcímigazolás'", backText: "proof of address", phonetic: "prúf ov edresz" },
    { id: "gq57", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bérleti szerződés", right: "tenancy agreement" }, { id: "p2", left: "kaució", right: "deposit" }, { id: "p3", left: "helyi adó", right: "council tax" }] } ] },
  { id: "gl20", title: "Segítségkérés", description: "Can you help me? I don't understand.", chapter: 4, xpReward: 10, questions: [
    { id: "gq58", type: "flashcard", prompt: "'Tudna segíteni?'", backText: "Could you help me, please?", phonetic: "kud jú help mí plíz" },
    { id: "gq59", type: "multiple_choice", prompt: "'Nem értem, elmondaná lassabban?'", options: [{ id: "o1", text: "Sorry, could you say that more slowly?" }, { id: "o2", text: "Speak slow!" }, { id: "o3", text: "I no understand" }], correctOptionId: "o1" },
    { id: "gq60", type: "flashcard", prompt: "'Nem beszélek jól angolul'", backText: "I don't speak much English", phonetic: "áj dónt szpík macs inglis" } ] },

  // ══ 5. Fejezet: Emberek & érzések ════════════════════
  { id: "gl21", title: "Család", description: "Mum, dad, siblings, partner.", chapter: 5, xpReward: 10, questions: [
    { id: "gq61", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "anya", right: "mum" }, { id: "p2", left: "apa", right: "dad" }, { id: "p3", left: "testvér", right: "sibling" }] },
    { id: "gq62", type: "flashcard", prompt: "'élettárs / partner'", backText: "partner", phonetic: "pátnö" },
    { id: "gq63", type: "multiple_choice", prompt: "Mit jelent 'in-laws'?", options: [{ id: "o1", text: "Após-anyós, házastárs rokonai" }, { id: "o2", text: "Ügyvédek" }, { id: "o3", text: "Szomszédok" }], correctOptionId: "o1" } ] },
  { id: "gl22", title: "Érzések", description: "Happy, tired, stressed, fine.", chapter: 5, xpReward: 10, questions: [
    { id: "gq64", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "fáradt", right: "tired" }, { id: "p2", left: "boldog", right: "happy" }, { id: "p3", left: "ideges", right: "nervous" }] },
    { id: "gq65", type: "flashcard", prompt: "'Kimerült vagyok'", backText: "I'm knackered", phonetic: "ájm nekörd" },
    { id: "gq66", type: "multiple_choice", prompt: "⚠️ Ha valaki 'not bad'-et mond, az…", options: [{ id: "o1", text: "…britül kifejezetten jót jelent" }, { id: "o2", text: "…azt jelenti, rossz" }, { id: "o3", text: "…közömbösséget jelez" }], correctOptionId: "o1" } ] },
  { id: "gl23", title: "Small talk", description: "⚠️ Az időjárás nem üres duma.", chapter: 5, xpReward: 10, questions: [
    { id: "gq67", type: "multiple_choice", prompt: "Miért beszélnek a britek folyton az időjárásról?", options: [{ id: "o1", text: "Semleges, biztonságos társalgás-nyitó" }, { id: "o2", text: "Mert érdekli őket a meteorológia" }, { id: "o3", text: "Mert nem tudnak másról beszélni" }], correctOptionId: "o1" },
    { id: "gq68", type: "flashcard", prompt: "'Szörnyű idő van, ugye?'", backText: "Horrible weather, isn't it?", phonetic: "horibl vedö iznt it" },
    { id: "gq69", type: "multiple_choice", prompt: "Mit jelent 'How's it going?'", options: [{ id: "o1", text: "Hogy s mint? (köszönés, nem valódi kérdés)" }, { id: "o2", text: "Hova mész?" }, { id: "o3", text: "Működik?" }], correctOptionId: "o1" } ] },
  { id: "gl24", title: "Udvarias kérés", description: "⚠️ A brit körülírás.", chapter: 5, xpReward: 10, questions: [
    { id: "gq70", type: "multiple_choice", prompt: "⚠️ Mit jelent valójában: 'I might be wrong, but…'", options: [{ id: "o1", text: "Biztos vagyok benne, hogy igazam van" }, { id: "o2", text: "Tényleg bizonytalan" }, { id: "o3", text: "Bocsánatot kér" }], correctOptionId: "o1" },
    { id: "gq71", type: "flashcard", prompt: "Udvarias kérés-forma", backText: "Would you mind…?", phonetic: "vud jú májnd" },
    { id: "gq72", type: "multiple_choice", prompt: "⚠️ Mit jelent munkahelyen: 'That's an interesting idea'?", options: [{ id: "o1", text: "Gyakran udvarias elutasítás" }, { id: "o2", text: "Nagyon tetszik neki" }, { id: "o3", text: "Nem értette" }], correctOptionId: "o1" } ] },
  { id: "gl25", title: "Barátkozás", description: "Mate, cheers, fancy a coffee?", chapter: 5, xpReward: 10, questions: [
    { id: "gq73", type: "multiple_choice", prompt: "Mit jelent 'mate'?", options: [{ id: "o1", text: "Haver / pajtás (barátságos megszólítás)" }, { id: "o2", text: "Házastárs" }, { id: "o3", text: "Kolléga hivatalosan" }], correctOptionId: "o1" },
    { id: "gq74", type: "flashcard", prompt: "'Van kedved egy kávéhoz?'", backText: "Fancy a coffee?", phonetic: "fenszi ö kofi" },
    { id: "gq75", type: "multiple_choice", prompt: "Mit jelent 'Let's have a catch-up'?", options: [{ id: "o1", text: "Beszéljük meg, mi újság" }, { id: "o2", text: "Utolérünk valakit" }, { id: "o3", text: "Pótoljuk a lemaradást a munkában" }], correctOptionId: "o1" } ] },

  // ══ 6. Fejezet: Test & egészség ══════════════════════
  { id: "gl26", title: "Testrészek", description: "Head, back, stomach, throat.", chapter: 6, xpReward: 10, questions: [
    { id: "gq76", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "fej", right: "head" }, { id: "p2", left: "hát", right: "back" }, { id: "p3", left: "torok", right: "throat" }] },
    { id: "gq77", type: "flashcard", prompt: "'gyomor / has'", backText: "stomach", phonetic: "sztamök" },
    { id: "gq78", type: "multiple_choice", prompt: "Melyik a 'boka'?", options: [{ id: "o1", text: "ankle" }, { id: "o2", text: "elbow" }, { id: "o3", text: "wrist" }], correctOptionId: "o1" } ] },
  { id: "gl27", title: "Tünetek", description: "It hurts, I feel sick.", chapter: 6, xpReward: 10, questions: [
    { id: "gq79", type: "flashcard", prompt: "'Fáj a torkom'", backText: "I have a sore throat", phonetic: "áj hev ö szó thrót" },
    { id: "gq80", type: "multiple_choice", prompt: "⚠️ Mit jelent 'I feel sick' britül?", options: [{ id: "o1", text: "Hányingerem van" }, { id: "o2", text: "Beteg vagyok általában" }, { id: "o3", text: "Rosszkedvű vagyok" }], correctOptionId: "o1" },
    { id: "gq81", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "láz", right: "fever / temperature" }, { id: "p2", left: "köhögés", right: "cough" }, { id: "p3", left: "kiütés", right: "rash" }] } ] },
  { id: "gl28", title: "Gyógyszertár", description: "Pharmacy, chemist, painkiller.", chapter: 6, xpReward: 10, questions: [
    { id: "gq82", type: "multiple_choice", prompt: "⚠️ Mi a 'chemist' britül?", options: [{ id: "o1", text: "Gyógyszertár (pharmacy)" }, { id: "o2", text: "Vegyész" }, { id: "o3", text: "Drogéria kizárólag" }], correctOptionId: "o1" },
    { id: "gq83", type: "flashcard", prompt: "'fájdalomcsillapító'", backText: "painkiller", phonetic: "péjnkilö" },
    { id: "gq84", type: "multiple_choice", prompt: "Mit jelent 'over the counter'?", options: [{ id: "o1", text: "Recept nélkül kapható" }, { id: "o2", text: "A pult mögött" }, { id: "o3", text: "Kifizetve" }], correctOptionId: "o1" } ] },
  { id: "gl29", title: "Sürgősség", description: "999, ambulance, A&E.", chapter: 6, xpReward: 10, questions: [
    { id: "gq85", type: "multiple_choice", prompt: "Melyik szám a sürgősségi Angliában?", options: [{ id: "o1", text: "999 (a 112 is működik)" }, { id: "o2", text: "911" }, { id: "o3", text: "110" }], correctOptionId: "o1" },
    { id: "gq86", type: "flashcard", prompt: "'Mentőt kérek!'", backText: "I need an ambulance!", phonetic: "áj níd en embjulönsz" },
    { id: "gq87", type: "multiple_choice", prompt: "Mit hívsz, ha NEM sürgős, de tanács kell?", options: [{ id: "o1", text: "NHS 111" }, { id: "o2", text: "101" }, { id: "o3", text: "999" }], correctOptionId: "o1" } ] },
  { id: "gl30", title: "Fogorvos & szemész", description: "Dentist, optician, check-up.", chapter: 6, xpReward: 10, questions: [
    { id: "gq88", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "fogorvos", right: "dentist" }, { id: "p2", left: "szemész / optikus", right: "optician" }, { id: "p3", left: "szűrővizsgálat", right: "check-up" }] },
    { id: "gq89", type: "flashcard", prompt: "'Fáj a fogam'", backText: "I have toothache", phonetic: "áj hev túthéjk" },
    { id: "gq90", type: "multiple_choice", prompt: "⚠️ Mi igaz az NHS-fogászatra?", options: [{ id: "o1", text: "Támogatott, sávos díjas — de nehéz szabad helyet találni" }, { id: "o2", text: "Teljesen ingyenes mindenkinek" }, { id: "o3", text: "Nem létezik" }], correctOptionId: "o1" } ] },

  // ══ 7. Fejezet: Otthon & szolgáltatások ══════════════
  { id: "gl31", title: "Lakásrészek", description: "⚠️ Flat, nem apartment.", chapter: 7, xpReward: 10, questions: [
    { id: "gq91", type: "multiple_choice", prompt: "⚠️ Hogy mondod britül: 'lakás'?", options: [{ id: "o1", text: "flat" }, { id: "o2", text: "apartment" }, { id: "o3", text: "condo" }], correctOptionId: "o1" },
    { id: "gq92", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "konyha", right: "kitchen" }, { id: "p2", left: "nappali", right: "living room" }, { id: "p3", left: "fürdőszoba", right: "bathroom" }] },
    { id: "gq93", type: "flashcard", prompt: "'kert'", backText: "garden", phonetic: "gádn" } ] },
  { id: "gl32", title: "Rezsi", description: "Bills, meter reading, standing charge.", chapter: 7, xpReward: 10, questions: [
    { id: "gq94", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "rezsiszámla", right: "utility bill" }, { id: "p2", left: "mérőóra-állás", right: "meter reading" }, { id: "p3", left: "alapdíj", right: "standing charge" }] },
    { id: "gq95", type: "flashcard", prompt: "'Le szeretném olvasni a mérőórát'", backText: "I'd like to submit a meter reading", phonetic: "ájd lájk tu szabmit ö mítör rídink" },
    { id: "gq96", type: "multiple_choice", prompt: "Mit jelent 'direct debit'?", options: [{ id: "o1", text: "Csoportos beszedési megbízás" }, { id: "o2", text: "Készpénzes fizetés" }, { id: "o3", text: "Egyszeri átutalás" }], correctOptionId: "o1" } ] },
  { id: "gl33", title: "Javítás", description: "Landlord, repair, boiler.", chapter: 7, xpReward: 10, questions: [
    { id: "gq97", type: "multiple_choice", prompt: "Ki a 'landlord'?", options: [{ id: "o1", text: "A bérbeadó / főbérlő" }, { id: "o2", text: "A szomszéd" }, { id: "o3", text: "Az ingatlanos" }], correctOptionId: "o1" },
    { id: "gq98", type: "flashcard", prompt: "'Elromlott a kazán'", backText: "The boiler has broken down", phonetic: "dö bojlö hez brókn daun" },
    { id: "gq99", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "penész", right: "mould" }, { id: "p2", left: "beázás", right: "leak" }, { id: "p3", left: "fűtés", right: "heating" }] } ] },
  { id: "gl34", title: "Szomszédság", description: "Bins, recycling, noise.", chapter: 7, xpReward: 10, questions: [
    { id: "gq100", type: "multiple_choice", prompt: "Mit jelent 'bin day'?", options: [{ id: "o1", text: "A szemétszállítás napja — ki kell tenni a kukát" }, { id: "o2", text: "Nagytakarítás" }, { id: "o3", text: "Lomtalanítás évente" }], correctOptionId: "o1" },
    { id: "gq101", type: "flashcard", prompt: "'újrahasznosítás'", backText: "recycling", phonetic: "riszájkling" },
    { id: "gq102", type: "multiple_choice", prompt: "Kihez fordulsz tartós zajpanasszal?", options: [{ id: "o1", text: "A council (önkormányzat) noise teamjéhez" }, { id: "o2", text: "A rendőrséghez 999-en" }, { id: "o3", text: "Az NHS-hez" }], correctOptionId: "o1" } ] },
  { id: "gl35", title: "Internet & mobil", description: "Broadband, contract, PAC code.", chapter: 7, xpReward: 10, questions: [
    { id: "gq103", type: "multiple_choice", prompt: "Mi a 'broadband'?", options: [{ id: "o1", text: "Otthoni internet" }, { id: "o2", text: "Rádióadás" }, { id: "o3", text: "Mobilhálózat" }], correctOptionId: "o1" },
    { id: "gq104", type: "flashcard", prompt: "⚠️ Számhordozáshoz kért kód", backText: "PAC code", phonetic: "pek kód" },
    { id: "gq105", type: "multiple_choice", prompt: "Mit jelent 'out of contract'?", options: [{ id: "o1", text: "Lejárt a hűségidő — válthatsz vagy alkudhatsz" }, { id: "o2", text: "Felmondták a szerződést" }, { id: "o3", text: "Nincs lefedettség" }], correctOptionId: "o1" } ] },

  // ══ 8. Fejezet: Étel részletesen ═════════════════════
  { id: "gl36", title: "Alapélelmiszer", description: "Bread, milk, eggs, cheese.", chapter: 8, xpReward: 10, questions: [
    { id: "gq106", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kenyér", right: "bread" }, { id: "p2", left: "tej", right: "milk" }, { id: "p3", left: "tojás", right: "eggs" }] },
    { id: "gq107", type: "flashcard", prompt: "'liszt'", backText: "flour", phonetic: "flauö" },
    { id: "gq108", type: "multiple_choice", prompt: "Melyik a 'tejföl'?", options: [{ id: "o1", text: "soured cream" }, { id: "o2", text: "double cream" }, { id: "o3", text: "custard" }], correctOptionId: "o1" } ] },
  { id: "gl37", title: "Hús & hal", description: "Beef, pork, chicken, mince.", chapter: 8, xpReward: 10, questions: [
    { id: "gq109", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "marha", right: "beef" }, { id: "p2", left: "sertés", right: "pork" }, { id: "p3", left: "csirke", right: "chicken" }] },
    { id: "gq110", type: "flashcard", prompt: "'darált hús'", backText: "mince", phonetic: "minsz" },
    { id: "gq111", type: "multiple_choice", prompt: "Mit jelent 'gammon'?", options: [{ id: "o1", text: "Füstölt/pácolt sonkaszelet" }, { id: "o2", text: "Bárányhús" }, { id: "o3", text: "Hal" }], correctOptionId: "o1" } ] },
  { id: "gl38", title: "Zöldség & gyümölcs", description: "Veg, fruit, aubergine, courgette.", chapter: 8, xpReward: 10, questions: [
    { id: "gq112", type: "multiple_choice", prompt: "⚠️ Mi a 'padlizsán' britül?", options: [{ id: "o1", text: "aubergine" }, { id: "o2", text: "eggplant" }, { id: "o3", text: "zucchini" }], correctOptionId: "o1" },
    { id: "gq113", type: "flashcard", prompt: "⚠️ 'cukkini' britül", backText: "courgette", phonetic: "kúzsett" },
    { id: "gq114", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "burgonya", right: "potato" }, { id: "p2", left: "hagyma", right: "onion" }, { id: "p3", left: "paprika", right: "pepper" }] } ] },
  { id: "gl39", title: "Brit ételek", description: "Roast, fry-up, fish and chips.", chapter: 8, xpReward: 10, questions: [
    { id: "gq115", type: "multiple_choice", prompt: "Mi a 'Sunday roast'?", options: [{ id: "o1", text: "Vasárnapi sült hús körettel és Yorkshire puddinggal" }, { id: "o2", text: "Vasárnapi piac" }, { id: "o3", text: "Egy édesség" }], correctOptionId: "o1" },
    { id: "gq116", type: "flashcard", prompt: "'angol reggeli'", backText: "full English breakfast", phonetic: "ful inglis brekföszt" },
    { id: "gq117", type: "multiple_choice", prompt: "Mi a 'mushy peas'?", options: [{ id: "o1", text: "Pépesített zöldborsó — a fish and chips klasszikus kísérője" }, { id: "o2", text: "Borsóleves" }, { id: "o3", text: "Édesség" }], correctOptionId: "o1" } ] },
  { id: "gl40", title: "Étrend & allergia", description: "Vegetarian, vegan, allergy.", chapter: 8, xpReward: 10, questions: [
    { id: "gq118", type: "flashcard", prompt: "'Vegetáriánus vagyok'", backText: "I'm vegetarian", phonetic: "ájm vedzsetéörien" },
    { id: "gq119", type: "multiple_choice", prompt: "'Allergiás vagyok a mogyoróra'", options: [{ id: "o1", text: "I'm allergic to nuts" }, { id: "o2", text: "I have allergy from nuts" }, { id: "o3", text: "Nuts make me allergy" }], correctOptionId: "o1" },
    { id: "gq120", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "gluténmentes", right: "gluten-free" }, { id: "p2", left: "laktózmentes", right: "dairy-free" }, { id: "p3", left: "cukormentes", right: "sugar-free" }] } ] },

  // ══ 9. Fejezet: Ruházat & boltok ═════════════════════
  { id: "gl41", title: "Ruhadarabok", description: "⚠️ Trousers, nem pants!", chapter: 9, xpReward: 10, questions: [
    { id: "gq121", type: "multiple_choice", prompt: "⚠️ Mit jelent britül a 'pants'?", options: [{ id: "o1", text: "Alsónadrág" }, { id: "o2", text: "Nadrág" }, { id: "o3", text: "Zokni" }], correctOptionId: "o1" },
    { id: "gq122", type: "flashcard", prompt: "'nadrág' britül", backText: "trousers", phonetic: "trauzöz" },
    { id: "gq123", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kabát", right: "coat" }, { id: "p2", left: "cipő", right: "shoes" }, { id: "p3", left: "pulóver", right: "jumper" }] } ] },
  { id: "gl42", title: "Méret & próba", description: "Size, fitting room, try on.", chapter: 9, xpReward: 10, questions: [
    { id: "gq124", type: "flashcard", prompt: "'Felpróbálhatom?'", backText: "Can I try this on?", phonetic: "ken áj tráj disz on" },
    { id: "gq125", type: "multiple_choice", prompt: "Hol a 'fitting room'?", options: [{ id: "o1", text: "Próbafülke" }, { id: "o2", text: "Raktár" }, { id: "o3", text: "Pénztár" }], correctOptionId: "o1" },
    { id: "gq126", type: "multiple_choice", prompt: "Mit jelent 'It doesn't fit'?", options: [{ id: "o1", text: "Nem jó rám (méret)" }, { id: "o2", text: "Nem tetszik" }, { id: "o3", text: "Nincs raktáron" }], correctOptionId: "o1" } ] },
  { id: "gl43", title: "Boltok", description: "High street, corner shop, charity shop.", chapter: 9, xpReward: 10, questions: [
    { id: "gq127", type: "multiple_choice", prompt: "Mi a 'charity shop'?", options: [{ id: "o1", text: "Jótékonysági használtcikk-bolt — nagyon elterjedt" }, { id: "o2", text: "Adománygyűjtő pont" }, { id: "o3", text: "Ingyenkonyha" }], correctOptionId: "o1" },
    { id: "gq128", type: "flashcard", prompt: "'a főutca / bevásárlóutca'", backText: "the high street", phonetic: "dö háj sztrít" },
    { id: "gq129", type: "multiple_choice", prompt: "Mi a 'corner shop'?", options: [{ id: "o1", text: "Kis sarki vegyesbolt, hosszú nyitvatartással" }, { id: "o2", text: "Sarki gyógyszertár" }, { id: "o3", text: "Bevásárlóközpont" }], correctOptionId: "o1" } ] },
  { id: "gl44", title: "Akciók", description: "Sale, BOGOF, clearance.", chapter: 9, xpReward: 10, questions: [
    { id: "gq130", type: "multiple_choice", prompt: "Mit jelent 'BOGOF'?", options: [{ id: "o1", text: "Buy One Get One Free — egyet fizet, kettőt kap" }, { id: "o2", text: "Kiárusítás" }, { id: "o3", text: "Törzsvásárlói kedvezmény" }], correctOptionId: "o1" },
    { id: "gq131", type: "flashcard", prompt: "'végkiárusítás'", backText: "clearance sale", phonetic: "kliörönsz széjl" },
    { id: "gq132", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kedvezmény", right: "discount" }, { id: "p2", left: "féláron", right: "half price" }, { id: "p3", left: "ingyenes", right: "free" }] } ] },
  { id: "gl45", title: "Online rendelés", description: "Delivery, click and collect, returns.", chapter: 9, xpReward: 10, questions: [
    { id: "gq133", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kiszállítás", right: "delivery" }, { id: "p2", left: "átvétel boltban", right: "click and collect" }, { id: "p3", left: "visszaküldés", right: "returns" }] },
    { id: "gq134", type: "flashcard", prompt: "'Nyomon követés' (csomag)", backText: "tracking", phonetic: "treking" },
    { id: "gq135", type: "multiple_choice", prompt: "Mit jelent 'next day delivery'?", options: [{ id: "o1", text: "Másnapi kiszállítás" }, { id: "o2", text: "Két munkanap" }, { id: "o3", text: "Aznapi" }], correctOptionId: "o1" } ] },

  // ══ 10. Fejezet: Munka részletesen ═══════════════════
  { id: "gl46", title: "Álláskeresés", description: "Job advert, CV, cover letter.", chapter: 10, xpReward: 10, questions: [
    { id: "gq136", type: "multiple_choice", prompt: "⚠️ Mi a helyes brit szó az önéletrajzra?", options: [{ id: "o1", text: "CV" }, { id: "o2", text: "resume" }, { id: "o3", text: "biography" }], correctOptionId: "o1" },
    { id: "gq137", type: "flashcard", prompt: "'motivációs levél'", backText: "cover letter", phonetic: "kavör letö" },
    { id: "gq138", type: "multiple_choice", prompt: "⚠️ Mi NE legyen a brit CV-n?", options: [{ id: "o1", text: "Fénykép és születési dátum" }, { id: "o2", text: "Munkatapasztalat" }, { id: "o3", text: "Elérhetőség" }], correctOptionId: "o1" } ] },
  { id: "gl47", title: "Állásinterjú", description: "Interview, strengths, notice period.", chapter: 10, xpReward: 10, questions: [
    { id: "gq139", type: "flashcard", prompt: "'Mesélj magadról'", backText: "Tell me about yourself", phonetic: "tel mí öbaut jószelf" },
    { id: "gq140", type: "multiple_choice", prompt: "Mit jelent 'notice period'?", options: [{ id: "o1", text: "Felmondási idő a jelenlegi munkahelyen" }, { id: "o2", text: "Próbaidő" }, { id: "o3", text: "Értesítési határidő" }], correctOptionId: "o1" },
    { id: "gq141", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "erősségek", right: "strengths" }, { id: "p2", left: "gyengeségek", right: "weaknesses" }, { id: "p3", left: "tapasztalat", right: "experience" }] } ] },
  { id: "gl48", title: "Szerződés", description: "Contract, probation, full-time.", chapter: 10, xpReward: 10, questions: [
    { id: "gq142", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "teljes munkaidő", right: "full-time" }, { id: "p2", left: "részmunkaidő", right: "part-time" }, { id: "p3", left: "próbaidő", right: "probation" }] },
    { id: "gq143", type: "flashcard", prompt: "'határozatlan idejű szerződés'", backText: "permanent contract", phonetic: "pörmönönt kontrekt" },
    { id: "gq144", type: "multiple_choice", prompt: "Mit jelent 'agency worker'?", options: [{ id: "o1", text: "Munkaerő-kölcsönzőn keresztül dolgozó" }, { id: "o2", text: "Ügynök" }, { id: "o3", text: "Önfoglalkoztató" }], correctOptionId: "o1" } ] },
  { id: "gl49", title: "Fizetés", description: "Payslip, gross, net, PAYE.", chapter: 10, xpReward: 10, questions: [
    { id: "gq145", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bruttó", right: "gross" }, { id: "p2", left: "nettó", right: "net / take-home" }, { id: "p3", left: "levonás", right: "deduction" }] },
    { id: "gq146", type: "flashcard", prompt: "⚠️ Az adószámod helyett ez van a payslipen", backText: "tax code", phonetic: "teksz kód" },
    { id: "gq147", type: "multiple_choice", prompt: "Mi a 'P45'?", options: [{ id: "o1", text: "A kilépéskor kapott igazolás — az új munkáltatónak kell" }, { id: "o2", text: "Éves adóösszesítő" }, { id: "o3", text: "Munkaszerződés" }], correctOptionId: "o1" } ] },
  { id: "gl50", title: "Munkahelyi konfliktus", description: "Grievance, ACAS, unfair dismissal.", chapter: 10, xpReward: 10, questions: [
    { id: "gq148", type: "multiple_choice", prompt: "Hova fordulsz munkaügyi vitával?", options: [{ id: "o1", text: "ACAS (ingyenes tanácsadás), majd Employment Tribunal" }, { id: "o2", text: "Rendőrség" }, { id: "o3", text: "NHS" }], correctOptionId: "o1" },
    { id: "gq149", type: "flashcard", prompt: "'jogtalan elbocsátás'", backText: "unfair dismissal", phonetic: "anfeö diszmiszöl" },
    { id: "gq150", type: "multiple_choice", prompt: "Mit jelent 'to raise a grievance'?", options: [{ id: "o1", text: "Hivatalos panaszt tenni a munkáltatónál" }, { id: "o2", text: "Felmondani" }, { id: "o3", text: "Fizetésemelést kérni" }], correctOptionId: "o1" } ] },
  // ══ 11. Fejezet: Naptár & idő ════════════════════════
  { id: "gl51", title: "Napszakok", description: "Morning, afternoon, evening, night.", chapter: 11, xpReward: 10, questions: [
    { id: "gq151", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "délelőtt", right: "morning" }, { id: "p2", left: "délután", right: "afternoon" }, { id: "p3", left: "este", right: "evening" }] },
    { id: "gq152", type: "flashcard", prompt: "'hajnalban'", backText: "at dawn / early morning", phonetic: "et dón" },
    { id: "gq153", type: "multiple_choice", prompt: "Mit jelent 'tonight'?", options: [{ id: "o1", text: "ma este / ma éjjel" }, { id: "o2", text: "tegnap este" }, { id: "o3", text: "minden este" }], correctOptionId: "o1" } ] },
  { id: "gl52", title: "Gyakoriság", description: "Always, often, sometimes, never.", chapter: 11, xpReward: 10, questions: [
    { id: "gq154", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "mindig", right: "always" }, { id: "p2", left: "gyakran", right: "often" }, { id: "p3", left: "soha", right: "never" }] },
    { id: "gq155", type: "flashcard", prompt: "'hetente egyszer'", backText: "once a week", phonetic: "vansz ö vík" },
    { id: "gq156", type: "multiple_choice", prompt: "Mit jelent 'every other day'?", options: [{ id: "o1", text: "Minden második nap" }, { id: "o2", text: "Minden nap" }, { id: "o3", text: "A hét többi napján" }], correctOptionId: "o1" } ] },
  { id: "gl53", title: "Ünnepnapok", description: "⚠️ Bank holiday.", chapter: 11, xpReward: 10, questions: [
    { id: "gq157", type: "multiple_choice", prompt: "Mit jelent 'bank holiday'?", options: [{ id: "o1", text: "Munkaszüneti nap (nem csak a bankoknak)" }, { id: "o2", text: "Bankszünnap" }, { id: "o3", text: "Fizetési határidő" }], correctOptionId: "o1" },
    { id: "gq158", type: "flashcard", prompt: "'karácsony másnapja' (dec. 26.)", backText: "Boxing Day", phonetic: "boksing déj" },
    { id: "gq159", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "karácsony", right: "Christmas" }, { id: "p2", left: "húsvét", right: "Easter" }, { id: "p3", left: "szilveszter", right: "New Year's Eve" }] } ] },
  { id: "gl54", title: "Időjárás", description: "Rain, drizzle, chilly, sunny spells.", chapter: 11, xpReward: 10, questions: [
    { id: "gq160", type: "multiple_choice", prompt: "Mit jelent 'drizzle'?", options: [{ id: "o1", text: "Szitáló eső — a brit alapjárat" }, { id: "o2", text: "Zivatar" }, { id: "o3", text: "Havazás" }], correctOptionId: "o1" },
    { id: "gq161", type: "flashcard", prompt: "'hűvös'", backText: "chilly", phonetic: "csili" },
    { id: "gq162", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "napos", right: "sunny" }, { id: "p2", left: "felhős", right: "cloudy" }, { id: "p3", left: "szeles", right: "windy" }] } ] },
  { id: "gl55", title: "Időpontegyeztetés", description: "Are you free? Does that suit you?", chapter: 11, xpReward: 10, questions: [
    { id: "gq163", type: "flashcard", prompt: "'Ráérsz csütörtökön?'", backText: "Are you free on Thursday?", phonetic: "á jú frí on thörzdéj" },
    { id: "gq164", type: "multiple_choice", prompt: "Mit jelent 'Does that work for you?'", options: [{ id: "o1", text: "Megfelel neked (az időpont)?" }, { id: "o2", text: "Működik nálad?" }, { id: "o3", text: "Dolgozol akkor?" }], correctOptionId: "o1" },
    { id: "gq165", type: "flashcard", prompt: "'Át kell tennem másik időpontra'", backText: "I need to reschedule", phonetic: "áj níd tu ríszedjúl" } ] },

  // ══ 12. Fejezet: Város & utazás ══════════════════════
  { id: "gl56", title: "Útbaigazítás", description: "Left, right, straight on.", chapter: 12, xpReward: 10, questions: [
    { id: "gq166", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "balra", right: "left" }, { id: "p2", left: "jobbra", right: "right" }, { id: "p3", left: "egyenesen", right: "straight on" }] },
    { id: "gq167", type: "flashcard", prompt: "'Elnézést, merre van a…?'", backText: "Excuse me, where is the…?", phonetic: "ikszkjúz mí veö iz dö" },
    { id: "gq168", type: "multiple_choice", prompt: "Mit jelent 'roundabout'?", options: [{ id: "o1", text: "Körforgalom" }, { id: "o2", text: "Kerülőút" }, { id: "o3", text: "Aluljáró" }], correctOptionId: "o1" } ] },
  { id: "gl57", title: "Tömegközlekedés", description: "⚠️ Tap in, tap out.", chapter: 12, xpReward: 10, questions: [
    { id: "gq169", type: "multiple_choice", prompt: "⚠️ Mit jelent 'tap in and tap out'?", options: [{ id: "o1", text: "Be- és kiérintés a kapunál — metrón mindkettő kell" }, { id: "o2", text: "Kopogtatás" }, { id: "o3", text: "Jegyellenőrzés" }], correctOptionId: "o1" },
    { id: "gq170", type: "flashcard", prompt: "A londoni metró beceneve", backText: "the Tube", phonetic: "dö tjúb" },
    { id: "gq171", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "megálló", right: "stop" }, { id: "p2", left: "átszállás", right: "change" }, { id: "p3", left: "menetrend", right: "timetable" }] } ] },
  { id: "gl58", title: "Vonat", description: "Return, single, platform, delay.", chapter: 12, xpReward: 10, questions: [
    { id: "gq172", type: "multiple_choice", prompt: "⚠️ Hogy kéred a retúrjegyet britül?", options: [{ id: "o1", text: "A return ticket" }, { id: "o2", text: "A round trip ticket" }, { id: "o3", text: "A two-way ticket" }], correctOptionId: "o1" },
    { id: "gq173", type: "flashcard", prompt: "'vágány / peron'", backText: "platform", phonetic: "pletfórm" },
    { id: "gq174", type: "multiple_choice", prompt: "Mit jelent 'the train is delayed'?", options: [{ id: "o1", text: "A vonat késik" }, { id: "o2", text: "A vonat törölve" }, { id: "o3", text: "A vonat megtelt" }], correctOptionId: "o1" } ] },
  { id: "gl59", title: "Taxi & autó", description: "Cab, petrol, MOT, parking.", chapter: 12, xpReward: 10, questions: [
    { id: "gq175", type: "multiple_choice", prompt: "⚠️ Mi a 'petrol' britül?", options: [{ id: "o1", text: "Benzin" }, { id: "o2", text: "Gázolaj" }, { id: "o3", text: "Olajcsere" }], correctOptionId: "o1" },
    { id: "gq176", type: "flashcard", prompt: "'műszaki vizsga' (3 évnél idősebb autónál)", backText: "MOT", phonetic: "em-ó-tí" },
    { id: "gq177", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "csomagtartó", right: "boot" }, { id: "p2", left: "motorháztető", right: "bonnet" }, { id: "p3", left: "parkolás", right: "parking" }] } ] },
  { id: "gl60", title: "Városi helyek", description: "Council, library, leisure centre.", chapter: 12, xpReward: 10, questions: [
    { id: "gq178", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "könyvtár", right: "library" }, { id: "p2", left: "posta", right: "post office" }, { id: "p3", left: "rendőrőrs", right: "police station" }] },
    { id: "gq179", type: "flashcard", prompt: "'uszoda / sportközpont'", backText: "leisure centre", phonetic: "lezsö szentö" },
    { id: "gq180", type: "multiple_choice", prompt: "Mit intézel a 'council'-nál?", options: [{ id: "o1", text: "Council tax, szemétszállítás, iskolai hely" }, { id: "o2", text: "Útlevél" }, { id: "o3", text: "Bankszámla" }], correctOptionId: "o1" } ] },

  // ══ 13. Fejezet: Számok & mértékek ═══════════════════
  { id: "gl61", title: "⚠️ Brit mértékegységek", description: "Miles, stone, pint — a kettős rendszer.", chapter: 13, xpReward: 10, questions: [
    { id: "gq181", type: "multiple_choice", prompt: "⚠️ Milyen egységben van a sebességhatár?", options: [{ id: "o1", text: "mérföld/óra (mph)" }, { id: "o2", text: "km/óra" }, { id: "o3", text: "csomó" }], correctOptionId: "o1" },
    { id: "gq182", type: "flashcard", prompt: "⚠️ Testsúly-egység (1 = 6,35 kg)", backText: "stone", phonetic: "sztón" },
    { id: "gq183", type: "multiple_choice", prompt: "Hány kg kb. 12 stone?", options: [{ id: "o1", text: "kb. 76 kg" }, { id: "o2", text: "kb. 120 kg" }, { id: "o3", text: "kb. 50 kg" }], correctOptionId: "o1" } ] },
  { id: "gl62", title: "Sorszámok", description: "First, second, third.", chapter: 13, xpReward: 10, questions: [
    { id: "gq184", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "első", right: "first" }, { id: "p2", left: "második", right: "second" }, { id: "p3", left: "harmadik", right: "third" }] },
    { id: "gq185", type: "flashcard", prompt: "'a földszint' britül", backText: "the ground floor", phonetic: "dö graund fló" },
    { id: "gq186", type: "multiple_choice", prompt: "⚠️ Britül melyik az 'első emelet'?", options: [{ id: "o1", text: "First floor — a földszint FÖLÖTTI szint" }, { id: "o2", text: "A földszint maga" }, { id: "o3", text: "Az alagsor" }], correctOptionId: "o1" } ] },
  { id: "gl63", title: "Mennyiség", description: "A bit, a lot, enough, too much.", chapter: 13, xpReward: 10, questions: [
    { id: "gq187", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "egy kicsit", right: "a bit" }, { id: "p2", left: "sok", right: "a lot" }, { id: "p3", left: "elég", right: "enough" }] },
    { id: "gq188", type: "flashcard", prompt: "'túl sok'", backText: "too much", phonetic: "tú macs" },
    { id: "gq189", type: "multiple_choice", prompt: "Mit jelent 'a couple of'?", options: [{ id: "o1", text: "Néhány (kb. kettő)" }, { id: "o2", text: "Egy pár (házaspár)" }, { id: "o3", text: "Sok" }], correctOptionId: "o1" } ] },
  { id: "gl64", title: "Ár & fizetés", description: "Quid, change, contactless.", chapter: 13, xpReward: 10, questions: [
    { id: "gq190", type: "multiple_choice", prompt: "Mit jelent 'quid'?", options: [{ id: "o1", text: "Font (szleng) — 'twenty quid' = 20 £" }, { id: "o2", text: "Penny" }, { id: "o3", text: "Kedvezmény" }], correctOptionId: "o1" },
    { id: "gq191", type: "flashcard", prompt: "'visszajáró'", backText: "change", phonetic: "cséndzs" },
    { id: "gq192", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "készpénz", right: "cash" }, { id: "p2", left: "érintős", right: "contactless" }, { id: "p3", left: "számla", right: "invoice" }] } ] },
  { id: "gl65", title: "Százalék & összehasonlítás", description: "Percent, cheaper, more expensive.", chapter: 13, xpReward: 10, questions: [
    { id: "gq193", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "olcsóbb", right: "cheaper" }, { id: "p2", left: "drágább", right: "more expensive" }, { id: "p3", left: "ugyanannyi", right: "the same" }] },
    { id: "gq194", type: "flashcard", prompt: "'húsz százalék kedvezmény'", backText: "twenty percent off", phonetic: "tventi pöszent of" },
    { id: "gq195", type: "multiple_choice", prompt: "Mit jelent 'value for money'?", options: [{ id: "o1", text: "Jó ár-érték arány" }, { id: "o2", text: "Pénzvisszatérítés" }, { id: "o3", text: "Árfolyam" }], correctOptionId: "o1" } ] },

  // ══ 14. Fejezet: Lakhatás részletesen ════════════════
  { id: "gl66", title: "Lakáskeresés", description: "To let, viewing, furnished.", chapter: 14, xpReward: 10, questions: [
    { id: "gq196", type: "multiple_choice", prompt: "⚠️ Mit jelent a 'TO LET' tábla?", options: [{ id: "o1", text: "Kiadó" }, { id: "o2", text: "Eladó" }, { id: "o3", text: "Felújítás alatt" }], correctOptionId: "o1" },
    { id: "gq197", type: "flashcard", prompt: "'megtekintés' (lakásnézés)", backText: "viewing", phonetic: "vjúing" },
    { id: "gq198", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bútorozott", right: "furnished" }, { id: "p2", left: "bútorozatlan", right: "unfurnished" }, { id: "p3", left: "szobatárs", right: "flatmate" }] } ] },
  { id: "gl67", title: "Kaució", description: "⚠️ Deposit protection.", chapter: 14, xpReward: 10, questions: [
    { id: "gq199", type: "multiple_choice", prompt: "⚠️ Mit KELL a bérbeadónak 30 napon belül tennie a kaucióval?", options: [{ id: "o1", text: "Állami védelmi sémába tenni és igazolást adni" }, { id: "o2", text: "Saját számlán tartani" }, { id: "o3", text: "Elkölteni felújításra" }], correctOptionId: "o1" },
    { id: "gq200", type: "flashcard", prompt: "'Kérhetem a kaució-védelem igazolását?'", backText: "Can I have the deposit protection certificate?", phonetic: "ken áj hev dö dipozit protekson szörtifikit" },
    { id: "gq201", type: "multiple_choice", prompt: "Mennyi a kaució törvényi maximuma?", options: [{ id: "o1", text: "5 heti bérleti díj (50 000 £ éves bér alatt)" }, { id: "o2", text: "3 havi bér" }, { id: "o3", text: "Nincs felső határ" }], correctOptionId: "o1" } ] },
  { id: "gl68", title: "Szerződés", description: "Tenancy, break clause, rolling.", chapter: 14, xpReward: 10, questions: [
    { id: "gq202", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bérleti szerződés", right: "tenancy agreement" }, { id: "p2", left: "fix időszak", right: "fixed term" }, { id: "p3", left: "havi gördülő", right: "rolling contract" }] },
    { id: "gq203", type: "flashcard", prompt: "'felmondási záradék'", backText: "break clause", phonetic: "bréjk klóz" },
    { id: "gq204", type: "multiple_choice", prompt: "⚠️ Mit TILOS a bérlőtől kérni 2019 óta?", options: [{ id: "o1", text: "Ingatlanos/adminisztrációs díjat (agency fee)" }, { id: "o2", text: "Kauciót" }, { id: "o3", text: "Az első havi bért" }], correctOptionId: "o1" } ] },
  { id: "gl69", title: "Költözés", description: "Inventory, meter reading, keys.", chapter: 14, xpReward: 10, questions: [
    { id: "gq205", type: "multiple_choice", prompt: "Mi az 'inventory'?", options: [{ id: "o1", text: "Állapot-leltár fotókkal — a kaució-vitáknál ez dönt" }, { id: "o2", text: "Bútorlista eladásra" }, { id: "o3", text: "Raktárkészlet" }], correctOptionId: "o1" },
    { id: "gq206", type: "flashcard", prompt: "'Lefotóztam a mérőórákat'", backText: "I've taken photos of the meters", phonetic: "ájv téjkn fótóz ov dö mítöz" },
    { id: "gq207", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "beköltözés", right: "moving in" }, { id: "p2", left: "kiköltözés", right: "moving out" }, { id: "p3", left: "kulcsátadás", right: "handover" }] } ] },
  { id: "gl70", title: "Council tax", description: "⚠️ A lakót terheli.", chapter: 14, xpReward: 10, questions: [
    { id: "gq208", type: "multiple_choice", prompt: "⚠️ Ki fizeti a council taxet?", options: [{ id: "o1", text: "A LAKÓ (bérlő), nem a tulajdonos" }, { id: "o2", text: "A tulajdonos" }, { id: "o3", text: "A munkáltató" }], correctOptionId: "o1" },
    { id: "gq209", type: "flashcard", prompt: "Egyedül élő kedvezménye (25%)", backText: "single person discount", phonetic: "szingl pöszn diszkaunt" },
    { id: "gq210", type: "multiple_choice", prompt: "⚠️ Automatikus-e a diákmentesség?", options: [{ id: "o1", text: "Nem — igényelni kell a councilnál" }, { id: "o2", text: "Igen, automatikus" }, { id: "o3", text: "Nincs ilyen mentesség" }], correctOptionId: "o1" } ] },

  // ══ 15. Fejezet: Gyerekek & iskola ═══════════════════
  { id: "gl71", title: "Iskolatípusok", description: "Reception, primary, secondary.", chapter: 15, xpReward: 10, questions: [
    { id: "gq211", type: "multiple_choice", prompt: "⚠️ Hány évesen kezdi a gyerek a Receptiont?", options: [{ id: "o1", text: "4 évesen (a tankötelezettség 5-től)" }, { id: "o2", text: "6 évesen" }, { id: "o3", text: "3 évesen" }], correctOptionId: "o1" },
    { id: "gq212", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "általános iskola", right: "primary school" }, { id: "p2", left: "középiskola", right: "secondary school" }, { id: "p3", left: "óvoda", right: "nursery" }] },
    { id: "gq213", type: "flashcard", prompt: "'tanév'", backText: "school year", phonetic: "szkúl jíö" } ] },
  { id: "gl72", title: "Vizsgák", description: "GCSE, A-level, grades.", chapter: 15, xpReward: 10, questions: [
    { id: "gq214", type: "multiple_choice", prompt: "Mikor tesz a diák GCSE-t?", options: [{ id: "o1", text: "16 évesen, a Year 11 végén" }, { id: "o2", text: "18 évesen" }, { id: "o3", text: "14 évesen" }], correctOptionId: "o1" },
    { id: "gq215", type: "flashcard", prompt: "Az egyetemi út vizsgája 18-nál", backText: "A-level", phonetic: "éj-levl" },
    { id: "gq216", type: "multiple_choice", prompt: "⚠️ Milyen skálán megy a GCSE-osztályzat?", options: [{ id: "o1", text: "9–1 (a 9 a legjobb)" }, { id: "o2", text: "1–5, mint Magyarországon" }, { id: "o3", text: "A–F" }], correctOptionId: "o1" } ] },
  { id: "gl73", title: "Beiratkozás", description: "School place, catchment, deadline.", chapter: 15, xpReward: 10, questions: [
    { id: "gq217", type: "multiple_choice", prompt: "⚠️ Hol pályázod meg az iskolai helyet?", options: [{ id: "o1", text: "A lakóhely szerinti önkormányzatnál (council)" }, { id: "o2", text: "Közvetlenül az iskolánál" }, { id: "o3", text: "A minisztériumnál" }], correctOptionId: "o1" },
    { id: "gq218", type: "flashcard", prompt: "'körzet' (felvételi szempont)", backText: "catchment area", phonetic: "kecsment eöria" },
    { id: "gq219", type: "multiple_choice", prompt: "Mikor a középiskolai jelentkezés határideje?", options: [{ id: "o1", text: "Október 31." }, { id: "o2", text: "Március 1." }, { id: "o3", text: "Június 15." }], correctOptionId: "o1" } ] },
  { id: "gl74", title: "Iskolai hétköznapok", description: "Uniform, packed lunch, parents' evening.", chapter: 15, xpReward: 10, questions: [
    { id: "gq220", type: "multiple_choice", prompt: "⚠️ Kötelező-e az egyenruha?", options: [{ id: "o1", text: "Igen, a legtöbb iskolában — és költséges" }, { id: "o2", text: "Nem, sehol" }, { id: "o3", text: "Csak magániskolában" }], correctOptionId: "o1" },
    { id: "gq221", type: "flashcard", prompt: "'szülői értekezlet'", backText: "parents' evening", phonetic: "peörentsz ívning" },
    { id: "gq222", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "hozott ebéd", right: "packed lunch" }, { id: "p2", left: "házi feladat", right: "homework" }, { id: "p3", left: "kirándulás", right: "school trip" }] } ] },
  { id: "gl75", title: "Nyelvi támogatás", description: "EAL, free school meals.", chapter: 15, xpReward: 10, questions: [
    { id: "gq223", type: "multiple_choice", prompt: "Mi az 'EAL'?", options: [{ id: "o1", text: "Angol mint kiegészítő nyelv — támogatás a normál osztályban" }, { id: "o2", text: "Külön felzárkóztató osztály" }, { id: "o3", text: "Nyelvvizsga" }], correctOptionId: "o1" },
    { id: "gq224", type: "flashcard", prompt: "'ingyenes iskolai ebéd'", backText: "free school meals", phonetic: "frí szkúl mílz" },
    { id: "gq225", type: "multiple_choice", prompt: "⚠️ Van-e külön felzárkóztató osztály, mint Hollandiában?", options: [{ id: "o1", text: "A legtöbb helyen NINCS — a gyerek a rendes osztályba jár EAL-támogatással" }, { id: "o2", text: "Igen, mindenhol kötelező" }, { id: "o3", text: "Csak Londonban" }], correctOptionId: "o1" } ] },

  // ══ 16. Fejezet: Pénzügyek ═══════════════════════════
  { id: "gl76", title: "Bankszámla", description: "Current account, sort code.", chapter: 16, xpReward: 10, questions: [
    { id: "gq226", type: "multiple_choice", prompt: "⚠️ Hogy hívják britül a folyószámlát?", options: [{ id: "o1", text: "current account" }, { id: "o2", text: "checking account" }, { id: "o3", text: "running account" }], correctOptionId: "o1" },
    { id: "gq227", type: "flashcard", prompt: "A bankfiók 6 jegyű azonosítója", backText: "sort code", phonetic: "szót kód" },
    { id: "gq228", type: "multiple_choice", prompt: "⚠️ Mi a leggyakoribb akadály az első számlánál?", options: [{ id: "o1", text: "A lakcímigazolás hiánya" }, { id: "o2", text: "Az életkor" }, { id: "o3", text: "A nyelvtudás" }], correctOptionId: "o1" } ] },
  { id: "gl77", title: "Bankváltás", description: "⚠️ CASS — 7 munkanap.", chapter: 16, xpReward: 10, questions: [
    { id: "gq229", type: "multiple_choice", prompt: "Mennyi idő alatt visz át mindent a CASS?", options: [{ id: "o1", text: "7 munkanap, garanciával" }, { id: "o2", text: "1 hónap" }, { id: "o3", text: "Azonnal" }], correctOptionId: "o1" },
    { id: "gq230", type: "flashcard", prompt: "'csoportos beszedés'", backText: "direct debit", phonetic: "dájrekt debit" },
    { id: "gq231", type: "multiple_choice", prompt: "⚠️ Mit NE tegyél bankváltáskor?", options: [{ id: "o1", text: "Ne zárd le magad a régi számlát — a CASS intézi" }, { id: "o2", text: "Ne mondd meg az új banknak" }, { id: "o3", text: "Ne fizess be pénzt" }], correctOptionId: "o1" } ] },
  { id: "gl78", title: "Hitelképesség", description: "Credit score, electoral roll.", chapter: 16, xpReward: 10, questions: [
    { id: "gq232", type: "multiple_choice", prompt: "⚠️ Mi történik a magyar hitel-előéleteddel?", options: [{ id: "o1", text: "Nem számít — a brit credit score nulláról indul" }, { id: "o2", text: "Automatikusan átkerül" }, { id: "o3", text: "Fele értékben számít" }], correctOptionId: "o1" },
    { id: "gq233", type: "flashcard", prompt: "Ez segít építeni a credit score-t", backText: "the electoral roll", phonetic: "dö ilektörl ról" },
    { id: "gq234", type: "multiple_choice", prompt: "Hol számít a credit score?", options: [{ id: "o1", text: "Lakásbérlésnél, telefon-előfizetésnél, hitelnél" }, { id: "o2", text: "Csak jelzáloghitelnél" }, { id: "o3", text: "Sehol" }], correctOptionId: "o1" } ] },
  { id: "gl79", title: "Adó", description: "⚠️ Az adóév április 6-tól.", chapter: 16, xpReward: 10, questions: [
    { id: "gq235", type: "multiple_choice", prompt: "⚠️ Mikor kezdődik a brit adóév?", options: [{ id: "o1", text: "Április 6-án" }, { id: "o2", text: "Január 1-jén" }, { id: "o3", text: "Szeptember 1-jén" }], correctOptionId: "o1" },
    { id: "gq236", type: "flashcard", prompt: "Az adóév végi összesítő", backText: "P60", phonetic: "pí-sziksztí" },
    { id: "gq237", type: "multiple_choice", prompt: "Mit jelent, ha a tax code 'BR'?", options: [{ id: "o1", text: "Valószínűleg túl sokat vonnak — érdemes ellenőrizni" }, { id: "o2", text: "Adómentes vagy" }, { id: "o3", text: "Bónuszt kapsz" }], correctOptionId: "o1" } ] },
  { id: "gl80", title: "Megtakarítás", description: "ISA, pension, savings.", chapter: 16, xpReward: 10, questions: [
    { id: "gq238", type: "multiple_choice", prompt: "Mi az 'ISA'?", options: [{ id: "o1", text: "Adómentes megtakarítási számla" }, { id: "o2", text: "Biztosítás" }, { id: "o3", text: "Hitelfajta" }], correctOptionId: "o1" },
    { id: "gq239", type: "flashcard", prompt: "'munkahelyi nyugdíj' (automatikus beléptetés)", backText: "workplace pension", phonetic: "vörkpléjsz penson" },
    { id: "gq240", type: "multiple_choice", prompt: "⚠️ Mi történik, ha kilépsz az auto-enrolment nyugdíjból?", options: [{ id: "o1", text: "Elveszted a munkáltatói hozzájárulást is" }, { id: "o2", text: "Semmi, csak több a nettód" }, { id: "o3", text: "Bírságot kapsz" }], correctOptionId: "o1" } ] },

  // ══ 17. Fejezet: Egészségügy ═════════════════════════
  { id: "gl81", title: "NHS-alapok", description: "Free at the point of use.", chapter: 17, xpReward: 10, questions: [
    { id: "gq241", type: "multiple_choice", prompt: "Hogyan finanszírozzák az NHS-t?", options: [{ id: "o1", text: "Adóból — nincs havi biztosítási díj" }, { id: "o2", text: "Havi biztosítási díjból" }, { id: "o3", text: "Munkáltatói hozzájárulásból" }], correctOptionId: "o1" },
    { id: "gq242", type: "flashcard", prompt: "'NHS-szám'", backText: "NHS number", phonetic: "en-écs-esz namber" },
    { id: "gq243", type: "multiple_choice", prompt: "Mi az 'IHS' a vízumnál?", options: [{ id: "o1", text: "Egészségügyi hozzájárulás, előre fizetve" }, { id: "o2", text: "Egészségügyi vizsgálat" }, { id: "o3", text: "Biztosítási kötvény" }], correctOptionId: "o1" } ] },
  { id: "gl82", title: "GP-regisztráció", description: "⚠️ A jogod.", chapter: 17, xpReward: 10, questions: [
    { id: "gq244", type: "multiple_choice", prompt: "⚠️ Elutasíthat-e a rendelő lakcímigazolás hiánya miatt?", options: [{ id: "o1", text: "NEM — ez a jogod, kérj írásos indoklást" }, { id: "o2", text: "Igen, jogosan" }, { id: "o3", text: "Csak Londonban" }], correctOptionId: "o1" },
    { id: "gq245", type: "flashcard", prompt: "'Szeretnék regisztrálni háziorvoshoz'", backText: "I'd like to register with a GP", phonetic: "ájd lájk tu redzsisztö vid ö dzsí-pí" },
    { id: "gq246", type: "multiple_choice", prompt: "Mi a 'GMS1'?", options: [{ id: "o1", text: "A GP-regisztrációs nyomtatvány" }, { id: "o2", text: "Egy gyógyszer" }, { id: "o3", text: "Egy kórházi osztály" }], correctOptionId: "o1" } ] },
  { id: "gl83", title: "Rendelőben", description: "Appointment, triage, referral.", chapter: 17, xpReward: 10, questions: [
    { id: "gq247", type: "flashcard", prompt: "'Sürgős időpontot kérnék'", backText: "I need an urgent appointment", phonetic: "áj níd en ördzsent epojntment" },
    { id: "gq248", type: "multiple_choice", prompt: "Mit jelent 'referral'?", options: [{ id: "o1", text: "Beutaló szakorvoshoz" }, { id: "o2", text: "Ajánlólevél" }, { id: "o3", text: "Recept" }], correctOptionId: "o1" },
    { id: "gq249", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "vérvétel", right: "blood test" }, { id: "p2", left: "röntgen", right: "X-ray" }, { id: "p3", left: "oltás", right: "vaccination" }] } ] },
  { id: "gl84", title: "Kórház", description: "A&E, waiting time, ward.", chapter: 17, xpReward: 10, questions: [
    { id: "gq250", type: "multiple_choice", prompt: "Mi az 'A&E'?", options: [{ id: "o1", text: "Kórházi sürgősségi (Accident & Emergency)" }, { id: "o2", text: "Járóbeteg-rendelés" }, { id: "o3", text: "Gyógyszertár" }], correctOptionId: "o1" },
    { id: "gq251", type: "flashcard", prompt: "'kórterem'", backText: "ward", phonetic: "vód" },
    { id: "gq252", type: "multiple_choice", prompt: "Mire számíts az A&E-n?", options: [{ id: "o1", text: "Hosszú várakozásra, súlyosság szerinti sorrendben" }, { id: "o2", text: "Azonnali ellátásra" }, { id: "o3", text: "Fizetős ellátásra" }], correctOptionId: "o1" } ] },
  { id: "gl85", title: "Recept & költség", description: "⚠️ Angliában fizetős.", chapter: 17, xpReward: 10, questions: [
    { id: "gq253", type: "multiple_choice", prompt: "⚠️ Mi igaz a receptre?", options: [{ id: "o1", text: "Angliában tételenként fix díj; Skóciában és Walesben ingyenes" }, { id: "o2", text: "Mindenhol ingyenes" }, { id: "o3", text: "Mindenhol fizetős" }], correctOptionId: "o1" },
    { id: "gq254", type: "flashcard", prompt: "'recept-díj'", backText: "prescription charge", phonetic: "priszkripson csádzs" },
    { id: "gq255", type: "multiple_choice", prompt: "Hol kérhetsz beutaló nélkül tanácsot kisebb panaszra?", options: [{ id: "o1", text: "A gyógyszertárban (pharmacy)" }, { id: "o2", text: "Az A&E-n" }, { id: "o3", text: "A councilnál" }], correctOptionId: "o1" } ] },

  // ══ 18. Fejezet: Ügyintézés & okmányok ═══════════════
  { id: "gl86", title: "Státusz igazolása", description: "Share code, eVisa.", chapter: 18, xpReward: 10, questions: [
    { id: "gq256", type: "multiple_choice", prompt: "Mire kell a 'share code'?", options: [{ id: "o1", text: "A munkavállalási/bérlési jogod igazolására" }, { id: "o2", text: "Kedvezményre" }, { id: "o3", text: "Banki azonosításra" }], correctOptionId: "o1" },
    { id: "gq257", type: "flashcard", prompt: "'jogosult vagyok dolgozni'", backText: "I have the right to work", phonetic: "áj hev dö rájt tu vörk" },
    { id: "gq258", type: "multiple_choice", prompt: "Mit jelent 'settled status'?", options: [{ id: "o1", text: "Határozatlan idejű letelepedés (ILR)" }, { id: "o2", text: "Ideiglenes vízum" }, { id: "o3", text: "Állampolgárság" }], correctOptionId: "o1" } ] },
  { id: "gl87", title: "Right to Rent", description: "A bérbeadó ellenőrzése.", chapter: 18, xpReward: 10, questions: [
    { id: "gq259", type: "multiple_choice", prompt: "⚠️ Miért kéri a bérbeadó az okmányaidat?", options: [{ id: "o1", text: "Törvényi kötelessége (Right to Rent) — nem diszkrimináció" }, { id: "o2", text: "Kíváncsiságból" }, { id: "o3", text: "Nem kérheti" }], correctOptionId: "o1" },
    { id: "gq260", type: "flashcard", prompt: "'tartózkodási jog'", backText: "right to reside", phonetic: "rájt tu rizájd" },
    { id: "gq261", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "útlevél", right: "passport" }, { id: "p2", left: "vízum", right: "visa" }, { id: "p3", left: "igazolás", right: "certificate" }] } ] },
  { id: "gl88", title: "Levelezés hivatallal", description: "Dear Sir/Madam, I am writing to…", chapter: 18, xpReward: 10, questions: [
    { id: "gq262", type: "multiple_choice", prompt: "Hogy kezdesz hivatalos levelet, ha nem tudod a nevet?", options: [{ id: "o1", text: "Dear Sir or Madam," }, { id: "o2", text: "Hello!" }, { id: "o3", text: "To whom" }], correctOptionId: "o1" },
    { id: "gq263", type: "flashcard", prompt: "'Azért írok, hogy…'", backText: "I am writing to…", phonetic: "áj em rájting tu" },
    { id: "gq264", type: "multiple_choice", prompt: "⚠️ Hogy zárod, ha 'Dear Sir or Madam'-mal kezdted?", options: [{ id: "o1", text: "Yours faithfully" }, { id: "o2", text: "Yours sincerely" }, { id: "o3", text: "Best" }], correctOptionId: "o1" } ] },
  { id: "gl89", title: "Panasz & jogorvoslat", description: "Complaint, appeal, Citizens Advice.", chapter: 18, xpReward: 10, questions: [
    { id: "gq265", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "panasz", right: "complaint" }, { id: "p2", left: "fellebbezés", right: "appeal" }, { id: "p3", left: "határidő", right: "deadline" }] },
    { id: "gq266", type: "flashcard", prompt: "'Hivatalos panaszt szeretnék tenni'", backText: "I'd like to make a formal complaint", phonetic: "ájd lájk tu méjk ö fórml komplejnt" },
    { id: "gq267", type: "multiple_choice", prompt: "Hova fordulsz ingyenes, független tanácsért?", options: [{ id: "o1", text: "Citizens Advice" }, { id: "o2", text: "A councilhoz mindig" }, { id: "o3", text: "Az NHS-hez" }], correctOptionId: "o1" } ] },
  { id: "gl90", title: "Jogosítvány", description: "DVLA, exchange, provisional.", chapter: 18, xpReward: 10, questions: [
    { id: "gq268", type: "multiple_choice", prompt: "Melyik hivatal intézi a jogosítványt?", options: [{ id: "o1", text: "DVLA" }, { id: "o2", text: "HMRC" }, { id: "o3", text: "DWP" }], correctOptionId: "o1" },
    { id: "gq269", type: "flashcard", prompt: "'Ki szeretném cserélni a jogosítványomat'", backText: "I'd like to exchange my licence", phonetic: "ájd lájk tu ikszcséndzs máj lájszönsz" },
    { id: "gq270", type: "multiple_choice", prompt: "Vezethetsz-e magyar jogosítvánnyal?", options: [{ id: "o1", text: "Igen, EU-s engedéllyel jellemzően 70 éves korig" }, { id: "o2", text: "Nem, azonnal cserélni kell" }, { id: "o3", text: "Csak 6 hónapig" }], correctOptionId: "o1" } ] },

  // ══ 19. Fejezet: Társalgás ═══════════════════════════
  { id: "gl91", title: "Vélemény", description: "I think, I reckon, in my view.", chapter: 19, xpReward: 10, questions: [
    { id: "gq271", type: "flashcard", prompt: "'Szerintem…' (informális brit)", backText: "I reckon…", phonetic: "áj rekn" },
    { id: "gq272", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "egyetértek", right: "I agree" }, { id: "p2", left: "nem értek egyet", right: "I disagree" }, { id: "p3", left: "attól függ", right: "it depends" }] },
    { id: "gq273", type: "multiple_choice", prompt: "⚠️ Mit jelent gyakran: 'I'll bear it in mind'?", options: [{ id: "o1", text: "Udvarias „elfelejtem” — nem ígéret" }, { id: "o2", text: "Biztosan meg fogja tenni" }, { id: "o3", text: "Nem érti" }], correctOptionId: "o1" } ] },
  { id: "gl92", title: "Egyet nem értés", description: "⚠️ Udvariasan.", chapter: 19, xpReward: 10, questions: [
    { id: "gq274", type: "multiple_choice", prompt: "Melyik a legudvariasabb vitatkozás?", options: [{ id: "o1", text: "I see your point, but…" }, { id: "o2", text: "You're wrong." }, { id: "o3", text: "No." }], correctOptionId: "o1" },
    { id: "gq275", type: "flashcard", prompt: "'Nem vagyok róla meggyőződve'", backText: "I'm not entirely convinced", phonetic: "ájm not intájörli konvinszd" },
    { id: "gq276", type: "multiple_choice", prompt: "⚠️ Mit jelent: 'With all due respect…'", options: [{ id: "o1", text: "Most jön az éles bírálat" }, { id: "o2", text: "Őszinte tisztelet" }, { id: "o3", text: "Egyetértés" }], correctOptionId: "o1" } ] },
  { id: "gl93", title: "Telefon", description: "Speaking, hold on, wrong number.", chapter: 19, xpReward: 10, questions: [
    { id: "gq277", type: "multiple_choice", prompt: "Mit válaszolsz, ha téged keresnek?", options: [{ id: "o1", text: "Speaking." }, { id: "o2", text: "That's me!" }, { id: "o3", text: "Here." }], correctOptionId: "o1" },
    { id: "gq278", type: "flashcard", prompt: "'Tartsa, kérem'", backText: "Hold on, please", phonetic: "hóld on plíz" },
    { id: "gq279", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "téves szám", right: "wrong number" }, { id: "p2", left: "visszahívom", right: "I'll call you back" }, { id: "p3", left: "üzenet", right: "message" }] } ] },
  { id: "gl94", title: "Meghívás", description: "Would you like to…? I'd love to.", chapter: 19, xpReward: 10, questions: [
    { id: "gq280", type: "flashcard", prompt: "'Szívesen!' (elfogadás)", backText: "I'd love to", phonetic: "ájd lav tu" },
    { id: "gq281", type: "multiple_choice", prompt: "Hogy utasítasz vissza udvariasan?", options: [{ id: "o1", text: "That's very kind, but I can't make it" }, { id: "o2", text: "No, I don't want" }, { id: "o3", text: "Impossible" }], correctOptionId: "o1" },
    { id: "gq282", type: "multiple_choice", prompt: "Mit jelent 'BYOB' a meghívón?", options: [{ id: "o1", text: "Hozz magaddal italt" }, { id: "o2", text: "Öltönykötelező" }, { id: "o3", text: "Csak felnőtteknek" }], correctOptionId: "o1" } ] },
  { id: "gl95", title: "Brit szlengek", description: "Knackered, gutted, sorted.", chapter: 19, xpReward: 10, questions: [
    { id: "gq283", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kimerült", right: "knackered" }, { id: "p2", left: "csalódott", right: "gutted" }, { id: "p3", left: "elintézve", right: "sorted" }] },
    { id: "gq284", type: "flashcard", prompt: "'nagyon jó / szuper'", backText: "brilliant", phonetic: "briliönt" },
    { id: "gq285", type: "multiple_choice", prompt: "Mit jelent 'It's a bit dodgy'?", options: [{ id: "o1", text: "Gyanús / megbízhatatlan" }, { id: "o2", text: "Nagyon jó" }, { id: "o3", text: "Drága" }], correctOptionId: "o1" } ] },

  // ══ 20. Fejezet: Túlélő mondatok ═════════════════════
  { id: "gl96", title: "Ha nem érted", description: "Sorry, could you repeat that?", chapter: 20, xpReward: 10, questions: [
    { id: "gq286", type: "flashcard", prompt: "'Megismételné?'", backText: "Sorry, could you repeat that?", phonetic: "szori kud jú ripít det" },
    { id: "gq287", type: "multiple_choice", prompt: "'Le tudná írni?'", options: [{ id: "o1", text: "Could you write it down, please?" }, { id: "o2", text: "Write please" }, { id: "o3", text: "Make it paper" }], correctOptionId: "o1" },
    { id: "gq288", type: "flashcard", prompt: "'Mit jelent ez a szó?'", backText: "What does this word mean?", phonetic: "vot daz disz vörd mín" } ] },
  { id: "gl97", title: "Vészhelyzet", description: "Help! Call 999!", chapter: 20, xpReward: 10, questions: [
    { id: "gq289", type: "flashcard", prompt: "'Segítség! Hívjon mentőt!'", backText: "Help! Call an ambulance!", phonetic: "help kól en embjulönsz" },
    { id: "gq290", type: "multiple_choice", prompt: "'Elvesztettem az útlevelem'", options: [{ id: "o1", text: "I've lost my passport" }, { id: "o2", text: "My passport is losted" }, { id: "o3", text: "I lose passport" }], correctOptionId: "o1" },
    { id: "gq291", type: "flashcard", prompt: "'Kiraboltak'", backText: "I've been robbed", phonetic: "ájv bín robd" } ] },
  { id: "gl98", title: "Fontos kérdések", description: "Where is…? How do I get to…?", chapter: 20, xpReward: 10, questions: [
    { id: "gq292", type: "flashcard", prompt: "'Hogy jutok el a…-hoz?'", backText: "How do I get to…?", phonetic: "hau du áj get tu" },
    { id: "gq293", type: "multiple_choice", prompt: "'Van itt ingyenes wifi?'", options: [{ id: "o1", text: "Is there free wifi here?" }, { id: "o2", text: "Have you wifi free?" }, { id: "o3", text: "Wifi is free?" }], correctOptionId: "o1" },
    { id: "gq294", type: "flashcard", prompt: "'Hol a mosdó?'", backText: "Where's the toilet?", phonetic: "veöz dö tojlet" } ] },
  { id: "gl99", title: "Beszél magyarul?", description: "A magyar közösség megtalálása.", chapter: 20, xpReward: 10, questions: [
    { id: "gq295", type: "flashcard", prompt: "'Beszél valaki magyarul?'", backText: "Does anyone speak Hungarian?", phonetic: "daz eniván szpík hangeörien" },
    { id: "gq296", type: "multiple_choice", prompt: "'Magyar vagyok'", options: [{ id: "o1", text: "I'm Hungarian" }, { id: "o2", text: "I'm from Hungarian" }, { id: "o3", text: "I am Hungary" }], correctOptionId: "o1" },
    { id: "gq297", type: "flashcard", prompt: "'Most költöztem ide'", backText: "I've just moved here", phonetic: "ájv dzsaszt múvd hír" } ] },
  { id: "gl100", title: "Záró mondatok", description: "Thanks for your help. Have a good day.", chapter: 20, xpReward: 15, questions: [
    { id: "gq298", type: "flashcard", prompt: "'Köszönöm a segítségét'", backText: "Thanks for your help", phonetic: "thenksz fó jó help" },
    { id: "gq299", type: "multiple_choice", prompt: "Mit mondasz búcsúzáskor egy boltban?", options: [{ id: "o1", text: "Cheers, have a good day!" }, { id: "o2", text: "Goodbye forever" }, { id: "o3", text: "See you never" }], correctOptionId: "o1" },
    { id: "gq300", type: "flashcard", prompt: "'Nagyon kedves, köszönöm'", backText: "That's very kind of you", phonetic: "detsz veri kájnd ov jú" } ] },
];
