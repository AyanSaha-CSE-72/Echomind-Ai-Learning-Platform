"use client";

import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";

/**
 * Renders a Lucide icon by name, or falls back to emoji if the name starts with
 * an emoji character or isn't found in lucide-react.
 */
export function IconRenderer({ name, className, ...props }: { name: string } & LucideProps) {
  // Check if it's an emoji (simple heuristic)
  if (/[\u{1F300}-\u{1F9FF}]/u.test(name)) {
    return <span className={className}>{name}</span>;
  }

  // Try to find the icon in lucide-react
  const IconComponent = (LucideIcons as any)[name];
  if (IconComponent && typeof IconComponent === "function") {
    return <IconComponent className={className} {...props} />;
  }

  // Fallback
  return <LucideIcons.HelpCircle className={className} {...props} />;
}

/** Curated list of icons available for subject selection */
export const SUBJECT_ICONS = [
  "Brain",
  "Code2",
  "Calculator",
  "Atom",
  "Leaf",
  "Languages",
  "FlaskConical",
  "BookOpen",
  "Music",
  "Palette",
  "Camera",
  "Film",
  "Gamepad2",
  "Rocket",
  "Zap",
  "Heart",
  "Star",
  "Compass",
  "Globe",
  "Briefcase",
  "GraduationCap",
  "Award",
  "Trophy",
  "Target",
  "Lightbulb",
  "Wrench",
  "Microscope",
  "Stethoscope",
  "Scale",
  "Gavel",
  "Landmark",
  "Building2",
];

/** Curated color palette for subjects */
export const SUBJECT_COLORS = [
  "#a78bfa", // violet
  "#d946ef", // fuchsia
  "#f0abfc", // pink
  "#fb7185", // rose
  "#fbbf24", // amber
  "#fb923c", // orange
  "#34d399", // emerald
  "#22d3ee", // cyan
  "#60a5fa", // blue
  "#818cf8", // indigo
  "#c084fc", // purple
  "#e879f9", // magenta
];

/** Cover gradient presets */
export const COVER_GRADIENTS = [
  { key: "gradient-violet-fuchsia", label: "Violet → Fuchsia", css: "from-violet-500 to-fuchsia-500" },
  { key: "gradient-fuchsia-pink", label: "Fuchsia → Pink", css: "from-fuchsia-500 to-pink-500" },
  { key: "gradient-cyan-blue", label: "Cyan → Blue", css: "from-cyan-400 to-blue-500" },
  { key: "gradient-amber-rose", label: "Amber → Rose", css: "from-amber-400 to-rose-400" },
  { key: "gradient-emerald-cyan", label: "Emerald → Cyan", css: "from-emerald-400 to-cyan-400" },
];
