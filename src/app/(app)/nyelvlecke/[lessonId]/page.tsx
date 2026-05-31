"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LESSONS, Question } from "../data";
import { Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export default function LessonPage({ params }: { params: { lessonId: string } }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const lesson = LESSONS.find((l) => l.id === params.lessonId);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // match state
  const [matchSelectedLeft, setMatchSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // array of pair IDs that are matched
  const [matchWrong, setMatchWrong] = useState(false);
  
  // result state
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFlashcardBack, setShowFlashcardBack] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-4">Betöltés...</div>;
  if (!lesson) return <div className="p-4">Lecke nem található.</div>;

  const question = lesson.questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === lesson.questions.length - 1;
  const progressPercent = Math.round((currentQuestionIdx / lesson.questions.length) * 100);

  const handleCheck = () => {
    if (question.type === "multiple_choice") {
      const correct = selectedOption === question.correctOptionId;
      setIsCorrect(correct);
      setIsAnswered(true);
    } else if (question.type === "flashcard") {
      setIsCorrect(true);
      setIsAnswered(true);
    } else if (question.type === "match") {
      // should auto-check as they match, "check" button is just for "continue" when all matched
      if (matchedPairs.length === question.pairs?.length) {
        setIsCorrect(true);
        setIsAnswered(true);
      }
    }
  };

  const handleNext = () => {
    if (!isCorrect && question.type === "multiple_choice") {
      // In a real app we might put the question at the end of the queue. For MVP, we just move on.
    }

    if (isLastQuestion) {
      // Save progress
      const saved = localStorage.getItem("kinti_language_progress");
      let data = { completed: [], xp: 0 };
      if (saved) {
        try {
          data = JSON.parse(saved);
        } catch (e) {}
      }
      
      if (!data.completed.includes(lesson.id)) {
        data.completed.push(lesson.id);
        data.xp += lesson.xpReward;
        localStorage.setItem("kinti_language_progress", JSON.stringify(data));
      }
      
      router.push("/nyelvlecke");
    } else {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setShowFlashcardBack(false);
      setMatchSelectedLeft(null);
      setMatchedPairs([]);
    }
  };

  const renderMultipleChoice = () => (
    <div className="flex flex-col gap-4 mt-8 w-full max-w-sm mx-auto">
      {question.options?.map((opt) => {
        const isSelected = selectedOption === opt.id;
        const showCorrect = isAnswered && opt.id === question.correctOptionId;
        const showWrong = isAnswered && isSelected && !isCorrect;

        return (
          <button
            key={opt.id}
            disabled={isAnswered}
            onClick={() => setSelectedOption(opt.id)}
            className={cn(
              "p-4 rounded-2xl border-2 text-left font-bold text-[17px] transition-all",
              !isAnswered && !isSelected && "border-border-subtle bg-surface hover:bg-surface-alt",
              !isAnswered && isSelected && "border-primary bg-primary/5 text-primary",
              showCorrect && "border-success bg-success/10 text-success",
              showWrong && "border-accent bg-accent/10 text-accent animate-shake"
            )}
          >
            {opt.text}
          </button>
        );
      })}
    </div>
  );

  const renderFlashcard = () => (
    <div className="flex flex-col items-center gap-6 mt-8 w-full max-w-sm mx-auto perspective-1000">
      <button
        onClick={() => {
          setShowFlashcardBack(!showFlashcardBack);
          if (!isAnswered) setIsAnswered(true); // Any click counts as seen
        }}
        className="relative w-full h-[300px] rounded-[32px] preserve-3d transition-transform duration-500 cursor-pointer"
        style={{ transform: showFlashcardBack ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-surface border-2 border-border-strong/20 rounded-[32px] flex items-center justify-center p-6 shadow-card">
          <h2 className="text-3xl font-black text-ink text-center">{question.prompt}</h2>
        </div>
        
        {/* Back */}
        <div className="absolute inset-0 backface-hidden bg-primary/5 border-2 border-primary/20 rounded-[32px] flex flex-col items-center justify-center p-6 shadow-card transform rotate-y-180">
          <h2 className="text-3xl font-black text-primary text-center">{question.backText}</h2>
          {question.phonetic && (
            <p className="mt-4 text-lg font-bold text-ink/50 tracking-wider">[{question.phonetic}]</p>
          )}
        </div>
      </button>
      <p className="text-[13px] font-bold uppercase text-ink-muted tracking-widest">
        Koppints a fordításért
      </p>
    </div>
  );

  const handleMatchClick = (side: "left" | "right", itemId: string) => {
    if (side === "left") {
      if (matchSelectedLeft === itemId) setMatchSelectedLeft(null);
      else setMatchSelectedLeft(itemId);
      setMatchWrong(false);
    } else {
      if (!matchSelectedLeft) return; // need left selected first
      
      const pair = question.pairs?.find(p => p.id === matchSelectedLeft);
      if (pair && pair.right === itemId) {
        // Correct match
        setMatchedPairs([...matchedPairs, pair.id]);
        setMatchSelectedLeft(null);
        if (matchedPairs.length + 1 === question.pairs?.length) {
           setIsAnswered(true);
           setIsCorrect(true);
        }
      } else {
        // Wrong match
        setMatchWrong(true);
        setTimeout(() => setMatchWrong(false), 500);
        setMatchSelectedLeft(null);
      }
    }
  };

  const renderMatch = () => {
    const lefts = question.pairs?.map(p => ({ id: p.id, text: p.left })) || [];
    // Shuffle rights (deterministic for simplicity or random)
    const rights = [...(question.pairs || [])].sort((a,b) => a.right.localeCompare(b.right)).map(p => ({ id: p.right, text: p.right }));

    return (
      <div className="flex gap-4 mt-8 w-full max-w-sm mx-auto">
        <div className="flex flex-col gap-3 flex-1">
          {lefts.map(l => {
            const isMatched = matchedPairs.includes(l.id);
            const isSelected = matchSelectedLeft === l.id;
            return (
              <button
                key={l.id}
                disabled={isMatched}
                onClick={() => handleMatchClick("left", l.id)}
                className={cn(
                  "p-3 rounded-xl border-2 text-[14px] font-bold transition-all text-center h-[60px] flex items-center justify-center",
                  isMatched ? "opacity-0 invisible" : "",
                  !isSelected && "border-border-subtle bg-surface",
                  isSelected && "border-primary bg-primary/10 text-primary"
                )}
              >
                {l.text}
              </button>
            )
          })}
        </div>
        <div className="flex flex-col gap-3 flex-1">
          {rights.map(r => {
            // Find which pair this right belongs to
            const pairId = question.pairs?.find(p => p.right === r.id)?.id;
            const isMatched = pairId && matchedPairs.includes(pairId);
            
            return (
              <button
                key={r.id}
                disabled={isMatched}
                onClick={() => handleMatchClick("right", r.id)}
                className={cn(
                  "p-3 rounded-xl border-2 text-[14px] font-bold transition-all text-center h-[60px] flex items-center justify-center",
                  isMatched ? "opacity-0 invisible" : "border-border-subtle bg-surface",
                  matchWrong && "animate-shake border-accent/50"
                )}
              >
                {r.text}
              </button>
            )
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-surface">
      {/* Header & Progress */}
      <div className="flex items-center gap-4 p-4 pt-6 shrink-0">
        <button 
          onClick={() => router.push("/nyelvlecke")}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink/5 hover:bg-ink/10 text-ink/50 transition-colors"
        >
          <Icon name="close" size={20} strokeWidth={2.5} />
        </button>
        <div className="flex-1 h-4 bg-ink/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: \`\${progressPercent}%\` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-5 py-6 overflow-y-auto">
        <h1 className="text-[24px] font-black tracking-tight text-ink leading-tight">
          {question.type !== "flashcard" && question.prompt}
        </h1>

        {question.type === "multiple_choice" && renderMultipleChoice()}
        {question.type === "flashcard" && renderFlashcard()}
        {question.type === "match" && renderMatch()}
      </div>

      {/* Footer / CTA Area */}
      <div className="shrink-0 p-5 border-t border-border-subtle bg-surface">
        {!isAnswered ? (
          <Button 
            fullWidth 
            size="lg" 
            variant="primary"
            disabled={question.type === "multiple_choice" && !selectedOption}
            onClick={handleCheck}
            className="text-[17px]"
          >
            Ellenőrzés
          </Button>
        ) : (
          <div className={cn(
            "fixed bottom-0 left-0 right-0 p-5 pt-8 rounded-t-[32px] animate-fade-up z-50",
            isCorrect || question.type === "flashcard" ? "bg-success/10 border-t-2 border-success/20" : "bg-accent/10 border-t-2 border-accent/20"
          )}>
            <div className="flex items-start gap-4 mb-6">
              <div className={cn(
                "grid h-12 w-12 shrink-0 place-items-center rounded-full text-white",
                isCorrect || question.type === "flashcard" ? "bg-success" : "bg-accent"
              )}>
                <Icon name={isCorrect || question.type === "flashcard" ? "check" : "close"} size={24} strokeWidth={3} />
              </div>
              <div>
                <h3 className={cn(
                  "text-[20px] font-black",
                  isCorrect || question.type === "flashcard" ? "text-success" : "text-accent"
                )}>
                  {isCorrect || question.type === "flashcard" ? "Kiváló!" : "Sajnos nem jó."}
                </h3>
                {!isCorrect && question.type === "multiple_choice" && (
                  <p className="text-[15px] font-bold text-accent/80 mt-1">
                    Helyes válasz: {question.options?.find(o => o.id === question.correctOptionId)?.text}
                  </p>
                )}
              </div>
            </div>
            
            <Button 
              fullWidth 
              size="lg" 
              className={cn(
                "text-[17px] shadow-none",
                isCorrect || question.type === "flashcard" 
                  ? "bg-success hover:bg-success/90 text-white" 
                  : "bg-accent hover:bg-accent/90 text-white"
              )}
              onClick={handleNext}
            >
              {isLastQuestion ? "Befejezés" : "Tovább"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
