"use client";

import ReactMarkdown from "react-markdown";
import { Crown, DollarSign, Settings, Megaphone, User } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { agents } from "@/lib/agents";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Crown,
  DollarSign,
  Settings,
  Megaphone,
};

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";
  const agent = message.agentId ? agents[message.agentId] : null;
  const Icon = agent ? iconMap[agent.icon] || Crown : User;

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: isUser
            ? "var(--bg-tertiary)"
            : `${agent?.color || "#666"}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: `1px solid ${isUser ? "var(--border)" : agent?.color || "var(--border)"}40`,
        }}
      >
        <Icon size={16} />
      </div>

      <div className={isUser ? "chat-bubble-user" : "chat-bubble-assistant"}>
        {!isUser && agent && (
          <p
            style={{
              fontSize: "0.7rem",
              color: agent.color,
              fontWeight: 600,
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {agent.name} — {agent.title}
          </p>
        )}
        {isUser ? (
          <p style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>{message.content}</p>
        ) : (
          <div style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
