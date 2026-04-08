"use client";

import Link from "next/link";
import { Crown, DollarSign, Settings, Megaphone, Compass, Database } from "lucide-react";
import { Agent } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Crown,
  DollarSign,
  Settings,
  Megaphone,
  Compass,
  Database,
};

export function AgentCard({ agent }: { agent: Agent }) {
  const Icon = iconMap[agent.icon] || Crown;

  return (
    <Link href={`/chat/${agent.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="agent-card">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `${agent.color}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>{agent.name}</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {agent.title}
            </p>
          </div>
          <div
            className="pulse-dot"
            style={{ background: agent.color, marginLeft: "auto" }}
          />
        </div>

        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          {agent.description}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {agent.capabilities.slice(0, 4).map((cap) => (
            <span
              key={cap}
              style={{
                fontSize: "0.7rem",
                padding: "4px 10px",
                borderRadius: 20,
                background: `${agent.color}15`,
                color: agent.color,
                border: `1px solid ${agent.color}30`,
              }}
            >
              {cap}
            </span>
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
          }}
        >
          <span>
            {agent.provider === "anthropic" ? "Claude" : agent.provider === "google" ? "Gemini" : "GPT-4o"}
          </span>
          <span style={{ color: agent.color }}>Chat →</span>
        </div>
      </div>
    </Link>
  );
}
