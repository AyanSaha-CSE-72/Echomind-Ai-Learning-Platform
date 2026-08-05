"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Sparkles,
  Layers,
  BookOpen,
  Zap,
  LineChart,
  Target,
  Rocket,
  Orbit,
  Moon,
  Star,
  Quote,
} from "lucide-react";
import { SecondBrainIcon } from "@/components/secondbrain-icon";
import { useEcho } from "@/lib/store";
import { useEffect, useState } from "react";

function StarField() {
  const [stars, setStars] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 6,
        duration: 3 + Math.random() * 4,
      }))
    );
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
          }}
          animate={{ opacity: [0.1, 1, 0.1] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const setTheme = useEcho((s) => s.setTheme);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="aurora" />
        <div className="grid-bg absolute inset-0" />
        <StarField />
        <div className="noise" />
      </div>

      {/* Top nav */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center animate-glow">
            <SecondBrainIcon size={22} />
          </div>
          <div>
            <div className="font-semibold text-[15px] leading-none">SecondBrain</div>
            <div className="text-[11px] text-ink-400 mt-1">Knowledge that talks back</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-ink-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#science" className="hover:text-white transition-colors">Science</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Stories</a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme("dark")}
            className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:border-violet-500/40"
          >
            <Moon className="w-4 h-4" />
          </button>
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-2 rounded-xl bg-white text-ink-900 px-5 py-2.5 text-sm font-medium hover:scale-105 transition-transform"
          >
            Enter SecondBrain
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 md:px-12 pt-16 md:pt-24 pb-32">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-ink-200 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Introducing the world's first cognitive learning companion
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-semibold text-[44px] md:text-[88px] leading-[1.02] tracking-tight"
          >
            Knowledge that{" "}
            <span className="text-gradient italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
              talks back.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto mt-8 text-ink-300 text-lg md:text-xl leading-relaxed"
          >
            SecondBrain is not another AI tutor. It's a lifelong cognitive companion that builds a
            living model of your mind — predicting what you'll forget, guiding how you'll learn,
            and evolving with you for years.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-3"
          >
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-7 py-4 font-medium hover:scale-105 transition-transform shadow-2xl shadow-violet-500/30"
            >
              <Rocket className="w-4 h-4" />
              Start Learning
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-2xl glass px-7 py-4 font-medium hover:border-violet-500/40 transition-colors"
            >
              Watch demo
            </a>
          </motion.div>

          {/* Hero visual: cognitive twin */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative mt-24 mx-auto max-w-5xl"
          >
            <div className="glass rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-400/10 pointer-events-none" />
              <div className="relative grid md:grid-cols-3 gap-8">
                {/* Cognitive twin visualization */}
                <div className="md:col-span-2 flex items-center justify-center">
                  <div className="relative w-full aspect-square max-w-md">
                    {/* Orbital rings */}
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="absolute inset-0 rounded-full border border-white/10"
                        style={{
                          transform: `scale(${1 - i * 0.22})`,
                        }}
                      />
                    ))}
                    {/* Center brain */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      {["violet-400", "fuchsia-400", "cyan-400", "emerald-400", "amber-400"].map((c, i) => (
                        <div
                          key={i}
                          className={`absolute w-3 h-3 rounded-full bg-${c} shadow-lg`}
                          style={{
                            top: "50%",
                            left: "50%",
                            boxShadow: `0 0 20px currentColor`,
                            ["--r" as any]: `${120 + i * 30}px`,
                            animation: `orbit ${18 + i * 4}s linear infinite`,
                            animationDelay: `${i * -2}s`,
                          }}
                        />
                      ))}
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 blur-2xl opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Brain className="w-16 h-16 text-white" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>
                    {/* Stat badges */}
                    {[
                      { label: "Memory", value: "82%", top: "12%", left: "8%" },
                      { label: "Speed", value: "0.94", top: "10%", right: "8%" },
                      { label: "Focus", value: "42m", bottom: "14%", left: "10%" },
                      { label: "Retention", value: "89%", bottom: "12%", right: "8%" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="absolute glass rounded-2xl px-3 py-2 text-xs"
                        style={stat as React.CSSProperties}
                      >
                        <div className="text-ink-400 text-[10px]">{stat.label}</div>
                        <div className="font-semibold">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live activity feed */}
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider text-ink-400 mb-3">
                    Live cognition feed
                  </div>
                  {[
                    { icon: Brain, text: "Socratic dialogue on recursion", time: "now", color: "text-violet-400" },
                    { icon: Sparkles, text: "New connection: attention → llm", time: "2m", color: "text-fuchsia-400" },
                    { icon: Target, text: "Quiz: 92% on neural networks", time: "18m", color: "text-emerald-400" },
                    { icon: LineChart, text: "Retention improved +4%", time: "1h", color: "text-cyan-400" },
                    { icon: Star, text: "Unlocked: Polymath", time: "3h", color: "text-amber-400" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        className="glass rounded-2xl p-3 flex items-center gap-3"
                      >
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs truncate">{item.text}</div>
                          <div className="text-[10px] text-ink-400">{item.time}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="relative z-10 px-6 md:px-12 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-ink-200 mb-6">
              Not a chatbot. A mind.
            </div>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
              Every feature is a{" "}
              <span className="text-gradient italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
                cognitive sense.
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Brain,
                title: "AI Cognitive Profile",
                desc: "A living twin of your mind. Learning speed, memory strength, curiosity, attention span — all measured, all evolving.",
                gradient: "from-violet-500/30 to-fuchsia-500/20",
              },
              {
                icon: Layers,
                title: "Knowledge Graph",
                desc: "Every concept you touch becomes a node. See the shape of your understanding, and where the gaps are.",
                gradient: "from-cyan-400/30 to-violet-500/20",
              },
              {
                icon: Quote,
                title: "Socratic Dialogue",
                desc: "We never give you the answer. We ask you the right questions, and reveal understanding when you're ready.",
                gradient: "from-fuchsia-500/30 to-amber-400/20",
              },
              {
                icon: Orbit,
                title: "Memory Prediction",
                desc: "We know what you'll forget tomorrow. Revision is scheduled before the forgetting, not after.",
                gradient: "from-emerald-400/30 to-cyan-400/20",
              },
              {
                icon: Target,
                title: "Teach-Back Mode",
                desc: "You teach the AI. It evaluates your clarity, accuracy, and where you're missing ideas.",
                gradient: "from-amber-400/30 to-rose-400/20",
              },
              {
                icon: Sparkles,
                title: "Curiosity Engine",
                desc: "Surprising connections. Topics you didn't know you'd love, surfaced from the edges of your graph.",
                gradient: "from-rose-400/30 to-violet-500/20",
              },
              {
                icon: BookOpen,
                title: "Learn Anything",
                desc: "Paste a PDF, YouTube URL, or article. We extract, summarize, and turn it into a lesson.",
                gradient: "from-violet-500/30 to-emerald-400/20",
              },
              {
                icon: Zap,
                title: "Adaptive Flashcards",
                desc: "Generated automatically. Reviewed at the exact moment you're about to forget.",
                gradient: "from-cyan-400/30 to-fuchsia-500/20",
              },
              {
                icon: LineChart,
                title: "Learning DNA",
                desc: "Visual learner? Reader? Listener? Hands-on? We detect your style, and teach accordingly.",
                gradient: "from-fuchsia-500/30 to-cyan-400/20",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="group relative glass lift rounded-3xl p-7"
                >
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-5 border border-white/10">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-ink-300 leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 px-6 md:px-12 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
              Four{" "}
              <span className="text-gradient italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
                dimensions
              </span>{" "}
              of learning.
            </h2>
            <p className="mt-6 text-ink-300 max-w-2xl mx-auto text-lg">
              Traditional AI tutors answer. SecondBrain observes, predicts, challenges, and evolves.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                n: "01",
                title: "Observes",
                desc: "Every interaction updates your cognitive profile. Not to grade you — to understand you.",
              },
              {
                n: "02",
                title: "Predicts",
                desc: "We know what you'll forget before you forget it. Revision is scheduled proactively.",
              },
              {
                n: "03",
                title: "Challenges",
                desc: "We never reveal the answer. We ask the question that unlocks the next insight.",
              },
              {
                n: "04",
                title: "Evolves",
                desc: "Your SecondBrain grows with you. What it knows of you today is the foundation for tomorrow.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass rounded-3xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-5xl font-bold text-white/5">
                  {step.n}
                </div>
                <div className="relative">
                  <div className="text-xs text-violet-300 font-mono mb-3">{step.n}</div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-ink-300 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Science section */}
      <section id="science" className="relative z-10 px-6 md:px-12 py-32">
        <div className="max-w-6xl mx-auto glass rounded-[2rem] p-8 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent pointer-events-none" />
          <div className="relative grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs uppercase tracking-wider text-violet-300 mb-4">
                Built on cognitive science
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
                Forgetting is a feature. We measure it.
              </h2>
              <p className="text-ink-300 leading-relaxed mb-6">
                SecondBrain implements the Ebbinghaus forgetting curve at the level of individual
                concepts. Every fact you learn has a stability score — a number predicting when
                you'll forget it. Revision happens exactly when it's needed, not a moment before.
              </p>
              <div className="space-y-3">
                {[
                  "Ebbinghaus forgetting curve — implemented per-concept",
                  "SuperMemo-style spaced repetition",
                  "Socratic scaffolding over direct answers",
                  "Cognitive load modeling",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-md bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-300" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-square">
              {/* Forgetting curve visualization */}
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <defs>
                  <linearGradient id="curveGrad" x1="0" x2="1">
                    <stop offset="0" stopColor="#a78bfa" />
                    <stop offset="1" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                {/* Grid */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={`h${i}`}
                    x1="40"
                    x2="380"
                    y1={80 + i * 70}
                    y2={80 + i * 70}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                  />
                ))}
                {/* Forgetting curve */}
                <path
                  d="M 40 80 Q 100 100 140 180 T 280 300 L 380 340"
                  fill="none"
                  stroke="url(#curveGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Review points */}
                {[
                  { x: 140, y: 180, label: "Review 1" },
                  { x: 240, y: 240, label: "Review 2" },
                  { x: 340, y: 280, label: "Review 3" },
                ].map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="8" fill="#8b5cf6" opacity="0.3" />
                    <circle cx={p.x} cy={p.y} r="4" fill="#a78bfa" />
                    <text
                      x={p.x + 12}
                      y={p.y - 8}
                      fill="rgba(255,255,255,0.6)"
                      fontSize="10"
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
                {/* Axes labels */}
                <text x="40" y="380" fill="rgba(255,255,255,0.4)" fontSize="11">
                  Time →
                </text>
                <text x="10" y="80" fill="rgba(255,255,255,0.4)" fontSize="11">
                  Retention
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 px-6 md:px-12 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
              Learners who{" "}
              <span className="text-gradient italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
                evolved.
              </span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                quote: "For the first time, I feel like someone is actually tracking how I learn — not just what I complete.",
                name: "Ayan",
                role: "CSE student, NITER",
                avatar: "🧑‍🎓",
              },
              {
                quote: "I used to re-watch the same lecture 4 times. Now SecondBrain schedules my revision before I even feel fuzzy.",
                name: "Marcus T.",
                role: "Medical resident",
                avatar: "🧑‍⚕️",
              },
              {
                quote: "The Socratic mode broke my dependency on answers. I actually think now. It's uncomfortable and wonderful.",
                name: "Lina K.",
                role: "Self-taught engineer",
                avatar: "👩‍💻",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass rounded-3xl p-7"
              >
                <Quote className="w-6 h-6 text-violet-300 mb-4" />
                <p className="text-ink-200 leading-relaxed mb-6">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center text-xl">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-ink-400">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 md:px-12 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8">
            Your mind,{" "}
            <span className="text-gradient italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
              mapped.
            </span>
          </h2>
          <p className="text-ink-300 text-lg max-w-2xl mx-auto mb-10">
            Start with one topic. In 90 days, you'll have a cognitive twin that knows how you think,
            what you forget, and what you'll learn next.
          </p>
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-8 py-4 font-medium hover:scale-105 transition-transform shadow-2xl shadow-violet-500/30"
          >
            <Rocket className="w-4 h-4" />
            Begin your SecondBrain
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 px-6 md:px-12 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-ink-400">
          <div>© SecondBrain · Knowledge that talks back</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Science</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
