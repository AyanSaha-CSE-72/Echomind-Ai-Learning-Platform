"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Brain, Clock, Target, Trophy, Flame } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useEcho } from "@/lib/store";
import { currentRetention } from "@/lib/cognitive";

export default function AnalyticsPage() {
  const profile = useEcho((s) => s.profile);
  const concepts = useEcho((s) => s.concepts);
  const missions = useEcho((s) => s.missions);

  // Mock 30-day activity data
  const activityData = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(Date.now() - (29 - i) * 86400000);
      return {
        day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        minutes: Math.round(30 + Math.sin(i * 0.3) * 15 + Math.random() * 20),
        xp: Math.round(80 + Math.sin(i * 0.3) * 40 + Math.random() * 50),
        concepts: Math.round(2 + Math.random() * 4),
      };
    });
  }, []);

  // Category mastery
  const categoryData = useMemo(() => {
    const byCategory: Record<string, { total: number; mastered: number }> = {};
    concepts.forEach((c) => {
      byCategory[c.category] = byCategory[c.category] ?? { total: 0, mastered: 0 };
      byCategory[c.category].total += 1;
      if (c.strength > 0.8) byCategory[c.category].mastered += 1;
    });
    return Object.entries(byCategory).map(([name, v]) => ({
      name,
      mastery: Math.round((v.mastered / v.total) * 100),
      concepts: v.total,
    }));
  }, [concepts]);

  // Retention distribution
  const retentionBuckets = useMemo(() => {
    const buckets = [
      { range: "0-20%", min: 0, max: 0.2, count: 0 },
      { range: "20-40%", min: 0.2, max: 0.4, count: 0 },
      { range: "40-60%", min: 0.4, max: 0.6, count: 0 },
      { range: "60-80%", min: 0.6, max: 0.8, count: 0 },
      { range: "80-100%", min: 0.8, max: 1.01, count: 0 },
    ];
    concepts.forEach((c) => {
      const r = currentRetention(c);
      const b = buckets.find((b) => r >= b.min && r < b.max);
      if (b) b.count += 1;
    });
    return buckets;
  }, [concepts]);

  // Radar chart data for cognitive profile
  const radarData = [
    { metric: "Speed", value: profile.learningSpeed * 100 },
    { metric: "Memory", value: profile.memoryStrength * 100 },
    { metric: "Focus", value: (profile.attentionSpan / 90) * 100 },
    { metric: "Confidence", value: profile.confidence * 100 },
    { metric: "Curiosity", value: profile.curiosityIndex * 100 },
    { metric: "Critical", value: profile.criticalThinking * 100 },
  ];

  const totalMinutes = activityData.reduce((s, d) => s + d.minutes, 0);
  const totalXp = activityData.reduce((s, d) => s + d.xp, 0);

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-6 pb-24 lg:pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-semibold tracking-tight">
            Learning{" "}
            <span className="text-gradient italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Analytics.
            </span>
          </h1>
          <p className="text-ink-300 mt-2">A deep view of how your mind is evolving.</p>
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Clock, label: "Total time", value: `${Math.round(totalMinutes / 60)}h`, sub: "last 30 days", gradient: "from-violet-500/20 to-fuchsia-500/20" },
            { icon: Target, label: "Avg retention", value: `${(concepts.reduce((s, c) => s + currentRetention(c), 0) / concepts.length * 100).toFixed(0)}%`, sub: "across all concepts", gradient: "from-cyan-400/20 to-violet-500/20" },
            { icon: Trophy, label: "XP earned", value: totalXp.toLocaleString(), sub: "this month", gradient: "from-amber-400/20 to-rose-400/20" },
            { icon: Flame, label: "Streak", value: `${profile.streak}d`, sub: "consecutive days", gradient: "from-rose-400/20 to-violet-500/20" },
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
                  <div className="text-3xl font-semibold mt-1">{stat.value}</div>
                  <div className="text-xs text-ink-400 mt-1">{stat.sub}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Activity over time */}
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-lg">Activity · Last 30 days</h2>
                <p className="text-xs text-ink-400">Minutes spent learning per day</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="minutesGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#a78bfa" stopOpacity={0.6} />
                      <stop offset="1" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={10} interval={5} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10, 10, 30, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke="#a78bfa"
                    strokeWidth={2}
                    fill="url(#minutesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* XP over time */}
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-lg">XP over time</h2>
                <p className="text-xs text-ink-400">Cumulative cognitive progress</p>
              </div>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={10} interval={5} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10, 10, 30, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="xp"
                    stroke="#f0abfc"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category mastery */}
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-lg">Mastery by category</h2>
                <p className="text-xs text-ink-400">How strong you are in each field</p>
              </div>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10, 10, 30, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="mastery" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cognitive profile radar */}
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-lg">Cognitive Profile</h2>
                <p className="text-xs text-ink-400">Six dimensions of how you learn</p>
              </div>
              <Brain className="w-5 h-5 text-violet-300" />
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="20%"
                  outerRadius="100%"
                  data={radarData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    background={{ fill: "rgba(255,255,255,0.05)" }}
                    dataKey="value"
                    fill="#a78bfa"
                    cornerRadius={6}
                  />
                  <Legend
                    iconSize={8}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10, 10, 30, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Retention distribution */}
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-lg">Retention distribution</h2>
              <p className="text-xs text-ink-400">How your concepts are spread across retention buckets</p>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retentionBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="range" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10, 10, 30, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {retentionBuckets.map((_, i) => (
                    <rect key={i} fill={`hsl(${250 + i * 20}, 70%, 65%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
