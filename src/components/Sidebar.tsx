"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  LogOut,
  Terminal,
  Computer,
  Building,
  FlaskConical,
  Rocket,
  Eye,
  User,
  ArrowRight,
  Trophy,
  MailIcon,
} from "lucide-react";
import { useGame } from "../contexts/GameContext";

export function Sidebar() {
  const { logout } = useAuth();
  const { state } = useGame();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <div className="w-64 bg-black/95 border-r border-primary/30 h-full flex flex-col relative overflow-hidden font-mono">
      {/* Matrix-like rain effect overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,255,0,0.03)1px,transparent_1px)] bg-[size:100%_2px] animate-matrix-rain pointer-events-none" />

      {/* Terminal-like header */}
      <div className="mb-8 p-4 border-b border-primary/30 relative">
        <div className="flex">
          <Terminal className="mt-2  mr-1 h-4 w-4 text-primary animate-pulse" />
          <h2 className="text-xl font-bold text-primary tracking-wider effect">
            Project Orion
          </h2>
        </div>
        <div className="text-xs text-primary/70 mt-2 typing-effect-delay">
          <span className="inline-block w-2 h-2 bg-primary/80  mr-2" />
          Alpha V.0.1
        </div>
      </div>

      <div className="flex-1 px-4">
        {state.selectedPlanet && (
          <nav className="space-y-1">
            {[
              // Main console
              {
                to: "/dashboard",
                icon: Computer,
                label: "MAIN_CONSOLE",
                color: "primary",
              },

              // Planet management
              {
                to: "/structures",
                icon: Building,
                label: "STRUCTURES",
                color: "primary",
              },
              {
                to: "/researchs",
                icon: FlaskConical,
                label: "RESEARCH_LAB",
                color: "green",
              },

              // Fleet management
              {
                to: "/shipyard",
                icon: Rocket,
                label: "SHIPYARD",
                color: "blue",
              },
              {
                to: "/fleet",
                icon: Rocket,
                label: "FLEET",
                color: "blue",
              },
              {
                to: "/fleet-movements",
                icon: ArrowRight,
                label: "FLEET_MOVEMENTS",
                color: "blue",
              },
              {
                to: "/secure-communications",
                icon: MailIcon,
                label: "SECURE_COMS",
                color: "blue",
              },

              // Navigation & Profile
              {
                to: "/galaxy",
                icon: Eye,
                label: "GALAXY_MAP",
                color: "purple",
              },
              {
                to: `/user/${state.currentUser?.id}`,
                icon: User,
                label: "USER_PROFILE",
                color: "blue",
              },
              {
                to: "/rankings",
                icon: Trophy,
                label: "RANKINGS",
                color: "blue",
              },
              // {
              //   to: "/alliances",
              //   icon: Users,
              //   label: "ALLIANCE_NET",
              //   color: "blue",
              // },
            ].map((item) => (
              <Link key={item.to} href={item.to}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-${
                    item.color
                  }-400 hover:bg-${item.color}-500/10 
                  border border-transparent hover:border-${item.color}-500/30 
                  group transition-all duration-300
                  ${
                    location.pathname === item.to
                      ? `bg-${item.color}-500/10 border-${item.color}-500/30`
                      : ""
                  }`}
                >
                  <item.icon
                    className={`mr-2 ${
                      location.pathname === item.to
                        ? "animate-pulse"
                        : "group-hover:animate-pulse"
                    }`}
                  />
                  <span
                    className={`font-mono ${
                      location.pathname === item.to
                        ? "text-primary "
                        : "group-hover:text-primary group-hover:animate-glitch"
                    }`}
                  >
                    {`> ${item.label}`}
                  </span>
                </Button>
              </Link>
            ))}
          </nav>
        )}
      </div>

      {/* Theme selector with cyberpunk styling */}
      <div className="p-4 border-t border-primary/30">
        <Select defaultValue={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-full bg-black border-primary/30 text-primary hover:border-primary/60 transition-colors">
            <SelectValue placeholder="SELECT_THEME" />
          </SelectTrigger>
          <SelectContent className="bg-black/95 border-primary/30">
            {[
              { value: "default", label: "MATRIX_GREEN", color: "emerald" },
              { value: "purple", label: "NEON_PURPLE", color: "purple" },
              { value: "blue", label: "CYBER_BLUE", color: "blue" },
              { value: "synthwave", label: "SYNTHWAVE", color: "pink" },
            ].map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                className={`text-${item.color}-400 hover:bg-${item.color}-500/20`}
              >
                {`> ${item.label}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logout section with warning styling */}
      <div className="p-4 border-t border-red-500/30">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-red-500 hover:bg-red-500/10 
            border border-transparent hover:border-red-500/30 
            group transition-all duration-300"
        >
          <LogOut className="mr-2 group-hover:animate-pulse" />
          <span className="font-mono group-hover:animate-glitch">
            {">"} TERMINATE_SESSION
          </span>
        </Button>
      </div>
    </div>
  );
}
