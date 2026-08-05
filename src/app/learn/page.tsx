"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Link2,
  Video,
  FileText,
  Camera,
  Sparkles,
  BookOpen,
  Brain,
  Zap,
  Target,
  Layers,
  Calendar,
  Check,
  Loader2,
  X,
  FileImage,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useEcho } from "@/lib/store";
import { cn } from "@/lib/utils";

type LearnMode = "pdf" | "youtube" | "url" | "image";

interface ProcessedContent {
  id: string;
  title: string;
  kind: LearnMode;
  summary: string;
  keyIdeas: string[];
  flashcards: { q: string; a: string }[];
  timeline?: { time: string; title: string }[];
  concepts: string[];
}

export default function LearnPage() {
  const [mode, setMode] = useState<LearnMode>("pdf");
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedContent | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const addXp = useEcho((s) => s.addXp);
  const reinforceConcept = useEcho((s) => s.reinforceConcept);

  const handleChooseFile = () => fileInputRef.current?.click();
  const clearFile = () => {
    setSelectedFile(null);
    setInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    setInput(f.name);
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (mode === "pdf" && !f.name.toLowerCase().endsWith(".pdf")) { alert("Please select a PDF."); return; }
    if (mode === "image" && !f.type.startsWith("image/")) { alert("Please select an image file."); return; }
    setSelectedFile(f); setInput(f.name);
  };

  const handleProcess = () => {
    if (!input.trim()) return;
    setProcessing(true);
    setTimeout(() => {
      const content: ProcessedContent = {
        id: `learn-${Date.now()}`,
        title:
          mode === "youtube"
            ? "Neural Networks Explained — 3Blue1Brown"
            : mode === "url"
            ? "The Transformer Architecture — Deep Dive"
            : "Machine Learning Foundations",
        kind: mode,
        summary:
          "This material covers the core mechanics of how machines learn from data. We move from the intuition of pattern matching to the mathematical machinery of optimization, showing how gradients guide weights toward better predictions. The key insight is that learning is just gradient descent on a loss surface, and deep networks learn hierarchical representations.",
        keyIdeas: [
          "Machine learning maps inputs to outputs via learned parameters",
          "Loss functions quantify prediction error",
          "Gradients tell us which direction reduces error",
          "Deep networks learn hierarchical features layer by layer",
          "Generalization requires regularization and sufficient data",
        ],
        flashcards: [
          { q: "What is a loss function?", a: "A function that quantifies how wrong a model's predictions are." },
          { q: "What do gradients tell us?", a: "The direction to adjust parameters to reduce error." },
          { q: "Why do we need deep networks?", a: "To learn hierarchical representations — simple features compose into complex ones." },
        ],
        timeline: mode === "youtube" ? [
          { time: "0:00", title: "The intuition of learning" },
          { time: "2:40", title: "What is a neural network?" },
          { time: "8:15", title: "Gradient descent visualized" },
          { time: "15:30", title: "Backpropagation, step by step" },
          { time: "22:00", title: "Why depth matters" },
        ] : undefined,
        concepts: ["ml", "neural", "backprop", "calculus"],
      };
      setResult(content);
      setProcessing(false);
      addXp(120);
      content.concepts.forEach((id) => reinforceConcept(id, 0.8));
    }, 2200);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-6 md:p-10 pb-24 lg:pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-semibold tracking-tight">
            Learn{" "}
            <span className="text-gradient italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Anything.
            </span>
          </h1>
          <p className="text-ink-300 mt-2 max-w-2xl">
            Paste a PDF, YouTube video, article URL, or upload an image. We extract, summarize,
            generate flashcards, quizzes, and a knowledge graph automatically.
          </p>
        </motion.div>

        {/* Mode picker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          {[
            { id: "pdf" as LearnMode, icon: FileText, label: "PDF", desc: "Upload a document" },
            { id: "youtube" as LearnMode, icon: Video, label: "YouTube", desc: "Paste a video URL" },
            { id: "url" as LearnMode, icon: Link2, label: "Article", desc: "Any web page" },
            { id: "image" as LearnMode, icon: Camera, label: "Image", desc: "OCR notes & books" },
          ].map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "glass rounded-2xl p-5 text-left transition-all lift",
                  active && "border-violet-500/50 ring-1 ring-violet-500/30",
                )}
              >
                <Icon className={cn("w-6 h-6 mb-3", active ? "text-violet-300" : "text-ink-400")} />
                <div className="font-medium text-sm">{m.label}</div>
                <div className="text-[11px] text-ink-400 mt-0.5">{m.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Input area */}
        <div className="mt-6 glass rounded-3xl p-6">
          {mode === "pdf" || mode === "image" ? (
            <div
              ref={dropRef}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-colors",
                selectedFile ? "border-violet-500/40 bg-violet-500/5" : "border-white/10 hover:border-violet-500/40",
              )}
            >
              {/* Hidden real file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={mode === "pdf" ? ".pdf,application/pdf" : "image/*"}
                onChange={handleFileSelected}
                className="hidden"
              />

              {selectedFile ? (
                <div>
                  <FileImage className="w-12 h-12 mx-auto text-violet-300 mb-3" />
                  <div className="text-sm font-semibold">{selectedFile.name}</div>
                  <div className="text-xs text-ink-400 mt-0.5 mb-4">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={clearFile}
                      className="rounded-xl glass px-4 py-2 text-xs flex items-center gap-1.5 hover:bg-white/10"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove & rechoose
                    </button>
                    <button
                      onClick={handleProcess}
                      disabled={processing}
                      className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100 flex items-center gap-2"
                    >
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {processing ? "Processing..." : "Upload & Learn"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {mode === "pdf" ? (
                    <Upload className="w-14 h-14 mx-auto text-ink-400 mb-4 opacity-60" />
                  ) : (
                    <Camera className="w-14 h-14 mx-auto text-ink-400 mb-4 opacity-60" />
                  )}
                  <div className="text-base font-medium mb-1">
                    Drop your {mode === "pdf" ? "PDF document" : "image"} here
                  </div>
                  <div className="text-sm text-ink-400 mb-6 max-w-md mx-auto leading-relaxed">
                    or click below to browse · supports{" "}
                    {mode === "pdf" ? ".PDF up to 50MB" : "PNG, JPG, WEBP"}
                  </div>

                  {/* The actual clickable button */}
                  <label
                    htmlFor="secondbrain-file-input"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-7 py-3 text-sm font-medium cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-violet-500/30"
                  >
                    <FileImage className="w-4 h-4" />
                    Choose file
                  </label>

                  {/* Second hidden input for label binding */}
                  <input
                    id="secondbrain-file-input"
                    ref={fileInputRef}
                    type="file"
                    accept={mode === "pdf" ? ".pdf,application/pdf" : "image/*"}
                    onChange={handleFileSelected}
                    className="hidden"
                  />

                  <p className="mt-4 text-[11px] text-ink-400">
                    Files stay in your browser — we don't upload them anywhere yet.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div>
              <label className="text-xs text-ink-400 mb-2 block">
                {mode === "youtube" ? "YouTube URL" : "Article URL"}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    mode === "youtube"
                      ? "https://youtube.com/watch?v=..."
                      : "https://example.com/article"
                  }
                  className="flex-1 glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none placeholder:text-ink-400"
                />
                <button
                  onClick={handleProcess}
                  disabled={!input.trim() || processing}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-medium hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100 flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Learn
                    </>
                  )}
                </button>
              </div>
              <div className="text-[11px] text-ink-400 mt-3">
                Try: "https://youtube.com/watch?v=aircAruvnKk" (3Blue1Brown Neural Networks)
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 space-y-4"
            >
              {/* Header */}
              <div className="glass rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-violet-500/20 to-transparent blur-3xl" />
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center shrink-0">
                    {result.kind === "youtube" ? <Video className="w-5 h-5 text-white" /> : result.kind === "url" ? <Link2 className="w-5 h-5 text-white" /> : <FileText className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-xs text-violet-300 uppercase tracking-wider">
                        Processed
                      </div>
                      <div className="text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">
                        +120 XP
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold">{result.title}</h2>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                {/* Summary */}
                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-violet-300" />
                    <div className="text-xs uppercase tracking-wider text-ink-400">AI Summary</div>
                  </div>
                  <p className="text-sm text-ink-200 leading-relaxed">{result.summary}</p>
                </div>

                {/* Key ideas */}
                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <div className="text-xs uppercase tracking-wider text-ink-400">Key Ideas</div>
                  </div>
                  <ul className="space-y-2">
                    {result.keyIdeas.map((idea, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="text-violet-300 font-mono text-xs mt-0.5">{(i + 1).toString().padStart(2, "0")}</span>
                        <span className="text-ink-200">{idea}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Flashcards */}
                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-cyan-300" />
                    <div className="text-xs uppercase tracking-wider text-ink-400">
                      {result.flashcards.length} Flashcards Generated
                    </div>
                  </div>
                  <div className="space-y-2">
                    {result.flashcards.map((fc, i) => (
                      <details key={i} className="group glass rounded-xl p-3">
                        <summary className="cursor-pointer list-none text-sm flex items-center justify-between">
                          <span>{fc.q}</span>
                          <span className="text-ink-400 group-open:rotate-180 transition-transform">⌄</span>
                        </summary>
                        <div className="mt-2 pt-2 border-t border-white/5 text-xs text-ink-300">
                          {fc.a}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>

                {/* Timeline / Concepts */}
                <div className="glass rounded-3xl p-6">
                  {result.timeline ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-emerald-300" />
                        <div className="text-xs uppercase tracking-wider text-ink-400">Timeline</div>
                      </div>
                      <div className="space-y-2">
                        {result.timeline.map((t, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <span className="text-violet-300 font-mono text-xs w-12 shrink-0">
                              {t.time}
                            </span>
                            <span className="text-ink-200">{t.title}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <Layers className="w-4 h-4 text-fuchsia-300" />
                        <div className="text-xs uppercase tracking-wider text-ink-400">Concepts Detected</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.concepts.map((c) => (
                          <span key={c} className="glass rounded-lg px-3 py-1.5 text-xs capitalize">
                            {c}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Target, label: "Take quiz on this", href: "/quiz" },
                  { icon: Zap, label: "Review flashcards", href: "/flashcards" },
                  { icon: Layers, label: "See in knowledge graph", href: "/graph" },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <a
                      key={action.label}
                      href={action.href}
                      className="glass rounded-2xl px-4 py-3 flex items-center gap-2 text-sm hover:border-violet-500/40"
                    >
                      <Icon className="w-4 h-4 text-violet-300" />
                      {action.label}
                    </a>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
