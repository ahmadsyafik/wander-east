"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Award,
  Edit,
  Loader2,
  Heart,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  role: string;
  stats: {
    placesVisited: number;
    reviewsWritten: number;
    photosShared: number;
  };
  badges: Array<{ ID: number; NAME: string; DESCRIPTION: string; ICON: string }>;
  joinedAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Array<{
    id: number; name: string; slug: string; image: string;
    category: string; rating: number; cityName: string;
  }>>([]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setIsLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });

    // Fetch favorites
    fetch("/api/favorites")
      .then((res) => res.ok ? res.json() : { favorites: [] })
      .then((data) => setFavorites(data.favorites || []))
      .catch(() => {});
  }, [router]);

  if (isLoading || !user) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar isLoggedIn={false} />
        <div className="flex items-center justify-center pt-32 pb-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading profile...</span>
        </div>
        <Footer />
      </main>
    );
  }

  const xpPercentage = user.xpToNextLevel > 0 ? (user.xp / user.xpToNextLevel) * 100 : 0;

  return (
    <main className="min-h-screen bg-background">
      <Navbar isLoggedIn={true} />

      {/* Profile Header */}
      <section className="pt-20 pb-8 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-primary p-1">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/80 to-teal-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {user.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                Lv. {user.level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold" style={serifFont}>{user.name}</h1>
                <Badge variant="secondary" className="w-fit mx-auto md:mx-0">
                  {user.role === "admin" ? "ADMIN" : "EXPLORER"}
                </Badge>
                <Button variant="outline" size="sm" asChild className="w-fit mx-auto md:mx-0">
                  <Link href="/profile/edit">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
              <p className="text-muted-foreground mb-4">
                EXPLORER XP: {user.xp?.toLocaleString()} / {user.xpToNextLevel?.toLocaleString()}
              </p>

              {/* XP Progress */}
              <div className="max-w-sm mx-auto md:mx-0">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full transition-all"
                    style={{ width: `${Math.min(xpPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-card rounded-xl p-4 text-center border border-border">
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {user.stats.placesVisited}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
                Places Visited
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center border border-border">
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {user.stats.reviewsWritten}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
                Reviews Written
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center border border-border">
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {user.stats.photosShared}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
                Photos Shared
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Gallery */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Badges Earned
              </h2>
              <Link href="/achievements" className="text-primary text-sm hover:underline">
                View All
              </Link>
            </div>

            {user.badges && user.badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {user.badges.map((badge) => (
                  <div
                    key={badge.ID}
                    className="bg-secondary rounded-xl p-4 text-center"
                  >
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                      {badge.ICON}
                    </div>
                    <p className="font-medium text-sm">{badge.NAME}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {badge.DESCRIPTION}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No badges yet. Start exploring to earn badges!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Favorite Places */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-400" />
                Favorite Places
              </h2>
            </div>

            {favorites.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((fav) => (
                  <Link
                    key={fav.id}
                    href={`/destination/${fav.slug}`}
                    className="group bg-secondary rounded-xl overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                  >
                    {fav.image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={fav.image}
                          alt={fav.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="font-medium text-sm">{fav.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{fav.cityName}</span>
                        <span className="text-xs text-yellow-400 flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-current" /> {fav.rating}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada tempat favorit. Klik ❤️ di halaman destinasi!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Member Since */}
      <section className="py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 inline mr-1" />
            Member since {new Date(user.joinedAt).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
