/**
 * Local Socratic AI engine.
 *
 * This is a rule-based cognitive mentor that emulates the SecondBrain AI locally.
 * It never gives the full answer immediately — it probes, scaffolds, and
 * reveals understanding in stages. In production this layer sits in front of
 * an LLM with access to the learner's cognitive profile and knowledge graph.
 */

import { pick } from "./utils";

export interface MentorMessage {
  role: "user" | "mentor";
  content: string;
  kind?: "question" | "explanation" | "challenge" | "praise" | "plan";
  concepts?: string[];
  ts: number;
}

interface TopicKit {
  keywords: string[];
  opener: string;          // first socratic question
  followUps: string[];     // probing questions
  analogy: string;         // "explain like..." story
  core: string;            // the actual explanation
  connections: string[];   // concept ids
}

const TOPICS: TopicKit[] = [
  {
    keywords: ["machine learning", "ml", "machine-learning"],
    opener:
      "Interesting. Before I say anything — what do you think the word 'learning' actually means when a machine does it?",
    followUps: [
      "Good. Now — when a human learns, what actually changes inside them?",
      "Right. So if a machine has no brain, what could it change instead?",
    ],
    analogy:
      "Picture a child who has never tasted a lemon. You hand them one. They taste it, wince, and write 'lemon = sour' in a notebook. Next time they see a lemon, they remember. That notebook is the model. The tasting is the data. And the wince — that's the loss function telling them to update.",
    core:
      "Machine learning is the science of getting computers to improve at a task through experience, without being explicitly programmed. We give the system data, a way to measure its mistakes (loss), and an algorithm to adjust its internal parameters (weights) so the mistakes shrink.",
    connections: ["ml", "neural", "probability"],
  },
  {
    keywords: ["recursion"],
    opener:
      "Let's begin with the simplest version: what does it mean for something to contain a smaller copy of itself?",
    followUps: [
      "Exactly. Now — if a function calls itself, what must be true to stop it from running forever?",
      "Precisely — that stopping condition has a name. What do we call it?",
    ],
    analogy:
      "Recursion is like Russian nesting dolls. To understand the biggest doll, you open it and find a smaller doll inside. To understand that one, you open it again — until you reach the tiniest doll that doesn't open. That tiny doll is the base case.",
    core:
      "Recursion is a function that solves a problem by solving a smaller version of the same problem. Every recursive function needs two things: a base case that stops the recursion, and a recursive step that moves toward the base case.",
    connections: ["recursion", "functions", "dp"],
  },
  {
    keywords: ["neural network", "neural networks", "deep learning"],
    opener:
      "Neural networks. Let's rewind first — in your own words, what is a neuron doing when it 'fires'?",
    followUps: [
      "Good. Now imagine thousands of these neurons wired together in layers. What happens to a signal as it passes through each layer?",
      "Right. And if we want the network to produce the right answer, what must we adjust?",
    ],
    analogy:
      "A neural network is like a committee of experts making a decision. The first layer looks at tiny details — edges, colors. The next layer combines those into shapes. The next into objects. By the final layer, the committee has a confident answer. But the committee only gets wise after being corrected thousands of times.",
    core:
      "A neural network is a stack of layers of simple computations (weighted sums + non-linearities). Data flows forward; errors flow backward. By repeatedly adjusting the weights to reduce error, the network learns to map inputs to outputs.",
    connections: ["neural", "backprop", "attention"],
  },
  {
    keywords: ["attention", "transformer"],
    opener:
      "Attention. Let's start concrete — when you read a sentence, how do you know which word matters most for understanding the next one?",
    followUps: [
      "Right — you weigh relationships. Now — how would a machine, which just sees a list of tokens, learn those weights?",
      "Exactly. Those learned weights are called attention scores. And what do you think 'self-attention' means?",
    ],
    analogy:
      "Attention is like a spotlight on a stage. When an actor speaks, the spotlight moves to highlight the words that matter most for the next line. In a transformer, every word shines its own spotlight on every other word and learns where to look.",
    core:
      "Attention lets a model weigh the relevance of each piece of input to every other piece. Self-attention computes, for each token, a weighted sum over all tokens — making relationships explicit, regardless of distance.",
    connections: ["attention", "llm", "embeddings"],
  },
  {
    keywords: ["dynamic programming", "dp"],
    opener:
      "Dynamic programming. To start: if you've solved a hard problem once, and a similar problem shows up — what do you do?",
    followUps: [
      "Exactly — you reuse the work. Now — when can we safely reuse a past answer?",
      "Right. That property — breaking a problem into independent subproblems — has a name. What is it?",
    ],
    analogy:
      "Dynamic programming is like climbing a mountain by remembering every rest stop. You don't re-climb the same section — you write down how to get there the first time, and reuse that note forever.",
    core:
      "Dynamic programming solves hard problems by breaking them into overlapping subproblems, solving each once, and storing the result. The two key properties are optimal substructure and overlapping subproblems.",
    connections: ["dp", "recursion", "graphs"],
  },
  {
    keywords: ["graph", "graphs"],
    opener:
      "A graph. Before I define it — what do a subway map, a family tree, and a social network have in common?",
    followUps: [
      "Right — they're all about relationships between things. Now — what are the two fundamental parts of any graph?",
      "Precisely. Nodes and edges. Now, what's the difference between a directed and undirected graph?",
    ],
    analogy:
      "A graph is just a bunch of islands (nodes) connected by bridges (edges). Some bridges only go one way (directed). The whole world of graph algorithms is just asking questions like: can I get from island A to island B? What's the shortest path? Which islands are most central?",
    core:
      "A graph is a mathematical structure made of vertices (nodes) and edges (connections). It's the universal model for anything with relationships — maps, networks, dependencies, hierarchies.",
    connections: ["graphs", "dp", "recursion"],
  },
  {
    keywords: ["llm", "language model", "gpt"],
    opener:
      "Let's think about this from scratch. When you predict the next word in a sentence, what are you actually doing?",
    followUps: [
      "Right — you're using everything before it. Now — what's the difference between predicting the next word and understanding language?",
      "Interesting. Many people would disagree. What evidence would change your mind?",
    ],
    analogy:
      "A large language model is like someone who has read almost the entire internet. They can finish your sentences because they've seen similar patterns billions of times. Whether that's understanding is a philosophical question — but the results are undeniable.",
    core:
      "A large language model is a transformer trained to predict the next token given the previous ones, at massive scale. The same next-token objective, scaled up with enough data and parameters, produces emergent abilities: reasoning, coding, dialogue, translation.",
    connections: ["llm", "attention", "embeddings"],
  },
];

const DEFAULT: TopicKit = {
  keywords: [],
  opener:
    "Tell me more. What's the question you're actually trying to answer, not just the one you typed?",
  followUps: [
    "Good. Now — what do you already believe about this, before I say anything?",
    "Interesting. What would make you change your mind?",
  ],
  analogy:
    "Let me give you a picture. Most ideas in this world are just new arrangements of old ideas. If we find the right analogy, the new one feels familiar.",
  core:
    "Here's the heart of it, in plain language. Once we have the picture, the details are much easier to place.",
  connections: [],
};

function findTopic(input: string): TopicKit {
  const lower = input.toLowerCase();
  const match = TOPICS.find((t) => t.keywords.some((k) => lower.includes(k)));
  return match ?? DEFAULT;
}

export interface MentorTurn {
  message: string;
  kind: MentorMessage["kind"];
  concepts: string[];
}

/**
 * Generate the mentor's reply given the full conversation history and a
 * freshly-detected topic. The engine never repeats itself — it walks through
 * the socratic progression: opener → follow-ups → analogy → core.
 */
export function mentorReply(history: MentorMessage[], currentInput: string): MentorTurn {
  const userTurns = history.filter((m) => m.role === "user");
  const mentorTurns = history.filter((m) => m.role === "mentor");

  const topic = findTopic(currentInput);
  const stage = Math.min(mentorTurns.length, 3);

  if (userTurns.length === 1 && mentorTurns.length === 0) {
    return {
      message: topic.opener,
      kind: "question",
      concepts: topic.connections,
    };
  }

  if (stage === 1) {
    return {
      message: `${pick(["Good.", "Interesting.", "Let's go further."])} ${topic.followUps[0]}`,
      kind: "question",
      concepts: topic.connections,
    };
  }

  if (stage === 2) {
    return {
      message: `${topic.followUps[1] ?? topic.followUps[0]}`,
      kind: "question",
      concepts: topic.connections,
    };
  }

  // Stage 3+: reward, then teach via analogy + core explanation.
  return {
    message: `${topic.analogy}\n\n${topic.core}`,
    kind: "explanation",
    concepts: topic.connections,
  };
}

/**
 * Detect which concepts the user is reasoning about from a message.
 * Very lightweight keyword approach — in production this is an embedding match.
 */
export function detectConcepts(input: string, allConceptIds: string[]): string[] {
  const lower = input.toLowerCase();
  const hits: string[] = [];
  const keywordMap: Record<string, string[]> = {
    ml: ["machine learning", "ml"],
    neural: ["neural", "deep learning"],
    attention: ["attention", "transformer"],
    llm: ["llm", "gpt", "language model"],
    recursion: ["recursion", "recursive"],
    dp: ["dynamic programming", "dp"],
    graphs: ["graph", "graphs"],
    variables: ["variable"],
    functions: ["function"],
    loops: ["loop", "for ", "while "],
    arrays: ["array"],
    objects: ["object"],
    backprop: ["backprop"],
    embeddings: ["embedding"],
    calculus: ["calculus", "derivative", "integral"],
    linalg: ["linear algebra", "matrix", "vector"],
    probability: ["probability", "distribution"],
    programming: ["programming", "coding", "code"],
    physics: ["physics"],
    biology: ["biology"],
  };
  for (const id of allConceptIds) {
    const kws = keywordMap[id];
    if (kws && kws.some((k) => lower.includes(k))) hits.push(id);
  }
  return hits;
}

/**
 * Generate a flashcard for a concept. Returns Q + A.
 */
export function makeFlashcard(conceptName: string): { q: string; a: string } {
  const cards: Record<string, { q: string; a: string }> = {
    "Machine Learning": {
      q: "What is machine learning, in one sentence?",
      a: "Getting computers to improve at a task through experience, without being explicitly programmed.",
    },
    "Neural Networks": {
      q: "What are the two directions that information flows during training?",
      a: "Forward (predictions) and backward (gradients).",
    },
    "Recursion": {
      q: "What two things must every recursive function have?",
      a: "A base case and a recursive step that moves toward it.",
    },
    "Attention": {
      q: "What does self-attention compute?",
      a: "For each token, a weighted sum over all tokens — making relationships explicit.",
    },
    "Dynamic Programming": {
      q: "Name the two key properties that make DP applicable.",
      a: "Optimal substructure and overlapping subproblems.",
    },
  };
  return (
    cards[conceptName] ?? {
      q: `In your own words, what is ${conceptName}?`,
      a: `Write a one-sentence definition of ${conceptName}.`,
    }
  );
}

/**
 * Generate a short Socratic quiz question on a concept.
 */
export function makeQuizQuestion(conceptName: string): {
  q: string;
  options: string[];
  correct: number;
} {
  const qMap: Record<string, { q: string; options: string[]; correct: number }> = {
    "Machine Learning": {
      q: "Which of these is the closest to the definition of machine learning?",
      options: [
        "Hard-coding rules to solve a problem",
        "Improving at a task through experience",
        "Memorizing training examples perfectly",
        "Writing faster loops",
      ],
      correct: 1,
    },
    "Recursion": {
      q: "What prevents infinite recursion?",
      options: ["A loop", "A base case", "A return statement", "A type annotation"],
      correct: 1,
    },
    "Attention": {
      q: "Self-attention computes, for each token:",
      options: [
        "Its own hash",
        "A weighted sum over all tokens",
        "Its position in the sequence",
        "The previous token only",
      ],
      correct: 1,
    },
  };
  return (
    qMap[conceptName] ?? {
      q: `Which statement best captures ${conceptName}?`,
      options: [
        `It is unrelated to the topic`,
        `It is a precise way to frame the core idea`,
        `It is purely decorative`,
        `It is only useful in one language`,
      ],
      correct: 1,
    }
  );
}
