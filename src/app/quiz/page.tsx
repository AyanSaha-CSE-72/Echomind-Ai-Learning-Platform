"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { useEcho } from "@/lib/store";
import { makeQuizQuestion } from "@/lib/ai-engine";
import { cn } from "@/lib/utils";
import { Target, Check, X, Trophy, ArrowRight, Sparkles } from "lucide-react";

interface QuizQuestion {
  conceptId: string;
  conceptName: string;
  q: string;
  options: string[];
  correct: number;
}

export default function QuizPage() {
  const concepts = useEcho((s) => s.concepts);
  const reinforceConcept = useEcho((s) => s.reinforceConcept);
  const weakenConcept = useEcho((s) => s.weakenConcept);
  const addXp = useEcho((s) => s.addXp);

  const questions: QuizQuestion[] = useMemo(() => {
    return concepts.slice(0, 6).map((c) => {
      const qq = makeQuizQuestion(c.name);
      return { conceptId: c.id, conceptName: c.name, ...qq };
    });
  }, [concepts]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const current = questions[idx];

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    setTimeout(() => {
      const isRight = i === current.correct;
      if (isRight) {
        setCorrect((c) => c + 1);
        reinforceConcept(current.conceptId, 0.7);
        addXp(20);
      } else {
        weakenConcept(current.conceptId);
      }
      setTimeout(() => {
        if (idx + 1 >= questions.length) {
          setDone(true);
        } else {
          setIdx((i) => i + 1);
          setSelected(null);
        }
      }, 900);
    }, 500);
  };

  const restart = () => {
    setIdx(0);
    setSelected(null);
    setCorrect(0);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto p-6 md:p-10 pb-24 lg:pb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-[2rem] p-10 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-transparent" />
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center mb-6"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <div className="text-[11px] uppercase tracking-wider text-violet-300 mb-2">Quiz complete</div>
              <h2 className="text-5xl font-semibold mb-2">
                {pct}
                <span className="text-2xl text-ink-400">%</span>
              </h2>
              <p className="text-ink-300 mb-8">
                {correct} of {questions.length} correct · +{correct * 20} XP
              </p>
              <div className="grid grid-cols-3 gap-3 mb-8">
                <Stat label="Accuracy" value={`${pct}%`} />
                <Stat label="Speed" value="Fast" />
                <Stat label="Streak" value={`${correct}`} />
              </div>
              <button
                onClick={restart}
                className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 font-medium inline-flex items-center gap-2 hover:scale-105 transition-transform"
              >
                Try another quiz
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-6 md:p-10 pb-24 lg:pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-semibold tracking-tight">
            Adaptive{" "}
            <span className="text-gradient italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Quiz.
            </span>
          </h1>
          <p className="text-ink-300 mt-2">
            Questions chosen by what you're about to forget.
          </p>
        </motion.div>

        {/* Progress */}
        <div className="mt-8 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-300" />
            <span>
              Question {idx + 1} of {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{correct} correct</span>
          </div>
        </div>
        <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all"
            style={{ width: `${(idx / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mt-10"
          >
            <div className="glass-strong rounded-3xl p-8">
              <div className="text-xs text-ink-400 mb-2">
                On: <span className="text-violet-300">{current.conceptName}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold leading-relaxed mb-8">
                {current.q}
              </h2>
              <div className="space-y-2">
                {current.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrect = i === current.correct;
                  const showResult = selected !== null;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      disabled={selected !== null}
                      className={cn(
                        "w-full text-left glass rounded-2xl p-4 transition-all flex items-center gap-3",
                        showResult && isCorrect && "border-emerald-400/60 bg-emerald-500/10",
                        showResult && isSelected && !isCorrect && "border-rose-400/60 bg-rose-500/10",
                        !showResult && "hover:border-violet-500/40",
                      )}
                    >
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0",
                          showResult && isCorrect
                            ? "bg-emerald-500 text-white"
                            : showResult && isSelected
                            ? "bg-rose-500 text-white"
                            : "bg-white/5",
                        )}
                      >
                        {showResult && isCorrect ? (
                          <Check className="w-4 h-4" />
                        ) : showResult && isSelected ? (
                          <X className="w-4 h-4" />
                        ) : (
                          String.fromCharCode(65 + i)
                        )}
                      </div>
                      <span className="text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-400">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}
