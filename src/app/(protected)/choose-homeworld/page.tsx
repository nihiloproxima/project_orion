"use client";
import { useEffect } from "react";
import { useGame } from "@/contexts/GameContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GalaxyMap2D } from "@/components/GalaxyMap2D/GalaxyMap2D";
import { usePlanets } from "@/hooks/usePlanets";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Planet } from "@/models/planet";
import { api } from "@/lib/api";
import GalaxyMap from "@/components/ThreeMap/GalaxyMap";

export default function ChooseHomeworldPage() {
  const { state } = useGame();
  const { unclaimedPlanets, loading } = usePlanets();
  const router = useRouter();

  // Redirect to dashboard if user already has a planet
  useEffect(() => {
    if (state.selectedPlanet?.id) {
      router.push("/dashboard");
    }
  }, [state.selectedPlanet, router]);

  const handlePlanetSelect = async (planet: Planet) => {
    try {
      await api.planets.claim(planet.id, true);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error claiming planet:", error);
    }
  };

  if (loading) {
    return <LoadingScreen message="SCANNING STAR SYSTEMS..." />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <Card className="border-2 shadow-2xl shadow-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold neon-text text-center">
              SELECT YOUR HOMEWORLD
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground mb-6">
              Choose your starting planet carefully, Commander. This decision
              will shape your destiny.
              {unclaimedPlanets.length} unclaimed worlds await your command.
            </p>

            <div className="flex justify-center">
              <GalaxyMap
                mode="homeworld"
                onPlanetSelect={handlePlanetSelect}
                allowedPlanets={unclaimedPlanets.map((p) => p.id)}
              />
              {/* <GalaxyMap2D
                mode="homeworld"
                onPlanetSelect={handlePlanetSelect}
                allowedPlanets={unclaimedPlanets.map((p) => p.id)}
                initialZoom={0.5}
                initialCenter={{ x: 0, y: 0 }}
                width="100%"
                height="600px"
              /> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
