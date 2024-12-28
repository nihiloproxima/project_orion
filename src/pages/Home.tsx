import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { useAuth } from "../contexts/auth";

export function Home() {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(
    () => Math.floor(Math.random() * 1000) + 500
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((current) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(100, current + change);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Navigation */}
      {!isAuthenticated && (
        <nav className="p-6 flex justify-between items-center backdrop-blur-sm border-b neon-border">
          <h1 className="text-2xl font-bold neon-text">PROJECT ORION</h1>
          <div className="space-x-4">
            <Link to="/login">
              <Button
                variant="outline"
                className="neon-border hover:bg-primary/20"
              >
                LOGIN
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-primary hover:bg-primary/80 text-primary-foreground">
                REGISTER
              </Button>
            </Link>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24 text-center relative">
        {/* <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full"></div> */}
        <h1 className="text-7xl font-bold mb-6 neon-text tracking-tight">
          Project Orion
        </h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Command your fleet through the vast expanse of space. Build, trade,
          and conquer in this immersive multiplayer strategy game.
        </p>
        <div className="text-lg text-muted-foreground mb-8">
          <span className="neon-text font-mono">{count}</span> commanders online
        </div>
        <Link to="/login">
          <Button
            size="lg"
            className="px-8 py-6 text-xl bg-primary hover:bg-primary/80 text-primary-foreground neon-border"
          >
            LAUNCH MISSION
          </Button>
        </Link>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="neon-text-secondary">Fleet Command</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Command powerful spacecraft and strategic operations across the
            galaxy.
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="neon-text-accent">Resource Empire</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Build and manage your resource network across multiple star systems.
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="neon-text">Alliance Warfare</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Form alliances and engage in epic space battles for galactic
            dominance.
          </CardContent>
        </Card>
      </div>

      {/* Latest Update Section */}
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-card/50 backdrop-blur-sm neon-border">
          <CardHeader>
            <CardTitle className="text-2xl neon-text">
              SYSTEM UPDATE v1.0.1
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold neon-text-secondary">
                NEW FEATURES
              </h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Advanced resource management algorithms</li>
                <li>Quantum defense systems</li>
                <li>Real-time trading network</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold neon-text-accent">
                IMPROVEMENTS
              </h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Enhanced neural interface</li>
                <li>Optimized quantum calculations</li>
                <li>Improved battle simulation engine</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
