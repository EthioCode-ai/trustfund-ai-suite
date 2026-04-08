"use client";

import { useState, useEffect, useRef } from "react";
import { loadOwnerProfile, saveOwnerProfile, OwnerProfile, CustomAgent } from "@/lib/storage";
import { ICON_OPTIONS, COLOR_OPTIONS } from "@/lib/agent-manager";
import { Check, Upload, X, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfile(loadOwnerProfile());
  }, []);

  if (!profile) return null;

  const update = (field: string, value: string | boolean | object) => {
    setProfile((prev) => prev ? { ...prev, [field]: value } : prev);
    setSaved(false);
  };

  const handleFileUpload = (field: "photoData" | "companyLogoData") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      alert("File too large. Please use an image under 500KB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      update(field, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!profile) return;
    saveOwnerProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    fontSize: "0.9rem",
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle = {
    fontSize: "0.8rem",
    fontWeight: 600 as const,
    color: "var(--text-secondary)",
    marginBottom: 6,
    display: "block" as const,
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 4 }}>
            Owner&apos;s Suite
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Your profile is used by all executives for communications, decks, and reports.
          </p>
        </div>
        <button
          onClick={handleSave}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 24px", borderRadius: 10,
            border: "none",
            background: saved ? "#10b981" : "linear-gradient(135deg, #6366f1, #818cf8)",
            color: "#fff", fontSize: "0.9rem", fontWeight: 600,
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          {saved && <Check size={16} />}
          {saved ? "Saved!" : "Save Profile"}
        </button>
      </div>

      {/* Personal Info */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
          Personal Information
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              value={profile.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Dr. Abiy Selassie"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Role / Title</label>
            <input
              value={profile.role}
              onChange={(e) => update("role", e.target.value)}
              placeholder="Founder & CEO"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="abiy@neuromart.ai"
              style={inputStyle}
            />
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: 4 }}>
              Used for all exec communications, calendar invites, and digests
            </p>
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+1 555 123 4567"
              style={inputStyle}
            />
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: 4 }}>
              Used for SMS notifications and meeting confirmations
            </p>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Profile Photo</label>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {(profile.photoData || profile.photoUrl) ? (
                <div style={{ position: "relative" }}>
                  <img
                    src={profile.photoData || profile.photoUrl}
                    alt=""
                    style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }}
                  />
                  <button
                    onClick={() => { update("photoData", ""); update("photoUrl", ""); }}
                    style={{
                      position: "absolute", top: -4, right: -4, width: 20, height: 20,
                      borderRadius: "50%", background: "#ef4444", border: "none",
                      color: "#fff", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "var(--bg-tertiary)", border: "2px dashed var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-secondary)",
                }}>
                  <Upload size={20} />
                </div>
              )}
              <div>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  style={{
                    padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)",
                    background: "var(--bg-tertiary)", color: "var(--text-secondary)",
                    fontSize: "0.8rem", cursor: "pointer", marginBottom: 4,
                  }}
                >
                  Upload Photo
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" onChange={handleFileUpload("photoData")} style={{ display: "none" }} />
                <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>PNG, JPG under 500KB. Or paste a URL below.</p>
                <input
                  value={profile.photoUrl}
                  onChange={(e) => update("photoUrl", e.target.value)}
                  placeholder="Or paste image URL..."
                  style={{ ...inputStyle, marginTop: 4, fontSize: "0.8rem", padding: "6px 10px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
          Company Information
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <label style={labelStyle}>Company Name</label>
            <input
              value={profile.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              placeholder="Neuromart.ai"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Industry</label>
            <input
              value={profile.industry}
              onChange={(e) => update("industry", e.target.value)}
              placeholder="AI / Technology"
              style={inputStyle}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Company Tagline</label>
            <input
              value={profile.companyTagline}
              onChange={(e) => update("companyTagline", e.target.value)}
              placeholder="AI Solutions for Every Business"
              style={inputStyle}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Company Logo</label>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {(profile.companyLogoData || profile.companyLogoUrl) ? (
                <div style={{ position: "relative" }}>
                  <img
                    src={profile.companyLogoData || profile.companyLogoUrl}
                    alt=""
                    style={{ width: 48, height: 48, borderRadius: 8, objectFit: "contain", border: "1px solid var(--border)", background: "var(--bg-tertiary)", padding: 4 }}
                  />
                  <button
                    onClick={() => { update("companyLogoData", ""); update("companyLogoUrl", ""); }}
                    style={{
                      position: "absolute", top: -4, right: -4, width: 20, height: 20,
                      borderRadius: "50%", background: "#ef4444", border: "none",
                      color: "#fff", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div style={{
                  width: 48, height: 48, borderRadius: 8,
                  background: "var(--bg-tertiary)", border: "2px dashed var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-secondary)",
                }}>
                  <Upload size={18} />
                </div>
              )}
              <div>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  style={{
                    padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)",
                    background: "var(--bg-tertiary)", color: "var(--text-secondary)",
                    fontSize: "0.8rem", cursor: "pointer", marginBottom: 4,
                  }}
                >
                  Upload Logo
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleFileUpload("companyLogoData")} style={{ display: "none" }} />
                <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>Displayed next to your company name in the sidebar. PNG, JPG under 500KB.</p>
                <input
                  value={profile.companyLogoUrl}
                  onChange={(e) => update("companyLogoUrl", e.target.value)}
                  placeholder="Or paste logo URL..."
                  style={{ ...inputStyle, marginTop: 4, fontSize: "0.8rem", padding: "6px 10px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
          Appearance
        </h2>
        <div>
          <label style={labelStyle}>Theme</label>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { value: "dark" as const, label: "Dark", icon: "🌙", desc: "Dark background, light text" },
              { value: "light" as const, label: "Light", icon: "☀️", desc: "Light background, dark text" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => update("appTheme", opt.value)}
                style={{
                  flex: 1,
                  padding: "16px 20px",
                  borderRadius: 12,
                  border: profile.appTheme === opt.value ? "2px solid #6366f1" : "1px solid var(--border)",
                  background: profile.appTheme === opt.value ? "#6366f110" : "var(--bg-tertiary)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: "1.2rem", marginBottom: 6 }}>{opt.icon}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Communication Preferences */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
          Communication Preferences
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <label style={labelStyle}>Weekly Digest Frequency</label>
            <select
              value={profile.communicationPrefs.digestFrequency}
              onChange={(e) =>
                update("communicationPrefs", {
                  ...profile.communicationPrefs,
                  digestFrequency: e.target.value,
                })
              }
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Auto-send Communications</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
              <button
                onClick={() =>
                  update("communicationPrefs", {
                    ...profile.communicationPrefs,
                    autoSend: !profile.communicationPrefs.autoSend,
                  })
                }
                style={{
                  width: 48, height: 26, borderRadius: 13, border: "none",
                  background: profile.communicationPrefs.autoSend ? "#6366f1" : "var(--bg-tertiary)",
                  cursor: "pointer", position: "relative", transition: "all 0.2s",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", background: "#fff",
                  position: "absolute", top: 3,
                  left: profile.communicationPrefs.autoSend ? 25 : 3,
                  transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </button>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                {profile.communicationPrefs.autoSend ? "Emails send automatically" : "Review before sending (recommended)"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Rules of Engagement */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
          Rules of Engagement
        </h2>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 16 }}>
          These rules become the North Star for every agent. They will follow these guidelines above all other instructions.
        </p>
        <textarea
          value={profile.rulesOfEngagement}
          onChange={(e) => update("rulesOfEngagement", e.target.value)}
          placeholder={"Examples:\n• Always cite sources for any data or statistics\n• Never make timeline promises without consulting the COO\n• All financial projections must include bull/base/bear scenarios\n• Address the founder as Dr. Selassie\n• Prioritize East Africa and North America as target markets\n• When in doubt, ask — don't assume"}
          rows={8}
          style={{
            ...inputStyle,
            minHeight: 160,
            resize: "vertical",
            lineHeight: 1.7,
          }}
        />
      </section>

      {/* Agent Manager */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Agent Manager
          </h2>
          <button
            onClick={() => {
              const newAgent: CustomAgent = {
                id: `custom-${Date.now()}`,
                name: "",
                title: "",
                provider: "openai",
                color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)],
                icon: "Zap",
                description: "",
                capabilities: [],
                customInstructions: "",
                enabled: true,
              };
              update("customAgents", [...(profile.customAgents || []), newAgent]);
            }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 8,
              background: "#6366f1", border: "none", color: "#fff",
              fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            <Plus size={14} />
            Add Agent
          </button>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 16 }}>
          Add, remove, or customize your executive team. Custom agents appear alongside the built-in team.
        </p>

        {(!profile.customAgents || profile.customAgents.length === 0) && (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem", background: "var(--bg-tertiary)", borderRadius: 12, border: "1px solid var(--border)" }}>
            No custom agents yet. Click &quot;Add Agent&quot; to create one.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(profile.customAgents || []).map((agent, idx) => (
            <AgentEditor
              key={agent.id}
              agent={agent}
              inputStyle={inputStyle}
              labelStyle={labelStyle}
              onUpdate={(updated) => {
                const agents = [...(profile.customAgents || [])];
                agents[idx] = updated;
                update("customAgents", agents);
              }}
              onDelete={() => {
                const agents = (profile.customAgents || []).filter((_, i) => i !== idx);
                update("customAgents", agents);
              }}
            />
          ))}
        </div>
      </section>

      {/* Preview */}
      <section>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
          Profile Preview
        </h2>
        <div style={{
          padding: 24, borderRadius: 16, background: "var(--bg-secondary)",
          border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 20,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: profile.photoUrl ? `url(${profile.photoUrl}) center/cover` : "linear-gradient(135deg, #6366f1, #818cf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "1.5rem", fontWeight: 700, flexShrink: 0,
          }}>
            {!profile.photoUrl && (profile.name?.[0] || "?")}
          </div>
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {profile.name || "Your Name"}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#6366f1", fontWeight: 500 }}>
              {profile.role || "Your Role"} — {profile.companyName || "Your Company"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 4 }}>
              {profile.email || "your@email.com"} {profile.phone ? `· ${profile.phone}` : ""}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AgentEditor({
  agent, inputStyle, labelStyle, onUpdate, onDelete,
}: {
  agent: CustomAgent;
  inputStyle: Record<string, unknown>;
  labelStyle: Record<string, unknown>;
  onUpdate: (agent: CustomAgent) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(!agent.name);

  const set = (field: string, value: unknown) => {
    onUpdate({ ...agent, [field]: value });
  };

  return (
    <div style={{
      background: "var(--bg-tertiary)",
      border: `1px solid ${agent.enabled ? agent.color + "40" : "var(--border)"}`,
      borderRadius: 12,
      overflow: "hidden",
      opacity: agent.enabled ? 1 : 0.6,
    }}>
      {/* Header */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px", cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${agent.color}20`, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: "0.9rem", fontWeight: 700, color: agent.color,
        }}>
          {agent.name?.[0] || "?"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
            {agent.name || "New Agent"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            {agent.title || "Untitled Role"} — {agent.provider === "anthropic" ? "Claude" : agent.provider === "google" ? "Gemini" : "GPT-4o"}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); set("enabled", !agent.enabled); }}
          style={{
            width: 40, height: 22, borderRadius: 11, border: "none",
            background: agent.enabled ? "#10b981" : "var(--border)",
            cursor: "pointer", position: "relative", transition: "all 0.2s",
          }}
        >
          <div style={{
            width: 16, height: 16, borderRadius: "50%", background: "#fff",
            position: "absolute", top: 3,
            left: agent.enabled ? 21 : 3, transition: "left 0.2s",
          }} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4, display: "flex" }}
        >
          <Trash2 size={16} />
        </button>
        {expanded ? <ChevronUp size={16} style={{ color: "var(--text-secondary)" }} /> : <ChevronDown size={16} style={{ color: "var(--text-secondary)" }} />}
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input value={agent.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Sarah Mitchell" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Title</label>
              <input value={agent.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Chief Product Officer" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>LLM Provider</label>
              <select value={agent.provider} onChange={(e) => set("provider", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="anthropic">Claude (Anthropic)</option>
                <option value="openai">GPT-4o (OpenAI)</option>
                <option value="google">Gemini (Google)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Accent Color</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => set("color", c)}
                    style={{
                      width: 24, height: 24, borderRadius: 6, background: c,
                      border: agent.color === c ? "2px solid var(--text-primary)" : "2px solid transparent",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description (shown on dashboard card)</label>
            <input value={agent.description} onChange={(e) => set("description", e.target.value)} placeholder="What does this agent do?" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Capabilities (comma-separated)</label>
            <input
              value={agent.capabilities.join(", ")}
              onChange={(e) => set("capabilities", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
              placeholder="e.g. Product roadmap, Feature prioritization, User research"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Custom Instructions</label>
            <textarea
              value={agent.customInstructions}
              onChange={(e) => set("customInstructions", e.target.value)}
              placeholder={"Detailed instructions for this agent's behavior, expertise, and responsibilities.\n\ne.g. You are the Chief Product Officer. Your responsibilities include:\n1. Product roadmap and prioritization\n2. Feature scoping and user story writing\n3. User research synthesis\n..."}
              rows={6}
              style={{ ...inputStyle, resize: "vertical", minHeight: 120, lineHeight: 1.6 }}
            />
          </div>

          <div>
            <label style={labelStyle}>Icon</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => set("icon", icon)}
                  style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem",
                    background: agent.icon === icon ? `${agent.color}20` : "var(--bg-secondary)",
                    border: agent.icon === icon ? `1px solid ${agent.color}` : "1px solid var(--border)",
                    color: agent.icon === icon ? agent.color : "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
