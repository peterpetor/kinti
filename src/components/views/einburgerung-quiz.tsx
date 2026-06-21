"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  EB_BANK,
  EB_CANTONS,
  EB_TOPIC_META,
  type EbQuestion,
} from "@/lib/einburgerung-bank";
import { generateQuiz, QUIZ_LENGTH, PASS_THRESHOLD } from "@/lib/einburgerung-quiz";
import { LegalDisclaimer } from "@/components/legal-disclaimer";

type Phase = "intro" | "quiz" | "result";

export function EinburgerungQuiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [canton, setCanton] = useState<string>("");
  const [questions, setQuestions] = useState<EbQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);

  function start() {
    if (!canton) return;
    setQuestions(generateQuiz(canton));
    setCurrentIdx(0);
    setAnswers([]);
    setRevealed(false);
    setPhase("quiz");
  }

  function chooseAnswer(idx: number) {
    if (revealed) return;
    const next = [...answers];
    next[currentIdx] = idx;
    setAnswers(next);
    setRevealed(true);
  }

  function next() {
    if (currentIdx >= questions.length - 1) {
      setPhase("result");
      return;
    }
    setCurrentIdx((i) => i + 1);
    setRevealed(false);
  }

  function restart() {
    setPhase("intro");
    setQuestions([]);
    setAnswers([]);
    setCurrentIdx(0);
    setRevealed(false);
  }

  if (phase === "intro") {
    return <IntroScreen canton={canton} setCanton={setCanton} onStart={start} />;
  }
  if (phase === "result") {
    return <ResultScreen questions={questions} answers={answers} canton={canton} onRestart={restart} />;
  }

  return (
    <QuizScreen
      questions={questions}
      currentIdx={currentIdx}
      answers={answers}
      revealed={revealed}
      onAnswer={chooseAnswer}
      onNext={next}
      onAbort={() => setPhase("intro")}
    />
  );
}

function IntroScreen({
  canton,
  setCanton,
  onStart,
}: {
  canton: string;
  setCanton: (c: string) => void;
  onStart: () => void;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-card border-2 border-primary/30 bg-gradient-to-br from-primary-soft to-surface p-5 shadow-pop">
        <div className="flex items-start gap-3">
          <span className="text-4xl shrink-0">🇨🇭</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-extrabold leading-tight tracking-tight text-ink">
              Einbürgerung-szimulátor
            </h1>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              {QUIZ_LENGTH} kérdés: szövetségi politika, történelem, földrajz, állampolgári
              jogok + 3 kérdés a választott kantonra. A vizsga-küszöb: <strong>{PASS_THRESHOLD}%</strong>.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 shadow-card space-y-3">
        <label className="block text-[12px] font-bold uppercase tracking-wide text-ink-muted">
          Melyik kantonban élsz / mire készülsz?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {EB_CANTONS.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCanton(c.code)}
              className={cn(
                "rounded-[12px] border-2 px-2 py-3 text-center transition active:scale-95",
                canton === c.code
                  ? "border-primary bg-primary-soft"
                  : "border-line bg-surface",
              )}
            >
              <div className="text-[15px] font-extrabold text-ink">{c.code}</div>
              <div className="mt-0.5 text-[11.5px] text-ink-muted">{c.name}</div>
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!canton}
          onClick={onStart}
          className="flex w-full items-center justify-center gap-2 rounded-pill bg-primary py-3 text-[14px] font-extrabold text-white shadow-card active:scale-[0.99] disabled:opacity-50"
        >
          Teszt indítása
          <Icon name="arrowRight" size={14} strokeWidth={2.4} />
        </button>
      </section>

      <LegalDisclaimer
        toolName="Einbürgerung-szimulátor"
        variant="critical"
        notAdviceFor="jogi vagy állampolgársági"
        extraWarning="Ez egy oktatási játék — NEM HIVATALOS VIZSGA. A valódi svájci állampolgársági vizsga kantononként és községenként SZIGNIFIKÁNSAN eltér: más kérdések, más nyelv, más küszöb. A szimulátor 'átmenő' eredménye semmilyen módon nem helyettesíti a tényleges vizsgát."
        officialSources={[
          { label: "SEM — Hivatalos állampolgárság-info", url: "https://www.sem.admin.ch/sem/de/home/themen/buergerrecht.html" },
          { label: "ch.ch — Állampolgárság", url: "https://www.ch.ch/de/leben-in-der-schweiz/staatsbuergerschaft/" },
        ]}
      />
    </div>
  );
}

function QuizScreen({
  questions,
  currentIdx,
  answers,
  revealed,
  onAnswer,
  onNext,
  onAbort,
}: {
  questions: EbQuestion[];
  currentIdx: number;
  answers: number[];
  revealed: boolean;
  onAnswer: (idx: number) => void;
  onNext: () => void;
  onAbort: () => void;
}) {
  const question = questions[currentIdx];
  const meta = EB_TOPIC_META[question.topic];
  const isLast = currentIdx === questions.length - 1;
  const selectedAnswer = answers[currentIdx];
  const isCorrect = selectedAnswer === question.correct;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">
          {currentIdx + 1} / {questions.length}
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm("Biztos félbe szakítod? Az eddigi válaszok elvesznek.")) {
              onAbort();
            }
          }}
          className="text-[11px] font-bold text-ink-faint underline hover:text-accent"
        >
          Megszakít
        </button>
      </div>

      <div className="flex gap-1">
        {questions.map((_, i) => {
          const answered = answers[i] !== undefined;
          const correct = answered && answers[i] === questions[i].correct;
          return (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition",
                i === currentIdx ? "bg-primary" : answered ? (correct ? "bg-success" : "bg-accent") : "bg-line",
              )}
            />
          );
        })}
      </div>

      <article className="rounded-card border border-line bg-surface p-5 shadow-card space-y-4">
        <span
          className="inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11.5px] font-bold text-white"
          style={{ backgroundColor: meta.color }}
        >
          {meta.emoji} {meta.label}
          {question.cantonCode && ` · ${question.cantonCode}`}
        </span>

        <h2 className="text-[17px] font-extrabold leading-tight tracking-tight text-ink text-pretty">
          {question.question}
        </h2>

        <div className="space-y-2">
          {question.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const isRightAnswer = revealed && idx === question.correct;
            const isWrongChoice = revealed && isSelected && idx !== question.correct;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onAnswer(idx)}
                disabled={revealed}
                className={cn(
                  "flex w-full items-start gap-3 rounded-[14px] border-2 px-4 py-3 text-left transition active:scale-[0.99]",
                  !revealed && "hover:border-primary/40 hover:bg-primary-soft/30",
                  isRightAnswer && "border-success bg-success/10",
                  isWrongChoice && "border-accent bg-accent-soft",
                  !isRightAnswer && !isWrongChoice && "border-line bg-surface",
                  revealed && !isSelected && !isRightAnswer && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-extrabold",
                    isRightAnswer && "bg-success text-white",
                    isWrongChoice && "bg-accent text-white",
                    !isRightAnswer && !isWrongChoice && "bg-surface-alt text-ink-muted",
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="min-w-0 flex-1 text-[13.5px] font-semibold text-ink">{opt}</span>
                {isRightAnswer && <Icon name="check" size={16} strokeWidth={2.6} className="text-success shrink-0" />}
                {isWrongChoice && <Icon name="close" size={16} strokeWidth={2.6} className="text-accent shrink-0" />}
              </button>
            );
          })}
        </div>
      </article>

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
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink">{question.explanation}</p>
          </div>
          <button
            type="button"
            onClick={onNext}
            className="flex w-full items-center justify-center gap-1.5 rounded-pill bg-primary py-3 text-[14px] font-extrabold text-white shadow-card active:scale-[0.99]"
          >
            {isLast ? "Eredmény megnézése" : "Következő"}
            <Icon name="arrowRight" size={14} strokeWidth={2.4} />
          </button>
        </div>
      )}
    </div>
  );
}

function ResultScreen({
  questions,
  answers,
  canton,
  onRestart,
}: {
  questions: EbQuestion[];
  answers: number[];
  canton: string;
  onRestart: () => void;
}) {
  const score = useMemo(
    () =>
      questions.reduce((s, q, i) => (answers[i] === q.correct ? s + 1 : s), 0),
    [questions, answers],
  );
  const total = questions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = pct >= PASS_THRESHOLD;

  // Topic-statisztika
  const byTopic = useMemo(() => {
    const m = new Map<string, { correct: number; total: number }>();
    questions.forEach((q, i) => {
      const key = q.topic;
      const r = m.get(key) ?? { correct: 0, total: 0 };
      r.total++;
      if (answers[i] === q.correct) r.correct++;
      m.set(key, r);
    });
    return m;
  }, [questions, answers]);

  return (
    <div className="space-y-5">
      <section
        className={cn(
          "rounded-card border-2 p-6 text-center shadow-pop",
          passed ? "border-success/40 bg-success/10" : "border-accent/40 bg-accent-soft",
        )}
      >
        <span className="text-5xl">{passed ? "🎉" : "📚"}</span>
        <p className="mt-2 text-[12px] font-bold uppercase tracking-wide text-ink-muted">
          Eredményed
        </p>
        <p className={cn("mt-2 text-[48px] font-extrabold leading-none tracking-tight", passed ? "text-success" : "text-accent")}>
          {pct}%
        </p>
        <p className="mt-1 text-[14px] font-bold text-ink">
          {score} / {total} helyes válasz
        </p>
        <p className={cn("mt-3 text-[14px] font-bold", passed ? "text-success" : "text-accent")}>
          {passed ? "✓ Sikeresen átmentél a szimulátoron!" : `✕ A küszöb ${PASS_THRESHOLD}% — még gyakorold a témákat.`}
        </p>
      </section>

      {/* Topic breakdown */}
      <section className="space-y-2">
        <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
          Téma-eredmények
        </h3>
        {Array.from(byTopic.entries()).map(([topic, stat]) => {
          const meta = EB_TOPIC_META[topic as keyof typeof EB_TOPIC_META];
          const topicPct = Math.round((stat.correct / stat.total) * 100);
          return (
            <div
              key={topic}
              className="flex items-center gap-3 rounded-card border border-line bg-surface p-3 shadow-card"
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-white"
                style={{ backgroundColor: meta.color }}
              >
                {meta.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-bold text-ink">{meta.label}</p>
                <div className="mt-1 h-1.5 w-full rounded-full bg-surface-alt overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      topicPct >= 80 ? "bg-success" : topicPct >= 50 ? "bg-[#e3a233]" : "bg-accent",
                    )}
                    style={{ width: `${topicPct}%` }}
                  />
                </div>
              </div>
              <p className="text-[12px] font-extrabold text-ink shrink-0">
                {stat.correct}/{stat.total}
              </p>
            </div>
          );
        })}
      </section>

      {/* Áttekintő — összes kérdés */}
      <section className="space-y-2">
        <h3 className="text-[11.5px] font-bold uppercase tracking-wide text-ink-muted px-1">
          Kérdések áttekintése
        </h3>
        {questions.map((q, i) => {
          const userAnswer = answers[i];
          const correct = userAnswer === q.correct;
          return (
            <div
              key={q.id}
              className={cn(
                "rounded-card border bg-surface p-3.5 shadow-card",
                correct ? "border-success/30" : "border-accent/30",
              )}
            >
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full text-white text-[11.5px] font-extrabold",
                    correct ? "bg-success" : "bg-accent",
                  )}
                >
                  {correct ? "✓" : "✕"}
                </span>
                <p className="text-[12.5px] font-extrabold text-ink">{q.question}</p>
              </div>
              <div className="mt-2 ml-8 space-y-0.5 text-[11.5px]">
                {!correct && userAnswer !== undefined && (
                  <p className="text-accent">
                    A te választásod: <strong>{q.options[userAnswer]}</strong>
                  </p>
                )}
                <p className="text-success">
                  Helyes: <strong>{q.options[q.correct]}</strong>
                </p>
              </div>
              <p className="mt-1.5 ml-8 text-[11.5px] leading-relaxed text-ink-muted italic">
                {q.explanation}
              </p>
            </div>
          );
        })}
      </section>

      <button
        type="button"
        onClick={onRestart}
        className="flex w-full items-center justify-center gap-2 rounded-pill bg-primary py-3 text-[14px] font-extrabold text-white shadow-card active:scale-[0.99]"
      >
        <Icon name="arrowLeft" size={14} strokeWidth={2.4} className="rotate-180" />
        Új teszt
      </button>

      <p className="px-1 text-center text-[11px] leading-snug text-ink-faint">
        {EB_BANK.length} kérdés-bank, gyakorolj annyiszor amennyiszer akarsz!
      </p>

      <LegalDisclaimer
        toolName="Einbürgerung-szimulátor"
        variant="critical"
        notAdviceFor="jogi vagy állampolgársági"
        extraWarning="A SZIMULÁTOR ÁTMENT/MEGBUKOTT EREDMÉNYE SEMMILYEN MÓDON NEM HELYETTESÍTI A HIVATALOS VIZSGÁT. A valódi állampolgársági vizsga teljesen más: kantoni / községi szervezésű, más kérdésekkel, más nyelven, más szóbeli résszel."
        officialSources={[
          { label: "SEM — Állampolgárság hivatalos", url: "https://www.sem.admin.ch/sem/de/home/themen/buergerrecht.html" },
        ]}
      />
    </div>
  );
}
