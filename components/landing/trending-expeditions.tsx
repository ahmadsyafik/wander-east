"use client";

import Link from "next/link";
import { places } from "@/lib/data";
import { Star, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

export function TrendingExpeditions() {
  const trendingPlaces = places.filter((p) => p.isMustVisit).slice(0, 3);

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-primary text-sm font-medium uppercase tracking-wider">
              Trending
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={serifFont}>Trending Expeditions</h2>
          <p className="text-muted-foreground">
            Community favorites and recently discovered locations in the heart of East Java.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingPlaces.map((place) => (
            <div
              key={place.id}
              className="group bg-secondary rounded-2xl overflow-hidden hover:ring-2 hover:ring-primary transition-all"
            >
              <div className="relative aspect-[4/3]">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary/90 text-primary-foreground">
                    Must Visit
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-medium">{place.rating}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {place.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {place.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{place.cityName}</span>
                  </div>
                  <Link
                    href="/login"
                    className="flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                  >
                    <span>Explore</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
