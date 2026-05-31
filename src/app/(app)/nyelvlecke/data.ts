export type QuestionType = "multiple_choice" | "flashcard" | "match";

export type Option = {
  id: string;
  text: string;
};

export type MatchPair = {
  id: string;
  left: string; // Hungarian
  right: string; // Swiss German
};

export type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  // Multiple Choice
  options?: Option[];
  correctOptionId?: string;
  // Flashcard
  backText?: string;
  phonetic?: string;
  // Match
  pairs?: MatchPair[];
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  chapter: number;
  xpReward: number;
  questions: Question[];
};

export const LESSONS: Lesson[] = [
  // ── 1. Fejezet: Alapok ──────────────────────────────
  {
    id: "l1",
    title: "1. Lecke: Alapvető köszönések",
    description: "Tanuld meg, hogyan kell helyesen köszönni Svájcban!",
    chapter: 1,
    xpReward: 10,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Hogy mondják hivatalosan: 'Jó napot' (egy személynek)?",
        options: [
          { id: "o1", text: "Guten Tag" },
          { id: "o2", text: "Grüezi" },
          { id: "o3", text: "Hoi" },
        ],
        correctOptionId: "o2",
      },
      {
        id: "q2",
        type: "flashcard",
        prompt: "Hogyan köszönsz több embernek hivatalosan?",
        backText: "Grüezi mitenand",
        phonetic: "Grüeci mitenand",
      },
      {
        id: "q3",
        type: "match",
        prompt: "Párosítsd a kifejezéseket!",
        pairs: [
          { id: "p1", left: "Szia (1 fő)", right: "Hoi / Sali" },
          { id: "p2", left: "Sziasztok (több fő)", right: "Hoi zäme" },
          { id: "p3", left: "Viszlát (informális)", right: "Tschüss" },
        ],
      },
    ],
  },
  {
    id: "l2",
    title: "2. Lecke: A munkahelyen (Uf dr Baustelle)",
    description: "Fontos kifejezések, ha svájci munkatársakkal beszélsz.",
    chapter: 1,
    xpReward: 15,
    questions: [
      {
        id: "q4",
        type: "multiple_choice",
        prompt: "Hogy mondják: 'Dolgozom'?",
        options: [
          { id: "o1", text: "Ich schaffe" },
          { id: "o2", text: "Ich arbeite" },
          { id: "o3", text: "Ich macha" },
        ],
        correctOptionId: "o1",
      },
      {
        id: "q5",
        type: "flashcard",
        prompt: "Ebédidő",
        backText: "Mittagspause / Zmittag",
        phonetic: "Cmitag",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "Hogy mondják: 'Készen vagyunk / Végeztünk'?",
        options: [
          { id: "o1", text: "Mer sind fertig" },
          { id: "o2", text: "Mir händ Fiirabig" },
          { id: "o3", text: "Beide jók" },
        ],
        correctOptionId: "o3",
      },
    ],
  },

  // ── 2. Fejezet: Bevásárlás és Étterem ────────────────
  {
    id: "l3",
    title: "3. Lecke: A pékségben / Étteremben",
    description: "Hogyan rendelj kávét és péksütit úgy, mint egy igazi helyi.",
    chapter: 2,
    xpReward: 15,
    questions: [
      {
        id: "q7",
        type: "multiple_choice",
        prompt: "Kérek szépen egy kávét!",
        options: [
          { id: "o1", text: "Ich ha gern es Kafi." },
          { id: "o2", text: "Ich brauche ein Kaffee." },
          { id: "o3", text: "Kafi bitte." },
        ],
        correctOptionId: "o1",
      },
      {
        id: "q8",
        type: "flashcard",
        prompt: "Vajaskifli (svájci specialitás)",
        backText: "Gipfeli",
        phonetic: "Gipfeli",
      },
      {
        id: "q9",
        type: "match",
        prompt: "Párosítsd az ételeket/italokat!",
        pairs: [
          { id: "p1", left: "Kávé", right: "Kafi" },
          { id: "p2", left: "Sör", right: "Bier (es Bier)" },
          { id: "p3", left: "Víz", right: "Wasser" },
          { id: "p4", left: "Fizetni szeretnék", right: "Ich wet zahle" },
        ],
      },
    ],
  },
  {
    id: "l4",
    title: "4. Lecke: A Migrosban",
    description: "Alapvető kifejezések a kasszánál.",
    chapter: 2,
    xpReward: 20,
    questions: [
      {
        id: "q10",
        type: "flashcard",
        prompt: "Bevásárlószatyor (Nylon zacskó)",
        backText: "Säckli",
        phonetic: "Szekli",
      },
      {
        id: "q11",
        type: "multiple_choice",
        prompt: "Mit kérdez a pénztáros, amikor a blokkot akarja odaadni?",
        options: [
          { id: "o1", text: "Wollen Sie den Kassenzettel?" },
          { id: "o2", text: "Quittig?" },
          { id: "o3", text: "Zettelchen?" },
        ],
        correctOptionId: "o2",
      },
      {
        id: "q12",
        type: "multiple_choice",
        prompt: "Hogyan köszönöd meg a visszajárót?",
        options: [
          { id: "o1", text: "Danke vielmal" },
          { id: "o2", text: "Merci vilmal" },
          { id: "o3", text: "Mindkettő tökéletes" },
        ],
        correctOptionId: "o3",
      },
    ]
  },

  // ── 3. Fejezet: Hétköznapi Élet ────────────────────
  {
    id: "l5",
    title: "5. Lecke: Pénz és Számok",
    description: "Fizetés és árak Svájcban.",
    chapter: 3,
    xpReward: 20,
    questions: [
      {
        id: "q13",
        type: "match",
        prompt: "Párosítsd a számokat!",
        pairs: [
          { id: "p1", left: "Egy", right: "Eins" },
          { id: "p2", left: "Kettő", right: "Zwei" },
          { id: "p3", left: "Három", right: "Drü" },
          { id: "p4", left: "Négy", right: "Vier" },
        ],
      },
      {
        id: "q14",
        type: "flashcard",
        prompt: "Mennyibe kerül?",
        backText: "Was choschtet das?",
        phonetic: "Vasz khostet dasz?",
      },
      {
        id: "q15",
        type: "multiple_choice",
        prompt: "Hogy mondják a frankot a szlengben?",
        options: [
          { id: "o1", text: "Stutz" },
          { id: "o2", text: "Geld" },
          { id: "o3", text: "Kröten" },
        ],
        correctOptionId: "o1",
      },
    ]
  },
  {
    id: "l6",
    title: "6. Lecke: A szomszédok (Nachbare)",
    description: "Hogyan legyél jó viszonyban a svájci szomszédokkal.",
    chapter: 3,
    xpReward: 20,
    questions: [
      {
        id: "q16",
        type: "flashcard",
        prompt: "Mosókonyha (közös mosóhelyiség)",
        backText: "Wöschchuchi",
        phonetic: "Vöskhukhi",
      },
      {
        id: "q17",
        type: "multiple_choice",
        prompt: "Hogy mondjuk, hogy 'Elnézést!'?",
        options: [
          { id: "o1", text: "Entschuldigung" },
          { id: "o2", text: "Exgüse" },
          { id: "o3", text: "Pardon" },
        ],
        correctOptionId: "o2",
      },
      {
        id: "q18",
        type: "match",
        prompt: "Házirend kifejezések",
        pairs: [
          { id: "p1", left: "Lépcsőház", right: "Stägehuus" },
          { id: "p2", left: "Biciklitároló", right: "Velochäller" },
          { id: "p3", left: "Szemét", right: "Abfall" },
        ]
      }
    ]
  },

  // ── 4. Fejezet: Közlekedés ────────────────────
  {
    id: "l7",
    title: "7. Lecke: Vonaton (SBB)",
    description: "Közlekedj Svájcban problémamentesen.",
    chapter: 4,
    xpReward: 25,
    questions: [
      {
        id: "q19",
        type: "multiple_choice",
        prompt: "Hogy mondják: 'Jegyeket, kérem!'?",
        options: [
          { id: "o1", text: "Billet bitte!" },
          { id: "o2", text: "Fahrkarte bitte!" },
          { id: "o3", text: "Ticket bitte!" },
        ],
        correctOptionId: "o1",
      },
      {
        id: "q20",
        type: "flashcard",
        prompt: "Bicikli (Kerékpár)",
        backText: "Velo",
        phonetic: "Velo",
      },
      {
        id: "q21",
        type: "match",
        prompt: "Közlekedési eszközök",
        pairs: [
          { id: "p1", left: "Villamos", right: "Tram" },
          { id: "p2", left: "Vonat", right: "Zug" },
          { id: "p3", left: "Autó", right: "Auto" },
          { id: "p4", left: "Pályaudvar", right: "Bahnhof" },
        ]
      }
    ]
  },
  // ── 5. Fejezet: Hivatal és Ügyintézés ────────────────────
  {
    id: "l8",
    title: "8. Lecke: A Kreisbüroban",
    description: "Kifejezések az önkormányzati ügyintézéshez.",
    chapter: 5,
    xpReward: 30,
    questions: [
      {
        id: "q22",
        type: "multiple_choice",
        prompt: "Mit kérdez az ügyintéző, amikor megkérdezi, hol laksz?",
        options: [
          { id: "o1", text: "Wo wohne Sie?" },
          { id: "o2", text: "Wo lebsch?" },
          { id: "o3", text: "Wo isch dis Huus?" },
        ],
        correctOptionId: "o1",
      },
      {
        id: "q23",
        type: "flashcard",
        prompt: "Személyi igazolvány",
        backText: "ID (Identitätscharte)",
        phonetic: "Ídé",
      },
      {
        id: "q24",
        type: "match",
        prompt: "Párosítsd a hivatali szavakat!",
        pairs: [
          { id: "p1", left: "Lakcím", right: "Adrässe" },
          { id: "p2", left: "Tartózkodási engedély", right: "Uuswiis" },
          { id: "p3", left: "Aláírás", right: "Underschrift" },
        ]
      }
    ]
  },
  {
    id: "l9",
    title: "9. Lecke: A postán (Uf de Poscht)",
    description: "Csomagok és levelek feladása Svájcban.",
    chapter: 5,
    xpReward: 30,
    questions: [
      {
        id: "q25",
        type: "flashcard",
        prompt: "Egy csomagot szeretnék feladni.",
        backText: "Ich wet es Päckli ufgäh.",
        phonetic: "Ich vet esz pekli uf-ge.",
      },
      {
        id: "q26",
        type: "multiple_choice",
        prompt: "Hogy mondják a 'postás' szót?",
        options: [
          { id: "o1", text: "Pösteler" },
          { id: "o2", text: "Briefträger" },
          { id: "o3", text: "Postmann" },
        ],
        correctOptionId: "o1",
      },
      {
        id: "q27",
        type: "multiple_choice",
        prompt: "A-Post vagy B-Post? Melyik a gyorsabb?",
        options: [
          { id: "o1", text: "A-Post (elsőbbségi)" },
          { id: "o2", text: "B-Post (sima)" },
        ],
        correctOptionId: "o1",
      }
    ]
  },

  // ── 6. Fejezet: Barátkozás ────────────────────
  {
    id: "l10",
    title: "10. Lecke: Füürobebier (Munka utáni sör)",
    description: "Lazítás és szocializáció a kollégákkal.",
    chapter: 6,
    xpReward: 50,
    questions: [
      {
        id: "q28",
        type: "multiple_choice",
        prompt: "Hogyan hívod meg a munkatársadat egy sörre munka után?",
        options: [
          { id: "o1", text: "Chömed mir es Bier go trinke?" },
          { id: "o2", text: "Trinke mer eis?" },
          { id: "o3", text: "Mindkettő tökéletes!" },
        ],
        correctOptionId: "o3",
      },
      {
        id: "q29",
        type: "flashcard",
        prompt: "Egészségedre! (Koccintáskor)",
        backText: "Proscht! / Zum Wohl!",
        phonetic: "Prost!",
      },
      {
        id: "q30",
        type: "match",
        prompt: "Kifejezések az estére",
        pairs: [
          { id: "p1", left: "Finom volt", right: "Es isch fein gsii" },
          { id: "p2", left: "Nagyon jó", right: "Tiptop / Super" },
          { id: "p3", left: "Nincs probléma", right: "Kes Problem" },
          { id: "p4", left: "Meghívhatlak?", right: "Darf ich dii iilade?" },
        ]
      }
    ]
  }
];
