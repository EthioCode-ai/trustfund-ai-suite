"use client";

import { useEffect } from "react";
import { loadOwnerProfile } from "@/lib/storage";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const applyTheme = () => {
      const profile = loadOwnerProfile();
      document.documentElement.setAttribute("data-theme", profile.appTheme || "dark");
    };
    applyTheme();
    window.addEventListener("owner-profile-updated", applyTheme);
    return () => window.removeEventListener("owner-profile-updated", applyTheme);
  }, []);

  return <>{children}</>;
}
