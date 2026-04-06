"use client";

import { useState, useRef, useEffect, use } from "react";
import { getAgent } from "@/lib/agents";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";

export default function AgentChat({
  params,
}: {
  params: Promise<{ agent: string }>;
}) {
  const { agent: agentId } = use(params);
  const agent = getAgent(agentId);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!agent) {
    return (
      <div style={{ padding: 48, color: "var(--text-secondary)" }}>
        Agent not found.
      </div>
    );
  }

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
            // skip malformed chunks
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "Sorry, I encountered an error. Please check your API keys and try again.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
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
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>{agent.name}</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {agent.title} — {agent.provider === "anthropic" ? "Claude" : "GPT-4o"}
          </p>
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
            <h3 style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--text-primary)" }}>
              Chat with {agent.name}
            </h3>
            <p style={{ maxWidth: 400, textAlign: "center", fontSize: "0.9rem" }}>
              {agent.description}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 500, marginTop: 8 }}>
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

        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="typing-indicator" style={{ paddingLeft: 48 }}>
            <span /><span /><span />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
