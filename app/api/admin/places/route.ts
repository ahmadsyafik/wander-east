import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// POST — Admin: Create new place (delegates to /api/places POST logic)
export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward to the main places API handler
    const body = await request.json();
    const { execute, oracledb } = await import('@/lib/db');

    const {
      name, description, longDescription, category, cityId,
      imageUrl, address, latitude, longitude, operationalHours,
      priceRange, estimatedDuration, difficulty, isMustVisit, tags,
      videoUrl, instagramUrl, tiktokUrl, facebookUrl, websiteUrl
    } = body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

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
        category: category || 'wisata',
        city_id: parseInt(cityId),
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
        if (tag) {
          await execute(
            'INSERT INTO place_tags (place_id, tag_name) VALUES (:placeId, :tag)',
            { placeId, tag }
          );
        }
      }
    }

    return NextResponse.json({ message: 'Place created', id: placeId }, { status: 201 });
  } catch (error) {
    console.error('[Admin Places POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
