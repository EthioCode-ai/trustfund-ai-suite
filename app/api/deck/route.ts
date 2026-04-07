import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

const DECK_SYSTEM_PROMPT = `You are an expert pitch deck designer for Neuromart.ai. When asked to create a presentation, you MUST output a JSON block wrapped in \`\`\`deck markers.

The JSON must follow this exact structure:
{
  "title": "Deck Title",
  "theme": "investor",
  "slides": [
    {
      "layout": "title",
      "title": "Main Title",
      "subtitle": "Subtitle text"
    },
    {
      "layout": "content",
      "title": "Slide Title",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "notes": "Speaker notes"
    },
    {
      "layout": "chart",
      "title": "Revenue Projections",
      "chartData": {
        "type": "bar",
        "unit": "$",
        "title": "Monthly Revenue",
        "labels": ["Q1", "Q2", "Q3", "Q4"],
        "datasets": [{"label": "Revenue", "data": [87000, 214000, 358000, 512000], "color": "#6366f1"}]
      },
      "notes": "Speaker notes"
    },
    {
      "layout": "two-column",
      "title": "Problem / Solution",
      "bullets": ["Left column point 1", "Left column point 2"],
      "notes": "Right column content as notes field"
    },
    {
      "layout": "image",
      "title": "Slide Title",
      "imagePrompt": "description for AI image generation",
      "bullets": ["Supporting point"]
    },
    {
      "layout": "quote",
      "title": "Customer Testimonial",
      "subtitle": "— Customer Name, Title"
    },
    {
      "layout": "team",
      "title": "Our Team",
      "bullets": ["Name 1 — Role — Background", "Name 2 — Role — Background"]
    },
    {
      "layout": "closing",
      "title": "Thank You",
      "subtitle": "Contact info",
      "bullets": ["Key ask or CTA"]
    }
  ]
}

Available layouts: title, content, two-column, chart, image, quote, team, stats, timeline, comparison, process, icon-grid, swot, okr, closing
Available chart types: bar, line, pie, funnel, metric
USE infographic layouts generously: stats for hero metrics, timeline for roadmaps, comparison for competitive tables, process for how-it-works flows, icon-grid for feature overviews, swot for strategic analysis, okr for objectives tracking
Available themes: investor (clean/professional), corporate (formal), modern (sleek), bold (dark/energetic)

Rules:
- ALWAYS include 10-15 slides for pitch decks
- ALWAYS start with a "title" layout slide
- ALWAYS end with a "closing" layout slide
- Include at least 2 chart slides with realistic data
- Include at least 1 image slide
- Make content compelling, specific, and data-driven
- The output MUST contain the deck JSON in a \`\`\`deck code block
- After the deck block, include a brief summary of the presentation strategy

CRITICAL DATA QUALITY RULES (violations make the deck unusable):
- EVERY chartData MUST include a "unit" field: "$" for money, "%" for rates, "pts" for scores, "#" for counts, "x" for multiples
- TEAM SLIDES: Only list real humans. The founder is Dr. Abiy Selassie — Founder & CEO, Industrial Engineer, AI/Analytics Leader. NEVER list a company, product, or abstract concept as a team member.
- NUMBERS: Use realistic, specific numbers (e.g., $87K, $214K) — not obvious round placeholders ($100K, $200K, $300K)
- Numbers must be internally consistent across slides. If slide 3 says $500K revenue, slide 8's chart must reflect $500K.
- Every slide should have a clear investor takeaway, not just raw data
- NPS is measured in points (pts), NOT dollars. Conversion rates are percentages (%), NOT dollars. Be precise with unit types.
`;

export async function POST(req: NextRequest) {
  const { prompt, theme } = await req.json();

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: DECK_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Create a professional ${theme || "investor"} pitch deck for: ${prompt}`,
        },
      ],
    });

    const block = response.content[0];
    const content = block.type === "text" ? block.text : "";

    const deckMatch = content.match(/```deck\n([\s\S]*?)```/);
    if (!deckMatch) {
      return NextResponse.json({ error: "Failed to generate deck structure", raw: content }, { status: 500 });
    }

    try {
      const deck = JSON.parse(deckMatch[1]);
      deck.id = Date.now().toString();
      deck.createdAt = Date.now();
      const summary = content.replace(/```deck\n[\s\S]*?```/, "").trim();

      return NextResponse.json({ deck, summary });
    } catch {
      return NextResponse.json({ error: "Failed to parse deck JSON", raw: content }, { status: 500 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Deck generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
