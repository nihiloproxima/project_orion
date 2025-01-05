"use client";

import { Sidebar } from "../../components/Sidebar";
import { ResourceBar } from "../../components/ResourceBar";
import { useGame } from "../../contexts/GameContext";
import { useEffect, useState } from "react";
import { LoadingScreen } from "../../components/LoadingScreen";
import { Menu } from "lucide-react";
import { Button } from "../../components/ui/button";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { state } = useGame();
  const [showLoading, setShowLoading] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setShowMobileSidebar(false);
  }, [location.pathname]);

  if (state.loading || showLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Backdrop */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:transform-none ${
          showMobileSidebar
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ResourceBar />
        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
