export interface City {
  id: string;
  name: string;
  image: string;
  description: string;
  placeCount: number;
}

export interface Place {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: 'kuliner' | 'wisata';
  cityId: string;
  cityName: string;
  image: string;
  gallery?: string[];
  rating: number;
  reviewCount: number;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  operationalHours?: string;
  priceRange?: string;
  estimatedDuration?: string;
  difficulty?: string;
  isMustVisit: boolean;
  tags?: string[];
}

export interface Review {
  id: string;
  placeId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  role: 'user' | 'admin';
  stats: {
    placesVisited: number;
    reviewsWritten: number;
    photosShared: number;
  };
  badges: Badge[];
  visitedCities: string[];
  favoriteCities: string[];
  joinedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  current: number;
  isUnlocked: boolean;
}
