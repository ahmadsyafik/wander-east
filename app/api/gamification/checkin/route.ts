import { NextResponse } from 'next/server';
import { execute, oracledb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// POST — Check-in to a place
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

    // Insert visit
    const result = await execute(
      `INSERT INTO user_visits (user_id, place_id)
       VALUES (:userId, :placeId)
       RETURNING id INTO :id`,
      {
        userId: auth.userId,
        placeId,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    const visitId = (result.outBinds as { id: number[] }).id[0];

    // Update achievement progress for visits and cities
    await execute(
      `BEGIN sp_update_achievement_progress(:userId, 'visits'); END;`,
      { userId: auth.userId }
    );
    await execute(
      `BEGIN sp_update_achievement_progress(:userId, 'cities'); END;`,
      { userId: auth.userId }
    );

    return NextResponse.json(
      { message: 'Check-in successful! +50 XP', id: visitId },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Checkin]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
