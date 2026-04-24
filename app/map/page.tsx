"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { places, cities } from "@/lib/data";
import { Star, Utensils, Mountain, X, Loader2 } from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

// Dynamic import for Leaflet (SSR not supported)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Real coordinates for East Java cities (accurate from Google Maps)
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  surabaya: { lat: -7.2575, lng: 112.7521 },
  malang: { lat: -7.9666, lng: 112.6326 },
  banyuwangi: { lat: -8.2191, lng: 114.3691 },
  batu: { lat: -7.8672, lng: 112.5239 },
  jember: { lat: -8.1845, lng: 113.6681 },
  probolinggo: { lat: -7.7543, lng: 113.2159 },
};

// Real coordinates for places
const placeCoordinates: Record<string, { lat: number; lng: number }> = {
  "1": { lat: -8.2301, lng: 112.9169 }, // Tumpak Sewu
  "2": { lat: -8.0584, lng: 114.2419 }, // Kawah Ijen
  "3": { lat: -8.4761, lng: 113.8231 }, // Teluk Hijau
  "4": { lat: -8.4317, lng: 113.5311 }, // Pantai Papuma
  "5": { lat: -7.9425, lng: 112.9530 }, // Gunung Bromo
  "6": { lat: -8.5842, lng: 114.0275 }, // Pulau Merah
  "7": { lat: -7.8711, lng: 112.4651 }, // Coban Rondo
  "8": { lat: -7.8856, lng: 112.5339 }, // Jatim Park 2
  "9": { lat: -7.2641, lng: 112.7474 }, // Rawon Nguling
  "10": { lat: -7.2789, lng: 112.7378 }, // Rujak Cingur
  "11": { lat: -7.9784, lng: 112.6371 }, // Bakso President
  "12": { lat: -8.2112, lng: 114.3517 }, // Sego Tempong
  "13": { lat: -7.2912, lng: 112.7380 }, // Pecel Rawon
  "14": { lat: -7.2575, lng: 112.7488 }, // Sate Klopo
  "15": { lat: -7.9789, lng: 112.6308 }, // Toko Oen
  "16": { lat: -7.2689, lng: 112.7512 }, // Warung Leko
};

export default function MapPage() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredPlaces = places.filter((place) => {
    const matchesCity = !selectedCity || place.cityId === selectedCity;
    const matchesCategory =
      selectedCategory === "all" || place.category === selectedCategory;
    return matchesCity && matchesCategory;
  });

  const currentPlace = places.find((p) => p.id === selectedPlace);

  // East Java center coordinates
  const eastJavaCenter: [number, number] = [-7.8, 113.2];

  return (
    <main className="min-h-screen bg-background">
      <Navbar isLoggedIn={true} />

      <div className="pt-16 flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 bg-card border-r border-border p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4" style={serifFont}>Explore Map</h2>

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
                  variant={selectedCategory === "kuliner" ? "default" : "outline"}
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
                onChange={(e) => setSelectedCity(e.target.value || null)}
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
            {filteredPlaces.slice(0, 10).map((place) => (
              <button
                key={place.id}
                onClick={() => setSelectedPlace(place.id)}
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
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs">{place.rating}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Map Area */}
        <div className="flex-1 relative">
          {isClient ? (
            <>
              <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
              />
              <MapContainer
                center={eastJavaCenter}
                zoom={8}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                {/* City Markers */}
                {cities.map((city) => {
                  const coords = cityCoordinates[city.id];
                  if (!coords) return null;
                  
                  const cityPlacesCount = places.filter(p => p.cityId === city.id).length;
                  
                  return (
                    <Marker
                      key={city.id}
                      position={[coords.lat, coords.lng]}
                      eventHandlers={{
                        click: () => setSelectedCity(selectedCity === city.id ? null : city.id),
                      }}
                    >
                      <Popup>
                        <div className="text-center p-1">
                          <p className="font-bold text-sm">{city.name}</p>
                          <p className="text-xs text-gray-600">{cityPlacesCount} places</p>
                          <Button 
                            size="sm" 
                            className="mt-2 h-7 text-xs"
                            onClick={() => setSelectedCity(city.id)}
                          >
                            Filter by city
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Place Markers (when filtered) */}
                {selectedCity && filteredPlaces.map((place) => {
                  const coords = placeCoordinates[place.id];
                  if (!coords) return null;
                  
                  return (
                    <Marker
                      key={place.id}
                      position={[coords.lat, coords.lng]}
                      eventHandlers={{
                        click: () => setSelectedPlace(place.id),
                      }}
                    >
                      <Popup>
                        <div className="p-1 min-w-[180px]">
                          <img 
                            src={place.image} 
                            alt={place.name}
                            className="w-full h-20 object-cover rounded mb-2"
                          />
                          <p className="font-bold text-sm">{place.name}</p>
                          <p className="text-xs text-gray-600">{place.cityName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs">{place.rating}</span>
                          </div>
                          <Link href={`/destination/${place.slug}`}>
                            <Button size="sm" className="mt-2 w-full h-7 text-xs">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </>
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
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card rounded-xl border border-border p-4 shadow-xl z-[1000]">
              <button
                onClick={() => setSelectedPlace(null)}
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
                  <h3 className="font-semibold truncate">{currentPlace.name}</h3>
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
          <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border z-[1000]">
            <p className="text-xs font-medium mb-2">Legend</p>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>City / Place</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Click a city to see places
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
