"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, TrendingUp, Users, Crown, Loader2 } from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

interface LeaderboardUser {
  rank: number;
  id: number;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  placesVisited: number;
  reviewsWritten: number;
  badgeCount: number;
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard?limit=20")
      .then((res) => res.json())
      .then((data) => {
        setLeaderboardData(data.leaderboard || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

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

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

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

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading leaderboard...</span>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-end justify-center gap-4 max-w-2xl mx-auto">
                {/* 2nd Place */}
                {top3[1] && (
                  <div className="flex-1 text-center">
                    <div className="mb-2">
                      <Avatar className="w-16 h-16 mx-auto border-4 border-gray-300">
                        <AvatarImage src={top3[1].avatar || ""} alt={top3[1].name} className="object-cover" />
                        <AvatarFallback className="text-xl font-medium">{getInitials(top3[1].name)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="bg-card rounded-t-xl p-4 h-32 flex flex-col justify-end border border-border border-b-0">
                      <Medal className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                      <p className="font-medium text-sm truncate">{top3[1].name}</p>
                      <p className="text-xs text-muted-foreground">{top3[1].xp?.toLocaleString()} XP</p>
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {top3[0] && (
                  <div className="flex-1 text-center">
                    <div className="mb-2">
                      <div className="relative inline-block">
                        <Avatar className="w-20 h-20 mx-auto border-4 border-yellow-400">
                          <AvatarImage src={top3[0].avatar || ""} alt={top3[0].name} className="object-cover" />
                          <AvatarFallback className="text-2xl font-medium">{getInitials(top3[0].name)}</AvatarFallback>
                        </Avatar>
                        <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 text-yellow-400" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-b from-primary/20 to-card rounded-t-xl p-4 h-40 flex flex-col justify-end border border-primary/30 border-b-0">
                      <p className="font-bold truncate">{top3[0].name}</p>
                      <p className="text-sm text-primary font-medium">{top3[0].xp?.toLocaleString()} XP</p>
                      <Badge className="mt-2 mx-auto">Level {top3[0].level}</Badge>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                  <div className="flex-1 text-center">
                    <div className="mb-2">
                      <Avatar className="w-16 h-16 mx-auto border-4 border-amber-600">
                        <AvatarImage src={top3[2].avatar || ""} alt={top3[2].name} className="object-cover" />
                        <AvatarFallback className="text-xl font-medium">{getInitials(top3[2].name)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="bg-card rounded-t-xl p-4 h-24 flex flex-col justify-end border border-border border-b-0">
                      <Medal className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                      <p className="font-medium text-sm truncate">{top3[2].name}</p>
                      <p className="text-xs text-muted-foreground">{top3[2].xp?.toLocaleString()} XP</p>
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
                      className="flex items-center gap-4 p-4"
                    >
                      <div className="w-10 flex items-center justify-center">
                        {getRankIcon(user.rank)}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar || ""} alt={user.name} className="object-cover" />
                        <AvatarFallback className="text-sm font-medium">{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Level {user.level} • {user.placesVisited} places
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{user.xp?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </div>
                    </div>
                  ))}
                  {leaderboardData.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                      No explorers yet. Be the first!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </main>
  );
}
