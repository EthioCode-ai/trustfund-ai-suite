"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { agents } from "@/lib/agents";
import { loadConversations, deleteConversation, loadDecks, deleteDeck, SavedConversation, SavedDeck } from "@/lib/storage";
import {
  MessageSquare, Presentation, Trash2, Clock, Crown,
  DollarSign, Settings, Megaphone, Compass, Download,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Crown, DollarSign, Settings, Megaphone, Compass,
};

export default function HistoryPage() {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [decks, setDecks] = useState<SavedDeck[]>([]);
  const [tab, setTab] = useState<"conversations" | "decks">("conversations");

  useEffect(() => {
    setConversations(loadConversations());
    setDecks(loadDecks());
  }, []);

  const handleDeleteConvo = (id: string) => {
    deleteConversation(id);
    setConversations(loadConversations());
  };

  const handleDeleteDeck = (id: string) => {
    deleteDeck(id);
    setDecks(loadDecks());
  };

  const downloadConversation = (convo: SavedConversation) => {
    const agent = agents[convo.agentId];
    const content = convo.messages
      .map((m) => `**${m.role === "user" ? "You" : agent?.name || "Assistant"}:**\n${m.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${convo.title.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 50)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: 900 }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 8 }}>
        History
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: 28 }}>
        Resume past conversations and review saved decks. Data is saved in your browser.
      </p>

      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {[
          { key: "conversations" as const, label: "Conversations", icon: MessageSquare, count: conversations.length },
          { key: "decks" as const, label: "Decks", icon: Presentation, count: decks.length },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 10,
              border: tab === t.key ? "1px solid var(--border)" : "1px solid transparent",
              background: tab === t.key ? "var(--bg-tertiary)" : "transparent",
              color: tab === t.key ? "var(--text-primary)" : "var(--text-secondary)",
              cursor: "pointer", fontSize: "0.9rem", fontWeight: 500,
            }}
          >
            <t.icon size={16} />
            {t.label}
            <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 10, background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Conversations */}
      {tab === "conversations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {conversations.length === 0 && (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              No saved conversations yet. Chat with any executive and click &quot;Save&quot; to preserve it.
            </div>
          )}
          {conversations.map((convo) => {
            const agent = agents[convo.agentId];
            const Icon = agent ? iconMap[agent.icon] || Crown : MessageSquare;
            return (
              <div
                key={convo.id}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 18px", background: "var(--bg-secondary)",
                  border: "1px solid var(--border)", borderRadius: 12,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${agent?.color || "#666"}15`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon size={18} />
                </div>
                <Link href={`/chat/${convo.agentId}?resume=${convo.id}`} style={{ flex: 1, textDecoration: "none", color: "inherit" }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                    {convo.title}
                  </div>
                  <div style={{ display: "flex", gap: 12, fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    <span style={{ color: agent?.color }}>{agent?.name || convo.agentId}</span>
                    <span>{convo.messages.length} messages</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={11} /> {formatDate(convo.updatedAt)}
                    </span>
                  </div>
                </Link>
                <button onClick={() => downloadConversation(convo)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex" }}>
                  <Download size={15} />
                </button>
                <button onClick={() => handleDeleteConvo(convo.id)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex" }}>
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Decks */}
      {tab === "decks" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {decks.length === 0 && (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem", gridColumn: "1 / -1" }}>
              No saved decks yet. Generate a deck and it will appear here automatically.
            </div>
          )}
          {decks.map((deck) => (
            <div
              key={deck.id}
              style={{
                background: "var(--bg-secondary)", border: "1px solid var(--border)",
                borderRadius: 12, padding: 20, cursor: "pointer",
              }}
              onClick={() => {
                sessionStorage.setItem(`deck-${deck.id}`, JSON.stringify(deck));
                window.open(`/deck/${deck.id}`, "_blank");
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Presentation size={16} style={{ color: "#6366f1" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{deck.title}</span>
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                <span>{(deck.slides as unknown[]).length} slides</span>
                <span>{deck.theme}</span>
                <span>{formatDate(deck.createdAt)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteDeck(deck.id); }}
                  style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
