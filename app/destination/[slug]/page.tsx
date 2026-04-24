"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { places, reviews as reviewsData } from "@/lib/data";
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
  User,
  ExternalLink,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

export default function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const place = places.find((p) => p.slug === slug);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  if (!place) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar isLoggedIn={true} />
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

  const images = place.gallery || [place.image];
  const placeReviews = reviewsData.filter((r) => r.placeId === place.id);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would submit to backend
    alert("Review submitted! (This is a demo)");
    setNewReview("");
    setNewRating(0);
  };

  // Related places
  const relatedPlaces = places
    .filter((p) => p.cityId === place.cityId && p.id !== place.id)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-background">
      <Navbar isLoggedIn={true} />

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

          {/* Must Visit Badge */}
          {place.isMustVisit && (
            <Badge className="absolute top-20 left-4 bg-primary text-primary-foreground">
              Must Visit
            </Badge>
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
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={isVisited ? "default" : "outline"}
                    onClick={() => setIsVisited(!isVisited)}
                    className="gap-2"
                  >
                    <CheckCircle className={`h-4 w-4 ${isVisited ? "fill-current" : ""}`} />
                    {isVisited ? "Visited" : "Mark Visited"}
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
                  {place.reviewCount.toLocaleString()} reviews
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
              {place.tags && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {place.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Explorer Reviews</h2>
                <Link href="#" className="text-primary text-sm hover:underline">
                  View All
                </Link>
              </div>

              {/* Review List */}
              <div className="space-y-6">
                {placeReviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6 last:border-0">
                    <div className="flex items-start gap-3">
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{review.userName}</span>
                          <Badge variant="outline" className="text-xs">
                            Lv. {review.userLevel}
                          </Badge>
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
                            {review.createdAt}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                        {review.photos && review.photos.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {review.photos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo}
                                alt="Review photo"
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Write Review */}
              <div className="mt-6 pt-6 border-t border-border">
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
                    <Button type="button" variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Add Photos
                    </Button>
                    <Button type="submit" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Review
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location & Map */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Location</h3>
              {/* Map Placeholder */}
              <div className="aspect-square bg-secondary rounded-xl overflow-hidden mb-4 relative">
                <div className="w-full h-full bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/112.75,-7.25,8,0/400x400?access_token=pk.placeholder')] bg-cover bg-center flex items-center justify-center">
                  <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 text-center">
                    <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">View on Map</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{place.address}</p>
              <Button className="w-full" asChild>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    place.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </a>
              </Button>
            </div>

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
