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
  type QuizState,
} from "@/lib/quiz-daily";
import { QUIZ_CATEGORY_META, type QuizCategory, type QuizQuestion } from "@/lib/quiz-bank";
import { AT_QUIZ_CATEGORY_META } from "@/lib/quiz-bank-at";
import { usePreferredCountry } from "@/lib/country-pref";
import { DEFAULT_COUNTRY } from "@/lib/countries";

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
  const categoryMeta = country === "AT" ? AT_QUIZ_CATEGORY_META : QUIZ_CATEGORY_META;

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
    return <ResultScreen state={state} questions={questions} />;
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

function ResultScreen({ state, questions }: { state: QuizState; questions: QuizQuestion[] }) {
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
      </section>

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
