import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AuthGate } from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "Neuromart.ai — Executive Suite",
  description: "AI-powered C-suite for Neuromart.ai",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthGate>
          <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
          </div>
        </AuthGate>
      </body>
    </html>
  );
}
