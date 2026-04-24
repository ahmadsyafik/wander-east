"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Ban,
  Shield,
  ShieldOff,
  Star,
  MessageSquare,
  Camera,
  Calendar,
  Mail,
  RefreshCw,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

// Dummy users data
const usersData = [
  {
    id: "1",
    name: "Budi Explorer",
    email: "budi@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    level: 12,
    xp: 2450,
    role: "user",
    status: "active",
    stats: { places: 42, reviews: 128, photos: 315 },
    joinedAt: "2023-06-15",
    bio: "Passionate traveler exploring the hidden gems of East Java.",
  },
  {
    id: "2",
    name: "Maya Wanderer",
    email: "maya@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    level: 23,
    xp: 11200,
    role: "user",
    status: "active",
    stats: { places: 78, reviews: 234, photos: 567 },
    joinedAt: "2023-01-10",
    bio: "Adventure seeker and food lover.",
  },
];

export default function ViewUserPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<(typeof usersData)[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundUser = usersData.find((u) => u.id === params.id);
    setUser(foundUser || null);
    setIsLoading(false);
  }, [params.id]);

  const handleAction = (action: string) => {
    const messages: Record<string, string> = {
      ban: `Ban user "${user?.name}"?`,
      unban: `Unban user "${user?.name}"?`,
      makeAdmin: `Make "${user?.name}" an admin?`,
      removeAdmin: `Remove admin role from "${user?.name}"?`,
    };

    if (confirm(messages[action])) {
      alert(`Action "${action}" performed! (This is a demo - backend integration needed)`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <Button asChild>
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold" style={serifFont}>
              User Profile
            </h1>
            <p className="text-muted-foreground">View user details</p>
          </div>
        </div>
        <div className="flex gap-3">
          {user.role === "user" ? (
            <Button variant="outline" onClick={() => handleAction("makeAdmin")}>
              <Shield className="h-4 w-4 mr-2" />
              Make Admin
            </Button>
          ) : (
            <Button variant="outline" onClick={() => handleAction("removeAdmin")}>
              <ShieldOff className="h-4 w-4 mr-2" />
              Remove Admin
            </Button>
          )}
          {user.status === "active" ? (
            <Button variant="destructive" onClick={() => handleAction("ban")}>
              <Ban className="h-4 w-4 mr-2" />
              Ban User
            </Button>
          ) : (
            <Button onClick={() => handleAction("unban")}>
              <Shield className="h-4 w-4 mr-2" />
              Unban User
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-primary"
          />
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-muted-foreground text-sm mb-4">{user.email}</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            {user.role === "admin" ? (
              <Badge className="bg-purple-500/20 text-purple-400">Admin</Badge>
            ) : (
              <Badge variant="secondary">User</Badge>
            )}
            {user.status === "active" ? (
              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400">Banned</Badge>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {user.joinedAt}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Statistics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{user.stats.places}</p>
                <p className="text-sm text-muted-foreground">Places</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{user.stats.reviews}</p>
                <p className="text-sm text-muted-foreground">Reviews</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <Camera className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{user.stats.photos}</p>
                <p className="text-sm text-muted-foreground">Photos</p>
              </div>
            </div>
          </div>

          {/* Level & XP */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Level Progress</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{user.level}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Level {user.level}</p>
                <p className="text-sm text-muted-foreground">
                  {user.xp.toLocaleString()} XP earned
                </p>
              </div>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full"
                style={{ width: `${(user.xp % 1000) / 10}%` }}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Bio</h2>
            <p className="text-muted-foreground">
              {user.bio || "No bio provided."}
            </p>
          </div>

          {/* Metadata */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Account Information</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-muted-foreground">User ID</label>
                <p className="font-mono text-xs bg-secondary p-2 rounded mt-1">
                  {user.id}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground">Email</label>
                <p className="font-mono text-xs bg-secondary p-2 rounded mt-1">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
