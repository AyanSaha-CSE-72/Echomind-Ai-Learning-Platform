"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { User as UserIcon, Sparkles, Brain, TrendingUp, Award, Edit3 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useEcho, selectLevel } from "@/lib/store";
import { useState } from "react";

export default function ProfilePage() {
  const profile = useEcho((s) => s.profile);
  const achievements = useEcho((s) => s.achievements);
  const updateProfile = useEcho((s) => s.updateProfile);
  const level = selectLevel();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.displayName);

  const styleData = [
    { axis: "Visual", value: profile.style.visual * 100 },
    { axis: "Reading", value: profile.style.reading * 100 },
    { axis: "Listening", value: profile.style.listening * 100 },
    { axis: "Hands-on", value: profile.style.handsOn * 100 },
  ];

  const dominant = Object.entries(profile.style).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  const dominantLabel = dominant.charAt(0).toUpperCase() + dominant.slice(1);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-6 md:p-10 pb-24 lg:pb-10 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-semibold tracking-tight">
            Your{" "}
            <span className="text-gradient italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Learning DNA.
            </span>
          </h1>
          <p className="text-ink-300 mt-2">
            A cognitive fingerprint — how you think, learn, and forget.
          </p>
        </motion.div>

        {/* Profile card */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass rounded-3xl p-6 relative overflow-hidden md:col-span-1">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center text-3xl">
                  {profile.avatar}
                </div>
                <div>
                  {editing ? (
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-transparent border-b border-white/20 outline-none text-xl font-semibold w-full"
                    />
                  ) : (
                    <div className="text-xl font-semibold">{profile.displayName}</div>
                  )}
                  <div className="text-xs text-ink-400">Level {level.level} Learner</div>
                  <button
                    onClick={() => {
                      if (editing) {
                        updateProfile({ displayName: name });
                      }
                      setEditing(!editing);
                    }}
                    className="mt-1 text-[11px] text-violet-300 hover:text-violet-200 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    {editing ? "Save" : "Edit"}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <InfoRow label="Streak" value={`${profile.streak}d`} />
                <InfoRow label="XP" value={profile.xp.toLocaleString()} />
                <InfoRow label="Focus" value={`${profile.attentionSpan}m`} />
                <InfoRow label="Style" value={dominantLabel} />
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-lg">Cognitive Profile</h2>
                <p className="text-xs text-ink-400">Six dimensions of how you learn.</p>
              </div>
              <Brain className="w-5 h-5 text-violet-300" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Learning Speed", value: profile.learningSpeed, icon: "🚀" },
                { label: "Memory Strength", value: profile.memoryStrength, icon: "🧠" },
                { label: "Confidence", value: profile.confidence, icon: "💪" },
                { label: "Curiosity Index", value: profile.curiosityIndex, icon: "✨" },
                { label: "Critical Thinking", value: profile.criticalThinking, icon: "🎯" },
                { label: "Focus Span", value: profile.attentionSpan / 90, icon: "⏱️" },
              ].map((m) => (
                <div key={m.label} className="glass rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{m.icon}</span>
                    <div className="text-[11px] text-ink-400">{m.label}</div>
                  </div>
                  <div className="text-xl font-semibold tabular-nums">
                    {(m.value * 100).toFixed(0)}%
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                      style={{ width: `${m.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Learning DNA */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-lg">Learning DNA</h2>
                <p className="text-xs text-ink-400">
                  Your dominant mode: <span className="text-violet-300">{dominantLabel}</span>
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={styleData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="axis" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                  <PolarRadiusAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                  <Radar
                    dataKey="value"
                    stroke="#a78bfa"
                    fill="#a78bfa"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Future Self */}
          <div className="glass rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-gradient-to-br from-cyan-400/20 to-violet-500/10 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-lg">Future Self</h2>
                <TrendingUp className="w-5 h-5 text-emerald-300" />
              </div>
              <p className="text-sm text-ink-300 leading-relaxed mb-5">
                If you maintain your current pace:
              </p>
              <div className="space-y-3">
                {[
                  { time: "30 days", level: level.level + 2, mastery: "+8 concepts" },
                  { time: "90 days", level: level.level + 7, mastery: "+24 concepts" },
                  { time: "1 year", level: level.level + 28, mastery: "Polymath status" },
                ].map((p, i) => (
                  <motion.div
                    key={p.time}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between glass rounded-2xl p-4"
                  >
                    <div>
                      <div className="text-xs text-ink-400">{p.time}</div>
                      <div className="text-sm font-semibold">Level {p.level}</div>
                    </div>
                    <div className="text-xs text-violet-300">{p.mastery}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent achievements */}
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-lg">Your Achievements</h2>
              <p className="text-xs text-ink-400">
                {achievements.filter((a) => a.unlockedAt).length} of {achievements.length} unlocked
              </p>
            </div>
            <Award className="w-5 h-5 text-amber-300" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`glass rounded-2xl p-4 text-center ${
                  !a.unlockedAt ? "opacity-40 grayscale" : ""
                }`}
              >
                <div className="text-3xl mb-2">{a.icon}</div>
                <div className="text-xs font-medium">{a.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-400">{label}</div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}
