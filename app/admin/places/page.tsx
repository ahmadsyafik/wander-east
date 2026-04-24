"use client";

import { useState } from "react";
import Link from "next/link";
import { places, cities } from "@/lib/data";
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
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  Filter,
  Utensils,
  Mountain,
} from "lucide-react";

const serifFont = { fontFamily: "'DM Serif Display', Georgia, serif" };

export default function AdminPlacesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredPlaces = places.filter((place) => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.cityName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = filterCity === "all" || place.cityId === filterCity;
    const matchesCategory =
      filterCategory === "all" || place.category === filterCategory;
    return matchesSearch && matchesCity && matchesCategory;
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      // In real app, this would call backend API
      alert(`Deleted: ${name} (This is a demo)`);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={serifFont}>Manage Places</h1>
          <p className="text-muted-foreground">
            Add, edit, or remove places from the platform.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/places/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Place
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search places..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* City Filter */}
          <select
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
          >
            <option value="all">All Cities</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="wisata">Tourism</option>
            <option value="kuliner">Culinary</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPlaces.length} of {places.length} places
        </p>
      </div>

      {/* Places Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 font-medium text-sm">Place</th>
                <th className="text-left p-4 font-medium text-sm">Category</th>
                <th className="text-left p-4 font-medium text-sm">City</th>
                <th className="text-left p-4 font-medium text-sm">Rating</th>
                <th className="text-left p-4 font-medium text-sm">Status</th>
                <th className="text-right p-4 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPlaces.map((place) => (
                <tr key={place.id} className="hover:bg-secondary/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{place.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                          {place.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="gap-1">
                      {place.category === "kuliner" ? (
                        <Utensils className="h-3 w-3" />
                      ) : (
                        <Mountain className="h-3 w-3" />
                      )}
                      {place.category === "kuliner" ? "Culinary" : "Tourism"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{place.cityName}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm">{place.rating}</span>
                      <span className="text-xs text-muted-foreground">
                        ({place.reviewCount})
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    {place.isMustVisit ? (
                      <Badge className="bg-primary/20 text-primary">Must Visit</Badge>
                    ) : (
                      <Badge variant="secondary">Regular</Badge>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/places/${place.id}/view`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/places/${place.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(place.id, place.name)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPlaces.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No places found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
