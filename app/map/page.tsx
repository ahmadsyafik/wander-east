"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Utensils, Mountain, X, Loader2 } from "lucide-react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

interface PlaceData {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  cityId: string;
  cityName: string;
  image: string;
  rating: number;
  reviewCount: number;
  coordinates?: { lat: number; lng: number } | null;
  isMustVisit?: boolean;
}

interface CityData {
  id: string;
  name: string;
  slug: string;
  latitude?: number;
  longitude?: number;
}

// East Java center coordinates
const EAST_JAVA_CENTER = { lat: -7.8, lng: 113.2 };

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#373737" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [{ color: "#4e4e4e" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d3d3d" }],
  },
];

export default function MapPage() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [cities, setCities] = useState<CityData[]>([]);
  const [mapCenter, setMapCenter] = useState(EAST_JAVA_CENTER);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    fetch("/api/cities")
      .then((r) => r.json())
      .then((d) => setCities(d.cities || []));
    fetch("/api/places?limit=200")
      .then((r) => r.json())
      .then((d) => setPlaces(d.places || []));
  }, []);

  const filteredPlaces = useMemo(
    () =>
      places.filter((place) => {
        const matchesCity = !selectedCity || place.cityId === selectedCity;
        const matchesCategory =
          selectedCategory === "all" || place.category === selectedCategory;
        const hasCoords = place.coordinates?.lat && place.coordinates?.lng;
        return matchesCity && matchesCategory && hasCoords;
      }),
    [places, selectedCity, selectedCategory]
  );

  const currentPlace = places.find((p) => p.id === selectedPlace);

  const handleCityChange = useCallback(
    (cityId: string | null) => {
      setSelectedCity(cityId);
      if (cityId) {
        const city = cities.find((c) => String(c.id) === cityId);
        if (city?.latitude && city?.longitude) {
          setMapCenter({ lat: city.latitude, lng: city.longitude });
        }
      } else {
        setMapCenter(EAST_JAVA_CENTER);
      }
    },
    [cities]
  );

  const mapOptions = useMemo(
    () => ({
      styles: darkMapStyle,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    }),
    []
  );

  // Custom marker icon URLs using SVG data URIs
  const wisataIcon = useMemo(
    () =>
      isLoaded
        ? {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 44 54"><defs><filter id="s" x="-10%" y="-10%" width="130%" height="130%"><feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-opacity="0.3"/></filter></defs><path d="M22 0C10.6 0 1.5 9.1 1.5 20.5c0 15.5 18 30.5 19.1 31.4.3.3.6.4.9.4.3 0 .6-.1.9-.4 1.1-.9 19.1-15.9 19.1-31.4C42.5 9.1 33.4 0 22 0z" fill="%2310b981" filter="url(%23s)"/><circle cx="22" cy="20.5" r="15" fill="white"/><text x="22" y="27" font-size="18" text-anchor="middle" font-family="Arial">⛰️</text></svg>'
            )}`,
            scaledSize: new google.maps.Size(44, 54),
            anchor: new google.maps.Point(22, 54),
          }
        : undefined,
    [isLoaded]
  );

  const kulinerIcon = useMemo(
    () =>
      isLoaded
        ? {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 44 54"><defs><filter id="s" x="-10%" y="-10%" width="130%" height="130%"><feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-opacity="0.3"/></filter></defs><path d="M22 0C10.6 0 1.5 9.1 1.5 20.5c0 15.5 18 30.5 19.1 31.4.3.3.6.4.9.4.3 0 .6-.1.9-.4 1.1-.9 19.1-15.9 19.1-31.4C42.5 9.1 33.4 0 22 0z" fill="%23f59e0b" filter="url(%23s)"/><circle cx="22" cy="20.5" r="15" fill="white"/><text x="22" y="27" font-size="18" text-anchor="middle" font-family="Arial">🍜</text></svg>'
            )}`,
            scaledSize: new google.maps.Size(44, 54),
            anchor: new google.maps.Point(22, 54),
          }
        : undefined,
    [isLoaded]
  );

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16 flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 bg-card border-r border-border p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4" style={serifFont}>
            Explore Map
          </h2>

          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Category
              </label>
              <div className="flex gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  All
                </Button>
                <Button
                  variant={selectedCategory === "wisata" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("wisata")}
                >
                  <Mountain className="h-4 w-4 mr-1" />
                  Tourism
                </Button>
                <Button
                  variant={
                    selectedCategory === "kuliner" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory("kuliner")}
                >
                  <Utensils className="h-4 w-4 mr-1" />
                  Food
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                City
              </label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={selectedCity || ""}
                onChange={(e) => handleCityChange(e.target.value || null)}
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Places List */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {filteredPlaces.length} places found
            </p>
            {filteredPlaces.slice(0, 20).map((place) => (
              <button
                key={place.id}
                onClick={() => {
                  setSelectedPlace(place.id);
                  setActiveMarker(place.id);
                  if (place.coordinates) {
                    setMapCenter({
                      lat: place.coordinates.lat,
                      lng: place.coordinates.lng,
                    });
                  }
                }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedPlace === place.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex gap-3">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{place.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {place.cityName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs">{place.rating}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {place.category === "kuliner" ? "🍜" : "⛰️"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Map Area */}
        <div className="flex-1 relative">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={selectedCity ? 11 : 8}
              options={mapOptions}
            >
              {/* Place Markers */}
              {filteredPlaces.map((place) => {
                if (!place.coordinates) return null;
                return (
                  <MarkerF
                    key={place.id}
                    position={{
                      lat: place.coordinates.lat,
                      lng: place.coordinates.lng,
                    }}
                    icon={
                      place.category === "kuliner"
                        ? kulinerIcon
                        : wisataIcon
                    }
                    onClick={() => {
                      setActiveMarker(place.id);
                      setSelectedPlace(place.id);
                    }}
                  >
                    {activeMarker === place.id && (
                      <InfoWindowF
                        onCloseClick={() => setActiveMarker(null)}
                      >
                        <div className="p-1 min-w-[200px] max-w-[260px]">
                          <img
                            src={place.image}
                            alt={place.name}
                            className="w-full h-24 object-cover rounded mb-2"
                          />
                          <p className="font-bold text-sm text-gray-900">
                            {place.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {place.cityName}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-gray-800">
                              {place.rating}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              ({place.reviewCount} reviews)
                            </span>
                          </div>
                          <Link href={`/destination/${place.slug}`}>
                            <button className="mt-2 w-full bg-emerald-600 text-white text-xs py-1.5 px-3 rounded-md hover:bg-emerald-700 transition-colors">
                              View Details
                            </button>
                          </Link>
                        </div>
                      </InfoWindowF>
                    )}
                  </MarkerF>
                );
              })}
            </GoogleMap>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-card">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}

          {/* Selected Place Info Card */}
          {currentPlace && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card rounded-xl border border-border p-4 shadow-xl z-[10]">
              <button
                onClick={() => {
                  setSelectedPlace(null);
                  setActiveMarker(null);
                }}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex gap-3">
                <img
                  src={currentPlace.image}
                  alt={currentPlace.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {currentPlace.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentPlace.cityName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm">{currentPlace.rating}</span>
                    </div>
                    {currentPlace.isMustVisit && (
                      <Badge variant="secondary" className="text-xs">
                        Must Visit
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                {currentPlace.description}
              </p>
              <Button className="w-full mt-3" size="sm" asChild>
                <Link href={`/destination/${currentPlace.slug}`}>
                  View Details
                </Link>
              </Button>
            </div>
          )}

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border z-[10]">
            <p className="text-xs font-medium mb-2">Legend</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Tourism</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>Culinary</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {filteredPlaces.length} locations
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
