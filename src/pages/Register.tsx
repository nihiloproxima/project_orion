import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import { supabase } from "../lib/supabase";
import { api } from "../lib/api";

export function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setError("ACCESS CODES DO NOT MATCH");
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

    try {
      const { data: user, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!user || !user.user) throw new Error("User not found");

      await api.users.register(user.user!.id, name);

      navigate("/login");
    } catch (error: any) {
      setError(error.message || "Registration failed");
      console.error("Registration failed:", error);
      await logout();
    }
  };
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

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
                className="font-mono bg-black/30 border-primary/30 focus:border-primary/60 neon-border"
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
                className="font-mono bg-black/30 border-primary/30 focus:border-primary/60 neon-border"
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
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="font-mono bg-black/30 border-primary/30 focus:border-primary/60 neon-border"
                placeholder="****************"
              />
            </div>

            <Button
              type="submit"
              className="w-full font-mono bg-primary/30 hover:bg-primary/40 border border-primary/60 neon-border"
            >
              INITIALIZE ACCESS
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-xs font-mono text-primary/70">
            [EXISTING OPERATOR?]{" "}
            <Link
              to="/login"
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
