import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { Sidebar } from "@/components/Sidebar";
import { ResourceBar } from "@/components/ResourceBar";

export function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ResourceBar />
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
