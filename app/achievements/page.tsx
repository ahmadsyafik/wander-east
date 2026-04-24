"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { currentUser } from "@/lib/data";
import { Award, Lock, Trophy } from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

// All available achievements
const allAchievements = [
  {
    id: "surabaya-foodie",
    name: "Surabaya Foodie",
    description: "Visited 10 culinary spots in Surabaya",
    icon: "🍜",
    category: "Culinary",
    unlocked: true,
    progress: 10,
    total: 10,
  },
  {
    id: "mountain-king",
    name: "Mountain King",
    description: "Conquered 5 mountains in East Java",
    icon: "🏔️",
    category: "Adventure",
    unlocked: true,
    progress: 5,
    total: 5,
  },
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Visited 3 night destinations",
    icon: "🦉",
    category: "Explorer",
    unlocked: true,
    progress: 3,
    total: 3,
  },
  {
    id: "beach-lover",
    name: "Beach Lover",
    description: "Explored 10 beaches",
    icon: "🏖️",
    category: "Nature",
    unlocked: true,
    progress: 10,
    total: 10,
  },
  {
    id: "waterfall-hunter",
    name: "Waterfall Hunter",
    description: "Discovered 5 waterfalls",
    icon: "💧",
    category: "Nature",
    unlocked: false,
    progress: 3,
    total: 5,
  },
  {
    id: "malang-master",
    name: "Malang Master",
    description: "Visited 15 places in Malang",
    icon: "🎯",
    category: "Explorer",
    unlocked: false,
    progress: 8,
    total: 15,
  },
  {
    id: "coffee-connoisseur",
    name: "Coffee Connoisseur",
    description: "Tried coffee at 10 local cafes",
    icon: "☕",
    category: "Culinary",
    unlocked: false,
    progress: 6,
    total: 10,
  },
  {
    id: "sunrise-chaser",
    name: "Sunrise Chaser",
    description: "Watched sunrise at 3 different locations",
    icon: "🌅",
    category: "Adventure",
    unlocked: false,
    progress: 1,
    total: 3,
  },
  {
    id: "temple-explorer",
    name: "Temple Explorer",
    description: "Visited 5 historical temples",
    icon: "🛕",
    category: "Culture",
    unlocked: false,
    progress: 2,
    total: 5,
  },
  {
    id: "banyuwangi-bound",
    name: "Banyuwangi Bound",
    description: "Explored 10 destinations in Banyuwangi",
    icon: "🌋",
    category: "Explorer",
    unlocked: false,
    progress: 4,
    total: 10,
  },
  {
    id: "photo-master",
    name: "Photo Master",
    description: "Shared 50 photos",
    icon: "📸",
    category: "Community",
    unlocked: false,
    progress: 35,
    total: 50,
  },
  {
    id: "review-guru",
    name: "Review Guru",
    description: "Written 25 detailed reviews",
    icon: "✍️",
    category: "Community",
    unlocked: false,
    progress: 12,
    total: 25,
  },
];

const categories = ["All", "Explorer", "Adventure", "Nature", "Culinary", "Culture", "Community"];

export default function AchievementsPage() {
  const unlockedCount = allAchievements.filter((a) => a.unlocked).length;

  return (
    <main className="min-h-screen bg-background">
      <Navbar isLoggedIn={true} />

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
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={cat === "All" ? "default" : "outline"}
                className="cursor-pointer flex-shrink-0"
              >
                {cat}
              </Badge>
            ))}
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-card rounded-2xl p-6 border transition-all ${
                  achievement.unlocked
                    ? "border-primary/50 shadow-lg shadow-primary/10"
                    : "border-border opacity-70"
                }`}
              >
                <div className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl ${
                      achievement.unlocked
                        ? "bg-primary/20"
                        : "bg-secondary"
                    }`}
                  >
                    {achievement.unlocked ? (
                      achievement.icon
                    ) : (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <Badge variant="secondary" className="mb-2 text-xs">
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
                      <span className={achievement.unlocked ? "text-primary" : ""}>
                        {achievement.progress}/{achievement.total}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          achievement.unlocked
                            ? "bg-primary"
                            : "bg-muted-foreground/50"
                        }`}
                        style={{
                          width: `${(achievement.progress / achievement.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
