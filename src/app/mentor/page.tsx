"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Send,
  Plus,
  Trash2,
  Sparkles,
  Volume2,
  Mic,
  Lightbulb,
  BookMarked,
  MessageCircle,
  Settings,
} from "lucide-react";
import { EchoMindIcon } from "@/components/echomind-icon";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useEcho } from "@/lib/store";
import { mentorReply, detectConcepts, type MentorMessage } from "@/lib/ai-engine";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { cn, pick } from "@/lib/utils";

const SUGGESTIONS = [
  "Explain machine learning",
  "Help me understand recursion",
  "Walk me through attention mechanisms",
  "What is dynamic programming?",
  "Teach me neural networks from scratch",
];

export default function MentorPage() {
  const chatHistory = useEcho((s) => s.chatHistory);
  const activeChatId = useEcho((s) => s.activeChatId);
  const createChat = useEcho((s) => s.createChat);
  const appendChatMessage = useEcho((s) => s.appendChatMessage);
  const setActiveChat = useEcho((s) => s.setActiveChat);
  const deleteChat = useEcho((s) => s.deleteChat);
  const reinforceConcept = useEcho((s) => s.reinforceConcept);
  const addXp = useEcho((s) => s.addXp);
  const concepts = useEcho((s) => s.concepts);
  const adjustStyle = useEcho((s) => s.adjustStyle);
  const activeApiKey = useEcho((s) => s.apiKeys.find((k) => k.isActive));
  const updateApiKey = useEcho((s) => s.updateApiKey);

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = chatHistory.find((c) => c.id === activeChatId) ?? null;

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages.length, isThinking]);

  // Create initial chat
  useEffect(() => {
    if (chatHistory.length === 0) {
      createChat();
    } else if (!activeChatId) {
      setActiveChat(chatHistory[0].id);
    }
  }, []);

  const sendMessage = async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || !activeChat) return;

    appendChatMessage(activeChat.id, "user", msgText);
    setInput("");
    setIsThinking(true);
    adjustStyle("reading", 0.02);

    try {
      let replyText: string;
      let replyKind: MentorMessage["kind"] = "question";
      let replyConcepts: string[] = [];

      if (activeApiKey) {
        // Use real AI API
        const messages = activeChat.messages.map((m) => ({
          role: m.role === "mentor" ? "assistant" : "user",
          content: m.content,
        }));
        messages.push({ role: "user", content: msgText });

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages,
            apiKey: activeApiKey.key,
            provider: activeApiKey.provider,
            model: activeApiKey.model,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "API request failed");
        }

        const data = await res.json();
        replyText = data.content;
        replyKind = "explanation";

        // Update last used timestamp
        updateApiKey(activeApiKey.id, { lastUsed: Date.now() });
      } else {
        // Fall back to local Socratic engine
        const thinkMs = 700 + Math.random() * 900;
        await new Promise((resolve) => setTimeout(resolve, thinkMs));

        const historyForEngine: MentorMessage[] = (
          chatHistory.find((c) => c.id === activeChatId)!.messages ?? []
        ).concat({ role: "user", content: msgText, ts: Date.now() }).map((m) => ({
          role: m.role,
          content: m.content,
          ts: m.ts,
        }));

        const reply = mentorReply(historyForEngine, msgText);
        replyText = reply.message;
        replyKind = reply.kind;
        replyConcepts = reply.concepts;
      }

      appendChatMessage(activeChat.id, "mentor", replyText);
      setIsThinking(false);

      // Update cognitive state
      const detectedConcepts = detectConcepts(
        msgText + " " + replyText,
        concepts.map((c) => c.id),
      );
      detectedConcepts.forEach((id) => reinforceConcept(id, 0.6));
      if (replyKind === "explanation") {
        addXp(25);
        detectedConcepts.forEach((id) => reinforceConcept(id, 0.3));
      } else {
        addXp(8);
      }
    } catch (error: any) {
      appendChatMessage(
        activeChat.id,
        "mentor",
        `I encountered an error: ${error.message}. Please check your API key in Settings.`,
      );
      setIsThinking(false);
    }
  };

  const conceptCount = useMemo(() => {
    if (!activeChat) return 0;
    const all = activeChat.messages.map((m) => m.content).join(" ");
    return detectConcepts(all, concepts.map((c) => c.id)).length;
  }, [activeChat, concepts]);

  return (
    <AppShell>
      <div className="flex h-screen">
        {/* Sidebar: chat history */}
        <aside className="hidden md:flex flex-col w-72 p-4 border-r border-white/5">
          <div className="flex items-center justify-between mb-4 px-2">
            <div>
              <div className="text-sm font-semibold">Conversations</div>
              <div className="text-[10px] text-ink-400">{chatHistory.length} sessions</div>
            </div>
            <button
              onClick={() => createChat()}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
              title="New conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                  chat.id === activeChatId
                    ? "bg-white/[0.06] border border-white/10"
                    : "hover:bg-white/[0.03]",
                )}
                onClick={() => setActiveChat(chat.id)}
              >
                <MessageCircle className="w-4 h-4 text-violet-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{chat.title}</div>
                  <div className="text-[10px] text-ink-400 truncate">
                    {chat.messages.length} messages
                  </div>
                </div>
                {chatHistory.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 glass rounded-2xl p-4 text-xs">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-300" />
              <div className="font-medium">Socratic rule</div>
            </div>
            <p className="text-ink-400 leading-relaxed">
              I'll never give you the answer directly. First, I'll ask you questions. Think before
              you type — I'm tracking how you reason.
            </p>
          </div>
        </aside>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 glass">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center">
                  <EchoMindIcon size={20} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-ink-900" />
              </div>
              <div>
                <div className="text-sm font-semibold">Echo — Your AI Mentor</div>
                {!activeApiKey && (
                  <div className="text-[11px] text-violet-300 mt-0.5">
                    Add API key in <Link href="/settings" className="underline hover:text-violet-200">Settings</Link> for real AI responses →
                  </div>
                )}
                {activeApiKey && (
                  <div className="text-[11px] text-emerald-300 mt-0.5">
                    AI connected · Ready to learn
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:border-violet-500/40">
                <Volume2 className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:border-violet-500/40">
                <Mic className="w-4 h-4" />
              </button>
              <Link
                href="/settings"
                className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:border-violet-500/40"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </header>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            {(!activeChat || activeChat.messages.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative mb-10"
                >
                  {/* Background glow */}
                  <div className="absolute inset-0 w-[140px] h-[140px] mx-auto rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 blur-3xl opacity-50" />
                  {/* Icon container */}
                  <div className="relative w-[100px] h-[100px] md:w-[120px] md:h-[120px] mx-auto rounded-[2.5rem] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 p-[4px] shadow-2xl shadow-violet-500/40">
                    <EchoMindIcon size={64} />
                  </div>
                </motion.div>
                <h2 className="text-3xl font-semibold tracking-tight mb-3">
                  I'm <span className="text-gradient italic" style={{ fontFamily: "'Instrument Serif', serif" }}>Echo</span>.
                </h2>
                <p className="text-ink-300 max-w-lg leading-relaxed">
                  I'm not here to give you answers. I'm here to ask the questions that unlock understanding.
                  Pick a topic below, or just start typing.
                </p>

                <div className="mt-8 grid sm:grid-cols-2 gap-2 w-full max-w-xl">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="group glass rounded-2xl p-4 text-left text-sm hover:border-violet-500/40 transition-all flex items-center gap-3"
                    >
                      <Sparkles className="w-4 h-4 text-violet-300 shrink-0" />
                      <span className="flex-1">{s}</span>
                      <BookMarked className="w-3.5 h-3.5 text-ink-400 group-hover:text-white transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {activeChat.messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} />
                ))}
                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center shrink-0">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div className="glass rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-violet-300"
                          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/5 p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
              <div className="glass-strong rounded-2xl p-2 flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask, question, or teach me something..."
                  rows={1}
                  className="flex-1 bg-transparent resize-none px-3 py-2.5 text-sm outline-none placeholder:text-ink-400 max-h-40"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isThinking}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0",
                    input.trim() && !isThinking
                      ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:scale-105"
                      : "bg-white/5 opacity-40",
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[10px] text-ink-400 mt-2 text-center">
                Echo learns from every message. Be honest about what you don't know — it helps me teach.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MessageBubble({ msg }: { msg: { role: "user" | "mentor"; content: string; ts: number } }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "")}
    >
      {isUser ? (
        <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shrink-0 text-xs font-semibold">
          Me
        </div>
      ) : (
        <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center shrink-0">
          <Brain className="w-5 h-5 text-white" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 border border-violet-500/30 rounded-tr-md"
            : "glass rounded-tl-md",
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{msg.content}</div>
        ) : (
          <MarkdownRenderer content={msg.content} />
        )}
      </div>
    </motion.div>
  );
}
