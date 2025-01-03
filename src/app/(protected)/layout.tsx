import { AuthLayout } from "@/components/layouts/AuthLayout";
import ProtectedRoute from "@/hoc/ProtectedRoutes";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AuthLayout>{children}</AuthLayout>
    </ProtectedRoute>
  );
}
