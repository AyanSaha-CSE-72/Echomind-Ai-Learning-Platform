(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/cognitive.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Cognitive modeling engine for EchoMind.
 *
 * Core ideas:
 *   - Forgetting curve: retention = exp(-t / stability)
 *   - Stability grows with each successful recall (supermemo-ish).
 *   - Memory score combines strength, recency, difficulty, and confidence.
 *   - Concepts have a dependency graph.
 */ __turbopack_context__.s([
    "CONCEPT_TO_SUBJECT",
    ()=>CONCEPT_TO_SUBJECT,
    "cognitiveLoad",
    ()=>cognitiveLoad,
    "currentRetention",
    ()=>currentRetention,
    "levelFromXp",
    ()=>levelFromXp,
    "predictForgetting",
    ()=>predictForgetting,
    "reinforce",
    ()=>reinforce,
    "retention",
    ()=>retention,
    "seedCollections",
    ()=>seedCollections,
    "seedConcepts",
    ()=>seedConcepts,
    "seedMissions",
    ()=>seedMissions,
    "seedSubjects",
    ()=>seedSubjects,
    "weaken",
    ()=>weaken,
    "xpForLevel",
    ()=>xpForLevel
]);
function retention(stability, elapsedDays) {
    if (stability <= 0) return 0;
    return Math.exp(-elapsedDays / stability);
}
function currentRetention(c, now = Date.now()) {
    const elapsed = (now - c.lastReview) / (1000 * 60 * 60 * 24);
    return retention(c.stability, Math.max(0, elapsed));
}
function reinforce(c, quality/* 0..1 */ , now = Date.now()) {
    const factor = 1 + quality * (1.2 + c.reviews * 0.15);
    return {
        ...c,
        strength: Math.min(1, c.strength + quality * 0.12),
        stability: c.stability * factor,
        lastReview: now,
        reviews: c.reviews + 1
    };
}
function weaken(c, now = Date.now()) {
    return {
        ...c,
        strength: Math.max(0, c.strength * 0.65),
        stability: Math.max(0.5, c.stability * 0.5),
        lastReview: now
    };
}
function predictForgetting(concepts, horizonDays = 3) {
    const now = Date.now();
    return [
        ...concepts
    ].map((c)=>({
            c,
            r: currentRetention(c, now)
        })).sort((a, b)=>a.r - b.r).slice(0, Math.min(horizonDays * 2, concepts.length)).map((x)=>x.c);
}
function cognitiveLoad(correctRatio, sessionMinutes) {
    const fatigue = Math.min(1, sessionMinutes / 90);
    const challenge = 1 - correctRatio;
    return clamp(challenge * 0.6 + fatigue * 0.4, 0, 1);
}
function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}
function seedCollections() {
    return [
        {
            id: "col-stem",
            name: "STEM",
            icon: "FlaskConical",
            color: "#8b5cf6",
            position: 0,
            archived: false,
            createdAt: Date.now() - 86400000 * 30
        },
        {
            id: "col-languages",
            name: "Languages",
            icon: "Languages",
            color: "#22d3ee",
            position: 1,
            archived: false,
            createdAt: Date.now() - 86400000 * 25
        }
    ];
}
function seedSubjects() {
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
            updatedAt: Date.now()
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
            updatedAt: Date.now()
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
            updatedAt: Date.now()
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
            updatedAt: Date.now()
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
            updatedAt: Date.now()
        }
    ];
}
const CONCEPT_TO_SUBJECT = {
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
    biology: "subj-biology"
};
function seedConcepts() {
    const palette = [
        "#a78bfa",
        "#f0abfc",
        "#22d3ee",
        "#34d399",
        "#fbbf24",
        "#fb7185",
        "#60a5fa",
        "#c084fc"
    ];
    const data = [
        {
            id: "programming",
            name: "Programming",
            category: "CS",
            strength: 0.9,
            stability: 120,
            lastReview: Date.now() - 86400000 * 2,
            reviews: 42,
            difficulty: 0.3
        },
        {
            id: "variables",
            name: "Variables",
            category: "CS",
            strength: 0.95,
            stability: 200,
            lastReview: Date.now() - 86400000,
            reviews: 38,
            difficulty: 0.1
        },
        {
            id: "functions",
            name: "Functions",
            category: "CS",
            strength: 0.82,
            stability: 80,
            lastReview: Date.now() - 86400000 * 3,
            reviews: 28,
            difficulty: 0.3
        },
        {
            id: "loops",
            name: "Loops",
            category: "CS",
            strength: 0.88,
            stability: 110,
            lastReview: Date.now() - 86400000 * 2,
            reviews: 31,
            difficulty: 0.2
        },
        {
            id: "recursion",
            name: "Recursion",
            category: "CS",
            strength: 0.55,
            stability: 18,
            lastReview: Date.now() - 86400000 * 6,
            reviews: 7,
            difficulty: 0.7
        },
        {
            id: "objects",
            name: "Objects",
            category: "CS",
            strength: 0.78,
            stability: 65,
            lastReview: Date.now() - 86400000 * 4,
            reviews: 18,
            difficulty: 0.35
        },
        {
            id: "arrays",
            name: "Arrays",
            category: "CS",
            strength: 0.85,
            stability: 95,
            lastReview: Date.now() - 86400000 * 2,
            reviews: 24,
            difficulty: 0.25
        },
        {
            id: "graphs",
            name: "Graphs",
            category: "CS",
            strength: 0.45,
            stability: 12,
            lastReview: Date.now() - 86400000 * 10,
            reviews: 5,
            difficulty: 0.75
        },
        {
            id: "dp",
            name: "Dynamic Programming",
            category: "CS",
            strength: 0.28,
            stability: 4,
            lastReview: Date.now() - 86400000 * 14,
            reviews: 2,
            difficulty: 0.9
        },
        {
            id: "ml",
            name: "Machine Learning",
            category: "ML",
            strength: 0.62,
            stability: 30,
            lastReview: Date.now() - 86400000 * 5,
            reviews: 12,
            difficulty: 0.65
        },
        {
            id: "neural",
            name: "Neural Networks",
            category: "ML",
            strength: 0.48,
            stability: 14,
            lastReview: Date.now() - 86400000 * 8,
            reviews: 8,
            difficulty: 0.8
        },
        {
            id: "backprop",
            name: "Backpropagation",
            category: "ML",
            strength: 0.35,
            stability: 8,
            lastReview: Date.now() - 86400000 * 12,
            reviews: 4,
            difficulty: 0.85
        },
        {
            id: "attention",
            name: "Attention",
            category: "ML",
            strength: 0.58,
            stability: 22,
            lastReview: Date.now() - 86400000 * 4,
            reviews: 10,
            difficulty: 0.7
        },
        {
            id: "llm",
            name: "Large Language Models",
            category: "ML",
            strength: 0.7,
            stability: 40,
            lastReview: Date.now() - 86400000 * 3,
            reviews: 15,
            difficulty: 0.6
        },
        {
            id: "embeddings",
            name: "Embeddings",
            category: "ML",
            strength: 0.52,
            stability: 16,
            lastReview: Date.now() - 86400000 * 7,
            reviews: 9,
            difficulty: 0.55
        },
        {
            id: "calculus",
            name: "Calculus",
            category: "Math",
            strength: 0.6,
            stability: 28,
            lastReview: Date.now() - 86400000 * 6,
            reviews: 14,
            difficulty: 0.7
        },
        {
            id: "linalg",
            name: "Linear Algebra",
            category: "Math",
            strength: 0.55,
            stability: 20,
            lastReview: Date.now() - 86400000 * 9,
            reviews: 11,
            difficulty: 0.75
        },
        {
            id: "probability",
            name: "Probability",
            category: "Math",
            strength: 0.68,
            stability: 35,
            lastReview: Date.now() - 86400000 * 4,
            reviews: 13,
            difficulty: 0.5
        },
        {
            id: "physics",
            name: "Physics",
            category: "Science",
            strength: 0.42,
            stability: 10,
            lastReview: Date.now() - 86400000 * 15,
            reviews: 6,
            difficulty: 0.8
        },
        {
            id: "biology",
            name: "Biology",
            category: "Science",
            strength: 0.5,
            stability: 18,
            lastReview: Date.now() - 86400000 * 11,
            reviews: 8,
            difficulty: 0.6
        }
    ];
    const connections = {
        programming: [
            "variables",
            "functions",
            "loops",
            "objects",
            "arrays"
        ],
        variables: [
            "programming"
        ],
        functions: [
            "programming",
            "recursion"
        ],
        loops: [
            "programming"
        ],
        recursion: [
            "functions",
            "dp"
        ],
        objects: [
            "programming",
            "arrays"
        ],
        arrays: [
            "programming",
            "objects"
        ],
        graphs: [
            "dp",
            "recursion"
        ],
        dp: [
            "graphs",
            "recursion",
            "programming"
        ],
        ml: [
            "neural",
            "probability",
            "linalg",
            "calculus"
        ],
        neural: [
            "ml",
            "backprop",
            "attention"
        ],
        backprop: [
            "neural",
            "calculus"
        ],
        attention: [
            "neural",
            "llm",
            "embeddings"
        ],
        llm: [
            "attention",
            "embeddings",
            "ml"
        ],
        embeddings: [
            "llm",
            "linalg"
        ],
        calculus: [
            "backprop",
            "probability"
        ],
        linalg: [
            "embeddings",
            "neural",
            "ml"
        ],
        probability: [
            "ml",
            "calculus"
        ],
        physics: [
            "calculus",
            "biology"
        ],
        biology: [
            "physics"
        ]
    };
    return data.map((d, i)=>({
            ...d,
            color: palette[i % palette.length],
            connections: connections[d.id] ?? [],
            subjectId: CONCEPT_TO_SUBJECT[d.id] ?? null
        }));
}
function seedMissions() {
    return [
        {
            id: "m1",
            title: "Morning Reflection",
            description: "Write one sentence about what you want to learn today.",
            xp: 25,
            progress: 0,
            icon: "sunrise",
            done: false
        },
        {
            id: "m2",
            title: "Socratic Dialogue",
            description: "Have a 3-turn mentor session on any concept.",
            xp: 60,
            progress: 0.33,
            icon: "brain",
            done: false
        },
        {
            id: "m3",
            title: "Revision Sprint",
            description: "Review 3 concepts predicted to fade.",
            xp: 45,
            progress: 0.66,
            icon: "repeat",
            done: false
        },
        {
            id: "m4",
            title: "Teach-Back",
            description: "Explain recursion as if I were 10.",
            xp: 80,
            progress: 0,
            icon: "chalkboard",
            done: false
        },
        {
            id: "m5",
            title: "Quiz Challenge",
            description: "Score 80%+ on an adaptive quiz.",
            xp: 100,
            progress: 0,
            icon: "trophy",
            done: false
        }
    ];
}
function xpForLevel(level) {
    return Math.floor(200 * Math.pow(1.35, level - 1));
}
function levelFromXp(xp) {
    let level = 1;
    let remaining = xp;
    while(remaining >= xpForLevel(level)){
        remaining -= xpForLevel(level);
        level++;
    }
    return {
        level,
        progress: remaining / xpForLevel(level),
        nextAt: xpForLevel(level)
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "selectLevel",
    ()=>selectLevel,
    "selectRetention",
    ()=>selectRetention,
    "useEcho",
    ()=>useEcho
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cognitive$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cognitive.ts [app-client] (ecmascript)");
"use client";
;
;
;
function todayISO() {
    return new Date().toISOString().slice(0, 10);
}
const defaultProfile = {
    name: "Explorer",
    displayName: "Explorer",
    avatar: "🧠",
    learningSpeed: 0.72,
    memoryStrength: 0.68,
    attentionSpan: 42,
    confidence: 0.6,
    curiosityIndex: 0.81,
    criticalThinking: 0.66,
    style: {
        visual: 0.7,
        reading: 0.55,
        listening: 0.4,
        handsOn: 0.65
    },
    streak: 12,
    lastActiveDate: todayISO(),
    totalMinutes: 1284,
    xp: 4820
};
const defaultAchievements = [
    {
        id: "first-step",
        title: "First Step",
        description: "Complete your first session",
        unlockedAt: Date.now() - 86400000 * 30,
        icon: "🌱"
    },
    {
        id: "socratic",
        title: "Socratic Mind",
        description: "Have 10 mentor conversations",
        unlockedAt: Date.now() - 86400000 * 14,
        icon: "🧩"
    },
    {
        id: "streak-7",
        title: "Week Streak",
        description: "Learn 7 days in a row",
        unlockedAt: Date.now() - 86400000 * 7,
        icon: "🔥"
    },
    {
        id: "teacher",
        title: "The Teacher",
        description: "Teach-back 5 concepts",
        unlockedAt: null,
        icon: "🎓"
    },
    {
        id: "polymath",
        title: "Polymath",
        description: "Master 3 different fields",
        unlockedAt: null,
        icon: "🌌"
    },
    {
        id: "centurion",
        title: "Centurion",
        description: "Score 100 on a quiz",
        unlockedAt: null,
        icon: "💯"
    }
];
const useEcho = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        theme: "dark",
        setTheme: (t)=>set({
                theme: t
            }),
        profile: defaultProfile,
        updateProfile: (p)=>set((s)=>({
                    profile: {
                        ...s.profile,
                        ...p
                    }
                })),
        addXp: (amount)=>set((s)=>({
                    profile: {
                        ...s.profile,
                        xp: s.profile.xp + amount
                    }
                })),
        bumpStreak: ()=>set((s)=>{
                const today = todayISO();
                if (s.profile.lastActiveDate === today) return s;
                const yd = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
                const newStreak = s.profile.lastActiveDate === yd ? s.profile.streak + 1 : 1;
                return {
                    profile: {
                        ...s.profile,
                        streak: newStreak,
                        lastActiveDate: today
                    }
                };
            }),
        adjustStyle: (which, delta)=>set((s)=>({
                    profile: {
                        ...s.profile,
                        style: {
                            ...s.profile.style,
                            [which]: Math.max(0, Math.min(1, s.profile.style[which] + delta))
                        }
                    }
                })),
        // ---- Subjects ----
        subjects: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cognitive$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["seedSubjects"])(),
        collections: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cognitive$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["seedCollections"])(),
        createSubject: (data)=>{
            const id = `subj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            set((s)=>({
                    subjects: [
                        ...s.subjects,
                        {
                            ...data,
                            id,
                            position: s.subjects.length,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        }
                    ]
                }));
            return id;
        },
        updateSubject: (id, data)=>set((s)=>({
                    subjects: s.subjects.map((sub)=>sub.id === id ? {
                            ...sub,
                            ...data,
                            updatedAt: Date.now()
                        } : sub)
                })),
        deleteSubject: (id)=>set((s)=>({
                    subjects: s.subjects.filter((sub)=>sub.id !== id),
                    concepts: s.concepts.map((c)=>c.subjectId === id ? {
                            ...c,
                            subjectId: null
                        } : c)
                })),
        archiveSubject: (id)=>set((s)=>({
                    subjects: s.subjects.map((sub)=>sub.id === id ? {
                            ...sub,
                            archived: true,
                            updatedAt: Date.now()
                        } : sub)
                })),
        unarchiveSubject: (id)=>set((s)=>({
                    subjects: s.subjects.map((sub)=>sub.id === id ? {
                            ...sub,
                            archived: false,
                            updatedAt: Date.now()
                        } : sub)
                })),
        duplicateSubject: (id)=>{
            const newId = `subj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            set((s)=>{
                const original = s.subjects.find((sub)=>sub.id === id);
                if (!original) return s;
                const copy = {
                    ...original,
                    id: newId,
                    name: `${original.name} (copy)`,
                    pinned: false,
                    position: s.subjects.length,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
                // Duplicate concepts belonging to this subject
                const newConcepts = s.concepts.filter((c)=>c.subjectId === id).map((c)=>({
                        ...c,
                        id: `${c.id}-copy-${Math.random().toString(36).slice(2, 5)}`,
                        subjectId: newId,
                        reviews: 0,
                        strength: 0.1,
                        stability: 1
                    }));
                return {
                    subjects: [
                        ...s.subjects,
                        copy
                    ],
                    concepts: [
                        ...s.concepts,
                        ...newConcepts
                    ]
                };
            });
            return newId;
        },
        pinSubject: (id)=>set((s)=>({
                    subjects: s.subjects.map((sub)=>sub.id === id ? {
                            ...sub,
                            pinned: true,
                            updatedAt: Date.now()
                        } : sub)
                })),
        unpinSubject: (id)=>set((s)=>({
                    subjects: s.subjects.map((sub)=>sub.id === id ? {
                            ...sub,
                            pinned: false,
                            updatedAt: Date.now()
                        } : sub)
                })),
        reorderSubjects: (from, to)=>set((s)=>{
                const list = [
                    ...s.subjects
                ];
                const [moved] = list.splice(from, 1);
                list.splice(to, 0, moved);
                return {
                    subjects: list.map((sub, i)=>({
                            ...sub,
                            position: i
                        }))
                };
            }),
        moveSubjectToCollection: (subjectId, collectionId)=>set((s)=>({
                    subjects: s.subjects.map((sub)=>sub.id === subjectId ? {
                            ...sub,
                            collectionId,
                            updatedAt: Date.now()
                        } : sub)
                })),
        // ---- Collections ----
        createCollection: (data)=>{
            const id = `col-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            set((s)=>({
                    collections: [
                        ...s.collections,
                        {
                            ...data,
                            id,
                            position: s.collections.length,
                            createdAt: Date.now()
                        }
                    ]
                }));
            return id;
        },
        updateCollection: (id, data)=>set((s)=>({
                    collections: s.collections.map((c)=>c.id === id ? {
                            ...c,
                            ...data
                        } : c)
                })),
        deleteCollection: (id)=>set((s)=>({
                    collections: s.collections.filter((c)=>c.id !== id),
                    subjects: s.subjects.map((sub)=>sub.collectionId === id ? {
                            ...sub,
                            collectionId: null
                        } : sub)
                })),
        reorderCollections: (from, to)=>set((s)=>{
                const list = [
                    ...s.collections
                ];
                const [moved] = list.splice(from, 1);
                list.splice(to, 0, moved);
                return {
                    collections: list.map((c, i)=>({
                            ...c,
                            position: i
                        }))
                };
            }),
        concepts: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cognitive$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["seedConcepts"])(),
        setConcepts: (c)=>set({
                concepts: c
            }),
        reinforceConcept: (id, quality = 0.7)=>set((s)=>({
                    concepts: s.concepts.map((c)=>c.id === id ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cognitive$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["reinforce"])(c, quality) : c)
                })),
        weakenConcept: (id)=>set((s)=>({
                    concepts: s.concepts.map((c)=>c.id === id ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cognitive$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["weaken"])(c) : c)
                })),
        addConcept: (c)=>set((s)=>({
                    concepts: [
                        ...s.concepts,
                        c
                    ]
                })),
        updateConceptSubject: (conceptId, subjectId)=>set((s)=>({
                    concepts: s.concepts.map((c)=>c.id === conceptId ? {
                            ...c,
                            subjectId
                        } : c)
                })),
        missions: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cognitive$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["seedMissions"])(),
        completeMission: (id)=>set((s)=>{
                const mission = s.missions.find((m)=>m.id === id);
                if (!mission || mission.done) return s;
                return {
                    missions: s.missions.map((m)=>m.id === id ? {
                            ...m,
                            done: true,
                            progress: 1
                        } : m),
                    profile: {
                        ...s.profile,
                        xp: s.profile.xp + mission.xp
                    }
                };
            }),
        setMissionProgress: (id, progress)=>set((s)=>({
                    missions: s.missions.map((m)=>m.id === id ? {
                            ...m,
                            progress
                        } : m)
                })),
        sessionMinutes: 0,
        addSessionMinutes: (m)=>set((s)=>({
                    sessionMinutes: s.sessionMinutes + m
                })),
        chatHistory: [],
        activeChatId: null,
        createChat: ()=>{
            const id = `chat-${Date.now()}`;
            set((s)=>({
                    chatHistory: [
                        {
                            id,
                            messages: [],
                            title: "New conversation",
                            updatedAt: Date.now()
                        },
                        ...s.chatHistory
                    ],
                    activeChatId: id
                }));
            return id;
        },
        appendChatMessage: (chatId, role, content)=>set((s)=>({
                    chatHistory: s.chatHistory.map((c)=>{
                        if (c.id !== chatId) return c;
                        const msgs = [
                            ...c.messages,
                            {
                                role,
                                content,
                                ts: Date.now()
                            }
                        ];
                        const title = c.title === "New conversation" && role === "user" ? content.slice(0, 48) : c.title;
                        return {
                            ...c,
                            messages: msgs,
                            title,
                            updatedAt: Date.now()
                        };
                    })
                })),
        setActiveChat: (id)=>set({
                activeChatId: id
            }),
        deleteChat: (id)=>set((s)=>({
                    chatHistory: s.chatHistory.filter((c)=>c.id !== id),
                    activeChatId: s.activeChatId === id ? null : s.activeChatId
                })),
        achievements: defaultAchievements,
        unlockAchievement: (id)=>set((s)=>({
                    achievements: s.achievements.map((a)=>a.id === id && a.unlockedAt == null ? {
                            ...a,
                            unlockedAt: Date.now()
                        } : a)
                })),
        // ---- API Keys ----
        apiKeys: [],
        addApiKey: (data)=>{
            const id = `key-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            set((s)=>{
                // If this is the first key, make it active
                const isActive = s.apiKeys.length === 0;
                const newKeys = s.apiKeys.map((k)=>({
                        ...k,
                        isActive: false
                    }));
                return {
                    apiKeys: [
                        ...newKeys,
                        {
                            ...data,
                            id,
                            createdAt: Date.now(),
                            isActive
                        }
                    ]
                };
            });
            return id;
        },
        removeApiKey: (id)=>set((s)=>{
                const removed = s.apiKeys.find((k)=>k.id === id);
                const remaining = s.apiKeys.filter((k)=>k.id !== id);
                // If we removed the active key, promote the first remaining
                if (removed?.isActive && remaining.length > 0) {
                    remaining[0].isActive = true;
                }
                return {
                    apiKeys: remaining
                };
            }),
        setActiveApiKey: (id)=>set((s)=>({
                    apiKeys: s.apiKeys.map((k)=>({
                            ...k,
                            isActive: k.id === id
                        }))
                })),
        clearActiveApiKey: ()=>set((s)=>({
                    apiKeys: s.apiKeys.map((k)=>({
                            ...k,
                            isActive: false
                        }))
                })),
        updateApiKey: (id, data)=>set((s)=>({
                    apiKeys: s.apiKeys.map((k)=>k.id === id ? {
                            ...k,
                            ...data
                        } : k)
                })),
        getActiveApiKey: ()=>{
            const state = useEcho.getState();
            return state.apiKeys.find((k)=>k.isActive) ?? null;
        }
    }), {
    name: "echomind-state-v3",
    partialize: (s)=>({
            theme: s.theme,
            profile: s.profile,
            subjects: s.subjects,
            collections: s.collections,
            concepts: s.concepts,
            missions: s.missions,
            chatHistory: s.chatHistory,
            activeChatId: s.activeChatId,
            achievements: s.achievements,
            sessionMinutes: s.sessionMinutes,
            apiKeys: s.apiKeys
        })
}));
const selectLevel = ()=>{
    const xp = useEcho.getState().profile.xp;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cognitive$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["levelFromXp"])(xp);
};
const selectRetention = (id)=>{
    const c = useEcho.getState().concepts.find((x)=>x.id === id);
    if (!c) return 0;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cognitive$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["currentRetention"])(c);
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/store.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function Providers({ children }) {
    _s();
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEcho"])({
        "Providers.useEcho[theme]": (s)=>s.theme
    }["Providers.useEcho[theme]"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Providers.useEffect": ()=>{
            const root = document.documentElement;
            root.classList.remove("dark", "light");
            root.classList.add(theme);
        }
    }["Providers.useEffect"], [
        theme
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(Providers, "FKOvJPV6BnG8hskiNQ9tA+lqGao=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEcho"]
    ];
});
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0mc5x5z._.js.map