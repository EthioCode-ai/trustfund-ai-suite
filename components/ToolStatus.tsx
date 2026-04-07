"use client";

import { Search, BarChart3, Image, Presentation } from "lucide-react";

type ToolType = "search" | "chart" | "image" | "deck";

const toolConfig: Record<ToolType, { icon: React.ComponentType<{ size?: number }>; label: string; color: string }> = {
  search: { icon: Search, label: "Researching...", color: "#3b82f6" },
  chart: { icon: BarChart3, label: "Generating chart...", color: "#10b981" },
  image: { icon: Image, label: "Creating image...", color: "#f59e0b" },
  deck: { icon: Presentation, label: "Building deck...", color: "#6366f1" },
};

export function ToolStatus({ tools }: { tools: ToolType[] }) {
  if (tools.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 0 8px 48px" }}>
      {tools.map((tool) => {
        const config = toolConfig[tool];
        const Icon = config.icon;
        return (
          <div
            key={tool}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 14px",
              background: `${config.color}10`,
              border: `1px solid ${config.color}25`,
              borderRadius: 10,
              fontSize: "0.8rem",
              color: config.color,
              fontWeight: 500,
              width: "fit-content",
            }}
          >
            <div
              style={{
                animation: "spin 2s linear infinite",
              }}
            >
              <Icon size={14} />
            </div>
            {config.label}
          </div>
        );
      })}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
