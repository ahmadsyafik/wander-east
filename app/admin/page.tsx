"use client";

import Link from "next/link";
import { places, cities } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  MessageSquare,
  Eye,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Star,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

// Dummy stats
const stats = [
  {
    label: "Total Places",
    value: places.length,
    change: "+12%",
    isPositive: true,
    icon: MapPin,
  },
  {
    label: "Total Users",
    value: "2,847",
    change: "+8%",
    isPositive: true,
    icon: Users,
  },
  {
    label: "Total Reviews",
    value: "15,234",
    change: "+23%",
    isPositive: true,
    icon: MessageSquare,
  },
  {
    label: "Page Views",
    value: "124.5K",
    change: "-3%",
    isPositive: false,
    icon: Eye,
  },
];

const recentPlaces = places.slice(0, 5);

const recentReviews = [
  {
    id: "1",
    user: "Aria Kurniawan",
    place: "Tumpak Sewu Waterfall",
    rating: 5,
    comment: "Amazing experience!",
    time: "2 hours ago",
  },
  {
    id: "2",
    user: "Maya Explorer",
    place: "Kawah Ijen",
    rating: 5,
    comment: "Blue fire is incredible",
    time: "4 hours ago",
  },
  {
    id: "3",
    user: "Budi Traveler",
    place: "Rawon Nguling",
    rating: 4,
    comment: "Best rawon in town!",
    time: "6 hours ago",
  },
  {
    id: "4",
    user: "Sari Foodie",
    place: "Toko Oen",
    rating: 5,
    comment: "Nostalgic vibes",
    time: "8 hours ago",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={serifFont}>Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with Wander East.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/places/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Place
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card rounded-xl p-5 border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    stat.isPositive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stat.isPositive ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Places */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Recent Places</h2>
            <Link
              href="/admin/places"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentPlaces.map((place) => (
              <div key={place.id} className="p-4 flex items-center gap-4">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{place.name}</p>
                  <p className="text-sm text-muted-foreground">{place.cityName}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm text-foreground">{place.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {place.reviewCount} reviews
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Recent Reviews</h2>
            <Link
              href="/admin/reviews"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentReviews.map((review) => (
              <div key={review.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{review.user}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  on <span className="text-foreground">{review.place}</span>
                </p>
                <p className="text-sm">&quot;{review.comment}&quot;</p>
                <p className="text-xs text-muted-foreground mt-2">{review.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* City Overview */}
      <div className="mt-6 bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">City Overview</h2>
        </div>
        <div className="p-5">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cities.map((city) => (
              <div
                key={city.id}
                className="bg-secondary rounded-lg p-4 text-center"
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-20 object-cover rounded-lg mb-3"
                />
                <p className="font-medium text-sm">{city.name}</p>
                <p className="text-xs text-muted-foreground">
                  {city.placeCount} places
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
