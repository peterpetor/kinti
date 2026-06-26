import type { Lesson } from "./data";

/**
 * Német (Hochdeutsch) kurzus — a Németországban élő magyaroknak. A svájci Mundart
 * (data.ts) és az osztrák (data-at.ts) ország-megfelelője. Itt NEM dialektus a cél,
 * hanem a hétköznapi, túlélő standard német: köszönés, vásárlás, hivatal (Amt),
 * munka, lakhatás, közlekedés — amit egy újonnan érkezőnek azonnal használnia kell.
 *
 * A lecke-id-k „dl" előtaggal, a kérdés-id-k „dq" előtaggal, hogy NE ütközzenek a
 * CH („l"/„q") és AT („al") id-kkel (a lejátszó mindhárom készletben keres).
 * Bővíthető: ugyanebben a formátumban új fejezetek/leckék adhatók hozzá.
 */
export const LESSONS_DE: Lesson[] = [
  // ══ 1. Fejezet: Alapok ══════════════════════════════
  {
    id: "dl1", title: "Köszönés", description: "Hallo, Guten Tag, Moin — így köszönnek Németországban.", chapter: 1, xpReward: 10,
    questions: [
      { id: "dq1", type: "multiple_choice", prompt: "Hogy mondod hivatalosan: 'Jó napot'?", options: [{ id: "o1", text: "Guten Tag" }, { id: "o2", text: "Grüezi" }, { id: "o3", text: "Grüß Gott" }], correctOptionId: "o1" },
      { id: "dq2", type: "flashcard", prompt: "Informális köszönés (szia, helló)?", backText: "Hallo", phonetic: "Halló" },
      { id: "dq3", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Jó napot (hivatalos)", right: "Guten Tag" }, { id: "p2", left: "Szia (informális)", right: "Hallo" }, { id: "p3", left: "Szia (Észak-Németo.)", right: "Moin" }] },
    ],
  },
  {
    id: "dl2", title: "Búcsúzás", description: "Tschüss, Auf Wiedersehen, Bis bald.", chapter: 1, xpReward: 10,
    questions: [
      { id: "dq4", type: "multiple_choice", prompt: "Informális 'szia' búcsúzáskor?", options: [{ id: "o1", text: "Tschüss" }, { id: "o2", text: "Ciao bella" }, { id: "o3", text: "Pfiat di" }], correctOptionId: "o1" },
      { id: "dq5", type: "flashcard", prompt: "'Viszontlátásra' (hivatalos)?", backText: "Auf Wiedersehen", phonetic: "Auf víderzéen" },
      { id: "dq6", type: "match", prompt: "Párosítsd a búcsúzásokat!", pairs: [{ id: "p1", left: "Szia (búcsú)", right: "Tschüss" }, { id: "p2", left: "Viszontlátásra", right: "Auf Wiedersehen" }, { id: "p3", left: "Hamarosan találkozunk", right: "Bis bald" }] },
    ],
  },
  {
    id: "dl3", title: "Udvariasság", description: "Danke, Bitte, Entschuldigung.", chapter: 1, xpReward: 10,
    questions: [
      { id: "dq7", type: "multiple_choice", prompt: "Hogy mondod: 'Elnézést'?", options: [{ id: "o1", text: "Entschuldigung" }, { id: "o2", text: "Scusi" }, { id: "o3", text: "Sorry" }], correctOptionId: "o1" },
      { id: "dq8", type: "flashcard", prompt: "'Szívesen' (válasz a köszönömre)?", backText: "Gern geschehen", phonetic: "Gern gesé-en" },
      { id: "dq9", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Köszönöm", right: "Danke" }, { id: "p2", left: "Kérlek / Tessék", right: "Bitte" }, { id: "p3", left: "Bocsánat", right: "Entschuldigung" }] },
    ],
  },
  {
    id: "dl4", title: "Bemutatkozás", description: "Wie geht's? Ich heiße…", chapter: 1, xpReward: 15,
    questions: [
      { id: "dq10", type: "multiple_choice", prompt: "Informális 'Hogy vagy?'", options: [{ id: "o1", text: "Wie geht's?" }, { id: "o2", text: "Wia geht's?" }, { id: "o3", text: "Ça va?" }], correctOptionId: "o1" },
      { id: "dq11", type: "flashcard", prompt: "'Örvendek (a találkozásnak)'?", backText: "Freut mich", phonetic: "Frojt mih" },
      { id: "dq12", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Hogy hívnak?", right: "Wie heißt du?" }, { id: "p2", left: "Engem … hívnak", right: "Ich heiße …" }, { id: "p3", left: "Jól vagyok", right: "Mir geht's gut" }] },
    ],
  },
  {
    id: "dl5", title: "Igen, nem, talán", description: "Ja, Nein, Vielleicht, Genau.", chapter: 1, xpReward: 10,
    questions: [
      { id: "dq13", type: "multiple_choice", prompt: "Mit jelent: 'Genau'?", options: [{ id: "o1", text: "Pontosan / Úgy van" }, { id: "o2", text: "Soha" }, { id: "o3", text: "Talán" }], correctOptionId: "o1" },
      { id: "dq14", type: "flashcard", prompt: "'Talán'?", backText: "Vielleicht", phonetic: "Filájht" },
      { id: "dq15", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Igen", right: "Ja" }, { id: "p2", left: "Nem", right: "Nein" }, { id: "p3", left: "Úgy van", right: "Genau" }] },
    ],
  },
  {
    id: "dl6", title: "Kérdőszavak", description: "Wo, was, wann, wie, warum.", chapter: 1, xpReward: 10,
    questions: [
      { id: "dq16", type: "multiple_choice", prompt: "Mit jelent 'Wo'?", options: [{ id: "o1", text: "Hol" }, { id: "o2", text: "Mikor" }, { id: "o3", text: "Mit" }], correctOptionId: "o1" },
      { id: "dq17", type: "flashcard", prompt: "'Miért?'", backText: "Warum?", phonetic: "Varum" },
      { id: "dq18", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Mit?", right: "Was?" }, { id: "p2", left: "Mikor?", right: "Wann?" }, { id: "p3", left: "Ki?", right: "Wer?" }, { id: "p4", left: "Hogyan?", right: "Wie?" }] },
    ],
  },

  // ══ 2. Fejezet: Hétköznapok ══════════════════════════
  {
    id: "dl7", title: "Számok 1–10", description: "eins, zwei, drei…", chapter: 2, xpReward: 10,
    questions: [
      { id: "dq19", type: "multiple_choice", prompt: "Mit jelent 'drei'?", options: [{ id: "o1", text: "három" }, { id: "o2", text: "kettő" }, { id: "o3", text: "négy" }], correctOptionId: "o1" },
      { id: "dq20", type: "flashcard", prompt: "'öt'?", backText: "fünf", phonetic: "fünf" },
      { id: "dq21", type: "match", prompt: "Párosítsd a számokat!", pairs: [{ id: "p1", left: "egy", right: "eins" }, { id: "p2", left: "kettő", right: "zwei" }, { id: "p3", left: "tíz", right: "zehn" }] },
    ],
  },
  {
    id: "dl8", title: "Idő és napszak", description: "Uhr, heute, morgen, jetzt.", chapter: 2, xpReward: 10,
    questions: [
      { id: "dq22", type: "multiple_choice", prompt: "Mit jelent 'morgen'?", options: [{ id: "o1", text: "holnap" }, { id: "o2", text: "tegnap" }, { id: "o3", text: "most" }], correctOptionId: "o1" },
      { id: "dq23", type: "flashcard", prompt: "'Mennyi az idő?'", backText: "Wie spät ist es?", phonetic: "Ví spét iszt esz" },
      { id: "dq24", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "ma", right: "heute" }, { id: "p2", left: "tegnap", right: "gestern" }, { id: "p3", left: "most", right: "jetzt" }] },
    ],
  },
  {
    id: "dl9", title: "Hasznos mondatok", description: "Nem értem. Beszél angolul?", chapter: 2, xpReward: 15,
    questions: [
      { id: "dq25", type: "multiple_choice", prompt: "'Nem értem' németül?", options: [{ id: "o1", text: "Ich verstehe nicht" }, { id: "o2", text: "Ich versteh des net" }, { id: "o3", text: "Non capisco" }], correctOptionId: "o1" },
      { id: "dq26", type: "flashcard", prompt: "'Beszél angolul?'", backText: "Sprechen Sie Englisch?", phonetic: "Sprehen zí englis" },
      { id: "dq27", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Megismételné?", right: "Können Sie das wiederholen?" }, { id: "p2", left: "Lassabban, kérem", right: "Langsamer, bitte" }, { id: "p3", left: "Nem tudom", right: "Ich weiß nicht" }] },
    ],
  },
  {
    id: "dl10", title: "A hét napjai", description: "Montag, Dienstag, Mittwoch…", chapter: 2, xpReward: 10,
    questions: [
      { id: "dq28", type: "multiple_choice", prompt: "Mit jelent 'Montag'?", options: [{ id: "o1", text: "hétfő" }, { id: "o2", text: "vasárnap" }, { id: "o3", text: "péntek" }], correctOptionId: "o1" },
      { id: "dq29", type: "flashcard", prompt: "'hétvége'?", backText: "Wochenende", phonetic: "Vohenende" },
      { id: "dq30", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "péntek", right: "Freitag" }, { id: "p2", left: "szombat", right: "Samstag" }, { id: "p3", left: "vasárnap", right: "Sonntag" }] },
    ],
  },
  {
    id: "dl11", title: "Időjárás", description: "Wetter, kalt, warm, Regen.", chapter: 2, xpReward: 10,
    questions: [
      { id: "dq31", type: "multiple_choice", prompt: "Mit jelent 'kalt'?", options: [{ id: "o1", text: "hideg" }, { id: "o2", text: "meleg" }, { id: "o3", text: "eső" }], correctOptionId: "o1" },
      { id: "dq32", type: "flashcard", prompt: "'esik az eső'?", backText: "Es regnet", phonetic: "Esz régnet" },
      { id: "dq33", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "nap (égitest)", right: "Sonne" }, { id: "p2", left: "hó", right: "Schnee" }, { id: "p3", left: "meleg", right: "warm" }] },
    ],
  },

  // ══ 3. Fejezet: Vásárlás & Étkezés ═══════════════════
  {
    id: "dl12", title: "Vásárlás", description: "Was kostet das? Kasse, Pfand.", chapter: 3, xpReward: 15,
    questions: [
      { id: "dq34", type: "multiple_choice", prompt: "'Mennyibe kerül ez?'", options: [{ id: "o1", text: "Was kostet das?" }, { id: "o2", text: "Wo ist das?" }, { id: "o3", text: "Wer ist das?" }], correctOptionId: "o1" },
      { id: "dq35", type: "flashcard", prompt: "Mit jelent 'Pfand'?", backText: "betétdíj (üveg/doboz)", phonetic: "Pfand" },
      { id: "dq36", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "pénztár", right: "Kasse" }, { id: "p2", left: "blokk / nyugta", right: "Kassenbon" }, { id: "p3", left: "szatyor", right: "Tüte" }] },
    ],
  },
  {
    id: "dl13", title: "Élelmiszer", description: "Brot, Milch, Wasser, Käse.", chapter: 3, xpReward: 10,
    questions: [
      { id: "dq37", type: "multiple_choice", prompt: "Mit jelent 'Brot'?", options: [{ id: "o1", text: "kenyér" }, { id: "o2", text: "tej" }, { id: "o3", text: "víz" }], correctOptionId: "o1" },
      { id: "dq38", type: "flashcard", prompt: "'víz'?", backText: "Wasser", phonetic: "Vasszer" },
      { id: "dq39", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "tej", right: "Milch" }, { id: "p2", left: "sajt", right: "Käse" }, { id: "p3", left: "tojás", right: "Eier" }] },
    ],
  },
  {
    id: "dl14", title: "Étterem", description: "Speisekarte, bestellen, Rechnung.", chapter: 3, xpReward: 15,
    questions: [
      { id: "dq40", type: "multiple_choice", prompt: "'A számlát, kérem!'", options: [{ id: "o1", text: "Die Rechnung, bitte!" }, { id: "o2", text: "Die Speisekarte, bitte!" }, { id: "o3", text: "Einen Moment, bitte!" }], correctOptionId: "o1" },
      { id: "dq41", type: "flashcard", prompt: "'étlap'?", backText: "Speisekarte", phonetic: "Spájzekarte" },
      { id: "dq42", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "rendelni", right: "bestellen" }, { id: "p2", left: "borravaló", right: "Trinkgeld" }, { id: "p3", left: "finom", right: "lecker" }] },
    ],
  },
  {
    id: "dl15", title: "Fizetés", description: "Euro, bar oder Karte?", chapter: 3, xpReward: 10,
    questions: [
      { id: "dq43", type: "multiple_choice", prompt: "'Kártyával lehet fizetni?'", options: [{ id: "o1", text: "Kann ich mit Karte zahlen?" }, { id: "o2", text: "Wo ist die Toilette?" }, { id: "o3", text: "Wie spät ist es?" }], correctOptionId: "o1" },
      { id: "dq44", type: "flashcard", prompt: "Mit jelent 'bar'?", backText: "készpénz(ben)", phonetic: "bár" },
      { id: "dq45", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "készpénz", right: "bar" }, { id: "p2", left: "kártya", right: "Karte" }, { id: "p3", left: "aprópénz", right: "Kleingeld" }] },
    ],
  },

  // ══ 4. Fejezet: Ügyintézés & Munka ═══════════════════
  {
    id: "dl16", title: "A hivatalban", description: "Amt, Termin, Formular, Anmeldung.", chapter: 4, xpReward: 15,
    questions: [
      { id: "dq46", type: "multiple_choice", prompt: "Mit jelent 'Termin'?", options: [{ id: "o1", text: "időpont" }, { id: "o2", text: "végállomás" }, { id: "o3", text: "határidő-túllépés" }], correctOptionId: "o1" },
      { id: "dq47", type: "flashcard", prompt: "'lakcímbejelentés'?", backText: "Anmeldung", phonetic: "Anmeldung" },
      { id: "dq48", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "hivatal", right: "Amt" }, { id: "p2", left: "űrlap", right: "Formular" }, { id: "p3", left: "igazolvány", right: "Ausweis" }] },
    ],
  },
  {
    id: "dl17", title: "Munka", description: "Arbeit, Chef, Kollege, Feierabend.", chapter: 4, xpReward: 15,
    questions: [
      { id: "dq49", type: "multiple_choice", prompt: "Mit jelent 'Feierabend'?", options: [{ id: "o1", text: "a munka utáni szabadidő" }, { id: "o2", text: "ünnepnap" }, { id: "o3", text: "hétvégi buli" }], correctOptionId: "o1" },
      { id: "dq50", type: "flashcard", prompt: "'fizetés' (bér)?", backText: "Gehalt", phonetic: "Gehalt" },
      { id: "dq51", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "munka", right: "Arbeit" }, { id: "p2", left: "főnök", right: "Chef" }, { id: "p3", left: "szabadság (nyaralás)", right: "Urlaub" }] },
    ],
  },
  {
    id: "dl18", title: "Egészség", description: "Arzt, Krankenkasse, Apotheke.", chapter: 4, xpReward: 15,
    questions: [
      { id: "dq52", type: "multiple_choice", prompt: "Mit jelent 'Arzt'?", options: [{ id: "o1", text: "orvos" }, { id: "o2", text: "gyógyszertár" }, { id: "o3", text: "recept" }], correctOptionId: "o1" },
      { id: "dq53", type: "flashcard", prompt: "'Beteg vagyok.'", backText: "Ich bin krank", phonetic: "Ih bin kránk" },
      { id: "dq54", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "egészségbiztosító", right: "Krankenkasse" }, { id: "p2", left: "gyógyszertár", right: "Apotheke" }, { id: "p3", left: "recept", right: "Rezept" }] },
    ],
  },
  {
    id: "dl19", title: "Lakhatás", description: "Wohnung, Miete, Vermieter, Kaution.", chapter: 4, xpReward: 15,
    questions: [
      { id: "dq55", type: "multiple_choice", prompt: "Mit jelent 'Miete'?", options: [{ id: "o1", text: "lakbér" }, { id: "o2", text: "kaúció" }, { id: "o3", text: "rezsi" }], correctOptionId: "o1" },
      { id: "dq56", type: "flashcard", prompt: "'kaúció'?", backText: "Kaution", phonetic: "Kaucijón" },
      { id: "dq57", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "lakás", right: "Wohnung" }, { id: "p2", left: "főbérlő", right: "Vermieter" }, { id: "p3", left: "rezsi (mellékköltség)", right: "Nebenkosten" }] },
    ],
  },
  {
    id: "dl20", title: "Közlekedés", description: "Bahn, Fahrkarte, umsteigen.", chapter: 4, xpReward: 15,
    questions: [
      { id: "dq58", type: "multiple_choice", prompt: "Mit jelent 'Fahrkarte'?", options: [{ id: "o1", text: "menetjegy" }, { id: "o2", text: "pályaudvar" }, { id: "o3", text: "késés" }], correctOptionId: "o1" },
      { id: "dq59", type: "flashcard", prompt: "'átszállni'?", backText: "umsteigen", phonetic: "umstájgen" },
      { id: "dq60", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "vasút / vonat", right: "Bahn" }, { id: "p2", left: "pályaudvar", right: "Bahnhof" }, { id: "p3", left: "késés", right: "Verspätung" }] },
    ],
  },

  // ══ 5. Fejezet: Család & Emberek ═════════════════════
  {
    id: "dl21", title: "Család", description: "Familie, Mutter, Vater, Kind.", chapter: 5, xpReward: 10,
    questions: [
      { id: "dq61", type: "multiple_choice", prompt: "Mit jelent 'Mutter'?", options: [{ id: "o1", text: "anya" }, { id: "o2", text: "apa" }, { id: "o3", text: "gyerek" }], correctOptionId: "o1" },
      { id: "dq62", type: "flashcard", prompt: "'apa'?", backText: "Vater", phonetic: "Fáter" },
      { id: "dq63", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "szülők", right: "Eltern" }, { id: "p2", left: "fiútestvér", right: "Bruder" }, { id: "p3", left: "gyerek", right: "Kind" }] },
    ],
  },
  {
    id: "dl22", title: "Emberek", description: "Mann, Frau, Freund, Nachbar.", chapter: 5, xpReward: 10,
    questions: [
      { id: "dq64", type: "multiple_choice", prompt: "Mit jelent 'Nachbar'?", options: [{ id: "o1", text: "szomszéd" }, { id: "o2", text: "barát" }, { id: "o3", text: "kolléga" }], correctOptionId: "o1" },
      { id: "dq65", type: "flashcard", prompt: "'barátnő'?", backText: "Freundin", phonetic: "Frojndin" },
      { id: "dq66", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "férfi", right: "Mann" }, { id: "p2", left: "nő", right: "Frau" }, { id: "p3", left: "emberek", right: "Leute" }] },
    ],
  },
  {
    id: "dl23", title: "Kor és állapot", description: "Wie alt bist du? verheiratet, ledig.", chapter: 5, xpReward: 15,
    questions: [
      { id: "dq67", type: "multiple_choice", prompt: "'Hány éves vagy?'", options: [{ id: "o1", text: "Wie alt bist du?" }, { id: "o2", text: "Wie geht's dir?" }, { id: "o3", text: "Wer bist du?" }], correctOptionId: "o1" },
      { id: "dq68", type: "flashcard", prompt: "'házas'?", backText: "verheiratet", phonetic: "ferhájratet" },
      { id: "dq69", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "… éves", right: "… Jahre alt" }, { id: "p2", left: "egyedülálló", right: "ledig" }, { id: "p3", left: "gyerekek", right: "Kinder" }] },
    ],
  },
  {
    id: "dl24", title: "Tulajdonságok", description: "groß, klein, nett, müde.", chapter: 5, xpReward: 10,
    questions: [
      { id: "dq70", type: "multiple_choice", prompt: "Mit jelent 'groß'?", options: [{ id: "o1", text: "nagy" }, { id: "o2", text: "kicsi" }, { id: "o3", text: "új" }], correctOptionId: "o1" },
      { id: "dq71", type: "flashcard", prompt: "'fáradt'?", backText: "müde", phonetic: "müde" },
      { id: "dq72", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kicsi", right: "klein" }, { id: "p2", left: "kedves", right: "nett" }, { id: "p3", left: "új", right: "neu" }] },
    ],
  },
  {
    id: "dl25", title: "Érzések", description: "glücklich, traurig, Hunger, Durst.", chapter: 5, xpReward: 15,
    questions: [
      { id: "dq73", type: "multiple_choice", prompt: "'Éhes vagyok.' (Van éhségem)", options: [{ id: "o1", text: "Ich habe Hunger" }, { id: "o2", text: "Ich habe Durst" }, { id: "o3", text: "Ich habe Angst" }], correctOptionId: "o1" },
      { id: "dq74", type: "flashcard", prompt: "'Szomjas vagyok.'", backText: "Ich habe Durst", phonetic: "Ih hábe Durszt" },
      { id: "dq75", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "boldog", right: "glücklich" }, { id: "p2", left: "szomorú", right: "traurig" }, { id: "p3", left: "félelem", right: "Angst" }] },
    ],
  },

  // ══ 6. Fejezet: Test & Egészség ══════════════════════
  {
    id: "dl26", title: "Testrészek", description: "Kopf, Hand, Bein, Auge.", chapter: 6, xpReward: 10,
    questions: [
      { id: "dq76", type: "multiple_choice", prompt: "Mit jelent 'Kopf'?", options: [{ id: "o1", text: "fej" }, { id: "o2", text: "kéz" }, { id: "o3", text: "láb" }], correctOptionId: "o1" },
      { id: "dq77", type: "flashcard", prompt: "'kéz'?", backText: "Hand", phonetic: "Hand" },
      { id: "dq78", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "láb (alsó végtag)", right: "Bein" }, { id: "p2", left: "szem", right: "Auge" }, { id: "p3", left: "hát", right: "Rücken" }] },
    ],
  },
  {
    id: "dl27", title: "Fájdalom", description: "Schmerzen, Kopfschmerzen, weh tun.", chapter: 6, xpReward: 15,
    questions: [
      { id: "dq79", type: "multiple_choice", prompt: "Mit jelent 'Kopfschmerzen'?", options: [{ id: "o1", text: "fejfájás" }, { id: "o2", text: "hasfájás" }, { id: "o3", text: "fogfájás" }], correctOptionId: "o1" },
      { id: "dq80", type: "flashcard", prompt: "'Fáj.' (fáj nekem)", backText: "Es tut weh", phonetic: "Esz tút vé" },
      { id: "dq81", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "fájdalom", right: "Schmerzen" }, { id: "p2", left: "hasfájás", right: "Bauchschmerzen" }, { id: "p3", left: "fogfájás", right: "Zahnschmerzen" }] },
    ],
  },
  {
    id: "dl28", title: "Tünetek", description: "Fieber, Husten, Erkältung.", chapter: 6, xpReward: 10,
    questions: [
      { id: "dq82", type: "multiple_choice", prompt: "Mit jelent 'Fieber'?", options: [{ id: "o1", text: "láz" }, { id: "o2", text: "köhögés" }, { id: "o3", text: "nátha" }], correctOptionId: "o1" },
      { id: "dq83", type: "flashcard", prompt: "'megfázás'?", backText: "Erkältung", phonetic: "Erkeltung" },
      { id: "dq84", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "köhögés", right: "Husten" }, { id: "p2", left: "nátha", right: "Schnupfen" }, { id: "p3", left: "láz", right: "Fieber" }] },
    ],
  },
  {
    id: "dl29", title: "Vészhelyzet", description: "Notruf 112, Hilfe, Polizei.", chapter: 6, xpReward: 15,
    questions: [
      { id: "dq85", type: "multiple_choice", prompt: "Mi a segélyhívó szám Németországban?", options: [{ id: "o1", text: "112" }, { id: "o2", text: "911" }, { id: "o3", text: "144" }], correctOptionId: "o1" },
      { id: "dq86", type: "flashcard", prompt: "'Segítség!'", backText: "Hilfe!", phonetic: "Hilfe" },
      { id: "dq87", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "rendőrség", right: "Polizei" }, { id: "p2", left: "mentő", right: "Krankenwagen" }, { id: "p3", left: "tűzoltóság", right: "Feuerwehr" }] },
    ],
  },
  {
    id: "dl30", title: "Gyógyszertár", description: "Apotheke, Medikament, Tablette.", chapter: 6, xpReward: 10,
    questions: [
      { id: "dq88", type: "multiple_choice", prompt: "Mit jelent 'Tablette'?", options: [{ id: "o1", text: "tabletta" }, { id: "o2", text: "recept" }, { id: "o3", text: "kötszer" }], correctOptionId: "o1" },
      { id: "dq89", type: "flashcard", prompt: "'gyógyszer'?", backText: "Medikament", phonetic: "Medikáment" },
      { id: "dq90", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "gyógyszertár", right: "Apotheke" }, { id: "p2", left: "recept", right: "Rezept" }, { id: "p3", left: "fájdalomcsillapító", right: "Schmerzmittel" }] },
    ],
  },

  // ══ 7. Fejezet: Otthon & Kommunikáció ════════════════
  {
    id: "dl31", title: "A lakásban", description: "Küche, Bad, Schlafzimmer, Möbel.", chapter: 7, xpReward: 10,
    questions: [
      { id: "dq91", type: "multiple_choice", prompt: "Mit jelent 'Küche'?", options: [{ id: "o1", text: "konyha" }, { id: "o2", text: "fürdő" }, { id: "o3", text: "hálószoba" }], correctOptionId: "o1" },
      { id: "dq92", type: "flashcard", prompt: "'fürdőszoba'?", backText: "Badezimmer", phonetic: "Bádecimmer" },
      { id: "dq93", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "hálószoba", right: "Schlafzimmer" }, { id: "p2", left: "nappali", right: "Wohnzimmer" }, { id: "p3", left: "ajtó", right: "Tür" }] },
    ],
  },
  {
    id: "dl32", title: "Telefon & internet", description: "Handy, anrufen, WLAN, SMS.", chapter: 7, xpReward: 15,
    questions: [
      { id: "dq94", type: "multiple_choice", prompt: "Mit jelent 'Handy'?", options: [{ id: "o1", text: "mobiltelefon" }, { id: "o2", text: "töltő" }, { id: "o3", text: "wifi" }], correctOptionId: "o1" },
      { id: "dq95", type: "flashcard", prompt: "'felhívni (telefonon)'?", backText: "anrufen", phonetic: "anrúfen" },
      { id: "dq96", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "wifi", right: "WLAN" }, { id: "p2", left: "e-mail", right: "E-Mail" }, { id: "p3", left: "üzenet", right: "Nachricht" }] },
    ],
  },
  {
    id: "dl33", title: "Bank", description: "Konto, Geld, überweisen, abheben.", chapter: 7, xpReward: 15,
    questions: [
      { id: "dq97", type: "multiple_choice", prompt: "Mit jelent 'überweisen'?", options: [{ id: "o1", text: "utalni" }, { id: "o2", text: "felvenni" }, { id: "o3", text: "megtakarítani" }], correctOptionId: "o1" },
      { id: "dq98", type: "flashcard", prompt: "'(bank)számla'?", backText: "Konto", phonetic: "Kontó" },
      { id: "dq99", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "pénz", right: "Geld" }, { id: "p2", left: "készpénzt felvenni", right: "abheben" }, { id: "p3", left: "bankkártya", right: "EC-Karte" }] },
    ],
  },
  {
    id: "dl34", title: "Posta", description: "Post, Brief, Paket, Briefmarke.", chapter: 7, xpReward: 10,
    questions: [
      { id: "dq100", type: "multiple_choice", prompt: "Mit jelent 'Paket'?", options: [{ id: "o1", text: "csomag" }, { id: "o2", text: "levél" }, { id: "o3", text: "bélyeg" }], correctOptionId: "o1" },
      { id: "dq101", type: "flashcard", prompt: "'bélyeg'?", backText: "Briefmarke", phonetic: "Brífmarke" },
      { id: "dq102", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "levél", right: "Brief" }, { id: "p2", left: "posta", right: "Post" }, { id: "p3", left: "átvenni (csomagot)", right: "abholen" }] },
    ],
  },
  {
    id: "dl35", title: "Irányok", description: "links, rechts, geradeaus, Ampel.", chapter: 7, xpReward: 10,
    questions: [
      { id: "dq103", type: "multiple_choice", prompt: "Mit jelent 'rechts'?", options: [{ id: "o1", text: "jobbra" }, { id: "o2", text: "balra" }, { id: "o3", text: "egyenesen" }], correctOptionId: "o1" },
      { id: "dq104", type: "flashcard", prompt: "'egyenesen (előre)'?", backText: "geradeaus", phonetic: "gerádeausz" },
      { id: "dq105", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "balra", right: "links" }, { id: "p2", left: "sarok", right: "Ecke" }, { id: "p3", left: "jelzőlámpa", right: "Ampel" }] },
    ],
  },

  // ══ 8. Fejezet: Étkezés & Konyha ═════════════════════
  {
    id: "dl36", title: "Gyümölcsök", description: "Obst: Apfel, Banane, Orange.", chapter: 8, xpReward: 10,
    questions: [
      { id: "dq106", type: "multiple_choice", prompt: "Mit jelent 'Apfel'?", options: [{ id: "o1", text: "alma" }, { id: "o2", text: "körte" }, { id: "o3", text: "szőlő" }], correctOptionId: "o1" },
      { id: "dq107", type: "flashcard", prompt: "'körte'?", backText: "Birne", phonetic: "Birne" },
      { id: "dq108", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "banán", right: "Banane" }, { id: "p2", left: "eper", right: "Erdbeere" }, { id: "p3", left: "gyümölcs", right: "Obst" }] },
    ],
  },
  {
    id: "dl37", title: "Zöldségek", description: "Gemüse: Kartoffel, Tomate, Zwiebel.", chapter: 8, xpReward: 10,
    questions: [
      { id: "dq109", type: "multiple_choice", prompt: "Mit jelent 'Kartoffel'?", options: [{ id: "o1", text: "burgonya" }, { id: "o2", text: "hagyma" }, { id: "o3", text: "paradicsom" }], correctOptionId: "o1" },
      { id: "dq110", type: "flashcard", prompt: "'hagyma'?", backText: "Zwiebel", phonetic: "Cvíbel" },
      { id: "dq111", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "paradicsom", right: "Tomate" }, { id: "p2", left: "uborka", right: "Gurke" }, { id: "p3", left: "zöldség", right: "Gemüse" }] },
    ],
  },
  {
    id: "dl38", title: "Italok", description: "Getränke: Kaffee, Bier, Saft.", chapter: 8, xpReward: 10,
    questions: [
      { id: "dq112", type: "multiple_choice", prompt: "Mit jelent 'Saft'?", options: [{ id: "o1", text: "gyümölcslé" }, { id: "o2", text: "kávé" }, { id: "o3", text: "sör" }], correctOptionId: "o1" },
      { id: "dq113", type: "flashcard", prompt: "'kávé'?", backText: "Kaffee", phonetic: "Káfé" },
      { id: "dq114", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "sör", right: "Bier" }, { id: "p2", left: "bor", right: "Wein" }, { id: "p3", left: "tea", right: "Tee" }] },
    ],
  },
  {
    id: "dl39", title: "Reggeli", description: "Frühstück: Brötchen, Ei, Marmelade.", chapter: 8, xpReward: 10,
    questions: [
      { id: "dq115", type: "multiple_choice", prompt: "Mit jelent 'Frühstück'?", options: [{ id: "o1", text: "reggeli" }, { id: "o2", text: "ebéd" }, { id: "o3", text: "vacsora" }], correctOptionId: "o1" },
      { id: "dq116", type: "flashcard", prompt: "'zsemle'?", backText: "Brötchen", phonetic: "Brőthen" },
      { id: "dq117", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "tojás", right: "Ei" }, { id: "p2", left: "lekvár", right: "Marmelade" }, { id: "p3", left: "vaj", right: "Butter" }] },
    ],
  },
  {
    id: "dl40", title: "Főzés", description: "kochen, braten, Pfanne, Topf.", chapter: 8, xpReward: 15,
    questions: [
      { id: "dq118", type: "multiple_choice", prompt: "Mit jelent 'kochen'?", options: [{ id: "o1", text: "főzni" }, { id: "o2", text: "sütni" }, { id: "o3", text: "vágni" }], correctOptionId: "o1" },
      { id: "dq119", type: "flashcard", prompt: "'serpenyő'?", backText: "Pfanne", phonetic: "Pfanne" },
      { id: "dq120", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "fazék", right: "Topf" }, { id: "p2", left: "kés", right: "Messer" }, { id: "p3", left: "tányér", right: "Teller" }] },
    ],
  },

  // ══ 9. Fejezet: Vásárlás & Ruházat ═══════════════════
  {
    id: "dl41", title: "Ruhák", description: "Kleidung: Hose, Hemd, Jacke.", chapter: 9, xpReward: 10,
    questions: [
      { id: "dq121", type: "multiple_choice", prompt: "Mit jelent 'Hose'?", options: [{ id: "o1", text: "nadrág" }, { id: "o2", text: "ing" }, { id: "o3", text: "kabát" }], correctOptionId: "o1" },
      { id: "dq122", type: "flashcard", prompt: "'pulóver'?", backText: "Pullover", phonetic: "Pullóver" },
      { id: "dq123", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "ing", right: "Hemd" }, { id: "p2", left: "dzseki / kabát", right: "Jacke" }, { id: "p3", left: "ruha (női)", right: "Kleid" }] },
    ],
  },
  {
    id: "dl42", title: "Cipő és méret", description: "Schuhe, Größe, passen.", chapter: 9, xpReward: 15,
    questions: [
      { id: "dq124", type: "multiple_choice", prompt: "'Felpróbálhatom?'", options: [{ id: "o1", text: "Kann ich das anprobieren?" }, { id: "o2", text: "Was kostet das?" }, { id: "o3", text: "Wo ist die Kasse?" }], correctOptionId: "o1" },
      { id: "dq125", type: "flashcard", prompt: "'méret'?", backText: "Größe", phonetic: "Grősze" },
      { id: "dq126", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "cipő", right: "Schuhe" }, { id: "p2", left: "passzol / illik", right: "passt" }, { id: "p3", left: "próbafülke", right: "Umkleidekabine" }] },
    ],
  },
  {
    id: "dl43", title: "Színek", description: "Farben: rot, blau, grün.", chapter: 9, xpReward: 10,
    questions: [
      { id: "dq127", type: "multiple_choice", prompt: "Mit jelent 'rot'?", options: [{ id: "o1", text: "piros" }, { id: "o2", text: "kék" }, { id: "o3", text: "zöld" }], correctOptionId: "o1" },
      { id: "dq128", type: "flashcard", prompt: "'fekete'?", backText: "schwarz", phonetic: "svarc" },
      { id: "dq129", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kék", right: "blau" }, { id: "p2", left: "zöld", right: "grün" }, { id: "p3", left: "fehér", right: "weiß" }] },
    ],
  },
  {
    id: "dl44", title: "Üzletek", description: "Bäckerei, Metzgerei, Drogerie.", chapter: 9, xpReward: 10,
    questions: [
      { id: "dq130", type: "multiple_choice", prompt: "Mit jelent 'Bäckerei'?", options: [{ id: "o1", text: "pékség" }, { id: "o2", text: "hentes" }, { id: "o3", text: "drogéria" }], correctOptionId: "o1" },
      { id: "dq131", type: "flashcard", prompt: "'hentes(üzlet)'?", backText: "Metzgerei", phonetic: "Meckeráj" },
      { id: "dq132", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "drogéria", right: "Drogerie" }, { id: "p2", left: "szupermarket", right: "Supermarkt" }, { id: "p3", left: "piac", right: "Markt" }] },
    ],
  },
  {
    id: "dl45", title: "Akciók", description: "Angebot, Rabatt, reduziert.", chapter: 9, xpReward: 15,
    questions: [
      { id: "dq133", type: "multiple_choice", prompt: "Mit jelent 'Angebot'?", options: [{ id: "o1", text: "akció / ajánlat" }, { id: "o2", text: "számla" }, { id: "o3", text: "nyitvatartás" }], correctOptionId: "o1" },
      { id: "dq134", type: "flashcard", prompt: "'kedvezmény'?", backText: "Rabatt", phonetic: "Rabatt" },
      { id: "dq135", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "leárazva", right: "reduziert" }, { id: "p2", left: "akcióban", right: "im Angebot" }, { id: "p3", left: "jó vétel", right: "Schnäppchen" }] },
    ],
  },

  // ══ 10. Fejezet: Munka & Állás ═══════════════════════
  {
    id: "dl46", title: "Foglalkozások", description: "Beruf: Arzt, Lehrer, Handwerker.", chapter: 10, xpReward: 10,
    questions: [
      { id: "dq136", type: "multiple_choice", prompt: "Mit jelent 'Lehrer'?", options: [{ id: "o1", text: "tanár" }, { id: "o2", text: "orvos" }, { id: "o3", text: "eladó" }], correctOptionId: "o1" },
      { id: "dq137", type: "flashcard", prompt: "'szakmunkás / mester'?", backText: "Handwerker", phonetic: "Handverker" },
      { id: "dq138", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "foglalkozás", right: "Beruf" }, { id: "p2", left: "eladó", right: "Verkäufer" }, { id: "p3", left: "szakács", right: "Koch" }] },
    ],
  },
  {
    id: "dl47", title: "Álláskeresés", description: "Bewerbung, Lebenslauf, Gespräch.", chapter: 10, xpReward: 15,
    questions: [
      { id: "dq139", type: "multiple_choice", prompt: "Mit jelent 'Lebenslauf'?", options: [{ id: "o1", text: "önéletrajz" }, { id: "o2", text: "fizetés" }, { id: "o3", text: "szerződés" }], correctOptionId: "o1" },
      { id: "dq140", type: "flashcard", prompt: "'állásinterjú'?", backText: "Vorstellungsgespräch", phonetic: "Forstellungsgespréh" },
      { id: "dq141", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "pályázat / jelentkezés", right: "Bewerbung" }, { id: "p2", left: "motivációs levél", right: "Anschreiben" }, { id: "p3", left: "állásajánlat", right: "Stellenangebot" }] },
    ],
  },
  {
    id: "dl48", title: "Munkahely", description: "Büro, Schicht, Pause, Überstunden.", chapter: 10, xpReward: 10,
    questions: [
      { id: "dq142", type: "multiple_choice", prompt: "Mit jelent 'Überstunden'?", options: [{ id: "o1", text: "túlóra" }, { id: "o2", text: "szünet" }, { id: "o3", text: "műszak" }], correctOptionId: "o1" },
      { id: "dq143", type: "flashcard", prompt: "'műszak'?", backText: "Schicht", phonetic: "Siht" },
      { id: "dq144", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "iroda", right: "Büro" }, { id: "p2", left: "szünet", right: "Pause" }, { id: "p3", left: "kolléga", right: "Kollege" }] },
    ],
  },
  {
    id: "dl49", title: "Szerződés", description: "Vertrag, Kündigung, Probezeit.", chapter: 10, xpReward: 15,
    questions: [
      { id: "dq145", type: "multiple_choice", prompt: "Mit jelent 'Probezeit'?", options: [{ id: "o1", text: "próbaidő" }, { id: "o2", text: "felmondás" }, { id: "o3", text: "szabadság" }], correctOptionId: "o1" },
      { id: "dq146", type: "flashcard", prompt: "'felmondás'?", backText: "Kündigung", phonetic: "Kündigung" },
      { id: "dq147", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "szerződés", right: "Vertrag" }, { id: "p2", left: "határozott idejű", right: "befristet" }, { id: "p3", left: "határozatlan idejű", right: "unbefristet" }] },
    ],
  },
  {
    id: "dl50", title: "Fizetés és adó", description: "Gehalt, Steuer, brutto, netto.", chapter: 10, xpReward: 15,
    questions: [
      { id: "dq148", type: "multiple_choice", prompt: "Mit jelent 'brutto'?", options: [{ id: "o1", text: "bruttó (adó előtt)" }, { id: "o2", text: "nettó (kézhez kapott)" }, { id: "o3", text: "borravaló" }], correctOptionId: "o1" },
      { id: "dq149", type: "flashcard", prompt: "'adó'?", backText: "Steuer", phonetic: "Stojer" },
      { id: "dq150", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "fizetés (bér)", right: "Gehalt" }, { id: "p2", left: "nettó", right: "netto" }, { id: "p3", left: "társadalombiztosítás", right: "Sozialversicherung" }] },
    ],
  },

  // ══ 11. Fejezet: Idő & Naptár ════════════════════════
  {
    id: "dl51", title: "Hónapok", description: "Januar, Februar, März…", chapter: 11, xpReward: 10,
    questions: [
      { id: "dq151", type: "multiple_choice", prompt: "Mit jelent 'März'?", options: [{ id: "o1", text: "március" }, { id: "o2", text: "május" }, { id: "o3", text: "január" }], correctOptionId: "o1" },
      { id: "dq152", type: "flashcard", prompt: "'december'?", backText: "Dezember", phonetic: "December" },
      { id: "dq153", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "január", right: "Januar" }, { id: "p2", left: "július", right: "Juli" }, { id: "p3", left: "október", right: "Oktober" }] },
    ],
  },
  {
    id: "dl52", title: "Évszakok", description: "Frühling, Sommer, Herbst, Winter.", chapter: 11, xpReward: 10,
    questions: [
      { id: "dq154", type: "multiple_choice", prompt: "Mit jelent 'Frühling'?", options: [{ id: "o1", text: "tavasz" }, { id: "o2", text: "nyár" }, { id: "o3", text: "ősz" }], correctOptionId: "o1" },
      { id: "dq155", type: "flashcard", prompt: "'ősz'?", backText: "Herbst", phonetic: "Herpszt" },
      { id: "dq156", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "nyár", right: "Sommer" }, { id: "p2", left: "tél", right: "Winter" }, { id: "p3", left: "évszak", right: "Jahreszeit" }] },
    ],
  },
  {
    id: "dl53", title: "Pontos idő", description: "halb, Viertel, Uhr.", chapter: 11, xpReward: 15,
    questions: [
      { id: "dq157", type: "multiple_choice", prompt: "'halb drei' hány óra?", options: [{ id: "o1", text: "fél három (2:30)" }, { id: "o2", text: "három óra" }, { id: "o3", text: "negyed három" }], correctOptionId: "o1" },
      { id: "dq158", type: "flashcard", prompt: "'negyed' (óra)?", backText: "Viertel", phonetic: "Firtel" },
      { id: "dq159", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "óra (eszköz/idő)", right: "Uhr" }, { id: "p2", left: "perc", right: "Minute" }, { id: "p3", left: "…-kor (időpontnál)", right: "um" }] },
    ],
  },
  {
    id: "dl54", title: "Gyakoriság", description: "immer, oft, manchmal, nie.", chapter: 11, xpReward: 10,
    questions: [
      { id: "dq160", type: "multiple_choice", prompt: "Mit jelent 'immer'?", options: [{ id: "o1", text: "mindig" }, { id: "o2", text: "soha" }, { id: "o3", text: "néha" }], correctOptionId: "o1" },
      { id: "dq161", type: "flashcard", prompt: "'soha'?", backText: "nie", phonetic: "ní" },
      { id: "dq162", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "gyakran", right: "oft" }, { id: "p2", left: "néha", right: "manchmal" }, { id: "p3", left: "ritkán", right: "selten" }] },
    ],
  },
  {
    id: "dl55", title: "Ünnepek", description: "Weihnachten, Ostern, Silvester.", chapter: 11, xpReward: 10,
    questions: [
      { id: "dq163", type: "multiple_choice", prompt: "Mit jelent 'Weihnachten'?", options: [{ id: "o1", text: "karácsony" }, { id: "o2", text: "húsvét" }, { id: "o3", text: "szilveszter" }], correctOptionId: "o1" },
      { id: "dq164", type: "flashcard", prompt: "'húsvét'?", backText: "Ostern", phonetic: "Osztern" },
      { id: "dq165", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "szilveszter", right: "Silvester" }, { id: "p2", left: "ünnepnap", right: "Feiertag" }, { id: "p3", left: "Boldog Karácsonyt", right: "Frohe Weihnachten" }] },
    ],
  },

  // ══ 12. Fejezet: Város & Tájékozódás ═════════════════
  {
    id: "dl56", title: "Helyek a városban", description: "Bahnhof, Krankenhaus, Rathaus.", chapter: 12, xpReward: 10,
    questions: [
      { id: "dq166", type: "multiple_choice", prompt: "Mit jelent 'Rathaus'?", options: [{ id: "o1", text: "városháza" }, { id: "o2", text: "kórház" }, { id: "o3", text: "pályaudvar" }], correctOptionId: "o1" },
      { id: "dq167", type: "flashcard", prompt: "'kórház'?", backText: "Krankenhaus", phonetic: "Kránkenhausz" },
      { id: "dq168", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "pályaudvar", right: "Bahnhof" }, { id: "p2", left: "templom", right: "Kirche" }, { id: "p3", left: "park", right: "Park" }] },
    ],
  },
  {
    id: "dl57", title: "Útbaigazítás", description: "Wie komme ich zu…?", chapter: 12, xpReward: 15,
    questions: [
      { id: "dq169", type: "multiple_choice", prompt: "'Hogy jutok el a pályaudvarhoz?'", options: [{ id: "o1", text: "Wie komme ich zum Bahnhof?" }, { id: "o2", text: "Was kostet der Bahnhof?" }, { id: "o3", text: "Wann ist der Bahnhof?" }], correctOptionId: "o1" },
      { id: "dq170", type: "flashcard", prompt: "'a közelben'?", backText: "in der Nähe", phonetic: "in der Néhe" },
      { id: "dq171", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "messze", right: "weit" }, { id: "p2", left: "közel", right: "nah" }, { id: "p3", left: "itt", right: "hier" }] },
    ],
  },
  {
    id: "dl58", title: "Tömegközlekedés", description: "U-Bahn, Haltestelle, einsteigen.", chapter: 12, xpReward: 15,
    questions: [
      { id: "dq172", type: "multiple_choice", prompt: "Mit jelent 'Haltestelle'?", options: [{ id: "o1", text: "megálló" }, { id: "o2", text: "menetjegy" }, { id: "o3", text: "késés" }], correctOptionId: "o1" },
      { id: "dq173", type: "flashcard", prompt: "'beszállni'?", backText: "einsteigen", phonetic: "ájnstájgen" },
      { id: "dq174", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "metró", right: "U-Bahn" }, { id: "p2", left: "villamos", right: "Straßenbahn" }, { id: "p3", left: "kiszállni", right: "aussteigen" }] },
    ],
  },
  {
    id: "dl59", title: "Autó & vezetés", description: "Auto, tanken, Führerschein.", chapter: 12, xpReward: 10,
    questions: [
      { id: "dq175", type: "multiple_choice", prompt: "Mit jelent 'tanken'?", options: [{ id: "o1", text: "tankolni" }, { id: "o2", text: "parkolni" }, { id: "o3", text: "vezetni" }], correctOptionId: "o1" },
      { id: "dq176", type: "flashcard", prompt: "'jogosítvány'?", backText: "Führerschein", phonetic: "Fűrersájn" },
      { id: "dq177", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "autó", right: "Auto" }, { id: "p2", left: "parkoló", right: "Parkplatz" }, { id: "p3", left: "autószerviz", right: "Werkstatt" }] },
    ],
  },
  {
    id: "dl60", title: "Jegyek", description: "Ticket, entwerten, Kontrolle.", chapter: 12, xpReward: 15,
    questions: [
      { id: "dq178", type: "multiple_choice", prompt: "Mit jelent 'entwerten'?", options: [{ id: "o1", text: "(jegyet) érvényesíteni" }, { id: "o2", text: "venni" }, { id: "o3", text: "eldobni" }], correctOptionId: "o1" },
      { id: "dq179", type: "flashcard", prompt: "'bírság'?", backText: "Bußgeld", phonetic: "Búszgeld" },
      { id: "dq180", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "jegy", right: "Ticket" }, { id: "p2", left: "ellenőrzés", right: "Kontrolle" }, { id: "p3", left: "bliccelés", right: "Schwarzfahren" }] },
    ],
  },

  // ══ 13. Fejezet: Számok & Mennyiség ══════════════════
  {
    id: "dl61", title: "Számok 11–20", description: "elf, zwölf, dreizehn…", chapter: 13, xpReward: 10,
    questions: [
      { id: "dq181", type: "multiple_choice", prompt: "Mit jelent 'zwölf'?", options: [{ id: "o1", text: "tizenkettő" }, { id: "o2", text: "tizenegy" }, { id: "o3", text: "húsz" }], correctOptionId: "o1" },
      { id: "dq182", type: "flashcard", prompt: "'húsz'?", backText: "zwanzig", phonetic: "cváncig" },
      { id: "dq183", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "tizenegy", right: "elf" }, { id: "p2", left: "tizenhárom", right: "dreizehn" }, { id: "p3", left: "tizenöt", right: "fünfzehn" }] },
    ],
  },
  {
    id: "dl62", title: "Tízesek & százak", description: "zwanzig, hundert, tausend.", chapter: 13, xpReward: 10,
    questions: [
      { id: "dq184", type: "multiple_choice", prompt: "Mit jelent 'hundert'?", options: [{ id: "o1", text: "száz" }, { id: "o2", text: "ezer" }, { id: "o3", text: "harminc" }], correctOptionId: "o1" },
      { id: "dq185", type: "flashcard", prompt: "'ezer'?", backText: "tausend", phonetic: "tauzend" },
      { id: "dq186", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "harminc", right: "dreißig" }, { id: "p2", left: "ötven", right: "fünfzig" }, { id: "p3", left: "negyven", right: "vierzig" }] },
    ],
  },
  {
    id: "dl63", title: "Sorszámok", description: "erste, zweite, dritte.", chapter: 13, xpReward: 10,
    questions: [
      { id: "dq187", type: "multiple_choice", prompt: "Mit jelent 'erste'?", options: [{ id: "o1", text: "első" }, { id: "o2", text: "második" }, { id: "o3", text: "harmadik" }], correctOptionId: "o1" },
      { id: "dq188", type: "flashcard", prompt: "'harmadik'?", backText: "dritte", phonetic: "dritte" },
      { id: "dq189", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "második", right: "zweite" }, { id: "p2", left: "negyedik", right: "vierte" }, { id: "p3", left: "utolsó", right: "letzte" }] },
    ],
  },
  {
    id: "dl64", title: "Mértékegységek", description: "Kilo, Liter, Meter, Gramm.", chapter: 13, xpReward: 10,
    questions: [
      { id: "dq190", type: "multiple_choice", prompt: "'Egy kiló almát, kérem.'", options: [{ id: "o1", text: "Ein Kilo Äpfel, bitte." }, { id: "o2", text: "Ein Liter Äpfel, bitte." }, { id: "o3", text: "Ein Meter Äpfel, bitte." }], correctOptionId: "o1" },
      { id: "dq191", type: "flashcard", prompt: "'fél' (mennyiség)?", backText: "ein halbes / halb", phonetic: "ájn halbesz" },
      { id: "dq192", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "liter", right: "Liter" }, { id: "p2", left: "darab", right: "Stück" }, { id: "p3", left: "gramm", right: "Gramm" }] },
    ],
  },
  {
    id: "dl65", title: "Ár és jelzők", description: "teuer, billig, kostenlos.", chapter: 13, xpReward: 10,
    questions: [
      { id: "dq193", type: "multiple_choice", prompt: "Mit jelent 'teuer'?", options: [{ id: "o1", text: "drága" }, { id: "o2", text: "olcsó" }, { id: "o3", text: "ingyenes" }], correctOptionId: "o1" },
      { id: "dq194", type: "flashcard", prompt: "'ingyenes'?", backText: "kostenlos", phonetic: "kosztenlósz" },
      { id: "dq195", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "olcsó", right: "billig" }, { id: "p2", left: "kedvező árú", right: "günstig" }, { id: "p3", left: "cent", right: "Cent" }] },
    ],
  },

  // ══ 14. Fejezet: Lakhatás részletek ══════════════════
  {
    id: "dl66", title: "Lakáskeresés", description: "Wohnung mieten, Besichtigung, Makler.", chapter: 14, xpReward: 15,
    questions: [
      { id: "dq196", type: "multiple_choice", prompt: "Mit jelent 'Besichtigung'?", options: [{ id: "o1", text: "lakásmegtekintés" }, { id: "o2", text: "költözés" }, { id: "o3", text: "felmondás" }], correctOptionId: "o1" },
      { id: "dq197", type: "flashcard", prompt: "'ingatlanközvetítő'?", backText: "Makler", phonetic: "Mákler" },
      { id: "dq198", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bérelni", right: "mieten" }, { id: "p2", left: "bérlő", right: "Mieter" }, { id: "p3", left: "költözni", right: "umziehen" }] },
    ],
  },
  {
    id: "dl67", title: "Bérleti szerződés", description: "Mietvertrag, Kaution, Nebenkosten.", chapter: 14, xpReward: 15,
    questions: [
      { id: "dq199", type: "multiple_choice", prompt: "Mit jelent 'Kaltmiete'?", options: [{ id: "o1", text: "lakbér rezsi nélkül" }, { id: "o2", text: "lakbér rezsivel" }, { id: "o3", text: "kaúció" }], correctOptionId: "o1" },
      { id: "dq200", type: "flashcard", prompt: "'bérleti szerződés'?", backText: "Mietvertrag", phonetic: "Mítfertrág" },
      { id: "dq201", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kaúció", right: "Kaution" }, { id: "p2", left: "rezsi (mellékköltség)", right: "Nebenkosten" }, { id: "p3", left: "lakbér rezsivel", right: "Warmmiete" }] },
    ],
  },
  {
    id: "dl68", title: "Rezsi", description: "Strom, Wasser, Heizung, Internet.", chapter: 14, xpReward: 10,
    questions: [
      { id: "dq202", type: "multiple_choice", prompt: "Mit jelent 'Strom'?", options: [{ id: "o1", text: "áram (villany)" }, { id: "o2", text: "víz" }, { id: "o3", text: "fűtés" }], correctOptionId: "o1" },
      { id: "dq203", type: "flashcard", prompt: "'fűtés'?", backText: "Heizung", phonetic: "Hájcung" },
      { id: "dq204", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "víz", right: "Wasser" }, { id: "p2", left: "gáz", right: "Gas" }, { id: "p3", left: "internetcsatlakozás", right: "Internetanschluss" }] },
    ],
  },
  {
    id: "dl69", title: "Házszabályok", description: "Mülltrennung, Hausordnung, Ruhezeit.", chapter: 14, xpReward: 15,
    questions: [
      { id: "dq205", type: "multiple_choice", prompt: "Mit jelent 'Ruhezeit'?", options: [{ id: "o1", text: "csendrendelet (pihenőidő)" }, { id: "o2", text: "takarítás" }, { id: "o3", text: "nyitvatartás" }], correctOptionId: "o1" },
      { id: "dq206", type: "flashcard", prompt: "'szelektív szemétgyűjtés'?", backText: "Mülltrennung", phonetic: "Mülltrennung" },
      { id: "dq207", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "házirend", right: "Hausordnung" }, { id: "p2", left: "szemét", right: "Müll" }, { id: "p3", left: "szomszéd", right: "Nachbar" }] },
    ],
  },
  {
    id: "dl70", title: "Lakásproblémák", description: "Schaden, reparieren, Hausmeister.", chapter: 14, xpReward: 10,
    questions: [
      { id: "dq208", type: "multiple_choice", prompt: "Mit jelent 'kaputt'?", options: [{ id: "o1", text: "elromlott" }, { id: "o2", text: "új" }, { id: "o3", text: "tiszta" }], correctOptionId: "o1" },
      { id: "dq209", type: "flashcard", prompt: "'gondnok / házmester'?", backText: "Hausmeister", phonetic: "Hauszmájszter" },
      { id: "dq210", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kár / hiba", right: "Schaden" }, { id: "p2", left: "megjavítani", right: "reparieren" }, { id: "p3", left: "csap (víz)", right: "Wasserhahn" }] },
    ],
  },

  // ══ 15. Fejezet: Gyerek & Iskola ═════════════════════
  {
    id: "dl71", title: "Gyerekek", description: "Kind, Baby, Spielplatz, Windel.", chapter: 15, xpReward: 10,
    questions: [
      { id: "dq211", type: "multiple_choice", prompt: "Mit jelent 'Spielplatz'?", options: [{ id: "o1", text: "játszótér" }, { id: "o2", text: "óvoda" }, { id: "o3", text: "iskola" }], correctOptionId: "o1" },
      { id: "dq212", type: "flashcard", prompt: "'pelenka'?", backText: "Windel", phonetic: "Vindel" },
      { id: "dq213", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "baba", right: "Baby" }, { id: "p2", left: "babakocsi", right: "Kinderwagen" }, { id: "p3", left: "gyerek", right: "Kind" }] },
    ],
  },
  {
    id: "dl72", title: "Óvoda & bölcsőde", description: "Kita, Kindergarten, Erzieherin.", chapter: 15, xpReward: 15,
    questions: [
      { id: "dq214", type: "multiple_choice", prompt: "Mit jelent 'Kita'?", options: [{ id: "o1", text: "bölcsőde/óvoda (Kindertagesstätte)" }, { id: "o2", text: "iskola" }, { id: "o3", text: "játszótér" }], correctOptionId: "o1" },
      { id: "dq215", type: "flashcard", prompt: "'óvónő / nevelő'?", backText: "Erzieherin", phonetic: "Ercíherin" },
      { id: "dq216", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "óvoda", right: "Kindergarten" }, { id: "p2", left: "bölcsőde", right: "Krippe" }, { id: "p3", left: "hely (férőhely)", right: "Platz" }] },
    ],
  },
  {
    id: "dl73", title: "Iskola", description: "Schule, Hausaufgaben, Zeugnis.", chapter: 15, xpReward: 10,
    questions: [
      { id: "dq217", type: "multiple_choice", prompt: "Mit jelent 'Hausaufgaben'?", options: [{ id: "o1", text: "házi feladat" }, { id: "o2", text: "bizonyítvány" }, { id: "o3", text: "szünet" }], correctOptionId: "o1" },
      { id: "dq218", type: "flashcard", prompt: "'bizonyítvány'?", backText: "Zeugnis", phonetic: "Cojgnisz" },
      { id: "dq219", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "iskola", right: "Schule" }, { id: "p2", left: "osztály", right: "Klasse" }, { id: "p3", left: "tanóra", right: "Unterricht" }] },
    ],
  },
  {
    id: "dl74", title: "Tantárgyak", description: "Mathe, Deutsch, Sport.", chapter: 15, xpReward: 10,
    questions: [
      { id: "dq220", type: "multiple_choice", prompt: "Mit jelent 'Mathe'?", options: [{ id: "o1", text: "matematika" }, { id: "o2", text: "testnevelés" }, { id: "o3", text: "zene" }], correctOptionId: "o1" },
      { id: "dq221", type: "flashcard", prompt: "'testnevelés'?", backText: "Sport", phonetic: "Sport" },
      { id: "dq222", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "német (tantárgy)", right: "Deutsch" }, { id: "p2", left: "angol", right: "Englisch" }, { id: "p3", left: "zene", right: "Musik" }] },
    ],
  },
  {
    id: "dl75", title: "Szülői ügyek", description: "Elternabend, anmelden, Ferien.", chapter: 15, xpReward: 15,
    questions: [
      { id: "dq223", type: "multiple_choice", prompt: "Mit jelent 'Ferien'?", options: [{ id: "o1", text: "iskolai szünet" }, { id: "o2", text: "szülői értekezlet" }, { id: "o3", text: "bizonyítvány" }], correctOptionId: "o1" },
      { id: "dq224", type: "flashcard", prompt: "'szülői értekezlet'?", backText: "Elternabend", phonetic: "Elternábend" },
      { id: "dq225", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "beíratni / jelentkeztetni", right: "anmelden" }, { id: "p2", left: "szülők", right: "Eltern" }, { id: "p3", left: "tanévkezdés", right: "Schulanfang" }] },
    ],
  },

  // ══ 16. Fejezet: Bank & Pénzügy ══════════════════════
  {
    id: "dl76", title: "Bankszámla", description: "Girokonto, eröffnen, IBAN.", chapter: 16, xpReward: 15,
    questions: [
      { id: "dq226", type: "multiple_choice", prompt: "Mit jelent 'Girokonto'?", options: [{ id: "o1", text: "folyószámla" }, { id: "o2", text: "hitel" }, { id: "o3", text: "biztosítás" }], correctOptionId: "o1" },
      { id: "dq227", type: "flashcard", prompt: "'(számlát) nyitni'?", backText: "eröffnen", phonetic: "erőffnen" },
      { id: "dq228", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bank", right: "Bank" }, { id: "p2", left: "számlaszám", right: "IBAN" }, { id: "p3", left: "ügyfél", right: "Kunde" }] },
    ],
  },
  {
    id: "dl77", title: "Kártya & ATM", description: "Geldautomat, PIN, abheben.", chapter: 16, xpReward: 10,
    questions: [
      { id: "dq229", type: "multiple_choice", prompt: "Mit jelent 'Geldautomat'?", options: [{ id: "o1", text: "bankautomata (ATM)" }, { id: "o2", text: "pénztárca" }, { id: "o3", text: "számla" }], correctOptionId: "o1" },
      { id: "dq230", type: "flashcard", prompt: "'(pénzt) felvenni'?", backText: "abheben", phonetic: "abhében" },
      { id: "dq231", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "befizetni", right: "einzahlen" }, { id: "p2", left: "kód (PIN)", right: "PIN" }, { id: "p3", left: "bankkártya", right: "EC-Karte" }] },
    ],
  },
  {
    id: "dl78", title: "Utalás & számlák", description: "Überweisung, Dauerauftrag, Lastschrift.", chapter: 16, xpReward: 15,
    questions: [
      { id: "dq232", type: "multiple_choice", prompt: "Mit jelent 'Lastschrift'?", options: [{ id: "o1", text: "beszedési megbízás" }, { id: "o2", text: "átutalás" }, { id: "o3", text: "készpénz" }], correctOptionId: "o1" },
      { id: "dq233", type: "flashcard", prompt: "'átutalás'?", backText: "Überweisung", phonetic: "Übervájzung" },
      { id: "dq234", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "állandó megbízás", right: "Dauerauftrag" }, { id: "p2", left: "számla (fizetendő)", right: "Rechnung" }, { id: "p3", left: "esedékes", right: "fällig" }] },
    ],
  },
  {
    id: "dl79", title: "Megtakarítás & hitel", description: "sparen, Kredit, Zinsen.", chapter: 16, xpReward: 10,
    questions: [
      { id: "dq235", type: "multiple_choice", prompt: "Mit jelent 'sparen'?", options: [{ id: "o1", text: "megtakarítani" }, { id: "o2", text: "költeni" }, { id: "o3", text: "utalni" }], correctOptionId: "o1" },
      { id: "dq236", type: "flashcard", prompt: "'kamat'?", backText: "Zinsen", phonetic: "Cinzen" },
      { id: "dq237", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "hitel", right: "Kredit" }, { id: "p2", left: "adósság", right: "Schulden" }, { id: "p3", left: "részlet", right: "Rate" }] },
    ],
  },
  {
    id: "dl80", title: "Biztosítás", description: "Versicherung, Haftpflicht, Beitrag.", chapter: 16, xpReward: 15,
    questions: [
      { id: "dq238", type: "multiple_choice", prompt: "Mit jelent 'Versicherung'?", options: [{ id: "o1", text: "biztosítás" }, { id: "o2", text: "megtakarítás" }, { id: "o3", text: "hitel" }], correctOptionId: "o1" },
      { id: "dq239", type: "flashcard", prompt: "'(biztosítási) díj'?", backText: "Beitrag", phonetic: "Bájtrág" },
      { id: "dq240", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "felelősségbiztosítás", right: "Haftpflicht" }, { id: "p2", left: "kötvény", right: "Police" }, { id: "p3", left: "kár (biztosítási)", right: "Schaden" }] },
    ],
  },

  // ══ 17. Fejezet: Egészségügy részletek ═══════════════
  {
    id: "dl81", title: "Orvostípusok", description: "Hausarzt, Zahnarzt, Facharzt.", chapter: 17, xpReward: 10,
    questions: [
      { id: "dq241", type: "multiple_choice", prompt: "Mit jelent 'Hausarzt'?", options: [{ id: "o1", text: "háziorvos" }, { id: "o2", text: "fogorvos" }, { id: "o3", text: "szakorvos" }], correctOptionId: "o1" },
      { id: "dq242", type: "flashcard", prompt: "'fogorvos'?", backText: "Zahnarzt", phonetic: "Cánárct" },
      { id: "dq243", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "szakorvos", right: "Facharzt" }, { id: "p2", left: "gyerekorvos", right: "Kinderarzt" }, { id: "p3", left: "szemész", right: "Augenarzt" }] },
    ],
  },
  {
    id: "dl82", title: "Kórház", description: "Krankenhaus, Notaufnahme, Station.", chapter: 17, xpReward: 15,
    questions: [
      { id: "dq244", type: "multiple_choice", prompt: "Mit jelent 'Notaufnahme'?", options: [{ id: "o1", text: "sürgősségi (ügyelet)" }, { id: "o2", text: "kórterem" }, { id: "o3", text: "váróterem" }], correctOptionId: "o1" },
      { id: "dq245", type: "flashcard", prompt: "'műtét'?", backText: "Operation", phonetic: "Operáció" },
      { id: "dq246", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "kórterem / osztály", right: "Station" }, { id: "p2", left: "beteg", right: "Patient" }, { id: "p3", left: "ápoló(nő)", right: "Krankenschwester" }] },
    ],
  },
  {
    id: "dl83", title: "Időpontkérés", description: "Termin vereinbaren, Sprechstunde.", chapter: 17, xpReward: 15,
    questions: [
      { id: "dq247", type: "multiple_choice", prompt: "'Szeretnék időpontot kérni.'", options: [{ id: "o1", text: "Ich möchte einen Termin vereinbaren." }, { id: "o2", text: "Ich möchte bezahlen." }, { id: "o3", text: "Ich möchte abheben." }], correctOptionId: "o1" },
      { id: "dq248", type: "flashcard", prompt: "'váróterem'?", backText: "Wartezimmer", phonetic: "Vartecimmer" },
      { id: "dq249", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "rendelési idő", right: "Sprechstunde" }, { id: "p2", left: "beutaló", right: "Überweisung" }, { id: "p3", left: "vizsgálat", right: "Untersuchung" }] },
    ],
  },
  {
    id: "dl84", title: "Biztosítókártya", description: "Versichertenkarte, gesetzlich, privat.", chapter: 17, xpReward: 10,
    questions: [
      { id: "dq250", type: "multiple_choice", prompt: "Mit jelent 'gesetzlich' (biztosítás)?", options: [{ id: "o1", text: "törvényes (állami)" }, { id: "o2", text: "magán" }, { id: "o3", text: "ingyenes" }], correctOptionId: "o1" },
      { id: "dq251", type: "flashcard", prompt: "'biztosítókártya'?", backText: "Versichertenkarte", phonetic: "Ferzihertenkarte" },
      { id: "dq252", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "magán(biztosítás)", right: "privat" }, { id: "p2", left: "egészségbiztosító", right: "Krankenkasse" }, { id: "p3", left: "kártya", right: "Karte" }] },
    ],
  },
  {
    id: "dl85", title: "Betegállomány", description: "krankschreiben, AU, gesund.", chapter: 17, xpReward: 15,
    questions: [
      { id: "dq253", type: "multiple_choice", prompt: "Mit jelent 'Krankschreibung' (AU)?", options: [{ id: "o1", text: "táppénzes igazolás" }, { id: "o2", text: "recept" }, { id: "o3", text: "beutaló" }], correctOptionId: "o1" },
      { id: "dq254", type: "flashcard", prompt: "'egészséges'?", backText: "gesund", phonetic: "gezund" },
      { id: "dq255", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "beteg", right: "krank" }, { id: "p2", left: "betegszabadságra írni", right: "krankschreiben" }, { id: "p3", left: "jobbulást!", right: "Gute Besserung" }] },
    ],
  },

  // ══ 18. Fejezet: Hivatal & Dokumentumok ══════════════
  {
    id: "dl86", title: "Okmányok", description: "Ausweis, Reisepass, Aufenthaltstitel.", chapter: 18, xpReward: 15,
    questions: [
      { id: "dq256", type: "multiple_choice", prompt: "Mit jelent 'Reisepass'?", options: [{ id: "o1", text: "útlevél" }, { id: "o2", text: "személyi igazolvány" }, { id: "o3", text: "jogosítvány" }], correctOptionId: "o1" },
      { id: "dq257", type: "flashcard", prompt: "'tartózkodási engedély'?", backText: "Aufenthaltstitel", phonetic: "Aufenthaltsztítel" },
      { id: "dq258", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "személyi igazolvány", right: "Personalausweis" }, { id: "p2", left: "születési anyakönyv", right: "Geburtsurkunde" }, { id: "p3", left: "aláírás", right: "Unterschrift" }] },
    ],
  },
  {
    id: "dl87", title: "Bejelentkezés", description: "Anmeldung, Bürgeramt, Meldebescheinigung.", chapter: 18, xpReward: 15,
    questions: [
      { id: "dq259", type: "multiple_choice", prompt: "Hol intézed a lakcímbejelentést?", options: [{ id: "o1", text: "Bürgeramt" }, { id: "o2", text: "Finanzamt" }, { id: "o3", text: "Arbeitsamt" }], correctOptionId: "o1" },
      { id: "dq260", type: "flashcard", prompt: "'lakcímigazolás'?", backText: "Meldebescheinigung", phonetic: "Meldebesájnigung" },
      { id: "dq261", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "bejelentkezés", right: "Anmeldung" }, { id: "p2", left: "átjelentkezés", right: "Ummeldung" }, { id: "p3", left: "időpont", right: "Termin" }] },
    ],
  },
  {
    id: "dl88", title: "Adóügyek", description: "Finanzamt, Steuernummer, Steuererklärung.", chapter: 18, xpReward: 15,
    questions: [
      { id: "dq262", type: "multiple_choice", prompt: "Mit jelent 'Steuererklärung'?", options: [{ id: "o1", text: "adóbevallás" }, { id: "o2", text: "adószám" }, { id: "o3", text: "fizetés" }], correctOptionId: "o1" },
      { id: "dq263", type: "flashcard", prompt: "'adóhivatal'?", backText: "Finanzamt", phonetic: "Fináncámt" },
      { id: "dq264", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "adóazonosító", right: "Steuer-ID" }, { id: "p2", left: "adóosztály", right: "Steuerklasse" }, { id: "p3", left: "visszatérítés", right: "Erstattung" }] },
    ],
  },
  {
    id: "dl89", title: "Családi támogatás", description: "Kindergeld, Elterngeld, Familienkasse.", chapter: 18, xpReward: 15,
    questions: [
      { id: "dq265", type: "multiple_choice", prompt: "Mit jelent 'Kindergeld'?", options: [{ id: "o1", text: "családi pótlék" }, { id: "o2", text: "nyugdíj" }, { id: "o3", text: "munkanélküli-segély" }], correctOptionId: "o1" },
      { id: "dq266", type: "flashcard", prompt: "'igényelni / kérvényezni'?", backText: "beantragen", phonetic: "beantrágen" },
      { id: "dq267", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "szülői támogatás", right: "Elterngeld" }, { id: "p2", left: "családi pénztár", right: "Familienkasse" }, { id: "p3", left: "kérvény / igénylés", right: "Antrag" }] },
    ],
  },
  {
    id: "dl90", title: "Munkanélküliség", description: "Agentur für Arbeit, Arbeitslosengeld.", chapter: 18, xpReward: 15,
    questions: [
      { id: "dq268", type: "multiple_choice", prompt: "Mit jelent 'arbeitslos'?", options: [{ id: "o1", text: "munkanélküli" }, { id: "o2", text: "nyugdíjas" }, { id: "o3", text: "beteg" }], correctOptionId: "o1" },
      { id: "dq269", type: "flashcard", prompt: "'munkanélküli-segély'?", backText: "Arbeitslosengeld", phonetic: "Arbájtszlózengeld" },
      { id: "dq270", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "munkaügyi hivatal", right: "Agentur für Arbeit" }, { id: "p2", left: "álláskereső", right: "Arbeitssuchender" }, { id: "p3", left: "kérvény", right: "Antrag" }] },
    ],
  },

  // ══ 19. Fejezet: Társalgás & Udvariasság ═════════════
  {
    id: "dl91", title: "Smalltalk", description: "Wie war dein Tag? Was machst du?", chapter: 19, xpReward: 10,
    questions: [
      { id: "dq271", type: "multiple_choice", prompt: "'Milyen volt a napod?'", options: [{ id: "o1", text: "Wie war dein Tag?" }, { id: "o2", text: "Wie alt bist du?" }, { id: "o3", text: "Wo wohnst du?" }], correctOptionId: "o1" },
      { id: "dq272", type: "flashcard", prompt: "'Mivel foglalkozol?'", backText: "Was machst du beruflich?", phonetic: "Vasz mahszt dú berúflih" },
      { id: "dq273", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Honnan jössz?", right: "Woher kommst du?" }, { id: "p2", left: "Hol laksz?", right: "Wo wohnst du?" }, { id: "p3", left: "Szép idő van", right: "Schönes Wetter" }] },
    ],
  },
  {
    id: "dl92", title: "Vélemény", description: "Ich finde, meiner Meinung nach.", chapter: 19, xpReward: 15,
    questions: [
      { id: "dq274", type: "multiple_choice", prompt: "'Szerintem…' (úgy gondolom)", options: [{ id: "o1", text: "Ich finde…" }, { id: "o2", text: "Ich heiße…" }, { id: "o3", text: "Ich habe…" }], correctOptionId: "o1" },
      { id: "dq275", type: "flashcard", prompt: "'véleményem szerint'?", backText: "meiner Meinung nach", phonetic: "májner májnung náh" },
      { id: "dq276", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Azt hiszem", right: "Ich glaube" }, { id: "p2", left: "Úgy gondolom", right: "Ich denke" }, { id: "p3", left: "Talán igazad van", right: "Vielleicht hast du recht" }] },
    ],
  },
  {
    id: "dl93", title: "Egyetértés", description: "Stimmt, einverstanden, auf keinen Fall.", chapter: 19, xpReward: 10,
    questions: [
      { id: "dq277", type: "multiple_choice", prompt: "Mit jelent 'auf keinen Fall'?", options: [{ id: "o1", text: "semmiképp / dehogy" }, { id: "o2", text: "persze" }, { id: "o3", text: "talán" }], correctOptionId: "o1" },
      { id: "dq278", type: "flashcard", prompt: "'egyetértek'?", backText: "einverstanden", phonetic: "ájnfersztanden" },
      { id: "dq279", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "így van / igaz", right: "Stimmt" }, { id: "p2", left: "persze", right: "Klar" }, { id: "p3", left: "nem hiszem", right: "Ich glaube nicht" }] },
    ],
  },
  {
    id: "dl94", title: "Meghívás", description: "einladen, Lust haben, Zeit haben.", chapter: 19, xpReward: 15,
    questions: [
      { id: "dq280", type: "multiple_choice", prompt: "'Van kedved…?'", options: [{ id: "o1", text: "Hast du Lust…?" }, { id: "o2", text: "Hast du Geld…?" }, { id: "o3", text: "Hast du Hunger…?" }], correctOptionId: "o1" },
      { id: "dq281", type: "flashcard", prompt: "'meghívni'?", backText: "einladen", phonetic: "ájnláden" },
      { id: "dq282", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Van időd?", right: "Hast du Zeit?" }, { id: "p2", left: "megbeszélt találkozó", right: "Verabredung" }, { id: "p3", left: "Szívesen!", right: "Gerne!" }] },
    ],
  },
  {
    id: "dl95", title: "Bocsánat & köszönet", description: "Es tut mir leid, Vielen Dank.", chapter: 19, xpReward: 10,
    questions: [
      { id: "dq283", type: "multiple_choice", prompt: "'Sajnálom / Elnézést.'", options: [{ id: "o1", text: "Es tut mir leid" }, { id: "o2", text: "Es geht mir gut" }, { id: "o3", text: "Es ist mir egal" }], correctOptionId: "o1" },
      { id: "dq284", type: "flashcard", prompt: "'Nagyon köszönöm!'", backText: "Vielen Dank", phonetic: "Fílen dánk" },
      { id: "dq285", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Semmi gond", right: "Kein Problem" }, { id: "p2", left: "Szívesen (válasz)", right: "Gern geschehen" }, { id: "p3", left: "Nagyon kedves", right: "Sehr nett" }] },
    ],
  },

  // ══ 20. Fejezet: Hasznos kifejezések ═════════════════
  {
    id: "dl96", title: "Segítségkérés", description: "Können Sie mir helfen? Ich suche…", chapter: 20, xpReward: 15,
    questions: [
      { id: "dq286", type: "multiple_choice", prompt: "'Tudna segíteni?'", options: [{ id: "o1", text: "Können Sie mir helfen?" }, { id: "o2", text: "Können Sie das wiederholen?" }, { id: "o3", text: "Können Sie bezahlen?" }], correctOptionId: "o1" },
      { id: "dq287", type: "flashcard", prompt: "'Keresem a…'", backText: "Ich suche…", phonetic: "Ih zúhe" },
      { id: "dq288", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Hol találom…?", right: "Wo finde ich…?" }, { id: "p2", left: "El vagyok tévedve", right: "Ich habe mich verlaufen" }, { id: "p3", left: "Segítségre van szükségem", right: "Ich brauche Hilfe" }] },
    ],
  },
  {
    id: "dl97", title: "Ha nem értem", description: "Wie bitte? buchstabieren, langsam.", chapter: 20, xpReward: 10,
    questions: [
      { id: "dq289", type: "multiple_choice", prompt: "'Tessék? (nem értettem)'", options: [{ id: "o1", text: "Wie bitte?" }, { id: "o2", text: "Wie viel?" }, { id: "o3", text: "Wie spät?" }], correctOptionId: "o1" },
      { id: "dq290", type: "flashcard", prompt: "'betűzni'?", backText: "buchstabieren", phonetic: "buhstabíren" },
      { id: "dq291", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Mit jelent…?", right: "Was bedeutet…?" }, { id: "p2", left: "Lassabban, kérem", right: "Langsamer, bitte" }, { id: "p3", left: "Nem beszélek jól németül", right: "Ich spreche nicht gut Deutsch" }] },
    ],
  },
  {
    id: "dl98", title: "Vészmondatok", description: "Rufen Sie einen Arzt! Notfall.", chapter: 20, xpReward: 15,
    questions: [
      { id: "dq292", type: "multiple_choice", prompt: "'Hívjon orvost!'", options: [{ id: "o1", text: "Rufen Sie einen Arzt!" }, { id: "o2", text: "Rufen Sie ein Taxi!" }, { id: "o3", text: "Rufen Sie an!" }], correctOptionId: "o1" },
      { id: "dq293", type: "flashcard", prompt: "'vészhelyzet'?", backText: "Notfall", phonetic: "Nótfall" },
      { id: "dq294", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Baleset történt", right: "Es gab einen Unfall" }, { id: "p2", left: "Hívja a rendőrséget!", right: "Rufen Sie die Polizei!" }, { id: "p3", left: "Veszély!", right: "Gefahr!" }] },
    ],
  },
  {
    id: "dl99", title: "Telefonálás", description: "Hier spricht… falsch verbunden.", chapter: 20, xpReward: 15,
    questions: [
      { id: "dq295", type: "multiple_choice", prompt: "'Itt … beszél (telefonban)'", options: [{ id: "o1", text: "Hier spricht …" }, { id: "o2", text: "Hier wohnt …" }, { id: "o3", text: "Hier ist nichts" }], correctOptionId: "o1" },
      { id: "dq296", type: "flashcard", prompt: "'téves kapcsolás'?", backText: "falsch verbunden", phonetic: "fals ferbunden" },
      { id: "dq297", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Beszélhetnék …-val?", right: "Kann ich … sprechen?" }, { id: "p2", left: "Egy pillanat", right: "Einen Moment" }, { id: "p3", left: "Viszonthallásra", right: "Auf Wiederhören" }] },
    ],
  },
  {
    id: "dl100", title: "Búcsú & jókívánság", description: "Gute Besserung, Viel Erfolg, Schönen Tag.", chapter: 20, xpReward: 20,
    questions: [
      { id: "dq298", type: "multiple_choice", prompt: "Mit jelent 'Viel Erfolg'?", options: [{ id: "o1", text: "Sok sikert!" }, { id: "o2", text: "Jó étvágyat!" }, { id: "o3", text: "Jó utat!" }], correctOptionId: "o1" },
      { id: "dq299", type: "flashcard", prompt: "'Jó szórakozást!'", backText: "Viel Spaß", phonetic: "Fíl spász" },
      { id: "dq300", type: "match", prompt: "Párosítsd!", pairs: [{ id: "p1", left: "Jobbulást!", right: "Gute Besserung" }, { id: "p2", left: "Szép napot!", right: "Schönen Tag noch" }, { id: "p3", left: "Jó utat!", right: "Gute Reise" }] },
    ],
  },
];
