"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Lock, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useEcho } from "@/lib/store";
import { cn, timeAgo } from "@/lib/utils";

export default function AchievementsPage() {
  const achievements = useEcho((s) => s.achievements);
  const unlocked = achievements.filter((a) => a.unlockedAt);
  const locked = achievements.filter((a) => !a.unlockedAt);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-6 md:p-10 pb-24 lg:pb-10 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-semibold tracking-tight">
            Achievements
            <span className="text-gradient italic ml-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
              earned.
            </span>
          </h1>
          <p className="text-ink-300 mt-2">
            {unlocked.length} of {achievements.length} unlocked · keep learning to earn more.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-3xl p-6 text-center">
            <Trophy className="w-8 h-8 text-amber-300 mx-auto mb-2" />
            <div className="text-3xl font-semibold">{unlocked.length}</div>
            <div className="text-xs text-ink-400 mt-1">Unlocked</div>
          </div>
          <div className="glass rounded-3xl p-6 text-center">
            <Star className="w-8 h-8 text-violet-300 mx-auto mb-2" />
            <div className="text-3xl font-semibold">{locked.length}</div>
            <div className="text-xs text-ink-400 mt-1">In Progress</div>
          </div>
          <div className="glass rounded-3xl p-6 text-center">
            <Sparkles className="w-8 h-8 text-cyan-300 mx-auto mb-2" />
            <div className="text-3xl font-semibold">{achievements.length}</div>
            <div className="text-xs text-ink-400 mt-1">Total</div>
          </div>
        </div>

        {/* Unlocked */}
        {unlocked.length > 0 && (
          <div>
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-300" />
              Unlocked
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {unlocked.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-3xl p-6 text-center lift relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="text-5xl mb-3">{a.icon}</div>
                    <div className="font-semibold text-sm">{a.title}</div>
                    <div className="text-[11px] text-ink-400 mt-1 line-clamp-2">
                      {a.description}
                    </div>
                    {a.unlockedAt && (
                      <div className="text-[10px] text-violet-300 mt-2">
                        {timeAgo(a.unlockedAt)}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-ink-400" />
              In Progress
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {locked.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-3xl p-6 text-center opacity-50 grayscale"
                >
                  <div className="text-5xl mb-3">{a.icon}</div>
                  <div className="font-semibold text-sm">{a.title}</div>
                  <div className="text-[11px] text-ink-400 mt-1 line-clamp-2">
                    {a.description}
                  </div>
                  <div className="mt-3 glass rounded-lg px-2 py-1 text-[10px] inline-block">
                    🔒 Locked
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
