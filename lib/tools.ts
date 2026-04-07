export interface SlideContent {
  title: string;
  subtitle?: string;
  bullets?: string[];
  notes?: string;
  imagePrompt?: string;
  imageUrl?: string;
  chartData?: ChartData;
  layout: "title" | "content" | "two-column" | "chart" | "image" | "quote" | "team" | "closing";
}

export interface DeckData {
  id: string;
  title: string;
  theme: DeckTheme;
  slides: SlideContent[];
  createdAt: number;
}

export type DeckTheme = "investor" | "corporate" | "modern" | "bold";

export interface ChartData {
  type: "bar" | "line" | "pie" | "funnel" | "metric";
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

export interface ToolCall {
  type: "search" | "chart" | "image" | "deck";
  status: "running" | "complete" | "error";
  data?: unknown;
}

export function parseDeckFromResponse(content: string): DeckData | null {
  const deckMatch = content.match(/```deck\n([\s\S]*?)```/);
  if (!deckMatch) return null;

  try {
    const parsed = JSON.parse(deckMatch[1]);
    return {
      id: Date.now().toString(),
      title: parsed.title || "Untitled Deck",
      theme: parsed.theme || "investor",
      slides: parsed.slides || [],
      createdAt: Date.now(),
    };
  } catch {
    return null;
  }
}

export function parseChartFromResponse(content: string): ChartData[] {
  const charts: ChartData[] = [];
  const chartRegex = /```chart\n([\s\S]*?)```/g;
  let match;

  while ((match = chartRegex.exec(content)) !== null) {
    try {
      charts.push(JSON.parse(match[1]));
    } catch {
      // skip malformed
    }
  }
  return charts;
}

export function cleanResponseContent(content: string): string {
  return content
    .replace(/```deck\n[\s\S]*?```/g, "")
    .replace(/```chart\n[\s\S]*?```/g, "")
    .trim();
}
