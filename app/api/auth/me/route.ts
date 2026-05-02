import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

interface UserRow {
  ID: number;
  NAME: string;
  EMAIL: string;
  AVATAR_URL: string;
  USER_LEVEL: number;
  XP: number;
  ROLE: string;
  PLACES_VISITED: number;
  REVIEWS_WRITTEN: number;
  PHOTOS_SHARED: number;
  BADGE_COUNT: number;
  CREATED_AT: string;
}

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user details from the view
    const users = await query<UserRow>(
      `SELECT id, name, email, avatar_url, user_level, xp, role,
              places_visited, reviews_written, photos_shared, badge_count, created_at
       FROM v_user_stats WHERE id = :userId`,
      { userId: auth.userId }
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Get user badges
    const badges = await query(
      `SELECT b.id, b.name, b.description, b.icon, ub.unlocked_at
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = :userId
       ORDER BY ub.unlocked_at DESC`,
      { userId: auth.userId }
    );

    return NextResponse.json({
      user: {
        id: user.ID,
        name: user.NAME,
        email: user.EMAIL,
        avatar: user.AVATAR_URL,
        level: user.USER_LEVEL,
        xp: user.XP,
        xpToNextLevel: (user.USER_LEVEL) * 500,
        role: user.ROLE,
        stats: {
          placesVisited: user.PLACES_VISITED,
          reviewsWritten: user.REVIEWS_WRITTEN,
          photosShared: user.PHOTOS_SHARED,
        },
        badges,
        joinedAt: user.CREATED_AT,
      },
    });
  } catch (error) {
    console.error('[Auth/Me]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
