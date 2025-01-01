import { useEffect, useState } from "react";
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
  Send,
  CheckSquare,
  Filter,
  LayoutGrid,
  LayoutList,
  Pencil,
  ArrowUpDown,
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
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";

// Import ship images (referencing the same imports used in Shipyard.tsx)
import colonyShipImg from "../assets/ships/colony_ship.png";
import transportShipImg from "../assets/ships/transport_ship.png";
import spyProbeImg from "../assets/ships/spy_probe.png";
import recyclerShipImg from "../assets/ships/recycler_ship.png";
import cruiserImg from "../assets/ships/cruiser.png";
import { api } from "../lib/api";

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

export function Fleet() {
  const { state } = useGame();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-primary animate-pulse">Loading fleet data...</div>
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
            size="sm"
            disabled={selectedShips.size === 0}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send Mission
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
    </div>
  );
}
