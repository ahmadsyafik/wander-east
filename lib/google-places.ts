/**
 * Google Places API (New) client
 * Uses the REST API directly for simplicity.
 */

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://places.googleapis.com/v1';

export interface GooglePlace {
  id: string;
  displayName: { text: string; languageCode: string };
  formattedAddress: string;
  location: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: {
    openNow: boolean;
    weekdayDescriptions: string[];
  };
  regularOpeningHours?: {
    openNow: boolean;
    weekdayDescriptions: string[];
  };
  priceLevel?: string;
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
  }>;
  editorialSummary?: { text: string; languageCode: string };
  types?: string[];
  websiteUri?: string;
  nationalPhoneNumber?: string;
  googleMapsUri?: string;
}

export interface PlaceSearchResult {
  places: GooglePlace[];
}

/**
 * Search for places using a text query.
 * @example searchPlaces("wisata populer di Malang, Jawa Timur")
 */
export async function searchPlaces(
  textQuery: string,
  options?: {
    maxResults?: number;
    languageCode?: string;
    regionCode?: string;
  }
): Promise<GooglePlace[]> {
  if (!API_KEY) {
    throw new Error('GOOGLE_PLACES_API_KEY is not set in environment variables');
  }

  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.location',
    'places.rating',
    'places.userRatingCount',
    'places.regularOpeningHours',
    'places.priceLevel',
    'places.photos',
    'places.editorialSummary',
    'places.types',
    'places.googleMapsUri',
  ].join(',');

  const response = await fetch(`${BASE_URL}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount: options?.maxResults ?? 10,
      languageCode: options?.languageCode ?? 'id',
      regionCode: options?.regionCode ?? 'ID',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Places API error: ${response.status} — ${error}`);
  }

  const data: PlaceSearchResult = await response.json();
  return data.places || [];
}

/**
 * Get detailed information about a specific place.
 */
export async function getPlaceDetails(placeId: string): Promise<GooglePlace> {
  if (!API_KEY) {
    throw new Error('GOOGLE_PLACES_API_KEY is not set in environment variables');
  }

  const fieldMask = [
    'id',
    'displayName',
    'formattedAddress',
    'location',
    'rating',
    'userRatingCount',
    'regularOpeningHours',
    'priceLevel',
    'photos',
    'editorialSummary',
    'types',
    'websiteUri',
    'nationalPhoneNumber',
    'googleMapsUri',
  ].join(',');

  const response = await fetch(`${BASE_URL}/places/${placeId}`, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': fieldMask,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Places API error: ${response.status} — ${error}`);
  }

  return response.json();
}

/**
 * Get a photo URL for a place photo reference.
 * Returns a URL that can be used directly in <img> tags.
 */
export function getPhotoUrl(
  photoName: string,
  maxWidth: number = 800
): string {
  if (!API_KEY) {
    throw new Error('GOOGLE_PLACES_API_KEY is not set');
  }
  return `${BASE_URL}/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`;
}

/**
 * Categorize a Google Place into 'wisata' or 'kuliner' based on its types.
 */
export function categorizePlace(types: string[]): 'wisata' | 'kuliner' {
  const foodTypes = [
    'restaurant', 'cafe', 'bakery', 'bar', 'food',
    'meal_delivery', 'meal_takeaway', 'coffee_shop',
  ];

  const isFoodPlace = types.some(t => foodTypes.includes(t));
  return isFoodPlace ? 'kuliner' : 'wisata';
}

/**
 * Create a URL-friendly slug from a place name.
 */
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Map Google price level to Indonesian price range string.
 */
export function mapPriceLevel(priceLevel?: string): string {
  switch (priceLevel) {
    case 'PRICE_LEVEL_FREE': return 'Gratis';
    case 'PRICE_LEVEL_INEXPENSIVE': return 'Rp 10k - 30k';
    case 'PRICE_LEVEL_MODERATE': return 'Rp 30k - 80k';
    case 'PRICE_LEVEL_EXPENSIVE': return 'Rp 80k - 200k';
    case 'PRICE_LEVEL_VERY_EXPENSIVE': return 'Rp 200k+';
    default: return 'Varies';
  }
}
