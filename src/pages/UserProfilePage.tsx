import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  User as UserIcon,
  Shield,
  Swords,
  Trophy,
  Earth,
  Edit,
  Image,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { User } from "../models/user";
import { LoadingScreen } from "../components/LoadingScreen";
import { Input } from "../components/ui/input";
import { api } from "../lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

import avatar0 from "../assets/avatars/0.webp";
import avatar1 from "../assets/avatars/1.webp";
import avatar2 from "../assets/avatars/2.webp";
import avatar3 from "../assets/avatars/3.webp";
import avatar4 from "../assets/avatars/4.webp";
import avatar5 from "../assets/avatars/5.webp";
import avatar6 from "../assets/avatars/6.webp";
import avatar7 from "../assets/avatars/7.webp";
import avatar8 from "../assets/avatars/8.webp";
import avatar9 from "../assets/avatars/9.webp";

export function UserProfilePage() {
  const { userId } = useParams();
  const { state } = useGame();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  const avatars = [
    avatar0,
    avatar1,
    avatar2,
    avatar3,
    avatar4,
    avatar5,
    avatar6,
    avatar7,
    avatar8,
    avatar9,
  ];

  const isCurrentUser = state.currentUser?.id === userId;

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        return;
      }

      setUser(data);
      setNewName(data.name);
      setLoading(false);
    };

    fetchUser();
  }, [userId]);

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;

    try {
      await api.users.update(newName, user.avatar_url || "");
      setUser({ ...user, name: newName });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
    if (!user) return;

    try {
      await api.users.update(user.name, avatarUrl);
      setUser({ ...user, avatar_url: avatarUrl });
      setIsAvatarDialogOpen(false);
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  if (loading) {
    return <LoadingScreen message="ACCESSING COMMANDER DATA..." />;
  }

  if (!user) {
    return <div>Commander not found.</div>;
  }

  const displayPlanets = state.planets?.filter((p) => p.owner_id === userId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
            <UserIcon className="h-8 w-8" />
            COMMANDER PROFILE
          </h1>
          <p className="text-muted-foreground">
            Viewing commander {user.name}'s service record
          </p>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="border-2 shadow-2xl shadow-primary/20 overflow-hidden">
        <div className="relative h-48 bg-gradient-to-b from-primary/20 to-background">
          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <div className="relative">
              <img
                src={user.avatar_url || avatar0}
                alt={user.name}
                className="w-48 h-48 border-4 border-background shadow-xl object-cover"
              />
              {isCurrentUser && (
                <Button
                  variant="default"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => setIsAvatarDialogOpen(true)}
                >
                  <Image className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="mb-4">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-background"
                  />
                  <Button onClick={handleUpdateName}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {user.name}
                  {isCurrentUser && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </h2>
              )}
            </div>
          </div>
        </div>
        <CardContent className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Trophy className="h-5 w-5" />
                Global Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{user.global_score}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Shield className="h-5 w-5" />
                Defense Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{user.defense_score}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Swords className="h-5 w-5" />
                Attack Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{user.attack_score}</div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Avatar Selection Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Commander Avatar</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 p-4">
            {avatars.map((avatar, index) => (
              <button
                key={index}
                className="relative overflow-hidden rounded-lg border-2 border-muted hover:border-primary transition-colors"
                onClick={() => handleAvatarSelect(avatar)}
              >
                <img
                  src={avatar}
                  alt={`Avatar ${index}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Planets Section */}
      <Card className="border-2 shadow-2xl shadow-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Earth className="h-5 w-5" />
            Controlled Systems ({displayPlanets?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayPlanets?.map((planet) => (
              <Card
                key={planet.id}
                className="bg-card/50 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300"
              >
                <CardContent className="p-4">
                  <div className="font-bold text-primary">{planet.name}</div>
                  <div className="text-sm text-muted-foreground">
                    [{planet.coordinate_x}, {planet.coordinate_y}]
                  </div>
                  <div className="text-sm">
                    Size: {planet.size_km.toLocaleString()} km
                  </div>
                  <div className="text-sm capitalize">
                    Biome: {planet.biome.replace("_", " ")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
