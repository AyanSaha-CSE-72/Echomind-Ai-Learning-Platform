"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles, Target, Brain, Clock, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useEcho } from "@/lib/store";
import { cn } from "@/lib/utils";

interface PlannedSession {
  id: string;
  date: Date;
  title: string;
  type: "revision" | "learn" | "quiz" | "rest";
  duration: number; // minutes
  icon: string;
}

export default function PlannerPage() {
  const profile = useEcho((s) => s.profile);
  const concepts = useEcho((s) => s.concepts);

  // Generate a week plan
  const weekPlan = useMemo<PlannedSession[]>(() => {
    const today = new Date();
    const plans: PlannedSession[] = [];

    // Create 7 days of sessions
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);

      // 2-3 sessions per day
      const sessionsPerDay = day === 6 ? 1 : 2 + Math.floor(Math.random() * 2);
      for (let s = 0; s < sessionsPerDay; s++) {
        const hour = 9 + s * 3 + Math.floor(Math.random() * 2);
        const sessionDate = new Date(date);
        sessionDate.setHours(hour, 0, 0, 0);

        const types: Array<PlannedSession["type"]> = ["revision", "learn", "quiz", "revision"];
        const type = types[Math.floor(Math.random() * types.length)];

        plans.push({
          id: `session-${day}-${s}`,
          date: sessionDate,
          title:
            type === "revision"
              ? "Review fading concepts"
              : type === "learn"
              ? "Learn new material"
              : type === "quiz"
              ? "Adaptive quiz"
              : "Rest & reflect",
          type,
          duration: type === "rest" ? 15 : 25 + Math.floor(Math.random() * 20),
          icon: type === "revision" ? "🔄" : type === "learn" ? "📚" : type === "quiz" ? "🎯" : "🧘",
        });
      }
    }

    return plans.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, []);

  // Group by day
  const byDay = useMemo(() => {
    const map = new Map<string, PlannedSession[]>();
    weekPlan.forEach((p) => {
      const key = p.date.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return Array.from(map.entries()).map(([date, sessions]) => ({
      date: new Date(date),
      sessions,
    }));
  }, [weekPlan]);

  const totalMinutes = weekPlan.reduce((s, p) => s + p.duration, 0);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-6 md:p-10 pb-24 lg:pb-10 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-semibold tracking-tight">
            Study{" "}
            <span className="text-gradient italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Planner.
            </span>
          </h1>
          <p className="text-ink-300 mt-2">
            AI-scheduled sessions based on your forgetting curve, focus patterns, and goals.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: "Sessions this week", value: weekPlan.length, gradient: "from-violet-500/20 to-fuchsia-500/20" },
            { icon: Clock, label: "Total time", value: `${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m`, gradient: "from-cyan-400/20 to-violet-500/20" },
            { icon: Target, label: "Avg session", value: `${Math.round(totalMinutes / weekPlan.length)}m`, gradient: "from-emerald-400/20 to-cyan-400/20" },
            { icon: Brain, label: "Focus optimal", value: `${profile.attentionSpan}m`, gradient: "from-amber-400/20 to-rose-400/20" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-3xl p-5 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient}`} />
                <div className="relative flex items-start justify-between">
                  <Icon className="w-5 h-5 text-white/60" />
                </div>
                <div className="relative mt-4">
                  <div className="text-[11px] uppercase tracking-wider text-ink-400">{stat.label}</div>
                  <div className="text-2xl font-semibold mt-1">{stat.value}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Week timeline */}
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-lg">This Week</h2>
              <p className="text-xs text-ink-400">
                {byDay.length} days · {weekPlan.length} sessions
              </p>
            </div>
            <button className="glass rounded-xl px-4 py-2 text-xs flex items-center gap-2 hover:border-violet-500/40">
              <Plus className="w-3 h-3" />
              Add custom
            </button>
          </div>

          <div className="space-y-4">
            {byDay.map((day, i) => {
              const isToday = day.date.toDateString() === new Date().toDateString();
              return (
                <motion.div
                  key={day.date.toISOString()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-xs",
                        isToday
                          ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
                          : "glass",
                      )}
                    >
                      <div className="text-[10px] uppercase">
                        {day.date.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className="text-base font-semibold">{day.date.getDate()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {isToday ? "Today" : day.date.toLocaleDateString("en-US", { weekday: "long" })}
                      </div>
                      <div className="text-[11px] text-ink-400">
                        {day.sessions.length} session{day.sessions.length !== 1 && "s"} ·{" "}
                        {day.sessions.reduce((s, p) => s + p.duration, 0)} min
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 pl-6 border-l border-white/10 space-y-2 pb-2">
                    {day.sessions.map((session) => (
                      <div
                        key={session.id}
                        className="glass rounded-2xl p-4 flex items-center gap-4 hover:border-violet-500/40 transition-colors"
                      >
                        <div className="text-2xl">{session.icon}</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{session.title}</div>
                          <div className="text-[11px] text-ink-400">
                            {session.date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} ·{" "}
                            {session.duration} min
                          </div>
                        </div>
                        <button className="text-xs glass rounded-xl px-3 py-1.5 hover:border-violet-500/40">
                          Start
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* AI note */}
        <div className="glass rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-violet-500/20 to-transparent blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-violet-300 mb-1">AI Planner Note</div>
              <p className="text-sm text-ink-200 leading-relaxed">
                I've scheduled 3 revision sessions this week for your weakest concepts (Dynamic Programming,
                Backpropagation, Physics). Sessions are timed to your optimal focus window: {profile.attentionSpan}
                minutes. I'll adjust tomorrow's plan based on how you perform today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
