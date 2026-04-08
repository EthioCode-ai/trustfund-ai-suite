"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { loadOwnerProfile, OwnerProfile } from "@/lib/storage";
import { getMergedAgents } from "@/lib/agent-manager";
import {
  LayoutDashboard,
  Crown,
  DollarSign,
  Settings,
  Megaphone,
  Compass,
  Database,
  Users,
  History,
  UserCircle,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat/ceo", label: "CEO — Alexandria", icon: Crown, color: "#6366f1" },
  { href: "/chat/cfo", label: "CFO — Marcus", icon: DollarSign, color: "#10b981" },
  { href: "/chat/coo", label: "COO — Priya", icon: Settings, color: "#f59e0b" },
  { href: "/chat/cmo", label: "CMO — Avihai", icon: Megaphone, color: "#ec4899" },
  { href: "/chat/cso", label: "CSO — Lena", icon: Compass, color: "#0ea5e9" },
  { href: "/chat/cdo", label: "CDO — Daniel", icon: Database, color: "#14b8a6" },
  { href: "/boardroom", label: "Boardroom", icon: Users },
  { href: "/history", label: "History", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const [owner, setOwner] = useState<OwnerProfile | null>(null);

  const [customNavItems, setCustomNavItems] = useState<typeof navItems>([]);

  useEffect(() => {
    const load = () => {
      setOwner(loadOwnerProfile());
      try {
        const merged = getMergedAgents();
        const builtInIds = navItems.filter(n => n.href.startsWith("/chat/")).map(n => n.href.replace("/chat/", ""));
        const custom = merged
          .filter((a) => !builtInIds.includes(a.id))
          .map((a) => ({
            href: `/chat/${a.id}`,
            label: `${a.title.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase()} — ${a.name.split(" ")[0]}`,
            icon: LayoutDashboard, // fallback, color handles identity
            color: a.color,
          }));
        setCustomNavItems(custom);
      } catch {
        // ignore
      }
    };
    load();
    window.addEventListener("owner-profile-updated", load);
    return () => window.removeEventListener("owner-profile-updated", load);
  }, []);

  const logoSrc = owner?.companyLogoData || owner?.companyLogoUrl || "";
  const photoSrc = owner?.photoData || owner?.photoUrl || "";

  return (
    <aside
      style={{
        width: 260,
        borderRight: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        padding: "20px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flexShrink: 0,
      }}
    >
      {/* Company Logo + Name */}
      <div
        style={{
          padding: "8px 16px 14px",
          borderBottom: "1px solid var(--border)",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          {logoSrc ? (
            <img
              src={logoSrc}
              alt=""
              style={{ width: 28, height: 28, borderRadius: 6, objectFit: "contain" }}
            />
          ) : null}
          <h1
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            {owner?.companyName || "Neuromart.ai"}
          </h1>
        </div>
        <p
          style={{
            fontSize: "0.65rem",
            color: "var(--text-secondary)",
            marginTop: 2,
            letterSpacing: "0.01em",
          }}
        >
          Agentic AI: Powered by Neuromart
        </p>
      </div>

      {/* Owner's Suite Card */}
      <Link
        href="/settings"
        className={`sidebar-link ${pathname === "/settings" ? "active" : ""}`}
        style={{
          padding: "10px 14px",
          marginBottom: 4,
          borderRadius: 12,
          border: pathname === "/settings" ? "1px solid #6366f140" : "1px solid var(--border)",
          background: "var(--bg-tertiary)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          color: "inherit",
          transition: "all 0.15s",
        }}
      >
        {photoSrc ? (
          <img
            src={photoSrc}
            alt=""
            style={{
              width: 32, height: 32, borderRadius: "50%", objectFit: "cover",
              border: "2px solid #6366f140",
            }}
          />
        ) : (
          <div
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0,
            }}
          >
            {owner?.name?.[0] || <UserCircle size={18} />}
          </div>
        )}
        <div style={{ overflow: "hidden" }}>
          <div style={{
            fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {owner?.name || "Owner's Suite"}
          </div>
          <div style={{
            fontSize: "0.65rem", color: "var(--text-secondary)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {owner?.name ? (owner.role || "Owner") : "Click to configure"}
          </div>
        </div>
      </Link>

      {/* Executive Suite label */}
      <div style={{
        padding: "10px 16px 6px",
        fontSize: "0.65rem",
        fontWeight: 600,
        color: "var(--text-secondary)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        Executive Suite
      </div>

      {[...navItems, ...customNavItems].map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${isActive ? "active" : ""}`}
          >
            <Icon
              size={18}
              style={{ color: item.color || (isActive ? "#fff" : undefined) }}
            />
            {item.label}
          </Link>
        );
      })}

      <div style={{ marginTop: "auto", padding: "16px", fontSize: "0.65rem", color: "var(--text-secondary)" }}>
        <p>Powered by Claude, GPT & Gemini</p>
      </div>
    </aside>
  );
}
