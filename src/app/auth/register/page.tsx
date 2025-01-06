"use client";

import { useEffect, useState } from "react";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

export default function Register() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to secure communications
    if (isAuthenticated) {
      router.push("/secure-communications");
    }
  }, [isAuthenticated, router]);

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setError("ACCESS CODES DO NOT MATCH");
      return false;
    }
    if (password.length < 6) {
      setError("ACCESS CODE MUST BE AT LEAST 6 CHARACTERS");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) {
      return;
    }

    if (!name) {
      setError("OPERATOR NAME REQUIRED");
      return;
    }

    setIsLoading(true);
    try {
      // First create the auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;
      if (!data?.user) throw new Error("User creation failed");

      // Create user in our database
      const response = await api.users.register(name);

      if (!response.ok) {
        throw new Error("Failed to create user record");
      }

      // Registration successful
      setError(
        "Please check your email to verify your account before logging in."
      );
      await logout(); // Log them out until they verify email

      // Clear form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");

      router.push("/auth/login");
    } catch (error: any) {
      console.error("Registration failed:", error);
      setError(error.message || "Registration failed");
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscordSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
      // Auth callback will handle the rest of the flow
    } catch (error: any) {
      setError(error.message || "Discord authentication failed");
      console.error("Discord auth failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background cyber-grid flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full"></div>
      <Card className="w-[400px] bg-black/50 backdrop-blur-sm border-primary/50 neon-border">
        <CardHeader className="space-y-4">
          <CardTitle className="font-mono text-2xl text-center neon-text tracking-wider">
            NEW OPERATOR REGISTRATION
          </CardTitle>

          <div className="text-xs font-mono text-primary/70">
            {">"} INITIALIZING REGISTRATION SEQUENCE...
          </div>
          {error && (
            <div className="text-xs font-mono text-red-500 bg-red-500/10 p-2 border border-red-500/30 rounded animate-pulse">
              {">"} ERROR: {error}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleDiscordSignIn}
            disabled={isLoading}
            className="w-full mb-6 font-mono bg-[#5865F2]/80 hover:bg-[#5865F2]/90 border border-[#5865F2]/60 neon-border text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "CONNECTING..." : "CONNECT WITH DISCORD"}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-primary/30"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-primary/70 font-mono">
                Or continue with email
              </span>
            </div>
          </div>

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
                disabled={isLoading}
                className="font-mono bg-black/30 border-primary/30 focus:border-primary/60 neon-border disabled:opacity-50"
                placeholder="enter.operator@id"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="pseudonym"
                className="font-mono text-sm text-primary/90"
              >
                [OPERATOR NAME]
              </Label>
              <Input
                id="pseudonym"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="font-mono bg-black/30 border-primary/30 focus:border-primary/60 neon-border disabled:opacity-50"
                placeholder="enter_name"
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
                disabled={isLoading}
                className="font-mono bg-black/30 border-primary/30 focus:border-primary/60 neon-border disabled:opacity-50"
                placeholder="****************"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="font-mono text-sm text-primary/90"
              >
                [VERIFY ACCESS CODE]
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                required
                disabled={isLoading}
                className="font-mono bg-black/30 border-primary/30 focus:border-primary/60 neon-border disabled:opacity-50"
                placeholder="****************"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-mono bg-primary/80 hover:bg-primary/90 border border-primary/60 neon-border disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "INITIALIZING..." : "INITIALIZE ACCESS"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-xs font-mono text-primary/70">
            [EXISTING OPERATOR?]{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary/80 neon-text"
            >
              ACCESS SYSTEM
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
