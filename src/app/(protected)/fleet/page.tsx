"use client";

import { useEffect, useState, useCallback } from "react";
import { useGame } from "../../../contexts/GameContext";
import { Ship, ShipType } from "../../../models/ship";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Anchor,
  Ship as ShipIcon,
  Shield,
  Box,
  Rocket,
  CheckSquare,
  Filter,
  LayoutGrid,
  LayoutList,
  Pencil,
  ArrowUpDown,
  X,
  Target,
  ArrowLeft,
} from "lucide-react";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { supabase } from "../../../lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { GalaxyMap2D } from "../../../components/GalaxyMap2D/GalaxyMap2D";
import { usePlanets } from "../../../hooks/usePlanets";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { api } from "../../../lib/api";
import { Planet } from "../../../models/planet";
import Image from "next/image";
import { ResourcePayload } from "@/models/fleet_movement";
import { useToast } from "@/hooks/use-toast";
import { formatTimerTime } from "@/lib/utils";
import { useFleetMissions } from "@/hooks/useFleetMissions";

const getShipImageUrl = (type: ShipType) => {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ships/${type}.webp`;
};

const SHIP_ASSETS: Record<ShipType, { name: string; image: string }> = {
  colony_ship: {
    name: "Colony Ship",
    image: getShipImageUrl("colony_ship"),
  },
  transport_ship: {
    name: "Transport Ship",
    image: getShipImageUrl("transport_ship"),
  },
  spy_probe: {
    name: "Spy Probe",
    image: getShipImageUrl("spy_probe"),
  },
  recycler_ship: {
    name: "Recycler Ship",
    image: getShipImageUrl("recycler_ship"),
  },
  cruiser: {
    name: "Cruiser",
    image: getShipImageUrl("cruiser"),
  },
};

type SortField = "speed" | "cargo_capacity" | "attack_power" | "defense";
type SortOrder = "asc" | "desc";
type MissionType = "attack" | "transport" | "colonize" | "spy" | "recycle";

const ResourceSelectionUI = ({
  onResourcesSelect,
  maxCargo,
}: {
  onResourcesSelect: (resources: ResourcePayload) => void;
  maxCargo: number;
}) => {
  const [resources, setResources] = useState<ResourcePayload>({
    metal: 0,
    deuterium: 0,
    microchips: 0,
    science: 0,
  });

  const { state } = useGame();
  const currentResources = state.resources;

  // Calculate total resources selected
  const totalResourcesSelected = Object.values(resources).reduce(
    (sum, value) => sum + value,
    0
  );

  const handleChange = (resource: keyof ResourcePayload, value: number) => {
    const otherResourcesTotal =
      totalResourcesSelected - (resources[resource] || 0);
    const maxAllowed = Math.min(
      maxCargo - otherResourcesTotal,
      currentResources?.[resource] || 0
    );

    setResources((prev) => ({
      ...prev,
      [resource]: Math.max(0, Math.min(value, maxAllowed)),
    }));
  };

  // Add useEffect to automatically update parent component when resources change
  useEffect(() => {
    onResourcesSelect(resources);
  }, [resources, onResourcesSelect]);

  return (
    <div className="space-y-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
      <h3 className="font-bold">Select Resources to Transport</h3>
      <div className="text-sm text-muted-foreground mb-2">
        Cargo Capacity: {totalResourcesSelected}/{maxCargo}
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-2">
          <label className="w-24">Metal:</label>
          <Input
            type="number"
            min={0}
            max={Math.min(
              currentResources?.metal || 0,
              maxCargo - (totalResourcesSelected - (resources.metal || 0))
            )}
            value={resources.metal}
            onChange={(e) =>
              handleChange("metal", parseInt(e.target.value) || 0)
            }
          />
          <span className="text-sm text-muted-foreground">
            Max:{" "}
            {Math.min(
              currentResources?.metal || 0,
              maxCargo - (totalResourcesSelected - (resources.metal || 0))
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="w-24">Deuterium:</label>
          <Input
            type="number"
            min={0}
            max={Math.min(
              currentResources?.deuterium || 0,
              maxCargo - (totalResourcesSelected - (resources.deuterium || 0))
            )}
            value={resources.deuterium}
            onChange={(e) =>
              handleChange("deuterium", parseInt(e.target.value) || 0)
            }
          />
          <span className="text-sm text-muted-foreground">
            Max:{" "}
            {Math.min(
              currentResources?.deuterium || 0,
              maxCargo - (totalResourcesSelected - (resources.deuterium || 0))
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="w-24">Microchips:</label>
          <Input
            type="number"
            min={0}
            max={Math.min(
              currentResources?.microchips || 0,
              maxCargo - (totalResourcesSelected - (resources.microchips || 0))
            )}
            value={resources.microchips}
            onChange={(e) =>
              handleChange("microchips", parseInt(e.target.value) || 0)
            }
          />
          <span className="text-sm text-muted-foreground">
            Max:{" "}
            {Math.min(
              currentResources?.microchips || 0,
              maxCargo - (totalResourcesSelected - (resources.microchips || 0))
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="w-24">Science:</label>
          <Input
            type="number"
            min={0}
            max={Math.min(
              currentResources?.science || 0,
              maxCargo - (totalResourcesSelected - (resources.science || 0))
            )}
            value={resources.science}
            onChange={(e) =>
              handleChange("science", parseInt(e.target.value) || 0)
            }
          />
          <span className="text-sm text-muted-foreground">
            Max:{" "}
            {Math.min(
              currentResources?.science || 0,
              maxCargo - (totalResourcesSelected - (resources.science || 0))
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

const calculateDistance = (p1: Planet, p2: Planet) => {
  const dx = p1.coordinate_x - p2.coordinate_x;
  const dy = p1.coordinate_y - p2.coordinate_y;
  return Math.sqrt(dx * dx + dy * dy);
};

export default function Fleet() {
  const { state } = useGame();
  const { planets, userPlanets, loading: planetsLoading } = usePlanets();
  const [stationedShips, setStationedShips] = useState<Ship[]>([]);
  const [selectedShips, setSelectedShips] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<ShipType | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedShipToRename, setSelectedShipToRename] = useState<Ship | null>(
    null
  );
  const [newShipName, setNewShipName] = useState("");
  const [sortField, setSortField] = useState<SortField>("speed");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showMissionSetup, setShowMissionSetup] = useState(false);
  const [missionType, setMissionType] = useState<MissionType | null>(null);
  const [targetPlanet, setTargetPlanet] = useState<Planet | null>(null);
  const { toast } = useToast();
  const [selectedResources, setSelectedResources] = useState<ResourcePayload>({
    metal: 0,
    deuterium: 0,
    microchips: 0,
    science: 0,
  });
  const { sendMission } = useFleetMissions();

  // Reset mission setup when dialog closes
  useEffect(() => {
    if (!showMissionSetup) {
      setMissionType(null);
      setTargetPlanet(null);
    }
  }, [showMissionSetup]);

  // Add debug logging
  useEffect(() => {
    console.log("Fleet component state:", {
      planetsLoaded: !!planets,
      planetCount: planets?.length || 0,
      userPlanetsCount: userPlanets.length,
      selectedPlanet: state.selectedPlanet,
      loading,
    });
  }, [planets, userPlanets, state.selectedPlanet, loading]);

  // Get allowed target planets based on mission type
  const getAllowedTargetPlanets = useCallback(() => {
    if (!missionType || !state.selectedPlanet || !planets) {
      console.log("Missing required data:", {
        missionType,
        selectedPlanet: !!state.selectedPlanet,
        planetsLoaded: !!planets,
      });
      return [];
    }

    console.log("Calculating target planets:", {
      missionType,
      totalPlanets: planets.length,
    });

    const allowedPlanets = planets
      .filter((planet) => {
        // Don't allow selecting current planet
        if (planet.id === state.selectedPlanet?.id) {
          return false;
        }

        // Filter based on mission type
        switch (missionType) {
          case "colonize":
            return !planet.owner_id;
          case "attack":
            return planet.owner_id && planet.owner_id !== state.currentUser?.id;
          case "transport":
            return planet.owner_id === state.currentUser?.id;
          case "spy":
            return planet.owner_id && planet.owner_id !== state.currentUser?.id;
          case "recycle":
            return true;
          default:
            return false;
        }
      })
      .map((p) => p.id);

    console.log(
      `Found ${allowedPlanets.length} allowed planets for mission type ${missionType}`
    );
    return allowedPlanets;
  }, [missionType, state.selectedPlanet, state.currentUser?.id, planets]);

  // Calculate estimated travel time for selected ships
  const calculateTravelTime = useCallback(
    (targetPlanet: Planet) => {
      if (!state.selectedPlanet) return null;

      // Calculate distance using the same formula as server
      const distance = Math.sqrt(
        Math.pow(
          targetPlanet.coordinate_x - state.selectedPlanet.coordinate_x,
          2
        ) +
          Math.pow(
            targetPlanet.coordinate_y - state.selectedPlanet.coordinate_y,
            2
          )
      );

      // Get slowest ship speed (convoy speed)
      const convoySpeed = Math.min(
        ...Array.from(selectedShips).map(
          (shipId) =>
            stationedShips.find((s) => s.id === shipId)?.speed || Infinity
        )
      );

      if (convoySpeed === Infinity) return null;

      // Calculate travel time in seconds (matching server logic exactly)
      const travelTimeSeconds = Math.ceil(distance / convoySpeed);

      return travelTimeSeconds;
    },
    [state.selectedPlanet, selectedShips, stationedShips]
  );

  useEffect(() => {
    const fetchStationedShips = async () => {
      if (!state.selectedPlanet?.id) return;

      let query = supabase
        .from("ships")
        .select("*")
        .eq("current_planet_id", state.selectedPlanet.id)
        .eq("status", "stationed")
        .is("mission_type", null);

      if (selectedType !== "all") {
        query = query.eq("type", selectedType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching ships:", error);
        toast({
          title: "Error",
          description: "Failed to fetch stationed ships. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Sort the ships based on current sort field and order
      const sortedData = [...(data as Ship[])].sort((a, b) => {
        const multiplier = sortOrder === "asc" ? 1 : -1;
        return (a[sortField] - b[sortField]) * multiplier;
      });

      setStationedShips(sortedData);
      setLoading(false);
    };

    fetchStationedShips();
  }, [state.selectedPlanet?.id, selectedType, sortField, sortOrder, toast]);

  const handleShipSelect = (shipId: string) => {
    setSelectedShips((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(shipId)) {
        newSelection.delete(shipId);
      } else {
        newSelection.add(shipId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedShips.size === stationedShips.length) {
      setSelectedShips(new Set());
    } else {
      setSelectedShips(new Set(stationedShips.map((ship) => ship.id)));
    }
  };

  const handleRenameShip = async () => {
    if (!selectedShipToRename || !newShipName.trim()) return;

    const { error } = await api.fleet.renameShip(
      selectedShipToRename.id,
      newShipName
    );

    if (error) {
      toast({
        title: "Error",
        description: "Failed to rename ship. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setStationedShips((ships) =>
      ships.map((ship) =>
        ship.id === selectedShipToRename.id
          ? { ...ship, name: newShipName }
          : ship
      )
    );

    toast({
      title: "Success",
      description: "Ship renamed successfully.",
    });

    setRenameDialogOpen(false);
    setSelectedShipToRename(null);
    setNewShipName("");
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getAvailableMissionTypes = (): MissionType[] => {
    const selectedShipTypes = new Set(
      Array.from(selectedShips).map(
        (id) => stationedShips.find((ship) => ship.id === id)?.type
      )
    );

    const missionTypes: MissionType[] = [];

    if (selectedShipTypes.has("cruiser")) missionTypes.push("attack");
    if (selectedShipTypes.has("transport_ship")) missionTypes.push("transport");
    if (selectedShipTypes.has("colony_ship")) missionTypes.push("colonize");
    if (selectedShipTypes.has("spy_probe")) missionTypes.push("spy");
    if (selectedShipTypes.has("recycler_ship")) missionTypes.push("recycle");

    return missionTypes;
  };

  const handleConfirmMission = async (resources?: ResourcePayload) => {
    if (!targetPlanet || !missionType) return;

    const success = await sendMission({
      ships_ids: Array.from(selectedShips),
      mission_type: missionType,
      target_planet: targetPlanet,
      resources,
    });

    if (success) {
      // Remove sent ships from stationedShips immediately
      setStationedShips((current) =>
        current.filter((ship) => !selectedShips.has(ship.id))
      );

      // Reset selection and close mission setup
      setSelectedShips(new Set());
      setShowMissionSetup(false);
      setMissionType(null);
    }
  };

  // Get highlighted planets based on mission type
  const getHighlightedPlanets = useCallback(() => {
    if (!planets || !missionType) return [];

    return planets
      .filter((planet) => {
        switch (missionType) {
          case "transport":
            return planet.owner_id === state.currentUser?.id;
          case "attack":
          case "spy":
            return planet.owner_id && planet.owner_id !== state.currentUser?.id;
          case "colonize":
            return !planet.owner_id;
          case "recycle":
            // Maybe highlight planets with debris or abandoned structures
            return false;
          default:
            return false;
        }
      })
      .map((p) => p.id);
  }, [missionType, planets, state.currentUser?.id]);

  const getTotalCargoCapacity = () => {
    return Array.from(selectedShips).reduce((total, shipId) => {
      const ship = stationedShips.find((s) => s.id === shipId);
      return total + (ship?.cargo_capacity || 0);
    }, 0);
  };

  if (loading || planetsLoading) {
    return <LoadingScreen message="LOADING FLEET DATA..." />;
  }

  if (showMissionSetup) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => setShowMissionSetup(false)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Ship Selection
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setShowMissionSetup(false);
              setTargetPlanet(null);
              setMissionType(null);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Mission Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Select Mission Type
              </h3>
              <Select
                value={missionType || ""}
                onValueChange={(value) => {
                  setMissionType(value as MissionType);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose mission type" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMissionTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {targetPlanet && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-bold mb-2">
                  Selected Target: {targetPlanet.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Coordinates: ({targetPlanet.coordinate_x},{" "}
                  {targetPlanet.coordinate_y})
                </p>
                {state.selectedPlanet && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Travel Time:{" "}
                    {formatTimerTime(calculateTravelTime(targetPlanet) || 0)}
                  </p>
                )}

                {missionType === "transport" || missionType === "colonize" ? (
                  <div className="space-y-4">
                    <ResourceSelectionUI
                      onResourcesSelect={(resources) => {
                        // Store selected resources in state
                        setSelectedResources(resources);
                      }}
                      maxCargo={getTotalCargoCapacity()}
                    />
                    <Button
                      className="w-full"
                      disabled={!targetPlanet || !missionType}
                      onClick={() => handleConfirmMission(selectedResources)}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Confirm Mission
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full mt-4"
                    disabled={!targetPlanet || !missionType}
                    onClick={() => handleConfirmMission()}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Confirm Mission
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Galaxy Map */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Target Planet</h3>
            <div className="space-y-4">
              <Select
                value={targetPlanet?.id || ""}
                onValueChange={(value) => {
                  const planet = planets?.find((p) => p.id === value);
                  if (planet) {
                    setTargetPlanet(planet);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose target planet" />
                </SelectTrigger>
                <SelectContent>
                  {planets
                    ?.filter((p) => {
                      switch (missionType) {
                        case "transport":
                          return p.owner_id === state.currentUser?.id;
                        case "attack":
                        case "spy":
                          return (
                            p.owner_id && p.owner_id !== state.currentUser?.id
                          );
                        case "colonize":
                          return !p.owner_id;
                        case "recycle":
                          return false;
                        default:
                          return false;
                      }
                    })
                    .sort((a, b) => {
                      // Sort by distance for colonize missions
                      if (missionType === "colonize" && state.selectedPlanet) {
                        const distA = calculateDistance(
                          a,
                          state.selectedPlanet
                        );
                        const distB = calculateDistance(
                          b,
                          state.selectedPlanet
                        );
                        return distA - distB;
                      }
                      return 0;
                    })
                    .map((planet) => {
                      const distance = state.selectedPlanet
                        ? Math.round(
                            calculateDistance(planet, state.selectedPlanet)
                          )
                        : null;

                      return (
                        <SelectItem key={planet.id} value={planet.id}>
                          {planet.name} ({planet.coordinate_x},{" "}
                          {planet.coordinate_y})
                          {distance !== null && ` - ${distance} units away`}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>

              <div className="border rounded-lg p-4 w-full h-[calc(100vh-380px)] flex">
                <GalaxyMap2D
                  mode={"mission-target"}
                  onPlanetSelect={setTargetPlanet}
                  allowedPlanets={getAllowedTargetPlanets()}
                  highlightedPlanets={getHighlightedPlanets()}
                  initialZoom={0.3}
                  width="100%"
                  height="100%"
                  focusedPlanet={targetPlanet}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
            <ShipIcon className="h-8 w-8" />
            FLEET CONTROL
          </h1>
          <p className="text-muted-foreground">
            Manage and deploy your stationed ships
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="flex items-center gap-2"
          >
            {viewMode === "grid" ? (
              <LayoutList className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
          </Button>

          <Select
            value={selectedType}
            onValueChange={(value) =>
              setSelectedType(value as ShipType | "all")
            }
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ships</SelectItem>
              {Object.entries(SHIP_ASSETS).map(([type, { name }]) => (
                <SelectItem key={type} value={type}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortField}
            onValueChange={(value) => handleSort(value as SortField)}
          >
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="speed">
                Speed{" "}
                {sortField === "speed" && (sortOrder === "asc" ? "↑" : "↓")}
              </SelectItem>
              <SelectItem value="cargo_capacity">
                Cargo{" "}
                {sortField === "cargo_capacity" &&
                  (sortOrder === "asc" ? "↑" : "↓")}
              </SelectItem>
              <SelectItem value="attack_power">
                Attack{" "}
                {sortField === "attack_power" &&
                  (sortOrder === "asc" ? "↑" : "↓")}
              </SelectItem>
              <SelectItem value="defense">
                Defense{" "}
                {sortField === "defense" && (sortOrder === "asc" ? "↑" : "↓")}
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center gap-2"
          >
            <CheckSquare className="h-4 w-4" />
            {selectedShips.size === stationedShips.length
              ? "Deselect All"
              : "Select All"}
          </Button>
          <Button
            variant="default"
            size="lg"
            disabled={selectedShips.size === 0}
            onClick={() => setShowMissionSetup(true)}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors border ${
              !selectedShips.size
                ? "bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed"
                : "bg-primary/20 hover:bg-primary/30 text-primary border-primary/50 hover:border-primary/80 neon-border"
            }`}
          >
            <span className="uppercase">Send Mission</span>
          </Button>
        </div>
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
        }
      >
        {stationedShips.map((ship) => (
          <Card
            key={ship.id}
            className={`bg-card/50 backdrop-blur-sm transition-all duration-300 ${
              selectedShips.has(ship.id)
                ? "neon-border-primary"
                : "hover:neon-border"
            }`}
          >
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="flex-1 flex items-center gap-2">
                <Checkbox
                  checked={selectedShips.has(ship.id)}
                  onCheckedChange={() => handleShipSelect(ship.id)}
                />
                <Image
                  src={SHIP_ASSETS[ship.type].image}
                  width={100}
                  height={100}
                  aria-description={`Ship ${ship.name}`}
                  alt={ship.name}
                  className="w-8 h-8"
                />
                <div className="flex flex-col">
                  <span>{ship.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {SHIP_ASSETS[ship.type].name}
                  </span>
                </div>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedShipToRename(ship);
                  setNewShipName(ship.name);
                  setRenameDialogOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-blue-400" />
                  <span>Speed: {ship.speed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-yellow-400" />
                  <span>Cargo: {ship.cargo_capacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-red-400" />
                  <span>Attack: {ship.attack_power}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>Defense: {ship.defense}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stationedShips.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          No ships currently stationed at this planet.
        </div>
      )}

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Ship</DialogTitle>
          </DialogHeader>
          <Input
            value={newShipName}
            onChange={(e) => setNewShipName(e.target.value)}
            placeholder="Enter new ship name"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameShip}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
