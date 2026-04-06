"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "16px 24px",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        alignItems: "flex-end",
      }}
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder || "Message your executive..."}
        disabled={disabled}
        rows={1}
        style={{
          flex: 1,
          background: "var(--bg-tertiary)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "12px 16px",
          color: "var(--text-primary)",
          fontSize: "0.95rem",
          resize: "none",
          outline: "none",
          fontFamily: "inherit",
          lineHeight: 1.5,
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !input.trim()}
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: disabled || !input.trim() ? "var(--bg-tertiary)" : "#6366f1",
          border: "none",
          color: "#fff",
          cursor: disabled || !input.trim() ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s",
          flexShrink: 0,
        }}
      >
        <Send size={18} />
      </button>
    </div>
  );
}
