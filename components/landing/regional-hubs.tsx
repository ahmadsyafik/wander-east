"use client";

import Link from "next/link";
import { cities } from "@/lib/data";
import { ArrowRight } from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

export function RegionalHubs() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-bold" style={serifFont}>Regional Hubs</h2>
          <Link
            href="/explore"
            className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
          >
            {/* View All <ArrowRight className="h-4 w-4" /> */}
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={`/explore?city=${city.id}`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-semibold text-foreground">{city.name}</h3>
                <p className="text-sm text-muted-foreground">{city.placeCount} places</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
