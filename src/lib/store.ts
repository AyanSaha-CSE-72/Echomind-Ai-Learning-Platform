"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Concept, DailyMission, Subject, Collection } from "./cognitive";
import {
  seedConcepts,
  seedSubjects,
  seedCollections,
  seedMissions,
  reinforce,
  weaken,
  levelFromXp,
  currentRetention,
} from "./cognitive";

export type Theme = "dark" | "light";

export type AIProvider = "openai" | "anthropic" | "gemini";

export interface ApiKey {
  id: string;
  name: string;
  provider: AIProvider;
  key: string;
  model?: string;
  createdAt: number;
  lastUsed?: number;
  isActive: boolean;
}

export interface LearnerProfile {
  name: string;
  displayName: string;
  avatar: string;
  learningSpeed: number;     // 0..1
  memoryStrength: number;    // 0..1
  attentionSpan: number;     // minutes
  confidence: number;        // 0..1
  curiosityIndex: number;    // 0..1
  criticalThinking: number;  // 0..1
  style: {
    visual: number;
    reading: number;
    listening: number;
    handsOn: number;
  };
  streak: number;
  lastActiveDate: string; // yyyy-mm-dd
  totalMinutes: number;
  xp: number;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

interface EchoState {
  theme: Theme;
  setTheme: (t: Theme) => void;

  profile: LearnerProfile;
  updateProfile: (p: Partial<LearnerProfile>) => void;
  addXp: (amount: number) => void;
  bumpStreak: () => void;
  adjustStyle: (which: "visual" | "reading" | "listening" | "handsOn", delta: number) => void;

  // Subjects & Collections — the user's learning universe
  subjects: Subject[];
  collections: Collection[];
  createSubject: (data: Omit<Subject, "id" | "position" | "createdAt" | "updatedAt">) => string;
  updateSubject: (id: string, data: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  archiveSubject: (id: string) => void;
  unarchiveSubject: (id: string) => void;
  duplicateSubject: (id: string) => string;
  pinSubject: (id: string) => void;
  unpinSubject: (id: string) => void;
  reorderSubjects: (fromIndex: number, toIndex: number) => void;
  moveSubjectToCollection: (subjectId: string, collectionId: string | null) => void;

  createCollection: (data: Omit<Collection, "id" | "position" | "createdAt">) => string;
  updateCollection: (id: string, data: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  reorderCollections: (fromIndex: number, toIndex: number) => void;

  concepts: Concept[];
  setConcepts: (c: Concept[]) => void;
  reinforceConcept: (id: string, quality?: number) => void;
  weakenConcept: (id: string) => void;
  addConcept: (c: Concept) => void;
  updateConceptSubject: (conceptId: string, subjectId: string | null) => void;

  missions: DailyMission[];
  completeMission: (id: string) => void;
  setMissionProgress: (id: string, progress: number) => void;

  // session / mentor
  sessionMinutes: number;
  addSessionMinutes: (m: number) => void;

  // chat history persisted
  chatHistory: { id: string; messages: { role: "user" | "mentor"; content: string; ts: number }[]; title: string; updatedAt: number }[];
  activeChatId: string | null;
  createChat: () => string;
  appendChatMessage: (chatId: string, role: "user" | "mentor", content: string) => void;
  setActiveChat: (id: string | null) => void;
  deleteChat: (id: string) => void;

  // achievements
  achievements: { id: string; title: string; description: string; unlockedAt: number | null; icon: string }[];
  unlockAchievement: (id: string) => void;

  // API Keys & AI Provider
  apiKeys: ApiKey[];
  addApiKey: (data: Omit<ApiKey, "id" | "createdAt" | "isActive">) => string;
  removeApiKey: (id: string) => void;
  setActiveApiKey: (id: string) => void;
  clearActiveApiKey: () => void;
  updateApiKey: (id: string, data: Partial<ApiKey>) => void;
  getActiveApiKey: () => ApiKey | null;
}

const defaultProfile: LearnerProfile = {
  name: "Explorer",
  displayName: "Explorer",
  avatar: "🧠",
  learningSpeed: 0.72,
  memoryStrength: 0.68,
  attentionSpan: 42,
  confidence: 0.6,
  curiosityIndex: 0.81,
  criticalThinking: 0.66,
  style: { visual: 0.7, reading: 0.55, listening: 0.4, handsOn: 0.65 },
  streak: 12,
  lastActiveDate: todayISO(),
  totalMinutes: 1284,
  xp: 4820,
};

const defaultAchievements = [
  { id: "first-step", title: "First Step", description: "Complete your first session", unlockedAt: Date.now() - 86400000 * 30, icon: "🌱" },
  { id: "socratic", title: "Socratic Mind", description: "Have 10 mentor conversations", unlockedAt: Date.now() - 86400000 * 14, icon: "🧩" },
  { id: "streak-7", title: "Week Streak", description: "Learn 7 days in a row", unlockedAt: Date.now() - 86400000 * 7, icon: "🔥" },
  { id: "teacher", title: "The Teacher", description: "Teach-back 5 concepts", unlockedAt: null, icon: "🎓" },
  { id: "polymath", title: "Polymath", description: "Master 3 different fields", unlockedAt: null, icon: "🌌" },
  { id: "centurion", title: "Centurion", description: "Score 100 on a quiz", unlockedAt: null, icon: "💯" },
];

export const useEcho = create<EchoState>()(
  persist(
    (set, get): EchoState =>
      ({
      theme: "dark",
      setTheme: (t) => set({ theme: t }),

      profile: defaultProfile,
      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      addXp: (amount) => set((s) => ({ profile: { ...s.profile, xp: s.profile.xp + amount } })),
      bumpStreak: () =>
        set((s) => {
          const today = todayISO();
          if (s.profile.lastActiveDate === today) return s;
          const yd = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          const newStreak = s.profile.lastActiveDate === yd ? s.profile.streak + 1 : 1;
          return { profile: { ...s.profile, streak: newStreak, lastActiveDate: today } };
        }),
      adjustStyle: (which, delta) =>
        set((s) => ({
          profile: {
            ...s.profile,
            style: {
              ...s.profile.style,
              [which]: Math.max(0, Math.min(1, s.profile.style[which] + delta)),
            },
          },
        })),

      // ---- Subjects ----
      subjects: seedSubjects(),
      collections: seedCollections(),

      createSubject: (data) => {
        const id = `subj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((s) => ({
          subjects: [
            ...s.subjects,
            {
              ...data,
              id,
              position: s.subjects.length,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        }));
        return id;
      },
      updateSubject: (id, data) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === id ? { ...sub, ...data, updatedAt: Date.now() } : sub,
          ),
        })),
      deleteSubject: (id) =>
        set((s) => ({
          subjects: s.subjects.filter((sub) => sub.id !== id),
          concepts: s.concepts.map((c) => (c.subjectId === id ? { ...c, subjectId: null } : c)),
        })),
      archiveSubject: (id) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === id ? { ...sub, archived: true, updatedAt: Date.now() } : sub,
          ),
        })),
      unarchiveSubject: (id) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === id ? { ...sub, archived: false, updatedAt: Date.now() } : sub,
          ),
        })),
      duplicateSubject: (id) => {
        const newId = `subj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((s) => {
          const original = s.subjects.find((sub) => sub.id === id);
          if (!original) return s;
          const copy: Subject = {
            ...original,
            id: newId,
            name: `${original.name} (copy)`,
            pinned: false,
            position: s.subjects.length,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          // Duplicate concepts belonging to this subject
          const newConcepts = s.concepts
            .filter((c) => c.subjectId === id)
            .map((c) => ({
              ...c,
              id: `${c.id}-copy-${Math.random().toString(36).slice(2, 5)}`,
              subjectId: newId,
              reviews: 0,
              strength: 0.1,
              stability: 1,
            }));
          return {
            subjects: [...s.subjects, copy],
            concepts: [...s.concepts, ...newConcepts],
          };
        });
        return newId;
      },
      pinSubject: (id) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === id ? { ...sub, pinned: true, updatedAt: Date.now() } : sub,
          ),
        })),
      unpinSubject: (id) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === id ? { ...sub, pinned: false, updatedAt: Date.now() } : sub,
          ),
        })),
      reorderSubjects: (from, to) =>
        set((s) => {
          const list = [...s.subjects];
          const [moved] = list.splice(from, 1);
          list.splice(to, 0, moved);
          return { subjects: list.map((sub, i) => ({ ...sub, position: i })) };
        }),
      moveSubjectToCollection: (subjectId, collectionId) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, collectionId, updatedAt: Date.now() }
              : sub,
          ),
        })),

      // ---- Collections ----
      createCollection: (data) => {
        const id = `col-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((s) => ({
          collections: [
            ...s.collections,
            { ...data, id, position: s.collections.length, createdAt: Date.now() },
          ],
        }));
        return id;
      },
      updateCollection: (id, data) =>
        set((s) => ({
          collections: s.collections.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteCollection: (id) =>
        set((s) => ({
          collections: s.collections.filter((c) => c.id !== id),
          subjects: s.subjects.map((sub) =>
            sub.collectionId === id ? { ...sub, collectionId: null } : sub,
          ),
        })),
      reorderCollections: (from, to) =>
        set((s) => {
          const list = [...s.collections];
          const [moved] = list.splice(from, 1);
          list.splice(to, 0, moved);
          return { collections: list.map((c, i) => ({ ...c, position: i })) };
        }),

      concepts: seedConcepts(),
      setConcepts: (c) => set({ concepts: c }),
      reinforceConcept: (id, quality = 0.7) =>
        set((s) => ({
          concepts: s.concepts.map((c) => (c.id === id ? reinforce(c, quality) : c)),
        })),
      weakenConcept: (id) =>
        set((s) => ({ concepts: s.concepts.map((c) => (c.id === id ? weaken(c) : c)) })),
      addConcept: (c) => set((s) => ({ concepts: [...s.concepts, c] })),
      updateConceptSubject: (conceptId, subjectId) =>
        set((s) => ({
          concepts: s.concepts.map((c) =>
            c.id === conceptId ? { ...c, subjectId } : c,
          ),
        })),

      missions: seedMissions(),
      completeMission: (id) =>
        set((s) => {
          const mission = s.missions.find((m) => m.id === id);
          if (!mission || mission.done) return s;
          return {
            missions: s.missions.map((m) => (m.id === id ? { ...m, done: true, progress: 1 } : m)),
            profile: { ...s.profile, xp: s.profile.xp + mission.xp },
          };
        }),
      setMissionProgress: (id, progress) =>
        set((s) => ({
          missions: s.missions.map((m) => (m.id === id ? { ...m, progress } : m)),
        })),

      sessionMinutes: 0,
      addSessionMinutes: (m) => set((s) => ({ sessionMinutes: s.sessionMinutes + m })),

      chatHistory: [],
      activeChatId: null,
      createChat: () => {
        const id = `chat-${Date.now()}`;
        set((s) => ({
          chatHistory: [
            { id, messages: [], title: "New conversation", updatedAt: Date.now() },
            ...s.chatHistory,
          ],
          activeChatId: id,
        }));
        return id;
      },
      appendChatMessage: (chatId, role, content) =>
        set((s) => ({
          chatHistory: s.chatHistory.map((c) => {
            if (c.id !== chatId) return c;
            const msgs = [...c.messages, { role, content, ts: Date.now() }];
            const title =
              c.title === "New conversation" && role === "user"
                ? content.slice(0, 48)
                : c.title;
            return { ...c, messages: msgs, title, updatedAt: Date.now() };
          }),
        })),
      setActiveChat: (id) => set({ activeChatId: id }),
      deleteChat: (id) =>
        set((s) => ({
          chatHistory: s.chatHistory.filter((c) => c.id !== id),
          activeChatId: s.activeChatId === id ? null : s.activeChatId,
        })),

      achievements: defaultAchievements,
      unlockAchievement: (id) =>
        set((s) => ({
          achievements: s.achievements.map((a) =>
            a.id === id && a.unlockedAt == null ? { ...a, unlockedAt: Date.now() } : a,
          ),
        })),

      // ---- API Keys ----
      apiKeys: [],
      addApiKey: (data) => {
        const id = `key-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((s) => {
          // If this is the first key, make it active
          const isActive = s.apiKeys.length === 0;
          const newKeys = s.apiKeys.map((k) => ({ ...k, isActive: false }));
          return {
            apiKeys: [...newKeys, { ...data, id, createdAt: Date.now(), isActive }],
          };
        });
        return id;
      },
      removeApiKey: (id) =>
        set((s) => {
          const removed = s.apiKeys.find((k) => k.id === id);
          const remaining = s.apiKeys.filter((k) => k.id !== id);
          // If we removed the active key, promote the first remaining
          if (removed?.isActive && remaining.length > 0) {
            remaining[0].isActive = true;
          }
          return { apiKeys: remaining };
        }),
      setActiveApiKey: (id) =>
        set((s) => ({
          apiKeys: s.apiKeys.map((k) => ({ ...k, isActive: k.id === id })),
        })),
      clearActiveApiKey: () =>
        set((s) => ({
          apiKeys: s.apiKeys.map((k) => ({ ...k, isActive: false })),
        })),
      updateApiKey: (id, data) =>
        set((s) => ({
          apiKeys: s.apiKeys.map((k) => (k.id === id ? { ...k, ...data } : k)),
        })),
      getActiveApiKey: () => {
        const state = useEcho.getState();
        return state.apiKeys.find((k) => k.isActive) ?? null;
      },
    }),
    {
      name: "secondbrain-state-v3",
      partialize: (s) => ({
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
        apiKeys: s.apiKeys,
      }),
    },
  ),
);

/** Selectors */
export const selectLevel = () => {
  const xp = useEcho.getState().profile.xp;
  return levelFromXp(xp);
};

export const selectRetention = (id: string) => {
  const c = useEcho.getState().concepts.find((x) => x.id === id);
  if (!c) return 0;
  return currentRetention(c);
};
