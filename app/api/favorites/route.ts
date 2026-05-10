import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET — Get user's favorite places
export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const favorites = await query(
      `SELECT p.id, p.name, p.slug, p.image_url, p.category, p.rating, p.review_count,
              c.name AS city_name, uf.created_at AS favorited_at
       FROM user_favorites uf
       JOIN places p ON uf.place_id = p.id
       JOIN cities c ON p.city_id = c.id
       WHERE uf.user_id = :userId
       ORDER BY uf.created_at DESC`,
      { userId: auth.userId }
    );

    return NextResponse.json({
      favorites: favorites.map((f: Record<string, unknown>) => ({
        id: f.ID,
        name: f.NAME,
        slug: f.SLUG,
        image: f.IMAGE_URL,
        category: f.CATEGORY,
        rating: f.RATING,
        reviewCount: f.REVIEW_COUNT,
        cityName: f.CITY_NAME,
        favoritedAt: f.FAVORITED_AT,
      })),
    });
  } catch (error) {
    console.error('[Favorites GET]', error);
    return NextResponse.json({ favorites: [] });
  }
}

// POST — Toggle favorite (add or remove)
export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { placeId } = await request.json();
    if (!placeId) {
      return NextResponse.json({ error: 'placeId is required' }, { status: 400 });
    }

    // Check if already favorited
    const existing = await query(
      'SELECT COUNT(*) AS cnt FROM user_favorites WHERE user_id = :userId AND place_id = :placeId',
      { userId: auth.userId, placeId }
    );

    const isFavorited = (existing[0] as Record<string, number>)?.CNT > 0;

    if (isFavorited) {
      // Remove favorite
      await execute(
        'DELETE FROM user_favorites WHERE user_id = :userId AND place_id = :placeId',
        { userId: auth.userId, placeId }
      );
      return NextResponse.json({ action: 'removed', isFavorite: false });
    } else {
      // Add favorite
      await execute(
        'INSERT INTO user_favorites (user_id, place_id) VALUES (:userId, :placeId)',
        { userId: auth.userId, placeId }
      );
      return NextResponse.json({ action: 'added', isFavorite: true });
    }
  } catch (error) {
    console.error('[Favorites POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
