import { BaseMail, SpyMail } from "@/models/mail";
import { Eye, Building, Beaker, Ship, Shield } from "lucide-react";
import Image from "next/image";
import { getPublicImageUrl } from "@/lib/images";

interface ReportContentProps {
  report: BaseMail;
}

export function ReportContent({ report }: ReportContentProps) {
  if (report.type === "spy") {
    const spyData = (report as SpyMail).data;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 text-yellow-500">
          <Eye className="h-5 w-5" />
          <h2 className="text-xl font-bold">Espionage Report</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">Target Location</h3>
            <p className="text-sm">
              Coordinates: ({spyData.target_coordinates.x},{" "}
              {spyData.target_coordinates.y})
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-primary flex items-center gap-2">
            <Building className="h-4 w-4" />
            Resources
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(spyData.resources.current).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="capitalize">{key}:</span>
                <span>{(value as number).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-primary flex items-center gap-2">
            <Building className="h-4 w-4" />
            Structures
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {spyData.structures.map(
              (structure: {
                type: string;
                level: number;
                is_under_construction: boolean;
              }) => (
                <div
                  key={structure.type}
                  className="flex items-center justify-between"
                >
                  <span className="capitalize">
                    {structure.type.replace(/_/g, " ")}:
                  </span>
                  <span>Level {structure.level}</span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-primary flex items-center gap-2">
            <Beaker className="h-4 w-4" />
            Research
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {spyData.research.map(
              (tech: {
                id: string;
                level: number;
                is_researching: boolean;
              }) => (
                <div
                  key={tech.id}
                  className="flex items-center justify-between"
                >
                  <span className="capitalize">
                    {tech.id.replace(/_/g, " ")}:
                  </span>
                  <span>Level {tech.level}</span>
                </div>
              )
            )}
          </div>
        </div>
        {spyData.ships.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Ships Detected
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {spyData.ships.map((ship: { type: string; count: number }) => (
                <div key={ship.type} className="flex items-center gap-2">
                  <Image
                    src={getPublicImageUrl("ships", `${ship.type}.webp`)}
                    width={24}
                    height={24}
                    alt={ship.type}
                    className="w-6 h-6"
                  />
                  <span className="capitalize">
                    {ship.type.replace(/_/g, " ")}:
                  </span>
                  <span>{ship.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-800 rounded-md">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-400" />
            <span className="text-sm">
              Defense Score: {spyData.defense_score}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Add other report type renderers here
  return (
    <div className="text-gray-400">
      <p>Unknown report type</p>
    </div>
  );
}
