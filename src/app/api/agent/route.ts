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
  try {
    const body: AgentRequest = await req.json();
    const { subject, prompt, history, apiKey, model = "gemini-1.5-flash" } = body;

    // Validate required fields
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

    // Generate dynamic system prompt based on subject
    const systemPrompt = subject 
      ? generateSystemPrompt(subject)
      : generateDefaultSystemPrompt();

    // Initialize Google Generative AI with low temperature for strict adherence
    const genAI = new GoogleGenerativeAI(apiKey);
    const generativeModel = genAI.getGenerativeModel({
      model,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.2, // Low temperature to prevent unprompted topic shifts
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    // Sanitize and filter chat history - STRICT ISOLATION
    // Only include messages that are relevant to the current subject
    const sanitizedHistory = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Generate response with sanitized history
    const chat = generativeModel.startChat({
      history: sanitizedHistory,
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const content = response.text();

    return NextResponse.json({ content });

  } catch (error: any) {
    console.error("AI Agent API error:", error);

    // Parse common errors and provide helpful messages
    let userMessage = error.message || "Failed to get AI response";

    if (userMessage.includes("API key not valid") || userMessage.includes("API_KEY_INVALID")) {
      userMessage = "API key is invalid. Please check your API key in Settings.";
    } else if (userMessage.includes("quota") || userMessage.includes("RATE_LIMIT")) {
      userMessage = "You've hit the rate limit. Wait a moment and try again.";
    } else if (userMessage.includes("model") && userMessage.includes("not found")) {
      userMessage = "This model isn't available. Try selecting a different model in Settings.";
    } else if (userMessage.includes("billing") || userMessage.includes("payment")) {
      userMessage = "This provider requires billing info. Try a free-tier model instead.";
    }

    return NextResponse.json(
      { content: "", error: userMessage },
      { status: 500 }
    );
  }
}
