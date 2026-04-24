"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { places, cities } from "@/lib/data";
import {
  Search,
  Star,
  MapPin,
  ArrowRight,
  SlidersHorizontal,
  Utensils,
  Mountain,
  Sparkles,
  TrendingUp,
  Filter,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rating" | "popular" | "newest">("rating");

  const filteredPlaces = useMemo(() => {
    let result = [...places];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (place) =>
          place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.cityName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by city
    if (selectedCity !== "all") {
      result = result.filter((place) => place.cityId === selectedCity);
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((place) => place.category === selectedCategory);
    }

    // Sort
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "popular") {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [searchQuery, selectedCity, selectedCategory, sortBy]);

  const cityFilters = [
    { id: "all", name: "All Cities" },
    ...cities.map((city) => ({ id: city.id, name: city.name })),
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar isLoggedIn={true} />

      {/* Hero Section */}
      <section className="pt-24 pb-8 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={serifFont}>
              East Java <span className="text-primary">Hidden Gems</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Curating the untouched, the mysterious, and the extraordinary. Discover
              the soul of the volcanic east through a digital lens.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search destinations, food, or experiences..."
                className="pl-12 pr-4 h-14 rounded-full bg-secondary border-border text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-border sticky top-16 bg-background/95 backdrop-blur-sm z-40">
        <div className="container mx-auto px-4">
          {/* City Filters */}
          <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">City:</span>
            </div>
            {cityFilters.map((city) => (
              <Button
                key={city.id}
                variant={selectedCity === city.id ? "default" : "outline"}
                size="sm"
                className="rounded-full flex-shrink-0"
                onClick={() => setSelectedCity(city.id)}
              >
                {city.name}
              </Button>
            ))}
          </div>

          {/* Category & Sort Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="rounded-full"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                All
              </Button>
              <Button
                variant={selectedCategory === "kuliner" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("kuliner")}
                className="rounded-full"
              >
                <Utensils className="h-4 w-4 mr-1" />
                Culinary
              </Button>
              <Button
                variant={selectedCategory === "wisata" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("wisata")}
                className="rounded-full"
              >
                <Mountain className="h-4 w-4 mr-1" />
                Tourism
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort:</span>
              <Button
                variant={sortBy === "rating" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("rating")}
              >
                <Star className="h-4 w-4 mr-1" />
                Top Rated
              </Button>
              <Button
                variant={sortBy === "popular" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("popular")}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Popular
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="text-foreground font-medium">{filteredPlaces.length}</span> destinations
            </p>
          </div>

          {filteredPlaces.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlaces.map((place) => (
                <Link
                  key={place.id}
                  href={`/destination/${place.slug}`}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary transition-all"
                >
                  <div className="relative aspect-[4/3]">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {place.isMustVisit && (
                      <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">
                        Must Visit
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm"
                    >
                      {place.category === "kuliner" ? (
                        <Utensils className="h-3 w-3 mr-1" />
                      ) : (
                        <Mountain className="h-3 w-3 mr-1" />
                      )}
                      {place.category === "kuliner" ? "Culinary" : "Tourism"}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium text-foreground">{place.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({place.reviewCount} reviews)
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {place.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{place.cityName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {place.description}
                    </p>
                    {place.priceRange && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <span className="text-sm font-medium text-primary">
                          {place.priceRange}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No destinations found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity("all");
                  setSelectedCategory("all");
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
