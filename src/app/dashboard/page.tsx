"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Target,
  Repeat,
  BookOpen,
  Trophy,
  Flame,
  Sunrise,
  Rocket,
  ArrowRight,
  TrendingUp,
  Calendar,
  Star,
  Compass,
  Zap,
  LineChart,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useEcho, selectLevel } from "@/lib/store";
import { currentRetention, predictForgetting, xpForLevel } from "@/lib/cognitive";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, typeof Brain> = {
  sunrise: Sunrise,
  brain: Brain,
  repeat: Repeat,
  chalkboard: BookOpen,
  trophy: Trophy,
};

export default function DashboardPage() {
  const profile = useEcho((s) => s.profile);
  const concepts = useEcho((s) => s.concepts);
  const missions = useEcho((s) => s.missions);
  const achievements = useEcho((s) => s.achievements);
  const completeMission = useEcho((s) => s.completeMission);
  const bumpStreak = useEcho((s) => s.bumpStreak);
  const level = selectLevel();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const forgetting = useMemo(() => predictForgetting(concepts, 3), [concepts]);
  const avgRetention = useMemo(() => {
    const vals = concepts.map((c) => currentRetention(c));
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [concepts]);
  const masteredCount = concepts.filter((c) => c.strength > 0.8).length;

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-6 pb-24 lg:pb-10">
        {/* Greeting row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="text-xs text-ink-400 mb-2">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
              <span className="text-gradient italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
                {profile.displayName}.
              </span>
            </h1>
            <p className="text-ink-300 mt-3 max-w-2xl">
              You're on a {profile.streak}-day streak. Your cognitive twin is {(avgRetention * 100).toFixed(0)}% retained.
              Today, let's push your weak spots and celebrate what's locked in.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={bumpStreak}
              className="glass rounded-2xl px-4 py-3 flex items-center gap-3 hover:border-violet-500/40"
            >
              <Flame className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <div className="text-[11px] text-ink-400">Streak</div>
                <div className="font-semibold">{profile.streak} days</div>
              </div>
            </button>
            <Link
              href="/mentor"
              className="group rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-5 py-3 flex items-center gap-2 font-medium text-sm hover:scale-105 transition-transform shadow-lg shadow-violet-500/30"
            >
              <Rocket className="w-4 h-4" />
              Start session
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Top stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Level",
              value: level.level,
              sub: `${profile.xp.toLocaleString()} XP total`,
              icon: Star,
              gradient: "from-violet-500/20 to-fuchsia-500/20",
              accent: "text-violet-300",
            },
            {
              label: "Retention",
              value: `${(avgRetention * 100).toFixed(0)}%`,
              sub: "Ebbinghaus estimate",
              icon: Brain,
              gradient: "from-cyan-400/20 to-violet-500/20",
              accent: "text-cyan-300",
            },
            {
              label: "Concepts mastered",
              value: masteredCount,
              sub: `of ${concepts.length} tracked`,
              icon: Trophy,
              gradient: "from-emerald-400/20 to-cyan-400/20",
              accent: "text-emerald-300",
            },
            {
              label: "Focus today",
              value: `${Math.round(profile.attentionSpan)}m`,
              sub: "Optimal session length",
              icon: Zap,
              gradient: "from-amber-400/20 to-rose-400/20",
              accent: "text-amber-300",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-3xl p-5 relative overflow-hidden lift"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} pointer-events-none`} />
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-ink-400">{stat.label}</div>
                    <div className="text-3xl font-semibold mt-1">{stat.value}</div>
                    <div className="text-xs text-ink-400 mt-2">{stat.sub}</div>
                  </div>
                  <Icon className={cn("w-5 h-5", stat.accent)} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Missions */}
          <div className="lg:col-span-2 glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-lg">Daily Missions</h2>
                <p className="text-xs text-ink-400">Small quests to grow your cognitive twin.</p>
              </div>
              <div className="text-xs text-ink-400">
                {missions.filter((m) => m.done).length}/{missions.length} complete
              </div>
            </div>
            <div className="space-y-2">
              {missions.map((m, i) => {
                const Icon = ICON_MAP[m.icon] ?? Sparkles;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl p-4 border transition-all",
                      m.done
                        ? "bg-white/[0.02] border-white/5 opacity-60"
                        : "bg-white/[0.03] border-white/5 hover:border-violet-500/40",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        m.done
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-violet-500/20 text-violet-300",
                      )}
                    >
                      {m.done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{m.title}</div>
                        <div className="text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          +{m.xp} XP
                        </div>
                      </div>
                      <div className="text-xs text-ink-400 mt-0.5 truncate">{m.description}</div>
                      <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all"
                          style={{ width: `${m.progress * 100}%` }}
                        />
                      </div>
                    </div>
                    {!m.done && (
                      <button
                        onClick={() => completeMission(m.id)}
                        className="text-xs rounded-xl bg-white/5 hover:bg-white/10 px-3 py-1.5 shrink-0"
                      >
                        Complete
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* XP / Level card */}
          <div className="glass rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[11px] uppercase tracking-wider text-ink-400">Cognitive Level</div>
                <Star className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-6xl font-semibold">{level.level}</div>
                <div className="text-xs text-ink-400">/ ∞</div>
              </div>
              <div className="mt-4">
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  {mounted ? (
                    <div
                      className="h-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 transition-all"
                      style={{ width: `${level.progress * 100}%` }}
                    />
                  ) : (
                    <div
                      className="h-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 transition-all"
                      style={{ width: "0%" }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-xs text-ink-400 mt-2">
                  <span>{profile.xp.toLocaleString()} XP</span>
                  <span>{level.nextAt - (profile.xp % level.nextAt)} to next</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-ink-400">Mind health</div>
                {[
                  { label: "Focus", value: profile.attentionSpan, max: 90, color: "from-violet-400 to-fuchsia-400" },
                  { label: "Confidence", value: Math.round(profile.confidence * 100), max: 100, color: "from-cyan-400 to-violet-400" },
                  { label: "Curiosity", value: Math.round(profile.curiosityIndex * 100), max: 100, color: "from-emerald-400 to-cyan-400" },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{bar.label}</span>
                      <span className="text-ink-400">{bar.value}{bar.max === 90 ? "m" : "%"}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      {mounted ? (
                        <div
                          className={`h-full bg-gradient-to-r ${bar.color}`}
                          style={{ width: `${(bar.value / bar.max) * 100}%` }}
                        />
                      ) : (
                        <div
                          className={`h-full bg-gradient-to-r ${bar.color}`}
                          style={{ width: "0%" }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Forgetting predictions + quick actions */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-lg">Predicted to fade</h2>
                <p className="text-xs text-ink-400">Concepts you'll forget soon — revision scheduled.</p>
              </div>
              <Link href="/flashcards" className="text-xs text-violet-300 hover:text-violet-200">
                Review all →
              </Link>
            </div>
            <div className="space-y-2">
              {forgetting.slice(0, 5).map((c, i) => {
                const r = currentRetention(c);
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 rounded-2xl p-3 bg-white/[0.02] border border-white/5"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold"
                      style={{ background: `${c.color}30`, color: c.color }}
                    >
                      {c.name.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-ink-400">{c.category} · {c.reviews} reviews</div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-lg font-semibold tabular-nums",
                        r < 0.4 ? "text-rose-400" : r < 0.7 ? "text-amber-300" : "text-emerald-300",
                      )}>
                        {(r * 100).toFixed(0)}%
                      </div>
                      <div className="text-[10px] text-ink-400">
                        {r < 0.4 ? "review now" : r < 0.7 ? "review soon" : "stable"}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <h2 className="font-semibold text-lg mb-1">Jump back in</h2>
            <p className="text-xs text-ink-400 mb-5">Pick where your mind wants to go.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/mentor", label: "AI Mentor", icon: Brain, color: "from-violet-500 to-fuchsia-500" },
                { href: "/graph", label: "Knowledge", icon: Compass, color: "from-cyan-400 to-violet-500" },
                { href: "/quiz", label: "Quiz", icon: Target, color: "from-emerald-400 to-cyan-400" },
                { href: "/learn", label: "Learn new", icon: BookOpen, color: "from-amber-400 to-rose-400" },
                { href: "/planner", label: "Planner", icon: Calendar, color: "from-fuchsia-500 to-violet-500" },
                { href: "/analytics", label: "Analytics", icon: LineChart, color: "from-violet-500 to-cyan-400" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group glass lift rounded-2xl p-3 flex flex-col items-start gap-2"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-sm font-medium">{item.label}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Future self */}
        <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-transparent blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center animate-glow">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-wider text-violet-300 mb-1">Future Self</div>
              <h3 className="text-xl font-semibold">
                If you keep this pace, in 90 days you'll be level{" "}
                {level.level + Math.floor(profile.xp / 2500)}.
              </h3>
              <p className="text-sm text-ink-300 mt-1 max-w-2xl">
                Your {concepts.length} concept graph will grow to ~{concepts.length + 42}. Retention will stabilize
                around {(Math.min(1, avgRetention + 0.12) * 100).toFixed(0)}%. Your weak spot, "Dynamic Programming",
                will move from fragile to strong.
              </p>
            </div>
            <Link href="/analytics" className="rounded-2xl glass px-4 py-3 text-sm hover:border-violet-500/40 shrink-0">
              View projection →
            </Link>
          </div>
        </div>

        {/* Achievements peek */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Recent achievements</h2>
            <Link href="/achievements" className="text-xs text-violet-300">See all →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {achievements.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "glass rounded-2xl p-4 text-center lift",
                  !a.unlockedAt && "opacity-40 grayscale",
                )}
              >
                <div className="text-3xl mb-2">{a.icon}</div>
                <div className="text-xs font-medium">{a.title}</div>
                <div className="text-[10px] text-ink-400 mt-0.5 line-clamp-1">{a.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
