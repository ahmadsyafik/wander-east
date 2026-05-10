import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

interface Params {
  params: Promise<{ id: string }>;
}

// GET — Admin: Get place details for edit/view
export async function GET(_request: Request, { params }: Params) {
  try {
    const auth = await getCurrentUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const places = await query(
      `SELECT * FROM v_place_details WHERE id = :id`,
      { id: parseInt(id) }
    );

    if (places.length === 0) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    const p = places[0] as Record<string, unknown>;

    // Get tags
    const tags = await query(
      'SELECT tag_name FROM place_tags WHERE place_id = :placeId',
      { placeId: p.ID }
    );

    // Get gallery
    const gallery = await query(
      'SELECT image_url FROM place_gallery WHERE place_id = :placeId ORDER BY sort_order',
      { placeId: p.ID }
    );

    const place = {
      id: p.ID,
      name: p.NAME,
      slug: p.SLUG,
      description: p.DESCRIPTION,
      longDescription: p.LONG_DESCRIPTION,
      category: p.CATEGORY,
      cityId: p.CITY_ID,
      cityName: p.CITY_NAME,
      image: p.IMAGE_URL,
      gallery: gallery.map((g: Record<string, unknown>) => g.IMAGE_URL),
      rating: p.RATING,
      reviewCount: p.REVIEW_COUNT,
      address: p.ADDRESS,
      coordinates: p.LATITUDE ? { lat: p.LATITUDE, lng: p.LONGITUDE } : null,
      operationalHours: p.OPERATIONAL_HOURS,
      priceRange: p.PRICE_RANGE,
      estimatedDuration: p.ESTIMATED_DURATION,
      difficulty: p.DIFFICULTY,
      isMustVisit: p.IS_MUST_VISIT === 1,
      googlePlaceId: p.GOOGLE_PLACE_ID,
      videoUrl: p.VIDEO_URL,
      instagramUrl: p.INSTAGRAM_URL,
      tiktokUrl: p.TIKTOK_URL,
      facebookUrl: p.FACEBOOK_URL,
      websiteUrl: p.WEBSITE_URL,
      status: p.STATUS,
      tags: tags.map((t: Record<string, unknown>) => t.TAG_NAME),
    };

    return NextResponse.json({ place });
  } catch (error) {
    console.error('[Admin Place GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT — Admin: Update place
export async function PUT(request: Request, { params }: Params) {
  try {
    const auth = await getCurrentUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const fields: string[] = [];
    const binds: Record<string, unknown> = { id: parseInt(id) };

    const fieldMap: Record<string, string> = {
      name: 'name', slug: 'slug', description: 'description',
      longDescription: 'long_description', category: 'category',
      cityId: 'city_id', image: 'image_url', imageUrl: 'image_url',
      address: 'address', latitude: 'latitude', longitude: 'longitude',
      operationalHours: 'operational_hours', priceRange: 'price_range',
      estimatedDuration: 'estimated_duration', difficulty: 'difficulty',
      status: 'status', videoUrl: 'video_url',
      instagramUrl: 'instagram_url', tiktokUrl: 'tiktok_url',
      facebookUrl: 'facebook_url', websiteUrl: 'website_url',
    };

    for (const [jsField, dbField] of Object.entries(fieldMap)) {
      if (body[jsField] !== undefined) {
        fields.push(`${dbField} = :${dbField}`);
        binds[dbField] = body[jsField];
      }
    }

    // Handle coordinates object
    if (body.coordinates) {
      if (body.coordinates.lat !== undefined) {
        fields.push('latitude = :latitude');
        binds.latitude = body.coordinates.lat;
      }
      if (body.coordinates.lng !== undefined) {
        fields.push('longitude = :longitude');
        binds.longitude = body.coordinates.lng;
      }
    }

    if (body.isMustVisit !== undefined) {
      fields.push('is_must_visit = :is_must_visit');
      binds.is_must_visit = body.isMustVisit ? 1 : 0;
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    await execute(
      `UPDATE places SET ${fields.join(', ')} WHERE id = :id`,
      binds
    );

    return NextResponse.json({ message: 'Place updated' });
  } catch (error) {
    console.error('[Admin Place PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
