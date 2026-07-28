"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Send,
  Sparkles,
  Volume2,
  Mic,
  Settings,
  Loader2,
} from "lucide-react";
import { EchoMindIcon } from "./echomind-icon";
import { MarkdownRenderer } from "./markdown-renderer";
import { cn } from "@/lib/utils";
import { Subject, getSubjectDisplay } from "@/lib/promptAgent";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface SubjectChatProps {
  subject: Subject;
  apiKey: string;
  model?: string;
  onSettingsClick?: () => void;
  className?: string;
}

const SUGGESTIONS = [
  "Explain the core concepts",
  "Help me understand the fundamentals",
  "What should I learn first?",
  "Give me a practice problem",
];

/**
 * SubjectChat Component
 * 
 * A subject-isolated chat interface that:
 * 1. Clears messages when subject.id changes
 * 2. Sends full subject context to AI agent for topic isolation
 * 3. Prevents context bleeding between different subjects
 * 4. Has proper timeout handling to prevent infinite loading
 */
export function SubjectChat({
  subject,
  apiKey,
  model = "gemini-1.5-flash",
  onSettingsClick,
  className,
}: SubjectChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const previousSubjectId = useRef<string>(subject.id);
  const subjectDisplay = getSubjectDisplay(subject);

  // Clear messages when subject changes - STRICT ISOLATION
  useEffect(() => {
    if (previousSubjectId.current !== subject.id) {
      setMessages([]);
      setInput("");
      setError(null);
      previousSubjectId.current = subject.id;
    }
  }, [subject.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isThinking]);

  const sendMessage = async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || isThinking) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: msgText,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsThinking(true);

    // AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      // Retry logic for 503 errors
      const maxRetries = 3;
      const retryDelay = 2000; // 2 seconds

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Prepare chat history for API - STRICT ISOLATION: only current subject's messages
          const history = messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));

          // Call AI agent with subject context for strict domain locking
          const response = await fetch("/api/agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subject,
              prompt: msgText,
              history,
              apiKey,
              model,
            }),
            signal: controller.signal,
          });

          if (!response.ok) {
            const data = await response.json();
            
            // If 503 error and not last attempt, retry
            if (response.status === 503 && attempt < maxRetries) {
              console.log(`Attempt ${attempt} failed with 503, retrying in ${retryDelay}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              continue;
            }
            
            throw new Error(data.error || "Failed to get AI response");
          }

          const data = await response.json();
          
          // Add assistant response
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: data.content,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          
          // Success - exit retry loop
          return;

        } catch (err: any) {
          // If this is the last attempt, show error
          if (attempt === maxRetries) {
            let errorMessage = err.message || "Failed to send message";
            
            // Handle timeout specifically
            if (err.name === 'AbortError' || errorMessage.includes('abort')) {
              errorMessage = "Request timed out. The AI service is taking too long to respond. Please try again.";
            }
            
            // Add helpful suggestions for 503 errors
            if (errorMessage.includes("503") || errorMessage.includes("high demand")) {
              errorMessage += "\n\n💡 Try switching to 'gemini-1.5-flash' or 'gemini-1.5-pro' in Settings for better availability.";
            }
            
            setError(errorMessage);
            console.error("Chat error:", err);
          }
        }
      }
    } finally {
      // Always clear timeout and reset loading state
      clearTimeout(timeoutId);
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 glass">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: subject.color || "#8b5cf6" }}
            >
              <span className="text-white font-semibold">
                {subject.title.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-ink-900" />
          </div>
          <div>
            <div className="text-sm font-semibold">{subject.title}</div>
            <div className="text-[11px] text-ink-400 mt-0.5">
              {subject.description || "Subject-specific AI tutor"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:border-violet-500/40"
            title="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:border-violet-500/40"
            title="Text-to-speech"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:border-violet-500/40"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-6"
      >
        {messages.length === 0 && !error ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mb-10"
            >
              {/* Background glow */}
              <div
                className="absolute inset-0 w-[140px] h-[140px] mx-auto rounded-full blur-3xl opacity-50"
                style={{
                  background: `linear-gradient(to bottom right, ${subject.color || "#8b5cf6"}, #f472b6)`,
                }}
              />
              {/* Icon container */}
              <div
                className="relative w-[100px] h-[100px] md:w-[120px] md:h-[120px] mx-auto rounded-[2.5rem] p-[4px] shadow-2xl"
                style={{
                  background: `linear-gradient(to bottom right, ${subject.color || "#8b5cf6"}, #f472b6)`,
                }}
              >
                <div className="w-full h-full rounded-[2rem] bg-ink-900 flex items-center justify-center">
                  <Brain className="w-12 h-12 text-white" />
                </div>
              </div>
            </motion.div>
            <h2 className="text-3xl font-semibold tracking-tight mb-3">
              Learn <span className="text-gradient">{subject.title}</span>
            </h2>
            <p className="text-ink-300 max-w-lg leading-relaxed mb-8">
              {subject.description || `I'm your AI tutor for ${subject.title}. Ask me anything about this subject.`}
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
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
            </AnimatePresence>
            
            {isThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <div
                  className="w-8 h-8 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: `linear-gradient(to bottom right, ${subject.color || "#8b5cf6"}, #f472b6)`,
                  }}
                >
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

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
                  <Settings className="w-5 h-5 text-rose-400" />
                </div>
                <div className="glass rounded-2xl rounded-tl-md px-4 py-3 text-rose-300 text-sm">
                  {error}
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
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${subject.title}...`}
              rows={1}
              disabled={isThinking}
              className="flex-1 bg-transparent resize-none px-3 py-2.5 text-sm outline-none placeholder:text-ink-400 max-h-40 disabled:opacity-50"
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
              {isThinking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="text-[10px] text-ink-400 mt-2 text-center">
            Responses are strictly isolated to <span className="text-violet-300">{subject.title}</span>. Switch subjects to change context.
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
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
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
    </motion.div>
  );
}
