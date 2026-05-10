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
  Trash2,
  Flag,
  CheckCircle,
  Star,
  MessageSquare,
  Loader2,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

interface ReviewData {
  id: number;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  userId: number;
  userName: string;
  userEmail: string;
  placeId: number;
  placeName: string;
}

export default function AdminReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filterStatus !== "all") params.set("status", filterStatus);

      const res = await fetch(`/api/reviews?${params}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
    setIsLoading(false);
  }, [filterStatus]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.placeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.comment || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAction = async (action: string, reviewId: number) => {
    if (action === "delete") {
      if (!confirm("Delete this review permanently?")) return;
      try {
        const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
        if (res.ok) {
          setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        } else {
          alert("Failed to delete review");
        }
      } catch {
        alert("Error deleting review");
      }
    } else if (action === "approve" || action === "rejected") {
      const label = action === "approve" ? "Approve" : "Reject";
      if (!confirm(`${label} this review?`)) return;
      try {
        const status = action === "approve" ? "approved" : "rejected";
        const res = await fetch(`/api/reviews/${reviewId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: status }),
        });
        if (res.ok) {
          setReviews((prev) =>
            prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
          );
        } else {
          alert(`Failed to ${label.toLowerCase()} review`);
        }
      } catch {
        alert("Error updating review");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const statusCounts = {
    total: reviews.length,
    approved: reviews.filter((r) => r.status === "approved").length,
    pending: reviews.filter((r) => r.status === "pending").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={serifFont}>Manage Reviews</h1>
        <p className="text-muted-foreground">
          Moderate and manage user reviews on the platform.
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold">{statusCounts.total}</p>
          <p className="text-sm text-muted-foreground">Total Reviews</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold text-green-400">{statusCounts.approved}</p>
          <p className="text-sm text-muted-foreground">Approved</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold text-yellow-400">{statusCounts.pending}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold text-red-400">{statusCounts.rejected}</p>
          <p className="text-sm text-muted-foreground">Rejected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reviews..."
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
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading reviews...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Content */}
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{review.userName}</span>
                        <span className="text-xs text-muted-foreground">({review.userEmail})</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        reviewed <span className="text-foreground">{review.placeName}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(review.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {review.status !== "approved" && (
                            <DropdownMenuItem onClick={() => handleAction("approve", review.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {review.status !== "rejected" && (
                            <DropdownMenuItem onClick={() => handleAction("rejected", review.id)}>
                              <Flag className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleAction("delete", review.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-sm">{review.comment || "No comment"}</p>

                  {/* Date */}
                  <p className="text-xs text-muted-foreground mt-3">
                    Posted on {new Date(review.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reviews found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
