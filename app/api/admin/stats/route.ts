import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET — Admin dashboard statistics
export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use the v_admin_stats view
    const stats = await query('SELECT * FROM v_admin_stats');

    // Top rated places
    const topPlaces = await query(
      `SELECT id, name, slug, city_name, rating, review_count, image_url, category
       FROM v_place_details
       WHERE status = 'active'
       ORDER BY rating DESC NULLS LAST
       FETCH FIRST 5 ROWS ONLY`
    );

    // Recent reviews
    const recentReviews = await query(
      `SELECT r.id, r.rating, r.review_comment, r.created_at,
              u.name AS user_name,
              p.name AS place_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN places p ON r.place_id = p.id
       ORDER BY r.created_at DESC
       FETCH FIRST 5 ROWS ONLY`
    );

    const s = stats[0] as Record<string, unknown> || {};

    return NextResponse.json({
      stats: {
        totalUsers: s.TOTAL_USERS || 0,
        totalPlaces: s.TOTAL_PLACES || 0,
        totalReviews: s.TOTAL_REVIEWS || 0,
        totalCheckins: s.TOTAL_CHECKINS || 0,
        newUsers30d: s.NEW_USERS_30D || 0,
        newReviews30d: s.NEW_REVIEWS_30D || 0,
        newPlaces30d: s.NEW_PLACES_30D || 0,
      },
      topPlaces: topPlaces.map((p: Record<string, unknown>) => ({
        id: p.ID,
        name: p.NAME,
        slug: p.SLUG,
        cityName: p.CITY_NAME,
        rating: p.RATING,
        reviewCount: p.REVIEW_COUNT,
        image: p.IMAGE_URL,
        category: p.CATEGORY,
      })),
      recentReviews: recentReviews.map((r: Record<string, unknown>) => ({
        id: r.ID,
        rating: r.RATING,
        comment: r.REVIEW_COMMENT,
        createdAt: r.CREATED_AT,
        userName: r.USER_NAME,
        placeName: r.PLACE_NAME,
      })),
    });
  } catch (error) {
    console.error('[Admin Stats]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
