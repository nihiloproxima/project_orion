import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useGame } from "../contexts/GameContext";
import { api } from "../lib/api";
import { StructuresConfig } from "../models/structures_config";
import { ResearchsConfig } from "../models/researchs_config";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Building2, FlaskConical } from "lucide-react";
import { Textarea } from "../components/ui/textarea";

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
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonValue, setJsonValue] = useState("");
  const [jsonError, setJsonError] = useState("");

  const handleJsonChange = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      // Update all fields at once
      Object.entries(parsed).forEach(([field, value]) => {
        if (typeof value === "object") {
          Object.entries(value as object).forEach(([subField, subValue]) => {
            onConfigChange(type, field, subField, subValue as number);
          });
        } else {
          onConfigChange(type, field, null, value as number);
        }
      });
      setJsonError("");
      setJsonMode(false);
    } catch (e: any) {
      console.error(e);
      setJsonError("Invalid JSON format");
    }
  };

  if (jsonMode) {
    return (
      <div className="space-y-4 p-6 border border-primary/30 rounded-lg bg-black/20 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold neon-text tracking-wide">
            {type.split("_").join(" ").toUpperCase()}
          </h3>
          <div className="space-x-2">
            <Button
              onClick={() => setJsonMode(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button onClick={handleJsonChange} size="sm">
              Save JSON
            </Button>
          </div>
        </div>
        <Textarea
          value={jsonValue || JSON.stringify(config, null, 2)}
          onChange={(e: any) => setJsonValue(e.target.value)}
          className="font-mono h-[300px]"
        />
        {jsonError && <p className="text-red-500 text-sm">{jsonError}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 border border-primary/30 rounded-lg bg-black/20 backdrop-blur-sm hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold neon-text tracking-wide">
          {type.split("_").join(" ").toUpperCase()}
        </h3>
        <Button onClick={() => setJsonMode(true)} variant="outline" size="sm">
          Edit as JSON
        </Button>
      </div>

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
                              : Number(e.target.value)
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
                value={value?.toString() ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onConfigChange(
                    type,
                    key,
                    null,
                    typeof value === "number"
                      ? parseFloat(e.target.value)
                      : Number(e.target.value)
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

interface ResearchFormProps {
  id: string;
  config: any;
  onConfigChange: (
    researchId: string,
    field: string,
    subField: string | null,
    value: number
  ) => void;
}

function ResearchForm({ id, config, onConfigChange }: ResearchFormProps) {
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonValue, setJsonValue] = useState("");
  const [jsonError, setJsonError] = useState("");

  const handleJsonChange = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      // Update all fields at once
      Object.entries(parsed).forEach(([field, value]) => {
        if (typeof value === "object") {
          Object.entries(value as object).forEach(([subField, subValue]) => {
            onConfigChange(id, field, subField, subValue as number);
          });
        } else {
          onConfigChange(id, field, null, value as number);
        }
      });
      setJsonError("");
      setJsonMode(false);
    } catch {
      setJsonError("Invalid JSON format");
    }
  };

  if (jsonMode) {
    return (
      <div className="space-y-4 p-6 border border-primary/30 rounded-lg bg-black/20 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold neon-text tracking-wide">
            {config.name || id.split("_").join(" ").toUpperCase()}
          </h3>
          <div className="space-x-2">
            <Button
              onClick={() => setJsonMode(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button onClick={handleJsonChange} size="sm">
              Save JSON
            </Button>
          </div>
        </div>
        <Textarea
          value={jsonValue || JSON.stringify(config, null, 2)}
          onChange={(e) => setJsonValue(e.target.value)}
          className="font-mono h-[300px]"
        />
        {jsonError && <p className="text-red-500 text-sm">{jsonError}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 border border-primary/30 rounded-lg bg-black/20 backdrop-blur-sm hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold neon-text tracking-wide">
          {config.name || id.split("_").join(" ").toUpperCase()}
        </h3>
        <Button onClick={() => setJsonMode(true)} variant="outline" size="sm">
          Edit as JSON
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(config).map(([key, value]) => {
          if (value === null || key === "id" || key === "name") {
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
                            id,
                            key,
                            subKey,
                            typeof subValue === "number"
                              ? parseFloat(e.target.value)
                              : Number(e.target.value)
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
                value={value?.toString() ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onConfigChange(
                    id,
                    key,
                    null,
                    typeof value === "number"
                      ? parseFloat(e.target.value)
                      : Number(e.target.value)
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
    useState<StructuresConfig | null>(state.structuresConfig);
  const [researchsConfig, setResearchsConfig] =
    useState<ResearchsConfig | null>(state.researchsConfig);
  const [activeTab, setActiveTab] = useState("structures");

  const handleConfigChange = (
    structureType: string,
    field: string,
    subField: string | null,
    value: number
  ) => {
    if (!structuresConfig) return;
    setStructuresConfig((prev: any) => {
      if (!prev) return prev;

      const updatedStructure = {
        ...prev[structureType as keyof StructuresConfig],
        [field]: subField
          ? {
              ...(prev[structureType as keyof StructuresConfig][
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

  const handleResearchConfigChange = (
    researchId: string,
    field: string,
    subField: string | null,
    value: number
  ) => {
    if (!researchsConfig) return;
    setResearchsConfig((prev: any) => {
      if (!prev) return prev;

      const updatedResearch = {
        ...prev.available_researchs[researchId],
        [field]: subField
          ? {
              ...(prev.available_researchs[researchId][field] as Record<
                string,
                number
              >),
              [subField]: value,
            }
          : value,
      };

      return {
        ...prev,
        available_researchs: {
          ...prev.available_researchs,
          [researchId]: updatedResearch,
        },
      };
    });
  };

  const handleSave = async () => {
    try {
      if (activeTab === "structures" && structuresConfig) {
        await api.admin.updateConfig("structures", structuresConfig);
      } else if (activeTab === "research" && researchsConfig) {
        await api.admin.updateConfig("researchs", researchsConfig);
      }
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="structures" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Structures
          </TabsTrigger>
          <TabsTrigger value="research" className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            Research
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structures">
          <Card className="bg-card/50 backdrop-blur-sm neon-border">
            <CardHeader>
              <CardTitle className="neon-text">
                Structures Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(structuresConfig || {}).map(
                  ([type, config]) => (
                    <StructureForm
                      key={type}
                      type={type}
                      config={config}
                      onConfigChange={handleConfigChange}
                    />
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research">
          <Card className="bg-card/50 backdrop-blur-sm neon-border">
            <CardHeader>
              <CardTitle className="neon-text">
                Research Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(researchsConfig?.available_researchs || {}).map(
                  ([id, config]) => (
                    <ResearchForm
                      key={id}
                      id={id}
                      config={config}
                      onConfigChange={handleResearchConfigChange}
                    />
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <Button
          onClick={handleSave}
          className="mt-6 w-full bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary font-medium transition-colors"
        >
          Save Configuration
        </Button>
      </Tabs>
    </div>
  );
}
