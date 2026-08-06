import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { YoutubeTranscript } from "youtube-transcript";
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const mode = formData.get("mode") as string;
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;

    let content = "";
    let title = "";

    // Extract content based on mode
    if (mode === "pdf" && file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        text += pageText + ' ';
      }
      
      content = text.trim();
      title = file.name.replace(".pdf", "");
    } else if (mode === "youtube" && url) {
      const videoId = extractYouTubeId(url);
      if (!videoId) {
        return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
      }
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      content = transcript.map((item) => item.text).join(" ");
      title = "YouTube Video Transcript";
    } else if (mode === "url" && url) {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Try to extract title
      title = $("title").text() || $("h1").first().text() || new URL(url).hostname;
      
      // Remove script and style elements
      $("script, style, nav, footer, header, aside").remove();
      
      // Extract main content
      content = $("main, article, .content, .post, #content").text() || $("body").text();
      content = content.replace(/\s+/g, " ").trim();
    } else if (mode === "image" && file) {
      // For images, we'll need OCR - for now return placeholder
      return NextResponse.json(
        { error: "Image OCR not implemented yet. Please use PDF, YouTube, or URL modes." },
        { status: 501 }
      );
    } else {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    if (!content || content.length < 50) {
      return NextResponse.json({ error: "Could not extract sufficient content" }, { status: 400 });
    }

    // Truncate content if too long for AI processing
    const maxContentLength = 15000;
    const truncatedContent = content.length > maxContentLength 
      ? content.substring(0, maxContentLength) + "..." 
      : content;

    // Call AI agent to generate summary, key ideas, flashcards, and concepts
    const aiResponse = await generateLearningContent(truncatedContent, title);

    return NextResponse.json({
      id: `learn-${Date.now()}`,
      title: aiResponse.title || title,
      kind: mode,
      summary: aiResponse.summary,
      keyIdeas: aiResponse.keyIdeas,
      flashcards: aiResponse.flashcards,
      timeline: mode === "youtube" ? aiResponse.timeline : undefined,
      concepts: aiResponse.concepts,
    });
  } catch (error) {
    console.error("Learn API error:", error);
    return NextResponse.json(
      { error: "Failed to process content: " + (error as Error).message },
      { status: 500 }
    );
  }
}

function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function generateLearningContent(content: string, title: string) {
  // Import AI utilities
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  
  // Get API key from environment or store
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
   const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are an expert learning assistant. Analyze the following content and extract key learning elements.

Title: ${title}

Content:
${content}

Please respond with a JSON object containing:
1. "title": A concise, engaging title for this content (max 100 chars)
2. "summary": A 2-3 sentence summary of the main points
3. "keyIdeas": Array of 5-7 key takeaways (each 10-20 words)
4. "flashcards": Array of 5 flashcard objects with "q" (question) and "a" (answer)
5. "concepts": Array of 5-8 relevant concept tags (lowercase, single words or short phrases)
6. "timeline": Array of timeline objects with "time" and "title" (only if content has temporal structure)

Respond with valid JSON only, no markdown formatting.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  // Clean the response and parse JSON
  const cleanedResponse = responseText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
  
  try {
    return JSON.parse(cleanedResponse);
  } catch (parseError) {
    console.error("Failed to parse AI response:", cleanedResponse);
    // Return fallback structure
    return {
      title: title,
      summary: "Content processed successfully. Summary generation failed.",
      keyIdeas: ["Content analysis completed", "Key extraction in progress"],
      flashcards: [
        { q: "What is this about?", a: "Content analysis was performed." }
      ],
      concepts: ["learning", "analysis"],
      timeline: undefined,
    };
  }
}
