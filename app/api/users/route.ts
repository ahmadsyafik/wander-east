import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET — List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `SELECT * FROM v_user_stats WHERE 1=1`;
    const binds: Record<string, unknown> = {};

    if (search) {
      sql += ` AND (LOWER(name) LIKE '%' || LOWER(:search) || '%' OR LOWER(email) LIKE '%' || LOWER(:search) || '%')`;
      binds.search = search;
    }

    sql += ` ORDER BY created_at DESC`;
    sql += ` OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
    binds.offset = offset;
    binds.limit = limit;

    const users = await query(sql, binds);

    return NextResponse.json({
      users: users.map((u: Record<string, unknown>) => ({
        id: u.ID,
        name: u.NAME,
        email: u.EMAIL,
        avatar: u.AVATAR_URL,
        level: u.USER_LEVEL,
        xp: u.XP,
        role: u.ROLE,
        isBanned: u.IS_BANNED === 1,
        placesVisited: u.PLACES_VISITED,
        reviewsWritten: u.REVIEWS_WRITTEN,
        badgeCount: u.BADGE_COUNT,
        createdAt: u.CREATED_AT,
      })),
    });
  } catch (error) {
    console.error('[Users GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
