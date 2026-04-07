export interface ThemeConfig {
  name: string;
  description: string;
  bg: string;
  bgSlide: string;
  titleColor: string;
  textColor: string;
  subtitleColor: string;
  accentColor: string;
  accentGradient: string;
  bulletColor: string;
  fontFamily: string;
  titleFontWeight: number;
  borderRadius: number;
  chartColors: string[];
}

export const themes: Record<string, ThemeConfig> = {
  investor: {
    name: "Investor Pitch",
    description: "Clean, professional, trust-building",
    bg: "#ffffff",
    bgSlide: "#ffffff",
    titleColor: "#0f172a",
    textColor: "#334155",
    subtitleColor: "#6366f1",
    accentColor: "#6366f1",
    accentGradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    bulletColor: "#6366f1",
    fontFamily: "'Inter', -apple-system, sans-serif",
    titleFontWeight: 700,
    borderRadius: 16,
    chartColors: ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#10b981", "#f59e0b"],
  },
  corporate: {
    name: "Corporate",
    description: "Formal, authoritative, data-driven",
    bg: "#f8fafc",
    bgSlide: "#ffffff",
    titleColor: "#0c1e3c",
    textColor: "#2d3748",
    subtitleColor: "#2563eb",
    accentColor: "#2563eb",
    accentGradient: "linear-gradient(135deg, #1e40af, #3b82f6)",
    bulletColor: "#2563eb",
    fontFamily: "'Inter', -apple-system, sans-serif",
    titleFontWeight: 700,
    borderRadius: 8,
    chartColors: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#10b981", "#f59e0b"],
  },
  modern: {
    name: "Modern",
    description: "Sleek, minimal, contemporary",
    bg: "#fafafa",
    bgSlide: "#ffffff",
    titleColor: "#18181b",
    textColor: "#3f3f46",
    subtitleColor: "#ec4899",
    accentColor: "#ec4899",
    accentGradient: "linear-gradient(135deg, #ec4899, #f472b6)",
    bulletColor: "#ec4899",
    fontFamily: "'Inter', -apple-system, sans-serif",
    titleFontWeight: 800,
    borderRadius: 24,
    chartColors: ["#ec4899", "#f472b6", "#f9a8d4", "#10b981", "#6366f1", "#f59e0b"],
  },
  bold: {
    name: "Bold",
    description: "High-impact, energetic, startup-style",
    bg: "#0f172a",
    bgSlide: "#1e293b",
    titleColor: "#ffffff",
    textColor: "#cbd5e1",
    subtitleColor: "#38bdf8",
    accentColor: "#38bdf8",
    accentGradient: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
    bulletColor: "#38bdf8",
    fontFamily: "'Inter', -apple-system, sans-serif",
    titleFontWeight: 800,
    borderRadius: 16,
    chartColors: ["#38bdf8", "#0ea5e9", "#7dd3fc", "#10b981", "#f59e0b", "#ec4899"],
  },
};
