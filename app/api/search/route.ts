import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: `You are a research assistant. Given a search query, provide a comprehensive summary of the most relevant and up-to-date information. Include specific data points, statistics, and facts where possible. Structure your response with clear sections. Always mention your sources conceptually (e.g., "According to industry reports...", "Market research indicates...").`,
        },
        {
          role: "user",
          content: `Research the following topic and provide detailed, factual information:\n\n${query}`,
        },
      ],
    });

    return NextResponse.json({
      result: response.choices[0]?.message?.content || "No results found.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
