"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Star,
  Mountain,
  Utensils,
  ExternalLink,
  RefreshCw,
  Instagram,
  Globe,
  Play,
  Facebook,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

export default function ViewPlacePage() {
  const params = useParams();
  const router = useRouter();
  const [place, setPlace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/places/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setPlace(d.place || null);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${place?.name}"?`)) return;
    const res = await fetch(`/api/places/${place.id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Place deleted!");
      router.push("/admin/places");
    } else {
      alert("Failed to delete");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Place Not Found</h1>
        <Button asChild>
          <Link href="/admin/places">Back to Places</Link>
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
            <Link href="/admin/places">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold" style={serifFont}>
              {place.name}
            </h1>
            <p className="text-muted-foreground">View place details</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href={`/destination/${place.slug}`} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Public Page
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/places/${place.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <img
              src={place.image}
              alt={place.name}
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>

          {/* Description */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Description</h2>
            <p className="text-muted-foreground">{place.description}</p>
          </div>

          {/* Location */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Location</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">City</label>
                <p className="font-medium">{place.cityName}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Address</label>
                <p className="font-medium">
                  {place.address || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Media & Social */}
          {(place.videoUrl || place.instagramUrl || place.tiktokUrl || place.facebookUrl || place.websiteUrl) && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold mb-4">Media & Social</h2>
              <div className="space-y-4">
                {place.videoUrl && (
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1"><Play className="h-3 w-3" /> Video</label>
                    <a href={place.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                      {place.videoUrl}
                    </a>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  {place.instagramUrl && (
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1"><Instagram className="h-3 w-3" /> Instagram</label>
                      <a href={place.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{place.instagramUrl}</a>
                    </div>
                  )}
                  {place.tiktokUrl && (
                    <div>
                      <label className="text-sm text-muted-foreground">TikTok</label>
                      <a href={place.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{place.tiktokUrl}</a>
                    </div>
                  )}
                  {place.facebookUrl && (
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1"><Facebook className="h-3 w-3" /> Facebook</label>
                      <a href={place.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{place.facebookUrl}</a>
                    </div>
                  )}
                  {place.websiteUrl && (
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> Website</label>
                      <a href={place.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{place.websiteUrl}</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <Badge variant="outline" className="gap-1">
                  {place.category === "kuliner" ? (
                    <Utensils className="h-3 w-3" />
                  ) : (
                    <Mountain className="h-3 w-3" />
                  )}
                  {place.category === "kuliner" ? "Culinary" : "Tourism"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {place.isMustVisit ? (
                  <Badge className="bg-primary/20 text-primary">Must Visit</Badge>
                ) : (
                  <Badge variant="secondary">Regular</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{place.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Reviews</span>
                <span className="font-medium">{place.reviewCount}</span>
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Metadata</h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-muted-foreground">ID</label>
                <p className="font-mono text-xs bg-secondary p-2 rounded mt-1">
                  {place.id}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground">Slug</label>
                <p className="font-mono text-xs bg-secondary p-2 rounded mt-1">
                  {place.slug}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
