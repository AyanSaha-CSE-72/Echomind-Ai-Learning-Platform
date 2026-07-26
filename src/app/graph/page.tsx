"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { useEcho } from "@/lib/store";
import { currentRetention } from "@/lib/cognitive";
import { cn } from "@/lib/utils";

interface LayoutNode {
  id: string;
  name: string;
  category: string;
  strength: number;
  retention: number;
  reviews: number;
  color: string;
  x: number;
  y: number;
  radius: number;
}

export default function GraphPage() {
  const concepts = useEcho((s) => s.concepts);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const { nodes, edges } = useMemo(() => {
    // Force-directed-ish layout with categories clustered
    const categoryCenters: Record<string, { cx: number; cy: number }> = {
      CS: { cx: 300, cy: 300 },
      ML: { cx: 750, cy: 300 },
      Math: { cx: 300, cy: 700 },
      Science: { cx: 750, cy: 700 },
    };

    const byCategory: Record<string, number> = {};
    const layoutNodes: LayoutNode[] = concepts.map((c) => {
      const center = categoryCenters[c.category] ?? { cx: 500, cy: 500 };
      const idx = (byCategory[c.category] = (byCategory[c.category] ?? 0) + 1);
      const angle = (idx * 2.39996) + Math.PI;
      const radius = 80 + idx * 30;
      const x = center.cx + Math.cos(angle) * radius;
      const y = center.cy + Math.sin(angle) * radius;
      return {
        id: c.id,
        name: c.name,
        category: c.category,
        strength: c.strength,
        retention: currentRetention(c),
        reviews: c.reviews,
        color: c.color,
        x,
        y,
        radius: 18 + c.strength * 24,
      };
    });

    const layoutEdges = concepts.flatMap((c) =>
      c.connections
        .filter((id) => concepts.some((x) => x.id === id))
        .map((id) => ({ from: c.id, to: id })),
    );

    return { nodes: layoutNodes, edges: layoutEdges };
  }, [concepts]);

  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const categories = ["all", ...Array.from(new Set(concepts.map((c) => c.category)))];

  const filteredNodes = filter === "all" ? nodes : nodes.filter((n) => n.category === filter);
  const filteredIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = edges.filter((e) => filteredIds.has(e.from) && filteredIds.has(e.to));

  const selectedNode = selected ? nodeById[selected] : null;

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto p-6 md:p-10 pb-24 lg:pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">
              Knowledge{" "}
              <span className="text-gradient italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Graph.
              </span>
            </h1>
            <p className="text-ink-300 mt-2 max-w-xl">
              Every concept you touch becomes a node. Edges are the relationships between them.
              Brighter = stronger. Larger = more reviewed.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs transition-all capitalize",
                  filter === cat
                    ? "bg-white text-ink-900"
                    : "glass text-ink-300 hover:text-white",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          <div className="glass rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-400/5" />
            <div className="absolute top-4 left-4 glass rounded-xl px-3 py-2 text-[11px] z-10">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  <span>CS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>ML</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Math</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Science</span>
                </div>
              </div>
            </div>

            <svg
              viewBox="0 0 1050 1000"
              className="w-full h-[640px] relative z-0"
            >
              <defs>
                <radialGradient id="nodeGlow">
                  <stop offset="0" stopColor="white" stopOpacity="0.8" />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Edges */}
              {filteredEdges.map((e, i) => {
                const from = nodeById[e.from];
                const to = nodeById[e.to];
                if (!from || !to) return null;
                const highlighted = selected && (selected === e.from || selected === e.to);
                return (
                  <line
                    key={i}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={highlighted ? "rgba(167,139,250,0.8)" : "rgba(255,255,255,0.12)"}
                    strokeWidth={highlighted ? 2 : 1}
                  />
                );
              })}

              {/* Nodes */}
              {filteredNodes.map((n) => {
                const isSelected = selected === n.id;
                const isConnected = selected
                  ? concepts
                      .find((c) => c.id === selected)
                      ?.connections.includes(n.id)
                  : false;
                const opacity = selected && !isSelected && !isConnected ? 0.25 : 1;
                return (
                  <g
                    key={n.id}
                    style={{ opacity, cursor: "pointer" }}
                    onClick={() => setSelected(isSelected ? null : n.id)}
                  >
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.radius + 12}
                      fill={n.color}
                      opacity={0.15 + n.retention * 0.4}
                      style={{ filter: "blur(8px)" }}
                    />
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.radius}
                      fill={n.color}
                      stroke={isSelected ? "white" : "rgba(255,255,255,0.3)"}
                      strokeWidth={isSelected ? 3 : 1.5}
                    />
                    <text
                      x={n.x}
                      y={n.y + n.radius + 18}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.75)"
                      fontSize="12"
                      fontWeight="500"
                    >
                      {n.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Inspector */}
          <div className="glass rounded-3xl p-6">
            {selectedNode ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: selectedNode.color }}
                  >
                    {selectedNode.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-xs text-ink-400">{selectedNode.category}</div>
                    <div className="font-semibold text-lg">{selectedNode.name}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <MetricBar
                    label="Strength"
                    value={selectedNode.strength}
                    color={selectedNode.color}
                  />
                  <MetricBar
                    label="Current retention"
                    value={selectedNode.retention}
                    color={selectedNode.color}
                  />
                  <div className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-ink-400">Reviews</span>
                      <span className="font-semibold">{selectedNode.reviews}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink-400">Connections</span>
                      <span className="font-semibold">
                        {concepts.find((c) => c.id === selected)?.connections.length ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="text-xs text-ink-400 mb-2">Connected to</div>
                    <div className="flex flex-wrap gap-1.5">
                      {concepts
                        .find((c) => c.id === selected)
                        ?.connections.map((id) => {
                          const n = nodeById[id];
                          if (!n) return null;
                          return (
                            <button
                              key={id}
                              onClick={() => setSelected(id)}
                              className="glass rounded-lg px-2.5 py-1 text-xs hover:border-violet-500/40"
                            >
                              <span
                                className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                                style={{ background: n.color }}
                              />
                              {n.name}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-400 mb-2">
                  Overview
                </div>
                <div className="text-3xl font-semibold mb-2">{concepts.length} concepts</div>
                <p className="text-xs text-ink-400 leading-relaxed mb-5">
                  Click any node to see its cognitive state. Brighter = stronger. Hover to see connections.
                </p>
                <div className="space-y-2">
                  <LegendRow label="Bright" desc="Strong (mastered)" color="bg-white" />
                  <LegendRow label="Dim" desc="Fading (needs review)" color="bg-white/40" />
                  <LegendRow label="Large" desc="Many reviews" color="bg-white/60" />
                  <LegendRow label="Edge" desc="Concept relationship" color="bg-white/20" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-ink-400">{label}</span>
        <span className="font-semibold tabular-nums">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function LegendRow({ label, desc, color }: { label: string; desc: string; color: string }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <div className={cn("w-3 h-3 rounded-full", color)} />
      <span className="font-medium">{label}</span>
      <span className="text-ink-400 ml-auto">{desc}</span>
    </div>
  );
}
