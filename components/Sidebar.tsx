"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Crown,
  DollarSign,
  Settings,
  Megaphone,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat/ceo", label: "CEO — Alexandria", icon: Crown, color: "#6366f1" },
  { href: "/chat/cfo", label: "CFO — Marcus", icon: DollarSign, color: "#10b981" },
  { href: "/chat/coo", label: "COO — Priya", icon: Settings, color: "#f59e0b" },
  { href: "/chat/cmo", label: "CMO — Jordan", icon: Megaphone, color: "#ec4899" },
  { href: "/boardroom", label: "Boardroom", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

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
      <div
        style={{
          padding: "8px 16px 20px",
          borderBottom: "1px solid var(--border)",
          marginBottom: 12,
        }}
      >
        <h1
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          Neuromart.ai
        </h1>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            marginTop: 2,
          }}
        >
          Executive Suite
        </p>
      </div>

      {navItems.map((item) => {
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

      <div style={{ marginTop: "auto", padding: "16px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
        <p>Powered by Claude & GPT</p>
      </div>
    </aside>
  );
}
