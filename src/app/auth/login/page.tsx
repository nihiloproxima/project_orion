"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
    } catch (error: any) {
      setError(error.message || "Login failed");
      console.error("Login failed:", error);
    }
  };

  const handleDiscordSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      console.log(data);

      if (error) throw error;

      // Get user data after successful sign in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not found");

      // Get Discord username from user metadata
      const discordUsername =
        user.user_metadata?.full_name || user.user_metadata?.name;

      // Register user with Discord username
      await api.users.register(user.id, discordUsername);
    } catch (error: any) {
      setError(error.message || "Discord authentication failed");
      console.error("Discord auth failed:", error);
    }
  };

  if (isAuthenticated) {
    router.push("/dashboard");
  }

  return (
    <div className="w-full min-h-screen bg-background cyber-grid flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full"></div>
      <Card className="w-[400px] bg-black/50 backdrop-blur-sm border-primary/50 neon-border">
        <CardHeader className="space-y-4">
          <CardTitle className="font-mono text-2xl text-center neon-text tracking-wider">
            SYSTEM ACCESS
          </CardTitle>

          <div className="text-xs font-mono text-primary/70">
            {">"} INITIALIZING LOGIN SEQUENCE...
          </div>
          {error && (
            <div className="text-xs font-mono text-red-500 bg-red-500/10 p-2 border border-red-500/30 rounded">
              {">"} ERROR: {error}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-mono text-sm text-primary/90"
              >
                [OPERATOR EMAIL]
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-mono bg-black/30 border-primary/30 focus:border-primary/60 neon-border"
                placeholder="enter.operator@id"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-mono text-sm text-primary/90"
              >
                [ACCESS CODE]
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="font-mono bg-black/30 border-primary/30 focus:border-primary/60 neon-border"
                placeholder="****************"
              />
            </div>
            <Button
              type="submit"
              className="w-full font-mono bg-primary/80 hover:bg-primary/90 border border-primary/60 neon-border"
            >
              AUTHENTICATE
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-primary/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-primary/70 font-mono">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleDiscordSignIn}
              className="w-full font-mono bg-[#5865F2]/80 hover:bg-[#5865F2]/90 border border-[#5865F2]/60 neon-border text-white "
            >
              DISCORD LOGIN
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-xs font-mono text-primary/70">
            [NEW OPERATOR?]{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:text-primary/80 neon-text"
            >
              INITIALIZE REGISTRATION
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
