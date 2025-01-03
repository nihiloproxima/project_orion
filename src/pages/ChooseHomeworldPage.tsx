import { useEffect, useState } from "react";
import { ChooseHomeworld } from "../components/ChooseHomeworld";
import { useGame } from "../contexts/GameContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { GalaxyMap2D } from "../components/GalaxyMap2D/GalaxyMap2D";
import { Rocket } from "lucide-react";
import { api } from "../lib/api";
import { Planet } from "../models/planet";
import { usePlanets } from "../hooks/usePlanets";
import { LoadingScreen } from "../components/LoadingScreen";

interface EmailPreview {
  sender: string;
  subject: string;
  preview: string;
  time: string;
  highlight?: boolean;
}

interface EmailContent {
  title?: string;
  subject: string;
  from: string;
  body: (
    | string
    | { type: "list"; items: string[] }
    | { type: "signature"; text: string }
  )[];
}

interface Email {
  preview: EmailPreview;
  content: EmailContent;
}

const EMAILS: Record<number, Email> = {
  0: {
    preview: {
      sender: "Supreme Council",
      subject: "Commander Assignment Protocol",
      preview: "URGENT: Supreme Council",
      time: "Just now",
      highlight: true,
    },
    content: {
      title: "Commander Assignment Protocol",
      subject: "Commander Assignment Protocol",
      from: "Supreme Leader of the Galactic Council",
      body: [
        "Greetings, Commander.",
        'On behalf of the Galactic Council, I extend my congratulations on your graduation from the Elite Commander Academy. Your exceptional "performance" has not gone unnoticed.',
        "As per protocol, you are now required to select your first command post. Choose your homeworld wisely, as it will serve as the foundation for your future operations and contributions to our galactic civilization.",
        "The Council awaits your decision.",
      ],
    },
  },
  1: {
    preview: {
      sender: "Mom",
      subject: "Important Reminders for My Space Commander!",
      preview: "Don't forget to eat your space vegetables! 🥬",
      time: "1 hour ago",
    },
    content: {
      title: "Important Reminders for My Space Commander!",
      subject: "Important Reminders for My Space Commander!",
      from: "Mom",
      body: [
        "Sweetie! 💖",
        "I know you're about to command your very own planet, but don't forget:",
        {
          type: "list",
          items: [
            "Pack your warm space socks - space is cold!",
            "Remember to brush your teeth after each meal (even freeze-dried ones)",
            "Call me at least twice per galactic cycle",
            "Don't talk to strange aliens unless they've been properly introduced",
            "Keep your ray gun charged and your quarters tidy",
          ],
        },
        "I put some homemade cosmic cookies in your cargo bay. Share them with your crew! 🍪",
        "PS: Your father says to remember the trick about reversing the polarity - whatever that means! 🤷‍♀️",
        {
          type: "signature",
          text: "Lots of love and virtual hugs! 🤗\nMom",
        },
      ],
    },
  },
  2: {
    preview: {
      sender: "Cadet ZX-427 (Your Roommate)",
      subject: "Try Not to Crash Anything Important!",
      preview: "LOL good luck out there! 🚀",
      time: "2 hours ago",
    },
    content: {
      title: "Try Not to Crash Anything Important!",
      subject: "Try Not to Crash Anything Important!",
      from: "Cadet ZX-427",
      body: [
        'Hey "Commander" 😂',
        "Can't believe they're actually letting you command a planet! Remember when you crashed the simulator so bad they had to reset the entire system? Good times!",
        "Just don't pick the same sector as me - I've seen your piloting skills and I like my ships intact! 🚀💥",
        "P.S. You still owe me 50 credits from that bet about passing the tactical exam! 💸",
        {
          type: "signature",
          text: "- Your favorite roommate",
        },
      ],
    },
  },
  3: {
    preview: {
      sender: "Class Valedictorian",
      subject: "Congratulations on Your... Unique Approach",
      preview: "Thanks for making me look good 😏",
      time: "5 hours ago",
    },
    content: {
      title: "Congratulations on Your... Unique Approach",
      subject: "Congratulations on Your... Unique Approach",
      from: "Class Valedictorian",
      body: [
        'Dear "Graduate",',
        "I just wanted to thank you for your... memorable performance during the final exams. Your creative interpretation of battle formations made me look absolutely brilliant in comparison! ✨",
        'But seriously, who would\'ve thought that "accidentally" activating the self-destruct sequence would become a legitimate tactical maneuver? They literally had to rewrite the rulebook because of you. 🤯',
        "May your future enemies be as confused by your strategies as we all were. 🌟",
        {
          type: "signature",
          text: "Best regards,\nThe one who actually read the manual 📚",
        },
      ],
    },
  },
};

export function ChooseHomeworldPage() {
  const { state } = useGame();
  const { unclaimedPlanets, loading } = usePlanets();
  const navigate = useNavigate();
  const [step, setStep] = useState<"message" | "messageOpen" | "choose">(
    "message"
  );
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);

  const handlePlanetSelect = async (planet: Planet) => {
    try {
      await api.planets.claim(planet.id, true);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error claiming planet:", error);
    }
  };

  useEffect(() => {
    if (state.selectedPlanet?.id) {
      navigate("/dashboard");
    }
  }, [state.selectedPlanet, navigate]);

  // Show loading screen while fetching planet data
  if (loading) {
    return <LoadingScreen message="SCANNING STAR SYSTEMS..." />;
  }

  if (step === "message") {
    return (
      <div className="min-h-screen bg-background p-6 bg-[url('/assets/space-bg.jpg')] bg-cover">
        <div className="container mx-auto backdrop-blur-sm">
          <Card className="border-2 h-[calc(100vh-3rem)] shadow-2xl shadow-primary/20 animate-fade-in">
            <CardHeader className="border-b bg-gray-900">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs border border-gray-600">
                    _
                  </span>
                  <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs border border-gray-600">
                    □
                  </span>
                  <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs border border-gray-600">
                    ×
                  </span>
                </div>
                <span className="text-primary font-mono ml-4">
                  Galactic Mail Terminal v3.14
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-4rem)] bg-gray-900/95">
              <div className="grid grid-cols-[250px_1fr] h-full">
                <div className="border-r border-primary/20 p-4 space-y-3 bg-gray-900">
                  {Object.entries(EMAILS).map(([id, email]) => (
                    <div
                      key={id}
                      className={`p-3 border border-primary/30 rounded-md cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-gray-800 hover:border-primary ${
                        selectedEmail === Number(id)
                          ? "bg-gray-800 border-primary scale-105"
                          : ""
                      }`}
                      onClick={() => setSelectedEmail(Number(id))}
                    >
                      <p
                        className={`font-medium ${
                          email.preview.highlight
                            ? "text-yellow-500 flex items-center gap-2"
                            : "text-blue-400"
                        }`}
                      >
                        {email.preview.highlight && (
                          <span className="animate-ping">★</span>
                        )}
                        {email.preview.preview}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {email.preview.preview}
                      </p>
                      <p className="text-xs text-primary/60">
                        {email.preview.time}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-6 overflow-y-auto bg-gray-900/90">
                  {selectedEmail !== null ? (
                    <div className="space-y-4 animate-fade-in">
                      <div className="space-y-2">
                        {selectedEmail === 0 && (
                          <p className="font-bold text-2xl text-yellow-500 animate-pulse">
                            {EMAILS[selectedEmail].content.title}
                          </p>
                        )}
                        <p className="text-sm text-gray-300">
                          Subject: {EMAILS[selectedEmail].content.subject}
                        </p>
                        <p className="text-sm text-gray-300">
                          From: {EMAILS[selectedEmail].content.from}
                        </p>
                        <p className="text-sm text-gray-300">
                          To: Commander{" "}
                          {state.currentUser?.name || "[REDACTED]"}
                        </p>
                        <div className="border-t border-primary/30 my-4" />
                      </div>
                      <div className="text-gray-200 space-y-4">
                        {EMAILS[selectedEmail].content.body.map(
                          (item, index) => {
                            if (typeof item === "string") {
                              return <p key={index}>{item}</p>;
                            } else if (item.type === "list") {
                              return (
                                <ul
                                  key={index}
                                  className="list-disc pl-5 space-y-2"
                                >
                                  {item.items.map((li, liIndex) => (
                                    <li key={liIndex}>{li}</li>
                                  ))}
                                </ul>
                              );
                            } else if (item.type === "signature") {
                              return (
                                <p
                                  key={index}
                                  className="text-blue-300 whitespace-pre-line"
                                >
                                  {item.text}
                                </p>
                              );
                            }
                          }
                        )}
                        {selectedEmail === 0 && (
                          <Button
                            className="mt-8 w-full py-6 text-xl font-bold bg-primary/40 border-2 border-primary hover:bg-primary/60 hover:border-primary/80 transition-all duration-300 group shadow-lg shadow-primary/30"
                            onClick={() => setStep("choose")}
                          >
                            <span className="group-hover:scale-105 transition-transform duration-300">
                              Accept Assignment
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 animate-pulse">
                      [SELECT MESSAGE TO DECRYPT]
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "messageOpen") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <Card className="max-w-[600px] mx-auto">
            <CardHeader>
              <CardTitle>Proceeding to homeworld selection...</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setStep("choose")}>
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "choose") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-6 w-6 text-primary" />
                Choose Your Homeworld
              </CardTitle>
              <CardDescription>
                {unclaimedPlanets.length} unclaimed planets available
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-6">
                Select your starting planet from the available unclaimed worlds.
                Choose wisely - this will be your base of operations.
              </p>

              <div className="flex justify-center">
                <GalaxyMap2D
                  mode="homeworld"
                  onPlanetSelect={handlePlanetSelect}
                  allowedPlanets={unclaimedPlanets.map((p) => p.id)}
                  initialZoom={0.5}
                  initialCenter={{ x: 0, y: 0 }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <ChooseHomeworld />
      </div>
    </div>
  );
}
