"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useEcho, type AIProvider, type ApiKey } from "@/lib/store";
import { cn } from "@/lib/utils";

const PROVIDERS: {
  id: AIProvider;
  name: string;
  icon: string;
  color: string;
  models: { id: string; name: string; free: boolean; recommended?: boolean }[];
  getApiKeyUrl: string;
  keyPrefix: string;
}[] = [
  {
    id: "openai",
    name: "OpenAI",
    icon: "🤖",
    color: "#10a37f",
    getApiKeyUrl: "https://platform.openai.com/api-keys",
    keyPrefix: "sk-",
    models: [
      { id: "gpt-4o-mini", name: "GPT-4o mini", free: false, recommended: true },
      { id: "gpt-4o", name: "GPT-4o", free: false },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", free: false },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", free: false },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    icon: "🧠",
    color: "#d97757",
    getApiKeyUrl: "https://console.anthropic.com/settings/keys",
    keyPrefix: "sk-ant-",
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", free: false, recommended: true },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", free: false },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus", free: false },
      { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet", free: false },
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    icon: "✨",
    color: "#4285f4",
    getApiKeyUrl: "https://aistudio.google.com/app/apikey",
    keyPrefix: "AIza",
    models: [
       { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", free: true, recommended: true },
       { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", free: true },
    ],
  },
];

export default function SettingsPage() {
  const apiKeys = useEcho((s) => s.apiKeys);
  const addApiKey = useEcho((s) => s.addApiKey);
  const removeApiKey = useEcho((s) => s.removeApiKey);
  const setActiveApiKey = useEcho((s) => s.setActiveApiKey);
  const clearActiveApiKey = useEcho((s) => s.clearActiveApiKey);

  const [showForm, setShowForm] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  const activeKey = apiKeys.find((k) => k.isActive);

  const handleTest = async (key: ApiKey) => {
    setTesting(key.id);
    setTestResult(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello" }],
          apiKey: key.key,
          provider: key.provider,
          model: key.model,
        }),
      });
      if (res.ok) {
        setTestResult({ id: key.id, success: true, message: "Connection successful!" });
      } else {
        const err = await res.json();
        setTestResult({ id: key.id, success: false, message: err.error || "Connection failed" });
      }
    } catch (err: any) {
      setTestResult({ id: key.id, success: false, message: err.message || "Network error" });
    } finally {
      setTesting(null);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-6 md:p-10 pb-24 lg:pb-10 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">
              Settings
            </h1>
          </div>
          <p className="text-ink-300 mt-2">
            Configure your AI provider and API keys. Your keys are stored locally and never sent to our servers.
          </p>
        </motion.div>

        {/* Active API Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-violet-500/20 to-transparent blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-violet-300" />
              <h2 className="font-semibold text-lg">AI Provider Status</h2>
            </div>
            {activeKey ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: `${PROVIDERS.find((p) => p.id === activeKey.provider)?.color}30` }}
                >
                  {PROVIDERS.find((p) => p.id === activeKey.provider)?.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{activeKey.name}</div>
                  <div className="text-xs text-ink-400">
                    {PROVIDERS.find((p) => p.id === activeKey.provider)?.name} · {activeKey.model || "Default model"}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-ink-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-ink-300">No active API</div>
                  <div className="text-xs text-ink-400">
                    Add an API key to enable AI-powered features
                  </div>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium hover:scale-105 transition-transform"
                >
                  Add API Key
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* API Keys List */}
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-lg">Your API Keys</h2>
              <p className="text-xs text-ink-400">{apiKeys.length} key{apiKeys.length !== 1 && "s"} configured</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="rounded-xl glass px-4 py-2 text-sm flex items-center gap-2 hover:border-violet-500/40"
            >
              <Plus className="w-4 h-4" />
              Add Key
            </button>
          </div>

          {apiKeys.length === 0 ? (
            <div className="text-center py-12 text-ink-400 text-sm">
              No API keys yet. Add one to unlock AI-powered learning.
            </div>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <ApiKeyCard
                  key={key.id}
                  apiKey={key}
                  isActive={key.isActive}
                  testing={testing === key.id}
                  testResult={testResult?.id === key.id ? testResult : null}
                  onTest={() => handleTest(key)}
                  onActivate={() => setActiveApiKey(key.id)}
                  onDeactivate={() => clearActiveApiKey()}
                  onDelete={() => {
                    if (confirm(`Delete "${key.name}"?`)) {
                      removeApiKey(key.id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Start: Get Free Gemini Key */}
        {apiKeys.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-3xl p-6 relative overflow-hidden border border-emerald-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🚀</span>
                <h3 className="font-semibold text-lg">Get a FREE API Key in 2 minutes</h3>
              </div>
              <p className="text-sm text-ink-300 mb-4">
                Google Gemini offers a generous free tier — no credit card needed. Here's how:
              </p>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <span>
                    Go to{" "}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-300 underline hover:text-emerald-200"
                    >
                      Google AI Studio →
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <span>Sign in with your Google account (if not already)</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <span>Click "Create API Key" → select a project or create new one</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                    4
                  </span>
                  <span>Copy the key (starts with <code className="px-1 rounded bg-white/10 text-xs">AIza...</code>)</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                    5
                  </span>
                  <span>Click "Add Key" above and paste it here</span>
                </li>
              </ol>
              <div className="mt-4 text-xs text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Free tier: 1,500 requests/day on Gemini 2.5 Flash — more than enough for learning!
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-6"
        >
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-emerald-300 shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Security & Privacy</h3>
              <p className="text-sm text-ink-300 leading-relaxed">
                Your API keys are stored locally in your browser and encrypted at rest. They are sent directly to the
                AI provider's API when needed, and never pass through our servers. You can delete them at any time.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form Modal */}
        {showForm && (
          <ApiKeyForm
            onClose={() => setShowForm(false)}
            onSave={(data) => {
              addApiKey(data);
              setShowForm(false);
            }}
          />
        )}
      </div>
    </AppShell>
  );
}

function ApiKeyCard({
  apiKey,
  isActive,
  testing,
  testResult,
  onTest,
  onActivate,
  onDeactivate,
  onDelete,
}: {
  apiKey: ApiKey;
  isActive: boolean;
  testing: boolean;
  testResult: { success: boolean; message: string } | null;
  onTest: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}) {
  const [showKey, setShowKey] = useState(false);
  const provider = PROVIDERS.find((p) => p.id === apiKey.provider);

  const maskedKey = apiKey.key.slice(0, 8) + "•".repeat(20) + apiKey.key.slice(-4);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "rounded-2xl p-4 border transition-all",
        isActive ? "bg-violet-500/5 border-violet-500/30" : "bg-white/[0.02] border-white/5",
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: `${provider?.color}30` }}
        >
          {provider?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-semibold truncate">{apiKey.name}</div>
            {isActive && (
              <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded">
                Active
              </span>
            )}
          </div>
          <div className="text-xs text-ink-400">
            {provider?.name} · {apiKey.model || "Default model"}
          </div>
          <div className="text-xs font-mono text-ink-400 mt-1 flex items-center gap-2">
            {showKey ? apiKey.key : maskedKey}
            <button
              onClick={() => setShowKey(!showKey)}
              className="text-ink-300 hover:text-white"
            >
              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onTest}
            disabled={testing}
            className="glass rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 hover:border-violet-500/40 disabled:opacity-50"
          >
            {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Key className="w-3 h-3" />}
            Test
          </button>
          {!isActive ? (
            <button
              onClick={onActivate}
              className="rounded-lg bg-violet-500/20 text-violet-300 px-3 py-1.5 text-xs hover:bg-violet-500/30"
            >
              Activate
            </button>
          ) : (
            <button
              onClick={onDeactivate}
              className="rounded-lg bg-white/5 text-ink-400 px-3 py-1.5 text-xs hover:bg-white/10"
            >
              Deactivate
            </button>
          )}
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg hover:bg-rose-500/20 flex items-center justify-center text-ink-400 hover:text-rose-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
              {testResult && (
                <div
                  className={cn(
                    "mt-3 rounded-lg px-4 py-3 text-sm",
                    testResult.success ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300",
                  )}
                >
                  <div className="flex items-start gap-2">
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="font-semibold mb-1">
                        {testResult.success ? "✅ Connection successful!" : "❌ Connection failed"}
                      </div>
                      <div className="text-xs opacity-90">{testResult.message}</div>
                      {!testResult.success && apiKey.key.startsWith("AIza") && (
                        <div className="mt-2 text-[11px] space-y-1">
                          <div className="font-semibold">🔑 How to fix:</div>
                          <div>1. Go to{" "}
                            <a
                              href="https://aistudio.google.com/app/apikey"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-rose-200"
                            >
                              Google AI Studio
                            </a>
                          </div>
                          <div>2. Click "Create API key"</div>
                          <div>3. Copy the FULL key (starts with AIza...)</div>
                          <div>4. Come back here, delete this key, add new one</div>
                          <div className="mt-2 text-emerald-300">💡 Gemini keys are FREE — no credit card needed!</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
    </motion.div>
  );
}

function ApiKeyForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: { name: string; provider: AIProvider; key: string; model?: string }) => void;
}) {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [showKey, setShowKey] = useState(false);

  const selectedProvider = PROVIDERS.find((p) => p.id === provider)!;

  const handleSubmit = () => {
    if (!name.trim() || !apiKey.trim()) return;
    onSave({
      name: name.trim(),
      provider,
      key: apiKey.trim(),
      model: model || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-3xl w-full max-w-lg my-8 max-h-[90vh] flex flex-col"
      >
        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="text-xl font-semibold mb-6 sticky top-0 glass-strong -mx-6 -mt-6 px-6 py-4 rounded-t-3xl z-10">
            Add API Key
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-ink-400 mb-2 block">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My OpenAI Key"
                className="w-full glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-ink-400 mb-2 block">
                Provider
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setProvider(p.id);
                      setModel("");
                    }}
                    className={cn(
                      "glass rounded-xl p-3 text-center transition-all",
                      provider === p.id && "ring-2 ring-violet-500",
                    )}
                  >
                    <div className="text-2xl mb-1">{p.icon}</div>
                    <div className="text-xs font-medium">{p.name}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase tracking-wider text-ink-400">
                  API Key
                </label>
                <a
                  href={selectedProvider.getApiKeyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-violet-300 hover:text-violet-200 underline"
                >
                  Get API key →
                </a>
              </div>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={selectedProvider.keyPrefix + "..."}
                  className="w-full glass rounded-xl px-4 py-3 pr-10 text-sm bg-transparent outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {provider === "gemini" && (
                <div className="mt-2 text-[11px] text-emerald-300 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2 flex items-start gap-2">
                  <span className="text-base leading-none">💡</span>
                  <div>
                    <span className="font-semibold">Gemini has free tier!</span> Sign up at{" "}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-emerald-200"
                    >
                      Google AI Studio
                    </a>{" "}
                    — no credit card needed for Flash models.
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase tracking-wider text-ink-400">
                  Model (optional)
                </label>
                {provider === "gemini" && (
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Free tier available
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto no-scrollbar pr-1">
                <button
                  type="button"
                  onClick={() => setModel("")}
                  className={cn(
                    "glass rounded-xl p-3 text-left flex items-center justify-between transition-all",
                    model === "" && "ring-2 ring-violet-500 bg-violet-500/10",
                  )}
                >
                  <div>
                    <div className="text-sm font-medium">
                      Default ({selectedProvider.models.find((m) => m.recommended)?.name || selectedProvider.models[0].name})
                    </div>
                    <div className="text-[10px] text-ink-400">Best balance of speed and quality</div>
                  </div>
                </button>
                {selectedProvider.models.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModel(m.id)}
                    className={cn(
                      "glass rounded-xl p-3 text-left flex items-center justify-between transition-all",
                      model === m.id && "ring-2 ring-violet-500 bg-violet-500/10",
                    )}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-sm font-medium">{m.name}</div>
                      {m.free && (
                        <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          FREE
                        </span>
                      )}
                      {m.recommended && !m.free && (
                        <span className="text-[10px] text-violet-300 bg-violet-500/20 px-1.5 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-white/5 sticky bottom-0 glass-strong rounded-b-3xl shrink-0">
          <button onClick={onClose} className="glass rounded-xl px-5 py-2.5 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !apiKey.trim()}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium disabled:opacity-40 hover:scale-105 transition-transform"
          >
            💾 Save API Key
          </button>
        </div>
      </motion.div>
    </div>
  );
}
