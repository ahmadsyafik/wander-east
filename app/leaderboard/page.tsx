"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currentUser } from "@/lib/data";
import { Trophy, Medal, TrendingUp, Users, Crown } from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

// Dummy leaderboard data with different periods
const allTimeData = [
  {
    rank: 1,
    name: "Rizky Adventure",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    level: 25,
    xp: 12500,
    placesVisited: 89,
    badge: "Master Explorer",
  },
  {
    rank: 2,
    name: "Maya Wanderer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    level: 23,
    xp: 11200,
    placesVisited: 78,
    badge: "Pathfinder",
  },
  {
    rank: 3,
    name: "Andi Traveler",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    level: 21,
    xp: 9800,
    placesVisited: 72,
    badge: "Trailblazer",
  },
  {
    rank: 4,
    name: "Sari Explorer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    level: 19,
    xp: 8500,
    placesVisited: 65,
    badge: "Adventurer",
  },
  {
    rank: 5,
    name: "Dimas Hunter",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    level: 18,
    xp: 7900,
    placesVisited: 58,
    badge: "Pioneer",
  },
  {
    rank: 6,
    name: "Putri Seeker",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
    level: 17,
    xp: 7200,
    placesVisited: 52,
    badge: "Scout",
  },
  {
    rank: 7,
    name: "Budi Explorer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    level: 12,
    xp: 2450,
    placesVisited: 42,
    badge: "Pathfinder",
    isCurrentUser: true,
  },
  {
    rank: 8,
    name: "Wira Nomad",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80",
    level: 11,
    xp: 2100,
    placesVisited: 38,
    badge: "Wanderer",
  },
  {
    rank: 9,
    name: "Dewi Roamer",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&q=80",
    level: 10,
    xp: 1800,
    placesVisited: 34,
    badge: "Newcomer",
  },
  {
    rank: 10,
    name: "Yoga Discover",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
    level: 9,
    xp: 1500,
    placesVisited: 30,
    badge: "Newcomer",
  },
];

const monthlyData = [
  {
    rank: 1,
    name: "Maya Wanderer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    level: 23,
    xp: 2800,
    placesVisited: 15,
    badge: "Pathfinder",
  },
  {
    rank: 2,
    name: "Budi Explorer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    level: 12,
    xp: 2450,
    placesVisited: 12,
    badge: "Pathfinder",
    isCurrentUser: true,
  },
  {
    rank: 3,
    name: "Rizky Adventure",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    level: 25,
    xp: 2100,
    placesVisited: 10,
    badge: "Master Explorer",
  },
  {
    rank: 4,
    name: "Dimas Hunter",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    level: 18,
    xp: 1900,
    placesVisited: 9,
    badge: "Pioneer",
  },
  {
    rank: 5,
    name: "Andi Traveler",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    level: 21,
    xp: 1700,
    placesVisited: 8,
    badge: "Trailblazer",
  },
  {
    rank: 6,
    name: "Sari Explorer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    level: 19,
    xp: 1500,
    placesVisited: 7,
    badge: "Adventurer",
  },
  {
    rank: 7,
    name: "Wira Nomad",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80",
    level: 11,
    xp: 1200,
    placesVisited: 6,
    badge: "Wanderer",
  },
  {
    rank: 8,
    name: "Putri Seeker",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
    level: 17,
    xp: 1000,
    placesVisited: 5,
    badge: "Scout",
  },
];

const weeklyData = [
  {
    rank: 1,
    name: "Budi Explorer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    level: 12,
    xp: 850,
    placesVisited: 5,
    badge: "Pathfinder",
    isCurrentUser: true,
  },
  {
    rank: 2,
    name: "Maya Wanderer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    level: 23,
    xp: 720,
    placesVisited: 4,
    badge: "Pathfinder",
  },
  {
    rank: 3,
    name: "Dimas Hunter",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    level: 18,
    xp: 680,
    placesVisited: 4,
    badge: "Pioneer",
  },
  {
    rank: 4,
    name: "Wira Nomad",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80",
    level: 11,
    xp: 520,
    placesVisited: 3,
    badge: "Wanderer",
  },
  {
    rank: 5,
    name: "Rizky Adventure",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    level: 25,
    xp: 450,
    placesVisited: 2,
    badge: "Master Explorer",
  },
];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "allTime">("allTime");

  const leaderboardData = useMemo(() => {
    switch (period) {
      case "weekly":
        return weeklyData;
      case "monthly":
        return monthlyData;
      case "allTime":
      default:
        return allTimeData;
    }
  }, [period]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const top3 = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  const currentUserRank = leaderboardData.find(u => u.isCurrentUser);

  return (
    <main className="min-h-screen bg-background">
      <Navbar isLoggedIn={true} />

      {/* Header */}
      <section className="pt-24 pb-8 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={serifFont}>Explorer Leaderboard</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Compete with fellow explorers and climb the ranks. The more you explore,
            the higher you rise!
          </p>
        </div>
      </section>

      {/* Period Filter */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={period === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("weekly")}
            >
              This Week
            </Button>
            <Button
              variant={period === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("monthly")}
            >
              This Month
            </Button>
            <Button
              variant={period === "allTime" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("allTime")}
            >
              All Time
            </Button>
          </div>
        </div>
      </section>

      {/* Top 3 Podium */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-center gap-4 max-w-2xl mx-auto">
            {/* 2nd Place */}
            {top3[1] && (
              <div className="flex-1 text-center">
                <div className="mb-2">
                  <img
                    src={top3[1].avatar}
                    alt={top3[1].name}
                    className="w-16 h-16 rounded-full mx-auto border-4 border-gray-300"
                  />
                </div>
                <div className="bg-card rounded-t-xl p-4 h-32 flex flex-col justify-end border border-border border-b-0">
                  <Medal className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                  <p className="font-medium text-sm truncate">{top3[1].name}</p>
                  <p className="text-xs text-muted-foreground">{top3[1].xp.toLocaleString()} XP</p>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <div className="flex-1 text-center">
                <div className="mb-2">
                  <div className="relative inline-block">
                    <img
                      src={top3[0].avatar}
                      alt={top3[0].name}
                      className="w-20 h-20 rounded-full mx-auto border-4 border-yellow-400"
                    />
                    <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 text-yellow-400" />
                  </div>
                </div>
                <div className="bg-gradient-to-b from-primary/20 to-card rounded-t-xl p-4 h-40 flex flex-col justify-end border border-primary/30 border-b-0">
                  <p className="font-bold truncate">{top3[0].name}</p>
                  <p className="text-sm text-primary font-medium">{top3[0].xp.toLocaleString()} XP</p>
                  <Badge className="mt-2 mx-auto">{top3[0].badge}</Badge>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div className="flex-1 text-center">
                <div className="mb-2">
                  <img
                    src={top3[2].avatar}
                    alt={top3[2].name}
                    className="w-16 h-16 rounded-full mx-auto border-4 border-amber-600"
                  />
                </div>
                <div className="bg-card rounded-t-xl p-4 h-24 flex flex-col justify-end border border-border border-b-0">
                  <Medal className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <p className="font-medium text-sm truncate">{top3[2].name}</p>
                  <p className="text-xs text-muted-foreground">{top3[2].xp.toLocaleString()} XP</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Full Leaderboard */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Full Rankings
              </h2>
            </div>
            <div className="divide-y divide-border">
              {leaderboardData.map((user) => (
                <div
                  key={`${user.rank}-${user.name}`}
                  className={`flex items-center gap-4 p-4 ${
                    user.isCurrentUser ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="w-10 flex items-center justify-center">
                    {getRankIcon(user.rank)}
                  </div>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className={`w-10 h-10 rounded-full object-cover ${
                      user.isCurrentUser ? "ring-2 ring-primary" : ""
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{user.name}</p>
                      {user.isCurrentUser && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Level {user.level} • {user.placesVisited} places
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{user.xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Your Stats */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-gradient-to-r from-primary/20 to-card rounded-2xl p-6 border border-primary/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Your Progress</h3>
              <Badge>Rank #{currentUserRank?.rank || 7}</Badge>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full border-2 border-primary"
              />
              <div>
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentUser.xp.toLocaleString()} / {currentUser.xpToNextLevel.toLocaleString()} XP to Level{" "}
                  {currentUser.level + 1}
                </p>
              </div>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full"
                style={{ width: `${(currentUser.xp / currentUser.xpToNextLevel) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Keep exploring to climb the ranks!
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
