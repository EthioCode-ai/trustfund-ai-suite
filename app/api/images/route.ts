import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

export async function POST(req: NextRequest) {
  const { prompt, size } = await req.json();

  try {
    const openai = getOpenAIClient();
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Professional, clean, modern business illustration: ${prompt}. Style: minimal, corporate, white background, suitable for investor presentation.`,
      n: 1,
      size: size || "1792x1024",
      quality: "standard",
    });

    const imageData = response.data?.[0];
    return NextResponse.json({
      url: imageData?.url ?? null,
      revisedPrompt: imageData?.revised_prompt ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Image generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
