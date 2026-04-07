"use client";

import { getAllAgents } from "@/lib/agents";
import { AgentCard } from "@/components/AgentCard";
import Link from "next/link";
import { Users, BarChart3, Presentation, Download, Search } from "lucide-react";

export default function Dashboard() {
  const agents = getAllAgents();

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}
        >
          Executive Suite
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 600 }}>
          Your AI-powered C-suite for Neuromart.ai. Chat with any executive
          for strategic advice, or convene the boardroom for cross-functional input.
        </p>
      </div>

      {/* Capabilities banner */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        {[
          { icon: Presentation, label: "Pitch Decks", desc: "Interactive investor-ready slides", color: "#6366f1" },
          { icon: BarChart3, label: "Live Charts", desc: "Bar, line, pie, funnel, metrics", color: "#10b981" },
          { icon: Search, label: "Research", desc: "Real-time market data & insights", color: "#3b82f6" },
          { icon: Download, label: "Export", desc: "Download reports & presentations", color: "#f59e0b" },
        ].map((cap) => (
          <div
            key={cap.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              background: `${cap.color}08`,
              border: `1px solid ${cap.color}20`,
              borderRadius: 12,
              fontSize: "0.8rem",
            }}
          >
            <cap.icon size={16} style={{ color: cap.color }} />
            <div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{cap.label}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.7rem" }}>{cap.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      <Link
        href="/boardroom"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "20px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          color: "var(--text-primary)",
          textDecoration: "none",
          fontSize: "1rem",
          fontWeight: 500,
          transition: "all 0.2s",
        }}
      >
        <Users size={20} />
        Convene the Boardroom — Ask all executives at once
      </Link>
    </div>
  );
}
