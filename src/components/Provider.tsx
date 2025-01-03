"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <GameProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </GameProvider>
    </AuthProvider>
  );
}
