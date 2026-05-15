"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Timer,
  Mountain,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  CheckCircle,
  Camera,
  Send,
  ExternalLink,
  Loader2,
  Instagram,
  Globe,
  Play,
  LocateFixed,
  Facebook,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

interface PlaceDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  category: string;
  cityName: string;
  image: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  address: string;
  coordinates: { lat: number; lng: number } | null;
  operationalHours: string;
  priceRange: string;
  estimatedDuration: string;
  difficulty: string;
  isMustVisit: boolean;
  googlePlaceId: string;
  videoUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  websiteUrl: string;
  tags: string[];
  reviews: Review[];
}

interface Review {
  id: number | string;
  rating: number;
  comment: string;
  createdAt: string;
  userId?: number;
  userName: string;
  userAvatar: string;
  userLevel: number;
  source?: 'google' | 'explorer';
  relativeTime?: string;
  photos?: string[];
}

export default function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [relatedPlaces, setRelatedPlaces] = useState<PlaceDetail[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);

  useEffect(() => {
    async function fetchPlace() {
      try {
        const res = await fetch(`/api/places/${slug}`);
        if (!res.ok) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        setPlace(data.place);

        // Mark explorer reviews
        const explorerReviews: Review[] = (data.place?.reviews || []).map((r: Review) => ({
          ...r, source: 'explorer' as const,
        }));

        // Fetch Google reviews and merge
        try {
          const gRes = await fetch(`/api/places/${data.place.id}/google-reviews`);
          const gData = await gRes.json();
          const googleReviews: Review[] = (gData.reviews || []).map((r: Review) => ({
            ...r, source: 'google' as const,
          }));
          setAllReviews([...explorerReviews, ...googleReviews]);
        } catch {
          setAllReviews(explorerReviews);
        }

        // Fetch related places from same city
        if (data.place?.cityName) {
          const relRes = await fetch(`/api/places?city=${data.place.cityName.toLowerCase()}&limit=3`);
          const relData = await relRes.json();
          setRelatedPlaces(
            (relData.places || []).filter((p: PlaceDetail) => p.id !== data.place.id).slice(0, 3)
          );
        }

        // Check if user has favorited this place
        try {
          const favRes = await fetch('/api/favorites');
          if (favRes.ok) {
            const favData = await favRes.json();
            const isFav = (favData.favorites || []).some(
              (f: { id: number }) => f.id === data.place.id
            );
            setIsFavorite(isFav);
          }
        } catch {
          // Not logged in or error — ignore
        }

        // Check if user has visited this place
        try {
          const visitRes = await fetch('/api/auth/me');
          if (visitRes.ok) {
            // User is logged in — we can check visits via the checkin API later
          }
        } catch {
          // Not logged in
        }
      } catch {
        setNotFound(true);
      }
      setIsLoading(false);
    }
    fetchPlace();
  }, [slug]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32 pb-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading destination...</span>
        </div>
        <Footer />
      </main>
    );
  }

  if (notFound || !place) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Destination not found</h1>
          <Button asChild>
            <Link href="/explore">Back to Explore</Link>
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  const images = place.gallery?.length > 0 ? place.gallery : [place.image];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleCheckin = async () => {
    setIsCheckingIn(true);
    try {
      // Get user GPS location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('GPS tidak tersedia di browser Anda'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, (err) => {
          if (err.code === 1) reject(new Error('Izin lokasi ditolak. Aktifkan GPS untuk check-in.'));
          else if (err.code === 2) reject(new Error('Lokasi tidak tersedia. Coba lagi.'));
          else reject(new Error('Timeout mendapatkan lokasi. Coba lagi.'));
        }, { enableHighAccuracy: true, timeout: 10000 });
      });

      const res = await fetch("/api/gamification/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: place.id,
          userLat: position.coords.latitude,
          userLng: position.coords.longitude,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsVisited(true);
        alert(data.message || "Check-in berhasil! +50 XP 🎉");
      } else {
        alert(data.error || "Check-in gagal");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Silakan login untuk check-in");
    }
    setIsCheckingIn(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRating) {
      alert("Please select a rating");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/places/${place.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: newRating, comment: newReview }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Review submitted! +100 XP");
        setNewReview("");
        setNewRating(0);
        // Refresh the page to show new review
        window.location.reload();
      } else {
        alert(data.error || "Failed to submit review");
      }
    } catch {
      alert("Please login to write a review");
    }
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Image Gallery */}
      <section className="pt-16 relative">
        <div className="relative h-[50vh] md:h-[60vh]">
          <img
            src={images[currentImageIndex]}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/50 backdrop-blur-sm rounded-full"
                onClick={prevImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/50 backdrop-blur-sm rounded-full"
                onClick={nextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              {/* Image Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-primary w-6"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 -mt-20 relative z-10 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  {place.isMustVisit && (
                    <Badge className="mb-3 bg-primary text-primary-foreground uppercase tracking-wider text-[10px] px-2 py-0.5 border-none">
                      Must Visit
                    </Badge>
                  )}
                  <h1 className="text-3xl md:text-4xl font-bold mb-2" style={serifFont}>{place.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{place.cityName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isFavorite ? "default" : "outline"}
                    size="icon"
                    onClick={async () => {
                      if (!place) return;
                      try {
                        const res = await fetch('/api/favorites', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ placeId: place.id }),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setIsFavorite(data.isFavorite);
                        } else {
                          alert('Login terlebih dahulu untuk menyimpan tempat favorit');
                        }
                      } catch {
                        alert('Gagal menyimpan favorit');
                      }
                    }}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: place?.name || 'Wander East',
                          text: `Yuk kunjungi ${place?.name} di Wander East!`,
                          url: window.location.href,
                        }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link berhasil disalin!');
                      }
                    }}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={isVisited ? "default" : "outline"}
                    onClick={handleCheckin}
                    className="gap-2"
                    disabled={isVisited || isCheckingIn}
                  >
                    {isCheckingIn ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /><LocateFixed className="h-4 w-4" /> Mencari lokasi...</>
                    ) : isVisited ? (
                      <><CheckCircle className="h-4 w-4 fill-current" /> Visited ✓</>
                    ) : (
                      <><CheckCircle className="h-4 w-4" /> Check In (+50 XP)</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(place.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{place.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  {place.reviewCount?.toLocaleString()} reviews
                </span>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {place.operationalHours && (
                  <div className="bg-secondary rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs uppercase">Hours</span>
                    </div>
                    <p className="font-medium text-sm">{place.operationalHours}</p>
                  </div>
                )}
                {place.priceRange && (
                  <div className="bg-secondary rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs uppercase">Price</span>
                    </div>
                    <p className="font-medium text-sm">{place.priceRange}</p>
                  </div>
                )}
                {place.estimatedDuration && (
                  <div className="bg-secondary rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Timer className="h-4 w-4" />
                      <span className="text-xs uppercase">Duration</span>
                    </div>
                    <p className="font-medium text-sm">{place.estimatedDuration}</p>
                  </div>
                )}
                {place.difficulty && (
                  <div className="bg-secondary rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Mountain className="h-4 w-4" />
                      <span className="text-xs uppercase">Difficulty</span>
                    </div>
                    <p className="font-medium text-sm">{place.difficulty}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">About This Place</h2>
              <p className="text-muted-foreground leading-relaxed">
                {place.longDescription || place.description}
              </p>
              {place.tags && place.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {place.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Video Embed */}
            {place.videoUrl && (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Video
                </h2>
                {place.videoUrl.includes('youtube.com') || place.videoUrl.includes('youtu.be') ? (
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${place.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^?&]+)/)?.[1] || ''}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`Video ${place.name}`}
                    />
                  </div>
                ) : place.videoUrl.includes('tiktok.com') ? (
                  <div className="flex flex-col items-center gap-3">
                    <a
                      href={place.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-secondary rounded-xl p-4 hover:bg-secondary/80 transition-colors w-full"
                    >
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                        <span className="text-white text-lg">♪</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Watch on TikTok</p>
                        <p className="text-xs text-muted-foreground truncate">{place.videoUrl}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  </div>
                ) : (
                  <a
                    href={place.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Watch Video
                  </a>
                )}
              </div>
            )}

            {/* Reviews (Merged Google + Explorer) */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Reviews</h2>
                <span className="text-sm text-muted-foreground">{allReviews.length} reviews</span>
              </div>

              {/* Review List */}
              <div className="space-y-6">
                {allReviews.length > 0 ? (
                  allReviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6 last:border-0">
                      <div className="flex items-start gap-3">
                        <img
                          src={review.userAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"}
                          alt={review.userName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium">{review.userName}</span>
                            {review.source === 'google' ? (
                              <Badge className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0">Google</Badge>
                            ) : (
                              <Badge className="bg-primary/20 text-primary text-[10px] px-1.5 py-0">Explorer</Badge>
                            )}
                            {review.source !== 'google' && review.userLevel > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Lv. {review.userLevel}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {review.relativeTime || new Date(review.createdAt).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                          {review.photos && review.photos.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {review.photos.map((photo, i) => (
                                <img
                                  key={i}
                                  src={photo}
                                  alt={`Review photo ${i + 1}`}
                                  className="w-20 h-20 rounded-lg object-cover border border-border"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </div>

              {/* Write Review — Only if checked in */}
              <div className="mt-6 pt-6 border-t border-border">
                {isVisited ? (
                  <>
                    <h3 className="font-semibold mb-4">Write a Review</h3>
                    <form onSubmit={handleSubmitReview}>
                      <div className="mb-4">
                        <label className="block text-sm text-muted-foreground mb-2">
                          Your Rating
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                            >
                              <Star
                                className={`h-6 w-6 cursor-pointer transition-colors ${
                                  star <= (hoverRating || newRating)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-muted"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <Textarea
                        placeholder="Share your experience..."
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        className="mb-4"
                        rows={4}
                      />
                      <div className="flex items-center gap-2">
                        <Button type="submit" size="sm" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Submit Review
                        </Button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Kamu harus <strong>Check In</strong> terlebih dahulu untuk menulis review.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location & Map */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Location</h3>
              {/* Embedded Google Map */}
              <div className="aspect-square bg-secondary rounded-xl overflow-hidden mb-4 relative">
                {place.coordinates ? (
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${place.coordinates.lat},${place.coordinates.lng}&zoom=15&maptype=roadmap`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map ${place.name}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Koordinat belum tersedia</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{place.address}</p>
              <Button className="w-full" asChild>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    place.address || place.name
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </a>
              </Button>
            </div>

            {/* Social Media Links */}
            {(place.instagramUrl || place.tiktokUrl || place.facebookUrl || place.websiteUrl) && (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold mb-4">Social Media</h3>
                <div className="space-y-3">
                  {place.instagramUrl && (
                    <a href={place.instagramUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                      <Instagram className="h-5 w-5 text-pink-400" />
                      <span className="text-sm font-medium">Instagram</span>
                      <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                    </a>
                  )}
                  {place.tiktokUrl && (
                    <a href={place.tiktokUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                      <span className="text-lg">♪</span>
                      <span className="text-sm font-medium">TikTok</span>
                      <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                    </a>
                  )}
                  {place.facebookUrl && (
                    <a href={place.facebookUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                      <Facebook className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">Facebook</span>
                      <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                    </a>
                  )}
                  {place.websiteUrl && (
                    <a href={place.websiteUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                      <Globe className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Website</span>
                      <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Nearby Hidden Gems */}
            {relatedPlaces.length > 0 && (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold mb-4">Nearby Hidden Gems</h3>
                <div className="space-y-4">
                  {relatedPlaces.map((relPlace) => (
                    <Link
                      key={relPlace.id}
                      href={`/destination/${relPlace.slug}`}
                      className="flex items-center gap-3 group"
                    >
                      <img
                        src={relPlace.image}
                        alt={relPlace.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                          {relPlace.name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span>{relPlace.rating}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
