export interface ThemeConfig {
  name: string;
  description: string;
  // Colors — limited palette: bg, primary, accent (max 3)
  bg: string;
  bgSlide: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  accentGradient: string;
  mutedColor: string;
  // Typography — 2 fonts max, strict sizing
  fontFamily: string;
  headingWeight: number;
  bodyWeight: number;
  // Title slide: 48px+ heading
  titleSize: string;
  // Content slide: 32px heading, 24px body
  headingSize: string;
  bodySize: string;
  bulletSize: string;
  captionSize: string;
  // Spacing — generous whitespace
  slidePadding: string;
  contentGap: string;
  bulletGap: string;
  // Shape
  borderRadius: number;
  // Charts
  chartColors: string[];
}

export const themes: Record<string, ThemeConfig> = {
  investor: {
    name: "Investor Pitch",
    description: "Clean, professional, trust-building",
    bg: "#f8f9fb",
    bgSlide: "#ffffff",
    titleColor: "#0f172a",
    textColor: "#475569",
    accentColor: "#6366f1",
    accentGradient: "linear-gradient(135deg, #6366f1, #818cf8)",
    mutedColor: "#94a3b8",
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    headingWeight: 700,
    bodyWeight: 400,
    titleSize: "2.8rem",
    headingSize: "1.75rem",
    bodySize: "1.15rem",
    bulletSize: "1.1rem",
    captionSize: "0.85rem",
    slidePadding: "64px 80px",
    contentGap: "32px",
    bulletGap: "20px",
    borderRadius: 16,
    chartColors: ["#6366f1", "#818cf8", "#a5b4fc", "#10b981", "#f59e0b", "#ef4444"],
  },
  corporate: {
    name: "Corporate",
    description: "Formal, authoritative, data-driven",
    bg: "#f1f5f9",
    bgSlide: "#ffffff",
    titleColor: "#0c1e3c",
    textColor: "#334155",
    accentColor: "#2563eb",
    accentGradient: "linear-gradient(135deg, #1e40af, #3b82f6)",
    mutedColor: "#94a3b8",
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    headingWeight: 700,
    bodyWeight: 400,
    titleSize: "2.6rem",
    headingSize: "1.7rem",
    bodySize: "1.15rem",
    bulletSize: "1.05rem",
    captionSize: "0.85rem",
    slidePadding: "60px 72px",
    contentGap: "28px",
    bulletGap: "18px",
    borderRadius: 8,
    chartColors: ["#2563eb", "#3b82f6", "#60a5fa", "#10b981", "#f59e0b", "#ef4444"],
  },
  modern: {
    name: "Modern",
    description: "Sleek, minimal, contemporary",
    bg: "#fafafa",
    bgSlide: "#ffffff",
    titleColor: "#18181b",
    textColor: "#52525b",
    accentColor: "#7c3aed",
    accentGradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    mutedColor: "#a1a1aa",
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    headingWeight: 800,
    bodyWeight: 400,
    titleSize: "3rem",
    headingSize: "1.8rem",
    bodySize: "1.15rem",
    bulletSize: "1.1rem",
    captionSize: "0.85rem",
    slidePadding: "72px 88px",
    contentGap: "36px",
    bulletGap: "22px",
    borderRadius: 20,
    chartColors: ["#7c3aed", "#a78bfa", "#c4b5fd", "#10b981", "#6366f1", "#f59e0b"],
  },
  bold: {
    name: "Bold",
    description: "High-impact, dark, startup-style",
    bg: "#0f172a",
    bgSlide: "#1e293b",
    titleColor: "#f1f5f9",
    textColor: "#cbd5e1",
    accentColor: "#38bdf8",
    accentGradient: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
    mutedColor: "#64748b",
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    headingWeight: 800,
    bodyWeight: 400,
    titleSize: "2.8rem",
    headingSize: "1.75rem",
    bodySize: "1.15rem",
    bulletSize: "1.1rem",
    captionSize: "0.85rem",
    slidePadding: "64px 80px",
    contentGap: "32px",
    bulletGap: "20px",
    borderRadius: 16,
    chartColors: ["#38bdf8", "#0ea5e9", "#7dd3fc", "#10b981", "#f59e0b", "#ec4899"],
  },
};
