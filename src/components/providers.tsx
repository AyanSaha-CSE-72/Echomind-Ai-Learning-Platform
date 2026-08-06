"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useEcho } from "@/lib/store";

export function Providers({ children }: { children: ReactNode }) {
  const theme = useEcho((s) => s.theme);
  const migrateApiKeys = useEcho((s) => s.migrateApiKeys);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
  }, [theme]);

  // Migrate existing API keys with invalid models on mount
  useEffect(() => {
    migrateApiKeys();
  }, [migrateApiKeys]);

  return <>{children}</>;
}
