import type { Lesson } from "./data";

/**
 * Osztrák német (Österreichisches Deutsch) kezdő-kurzus — a svájci Mundart-kurzus
 * (data.ts) ország-megfelelője. Valódi osztrák szókincs/köszönések, amik eltérnek
 * a németországi standardtól (Grüß Gott, Servus, Jänner, Erdäpfel, Paradeiser,
 * Sessel, leiwand…). Kezdő-fejezetek; idővel bővíthető a CH-kurzus mintájára.
 *
 * A lecke-id-k „al" előtaggal, hogy NE ütközzenek a CH „l" id-kkel (a lecke-
 * lejátszó mindkét készletben keres).
 */
export const LESSONS_AT: Lesson[] = [
  // ── 1. Fejezet: Alapok ──────────────────────────────
  {
    id: "al1",
    title: "1. Lecke: Köszönések",
    description: "Így köszönnek Ausztriában — Grüß Gott, Servus, Baba!",
    chapter: 1,
    xpReward: 10,
    questions: [
      {
        id: "aq1",
        type: "multiple_choice",
        prompt: "Hogy mondják hivatalosan: 'Jó napot' Ausztriában?",
        options: [
          { id: "o1", text: "Grüß Gott" },
          { id: "o2", text: "Grüezi" },
          { id: "o3", text: "Moin" },
        ],
        correctOptionId: "o1",
      },
      {
        id: "aq2",
        type: "flashcard",
        prompt: "Hogyan köszönsz informálisan (szia, helló)?",
        backText: "Servus",
        phonetic: "Szervusz",
      },
      {
        id: "aq3",
        type: "match",
        prompt: "Párosítsd a köszönéseket!",
        pairs: [
          { id: "p1", left: "Jó napot (hivatalos)", right: "Grüß Gott" },
          { id: "p2", left: "Szia (informális)", right: "Servus" },
          { id: "p3", left: "Szia! (búcsú, informális)", right: "Baba / Pfiat di" },
          { id: "p4", left: "Viszontlátásra (hivatalos)", right: "Auf Wiederschauen" },
        ],
      },
    ],
  },
  {
    id: "al2",
    title: "2. Lecke: Bemutatkozás",
    description: "Hogy vagy? Örvendek — az első mondatok.",
    chapter: 1,
    xpReward: 15,
    questions: [
      {
        id: "aq4",
        type: "multiple_choice",
        prompt: "Hogy kérdezed informálisan: 'Hogy vagy?'",
        options: [
          { id: "o1", text: "Wia geht's?" },
          { id: "o2", text: "Wie gaht's?" },
          { id: "o3", text: "Ça va?" },
        ],
        correctOptionId: "o1",
      },
      {
        id: "aq5",
        type: "flashcard",
        prompt: "Hogy mondod: 'Örvendek (a találkozásnak)'?",
        backText: "Freut mi!",
        phonetic: "Frojt mih",
      },
      {
        id: "aq6",
        type: "match",
        prompt: "Párosítsd!",
        pairs: [
          { id: "p1", left: "Köszönöm", right: "Danke" },
          { id: "p2", left: "Kérlek / Tessék", right: "Bitte" },
          { id: "p3", left: "Igen / Nem", right: "Ja / Na (Nein)" },
        ],
      },
    ],
  },
  {
    id: "al3",
    title: "3. Lecke: Hónapok és idő",
    description: "Jänner, Feber, heuer — az osztrák naptár szavai.",
    chapter: 1,
    xpReward: 15,
    questions: [
      {
        id: "aq7",
        type: "multiple_choice",
        prompt: "Hogy mondják 'Január' Ausztriában?",
        options: [
          { id: "o1", text: "Januar" },
          { id: "o2", text: "Jänner" },
          { id: "o3", text: "Genner" },
        ],
        correctOptionId: "o2",
      },
      {
        id: "aq8",
        type: "flashcard",
        prompt: "Mit jelent: 'heuer'?",
        backText: "idén (ebben az évben)",
        phonetic: "hojer",
      },
      {
        id: "aq9",
        type: "match",
        prompt: "Párosítsd az osztrák szavakat!",
        pairs: [
          { id: "p1", left: "Január", right: "Jänner" },
          { id: "p2", left: "Február", right: "Feber" },
          { id: "p3", left: "idén", right: "heuer" },
          { id: "p4", left: "reggel", right: "in der Früh" },
        ],
      },
    ],
  },
  {
    id: "al4",
    title: "4. Lecke: Élelmiszer a boltban",
    description: "Erdäpfel, Paradeiser, Marille — ezeket másképp hívják!",
    chapter: 1,
    xpReward: 20,
    questions: [
      {
        id: "aq10",
        type: "multiple_choice",
        prompt: "Hogy mondják 'burgonya/krumpli' Ausztriában?",
        options: [
          { id: "o1", text: "Kartoffeln" },
          { id: "o2", text: "Erdäpfel" },
          { id: "o3", text: "Grumbeere" },
        ],
        correctOptionId: "o2",
      },
      {
        id: "aq11",
        type: "flashcard",
        prompt: "Mi a 'paradicsom' osztrákul?",
        backText: "Paradeiser",
        phonetic: "Paradájzer",
      },
      {
        id: "aq12",
        type: "match",
        prompt: "Párosítsd az élelmiszereket!",
        pairs: [
          { id: "p1", left: "Burgonya", right: "Erdäpfel" },
          { id: "p2", left: "Paradicsom", right: "Paradeiser" },
          { id: "p3", left: "Karfiol", right: "Karfiol" },
          { id: "p4", left: "Sárgabarack", right: "Marille" },
          { id: "p5", left: "Zsemle", right: "Semmel" },
        ],
      },
    ],
  },
  {
    id: "al5",
    title: "5. Lecke: Vásárlás",
    description: "Sackerl, Trafik, Greißler — bevásárlás osztrák módra.",
    chapter: 1,
    xpReward: 20,
    questions: [
      {
        id: "aq13",
        type: "multiple_choice",
        prompt: "Hogy mondják 'szatyor / zacskó'?",
        options: [
          { id: "o1", text: "Tüte" },
          { id: "o2", text: "Sackerl" },
          { id: "o3", text: "Beutel" },
        ],
        correctOptionId: "o2",
      },
      {
        id: "aq14",
        type: "flashcard",
        prompt: "Hogy kérdezed: 'Mennyibe kerül?'",
        backText: "Was kostet das? / Was kost'n des?",
        phonetic: "Vasz kosztet desz",
      },
      {
        id: "aq15",
        type: "match",
        prompt: "Párosítsd!",
        pairs: [
          { id: "p1", left: "Trafik", right: "dohány/újság-bolt" },
          { id: "p2", left: "Greißler", right: "kis fűszerbolt" },
          { id: "p3", left: "Sackerl", right: "szatyor" },
        ],
      },
    ],
  },
  {
    id: "al6",
    title: "6. Lecke: Otthon",
    description: "Sessel, Kasten, Stiege — a lakás osztrák szavai.",
    chapter: 1,
    xpReward: 20,
    questions: [
      {
        id: "aq16",
        type: "multiple_choice",
        prompt: "Hogy mondják 'szék' Ausztriában?",
        options: [
          { id: "o1", text: "Stuhl" },
          { id: "o2", text: "Sessel" },
          { id: "o3", text: "Bank" },
        ],
        correctOptionId: "o2",
      },
      {
        id: "aq17",
        type: "flashcard",
        prompt: "Mi a 'lépcső' osztrákul?",
        backText: "Stiege",
        phonetic: "Stíge",
      },
      {
        id: "aq18",
        type: "match",
        prompt: "Párosítsd a lakás szavait!",
        pairs: [
          { id: "p1", left: "Szék", right: "Sessel" },
          { id: "p2", left: "Szekrény", right: "Kasten" },
          { id: "p3", left: "Lépcső", right: "Stiege" },
          { id: "p4", left: "Párna", right: "Polster" },
        ],
      },
    ],
  },

  // ── 2. Fejezet: Mindennapok ─────────────────────────
  {
    id: "al7",
    title: "7. Lecke: A munkahelyen",
    description: "Hackn, hackeln — a munka nyelve a melóban.",
    chapter: 2,
    xpReward: 20,
    questions: [
      {
        id: "aq19",
        type: "multiple_choice",
        prompt: "Hogy mondják szlengben: 'dolgozni'?",
        options: [
          { id: "o1", text: "hackeln" },
          { id: "o2", text: "schaffen" },
          { id: "o3", text: "büffeln" },
        ],
        correctOptionId: "o1",
      },
      {
        id: "aq20",
        type: "flashcard",
        prompt: "Mit jelent: 'die Hackn'?",
        backText: "a meló / a munka (szleng)",
        phonetic: "di Hakn",
      },
      {
        id: "aq21",
        type: "match",
        prompt: "Párosítsd!",
        pairs: [
          { id: "p1", left: "Főnök", right: "Chef" },
          { id: "p2", left: "Cég", right: "Firma" },
          { id: "p3", left: "Uzsonna / tízórai", right: "Jause" },
        ],
      },
    ],
  },
  {
    id: "al8",
    title: "8. Lecke: Szleng és kocsma",
    description: "leiwand, oida, Beisl, Heuriger — az utca nyelve.",
    chapter: 2,
    xpReward: 25,
    questions: [
      {
        id: "aq22",
        type: "multiple_choice",
        prompt: "Hogy mondják 'szuper / menő'?",
        options: [
          { id: "o1", text: "leiwand" },
          { id: "o2", text: "geil" },
          { id: "o3", text: "cool" },
        ],
        correctOptionId: "o1",
      },
      {
        id: "aq23",
        type: "flashcard",
        prompt: "Mit jelent: 'Oida'?",
        backText: "haver / öregem (megszólítás)",
        phonetic: "ojda",
      },
      {
        id: "aq24",
        type: "match",
        prompt: "Párosítsd a szleng-szavakat!",
        pairs: [
          { id: "p1", left: "Szuper / menő", right: "leiwand" },
          { id: "p2", left: "Kocsma", right: "Beisl" },
          { id: "p3", left: "Borozó (újbor)", right: "Heuriger" },
          { id: "p4", left: "Cigaretta", right: "Tschick" },
        ],
      },
    ],
  },
];
