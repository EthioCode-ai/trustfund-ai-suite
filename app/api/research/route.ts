import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}
function getGeminiClient() {
  return new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
}

interface ResearchResult {
  topic: string;
  findings: string;
  sources: string[];
  confidence: "high" | "medium" | "low";
}

// Multi-model research: GPT researches, Gemini validates
export async function POST(req: NextRequest) {
  const { queries } = await req.json();

  try {
    const results: ResearchResult[] = await Promise.all(
      (queries as string[]).slice(0, 5).map(async (query: string) => {
        // Step 1: GPT does primary research
        const openai = getOpenAIClient();
        const primaryRes = await openai.chat.completions.create({
          model: "gpt-4o",
          max_tokens: 1500,
          messages: [
            {
              role: "system",
              content: `You are a rigorous business research analyst. Research the query and provide:
1. Specific facts, statistics, and data points
2. Source attribution (name the source: "According to Grand View Research...", "Per McKinsey 2024 report...")
3. Date of data where possible
4. Confidence level in your findings

Be specific — no vague claims. If you're unsure about a number, say so.
Format: Start with key findings, then supporting data, then sources.`,
            },
            { role: "user", content: query },
          ],
        });
        const primaryFindings = primaryRes.choices[0]?.message?.content || "";

        // Step 2: Gemini cross-validates
        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const validationResult = await model.generateContent(
          `Fact-check and validate these research findings. Flag anything that seems incorrect, outdated, or unverifiable. Add any corrections or additional context:\n\n${primaryFindings}\n\nRespond with: VALIDATED findings (corrected if needed), FLAGGED items (questionable claims), and CONFIDENCE (high/medium/low).`
        );
        const validation = validationResult.response.text();

        // Determine confidence
        const confidence: "high" | "medium" | "low" = validation.toLowerCase().includes("confidence: high")
          ? "high"
          : validation.toLowerCase().includes("confidence: low")
          ? "low"
          : "medium";

        // Extract source mentions
        const sourceRegex = /(?:according to|per|source:|from)\s+([^,.]+)/gi;
        const sources: string[] = [];
        let match;
        while ((match = sourceRegex.exec(primaryFindings + " " + validation)) !== null) {
          const source = match[1].trim();
          if (source.length > 3 && source.length < 80 && !sources.includes(source)) {
            sources.push(source);
          }
        }

        return {
          topic: query,
          findings: primaryFindings + "\n\n**Validation Notes:**\n" + validation,
          sources: sources.slice(0, 8),
          confidence,
        };
      })
    );

    return NextResponse.json({ results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Research failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
