"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Eye,
  Ban,
  Shield,
  ShieldOff,
  Star,
  MessageSquare,
  Camera,
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
  },
  {
    id: "3",
    name: "Rizky Adventure",
    email: "rizky@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    level: 25,
    xp: 12500,
    role: "user",
    status: "active",
    stats: { places: 89, reviews: 312, photos: 789 },
    joinedAt: "2022-08-20",
  },
  {
    id: "4",
    name: "Sari Foodie",
    email: "sari@example.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    level: 15,
    xp: 5400,
    role: "user",
    status: "active",
    stats: { places: 35, reviews: 89, photos: 234 },
    joinedAt: "2023-03-22",
  },
  {
    id: "5",
    name: "Spam User",
    email: "spam@test.com",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80",
    level: 1,
    xp: 50,
    role: "user",
    status: "banned",
    stats: { places: 0, reviews: 2, photos: 0 },
    joinedAt: "2024-01-05",
  },
  {
    id: "6",
    name: "Admin Helper",
    email: "helper@jatimur.com",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    level: 50,
    xp: 50000,
    role: "admin",
    status: "active",
    stats: { places: 0, reviews: 0, photos: 0 },
    joinedAt: "2023-01-01",
  },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  const filteredUsers = usersData.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleAction = (action: string, userId: string, userName: string) => {
    const messages: Record<string, string> = {
      ban: `Ban user "${userName}"?`,
      unban: `Unban user "${userName}"?`,
      makeAdmin: `Make "${userName}" an admin?`,
      removeAdmin: `Remove admin role from "${userName}"?`,
    };

    if (confirm(messages[action])) {
      alert(`Action "${action}" performed on ${userName} (This is a demo)`);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={serifFont}>Manage Users</h1>
        <p className="text-muted-foreground">
          View and manage user accounts on the platform.
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold">{usersData.length}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold">
            {usersData.filter((u) => u.status === "active").length}
          </p>
          <p className="text-sm text-muted-foreground">Active Users</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold">
            {usersData.filter((u) => u.role === "admin").length}
          </p>
          <p className="text-sm text-muted-foreground">Administrators</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
          <select
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 font-medium text-sm">User</th>
                <th className="text-left p-4 font-medium text-sm">Level</th>
                <th className="text-left p-4 font-medium text-sm">Stats</th>
                <th className="text-left p-4 font-medium text-sm">Role</th>
                <th className="text-left p-4 font-medium text-sm">Status</th>
                <th className="text-left p-4 font-medium text-sm">Joined</th>
                <th className="text-right p-4 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Lv. {user.level}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {user.xp.toLocaleString()} XP
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {user.stats.places}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {user.stats.reviews}
                      </span>
                      <span className="flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        {user.stats.photos}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    {user.role === "admin" ? (
                      <Badge className="bg-purple-500/20 text-purple-400">Admin</Badge>
                    ) : (
                      <Badge variant="secondary">User</Badge>
                    )}
                  </td>
                  <td className="p-4">
                    {user.status === "active" ? (
                      <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400">Banned</Badge>
                    )}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{user.joinedAt}</td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}/view`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        {user.role === "user" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              handleAction("makeAdmin", user.id, user.name)
                            }
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              handleAction("removeAdmin", user.id, user.name)
                            }
                          >
                            <ShieldOff className="h-4 w-4 mr-2" />
                            Remove Admin
                          </DropdownMenuItem>
                        )}
                        {user.status === "active" ? (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleAction("ban", user.id, user.name)}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Ban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleAction("unban", user.id, user.name)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Unban User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
