"use client";

import { useState, useEffect } from "react";
import { loadOwnerProfile, saveOwnerProfile, OwnerProfile } from "@/lib/storage";
import { Check } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(loadOwnerProfile());
  }, []);

  if (!profile) return null;

  const update = (field: string, value: string | boolean | object) => {
    setProfile((prev) => prev ? { ...prev, [field]: value } : prev);
    setSaved(false);
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
            <label style={labelStyle}>Profile Photo URL (optional)</label>
            <input
              value={profile.photoUrl}
              onChange={(e) => update("photoUrl", e.target.value)}
              placeholder="https://..."
              style={inputStyle}
            />
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
