import { useEffect } from "react";
import { ChooseHomeworld } from "../components/ChooseHomeworld";
import { useGame } from "../contexts/GameContext";
import { useNavigate } from "react-router-dom";
export function ChooseHomeworldPage() {
  const { state } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.loading === false && state.userPlanets.length > 0) {
      console.log("navigating to dashboard");
      navigate("/dashboard");
    }
  }, [state.loading, state.selectedPlanet]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <ChooseHomeworld />
      </div>
    </div>
  );
}
