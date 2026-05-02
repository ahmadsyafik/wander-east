import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET — User achievements
export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get all achievements with user progress
    const achievements = await query(
      `SELECT a.id, a.name, a.description, a.icon, a.requirement, a.type,
              NVL(ua.current_progress, 0) AS current_progress,
              NVL(ua.is_unlocked, 0) AS is_unlocked,
              ua.unlocked_at
       FROM achievements a
       LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = :userId
       ORDER BY a.id`,
      { userId: auth.userId }
    );

    return NextResponse.json({
      achievements: achievements.map((a: Record<string, unknown>) => ({
        id: a.ID,
        name: a.NAME,
        description: a.DESCRIPTION,
        icon: a.ICON,
        requirement: a.REQUIREMENT,
        type: a.TYPE,
        current: a.CURRENT_PROGRESS,
        isUnlocked: a.IS_UNLOCKED === 1,
        unlockedAt: a.UNLOCKED_AT,
      })),
    });
  } catch (error) {
    console.error('[Achievements]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
