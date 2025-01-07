"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;
        if (!session) throw new Error("No session found");

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        // Check if user exists in users table
        const { data: existingUser } = await supabase
          .from("users")
          .select()
          .eq("id", user.id)
          .single();

        if (!existingUser) {
          // New user - redirect to create profile
          router.push("/create-user");
        } else if (!existingUser.home_planet_id) {
          // User exists but needs homeworld
          router.push("/secure-communications");
        } else {
          // Complete user - go to dashboard
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        router.push("/auth/login");
      }
    };

    handleCallback();
  }, [router]);

  return <LoadingScreen message="INITIALIZING..." />;
}
