import { NextRequest, NextResponse } from 'next/server';
import { query, execute, oracledb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const mustVisit = searchParams.get('mustVisit');

    let sql = `SELECT * FROM v_place_details WHERE status = 'active'`;
    const binds: Record<string, unknown> = {};

    if (city) {
      sql += ` AND city_slug = :city`;
      binds.city = city;
    }

    if (category) {
      sql += ` AND category = :category`;
      binds.category = category;
    }

    if (search) {
      sql += ` AND (LOWER(name) LIKE '%' || LOWER(:search) || '%' OR LOWER(address) LIKE '%' || LOWER(:search) || '%')`;
      binds.search = search;
    }

    if (mustVisit === 'true') {
      sql += ` AND is_must_visit = 1`;
    }

    sql += ` ORDER BY rating DESC NULLS LAST`;
    sql += ` OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
    binds.offset = offset;
    binds.limit = limit;

    const places = await query(sql, binds);

    // Get total count for pagination
    let countSql = `SELECT COUNT(*) AS total FROM v_place_details WHERE status = 'active'`;
    const countBinds: Record<string, unknown> = {};
    if (city) { countSql += ` AND city_slug = :city`; countBinds.city = city; }
    if (category) { countSql += ` AND category = :category`; countBinds.category = category; }
    if (search) { countSql += ` AND (LOWER(name) LIKE '%' || LOWER(:search) || '%')`; countBinds.search = search; }
    if (mustVisit === 'true') { countSql += ` AND is_must_visit = 1`; }

    const countResult = await query<{ TOTAL: number }>(countSql, countBinds);
    const total = countResult[0]?.TOTAL || 0;

    // Get tags for each place
    const placesWithTags = await Promise.all(
      places.map(async (p: Record<string, unknown>) => {
        const tags = await query(
          'SELECT tag_name FROM place_tags WHERE place_id = :placeId',
          { placeId: p.ID }
        );
        return {
          id: p.ID,
          name: p.NAME,
          slug: p.SLUG,
          description: p.DESCRIPTION,
          longDescription: p.LONG_DESCRIPTION,
          category: p.CATEGORY,
          cityId: p.CITY_ID,
          cityName: p.CITY_NAME,
          image: p.IMAGE_URL,
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
          tags: tags.map((t: Record<string, unknown>) => t.TAG_NAME),
        };
      })
    );

    return NextResponse.json({ places: placesWithTags, total, limit, offset });
  } catch (error) {
    console.error('[Places GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — Admin: Create new place
export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name, slug, description, longDescription, category, cityId,
      imageUrl, address, latitude, longitude, operationalHours,
      priceRange, estimatedDuration, difficulty, isMustVisit, tags,
      videoUrl, instagramUrl, tiktokUrl, facebookUrl, websiteUrl
    } = body;

    const result = await execute(
      `INSERT INTO places (
        name, slug, description, long_description, category, city_id,
        image_url, address, latitude, longitude, operational_hours,
        price_range, estimated_duration, difficulty, is_must_visit,
        video_url, instagram_url, tiktok_url, facebook_url, website_url, status
      ) VALUES (
        :name, :slug, :description, :long_description, :category, :city_id,
        :image_url, :address, :latitude, :longitude, :operational_hours,
        :price_range, :estimated_duration, :difficulty, :is_must_visit,
        :video_url, :instagram_url, :tiktok_url, :facebook_url, :website_url, 'active'
      ) RETURNING id INTO :id`,
      {
        name,
        slug,
        description: description || null,
        long_description: longDescription || null,
        category,
        city_id: cityId,
        image_url: imageUrl || null,
        address: address || null,
        latitude: latitude || null,
        longitude: longitude || null,
        operational_hours: operationalHours || null,
        price_range: priceRange || null,
        estimated_duration: estimatedDuration || null,
        difficulty: difficulty || null,
        is_must_visit: isMustVisit ? 1 : 0,
        video_url: videoUrl || null,
        instagram_url: instagramUrl || null,
        tiktok_url: tiktokUrl || null,
        facebook_url: facebookUrl || null,
        website_url: websiteUrl || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    const placeId = (result.outBinds as { id: number[] }).id[0];

    // Insert tags
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        await execute(
          'INSERT INTO place_tags (place_id, tag_name) VALUES (:placeId, :tag)',
          { placeId, tag }
        );
      }
    }

    return NextResponse.json({ message: 'Place created', id: placeId }, { status: 201 });
  } catch (error) {
    console.error('[Places POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
