import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, MessageSquare, Users, Activity } from "lucide-react";
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

      {/* Alert Message */}
      <Card className="bg-red-900/30 border-red-500/50 backdrop-blur-sm animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-red-500 font-bold flex items-center gap-2">
            ⚠️ ALERT: INCOMING HOSTILE FLEET
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-400 space-y-2">
            <p>Hostile fleet detected approaching Colony Alpha-7</p>
            <div className="font-mono text-xl">
              Time until impact: <span className="text-red-500">14:32</span>
            </div>
            <div className="text-sm">
              Fleet composition: 5 Battlecruisers, 12 Destroyers
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <CardTitle className="text-sm font-medium neon-text">
              ACTIVE PLAYERS
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">25 in your sector</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium neon-text">
              SYSTEM STATUS
            </CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">OPTIMAL</div>
            <p className="text-xs text-muted-foreground">All systems green</p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Window */}
      <Card className="bg-card/50 backdrop-blur-sm neon-border h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle className="neon-text flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            UNIVERSAL COMMS
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto mb-4 font-mono">
            {[
              {
                user: "SYSTEM",
                message: "⚠️ ALERT: Hostile fleet detected in sector Alpha-7!",
                time: "13:47",
              },
              {
                user: "Commander_X",
                message: "Detected unusual activity in sector 7",
                time: "13:45",
              },
              {
                user: "Ghost_Protocol",
                message:
                  "Alliance Delta requesting support at coordinates 127.0.0.1",
                time: "13:42",
              },
              {
                user: "Sys_Admin",
                message:
                  "Network stability at 99.9%. Optimal conditions for fleet operations.",
                time: "13:40",
              },
              {
                user: "Neural_Link",
                message: "Trading resources at Station Alpha. Any takers?",
                time: "13:38",
              },
            ].map((msg, index) => (
              <div key={index} className="text-sm">
                <span className="text-primary">[{msg.time}]</span>{" "}
                <span
                  className={`text-secondary ${
                    msg.user === "SYSTEM" ? "text-red-500" : ""
                  }`}
                >
                  {msg.user}:
                </span>{" "}
                <span
                  className={`text-muted-foreground ${
                    msg.user === "SYSTEM" ? "text-red-400" : ""
                  }`}
                >
                  {msg.message}
                </span>
              </div>
            ))}
          </div>
          <div className="border border-primary/30 rounded p-2">
            <input
              type="text"
              placeholder="> Enter message..."
              className="w-full bg-transparent border-none focus:outline-none text-primary placeholder:text-primary/50"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
