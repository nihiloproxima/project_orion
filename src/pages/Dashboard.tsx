import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Database } from "lucide-react";
import { useGame } from "../contexts/GameContext";
import { Navigate } from "react-router-dom";

export function Dashboard() {
  const { state } = useGame();

  if (
    !state.loading &&
    !state.selectedPlanet &&
    state.userPlanets.length === 0
  ) {
    return <Navigate to="/choose-homeworld" />;
  }

  if (state.userPlanets.length === 0) {
    return <Navigate to="/choose-homeworld" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold neon-text mb-2">COMMAND CENTER</h1>
          <p className="text-muted-foreground">
            Welcome, Commander. All systems operational.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium neon-text">
              FLEET STATUS
            </CardTitle>
            <Rocket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15 Ships</div>
            <p className="text-xs text-muted-foreground">
              3 in combat, 12 in orbit
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium neon-text-secondary">
              METAL
            </CardTitle>
            <Database className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {state.resources?.metal || 0}
            </div>
            <p className="text-xs text-muted-foreground">Base Resource</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium neon-text-accent">
              CRYSTAL
            </CardTitle>
            <Database className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {state.resources?.crystal || 0}
            </div>
            <p className="text-xs text-muted-foreground">Advanced Resource</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium neon-text">
              DEUTERIUM
            </CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {state.resources?.deuterium || 0}
            </div>
            <p className="text-xs text-muted-foreground">Fuel Resource</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card/50 backdrop-blur-sm neon-border">
        <CardHeader>
          <CardTitle className="neon-text">RECENT OPERATIONS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                time: "13:45",
                event: "Fleet Alpha engaged in combat",
                status: "In Progress",
                statusColor: "text-secondary",
              },
              {
                time: "12:30",
                event: "Resource extraction completed",
                status: "Complete",
                statusColor: "text-primary",
              },
              {
                time: "11:15",
                event: "New alliance formed",
                status: "Complete",
                statusColor: "text-primary",
              },
              {
                time: "10:00",
                event: "System maintenance",
                status: "Complete",
                statusColor: "text-primary",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-primary/20 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    {activity.time}
                  </span>
                  <span>{activity.event}</span>
                </div>
                <span className={activity.statusColor}>{activity.status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
