"use client";

import { AuthProvider } from "@/contexts/auth";
import { GameProvider } from "@/contexts/GameContext";
import { ThemeProvider } from "@/contexts/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <GameProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </GameProvider>
    </AuthProvider>
  );
}
