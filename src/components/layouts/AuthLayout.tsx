import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/auth";
import { Sidebar } from "../../components/Sidebar";
import { ResourceBar } from "../../components/ResourceBar";
import { useGame } from "../../contexts/GameContext";
import { useEffect, useState } from "react";
import { LoadingScreen } from "../../components/LoadingScreen";

export function AuthLayout() {
  const { isAuthenticated } = useAuth();
  const { state } = useGame();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Set a minimum loading time of 5 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (state.loading || showLoading) {
    return <LoadingScreen />;
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
