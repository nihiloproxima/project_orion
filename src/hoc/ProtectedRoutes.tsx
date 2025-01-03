"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authedUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authedUser) {
      router.push("/auth/login");
    }
  }, [authedUser, loading, router]);

  if (loading) return <div>Loading...</div>;

  return authedUser ? children : null;
}
