"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { badges } from "@/lib/data";
import { Trophy, Star, Users, ArrowRight } from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

export function GamificationSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-secondary to-card rounded-3xl p-8 md:p-12 border border-border">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left Content */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="text-primary text-sm font-medium uppercase tracking-wider">
                  Gamification
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={serifFont}>
                Ascend to Elite Status
              </h2>
              <p className="text-muted-foreground mb-6">
                Every hidden gem you uncover earns you XP and unique digital badges.
                Climb the leaderboard and unlock exclusive exploration perks.
              </p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Level 12: Forest Strider</span>
                  <span className="text-sm text-muted-foreground">2,450 / 3,000 XP</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full"
                    style={{ width: "82%" }}
                  />
                </div>
              </div>

              <Button asChild className="rounded-full">
                <Link href="/login">
                  Join the Ranks
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Right Content - Badges */}
            <div className="space-y-6">
              {/* Featured Badges */}
              <div className="flex justify-center gap-6">
                {badges.slice(0, 2).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center gap-2 p-4 bg-background/50 rounded-2xl border border-border"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl">
                      {badge.icon}
                    </div>
                    <span className="text-sm font-medium">{badge.name}</span>
                    <span className="text-xs text-muted-foreground text-center">
                      {badge.description}
                    </span>
                  </div>
                ))}
              </div>

              {/* Community Stats */}
              <div className="bg-background/50 rounded-2xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Explorer Community</p>
                    <p className="text-sm text-muted-foreground">
                      Connect with 10k+ Explorers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
