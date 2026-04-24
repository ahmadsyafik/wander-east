"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trash2,
  Flag,
  CheckCircle,
  Star,
  Calendar,
  MapPin,
  User,
  RefreshCw,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

// Dummy reviews data
const reviewsData = [
  {
    id: "1",
    user: {
      id: "u1",
      name: "Aria Kurniawan",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
      level: 12,
      email: "aria@example.com",
    },
    place: {
      id: "p1",
      name: "Tumpak Sewu Waterfall",
      image: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=400&q=80",
      slug: "tumpak-sewu-waterfall",
    },
    rating: 5,
    comment:
      "The descent is steep but every step is worth it. Standing at the base feels like being in another world! The view is absolutely breathtaking and the mist from the waterfall creates a magical atmosphere. Highly recommend visiting early morning for the best experience.",
    status: "approved",
    createdAt: "2024-03-15",
    photos: [
      "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=400&q=80",
    ],
  },
  {
    id: "2",
    user: {
      id: "u2",
      name: "Maya Explorer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      level: 23,
      email: "maya@example.com",
    },
    place: {
      id: "p2",
      name: "Kawah Ijen",
      image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&q=80",
      slug: "kawah-ijen",
    },
    rating: 5,
    comment: "The blue fire is absolutely incredible! A once-in-a-lifetime experience.",
    status: "approved",
    createdAt: "2024-03-14",
    photos: [],
  },
];

export default function ViewReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [review, setReview] = useState<(typeof reviewsData)[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundReview = reviewsData.find((r) => r.id === params.id);
    setReview(foundReview || null);
    setIsLoading(false);
  }, [params.id]);

  const handleAction = (action: string) => {
    const messages: Record<string, string> = {
      approve: "Approve this review?",
      flag: "Flag this review for moderation?",
      delete: "Delete this review permanently?",
    };

    if (confirm(messages[action])) {
      alert(`Action "${action}" performed! (This is a demo - backend integration needed)`);
      if (action === "delete") {
        router.push("/admin/reviews");
      }
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

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Review Not Found</h1>
        <Button asChild>
          <Link href="/admin/reviews">Back to Reviews</Link>
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
            <Link href="/admin/reviews">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold" style={serifFont}>
              Review Details
            </h1>
            <p className="text-muted-foreground">View and moderate review</p>
          </div>
        </div>
        <div className="flex gap-3">
          {review.status !== "approved" && (
            <Button onClick={() => handleAction("approve")}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
          {review.status !== "flagged" && (
            <Button variant="outline" onClick={() => handleAction("flag")}>
              <Flag className="h-4 w-4 mr-2" />
              Flag
            </Button>
          )}
          <Button variant="destructive" onClick={() => handleAction("delete")}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Content */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Review Content</h2>
              {getStatusBadge(review.status)}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < review.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted"
                  }`}
                />
              ))}
              <span className="ml-2 font-medium">{review.rating}/5</span>
            </div>

            {/* Comment */}
            <p className="text-foreground leading-relaxed">{review.comment}</p>

            {/* Date */}
            <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Posted on {review.createdAt}</span>
            </div>
          </div>

          {/* Photos */}
          {review.photos.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold mb-4">Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {review.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Card */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Reviewer</h2>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={review.user.avatar}
                alt={review.user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{review.user.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Lv. {review.user.level}
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{review.user.email}</p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`/admin/users/${review.user.id}/view`}>
                <User className="h-4 w-4 mr-2" />
                View User Profile
              </Link>
            </Button>
          </div>

          {/* Place Card */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Place Reviewed</h2>
            <div className="rounded-lg overflow-hidden mb-4">
              <img
                src={review.place.image}
                alt={review.place.name}
                className="w-full h-32 object-cover"
              />
            </div>
            <p className="font-medium mb-4">{review.place.name}</p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`/admin/places/${review.place.id}/view`}>
                <MapPin className="h-4 w-4 mr-2" />
                View Place Details
              </Link>
            </Button>
          </div>

          {/* Metadata */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Metadata</h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-muted-foreground">Review ID</label>
                <p className="font-mono text-xs bg-secondary p-2 rounded mt-1">
                  {review.id}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground">User ID</label>
                <p className="font-mono text-xs bg-secondary p-2 rounded mt-1">
                  {review.user.id}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground">Place ID</label>
                <p className="font-mono text-xs bg-secondary p-2 rounded mt-1">
                  {review.place.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
