import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateSystemPrompt, generateDefaultSystemPrompt } from "@/lib/promptAgent";

interface AgentRequest {
  subject?: {
    id: string;
    title: string;
    description?: string;
    icon?: string;
    color?: string;
    level?: string;
    topics?: string[];
  };
  prompt: string;
  history: Array<{ role: string; content: string }>;
  apiKey: string;
  model?: string;
}

interface AgentResponse {
  content: string;
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<AgentResponse>> {
  const body: AgentRequest = await req.json();
  
   // Use free-tier Gemini models
   const { subject, prompt, history, apiKey, model } = body;
   const defaultModel = "gemini-2.5-flash";

   console.log("[DEBUG /api/agent] Incoming request:", {
     model: model || defaultModel,
     apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + "..." : "MISSING",
     promptLength: prompt?.length,
     historyLength: history?.length,
   });

  if (!prompt) {
    return NextResponse.json(
      { content: "", error: "Prompt is required" },
      { status: 400 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      { content: "", error: "API key is required" },
      { status: 400 }
    );
  }

  const systemPrompt = subject
    ? generateSystemPrompt(subject)
    : generateDefaultSystemPrompt();

  const genAI = new GoogleGenerativeAI(apiKey);

   const modelsToTry = [model || defaultModel, "gemini-2.5-flash-lite"];
  let lastError: any = null;

  for (const currentModel of modelsToTry) {
    try {
      console.log(`[DEBUG] Trying model: ${currentModel}`);

      const generativeModel = genAI.getGenerativeModel({
        model: currentModel,
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });

      const sanitizedHistory = history.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const chat = generativeModel.startChat({
        history: sanitizedHistory,
      });

      const result = await chat.sendMessage(prompt);
      const content = result.response.text();

      console.log(`[DEBUG] Success with model: ${currentModel}`);
      return NextResponse.json({ content });
    } catch (error: any) {
      console.error(`[DEBUG] Error with model ${currentModel}:`, error.message);
      lastError = error;
    }
  }

  // All models failed
  console.error("[DEBUG] All models failed:", lastError);

  let userMessage = lastError?.message || "Failed to get AI response";

  if (
    userMessage.includes("API key not valid") ||
    userMessage.includes("API_KEY_INVALID")
  ) {
    userMessage = "API key is invalid. Please check your API key in Settings.";
  } else if (
    userMessage.includes("quota") ||
    userMessage.includes("RATE_LIMIT") ||
    userMessage.includes("Resource has been exhausted")
  ) {
    userMessage = "You've hit the free rate limit. Wait a few minutes and try again.";
  } else if (
    userMessage.includes("model") &&
    (userMessage.includes("not found") || userMessage.includes("not available"))
  ) {
    userMessage = "This model isn't available. Please try again or check your API key.";
  } else if (
    userMessage.includes("billing") ||
    userMessage.includes("payment") ||
    userMessage.includes("PERMISSION_DENIED")
  ) {
    userMessage = "API key issue. Please check your API key in Settings.";
  }

  return NextResponse.json(
    { content: "", error: userMessage },
    { status: 500 }
  );
}