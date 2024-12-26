import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGame } from "../contexts/GameContext";
import { api } from "../lib/api";
import { GameStructuresConfig } from "../models/structures_config";
interface StructureFormProps {
  type: string;
  config: any;
  onConfigChange: (
    type: string,
    field: string,
    subField: string | null,
    value: number
  ) => void;
}

function StructureForm({ type, config, onConfigChange }: StructureFormProps) {
  return (
    <div className="space-y-4 p-6 border border-primary/30 rounded-lg bg-black/20 backdrop-blur-sm hover:border-primary/50 transition-colors">
      <h3 className="text-lg font-semibold neon-text tracking-wide">
        {type.split("_").join(" ").toUpperCase()}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(config).map(([key, value]) => {
          if (value === null) {
            return null;
          }

          if (typeof value === "object") {
            return (
              <div key={key} className="space-y-4">
                <h4 className="text-sm font-medium text-primary/70 capitalize">
                  {key.split("_").join(" ")}
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(value as object).map(([subKey, subValue]) => (
                    <div key={`${key}-${subKey}`} className="relative">
                      <label className="absolute -top-2 left-2 px-1 text-xs bg-black text-primary/70 capitalize">
                        {subKey}
                      </label>
                      <Input
                        type={typeof subValue === "number" ? "number" : "text"}
                        value={subValue ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onConfigChange(
                            type,
                            key,
                            subKey,
                            typeof subValue === "number"
                              ? parseFloat(e.target.value)
                              : e.target.value
                          )
                        }
                        className="bg-black/50 border-primary/30 focus:border-primary/60 text-primary pt-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={key} className="space-y-2">
              <label className="text-sm text-primary/70 font-medium capitalize">
                {key.split("_").join(" ")}
              </label>
              <Input
                type={typeof value === "number" ? "number" : "text"}
                value={value ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onConfigChange(
                    type,
                    key,
                    null,
                    typeof value === "number"
                      ? parseFloat(e.target.value)
                      : e.target.value
                  )
                }
                className="bg-black/50 border-primary/30 focus:border-primary/60 text-primary placeholder:text-primary/50"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Configs() {
  const { state } = useGame();
  const [structuresConfig, setStructuresConfig] =
    useState<GameStructuresConfig | null>(state.structuresConfig);

  const handleConfigChange = (
    structureType: string,
    field: string,
    subField: string | null,
    value: number
  ) => {
    if (!structuresConfig) return;
    setStructuresConfig((prev) => {
      if (!prev) return prev;

      const updatedStructure = {
        ...prev[structureType as keyof GameStructuresConfig],
        [field]: subField
          ? {
              ...(prev[structureType as keyof GameStructuresConfig][
                field
              ] as Record<string, number>),
              [subField]: value,
            }
          : value,
      };

      return {
        ...prev,
        [structureType]: updatedStructure,
      };
    });
  };

  const handleSave = async () => {
    try {
      if (!structuresConfig) return;
      await api.admin.updateConfig("structures", structuresConfig);

      alert("Configuration saved successfully!");
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Failed to save configuration");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold neon-text mb-2">ADMIN CONSOLE</h1>
          <p className="text-muted-foreground">
            Manage game configurations and settings
          </p>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm neon-border">
        <CardHeader>
          <CardTitle className="neon-text">Structures Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(structuresConfig || {}).map(([type, config]) => (
              <StructureForm
                key={type}
                type={type}
                config={config}
                onConfigChange={handleConfigChange}
              />
            ))}
          </div>

          <Button
            onClick={handleSave}
            className="mt-6 w-full bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary font-medium transition-colors"
          >
            Save Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
