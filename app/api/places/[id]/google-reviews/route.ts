import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Params {
  params: Promise<{ id: string }>;
}

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://places.googleapis.com/v1';

// Simple in-memory cache to avoid hammering Google API
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// GET — Fetch Google Reviews for a place
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;

    // Find the google_place_id from DB
    const isNumeric = /^\d+$/.test(id);
    const places = await query(
      isNumeric
        ? `SELECT google_place_id FROM places WHERE id = :id AND status = 'active'`
        : `SELECT google_place_id FROM places WHERE slug = :slug AND status = 'active'`,
      isNumeric ? { id: parseInt(id) } : { slug: id }
    );

    if (places.length === 0) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    const googlePlaceId = (places[0] as Record<string, unknown>).GOOGLE_PLACE_ID as string;

    if (!googlePlaceId) {
      return NextResponse.json({ reviews: [] });
    }

    // Check cache
    const cacheKey = `google-reviews-${googlePlaceId}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    if (!API_KEY) {
      return NextResponse.json({ reviews: [] });
    }

    // Fetch from Google Places API (New) with Indonesian language
    // Google Places API (New) returns max 5 reviews — this is a hard API limit.
    const fieldMask = 'reviews';
    const response = await fetch(
      `${BASE_URL}/places/${googlePlaceId}?languageCode=id`,
      {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': fieldMask,
        },
      }
    );

    if (!response.ok) {
      console.error('[Google Reviews] API error:', response.status, await response.text());
      return NextResponse.json({ reviews: [] });
    }

    const data = await response.json();
    const googleReviews = (data.reviews || []).map((r: Record<string, unknown>) => {
      const authorAttribution = r.authorAttribution as Record<string, string> | undefined;
      const originalText = r.originalText as Record<string, string> | undefined;
      const translatedText = r.text as Record<string, string> | undefined;

      // Prefer translated text (Indonesian), fallback to original
      const reviewText = translatedText?.text || originalText?.text || '';

      // Fix photoUri — Google sometimes returns protocol-relative URLs (//lh3.googleusercontent.com/...)
      let avatarUrl = authorAttribution?.photoUri || '';
      if (avatarUrl && avatarUrl.startsWith('//')) {
        avatarUrl = `https:${avatarUrl}`;
      }

      return {
        id: `google-${Math.random().toString(36).substring(7)}`,
        rating: r.rating || 0,
        comment: reviewText,
        createdAt: r.publishTime || new Date().toISOString(),
        userName: authorAttribution?.displayName || 'Google User',
        userAvatar: avatarUrl,
        userLevel: 0,
        source: 'google',
        relativeTime: (r.relativePublishTimeDescription as string) || '',
        googleMapsUri: (r.googleMapsUri as string) || '',
      };
    });

    const result = { reviews: googleReviews };

    // Store in cache
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Google Reviews]', error);
    return NextResponse.json({ reviews: [] });
  }
}
