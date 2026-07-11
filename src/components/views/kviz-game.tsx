"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";
import {
  getDailyQuestions,
  getTodayState,
  recordResult,
  todayKey,
  weeklyPersonalStats,
  type QuizState,
} from "@/lib/quiz-daily";
import { QUIZ_CATEGORY_META, type QuizCategory, type QuizQuestion } from "@/lib/quiz-bank";
import { BattleBoard, type BattleData } from "@/components/views/quiz-battle-board";
import { readPreferredCanton } from "@/lib/canton-pref";
import { PushOptin } from "@/components/push-optin";
import { QuizProCta } from "@/components/views/quiz-pro-cta";
import { pickQuizProTarget } from "@/lib/quiz-pro-map";
import { AT_QUIZ_CATEGORY_META } from "@/lib/quiz-bank-at";
import { DE_QUIZ_CATEGORY_META } from "@/lib/quiz-bank-de";
import { NL_QUIZ_CATEGORY_META } from "@/lib/quiz-bank-nl";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY, countryAdjective } from "@/lib/countries";

/**
 * KvizGame — interaktív napi 3 kérdéses kvíz játék.
 *
 * - Determinisztikus napi 3 kérdés (mindenki ugyanazt látja)
 * - Egy kérdésen egyszer válaszolhat — utána a magyarázat megjelenik
 * - Egy napon csak EGY menet, eredmény + streak localStorage-ban
 */
export function KvizGame() {
  const [state, setState] = useState<QuizState | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);

  const [prefCountry] = usePreferredCountry();
  const country = prefCountry ?? DEFAULT_COUNTRY;
  const categoryMeta = country === "AT" ? AT_QUIZ_CATEGORY_META : country === "DE" ? DE_QUIZ_CATEGORY_META : country === "NL" ? NL_QUIZ_CATEGORY_META : QUIZ_CATEGORY_META;

  // Mount-on: load state
  useEffect(() => {
    setState(getTodayState());
  }, []);

  const today = todayKey();
  const questions = useMemo(() => getDailyQuestions(today, country), [today, country]);

  if (state === null) {
    return (
      <div className="rounded-card border border-line bg-surface px-4 py-8 text-center text-[12.5px] text-ink-muted">
        Betöltés…
      </div>
    );
  }

  // ÁLLAPOT 1: ma már játszott → eredmény-képernyő
  if (state.today) {
    return <ResultScreen state={state} questions={questions} country={country} />;
  }

  // ÁLLAPOT 2: játék folyamatban
  const question = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;
  const selectedAnswer = answers[currentIdx];
  const isCorrect = selectedAnswer === question.correct;

  function chooseAnswer(idx: number) {
    if (revealed) return;
    const next = [...answers];
    next[currentIdx] = idx;
    setAnswers(next);
    setRevealed(true);
    haptic(idx === question.correct ? "success" : "warning");
  }

  function goNext() {
    if (isLast) {
      // Submit
      const result = recordResult(answers, country);
      setState(result);
      return;
    }
    setCurrentIdx((i) => i + 1);
    setRevealed(false);
  }

  return (
    <div className="space-y-4">
      {/* Header — progress */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">
          {currentIdx + 1} / {questions.length}
        </p>
        <p className="text-[11px] text-ink-faint">{today}</p>
      </div>

      <div className="flex gap-1.5">
        {questions.map((_, i) => {
          const answered = answers[i] !== undefined;
          const correct = answered && answers[i] === questions[i].correct;
          return (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition",
                i === currentIdx
                  ? "bg-primary"
                  : answered
                  ? correct
                    ? "bg-success"
                    : "bg-accent"
                  : "bg-line",
              )}
            />
          );
        })}
      </div>

      <QuestionCard
        question={question}
        selectedAnswer={selectedAnswer}
        revealed={revealed}
        onAnswer={chooseAnswer}
        categoryMeta={categoryMeta}
      />

      {revealed && (
        <div className="space-y-2">
          <div
            className={cn(
              "rounded-card border-2 p-4",
              isCorrect ? "border-success/30 bg-success/10" : "border-accent/30 bg-accent-soft",
            )}
          >
            <p className={cn("text-[13px] font-extrabold", isCorrect ? "text-success" : "text-accent")}>
              {isCorrect ? "✓ Helyes!" : "✕ Sajnos nem"}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink">
              {question.explanation}
            </p>
          </div>
          <button
            type="button"
            onClick={goNext}
            className="flex w-full items-center justify-center gap-1.5 rounded-pill bg-primary py-3 text-[14px] font-extrabold text-white shadow-card active:scale-[0.99]"
          >
            {isLast ? "Eredmény megnézése" : "Következő kérdés"}
            <Icon name="arrowRight" size={14} strokeWidth={2.4} />
          </button>
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  question,
  selectedAnswer,
  revealed,
  onAnswer,
  categoryMeta,
}: {
  question: QuizQuestion;
  selectedAnswer?: number;
  revealed: boolean;
  onAnswer: (idx: number) => void;
  categoryMeta: Record<QuizCategory, { label: string; emoji: string }>;
}) {
  const meta = categoryMeta[question.category];

  return (
    <article className="rounded-card border border-line bg-surface p-5 shadow-card space-y-4">
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-pill bg-primary-soft px-2 py-0.5 text-[11.5px] font-bold text-primary">
          {meta.emoji} {meta.label}
        </span>
      </div>

      <h2 className="text-[18px] font-extrabold leading-tight tracking-tight text-ink text-pretty">
        {question.question}
      </h2>

      <div className="space-y-2">
        {question.options.map((opt, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = revealed && idx === question.correct;
          const isWrong = revealed && isSelected && idx !== question.correct;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onAnswer(idx)}
              disabled={revealed}
              className={cn(
                "flex w-full items-start gap-3 rounded-[14px] border-2 px-4 py-3 text-left transition active:scale-[0.99]",
                !revealed && "hover:border-primary/40 hover:bg-primary-soft/30",
                isCorrect && "border-success bg-success/10",
                isWrong && "border-accent bg-accent-soft",
                !isCorrect && !isWrong && "border-line bg-surface",
                revealed && !isSelected && !isCorrect && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-extrabold transition",
                  isCorrect && "bg-success text-white",
                  isWrong && "bg-accent text-white",
                  !isCorrect && !isWrong && "bg-surface-alt text-ink-muted",
                )}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="min-w-0 flex-1 text-[14px] font-semibold text-ink">{opt}</span>
              {isCorrect && <Icon name="check" size={16} strokeWidth={2.6} className="text-success shrink-0" />}
              {isWrong && <Icon name="close" size={16} strokeWidth={2.6} className="text-accent shrink-0" />}
            </button>
          );
        })}
      </div>
    </article>
  );
}

function ResultScreen({
  state,
  questions,
  country,
}: {
  state: QuizState;
  questions: QuizQuestion[];
  country: string;
}) {
  if (!state.today) return null;

  const { score, answers } = state.today;
  const message =
    score === 3 ? "Tökéletes! 🎉" : score === 2 ? "Szép munka! 👏" : score === 1 ? "Lehet jobb is!" : "Holnap újra! 💪";

  return (
    <div className="space-y-5">
      <section className="rounded-card border-2 border-primary/30 bg-gradient-to-br from-primary-soft to-surface p-6 text-center shadow-pop">
        <p className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">
          Mai eredményed
        </p>
        <p className="mt-2 text-[48px] font-extrabold leading-none tracking-tight text-primary">
          {score} / 3
        </p>
        <p className="mt-2 text-[14px] font-bold text-ink">{message}</p>

        {state.streak >= 2 && (
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-pill bg-accent/10 px-3 py-1.5 text-[12px] font-bold text-accent">
            🔥 {state.streak} napos sorozat
          </div>
        )}

        <div className="mt-4 flex justify-center gap-1.5">
          {answers.map((a, i) => {
            const correct = a === questions[i].correct;
            return (
              <span
                key={i}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full text-white text-[14px] font-extrabold",
                  correct ? "bg-success" : "bg-accent",
                )}
              >
                {correct ? "✓" : "✕"}
              </span>
            );
          })}
        </div>

        {/* Viral kör a napi-frekvenciájú felületen: az eredmény egy tappal megy a
            WhatsApp/Messenger-csoportba (Web Share), asztalon vágólapra. */}
        <QuizShareButton score={score} streak={state.streak} country={country} />
      </section>

      {/* Heti összevetés: valós anonim percentilis (elég mintától), addig a saját
          heti statod. Lásd /api/kviz/percentile + weeklyPersonalStats. */}
      <WeeklyCompareBanner state={state} country={country} score={score} />

      {/* Push-engedély a LEGJOBB pillanatban: most játszott, él a sorozata — a
          streak-mentő esti push pontosan ezt védi. Engedélyezettnél / nem
          támogatott környezetben a kártya magától elrejtőzik. */}
      <PushOptin
        eager
        title="🔥 Védd a sorozatod!"
        subtitle="Este szólunk, ha aznap még nem játszottál — így nem törik meg a széria."
      />

      {/* „Kvízből Lead": a rontott téma szakértője a Szaknévsorból (kurált pár,
          kiemelt=PRO cég elöl). Hibátlan kvíz / nem-párosított téma / 0 találat
          → a kártya meg sem jelenik. */}
      {(() => {
        const proTarget = pickQuizProTarget(questions, answers);
        return proTarget ? <QuizProCta target={proTarget} country={country} /> : null;
      })()}

      {/* Kérdés-áttekintő */}
      <section className="space-y-2">
        <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
          Mai kérdések
        </h3>
        {questions.map((q, i) => {
          const userAnswer = answers[i];
          const correct = userAnswer === q.correct;
          return (
            <div
              key={q.id}
              className={cn(
                "rounded-card border bg-surface p-4 shadow-card",
                correct ? "border-success/30" : "border-accent/30",
              )}
            >
              <p className="text-[13.5px] font-extrabold text-ink">{q.question}</p>
              <div className="mt-2 space-y-1 text-[12px]">
                {!correct && userAnswer !== undefined && (
                  <p className="text-accent">
                    A te választásod: <strong>{q.options[userAnswer]}</strong>
                  </p>
                )}
                <p className="text-success">
                  Helyes: <strong>{q.options[q.correct]}</strong>
                </p>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-muted italic">
                {q.explanation}
              </p>
            </div>
          );
        })}
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-2">
        <StatCard label="Sorozat" value={`${state.streak}🔥`} />
        <StatCard label="Játszott nap" value={String(state.totalDays)} />
        <StatCard
          label="Összes pont"
          value={`${state.totalScore}/${state.totalDays * 3}`}
        />
      </section>

      <p className="text-center text-[11.5px] text-ink-muted">
        Új kérdések minden nap éjfél után. <br />
        Találkozunk holnap! 👋
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-surface p-3 text-center shadow-card">
      <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="mt-1 text-[16px] font-extrabold text-ink">{value}</p>
    </div>
  );
}

/** Ország → „a <hol> élők" magyar kifejezés a percentilis-mondatba. */
const COUNTRY_PHRASE: Record<string, string> = {
  CH: "a Svájcban élők",
  AT: "az Ausztriában élők",
  DE: "a Németországban élők",
  NL: "a Hollandiában élők",
};

/**
 * Heti összevető sáv. Első megnyitáskor (aznap) anonim módon beszámítja a mai
 * eredményt (POST), és lekéri a heti percentilist; újranyitáskor csak lekéri
 * (GET). Ha van elég közösségi minta → valós percentilis; ha nincs → a SAJÁT
 * heti statod (backend-független, sose „reklámozza az ürességet").
 */
function WeeklyCompareBanner({
  state,
  country,
  score,
}: {
  state: QuizState;
  country: string;
  score: number;
}) {
  const [pct, setPct] = useState<{ percentile: number | null; total: number } | null>(null);
  const [battle, setBattle] = useState<BattleData | null>(null);
  const [canton, setCanton] = useState<string | null>(null);
  const day = state.today?.date ?? "";

  useEffect(() => {
    if (!day) return;
    let cancelled = false;
    const flagKey = `kinti.quizStat.${day}`;
    let submitted = false;
    try {
      submitted = localStorage.getItem(flagKey) === "1";
    } catch {
      /* private mode → mindig POST-olunk (idempotenciát a szerver napi-limit fedi) */
    }

    // Régió-csapat (Régiók Harca): a szaknévsoros régió-preferencia, önkéntes/anonim.
    const preferredCanton = readPreferredCanton();
    setCanton(preferredCanton);

    (async () => {
      try {
        const res = submitted
          ? await fetch(`/api/kviz/percentile?country=${encodeURIComponent(country)}&score=${score}`)
          : await fetch(`/api/kviz/percentile`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ country, score, canton: preferredCanton ?? undefined }),
            });
        if (!submitted && res.ok) {
          try {
            localStorage.setItem(flagKey, "1");
          } catch {
            /* ignore */
          }
        }
        const data = res.ok
          ? ((await res.json()) as { percentile?: number | null; total?: number; battle?: BattleData })
          : null;
        if (!cancelled) {
          setPct(data ? { percentile: data.percentile ?? null, total: data.total ?? 0 } : { percentile: null, total: 0 });
          if (data?.battle) setBattle(data.battle);
        }
      } catch {
        if (!cancelled) setPct({ percentile: null, total: 0 });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [day, country, score]);

  // Töltés közben low-key placeholder (ne ugráljon a layout).
  if (pct === null) {
    return (
      <div className="rounded-card border border-line bg-surface px-4 py-3 text-center text-[12px] text-ink-faint shadow-card">
        Heti összevetés…
      </div>
    );
  }

  // Az „Országok és Régiók Harca" tábla a percentilis-sáv alatt (ha van verseny).
  const battleBoard = battle ? (
    <BattleBoard battle={battle} country={country} canton={canton} score={score} />
  ) : null;

  // Van elég közösségi minta → valós, anonim percentilis.
  if (pct.percentile !== null) {
    const phrase = COUNTRY_PHRASE[country] ?? "a közösség";
    return (
      <>
        <div className="rounded-card border-2 border-primary/30 bg-primary-soft/60 px-4 py-3.5 text-center shadow-card">
          <p className="text-[13.5px] font-extrabold leading-snug text-ink">
            📊 Ezen a héten {phrase} <span className="text-primary">{pct.percentile}%-ánál</span> jobb eredményt értél el!
          </p>
          <p className="mt-1 text-[11px] text-ink-muted">heti {pct.total} játék alapján · anonim</p>
        </div>
        {battleBoard}
      </>
    );
  }

  // Nincs elég minta → SAJÁT heti stat (őszinte fallback).
  const weekly = weeklyPersonalStats(state.history, day);
  return (
    <>
      <div className="rounded-card border border-line bg-surface px-4 py-3.5 text-center shadow-card">
        <p className="text-[13px] font-extrabold text-ink">
          📅 Ezen a héten: {weekly.days}/7 nap · {weekly.accuracyPct}% pontosság
        </p>
        <p className="mt-1 text-[11px] text-ink-muted">
          A közösségi rangsor hamarosan — gyűlik a heti mezőny.
        </p>
      </div>
      {battleBoard}
    </>
  );
}

/**
 * QuizShareButton — az eredmény natív megosztása (Web Share; asztali fallback:
 * vágólap). A napi kvíz a legmagasabb frekvenciájú felület → itt ér a legtöbbet
 * a viral kör: a szöveg kihívás-jellegű, a link a /kviz-re hoz új játékost.
 */
function QuizShareButton({ score, streak, country }: { score: number; streak: number; country: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const text = `🎯 ${score}/3 lett a mai ${countryAdjective(country)} kvízem a Kintin${
      streak >= 2 ? ` — ${streak} napos sorozat 🔥` : ""
    }! Te mennyit tudsz a választott hazádról?`;
    const url = "https://kinti.app/kviz";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Napi Kinti Kvíz", text, url });
        return;
      }
    } catch {
      /* a user bezárta a megosztót → nem hiba */
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard-engedély hiánya — csendben elnyeljük */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="mt-4 inline-flex items-center gap-1.5 rounded-pill border border-primary/30 bg-surface px-4 py-2 text-[12.5px] font-bold text-primary transition active:scale-[0.97]"
    >
      <Icon name="share" size={14} strokeWidth={2.4} />
      {copied ? "Kimásolva ✓" : "Megosztom az eredményem"}
    </button>
  );
}
