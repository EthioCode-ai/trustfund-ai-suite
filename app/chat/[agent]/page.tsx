"use client";

import { useState, useRef, useEffect, use } from "react";
import { getAgent, agents as allAgents } from "@/lib/agents";
import { ChatMessage as ChatMessageType, AgentRole } from "@/lib/types";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ExportButton } from "@/components/ExportButton";
import { Crown, DollarSign, Settings, Megaphone, Compass, Users, Save, Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { saveConversation, getConversation } from "@/lib/storage";

const agentIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  Crown,
  DollarSign,
  Settings,
  Megaphone,
  Compass,
};

interface CollabStatus {
  phase: string;
  agent?: AgentRole;
  message: string;
}

export default function AgentChat({
  params,
}: {
  params: Promise<{ agent: string }>;
}) {
  const { agent: agentId } = use(params);
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resume");
  const agent = getAgent(agentId);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [collabMode, setCollabMode] = useState(false);
  const [collabStatuses, setCollabStatuses] = useState<CollabStatus[]>([]);
  const [conversationId, setConversationId] = useState<string>(resumeId || Date.now().toString());
  const [saved, setSaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Resume a saved conversation from localStorage
  useEffect(() => {
    if (resumeId) {
      const convo = getConversation(resumeId);
      if (convo) {
        setMessages(convo.messages);
        setConversationId(convo.id);
        setSaved(true);
      }
    }
  }, [resumeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, collabStatuses]);

  const handleSave = () => {
    if (messages.length === 0 || !agent) return;
    saveConversation({
      id: conversationId,
      agentId: agent.id,
      title: messages.find((m) => m.role === "user")?.content?.slice(0, 80) || "Untitled",
      messages,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownload = () => {
    if (messages.length === 0) return;
    const content = messages
      .map((m) => `**${m.role === "user" ? "You" : agent?.name || "Assistant"}:**\n${m.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neuromart-${agent?.id}-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!agent) {
    return (
      <div style={{ padding: 48, color: "var(--text-secondary)" }}>
        Agent not found.
      </div>
    );
  }

  const isCEO = agent.id === "ceo";

  const handleSend = async (content: string) => {
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    const assistantMessage: ChatMessageType = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      agentId: agent.id,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);
    setCollabStatuses([]);

    // CEO uses collaboration mode
    if (isCEO && collabMode) {
      await handleCollabSend(content, userMessage);
    } else {
      await handleDirectSend(content, userMessage);
    }
  };

  const handleDirectSend = async (
    content: string,
    userMessage: ChatMessageType
  ) => {
    try {
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, messages: apiMessages }),
      });

      await processSSEStream(response);
    } catch (error) {
      console.error("Chat error:", error);
      setErrorMessage();
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCollabSend = async (
    content: string,
    userMessage: ChatMessageType
  ) => {
    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/collaborate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...conversationHistory,
            { role: "user", content },
          ],
          conversationHistory,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);

          try {
            const parsed = JSON.parse(data);

            if (parsed.event === "status") {
              setCollabStatuses((prev) => [...prev, parsed.data as CollabStatus]);
            } else if (parsed.event === "text") {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + parsed.data,
                };
                return updated;
              });
            } else if (parsed.event === "error") {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: `Error: ${parsed.data}`,
                };
                return updated;
              });
            } else if (parsed.event === "done") {
              break;
            }
          } catch {
            // skip malformed
          }
        }
      }
    } catch (error) {
      console.error("Collab error:", error);
      setErrorMessage();
    } finally {
      setIsStreaming(false);
    }
  };

  const processSSEStream = async (response: Response) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) throw new Error("No response stream");

    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") break;

        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: `Error: ${parsed.error}`,
              };
              return updated;
            });
            break;
          }
          if (parsed.text) {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: updated[updated.length - 1].content + parsed.text,
              };
              return updated;
            });
          }
        } catch {
          // skip
        }
      }
    }
  };

  const setErrorMessage = () => {
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        content:
          "Sorry, I encountered an error. Please check your API keys and try again.",
      };
      return updated;
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
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
            background: `${agent.color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="pulse-dot"
            style={{ background: agent.color, width: 10, height: 10 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>{agent.name}</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {agent.title} — {agent.provider === "anthropic" ? "Claude" : "GPT-4o"}
            {isCEO && collabMode && " — Collaboration Mode"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Collaboration toggle for CEO */}
          {isCEO && (
            <button
              onClick={() => setCollabMode(!collabMode)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                border: collabMode
                  ? "1px solid #6366f1"
                  : "1px solid var(--border)",
                background: collabMode ? "#6366f120" : "var(--bg-tertiary)",
                color: collabMode ? "#6366f1" : "var(--text-secondary)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <Users size={14} />
              {collabMode ? "Team Mode ON" : "Team Mode"}
            </button>
          )}
          {messages.length > 0 && (
            <>
              <button
                onClick={handleSave}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: saved ? "1px solid #10b981" : "1px solid var(--border)",
                  background: saved ? "#10b98115" : "var(--bg-tertiary)",
                  color: saved ? "#10b981" : "var(--text-secondary)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <Save size={13} />
                {saved ? "Saved!" : "Save"}
              </button>
              <button
                onClick={handleDownload}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                }}
              >
                <Download size={13} />
                Download
              </button>
              <ExportButton
                content={messages
                  .filter((m) => m.role === "assistant")
                  .map((m) => m.content)
                  .join("\n\n---\n\n")}
                filename={`neuromart-${agent.id}-report`}
                label="Export HTML"
              />
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        {messages.length === 0 && (
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
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: `${agent.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${agent.color}30`,
              }}
            >
              <div
                className="pulse-dot"
                style={{ background: agent.color, width: 16, height: 16 }}
              />
            </div>
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              Chat with {agent.name}
            </h3>
            <p style={{ maxWidth: 400, textAlign: "center", fontSize: "0.9rem" }}>
              {agent.description}
            </p>

            {/* Collab mode info for CEO */}
            {isCEO && (
              <div
                style={{
                  marginTop: 8,
                  padding: "12px 20px",
                  background: collabMode ? "#6366f110" : "var(--bg-tertiary)",
                  border: `1px solid ${collabMode ? "#6366f130" : "var(--border)"}`,
                  borderRadius: 12,
                  maxWidth: 500,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <Users size={14} style={{ color: "#6366f1" }} />
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#6366f1",
                    }}
                  >
                    Team Mode {collabMode ? "Active" : "Available"}
                  </span>
                </div>
                <p style={{ fontSize: "0.78rem", lineHeight: 1.5 }}>
                  {collabMode
                    ? "Alexandria will automatically consult the CFO, COO, and CMO, then synthesize their input into one unified deliverable."
                    : "Enable Team Mode to have the CEO orchestrate the full C-suite for comprehensive deliverables."}
                </p>
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
                maxWidth: 500,
                marginTop: 8,
              }}
            >
              {agent.capabilities.map((cap) => (
                <span
                  key={cap}
                  style={{
                    fontSize: "0.75rem",
                    padding: "6px 12px",
                    borderRadius: 20,
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Collaboration status indicators */}
        {isStreaming && collabMode && collabStatuses.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              padding: "8px 0 8px 48px",
              marginBottom: 12,
            }}
          >
            {collabStatuses.map((status, i) => {
              const agentData = status.agent
                ? allAgents[status.agent]
                : null;
              const isReceived = status.phase === "received";
              const isConsulting = status.phase === "consulting";
              const Icon = agentData
                ? agentIcons[agentData.icon] || Crown
                : Users;
              const color = agentData?.color || "#6366f1";

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 14px",
                    background: isReceived
                      ? `${color}08`
                      : `${color}12`,
                    border: `1px solid ${color}${isReceived ? "15" : "25"}`,
                    borderRadius: 10,
                    fontSize: "0.8rem",
                    color: isReceived
                      ? "var(--text-secondary)"
                      : color,
                    fontWeight: 500,
                    width: "fit-content",
                    transition: "all 0.3s",
                  }}
                >
                  {isConsulting && (
                    <div style={{ animation: "pulse 1.5s infinite" }}>
                      <Icon size={14} />
                    </div>
                  )}
                  {isReceived && (
                    <span style={{ color: "#10b981" }}>✓</span>
                  )}
                  {!isConsulting && !isReceived && (
                    <Icon size={14} />
                  )}
                  {status.message}
                </div>
              );
            })}
          </div>
        )}

        {isStreaming && messages[messages.length - 1]?.content === "" && collabStatuses.length === 0 && (
          <div className="typing-indicator" style={{ paddingLeft: 48 }}>
            <span />
            <span />
            <span />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={handleSend}
        disabled={isStreaming}
        placeholder={
          isCEO && collabMode
            ? "Ask the CEO — she'll coordinate with CFO, COO & CMO..."
            : undefined
        }
      />
    </div>
  );
}
