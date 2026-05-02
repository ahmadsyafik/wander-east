import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const cities = await query(
      `SELECT id, name, slug, image_url, description, place_count
       FROM cities ORDER BY name`
    );

    return NextResponse.json({
      cities: cities.map((c: Record<string, unknown>) => ({
        id: c.ID,
        name: c.NAME,
        slug: c.SLUG,
        image: c.IMAGE_URL,
        description: c.DESCRIPTION,
        placeCount: c.PLACE_COUNT,
      })),
    });
  } catch (error) {
    console.error('[Cities]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
