"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currentUser, recentExpeditions, cities } from "@/lib/data";
import {
  MapPin,
  Star,
  Award,
  Map,
  Heart,
  CheckCircle,
  Edit,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

export default function ProfilePage() {
  const user = currentUser;
  const [activeTab, setActiveTab] = useState<"expeditions" | "favorites" | "visited">(
    "expeditions"
  );

  const visitedCitiesData = cities.filter((city) =>
    user.visitedCities.includes(city.id)
  );

  const favoriteCitiesData = cities.filter((city) =>
    user.favoriteCities.includes(city.id)
  );

  const xpPercentage = (user.xp / user.xpToNextLevel) * 100;

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
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
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
                  PATHFINDER
                </Badge>
                <Button variant="outline" size="sm" asChild className="w-fit mx-auto md:mx-0">
                  <Link href="/profile/edit">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
              <p className="text-muted-foreground mb-4">
                EXPLORER XP: {user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()}
              </p>

              {/* XP Progress */}
              <div className="max-w-sm mx-auto md:mx-0">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full transition-all"
                    style={{ width: `${xpPercentage}%` }}
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
                Achievement Gallery
              </h2>
              <Link href="/achievements" className="text-primary text-sm hover:underline">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {user.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-secondary rounded-xl p-4 text-center"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                    {badge.icon}
                  </div>
                  <p className="font-medium text-sm">{badge.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {badge.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <Button
              variant={activeTab === "expeditions" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("expeditions")}
              className="flex-shrink-0"
            >
              <Map className="h-4 w-4 mr-2" />
              Recent Expeditions
            </Button>
            <Button
              variant={activeTab === "favorites" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("favorites")}
              className="flex-shrink-0"
            >
              <Heart className="h-4 w-4 mr-2" />
              Favorites
            </Button>
            <Button
              variant={activeTab === "visited" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("visited")}
              className="flex-shrink-0"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Visited Cities
            </Button>
          </div>

          {/* Expeditions Tab */}
          {activeTab === "expeditions" && (
            <div className="space-y-4">
              {recentExpeditions.map((expedition) => (
                <div
                  key={expedition.id}
                  className="bg-card rounded-xl p-4 border border-border flex gap-4"
                >
                  <img
                    src={expedition.image}
                    alt={expedition.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {expedition.location}
                      </Badge>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs text-foreground">{expedition.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-medium mb-1 line-clamp-1">{expedition.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {expedition.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div className="grid md:grid-cols-2 gap-4">
              {favoriteCitiesData.map((city) => (
                <Link
                  key={city.id}
                  href={`/explore?city=${city.id}`}
                  className="bg-card rounded-xl overflow-hidden border border-border group"
                >
                  <div className="relative h-32">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <h3 className="font-semibold">{city.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {city.placeCount} places
                      </p>
                    </div>
                    <Heart className="absolute top-3 right-3 h-5 w-5 text-primary fill-primary" />
                  </div>
                </Link>
              ))}
              {favoriteCitiesData.length === 0 && (
                <div className="col-span-2 text-center py-10 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No favorite cities yet</p>
                </div>
              )}
            </div>
          )}

          {/* Visited Cities Tab */}
          {activeTab === "visited" && (
            <div className="grid md:grid-cols-3 gap-4">
              {visitedCitiesData.map((city) => (
                <Link
                  key={city.id}
                  href={`/explore?city=${city.id}`}
                  className="bg-card rounded-xl overflow-hidden border border-border group relative"
                >
                  <div className="relative h-40">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <h3 className="font-semibold">{city.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {city.placeCount} places discovered
                      </p>
                    </div>
                    <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-primary fill-primary" />
                  </div>
                </Link>
              ))}
              {visitedCitiesData.length === 0 && (
                <div className="col-span-3 text-center py-10 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No visited cities yet. Start exploring!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Region Progress */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-xl font-semibold mb-6">Region Progress</h2>
            <div className="space-y-4">
              {cities.slice(0, 4).map((city) => {
                const isVisited = user.visitedCities.includes(city.id);
                const progress = isVisited ? 100 : Math.floor(Math.random() * 70);
                return (
                  <div key={city.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{city.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {progress}% explored
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
