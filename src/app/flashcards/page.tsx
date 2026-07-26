"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { useEcho } from "@/lib/store";
import { currentRetention } from "@/lib/cognitive";
import { makeFlashcard } from "@/lib/ai-engine";
import { cn } from "@/lib/utils";
import { RotateCcw, Check, X, Zap, Brain } from "lucide-react";

export default function FlashcardsPage() {
  const concepts = useEcho((s) => s.concepts);
  const reinforceConcept = useEcho((s) => s.reinforceConcept);
  const weakenConcept = useEcho((s) => s.weakenConcept);
  const addXp = useEcho((s) => s.addXp);

  // Sort by most-fading first
  const queue = useMemo(() => {
    return [...concepts]
      .map((c) => ({ c, r: currentRetention(c) }))
      .sort((a, b) => a.r - b.r);
  }, [concepts]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState<"good" | "miss" | null>(null);

  const current = queue[index % queue.length];
  const card = useMemo(() => makeFlashcard(current.c.name), [current.c.name]);

  const handleAnswer = (quality: "good" | "miss") => {
    setAnswered(quality);
    setTimeout(() => {
      if (quality === "good") {
        reinforceConcept(current.c.id, 0.8);
        addXp(15);
      } else {
        weakenConcept(current.c.id);
      }
      setFlipped(false);
      setAnswered(null);
      setIndex((i) => i + 1);
    }, 400);
  };

  const progress = (index % queue.length) / queue.length;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-6 md:p-10 pb-24 lg:pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-semibold tracking-tight">
            Adaptive{" "}
            <span className="text-gradient italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Flashcards.
            </span>
          </h1>
          <p className="text-ink-300 mt-2">
            Sorted by how much you're about to forget. Flip. Answer. Evolve.
          </p>
        </motion.div>

        {/* Progress */}
        <div className="mt-8 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-300" />
            <span>{index % queue.length + 1} of {queue.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-300" />
            <span>
              {(current.r * 100).toFixed(0)}% retained ·{" "}
              {current.r < 0.4 ? "urgent" : current.r < 0.7 ? "review soon" : "stable"}
            </span>
          </div>
        </div>
        <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Card */}
        <div className="mt-10" style={{ perspective: 1200 }}>
          <motion.div
            key={index}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setFlipped((f) => !f)}
            className="relative cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front */}
            <div
              className={cn(
                "glass-strong rounded-[2rem] p-10 md:p-16 min-h-[420px] flex flex-col items-center justify-center text-center",
                "border border-white/10 relative overflow-hidden",
              )}
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-400/10" />
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6 relative"
                style={{ background: `${current.c.color}30` }}
              >
                <div
                  className="absolute inset-0 rounded-3xl blur-xl"
                  style={{ background: current.c.color, opacity: 0.4 }}
                />
                <span className="text-2xl font-bold relative" style={{ color: current.c.color }}>
                  {current.c.name.slice(0, 1)}
                </span>
              </div>
              <div className="text-xs text-ink-400 uppercase tracking-wider mb-3">
                {current.c.category}
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold leading-tight max-w-lg">
                {card.q}
              </h2>
              <div className="mt-8 text-xs text-ink-400">
                Click to reveal · or press Space
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 glass-strong rounded-[2rem] p-10 md:p-16 min-h-[420px] flex flex-col items-center justify-center text-center border border-violet-500/30"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-violet-500/10 rounded-[2rem]" />
              <div className="text-xs text-violet-300 uppercase tracking-wider mb-4">Answer</div>
              <p className="text-xl md:text-2xl leading-relaxed max-w-lg text-ink-100">
                {card.a}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Answer buttons */}
        <AnimatePresence>
          {flipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 flex gap-3 justify-center"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer("miss");
                }}
                className={cn(
                  "rounded-2xl px-6 py-3 font-medium flex items-center gap-2 transition-all",
                  answered === "miss"
                    ? "bg-rose-500 scale-105"
                    : "glass hover:border-rose-400/40",
                )}
              >
                <X className="w-4 h-4" />
                Still fuzzy
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer("good");
                }}
                className={cn(
                  "rounded-2xl px-6 py-3 font-medium flex items-center gap-2 transition-all",
                  answered === "good"
                    ? "bg-emerald-500 scale-105"
                    : "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:scale-105",
                )}
              >
                <Check className="w-4 h-4" />
                Got it
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!flipped && (
          <div className="mt-6 text-center text-xs text-ink-400">
            <RotateCcw className="w-3 h-3 inline mr-1" />
            Tip: answer honestly. The AI updates your cognitive twin after each card.
          </div>
        )}
      </div>
    </AppShell>
  );
}
