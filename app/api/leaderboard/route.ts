import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET — Leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const leaderboard = await query(
      `SELECT * FROM v_leaderboard
       WHERE rank_position <= :limit
       ORDER BY rank_position`,
      { limit }
    );

    return NextResponse.json({
      leaderboard: leaderboard.map((u: Record<string, unknown>) => ({
        rank: u.RANK_POSITION,
        id: u.ID,
        name: u.NAME,
        avatar: u.AVATAR_URL,
        level: u.USER_LEVEL,
        xp: u.XP,
        placesVisited: u.PLACES_VISITED,
        reviewsWritten: u.REVIEWS_WRITTEN,
        badgeCount: u.BADGE_COUNT,
      })),
    });
  } catch (error) {
    console.error('[Leaderboard]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
