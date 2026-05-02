import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

interface Params {
  params: Promise<{ id: string }>;
}

// GET — Get single place details
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;

    // Try to find by slug first, then by id
    const isNumeric = /^\d+$/.test(id);
    const places = await query(
      isNumeric
        ? `SELECT * FROM v_place_details WHERE id = :id AND status = 'active'`
        : `SELECT * FROM v_place_details WHERE slug = :slug AND status = 'active'`,
      isNumeric ? { id: parseInt(id) } : { slug: id }
    );

    if (places.length === 0) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    const p = places[0] as Record<string, unknown>;

    // Get gallery
    const gallery = await query(
      'SELECT image_url FROM place_gallery WHERE place_id = :placeId ORDER BY sort_order',
      { placeId: p.ID }
    );

    // Get tags
    const tags = await query(
      'SELECT tag_name FROM place_tags WHERE place_id = :placeId',
      { placeId: p.ID }
    );

    // Get reviews with user info
    const reviews = await query(
      `SELECT r.id, r.rating, r.review_comment, r.status, r.created_at,
              u.id as user_id, u.name as user_name, u.avatar_url as user_avatar, u.user_level
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.place_id = :placeId AND r.status = 'approved'
       ORDER BY r.created_at DESC
       FETCH FIRST 10 ROWS ONLY`,
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
      tags: tags.map((t: Record<string, unknown>) => t.TAG_NAME),
      reviews: reviews.map((r: Record<string, unknown>) => ({
        id: r.ID,
        rating: r.RATING,
        comment: r.REVIEW_COMMENT,
        createdAt: r.CREATED_AT,
        userId: r.USER_ID,
        userName: r.USER_NAME,
        userAvatar: r.USER_AVATAR,
        userLevel: r.USER_LEVEL,
      })),
    };

    return NextResponse.json({ place });
  } catch (error) {
    console.error('[Place GET]', error);
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
      cityId: 'city_id', imageUrl: 'image_url', address: 'address',
      latitude: 'latitude', longitude: 'longitude',
      operationalHours: 'operational_hours', priceRange: 'price_range',
      estimatedDuration: 'estimated_duration', difficulty: 'difficulty',
      status: 'status',
    };

    for (const [jsField, dbField] of Object.entries(fieldMap)) {
      if (body[jsField] !== undefined) {
        fields.push(`${dbField} = :${dbField}`);
        binds[dbField] = body[jsField];
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
    console.error('[Place PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — Admin: Delete place
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const auth = await getCurrentUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await execute('DELETE FROM places WHERE id = :id', { id: parseInt(id) });

    return NextResponse.json({ message: 'Place deleted' });
  } catch (error) {
    console.error('[Place DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
