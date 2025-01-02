import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      <Button
        variant="outline"
        size="icon"
        className="w-8 h-8 bg-black/50 backdrop-blur-sm border-primary/30 hover:bg-primary/20"
        onClick={onZoomIn}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="w-8 h-8 bg-black/50 backdrop-blur-sm border-primary/30 hover:bg-primary/20"
        onClick={onZoomOut}
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
}
