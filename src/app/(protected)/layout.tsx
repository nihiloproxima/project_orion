"use client";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import ProtectedRoute from "@/hoc/ProtectedRoutes";
import { Toaster } from "@/components/ui/toaster";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AuthLayout>
        {children}
        <Toaster />
      </AuthLayout>
    </ProtectedRoute>
  );
}
