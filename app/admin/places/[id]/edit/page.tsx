"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { places, cities } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Upload,
  X,
  MapPin,
  Star,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

export default function EditPlacePage() {
  const params = useParams();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category: "wisata",
    cityId: "",
    image: "",
    rating: 0,
    reviewCount: 0,
    isMustVisit: false,
    coordinates: { lat: 0, lng: 0 },
  });

  useEffect(() => {
    // Find the place by ID
    const place = places.find((p) => p.id === params.id);
    if (place) {
      setFormData({
        name: place.name,
        slug: place.slug,
        description: place.description,
        category: place.category,
        cityId: place.cityId,
        image: place.image,
        rating: place.rating,
        reviewCount: place.reviewCount,
        isMustVisit: place.isMustVisit,
        coordinates: place.coordinates,
      });
    }
    setIsLoading(false);
  }, [params.id]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert("Place updated successfully! (This is a demo - backend integration needed)");
    router.push("/admin/places");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
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
            <h1 className="text-2xl font-bold" style={serifFont}>Edit Place</h1>
            <p className="text-muted-foreground">Update place information</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/places">Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Place Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter place name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Slug</label>
                <Input
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="place-url-slug"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter place description"
                  rows={5}
                />
              </div>
            </div>
          </div>

          {/* Category & Location */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Category & Location</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="wisata">Tourism</option>
                  <option value="kuliner">Culinary</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">City</label>
                <select
                  name="cityId"
                  value={formData.cityId}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={formData.coordinates.lat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coordinates: {
                        ...formData.coordinates,
                        lat: parseFloat(e.target.value),
                      },
                    })
                  }
                  placeholder="-7.1234"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={formData.coordinates.lng}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coordinates: {
                        ...formData.coordinates,
                        lng: parseFloat(e.target.value),
                      },
                    })
                  }
                  placeholder="112.7890"
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Image</h2>
            <div>
              <label className="text-sm font-medium mb-2 block">Image URL</label>
              <Input
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <div className="mt-4 relative">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Status</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Must Visit</p>
                <p className="text-sm text-muted-foreground">
                  Mark as a must-visit destination
                </p>
              </div>
              <Switch
                checked={formData.isMustVisit}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isMustVisit: checked })
                }
              />
            </div>
          </div>

          {/* Stats (Read-only) */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Statistics</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{formData.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reviews</span>
                <span className="font-medium">{formData.reviewCount}</span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">Preview</h2>
            <div className="bg-secondary rounded-lg overflow-hidden">
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {formData.isMustVisit && (
                    <Badge className="bg-primary/90 text-primary-foreground text-xs">
                      Must Visit
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold">{formData.name || "Place Name"}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {formData.description || "Place description..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
