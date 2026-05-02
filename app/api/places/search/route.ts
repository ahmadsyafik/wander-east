import { NextRequest, NextResponse } from 'next/server';
import { searchPlaces, getPhotoUrl, categorizePlace, createSlug, mapPriceLevel } from '@/lib/google-places';

// GET — Search for places via Google Places API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    if (!q) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const places = await searchPlaces(q, { maxResults });

    return NextResponse.json({
      places: places.map((place) => ({
        googlePlaceId: place.id,
        name: place.displayName?.text || 'Unknown',
        slug: createSlug(place.displayName?.text || 'unknown'),
        address: place.formattedAddress || '',
        coordinates: place.location
          ? { lat: place.location.latitude, lng: place.location.longitude }
          : null,
        rating: place.rating || 0,
        reviewCount: place.userRatingCount || 0,
        category: categorizePlace(place.types || []),
        priceRange: mapPriceLevel(place.priceLevel),
        description: place.editorialSummary?.text || '',
        image: place.photos?.[0] ? getPhotoUrl(place.photos[0].name) : null,
        photos: (place.photos || []).slice(0, 3).map((p) => getPhotoUrl(p.name)),
        types: place.types || [],
        operationalHours: place.regularOpeningHours?.weekdayDescriptions?.[0] || '',
      })),
    });
  } catch (error) {
    console.error('[Search]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
