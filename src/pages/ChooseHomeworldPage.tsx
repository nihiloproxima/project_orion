import { useEffect } from "react";
import { ChooseHomeworld } from "../components/ChooseHomeworld";
import { useGame } from "../contexts/GameContext";
import { useNavigate } from "react-router-dom";
export function ChooseHomeworldPage() {
  const { state } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.loading && state.userPlanets.length > 0) {
      navigate("/dashboard");
    }
  }, [state.loading, state.userPlanets, navigate]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <ChooseHomeworld />
      </div>
    </div>
  );
}
