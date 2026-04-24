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
  Trash2,
  Flag,
  CheckCircle,
  Star,
  MessageSquare,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

// Dummy reviews data
const reviewsData = [
  {
    id: "1",
    user: {
      name: "Aria Kurniawan",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
      level: 12,
    },
    place: {
      name: "Tumpak Sewu Waterfall",
      image: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=200&q=80",
    },
    rating: 5,
    comment:
      "The descent is steep but every step is worth it. Standing at the base feels like being in another world!",
    status: "approved",
    createdAt: "2024-03-15",
  },
  {
    id: "2",
    user: {
      name: "Maya Explorer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      level: 23,
    },
    place: {
      name: "Kawah Ijen",
      image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=200&q=80",
    },
    rating: 5,
    comment: "The blue fire is absolutely incredible! A once-in-a-lifetime experience.",
    status: "approved",
    createdAt: "2024-03-14",
  },
  {
    id: "3",
    user: {
      name: "Budi Traveler",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      level: 8,
    },
    place: {
      name: "Rawon Nguling",
      image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=200&q=80",
    },
    rating: 4,
    comment: "Best rawon in Surabaya! The black soup is rich and flavorful.",
    status: "pending",
    createdAt: "2024-03-13",
  },
  {
    id: "4",
    user: {
      name: "Spam Account",
      avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80",
      level: 1,
    },
    place: {
      name: "Toko Oen",
      image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80",
    },
    rating: 1,
    comment: "SPAM CONTENT - Buy cheap products at www.spam-link.com!!!",
    status: "flagged",
    createdAt: "2024-03-12",
  },
  {
    id: "5",
    user: {
      name: "Sari Foodie",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      level: 15,
    },
    place: {
      name: "Bakso President",
      image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=200&q=80",
    },
    rating: 5,
    comment: "The jumbo meatballs are amazing! Definitely worth the visit.",
    status: "approved",
    createdAt: "2024-03-11",
  },
];

export default function AdminReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredReviews = reviewsData.filter((review) => {
    const matchesSearch =
      review.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || review.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (action: string, reviewId: string) => {
    const messages: Record<string, string> = {
      approve: "Approve this review?",
      flag: "Flag this review for moderation?",
      delete: "Delete this review permanently?",
    };

    if (confirm(messages[action])) {
      alert(`Action "${action}" performed on review ${reviewId} (This is a demo)`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>;
      case "flagged":
        return <Badge className="bg-red-500/20 text-red-400">Flagged</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
          <p className="text-2xl font-bold">{reviewsData.length}</p>
          <p className="text-sm text-muted-foreground">Total Reviews</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold text-green-400">
            {reviewsData.filter((r) => r.status === "approved").length}
          </p>
          <p className="text-sm text-muted-foreground">Approved</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold text-yellow-400">
            {reviewsData.filter((r) => r.status === "pending").length}
          </p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-2xl font-bold text-red-400">
            {reviewsData.filter((r) => r.status === "flagged").length}
          </p>
          <p className="text-sm text-muted-foreground">Flagged</p>
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
            <option value="flagged">Flagged</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Place Image */}
              <img
                src={review.place.image}
                alt={review.place.name}
                className="w-full md:w-24 h-32 md:h-24 rounded-lg object-cover"
              />

              {/* Content */}
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={review.user.avatar}
                        alt={review.user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-medium text-sm">{review.user.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Lv. {review.user.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      reviewed <span className="text-foreground">{review.place.name}</span>
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
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/reviews/${review.id}/view`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {review.status !== "approved" && (
                          <DropdownMenuItem
                            onClick={() => handleAction("approve", review.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {review.status !== "flagged" && (
                          <DropdownMenuItem
                            onClick={() => handleAction("flag", review.id)}
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            Flag
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
                <p className="text-sm">{review.comment}</p>

                {/* Date */}
                <p className="text-xs text-muted-foreground mt-3">
                  Posted on {review.createdAt}
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
    </div>
  );
}
