"use client";

import { getAllAgents } from "@/lib/agents";
import { AgentCard } from "@/components/AgentCard";
import Link from "next/link";
import { Users } from "lucide-react";

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
          Your AI-powered C-suite for TrustFund AI. Chat with any executive
          for strategic advice, or convene the boardroom for cross-functional input.
        </p>
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
