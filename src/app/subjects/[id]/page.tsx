"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit3,
  Brain,
  Zap,
  Target,
  BookOpen,
  TrendingUp,
  Flame,
  Pin,
  PinOff,
  MoreVertical,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useEcho } from "@/lib/store";
import { currentRetention } from "@/lib/cognitive";
import { IconRenderer } from "@/components/icon-renderer";
import { cn } from "@/lib/utils";

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;

  const subject = useEcho((s) => s.subjects.find((sub) => sub.id === subjectId));
  const concepts = useEcho((s) => s.concepts);
  const pinSubject = useEcho((s) => s.pinSubject);
  const unpinSubject = useEcho((s) => s.unpinSubject);
  const updateSubject = useEcho((s) => s.updateSubject);

  const subjectConcepts = useMemo(
    () => concepts.filter((c) => c.subjectId === subjectId),
    [concepts, subjectId],
  );

  if (!subject) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto p-10 text-center">
          <h1 className="text-2xl font-semibold mb-4">Subject not found</h1>
          <Link href="/subjects" className="text-violet-300 hover:text-violet-200">
            ← Back to subjects
          </Link>
        </div>
      </AppShell>
    );
  }

  // Stats
  const masteryPercent =
    subjectConcepts.length === 0
      ? 0
      : Math.round(
          (subjectConcepts.filter((c) => c.strength > 0.8).length / subjectConcepts.length) * 100,
        );
  const avgRetention =
    subjectConcepts.length === 0
      ? 0
      : subjectConcepts.reduce((s, c) => s + currentRetention(c), 0) / subjectConcepts.length;
  const fadingCount = subjectConcepts.filter((c) => currentRetention(c) < 0.4).length;
  const strongCount = subjectConcepts.filter((c) => c.strength > 0.8).length;

  // Sort concepts: weakest first
  const sortedConcepts = [...subjectConcepts].sort(
    (a, b) => currentRetention(a) - currentRetention(b),
  );

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-6 md:p-10 pb-24 lg:pb-10">
        {/* Back */}
        <Link
          href="/subjects"
          className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to subjects
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl overflow-hidden relative mb-6"
        >
          <div
            className={cn(
              "h-48 relative",
              subject.cover?.startsWith("http") ? "" : `bg-gradient-to-br ${getGradient(subject.cover, subject.color)}`,
            )}
          >
            {subject.cover?.startsWith("http") && (
              <img src={subject.cover} alt="" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="p-6 md:p-8 -mt-20 relative">
            <div className="flex items-start gap-5">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-ink-900"
                style={{ background: subject.color }}
              >
                <IconRenderer name={subject.icon} className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1 pt-12">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                    {subject.name}
                  </h1>
                  {subject.pinned && <Pin className="w-5 h-5 text-violet-300" />}
                </div>
                {subject.description && (
                  <p className="text-ink-300 text-sm mt-1">{subject.description}</p>
                )}
                <div className="flex items-center gap-3 mt-4 text-xs text-ink-400">
                  <span>{subjectConcepts.length} concepts</span>
                  <span>·</span>
                  <span>{masteryPercent}% mastered</span>
                  <span>·</span>
                  <span>{fadingCount} fading</span>
                </div>
              </div>
              <div className="flex gap-2 pt-12">
                <button
                  onClick={() => (subject.pinned ? unpinSubject(subject.id) : pinSubject(subject.id))}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:border-violet-500/40"
                  title={subject.pinned ? "Unpin" : "Pin"}
                >
                  {subject.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    const newName = prompt("Rename subject:", subject.name);
                    if (newName && newName.trim()) {
                      updateSubject(subject.id, { name: newName.trim() });
                    }
                  }}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:border-violet-500/40"
                  title="Rename"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <ActionCard
            icon={Brain}
            label="AI Mentor"
            desc={`Ask about ${subject.name}`}
            href={`/mentor?subject=${subject.id}`}
            color={subject.color}
          />
          <ActionCard
            icon={Zap}
            label="Flashcards"
            desc={`${subjectConcepts.length} cards`}
            href={`/flashcards?subject=${subject.id}`}
            color={subject.color}
          />
          <ActionCard
            icon={Target}
            label="Quiz"
            desc="Test yourself"
            href={`/quiz?subject=${subject.id}`}
            color={subject.color}
          />
          <ActionCard
            icon={BookOpen}
            label="Learn"
            desc="Add new material"
            href={`/learn?subject=${subject.id}`}
            color={subject.color}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={TrendingUp}
            label="Mastery"
            value={`${masteryPercent}%`}
            sub={`${strongCount}/${subjectConcepts.length} strong`}
            color={subject.color}
          />
          <StatCard
            icon={Brain}
            label="Retention"
            value={`${(avgRetention * 100).toFixed(0)}%`}
            sub="Current average"
            color={subject.color}
          />
          <StatCard
            icon={Flame}
            label="Needs review"
            value={fadingCount.toString()}
            sub="Retention <40%"
            color={subject.color}
          />
          <StatCard
            icon={Zap}
            label="Total reviews"
            value={subjectConcepts.reduce((s, c) => s + c.reviews, 0).toString()}
            sub="Across all concepts"
            color={subject.color}
          />
        </div>

        {/* Concepts list */}
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-lg">Concepts</h2>
              <p className="text-xs text-ink-400">Sorted by what you'll forget soonest.</p>
            </div>
          </div>
          {subjectConcepts.length === 0 ? (
            <div className="text-center py-12 text-ink-400 text-sm">
              No concepts yet. Start by learning from PDFs, videos, or chatting with Echo.
            </div>
          ) : (
            <div className="space-y-2">
              {sortedConcepts.map((c, i) => {
                const r = currentRetention(c);
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-4 rounded-2xl p-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold shrink-0"
                      style={{ background: `${c.color}30`, color: c.color }}
                    >
                      {c.name.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-ink-400">
                        {c.category} · {c.reviews} reviews
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end">
                      <div className="text-[10px] text-ink-400 mb-1">Retention</div>
                      <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${r * 100}%`,
                            background:
                              r < 0.4 ? "#fb7185" : r < 0.7 ? "#fbbf24" : "#34d399",
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className={cn(
                        "text-sm font-semibold tabular-nums w-12 text-right",
                        r < 0.4
                          ? "text-rose-400"
                          : r < 0.7
                          ? "text-amber-300"
                          : "text-emerald-300",
                      )}
                    >
                      {(r * 100).toFixed(0)}%
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function ActionCard({
  icon: Icon,
  label,
  desc,
  href,
  color,
}: {
  icon: typeof Brain;
  label: string;
  desc: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="glass rounded-2xl p-4 flex items-start gap-3 hover:border-violet-500/40 transition-colors lift"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}30` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-ink-400">{desc}</div>
      </div>
    </Link>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof Brain;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <div className="text-[11px] uppercase tracking-wider text-ink-400">{label}</div>
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-ink-400 mt-0.5">{sub}</div>
    </div>
  );
}

function getGradient(cover: string | undefined, fallbackColor: string): string {
  if (!cover) return `from-[${fallbackColor}] to-[${fallbackColor}]/50`;
  const map: Record<string, string> = {
    "gradient-violet-fuchsia": "from-violet-500 to-fuchsia-500",
    "gradient-fuchsia-pink": "from-fuchsia-500 to-pink-500",
    "gradient-cyan-blue": "from-cyan-400 to-blue-500",
    "gradient-amber-rose": "from-amber-400 to-rose-400",
    "gradient-emerald-cyan": "from-emerald-400 to-cyan-400",
  };
  return map[cover] ?? "from-violet-500 to-fuchsia-500";
}
