"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { useEcho } from "@/lib/store";
import { currentRetention } from "@/lib/cognitive";

export default function GalaxyPage() {
  const concepts = useEcho((s) => s.concepts);

  // Create a starry galaxy of concepts
  const stars = useMemo(() => {
    const cx = 50;
    const cy = 50;
    return concepts.map((c, i) => {
      // Distribute in a spiral
      const angle = i * 0.6 + Math.random() * 0.3;
      const radius = 10 + (i / concepts.length) * 40;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      const size = 2 + c.strength * 8;
      const retention = currentRetention(c);
      return {
        id: c.id,
        name: c.name,
        color: c.color,
        x,
        y,
        size,
        retention,
        strength: c.strength,
        category: c.category,
      };
    });
  }, [concepts]);

  // Background stars
  const bgStars = Array.from({ length: 200 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.3,
    twinkle: Math.random() * 5,
  }));

  return (
    <AppShell>
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-semibold tracking-tight"
          >
            Your{" "}
            <span className="text-gradient italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Knowledge
            </span>{" "}
            Galaxy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-ink-300 mt-3 max-w-lg mx-auto"
          >
            Every concept is a star. Your universe grows as you learn. Hover to see each one.
          </motion.p>
        </div>

        {/* Galaxy canvas */}
        <div className="relative w-full h-screen">
          <div className="absolute inset-0 overflow-hidden">
            {/* Background starfield */}
            {bgStars.map((s) => (
              <motion.div
                key={s.id}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: s.size,
                  height: s.size,
                }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: s.twinkle }}
              />
            ))}

            {/* Central nebula */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
              <div className="absolute inset-0 rounded-full bg-gradient-radial from-violet-500/20 via-fuchsia-500/10 to-transparent blur-3xl" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
                style={{ transformOrigin: "center" }}
              >
                <div className="absolute inset-20 rounded-full bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-400/10 blur-2xl" />
              </motion.div>
            </div>

            {/* Concept stars */}
            {stars.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.6 }}
                className="absolute group"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Glow */}
                <div
                  className="absolute inset-0 rounded-full blur-md"
                  style={{
                    background: s.color,
                    opacity: 0.3 + s.retention * 0.5,
                    width: s.size * 4,
                    height: s.size * 4,
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
                {/* Core */}
                <div
                  className="relative rounded-full cursor-pointer transition-transform hover:scale-150"
                  style={{
                    width: s.size,
                    height: s.size,
                    background: s.color,
                    boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
                  }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 glass rounded-xl px-3 py-2 text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-ink-400">
                    {s.category} · {(s.retention * 100).toFixed(0)}% retained
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-3">
            {[
              { label: "Stars", value: concepts.length },
              { label: "Bright", value: concepts.filter((c) => c.strength > 0.7).length },
              { label: "Fading", value: concepts.filter((c) => currentRetention(c) < 0.4).length },
              { label: "Categories", value: new Set(concepts.map((c) => c.category)).size },
            ].map((stat) => (
              <div key={stat.label} className="glass-strong rounded-2xl px-4 py-3 text-center">
                <div className="text-2xl font-semibold tabular-nums">{stat.value}</div>
                <div className="text-[10px] text-ink-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
