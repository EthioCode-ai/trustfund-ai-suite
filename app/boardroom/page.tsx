"use client";

import { useState } from "react";
import { getAllAgents } from "@/lib/agents";
import { ChatInput } from "@/components/ChatInput";
import { Crown, DollarSign, Settings, Megaphone, Users } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Agent, AgentRole } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Crown,
  DollarSign,
  Settings,
  Megaphone,
};

interface BoardResponse {
  agentId: AgentRole;
  content: string;
}

export default function Boardroom() {
  const agents = getAllAgents();
  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState<BoardResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<
    { question: string; responses: BoardResponse[] }[]
  >([]);

  const handleAsk = async (message: string) => {
    setQuestion(message);
    setResponses([]);
    setLoading(true);

    try {
      const res = await fetch("/api/boardroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: message }),
      });

      const data = await res.json();
      setResponses(data.responses);
      setHistory((prev) => [
        ...prev,
        { question: message, responses: data.responses },
      ]);
    } catch (error) {
      console.error("Boardroom error:", error);
      setResponses([
        {
          agentId: "ceo",
          content: "Error contacting the executive team. Check your API keys.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getAgent = (id: AgentRole): Agent | undefined =>
    agents.find((a) => a.id === id);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-secondary)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "var(--bg-tertiary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Users size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>The Boardroom</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            All 4 executives respond to your question in parallel
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        {!question && !loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 16,
              color: "var(--text-secondary)",
            }}
          >
            <Users size={48} style={{ opacity: 0.3 }} />
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              Convene the Board
            </h3>
            <p style={{ maxWidth: 500, textAlign: "center", fontSize: "0.9rem" }}>
              Ask a question and all four executives will weigh in from their
              area of expertise — strategy, finance, operations, and marketing.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
                marginTop: 8,
              }}
            >
              {[
                "Should we raise a seed round or bootstrap?",
                "Design a go-to-market plan for our MVP launch",
                "What should our team look like in 6 months?",
                "Analyze our competitive landscape",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleAsk(suggestion)}
                  style={{
                    fontSize: "0.8rem",
                    padding: "8px 14px",
                    borderRadius: 20,
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Previous discussions */}
        {history.slice(0, -1).map((item, idx) => (
          <div key={idx} style={{ marginBottom: 32, opacity: 0.6 }}>
            <div
              style={{
                padding: "12px 16px",
                background: "var(--bg-tertiary)",
                borderRadius: 12,
                marginBottom: 16,
                fontSize: "0.95rem",
              }}
            >
              <strong>You asked:</strong> {item.question}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 16,
              }}
            >
              {item.responses.map((r) => {
                const a = getAgent(r.agentId);
                if (!a) return null;
                const Icon = iconMap[a.icon] || Crown;
                return (
                  <div
                    key={r.agentId}
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Icon size={16} />
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: a.color }}>
                        {a.name}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.85rem", lineHeight: 1.5, color: "var(--text-secondary)" }}>
                      <ReactMarkdown>{r.content.slice(0, 200) + "..."}</ReactMarkdown>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Current question */}
        {question && (
          <div
            style={{
              padding: "12px 16px",
              background: "var(--bg-tertiary)",
              borderRadius: 12,
              marginBottom: 24,
              fontSize: "0.95rem",
              border: "1px solid var(--border)",
            }}
          >
            <strong>You asked:</strong> {question}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              padding: 48,
            }}
          >
            <div className="typing-indicator">
              <span /><span /><span />
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Executives are deliberating...
            </p>
          </div>
        )}

        {/* Responses grid */}
        {responses.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 20,
            }}
          >
            {responses.map((r) => {
              const a = getAgent(r.agentId);
              if (!a) return null;
              const Icon = iconMap[a.icon] || Crown;
              return (
                <div
                  key={r.agentId}
                  className="chat-bubble-assistant"
                  style={{
                    maxWidth: "100%",
                    borderTop: `3px solid ${a.color}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 12,
                      paddingBottom: 10,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${a.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: a.color }}>
                        {a.name}
                      </p>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                        {a.title}
                      </p>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                    <ReactMarkdown>{r.content}</ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ChatInput
        onSend={handleAsk}
        disabled={loading}
        placeholder="Ask your executive team..."
      />
    </div>
  );
}
