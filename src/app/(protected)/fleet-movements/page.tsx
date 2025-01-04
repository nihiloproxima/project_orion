"use client";

import { useEffect, useState } from "react";
import { useGame } from "../../../contexts/GameContext";
import { FleetMovement } from "../../../models/fleet_movement";
import { supabase } from "../../../lib/supabase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import {
  AlertTriangle,
  ArrowRight,
  Rocket,
  Hammer,
  Microchip,
  Flame,
  Beaker,
} from "lucide-react";
import { Timer } from "../../../components/Timer";
import { getPublicImageUrl } from "@/lib/images";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

export default function FleetMovements() {
  const { state } = useGame();
  const [movements, setMovements] = useState<FleetMovement[]>([]);
  const [hostileMovements, setHostileMovements] = useState<FleetMovement[]>([]);
  const [expandedMovement, setExpandedMovement] = useState<string | null>(null);
  const [missionFilter, setMissionFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("arrival");
  const [displayMode, setDisplayMode] = useState<"grid" | "rows">("grid");

  // Fetch initial fleet movements
  useEffect(() => {
    const fetchMovements = async () => {
      // Get own fleet movements
      const { data: ownMovements } = await supabase
        .from("fleet_movements")
        .select("*")
        .eq("owner_id", state.currentUser?.id);

      // Get hostile movements targeting user's planets
      const { data: incomingMovements } = await supabase
        .from("fleet_movements")
        .select("*")
        .neq("owner_id", state.currentUser?.id)
        .in("destination_planet_id", state.userPlanets?.map((p) => p.id) || []);

      setMovements(ownMovements || []);
      setHostileMovements(incomingMovements || []);
    };

    fetchMovements();
  }, [state.currentUser?.id, state.userPlanets]);

  // Subscribe to fleet movement updates
  useEffect(() => {
    const movementsSubscription = supabase
      .channel("fleet_movements")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fleet_movements",
          filter: `owner_id=eq.${state.currentUser?.id}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setMovements((current) =>
              current.filter((m) => m.id !== payload.old.id)
            );
          } else {
            const movement = payload.new as FleetMovement;
            setMovements((current) => {
              const updated = [...current];
              const index = updated.findIndex((m) => m.id === movement.id);
              if (index >= 0) {
                updated[index] = movement;
              } else {
                updated.push(movement);
              }
              return updated;
            });
          }
        }
      )
      .subscribe();

    // Subscribe to hostile movements
    const hostileSubscription = supabase
      .channel("hostile_movements")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fleet_movements",
          filter: `destination_planet_id=in.(${state.planets
            ?.map((p) => p.id)
            .join(",")})`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setHostileMovements((current) =>
              current.filter((m) => m.id !== payload.old.id)
            );
          } else {
            const movement = payload.new as FleetMovement;
            if (movement.owner_id !== state.currentUser?.id) {
              setHostileMovements((current) => {
                const updated = [...current];
                const index = updated.findIndex((m) => m.id === movement.id);
                if (index >= 0) {
                  updated[index] = movement;
                } else {
                  updated.push(movement);
                }
                return updated;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      movementsSubscription.unsubscribe();
      hostileSubscription.unsubscribe();
    };
  }, [state.currentUser?.id, state.planets]);

  // Add planet lookup helper
  const getPlanetName = (x: number, y: number) => {
    return (
      state.planets?.find((p) => p.coordinate_x === x && p.coordinate_y === y)
        ?.name || `(${x}, ${y})`
    );
  };

  // Add sorting function
  const sortMovements = (movements: FleetMovement[]) => {
    return [...movements].sort((a, b) => {
      switch (sortBy) {
        case "arrival":
          return (
            new Date(a.arrival_time).getTime() -
            new Date(b.arrival_time).getTime()
          );
        case "departure":
          return (
            new Date(a.departure_time).getTime() -
            new Date(b.departure_time).getTime()
          );
        case "ships":
          return (
            Object.values(b.ship_counts || {}).reduce(
              (sum, count) => sum + count,
              0
            ) -
            Object.values(a.ship_counts || {}).reduce(
              (sum, count) => sum + count,
              0
            )
          );
        case "resources":
          return (
            Object.values(b.resources || {}).reduce(
              (sum, count) => sum + count,
              0
            ) -
            Object.values(a.resources || {}).reduce(
              (sum, count) => sum + count,
              0
            )
          );
        default:
          return 0;
      }
    });
  };

  // Add filter function
  const filterMovements = (movements: FleetMovement[]) => {
    if (missionFilter === "all") return movements;
    return movements.filter((m) => m.mission_type === missionFilter);
  };

  // Add controls component
  const MovementControls = () => (
    <div
      className="flex flex-wrap gap-4 mb-4"
      onClick={(e) => e.stopPropagation()}
    >
      <Select
        value={missionFilter}
        onValueChange={(value) => {
          setMissionFilter(value);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by mission" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Missions</SelectItem>
          <SelectItem value="attack">Attack</SelectItem>
          <SelectItem value="transport">Transport</SelectItem>
          <SelectItem value="colonize">Colonize</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sortBy}
        onValueChange={(value) => {
          setSortBy(value);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="arrival">Arrival Time</SelectItem>
          <SelectItem value="departure">Departure Time</SelectItem>
          <SelectItem value="ships">Ship Count</SelectItem>
          <SelectItem value="resources">Resource Amount</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={displayMode}
        onValueChange={(value: "grid" | "rows") => {
          setDisplayMode(value);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Display mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="grid">Grid View</SelectItem>
          <SelectItem value="rows">Row View</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const renderMovementCard = (
    movement: FleetMovement,
    isHostile: boolean = false
  ) => (
    <Card
      key={movement.id}
      className={`${
        isHostile ? "border-red-500/50 bg-red-950/10" : "border-primary/20"
      } cursor-pointer transition-all hover:scale-[1.02]`}
      onClick={() =>
        setExpandedMovement(
          expandedMovement === movement.id ? null : movement.id
        )
      }
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isHostile && <AlertTriangle className="h-5 w-5 text-red-500" />}
          <Rocket className="h-5 w-5" />
          {movement.mission_type.charAt(0).toUpperCase() +
            movement.mission_type.slice(1)}{" "}
          Mission
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              Origin: {getPlanetName(movement.origin_x, movement.origin_y)}
            </div>
            <ArrowRight className="h-4 w-4" />
            <div className="text-sm">
              Destination:{" "}
              {getPlanetName(movement.destination_x, movement.destination_y)}
            </div>
          </div>

          <div className="text-sm">
            Status:{" "}
            {movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}
          </div>

          <div className="text-sm">
            <Timer
              startTime={movement.departure_time}
              finishTime={movement.arrival_time}
            />
          </div>

          {expandedMovement === movement.id && (
            <>
              {movement.ship_counts && (
                <div className="text-sm mt-2">
                  <div className="font-semibold mb-1">Fleet:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(movement.ship_counts).map(
                      ([shipType, count]) =>
                        count > 0 && (
                          <div
                            key={shipType}
                            className="flex items-center gap-2"
                          >
                            <Image
                              src={getPublicImageUrl(
                                "ships",
                                shipType + ".webp"
                              )}
                              width={24}
                              height={24}
                              alt={shipType}
                              className="w-6 h-6"
                            />
                            {shipType}: {count}
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}

              {/* Expanded resources section */}
              {movement.resources && (
                <div className="text-sm mt-2">
                  <div className="font-semibold mb-1">Cargo:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(movement.resources).map(
                      ([resource, amount]) => {
                        const resourceConfig = {
                          metal: {
                            icon: <Hammer className="h-6 w-6 text-secondary" />,
                            color: "text-secondary",
                          },
                          microchips: {
                            icon: <Microchip className="h-6 w-6 text-accent" />,
                            color: "text-accent",
                          },
                          deuterium: {
                            icon: <Flame className="h-6 w-6 text-primary" />,
                            color: "text-primary",
                          },
                          science: {
                            icon: <Beaker className="h-6 w-6 text-blue-400" />,
                            color: "text-blue-400",
                          },
                        }[resource.toLowerCase()];

                        return (
                          amount > 0 && (
                            <div
                              key={resource}
                              className="flex items-center gap-2"
                            >
                              {resourceConfig?.icon}
                              <span className={resourceConfig?.color}>
                                {resource}: {amount}
                              </span>
                            </div>
                          )
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
          <Rocket className="h-8 w-8" />
          FLEET MOVEMENTS
        </h1>
        <p className="text-muted-foreground">
          Track your fleet operations and monitor hostile activity
        </p>
      </div>

      {hostileMovements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-red-500">
            ⚠️ Hostile Fleet Movements
          </h2>
          <MovementControls />
          <div
            className={
              displayMode === "grid" ? "grid gap-4 md:grid-cols-2" : "space-y-4"
            }
          >
            {sortMovements(filterMovements(hostileMovements)).map((movement) =>
              renderMovementCard(movement, true)
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Your Fleet Movements</h2>
        <MovementControls />
        {movements.length > 0 ? (
          <div
            className={
              displayMode === "grid" ? "grid gap-4 md:grid-cols-2" : "space-y-4"
            }
          >
            {sortMovements(filterMovements(movements)).map((movement) =>
              renderMovementCard(movement)
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">No active fleet movements</p>
        )}
      </div>
    </div>
  );
}
