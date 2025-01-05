"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Trophy,
  Shield,
  Swords,
  ChevronLeft,
  ChevronRight,
  Globe,
} from "lucide-react";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { LoadingScreen } from "../../../components/LoadingScreen";
import Image from "next/image";
import { getPublicImageUrl } from "@/lib/images";
import Link from "next/link";

type RankingType = "global" | "defense" | "attack";

interface RankingEntry {
  user_id: string;
  name: string;
  avatar: string;
  score: number;
}

// Military ranks based on score ranges
const RANKS = [
  { min: 0, name: "Cadet", color: "text-gray-400" },
  { min: 1000, name: "Lieutenant", color: "text-blue-400" },
  { min: 5000, name: "Commander", color: "text-green-400" },
  { min: 10000, name: "Captain", color: "text-yellow-400" },
  { min: 25000, name: "Admiral", color: "text-purple-400" },
  { min: 50000, name: "Fleet Admiral", color: "text-red-400" },
  { min: 100000, name: "Supreme Commander", color: "text-primary" },
];

const getRank = (score: number) => {
  return RANKS.reduce((highest, rank) => {
    if (score >= rank.min && rank.min >= highest.min) {
      return rank;
    }
    return highest;
  }, RANKS[0]);
};

const USERS_PER_PAGE = 10;

export default function Rankings() {
  const [rankingsCache, setRankingsCache] = useState<
    Record<RankingType, Record<number, RankingEntry[]>>
  >({
    global: {},
    defense: {},
    attack: {},
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rankingType, setRankingType] = useState<RankingType>("global");

  const fetchRankings = useCallback(
    async (type: RankingType, page: number) => {
      if (rankingsCache[type][page]) {
        return rankingsCache[type][page];
      }

      try {
        const response = await api.rankings.getRankings({
          type,
          page,
        });

        setRankingsCache((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            [page]: response.rankings,
          },
        }));

        return response.rankings;
      } catch (error) {
        console.error(`Error fetching ${type} rankings:`, error);
        return [];
      }
    },
    [rankingsCache]
  );

  // Load initial rankings for all types
  useEffect(() => {
    const loadInitialRankings = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchRankings("global", 1),
          fetchRankings("defense", 1),
          fetchRankings("attack", 1),
        ]);
      } catch (error) {
        console.error("Error loading initial rankings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialRankings();
  }, [fetchRankings]);

  // Load rankings when page or type changes
  useEffect(() => {
    fetchRankings(rankingType, currentPage);
  }, [currentPage, rankingType, fetchRankings]);

  const currentRankings = rankingsCache[rankingType][currentPage] || [];

  if (loading) {
    return (
      <LoadingScreen
        message="ACCESSING COMMANDER DATABASE..."
        steps={[
          "ESTABLISHING SECURE CONNECTION...",
          "AUTHENTICATING CREDENTIALS...",
          "DECRYPTING COMMANDER RECORDS...",
          "ANALYZING PERFORMANCE METRICS...",
          "CALCULATING RANKINGS...",
          "GENERATING LEADERBOARDS...",
          "FINALIZING DATA ACCESS...",
        ]}
      />
    );
  }

  const rankingConfig = {
    global: {
      title: "GALACTIC DOMINANCE INDEX",
      description: "Overall commander performance metrics",
      icon: <Globe className="h-8 w-8" />,
      label: "Total Score",
    },
    defense: {
      title: "FORTRESS COMMANDER RANKINGS",
      description: "Defensive strategy effectiveness ratings",
      icon: <Shield className="h-8 w-8" />,
      label: "Defense Score",
    },
    attack: {
      title: "FLEET ADMIRAL RANKINGS",
      description: "Offensive campaign success metrics",
      icon: <Swords className="h-8 w-8" />,
      label: "Attack Score",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold neon-text mb-2 flex items-center gap-2">
          <Trophy className="h-8 w-8" />
          COMMANDER RANKINGS
        </h1>
        <p className="text-muted-foreground">
          Strategic performance metrics of galactic commanders
        </p>
      </div>

      <Tabs
        value={rankingType}
        onValueChange={(v) => setRankingType(v as RankingType)}
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Global
          </TabsTrigger>
          <TabsTrigger value="defense" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Defense
          </TabsTrigger>
          <TabsTrigger value="attack" className="flex items-center gap-2">
            <Swords className="h-4 w-4" />
            Attack
          </TabsTrigger>
        </TabsList>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {rankingConfig[rankingType].icon}
                {rankingConfig[rankingType].title}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentRankings.map((entry, index) => {
                const rank = getRank(entry.score);
                const position = (currentPage - 1) * USERS_PER_PAGE + index + 1;

                return (
                  <Card
                    key={entry.user_id}
                    className={`
                      transition-all duration-300 hover:scale-[1.02]
                      ${
                        position <= 3
                          ? "border-yellow-500/50 bg-yellow-950/10"
                          : "border-primary/20"
                      }
                    `}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="text-2xl font-bold w-8 text-center">
                        {position <= 3 ? (
                          <Trophy
                            className={`h-6 w-6 ${
                              position === 1
                                ? "text-yellow-400"
                                : position === 2
                                ? "text-gray-400"
                                : "text-orange-400"
                            }`}
                          />
                        ) : (
                          position
                        )}
                      </div>

                      <div className="relative w-12 h-12">
                        <Image
                          src={getPublicImageUrl(
                            "avatars",
                            `${entry.avatar || "default"}.webp`
                          )}
                          alt={entry.name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      </div>

                      <div className="flex-1">
                        <Link
                          href={`/user/${entry.user_id}`}
                          className="hover:text-primary"
                        >
                          <h3 className="font-bold">{entry.name}</h3>
                        </Link>
                        <p className={`text-sm ${rank.color}`}>{rank.name}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">
                          {rankingConfig[rankingType].label}
                        </div>
                        <div className="font-mono text-xl font-bold">
                          {entry.score.toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" disabled>
                  Page {currentPage}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentRankings.length < USERS_PER_PAGE}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
