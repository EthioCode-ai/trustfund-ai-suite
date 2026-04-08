"use client";

import { useState, useRef } from "react";
import { Send, Plus, X, FileText, Image, File } from "lucide-react";

interface Attachment {
  name: string;
  type: string;
  size: number;
  content: string; // base64 for images, text content for documents
}

interface ChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type.includes("pdf") || type.includes("document") || type.includes("text")) return FileText;
  return File;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || disabled) return;

    // Build message with attachment context
    let message = trimmed;
    if (attachments.length > 0) {
      const attachmentDescriptions = attachments.map((a) => {
        if (a.type.startsWith("image/")) {
          return `[Attached image: ${a.name}]`;
        }
        // For text/documents, include the content so the AI can read it
        return `[Attached file: ${a.name}]\n--- File Content ---\n${a.content}\n--- End File ---`;
      }).join("\n\n");

      message = message
        ? `${message}\n\n${attachmentDescriptions}`
        : attachmentDescriptions;
    }

    onSend(message, attachments);
    setInput("");
    setAttachments([]);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} is too large. Max 2MB per file.`);
        continue;
      }

      if (file.type.startsWith("image/")) {
        // Images: convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachments((prev) => [...prev, {
            name: file.name,
            type: file.type,
            size: file.size,
            content: reader.result as string,
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        // Text/docs: read as text
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachments((prev) => [...prev, {
            name: file.name,
            type: file.type,
            size: file.size,
            content: reader.result as string,
          }]);
        };
        reader.readAsText(file);
      }
    }

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const hasContent = input.trim() || attachments.length > 0;

  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg-secondary)",
      }}
    >
      {/* Attachment preview strip */}
      {attachments.length > 0 && (
        <div style={{
          display: "flex", gap: 8, padding: "10px 24px 0",
          flexWrap: "wrap",
        }}>
          {attachments.map((att, i) => {
            const Icon = getFileIcon(att.type);
            return (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 10px", borderRadius: 8,
                  background: "var(--bg-tertiary)", border: "1px solid var(--border)",
                  fontSize: "0.78rem", color: "var(--text-secondary)",
                }}
              >
                {att.type.startsWith("image/") ? (
                  <img src={att.content} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: "cover" }} />
                ) : (
                  <Icon size={14} />
                )}
                <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {att.name}
                </span>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.7rem" }}>
                  {formatFileSize(att.size)}
                </span>
                <button
                  onClick={() => removeAttachment(i)}
                  style={{
                    background: "none", border: "none", color: "var(--text-secondary)",
                    cursor: "pointer", display: "flex", padding: 2,
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Input row */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 24px 16px",
          alignItems: "flex-end",
        }}
      >
        {/* Attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
          title="Attach files"
        >
          <Plus size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.csv,.json,.md,.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.svg"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

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
            padding: "10px 16px",
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
          disabled={disabled || !hasContent}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: disabled || !hasContent ? "var(--bg-tertiary)" : "#6366f1",
            border: "none",
            color: "#fff",
            cursor: disabled || !hasContent ? "not-allowed" : "pointer",
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
    </div>
  );
}
