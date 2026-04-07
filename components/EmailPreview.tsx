"use client";

import { useState } from "react";
import { Mail, Send, Check, AlertCircle } from "lucide-react";

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

  const handleSend = async () => {
    setStatus("sending");
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
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
          {props.body}
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
          {status === "sending" ? "Sending..." : "Send Email"}
        </button>
      )}
    </div>
  );
}
