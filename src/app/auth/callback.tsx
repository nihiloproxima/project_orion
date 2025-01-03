"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { api } from "../../lib/api";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get session from URL hash
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;
        if (!session) throw new Error("No session found");

        // Get user data
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("User not found");

        // Get Discord username from user metadata
        const discordUsername =
          user.user_metadata?.full_name || user.user_metadata?.name;

        // Register user with Discord username if needed
        await api.users.register(user.id, discordUsername);

        // Redirect to dashboard
        router.push("/dashboard");
      } catch (error) {
        console.error("Auth callback error:", error);
        router.push("/auth/login");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="w-full min-h-screen bg-background cyber-grid flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-mono neon-text">AUTHENTICATING...</h2>
        <p className="text-primary/70 font-mono">
          {">"} ESTABLISHING SECURE CONNECTION
        </p>
      </div>
    </div>
  );
}
