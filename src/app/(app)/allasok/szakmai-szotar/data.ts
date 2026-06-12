export type QuestionType = "multiple_choice" | "flashcard" | "match";

export type Option = {
  id: string;
  text: string;
};

export type MatchPair = {
  id: string;
  left: string; // Hungarian
  right: string; // Swiss German / German
};

export type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: Option[];
  correctOptionId?: string;
  backText?: string;
  phonetic?: string;
  pairs?: MatchPair[];
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  industry: string;
  xpReward: number;
  isPro?: boolean;
  questions: Question[];
};

export const INDUSTRY_LESSONS: Lesson[] = [
  // ── 1. Építőipar (Baubranche) ──────────────────────────────
  {
    id: "bau_1",
    title: "Építőipari Alapok 1.",
    description: "Alapvető szerszámok és kifejezések a svájci építkezéseken (Baustelle).",
    industry: "Építőipar (Baubranche)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "bau_q1",
        type: "flashcard",
        prompt: "Fúrógép",
        backText: "Bohrmaschine (Svájcban gyakran: Bohrmaschine / Borer)",
        phonetic: "Bórmá-sínö",
      },
      {
        id: "bau_q2",
        type: "flashcard",
        prompt: "Talicska",
        backText: "Karette",
        phonetic: "Ká-ret-te",
      },
      {
        id: "bau_q3",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Polier' szó a svájci építkezésen?",
        options: [
          { id: "a", text: "Művezető / Építésvezető" },
          { id: "b", text: "Rendőr" },
          { id: "c", text: "Takarító" },
        ],
        correctOptionId: "a",
      },
      {
        id: "bau_q4",
        type: "flashcard",
        prompt: "Létra",
        backText: "Leiter",
        phonetic: "Láj-ter",
      },
      {
        id: "bau_q5",
        type: "match",
        prompt: "Párosítsd a szerszámokat!",
        pairs: [
          { id: "p1", left: "Kalapács", right: "Hammer" },
          { id: "p2", left: "Csavarhúzó", right: "Schraubenzieher" },
          { id: "p3", left: "Mérőszalag", right: "Massband (Rollmeter)" },
          { id: "p4", left: "Vízmérték", right: "Wasserwaage" },
        ],
      },
    ],
  },
  
  // ── 2. Vendéglátás (Gastronomie) ──────────────────────────────
  {
    id: "gastro_1",
    title: "Vendéglátás: Rendelésfelvétel",
    description: "Hogyan szolgálj ki svájci vendégeket egy étteremben?",
    industry: "Vendéglátás (Gastronomie)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "gas_q1",
        type: "flashcard",
        prompt: "Mit hozhatok inni?",
        backText: "Was darf ich Ihne zum Trinke bringe?",
        phonetic: "Vász dárf ih inö cum trinkö bringö?",
      },
      {
        id: "gas_q2",
        type: "flashcard",
        prompt: "Fizetni szeretnék, kérem.",
        backText: "Zahle, bitte. (Vagy: Zahlen, bitte)",
        phonetic: "Cá-lö, bit-te",
      },
      {
        id: "gas_q3",
        type: "multiple_choice",
        prompt: "Hogyan kérdezed meg, hogy ízlett-e az étel?",
        options: [
          { id: "a", text: "Isch es guet gsi?" },
          { id: "b", text: "Was wänd Sie?" },
          { id: "c", text: "Scho fertig?" },
        ],
        correctOptionId: "a",
      },
      {
        id: "gas_q4",
        type: "flashcard",
        prompt: "Borravaló",
        backText: "Trinkgeld",
        phonetic: "Trink-gelt",
      },
      {
        id: "gas_q5",
        type: "match",
        prompt: "Párosítsd az éttermi szavakat!",
        pairs: [
          { id: "p1", left: "Étlap", right: "Speisekarte" },
          { id: "p2", left: "Számla", right: "Rechnung" },
          { id: "p3", left: "Kés", right: "Mässer" },
          { id: "p4", left: "Villa", right: "Gable" },
        ],
      },
    ],
  },

  // ── 3. Egészségügy (Pflege & Gesundheit) ──────────────────────
  {
    id: "pflege_1",
    title: "Ápolás és Egészségügy 1.",
    description: "Alapvető kifejezések az idősgondozásban és kórházban.",
    industry: "Egészségügy (Gesundheitswesen)",
    xpReward: 15,
    isPro: true,
    questions: [
      {
        id: "pfl_q1",
        type: "flashcard",
        prompt: "Fájdalomcsillapító",
        backText: "Schmerzmittel",
        phonetic: "Smerc-mit-tel",
      },
      {
        id: "pfl_q2",
        type: "multiple_choice",
        prompt: "Mit jelent a 'Rollstuhl'?",
        options: [
          { id: "a", text: "Kerekesszék" },
          { id: "b", text: "Mankó" },
          { id: "c", text: "Injekció" },
        ],
        correctOptionId: "a",
      },
      {
        id: "pfl_q3",
        type: "flashcard",
        prompt: "Van fájdalma?",
        backText: "Händ Sie Schmerze?",
        phonetic: "Hent zí Smercö?",
      },
    ],
  },
  
  // ── 4. PRO LECKÉK ─────────────────────────────────────────────
  {
    id: "bau_pro_1",
    title: "Mesterkurzus: Fizetésemelés és Konfliktus",
    description: "Svájci német párbeszédek: hogyan kérj fizetésemelést, vagy intézz el egy konfliktust a svájci főnököddel.",
    industry: "Építőipar (Baubranche)",
    xpReward: 50,
    isPro: true,
    questions: [
      {
        id: "bau_pro_q1",
        type: "flashcard",
        prompt: "Szeretnék beszélni a fizetésemről.",
        backText: "Ich wett gern über min Lohn rede.",
        phonetic: "Ih vet gern über min Lón ré-dö",
      },
      {
        id: "bau_pro_q2",
        type: "multiple_choice",
        prompt: "Hogyan mondod: 'Úgy gondolom, több felelősséget vállalok mostanában'?",
        options: [
          { id: "a", text: "Ich find, ich übernimm in letschter Ziit meh Verantwortig." },
          { id: "b", text: "Ich schaffe meh als die andere." },
          { id: "c", text: "Ich bruch meh Gäld." },
        ],
        correctOptionId: "a",
      },
      {
        id: "bau_pro_q3",
        type: "flashcard",
        prompt: "Ez nem az én hibám volt.",
        backText: "Das isch nid min Fähler gsii.",
        phonetic: "Dász is nid min Fél-ler gszí",
      }
    ],
  }
];
