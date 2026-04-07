"use client";

import { useState, useEffect } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "locked">("loading");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((data) => setStatus(data.authenticated ? "authenticated" : "locked"))
      .catch(() => setStatus("locked"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success) {
      setStatus("authenticated");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  if (status === "loading") {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "var(--bg-primary)", color: "var(--text-secondary)",
      }}>
        <div className="typing-indicator"><span /><span /><span /></div>
      </div>
    );
  }

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--bg-primary)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "48px 40px",
          width: 380,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "1.5rem",
          }}
        >
          N
        </div>
        <h1
          style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 4,
            letterSpacing: "-0.02em",
          }}
        >
          Neuromart.ai
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 28 }}>
          Executive Suite
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter access password"
          autoFocus
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 10,
            border: error ? "1px solid #ef4444" : "1px solid var(--border)",
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
            fontSize: "0.95rem",
            outline: "none",
            marginBottom: 8,
            fontFamily: "inherit",
          }}
        />

        {error && (
          <p style={{ fontSize: "0.78rem", color: "#ef4444", marginBottom: 8 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={!password}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            border: "none",
            background: password ? "linear-gradient(135deg, #6366f1, #818cf8)" : "var(--bg-tertiary)",
            color: password ? "#fff" : "var(--text-secondary)",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: password ? "pointer" : "not-allowed",
            marginTop: 8,
            transition: "all 0.15s",
          }}
        >
          Access ExecSuite
        </button>
      </form>
    </div>
  );
}
