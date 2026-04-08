"use client";

import { useState } from "react";
import { Mail, Send, Check, AlertCircle, Paperclip } from "lucide-react";

interface EmailPreviewProps {
  to: string | string[];
  subject: string;
  body: string;
  replyTo?: string;
}

export function EmailPreview(props: EmailPreviewProps) {
  const [status, setStatus] = useState<"draft" | "sending" | "sent" | "error">("draft");
  const [errorMsg, setErrorMsg] = useState("");
  const recipients = Array.isArray(props.to) ? props.to : [props.to];

  // Check if there's a deck in sessionStorage to attach
  const findDeckHtml = (): string | null => {
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith("deck-")) {
          const deck = JSON.parse(sessionStorage.getItem(key) || "");
          if (deck?.slides?.length) {
            // Generate simple HTML version of the deck
            return generateDeckEmailHtml(deck);
          }
        }
      }
    } catch {
      // ignore
    }
    return null;
  };

  const hasDeck = !!findDeckHtml();

  const handleSend = async () => {
    setStatus("sending");
    try {
      const deckHtml = findDeckHtml();
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...props, deckHtml }),
      });
      const data = await res.json();
      if (data.error) {
        setStatus("error");
        setErrorMsg(data.error);
      } else {
        setStatus("sent");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Failed to send email");
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 16,
        margin: "8px 0",
        borderLeft: "4px solid #10b981",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Mail size={16} style={{ color: "#10b981" }} />
        <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.95rem" }}>
          Email Draft
        </span>
        {hasDeck && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: "#6366f1", background: "#6366f110", padding: "2px 8px", borderRadius: 6 }}>
            <Paperclip size={11} /> Presentation attached
          </span>
        )}
        {status === "sent" && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#10b981", marginLeft: "auto" }}>
            <Check size={13} /> Sent
          </span>
        )}
      </div>

      <div style={{ fontSize: "0.85rem", color: "#475569", marginBottom: 12 }}>
        <div style={{ marginBottom: 4 }}>
          <strong style={{ color: "#334155" }}>To:</strong> {recipients.join(", ")}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong style={{ color: "#334155" }}>Subject:</strong> {props.subject}
        </div>
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 8,
            padding: 12,
            fontSize: "0.85rem",
            lineHeight: 1.6,
            color: "#334155",
            whiteSpace: "pre-wrap",
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          {props.body.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")}
        </div>
      </div>

      {status === "error" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "#ef4444", marginBottom: 8 }}>
          <AlertCircle size={13} />
          {errorMsg}
        </div>
      )}

      {status !== "sent" && (
        <button
          onClick={handleSend}
          disabled={status === "sending"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 8,
            border: "none",
            background: status === "sending" ? "#94a3b8" : "#10b981",
            color: "#fff",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: status === "sending" ? "wait" : "pointer",
          }}
        >
          <Send size={13} />
          {status === "sending" ? "Sending..." : hasDeck ? "Send with Presentation" : "Send Email"}
        </button>
      )}
    </div>
  );
}

function generateDeckEmailHtml(deck: { title: string; slides: { title: string; bullets?: string[]; notes?: string; layout: string }[] }): string {
  const slidesHtml = deck.slides.map((slide, i) => {
    const bullets = slide.bullets?.slice(0, 6).map(b => `<li style="margin-bottom:8px;color:#334155;">${b}</li>`).join("") || "";
    return `
      <div style="margin-bottom:32px;padding:32px;background:#fff;border-radius:12px;border:1px solid #e2e8f0;${slide.layout === "title" ? "text-align:center;background:linear-gradient(135deg,#1e1b4b,#312e81);color:#fff;padding:48px 32px;" : ""}">
        <div style="font-size:0.7rem;color:${slide.layout === "title" ? "rgba(255,255,255,0.5)" : "#94a3b8"};margin-bottom:8px;">Slide ${i + 1} of ${deck.slides.length}</div>
        <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:16px;color:${slide.layout === "title" ? "#fff" : "#0f172a"};letter-spacing:-0.02em;">${slide.title}</h2>
        ${bullets ? `<ul style="padding-left:20px;margin:0;">${bullets}</ul>` : ""}
        ${slide.notes ? `<p style="margin-top:12px;color:#64748b;font-size:0.9rem;">${slide.notes}</p>` : ""}
      </div>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${deck.title}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:800px;margin:0 auto;padding:32px;background:#f8f9fb;">
<h1 style="font-size:1.8rem;font-weight:700;color:#0f172a;margin-bottom:24px;">${deck.title}</h1>
${slidesHtml}
<p style="text-align:center;color:#94a3b8;font-size:0.8rem;margin-top:32px;">Generated by Neuromart.ai ExecSuite</p>
</body></html>`;
}
