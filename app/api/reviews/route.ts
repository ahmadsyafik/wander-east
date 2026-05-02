import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET — All reviews (admin moderation view)
export async function GET(request: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `SELECT r.id, r.rating, r.review_comment, r.status, r.created_at,
                      u.id AS user_id, u.name AS user_name, u.email AS user_email,
                      p.id AS place_id, p.name AS place_name
               FROM reviews r
               JOIN users u ON r.user_id = u.id
               JOIN places p ON r.place_id = p.id
               WHERE 1=1`;
    const binds: Record<string, unknown> = {};

    if (status) {
      sql += ` AND r.status = :status`;
      binds.status = status;
    }

    sql += ` ORDER BY r.created_at DESC`;
    sql += ` OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
    binds.offset = offset;
    binds.limit = limit;

    const reviews = await query(sql, binds);

    return NextResponse.json({
      reviews: reviews.map((r: Record<string, unknown>) => ({
        id: r.ID,
        rating: r.RATING,
        comment: r.REVIEW_COMMENT,
        status: r.STATUS,
        createdAt: r.CREATED_AT,
        userId: r.USER_ID,
        userName: r.USER_NAME,
        userEmail: r.USER_EMAIL,
        placeId: r.PLACE_ID,
        placeName: r.PLACE_NAME,
      })),
    });
  } catch (error) {
    console.error('[Reviews Admin GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
