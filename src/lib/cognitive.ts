/**
 * Cognitive modeling engine for EchoMind.
 *
 * Core ideas:
 *   - Forgetting curve: retention = exp(-t / stability)
 *   - Stability grows with each successful recall (supermemo-ish).
 *   - Memory score combines strength, recency, difficulty, and confidence.
 *   - Concepts have a dependency graph.
 */

export interface Concept {
  id: string;
  name: string;
  category: string;
  strength: number; // 0..1
  stability: number; // days until 1/e retention
  lastReview: number; // epoch ms
  reviews: number;
  difficulty: number; // 0..1
  connections: string[]; // other concept ids
  color: string;
  subjectId: string | null;
}

/** Ebbinghaus-inspired retention curve. */
export function retention(stability: number, elapsedDays: number): number {
  if (stability <= 0) return 0;
  return Math.exp(-elapsedDays / stability);
}

/** Compute current retention % for a concept based on its lastReview. */
export function currentRetention(c: Concept, now: number = Date.now()): number {
  const elapsed = (now - c.lastReview) / (1000 * 60 * 60 * 24);
  return retention(c.stability, Math.max(0, elapsed));
}

/** After a successful recall, strengthen the concept. */
export function reinforce(c: Concept, quality: number /* 0..1 */, now: number = Date.now()): Concept {
  const factor = 1 + quality * (1.2 + c.reviews * 0.15);
  return {
    ...c,
    strength: Math.min(1, c.strength + quality * 0.12),
    stability: c.stability * factor,
    lastReview: now,
    reviews: c.reviews + 1,
  };
}

/** After a failed recall, weaken the concept. */
export function weaken(c: Concept, now: number = Date.now()): Concept {
  return {
    ...c,
    strength: Math.max(0, c.strength * 0.65),
    stability: Math.max(0.5, c.stability * 0.5),
    lastReview: now,
  };
}

/** Predict which concepts will be forgotten soonest. */
export function predictForgetting(concepts: Concept[], horizonDays = 3): Concept[] {
  const now = Date.now();
  return [...concepts]
    .map((c) => ({ c, r: currentRetention(c, now) }))
    .sort((a, b) => a.r - b.r)
    .slice(0, Math.min(horizonDays * 2, concepts.length))
    .map((x) => x.c);
}

/** Compute the cognitive load score for a session. */
export function cognitiveLoad(correctRatio: number, sessionMinutes: number): number {
  const fatigue = Math.min(1, sessionMinutes / 90);
  const challenge = 1 - correctRatio;
  return clamp((challenge * 0.6 + fatigue * 0.4), 0, 1);
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Seed subjects — the user's personalized learning universe.
 * These ship as defaults on first login; users can delete/rename/archive/duplicate all of them.
 */
export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  cover?: string;
  description?: string;
  pinned: boolean;
  archived: boolean;
  position: number;
  collectionId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  icon: string;
  color: string;
  position: number;
  archived: boolean;
  createdAt: number;
}

export function seedCollections(): Collection[] {
  return [
    {
      id: "col-stem",
      name: "STEM",
      icon: "FlaskConical",
      color: "#8b5cf6",
      position: 0,
      archived: false,
      createdAt: Date.now() - 86400000 * 30,
    },
    {
      id: "col-languages",
      name: "Languages",
      icon: "Languages",
      color: "#22d3ee",
      position: 1,
      archived: false,
      createdAt: Date.now() - 86400000 * 25,
    },
  ];
}

export function seedSubjects(): Subject[] {
  return [
    {
      id: "subj-ml",
      name: "Machine Learning",
      icon: "Brain",
      color: "#a78bfa",
      cover: "gradient-violet-fuchsia",
      description: "Algorithms that learn from data.",
      pinned: true,
      archived: false,
      position: 0,
      collectionId: "col-stem",
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now(),
    },
    {
      id: "subj-programming",
      name: "Programming",
      icon: "Code2",
      color: "#d946ef",
      cover: "gradient-fuchsia-pink",
      description: "The craft of instructing computers.",
      pinned: true,
      archived: false,
      position: 1,
      collectionId: "col-stem",
      createdAt: Date.now() - 86400000 * 28,
      updatedAt: Date.now(),
    },
    {
      id: "subj-math",
      name: "Mathematics",
      icon: "Calculator",
      color: "#22d3ee",
      cover: "gradient-cyan-blue",
      description: "The language of patterns.",
      pinned: false,
      archived: false,
      position: 2,
      collectionId: "col-stem",
      createdAt: Date.now() - 86400000 * 25,
      updatedAt: Date.now(),
    },
    {
      id: "subj-physics",
      name: "Physics",
      icon: "Atom",
      color: "#fbbf24",
      cover: "gradient-amber-rose",
      description: "How the universe behaves.",
      pinned: false,
      archived: false,
      position: 3,
      collectionId: "col-stem",
      createdAt: Date.now() - 86400000 * 20,
      updatedAt: Date.now(),
    },
    {
      id: "subj-biology",
      name: "Biology",
      icon: "Leaf",
      color: "#34d399",
      cover: "gradient-emerald-cyan",
      description: "The science of life.",
      pinned: false,
      archived: false,
      position: 4,
      collectionId: "col-stem",
      createdAt: Date.now() - 86400000 * 18,
      updatedAt: Date.now(),
    },
  ];
}

/** Map concept ids to their default subject. */
export const CONCEPT_TO_SUBJECT: Record<string, string> = {
  ml: "subj-ml",
  neural: "subj-ml",
  backprop: "subj-ml",
  attention: "subj-ml",
  llm: "subj-ml",
  embeddings: "subj-ml",
  programming: "subj-programming",
  variables: "subj-programming",
  functions: "subj-programming",
  loops: "subj-programming",
  recursion: "subj-programming",
  objects: "subj-programming",
  arrays: "subj-programming",
  graphs: "subj-programming",
  dp: "subj-programming",
  calculus: "subj-math",
  linalg: "subj-math",
  probability: "subj-math",
  physics: "subj-physics",
  biology: "subj-biology",
};

/**
 * Generate the seeded knowledge graph used across the app.
 * This is a curated set of CS / ML / science concepts.
 */
export function seedConcepts(): Concept[] {
  const palette = ["#a78bfa", "#f0abfc", "#22d3ee", "#34d399", "#fbbf24", "#fb7185", "#60a5fa", "#c084fc"];
  const data: Omit<Concept, "color" | "connections" | "subjectId">[] = [
    { id: "programming", name: "Programming", category: "CS", strength: 0.9, stability: 120, lastReview: Date.now() - 86400000 * 2, reviews: 42, difficulty: 0.3 },
    { id: "variables", name: "Variables", category: "CS", strength: 0.95, stability: 200, lastReview: Date.now() - 86400000, reviews: 38, difficulty: 0.1 },
    { id: "functions", name: "Functions", category: "CS", strength: 0.82, stability: 80, lastReview: Date.now() - 86400000 * 3, reviews: 28, difficulty: 0.3 },
    { id: "loops", name: "Loops", category: "CS", strength: 0.88, stability: 110, lastReview: Date.now() - 86400000 * 2, reviews: 31, difficulty: 0.2 },
    { id: "recursion", name: "Recursion", category: "CS", strength: 0.55, stability: 18, lastReview: Date.now() - 86400000 * 6, reviews: 7, difficulty: 0.7 },
    { id: "objects", name: "Objects", category: "CS", strength: 0.78, stability: 65, lastReview: Date.now() - 86400000 * 4, reviews: 18, difficulty: 0.35 },
    { id: "arrays", name: "Arrays", category: "CS", strength: 0.85, stability: 95, lastReview: Date.now() - 86400000 * 2, reviews: 24, difficulty: 0.25 },
    { id: "graphs", name: "Graphs", category: "CS", strength: 0.45, stability: 12, lastReview: Date.now() - 86400000 * 10, reviews: 5, difficulty: 0.75 },
    { id: "dp", name: "Dynamic Programming", category: "CS", strength: 0.28, stability: 4, lastReview: Date.now() - 86400000 * 14, reviews: 2, difficulty: 0.9 },
    { id: "ml", name: "Machine Learning", category: "ML", strength: 0.62, stability: 30, lastReview: Date.now() - 86400000 * 5, reviews: 12, difficulty: 0.65 },
    { id: "neural", name: "Neural Networks", category: "ML", strength: 0.48, stability: 14, lastReview: Date.now() - 86400000 * 8, reviews: 8, difficulty: 0.8 },
    { id: "backprop", name: "Backpropagation", category: "ML", strength: 0.35, stability: 8, lastReview: Date.now() - 86400000 * 12, reviews: 4, difficulty: 0.85 },
    { id: "attention", name: "Attention", category: "ML", strength: 0.58, stability: 22, lastReview: Date.now() - 86400000 * 4, reviews: 10, difficulty: 0.7 },
    { id: "llm", name: "Large Language Models", category: "ML", strength: 0.7, stability: 40, lastReview: Date.now() - 86400000 * 3, reviews: 15, difficulty: 0.6 },
    { id: "embeddings", name: "Embeddings", category: "ML", strength: 0.52, stability: 16, lastReview: Date.now() - 86400000 * 7, reviews: 9, difficulty: 0.55 },
    { id: "calculus", name: "Calculus", category: "Math", strength: 0.6, stability: 28, lastReview: Date.now() - 86400000 * 6, reviews: 14, difficulty: 0.7 },
    { id: "linalg", name: "Linear Algebra", category: "Math", strength: 0.55, stability: 20, lastReview: Date.now() - 86400000 * 9, reviews: 11, difficulty: 0.75 },
    { id: "probability", name: "Probability", category: "Math", strength: 0.68, stability: 35, lastReview: Date.now() - 86400000 * 4, reviews: 13, difficulty: 0.5 },
    { id: "physics", name: "Physics", category: "Science", strength: 0.42, stability: 10, lastReview: Date.now() - 86400000 * 15, reviews: 6, difficulty: 0.8 },
    { id: "biology", name: "Biology", category: "Science", strength: 0.5, stability: 18, lastReview: Date.now() - 86400000 * 11, reviews: 8, difficulty: 0.6 },
  ];

  const connections: Record<string, string[]> = {
    programming: ["variables", "functions", "loops", "objects", "arrays"],
    variables: ["programming"],
    functions: ["programming", "recursion"],
    loops: ["programming"],
    recursion: ["functions", "dp"],
    objects: ["programming", "arrays"],
    arrays: ["programming", "objects"],
    graphs: ["dp", "recursion"],
    dp: ["graphs", "recursion", "programming"],
    ml: ["neural", "probability", "linalg", "calculus"],
    neural: ["ml", "backprop", "attention"],
    backprop: ["neural", "calculus"],
    attention: ["neural", "llm", "embeddings"],
    llm: ["attention", "embeddings", "ml"],
    embeddings: ["llm", "linalg"],
    calculus: ["backprop", "probability"],
    linalg: ["embeddings", "neural", "ml"],
    probability: ["ml", "calculus"],
    physics: ["calculus", "biology"],
    biology: ["physics"],
  };

  return data.map((d, i) => ({
    ...d,
    color: palette[i % palette.length],
    connections: connections[d.id] ?? [],
    subjectId: CONCEPT_TO_SUBJECT[d.id] ?? null,
  }));
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  xp: number;
  progress: number; // 0..1
  icon: string;
  done: boolean;
}

export function seedMissions(): DailyMission[] {
  return [
    { id: "m1", title: "Morning Reflection", description: "Write one sentence about what you want to learn today.", xp: 25, progress: 0, icon: "sunrise", done: false },
    { id: "m2", title: "Socratic Dialogue", description: "Have a 3-turn mentor session on any concept.", xp: 60, progress: 0.33, icon: "brain", done: false },
    { id: "m3", title: "Revision Sprint", description: "Review 3 concepts predicted to fade.", xp: 45, progress: 0.66, icon: "repeat", done: false },
    { id: "m4", title: "Teach-Back", description: "Explain recursion as if I were 10.", xp: 80, progress: 0, icon: "chalkboard", done: false },
    { id: "m5", title: "Quiz Challenge", description: "Score 80%+ on an adaptive quiz.", xp: 100, progress: 0, icon: "trophy", done: false },
  ];
}

export function xpForLevel(level: number): number {
  return Math.floor(200 * Math.pow(1.35, level - 1));
}

export function levelFromXp(xp: number): { level: number; progress: number; nextAt: number } {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, progress: remaining / xpForLevel(level), nextAt: xpForLevel(level) };
}
