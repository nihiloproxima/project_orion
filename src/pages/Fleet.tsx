import { useEffect, useState, useCallback } from "react";
import { useGame } from "../contexts/GameContext";
import { Ship, ShipType } from "../models/ship";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
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
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { supabase } from "../lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { GalaxyMap } from "../components/GalaxyMap";
import { usePlanets } from "../hooks/usePlanets";
import { LoadingScreen } from "../components/LoadingScreen";

// Import ship images (referencing the same imports used in Shipyard.tsx)
import colonyShipImg from "../assets/ships/colony_ship.png";
import transportShipImg from "../assets/ships/transport_ship.png";
import spyProbeImg from "../assets/ships/spy_probe.png";
import recyclerShipImg from "../assets/ships/recycler_ship.png";
import cruiserImg from "../assets/ships/cruiser.png";
import { api } from "../lib/api";
import { Planet } from "../models/planet";

const SHIP_ASSETS: Record<ShipType, { name: string; image: string }> = {
  colony_ship: {
    name: "Colony Ship",
    image: colonyShipImg,
  },
  transport_ship: {
    name: "Transport Ship",
    image: transportShipImg,
  },
  spy_probe: {
    name: "Spy Probe",
    image: spyProbeImg,
  },
  recycler_ship: {
    name: "Recycler Ship",
    image: recyclerShipImg,
  },
  cruiser: {
    name: "Cruiser",
    image: cruiserImg,
  },
};

type SortField = "speed" | "cargo_capacity" | "attack_power" | "defense";
type SortOrder = "asc" | "desc";
type MissionType = "attack" | "transport" | "colonize" | "spy" | "recycle";

export function Fleet() {
  const { state } = useGame();
  const {
    planets,
    userPlanets,
    loading: planetsLoading,
    getNeighboringPlanets,
  } = usePlanets();
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
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [selectedMissionType, setSelectedMissionType] =
    useState<MissionType | null>(null);
  const [missionType, setMissionType] = useState<MissionType | null>(null);
  const [targetPlanet, setTargetPlanet] = useState<Planet | null>(null);

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

      // Calculate distance
      const dx = targetPlanet.coordinate_x - state.selectedPlanet.coordinate_x;
      const dy = targetPlanet.coordinate_y - state.selectedPlanet.coordinate_y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Get slowest ship speed (this will determine fleet travel time)
      const slowestSpeed = Math.min(
        ...Array.from(selectedShips).map(
          (shipId) =>
            stationedShips.find((s) => s.id === shipId)?.speed || Infinity
        )
      );

      if (slowestSpeed === Infinity) return null;

      // Calculate time in hours (you can adjust the formula based on your game design)
      return Math.ceil(distance / slowestSpeed);
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
        .eq("status", "stationed");

      if (selectedType !== "all") {
        query = query.eq("type", selectedType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching ships:", error);
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
  }, [state.selectedPlanet?.id, selectedType, sortField, sortOrder]);

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

    if (!error) {
      setStationedShips((ships) =>
        ships.map((ship) =>
          ship.id === selectedShipToRename.id
            ? { ...ship, name: newShipName }
            : ship
        )
      );
    }

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

  const handleConfirmMission = async () => {
    if (!selectedPlanet || !selectedMissionType) return;

    // TODO: Implement mission confirmation logic
    console.log("Mission confirmed:", {
      ships: Array.from(selectedShips),
      targetPlanet: selectedPlanet,
      missionType: selectedMissionType,
    });
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
              setSelectedPlanet(null);
              setSelectedMissionType(null);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Target Planet</h3>
            <div className="border rounded-lg p-4">
              <GalaxyMap
                mode="mission-target"
                onPlanetSelect={setSelectedPlanet}
                allowedPlanets={getAllowedTargetPlanets()}
                highlightedPlanets={getHighlightedPlanets()}
                initialZoom={0.3}
                initialCenter={{
                  x: state.selectedPlanet?.coordinate_x || 0,
                  y: state.selectedPlanet?.coordinate_y || 0,
                }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Select Mission Type
              </h3>
              <Select
                value={missionType || ""}
                onValueChange={(value) => {
                  setMissionType(value as MissionType);
                  setSelectedMissionType(value as MissionType);
                }}
              >
                <SelectTrigger>
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

            <Button
              className="w-full"
              disabled={!selectedPlanet || !selectedMissionType}
              onClick={handleConfirmMission}
            >
              <Target className="h-4 w-4 mr-2" />
              Confirm Mission
            </Button>
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
                <img
                  src={SHIP_ASSETS[ship.type].image}
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

      <Dialog open={showMissionSetup} onOpenChange={setShowMissionSetup}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Mission Setup</DialogTitle>
            {state.selectedPlanet && (
              <DialogDescription>
                Launching from: {state.selectedPlanet.name} (
                {state.selectedPlanet.coordinate_x},{" "}
                {state.selectedPlanet.coordinate_y})
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4">
            <Select
              value={missionType || ""}
              onValueChange={(value: MissionType) => {
                console.log("Selected mission type:", value);
                setMissionType(value);
                setSelectedMissionType(value);
                setTargetPlanet(null); // Reset target when changing mission type
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Mission Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="colonize">Colonize</SelectItem>
                <SelectItem value="attack">Attack</SelectItem>
                <SelectItem value="spy">Spy</SelectItem>
                <SelectItem value="recycle">Recycle</SelectItem>
              </SelectContent>
            </Select>

            {missionType && planets && (
              <div className="space-y-4">
                <GalaxyMap
                  mode="mission-target"
                  onPlanetSelect={setTargetPlanet}
                  allowedPlanets={getAllowedTargetPlanets()}
                  highlightedPlanets={getHighlightedPlanets()}
                  initialZoom={0.3}
                  initialCenter={{
                    x: state.selectedPlanet?.coordinate_x || 0,
                    y: state.selectedPlanet?.coordinate_y || 0,
                  }}
                />

                <div className="text-sm text-muted-foreground">
                  <p>Mission Type: {missionType}</p>
                  <p>Available Targets: {getAllowedTargetPlanets().length}</p>
                  {selectedShips.size > 0 && targetPlanet && (
                    <p>
                      Estimated Travel Time: {calculateTravelTime(targetPlanet)}{" "}
                      hours
                    </p>
                  )}
                </div>
              </div>
            )}

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
                    Distance:{" "}
                    {Math.ceil(
                      Math.sqrt(
                        Math.pow(
                          targetPlanet.coordinate_x -
                            state.selectedPlanet.coordinate_x,
                          2
                        ) +
                          Math.pow(
                            targetPlanet.coordinate_y -
                              state.selectedPlanet.coordinate_y,
                            2
                          )
                      )
                    ).toLocaleString()}{" "}
                    units
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMissionSetup(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!targetPlanet || selectedShips.size === 0}
              onClick={() => handleConfirmMission()}
            >
              Start Mission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
