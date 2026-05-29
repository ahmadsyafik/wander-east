"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Award, Lock, Trophy } from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

const iconMap: Record<string, string> = {
  STEPS: "👣",
  MAP: "🗺️",
  SUMMIT: "🏔️",
  WRITE: "✍️",
  CRITIC: "🎭",
  BUS: "🚌",
  TROPHY: "🏆",
  FOOD: "🍽️",
  TASTE: "😋",
  NOODLE: "🍜",
};

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: string;
  category: string;
  current: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

const categories = ["All", "Culinary", "Tourism"];

export default function AchievementsPage() {
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch("/api/gamification/achievements")
      .then((res) => res.json())
      .then((data) => {
        setAllAchievements(data.achievements || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load achievements", err);
        setIsLoading(false);
      });
  }, []);

  const unlockedCount = allAchievements.filter((a) => a.isUnlocked).length;
  const displayedAchievements = allAchievements.filter((a) => 
    activeCategory === "All" || a.category === activeCategory
  );

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={serifFont}>Achievement Gallery</h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Collect badges by exploring East Java. Complete challenges to unlock exclusive achievements!
          </p>
          <div className="inline-flex items-center gap-2 bg-card rounded-full px-6 py-3 border border-border">
            <Award className="h-5 w-5 text-primary" />
            <span className="font-semibold">{unlockedCount}</span>
            <span className="text-muted-foreground">/ {allAchievements.length} Unlocked</span>
          </div>
        </div>
      </section>

      {/* Achievements Grid */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          {/* Categories */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 justify-center">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={cat === activeCategory ? "default" : "outline"}
                className="cursor-pointer flex-shrink-0"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading achievements...</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`bg-card rounded-2xl p-6 border transition-all ${
                    achievement.isUnlocked
                      ? "border-primary/50 shadow-lg shadow-primary/10"
                      : "border-border opacity-70"
                  }`}
                >
                  <div className="text-center flex flex-col h-full">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl ${
                        achievement.isUnlocked
                          ? "bg-primary/20"
                          : "bg-secondary"
                      }`}
                    >
                      {achievement.isUnlocked ? (
                        iconMap[achievement.icon] || "🏅"
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <Badge variant="secondary" className="mb-2 text-xs self-center">
                      {achievement.category}
                    </Badge>
                    <h3 className="font-semibold mb-1">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {achievement.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className={achievement.isUnlocked ? "text-primary font-medium" : ""}>
                          {Math.min(achievement.current, achievement.requirement)}/{achievement.requirement}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            achievement.isUnlocked
                              ? "bg-primary"
                              : "bg-muted-foreground/50"
                          }`}
                          style={{
                            width: `${Math.min((achievement.current / achievement.requirement) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {displayedAchievements.length === 0 && (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  No achievements found in this category.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
