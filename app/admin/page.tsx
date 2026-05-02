"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  MessageSquare,
  Eye,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Star,
  Loader2,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

interface AdminStats {
  totalUsers: number;
  totalPlaces: number;
  totalReviews: number;
  totalCheckins: number;
  newUsers30d: number;
  newReviews30d: number;
  newPlaces30d: number;
}

interface TopPlace {
  id: number;
  name: string;
  slug: string;
  cityName: string;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
}

interface RecentReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
  placeName: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [topPlaces, setTopPlaces] = useState<TopPlace[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats);
        setTopPlaces(data.topPlaces || []);
        setRecentReviews(data.recentReviews || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Places",
      value: stats?.totalPlaces || 0,
      subtext: `+${stats?.newPlaces30d || 0} this month`,
      icon: MapPin,
    },
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      subtext: `+${stats?.newUsers30d || 0} this month`,
      icon: Users,
    },
    {
      label: "Total Reviews",
      value: stats?.totalReviews || 0,
      subtext: `+${stats?.newReviews30d || 0} this month`,
      icon: MessageSquare,
    },
    {
      label: "Total Check-ins",
      value: stats?.totalCheckins || 0,
      subtext: "All time",
      icon: Eye,
    },
  ];

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center gap-1 text-xs text-primary">
                <ArrowUpRight className="h-3 w-3" />
                <span>{stat.subtext}</span>
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Rated Places */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Top Rated Places</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/places">View All</Link>
            </Button>
          </div>
          <div className="divide-y divide-border">
            {topPlaces.map((place) => (
              <div key={place.id} className="flex items-center gap-4 p-4">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{place.name}</p>
                  <p className="text-xs text-muted-foreground">{place.cityName}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{place.rating}</span>
                </div>
              </div>
            ))}
            {topPlaces.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No places yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Recent Reviews</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/reviews">View All</Link>
            </Button>
          </div>
          <div className="divide-y divide-border">
            {recentReviews.map((review) => (
              <div key={review.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{review.userName}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm">{review.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-1">on {review.placeName}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {review.comment || "No comment"}
                </p>
              </div>
            ))}
            {recentReviews.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No reviews yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
