"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  Users,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

interface UserData {
  id: number;
  name: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  role: string;
  isBanned: boolean;
  placesVisited: number;
  reviewsWritten: number;
  badgeCount: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to load users", err);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && !user.isBanned) ||
      (filterStatus === "banned" && user.isBanned);
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleAction = async (action: string, userId: number, userName: string) => {
    const messages: Record<string, string> = {
      ban: `Ban user "${userName}"?`,
      unban: `Unban user "${userName}"?`,
      makeAdmin: `Make "${userName}" an admin?`,
      removeAdmin: `Remove admin role from "${userName}"?`,
    };

    if (!confirm(messages[action])) return;

    try {
      const bodyMap: Record<string, object> = {
        ban: { status: "banned" },
        unban: { status: "active" },
        makeAdmin: { role: "admin" },
        removeAdmin: { role: "user" },
      };

      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyMap[action]),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id !== userId) return u;
            if (action === "ban") return { ...u, isBanned: true };
            if (action === "unban") return { ...u, isBanned: false };
            if (action === "makeAdmin") return { ...u, role: "admin" };
            if (action === "removeAdmin") return { ...u, role: "user" };
            return u;
          })
        );
      } else {
        alert("Action failed");
      }
    } catch {
      alert("Error performing action");
    }
  };

  const statusCounts = {
    total: users.length,
    active: users.filter((u) => !u.isBanned).length,
    admins: users.filter((u) => u.role === "admin").length,
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
          <p className="text-2xl font-bold">{statusCounts.total}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold">{statusCounts.active}</p>
          <p className="text-sm text-muted-foreground">Active Users</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold">{statusCounts.admins}</p>
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading users...</span>
        </div>
      ) : (
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
                          src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"}
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
                          {user.xp?.toLocaleString()} XP
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {user.placesVisited || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {user.reviewsWritten || 0}
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
                      {!user.isBanned ? (
                        <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400">Banned</Badge>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.role === "user" ? (
                            <DropdownMenuItem
                              onClick={() => handleAction("makeAdmin", user.id, user.name)}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleAction("removeAdmin", user.id, user.name)}
                            >
                              <ShieldOff className="h-4 w-4 mr-2" />
                              Remove Admin
                            </DropdownMenuItem>
                          )}
                          {!user.isBanned ? (
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
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No users found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
