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
];
