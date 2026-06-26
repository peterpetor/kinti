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
];
