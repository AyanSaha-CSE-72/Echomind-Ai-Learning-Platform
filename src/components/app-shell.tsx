"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain,
  LayoutDashboard,
  BookOpen,
  BookMarked,
  Sparkles,
  LineChart,
  Layers,
  Zap,
  Trophy,
  Target,
  Calendar,
  User,
  Moon,
  Sun,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEcho, selectLevel } from "@/lib/store";
import { EchoMindIcon } from "@/components/echomind-icon";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subjects", label: "My Subjects", icon: BookMarked },
  { href: "/mentor", label: "AI Mentor", icon: Brain },
  { href: "/graph", label: "Knowledge Graph", icon: Layers },
  { href: "/galaxy", label: "Knowledge Galaxy", icon: Sparkles },
  { href: "/learn", label: "Learn Anything", icon: BookOpen },
  { href: "/flashcards", label: "Flashcards", icon: Zap },
  { href: "/quiz", label: "Quiz", icon: Target },
  { href: "/planner", label: "Study Planner", icon: Calendar },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const theme = useEcho((s) => s.theme);
  const setTheme = useEcho((s) => s.setTheme);
  const profile = useEcho((s) => s.profile);
  const level = selectLevel();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering dynamic content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Ambient aurora background */}
      <div className="fixed inset-0 -z-10">
        <div className="aurora" />
        <div className="grid-bg absolute inset-0" />
        <div className="noise" />
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 p-4 z-30 hidden lg:block">
        <div className="glass rounded-3xl h-full p-5 flex flex-col">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 mb-8">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center animate-glow">
                <EchoMindIcon size={22} />
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-400/30 blur-md -z-10" />
            </div>
            <div>
              <div className="font-semibold text-[15px] leading-none">EchoMind</div>
              <div className="text-[11px] text-ink-400 mt-1">Knowledge that talks back</div>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar pr-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                    active
                      ? "text-white"
                      : "text-ink-400 hover:text-ink-100",
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/20 via-fuchsia-500/15 to-cyan-400/20 border border-white/10"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "w-4 h-4 relative z-10 transition-transform group-hover:scale-110",
                      active && "text-violet-300",
                    )}
                  />
                  <span className="relative z-10">{item.label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-300 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Theme + Level */}
          <div className="mt-4 space-y-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-full glass rounded-2xl p-3 flex items-center gap-3 hover:border-violet-500/40 transition-colors"
            >
              {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span className="text-xs">
                {theme === "dark" ? "Dark mode" : "Light mode"}
              </span>
              <span className="ml-auto text-[10px] text-ink-400">toggle</span>
            </button>

            <div className="glass rounded-2xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm">
                  {profile.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-ink-400">
                    Level {level.level} · {profile.displayName}
                  </div>
                  {mounted && (
                    <div className="h-1.5 rounded-full bg-white/5 mt-1 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                        style={{ width: `${level.progress * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:pl-64 min-h-screen">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3">
        <div className="glass-strong rounded-2xl p-2 flex items-center justify-between">
          <Link href="/dashboard" className="p-2">
            <LayoutDashboard className="w-5 h-5" />
          </Link>
          <Link href="/subjects" className="p-2">
            <BookMarked className="w-5 h-5" />
          </Link>
          <Link href="/mentor" className="p-2 text-violet-400">
            <Brain className="w-5 h-5" />
          </Link>
          <Link href="/graph" className="p-2">
            <Layers className="w-5 h-5" />
          </Link>
          <Link href="/learn" className="p-2">
            <BookOpen className="w-5 h-5" />
          </Link>
          <Link href="/settings" className="p-2">
            <SettingsIcon className="w-5 h-5" />
          </Link>
        </div>
      </nav>
    </div>
  );
}
