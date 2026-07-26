import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

/**
 * Persistence layer for EchoMind.
 *
 * The learner's universe is organized as:
 *   Collection (folder)  ──▶  Subject (topic area, e.g. "Organic Chemistry")
 *                              ──▶  Concept (knowledge node, tracked cognitively)
 *
 * Everything is user-owned and fully mutable. The platform ships with suggested
 * seed subjects on first login, but the learner can delete, rename, archive,
 * duplicate, recolor, re-cover, pin, reorder, and regroup all of them.
 */

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
});

export const cognitiveProfiles = pgTable("cognitive_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  learningSpeed: real("learning_speed").notNull(),
  memoryStrength: real("memory_strength").notNull(),
  attentionSpan: integer("attention_span").notNull(),
  confidence: real("confidence").notNull(),
  curiosityIndex: real("curiosity_index").notNull(),
  criticalThinking: real("critical_thinking").notNull(),
  styleVisual: real("style_visual").notNull(),
  styleReading: real("style_reading").notNull(),
  styleListening: real("style_listening").notNull(),
  styleHandsOn: real("style_hands_on").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Collections group subjects into user-defined folders.
 * Think: "Semester 1", "Medical Boards", "Side Projects", "Languages".
 */
export const collections = pgTable("collections", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  position: integer("position").notNull(),
  archived: boolean("archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Subjects are the learner's top-level containers of knowledge.
 * A subject can be "Machine Learning", "Bar Exam Prep", "Japanese N3", etc.
 */
export const subjects = pgTable("subjects", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  cover: text("cover"), // gradient key or image URL
  description: text("description"),
  pinned: boolean("pinned").default(false).notNull(),
  archived: boolean("archived").default(false).notNull(),
  position: integer("position").notNull(),
  collectionId: text("collection_id").references(() => collections.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Concepts are the atomic knowledge nodes inside a subject.
 * Each has its own forgetting-curve state.
 */
export const concepts = pgTable("concepts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subjectId: text("subject_id").references(() => subjects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  strength: real("strength").notNull(),
  stability: real("stability").notNull(),
  lastReview: timestamp("last_review").notNull(),
  reviews: integer("reviews").default(0).notNull(),
  difficulty: real("difficulty").notNull(),
  color: text("color").notNull(),
  connections: jsonb("connections").$type<string[]>().default([]).notNull(),
});

export const learningSessions = pgTable("learning_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subjectId: text("subject_id"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  minutes: integer("minutes").default(0).notNull(),
  topic: text("topic"),
  xpEarned: integer("xp_earned").default(0).notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  chatId: text("chat_id").notNull(),
  role: text("role").notNull(), // user | mentor
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subjectId: text("subject_id"),
  conceptId: text("concept_id"),
  score: real("score").notNull(),
  attempts: integer("attempts").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const flashcardReviews = pgTable("flashcard_reviews", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  conceptId: text("concept_id").notNull(),
  quality: real("quality").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subjectId: text("subject_id"),
  kind: text("kind").notNull(), // pdf | youtube | url | image
  source: text("source").notNull(),
  title: text("title"),
  summary: text("summary"),
  conceptsJson: jsonb("concepts_json").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  unlockedAt: timestamp("unlocked_at"),
  legacy: boolean("legacy").default(false).notNull(),
});
