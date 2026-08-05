import { NextRequest, NextResponse } from "next/server";
import type { AIProvider } from "@/lib/store";

const SYSTEM_PROMPT = `You are Echo, a Socratic AI mentor for SecondBrain — the world's most intelligent cognitive learning companion.

CORE PRINCIPLES:
1. NEVER give direct answers. Guide through questions.
2. Build understanding step-by-step via scaffolding.
3. Be encouraging, patient, and intellectually honest.
4. Celebrate insights, correct misconceptions gently.
5. Organize responses with clear structure.

RESPONSE STRUCTURE:
- Start with a guiding question or acknowledgment
- Use **bold** for key terms
- Use bullet points for multiple ideas
- Use headers (##) for major sections
- End with a reflective question or next step

SOCRATIC METHOD:
- Ask 2-3 clarifying questions before explaining
- Use analogies to make abstract concepts concrete
- Connect new ideas to what the learner already knows
- Reveal the core explanation only after 2-3 rounds of dialogue

TONE: Warm, mentor-like, intellectually curious. Never condescending.

FORMAT: Use markdown for structure. Keep responses concise but complete.`;

export async function POST(req: NextRequest) {
  try {
    // Parse request body with timeout protection
    let body: any;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { messages, apiKey, provider, model } = body;

    if (!apiKey || !provider) {
      return NextResponse.json({ error: "Missing API key or provider" }, { status: 400 });
    }

    let response: string;

    // Add timeout to API calls
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("AI response timeout")), 30000); // 30 second timeout
    });

    try {
      if (provider === "openai") {
        response = (await Promise.race([
          callOpenAI(apiKey, messages, model || "gpt-4o-mini"),
          timeoutPromise,
        ])) as string;
      } else if (provider === "anthropic") {
        response = (await Promise.race([
          callAnthropic(apiKey, messages, model || "claude-3-5-sonnet-20241022"),
          timeoutPromise,
        ])) as string;
      } else if (provider === "gemini") {
        response = (await Promise.race([
          callGemini(apiKey, messages, model || "gemini-2.5-flash"),
          timeoutPromise,
        ])) as string;
      } else {
        return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
      }
    } catch (apiError: any) {
      if (apiError.message === "AI response timeout") {
        return NextResponse.json({ error: "The AI service took too long to respond. Please try again." }, { status: 500 });
      }
      throw apiError; // Re-throw for outer catch block
    }

    // Validate response
    if (!response || typeof response !== 'string') {
      return NextResponse.json({ error: "AI returned an invalid response" }, { status: 500 });
    }

    return NextResponse.json({ content: response });
  } catch (error: any) {
    console.error("Chat API error:", error);

    // Parse common errors and give helpful messages
    let userMessage = error.message || "Failed to get AI response";

    if (userMessage.includes("API key not valid") || userMessage.includes("API_KEY_INVALID")) {
      userMessage =
        "API key is invalid. Please check: (1) the key was copied completely, (2) the key hasn't been revoked, (3) get a new free key from the provider's console.";
    } else if (userMessage.includes("quota") || userMessage.includes("RATE_LIMIT")) {
      userMessage =
        "You've hit the rate limit. Wait a moment and try again, or switch to a different model.";
    } else if (userMessage.includes("model") && userMessage.includes("not found")) {
      userMessage = "This model isn't available. Try selecting a different model in Settings.";
    } else if (userMessage.includes("billing") || userMessage.includes("payment")) {
      userMessage =
        "This provider requires billing info. Try a free-tier model instead (e.g., Gemini Flash).";
    } else if (userMessage.includes("503") || userMessage.includes("high demand")) {
      userMessage = "The AI service is experiencing high demand. Please try again in a moment.";
    }

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}

async function callOpenAI(apiKey: string, messages: any[], model: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callAnthropic(apiKey: string, messages: any[], model: string): Promise<string> {
  const anthropicMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: anthropicMessages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

async function callGemini(apiKey: string, messages: any[], model: string): Promise<string> {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}