"use client";

import ReactMarkdown from "react-markdown";
import { Crown, DollarSign, Settings, Megaphone, Compass, Database, User } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { agents } from "@/lib/agents";
import {
  parseDeckFromResponse,
  parseChartFromResponse,
  parseCalendarFromResponse,
  parseEmailFromResponse,
  parseSMSFromResponse,
  cleanResponseContent,
} from "@/lib/tools";
import { Chart } from "./Chart";
import { SlidePreview } from "./SlidePreview";
import { CalendarEvent } from "./CalendarEvent";
import { EmailPreview } from "./EmailPreview";
import { SMSPreview } from "./SMSPreview";
import { useEffect } from "react";
import { saveDeck } from "@/lib/storage";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Crown,
  DollarSign,
  Settings,
  Megaphone,
  Compass,
  Database,
};

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";
  const agent = message.agentId ? agents[message.agentId] : null;
  const Icon = agent ? iconMap[agent.icon] || Crown : User;

  const deck = !isUser ? parseDeckFromResponse(message.content) : null;
  const charts = !isUser ? parseChartFromResponse(message.content) : [];
  const calendarEvents = !isUser ? parseCalendarFromResponse(message.content) : [];
  const emails = !isUser ? parseEmailFromResponse(message.content) : [];
  const smsMessages = !isUser ? parseSMSFromResponse(message.content) : [];
  const cleanContent = !isUser ? cleanResponseContent(message.content) : message.content;

  useEffect(() => {
    if (deck) {
      sessionStorage.setItem(`deck-${deck.id}`, JSON.stringify(deck));
      saveDeck(deck);
    }
  }, [deck]);

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

      <div style={{ maxWidth: isUser ? "80%" : "85%", width: isUser ? undefined : "85%" }}>
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
              <ReactMarkdown>{cleanContent}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Charts */}
        {charts.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 16 }}>
            {charts.map((chart, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "24px 20px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
                }}
              >
                <Chart data={chart} />
              </div>
            ))}
          </div>
        )}

        {/* Deck */}
        {deck && (
          <div style={{ marginTop: 12 }}>
            <SlidePreview deck={deck} />
          </div>
        )}

        {/* Calendar events */}
        {calendarEvents.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {calendarEvents.map((event, i) => (
              <CalendarEvent key={i} {...event} />
            ))}
          </div>
        )}

        {/* Emails */}
        {emails.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {emails.map((email, i) => (
              <EmailPreview key={i} {...email} />
            ))}
          </div>
        )}

        {/* SMS */}
        {smsMessages.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {smsMessages.map((sms, i) => (
              <SMSPreview key={i} {...sms} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
