import { GameProvider } from "./contexts/GameContext";
import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "./routes";
import { AuthProvider } from "./contexts/auth";
import { ThemeProvider } from "./contexts/theme";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GameProvider>
          <Router>
            <AppRoutes />
          </Router>
        </GameProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
