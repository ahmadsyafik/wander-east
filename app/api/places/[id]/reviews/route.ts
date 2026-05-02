import { NextResponse } from 'next/server';
import { query, execute, oracledb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

interface Params {
  params: Promise<{ id: string }>;
}

// GET — Get reviews for a place
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const reviews = await query(
      `SELECT r.id, r.rating, r.review_comment, r.status, r.created_at,
              u.id as user_id, u.name as user_name, u.avatar_url as user_avatar, u.user_level
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.place_id = :placeId AND r.status = 'approved'
       ORDER BY r.created_at DESC`,
      { placeId: parseInt(id) }
    );

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('[Reviews GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — Write a review
export async function POST(request: Request, { params }: Params) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const { rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const result = await execute(
      `INSERT INTO reviews (place_id, user_id, rating, review_comment)
       VALUES (:placeId, :userId, :rating, :comment)
       RETURNING id INTO :id`,
      {
        placeId: parseInt(id),
        userId: auth.userId,
        rating,
        comment: comment || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    const reviewId = (result.outBinds as { id: number[] }).id[0];

    // Update achievement progress
    await execute(
      `BEGIN sp_update_achievement_progress(:userId, 'reviews'); END;`,
      { userId: auth.userId }
    );

    return NextResponse.json({ message: 'Review submitted', id: reviewId }, { status: 201 });
  } catch (error) {
    console.error('[Reviews POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
