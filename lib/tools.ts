export interface StatItem {
  value: string;
  label: string;
  context?: string;
}

export interface TimelineItem {
  date: string;
  title: string;
  description?: string;
  status?: "done" | "active" | "upcoming";
}

export interface ComparisonColumn {
  name: string;
  highlight?: boolean;
  values: string[];
}

export interface ProcessStep {
  step: number;
  title: string;
  description?: string;
}

export interface IconGridItem {
  icon: string;
  title: string;
  description?: string;
}

export interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface OKRData {
  objective: string;
  keyResults: { result: string; progress: number; target: string }[];
}

export interface SlideContent {
  title: string;
  subtitle?: string;
  bullets?: string[];
  notes?: string;
  imagePrompt?: string;
  imageUrl?: string;
  chartData?: ChartData;
  stats?: StatItem[];
  timeline?: TimelineItem[];
  comparison?: { features: string[]; columns: ComparisonColumn[] };
  process?: ProcessStep[];
  iconGrid?: IconGridItem[];
  swot?: SWOTData;
  okrs?: OKRData[];
  layout:
    | "title" | "content" | "two-column" | "chart" | "image"
    | "quote" | "team" | "closing"
    | "stats" | "timeline" | "comparison" | "process" | "icon-grid"
    | "swot" | "okr";
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
  unit?: "$" | "%" | "pts" | "#" | "x" | "" | string;
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

export interface CalendarEventData {
  title: string;
  description?: string;
  startDate: string;
  startTime: string;
  endTime?: string;
  location?: string;
  attendees?: string[];
}

export interface EmailData {
  to: string | string[];
  subject: string;
  body: string;
  replyTo?: string;
}

export interface SMSData {
  to: string;
  message: string;
}

export function parseCalendarFromResponse(content: string): CalendarEventData[] {
  const events: CalendarEventData[] = [];
  const regex = /```calendar\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    try {
      events.push(JSON.parse(match[1]));
    } catch {
      // skip
    }
  }
  return events;
}

export function parseEmailFromResponse(content: string): EmailData[] {
  const emails: EmailData[] = [];
  const regex = /```email\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    try {
      emails.push(JSON.parse(match[1]));
    } catch {
      // skip
    }
  }
  return emails;
}

export function parseSMSFromResponse(content: string): SMSData[] {
  const messages: SMSData[] = [];
  const regex = /```sms\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    try {
      messages.push(JSON.parse(match[1]));
    } catch {
      // skip
    }
  }
  return messages;
}

export function cleanResponseContent(content: string): string {
  return content
    .replace(/```deck\n[\s\S]*?```/g, "")
    .replace(/```chart\n[\s\S]*?```/g, "")
    .replace(/```calendar\n[\s\S]*?```/g, "")
    .replace(/```email\n[\s\S]*?```/g, "")
    .replace(/```sms\n[\s\S]*?```/g, "")
    .trim();
}
