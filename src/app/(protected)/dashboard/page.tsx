"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

import { ScrollArea } from "../../../components/ui/scroll-area";
import { Rocket, MessageSquare, Users, Activity } from "lucide-react";
import { useGame } from "../../../contexts/GameContext";
import { useRouter } from "next/navigation"; // Changed from next/router
import Link from "next/link";
import { ChatMessage } from "../../../models/chat_message";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../../lib/supabase";
import { api } from "../../../lib/api";
import Image from "next/image";
import { getPublicImageUrl } from "@/lib/images";
import { FleetMovement } from "../../../models/fleet_movement";

export default function Dashboard() {
  const router = useRouter();
  const { state } = useGame();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [hostileFleets, setHostileFleets] = useState<FleetMovement[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch of messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        setMessages(data.reverse());
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.chat.sendMessage("global", newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  useEffect(() => {
    if (
      !state.loading &&
      !state.selectedPlanet &&
      state.userPlanets.length === 0
    ) {
      router.push("/choose-homeworld");
    }
  }, [state.loading, state.selectedPlanet, state.userPlanets.length, router]);

  useEffect(() => {
    // Subscribe to hostile fleets targeting user's planets
    const subscription = supabase
      .channel("hostile_fleets")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fleet_movements",
          filter: `destination_planet_id=in.(${state.userPlanets
            .map((p) => p.id)
            .join(",")})`,
        },
        (payload) => {
          const movement = payload.new as FleetMovement;
          if (movement.owner_id !== state.currentUser?.id) {
            if (payload.eventType === "INSERT") {
              setHostileFleets((prev) => [...prev, movement]);
            } else if (payload.eventType === "UPDATE") {
              setHostileFleets((prev) =>
                prev.map((fleet) =>
                  fleet.id === movement.id ? movement : fleet
                )
              );
            } else if (payload.eventType === "DELETE") {
              setHostileFleets((prev) =>
                prev.filter((fleet) => fleet.id !== payload.old.id)
              );
            }
          }
        }
      )
      .subscribe();

    // Initial fetch of hostile fleets
    const fetchHostileFleets = async () => {
      const { data } = await supabase
        .from("fleet_movements")
        .select("*")
        .neq("owner_id", state.currentUser?.id)
        .in(
          "destination_planet_id",
          state.userPlanets.map((p) => p.id)
        )
        .eq("status", "traveling")
        .order("arrival_time", { ascending: true });

      if (data) {
        setHostileFleets(data);
      }
    };

    fetchHostileFleets();

    return () => {
      subscription.unsubscribe();
    };
  }, [state.currentUser?.id, state.userPlanets]);

  if (state.userPlanets.length === 0) {
    router.push("/choose-homeworld");
    return null; // Return null while redirecting
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold neon-text mb-2">COMMAND CENTER</h1>
          <p className="text-muted-foreground">
            Welcome, Commander. All systems operational.
          </p>
        </div>
      </div>

      {/* Dynamic Hostile Fleet Alerts */}
      {hostileFleets.map((fleet) => (
        <Card
          key={fleet.id}
          className="bg-red-900/30 border-red-500/50 backdrop-blur-sm animate-pulse"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-red-500 font-bold flex items-center gap-2">
              ⚠️ ALERT: INCOMING HOSTILE FLEET
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-400 space-y-2">
              <p>
                Hostile fleet detected approaching{" "}
                {state.userPlanets.find(
                  (p) => p.id === fleet.destination_planet_id
                )?.name || "Unknown Planet"}
              </p>
              <div className="font-mono text-xl">
                Time until impact:{" "}
                <span className="text-red-500">
                  {new Date(fleet.arrival_time).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm">
                Fleet composition:{" "}
                {Object.entries(fleet.ship_counts)
                  .map(([type, count]) => `${count} ${type}`)
                  .join(", ")}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium neon-text">
              FLEET STATUS
            </CardTitle>
            <Rocket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15 Ships</div>
            <p className="text-xs text-muted-foreground">
              3 in combat, 12 in orbit
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium neon-text">
              SYSTEM STATUS
            </CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">OPTIMAL</div>
            <p className="text-xs text-muted-foreground">All systems green</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm neon-border hover:shadow-[0_0_20px_rgba(32,224,160,0.3)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium neon-text">
              ACTIVE COMMANDERS
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.activePlayers}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Window */}
      <Card className="bg-card/50 backdrop-blur-sm neon-border h-[400px] flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="neon-text flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            UNIVERSAL COMMS
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="space-y-4 font-mono pr-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="text-sm break-words flex items-start gap-2"
                >
                  {msg.sender_avatar ? (
                    <Image
                      src={getPublicImageUrl(
                        "avatars",
                        msg.sender_avatar + ".webp"
                      )}
                      width={100}
                      height={100}
                      alt={msg.sender_name || "User"}
                      className="w-6 h-6 flex-shrink-0 object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-[10px] uppercase">
                      {msg.sender_name?.[0] || "?"}
                    </div>
                  )}
                  <div>
                    <span className="text-primary whitespace-nowrap">
                      [{new Date(msg.created_at).toLocaleTimeString()}]
                    </span>{" "}
                    <Link
                      href={
                        msg.type === "user_message"
                          ? `/user/${msg.sender_id}`
                          : "#"
                      }
                      className={`text-secondary ${
                        msg.type === "system_message" ? "text-red-500" : ""
                      } ${
                        msg.type === "user_message" ? "hover:underline" : ""
                      }`}
                      onClick={(e) => {
                        if (msg.type !== "user_message") {
                          e.preventDefault();
                        }
                      }}
                    >
                      {msg.sender_name}:
                    </Link>{" "}
                    <span
                      className={`text-muted-foreground ${
                        msg.type === "system_message" ? "text-red-400" : ""
                      }`}
                    >
                      {msg.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <form
            onSubmit={handleSendMessage}
            className="border border-primary/30 rounded p-2 mt-4"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="> Enter message..."
              className="w-full bg-transparent border-none focus:outline-none text-primary placeholder:text-primary/50"
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
