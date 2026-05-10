import { NextResponse } from 'next/server';
import { execute, query, oracledb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

/**
 * Calculate distance between two coordinates using Haversine formula.
 * Returns distance in meters.
 */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// POST — Check-in to a place (with GPS validation)
export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { placeId, userLat, userLng } = await request.json();

    if (!placeId) {
      return NextResponse.json({ error: 'placeId is required' }, { status: 400 });
    }

    if (userLat === undefined || userLng === undefined) {
      return NextResponse.json(
        { error: 'Lokasi GPS diperlukan untuk check-in. Aktifkan GPS Anda.' },
        { status: 400 }
      );
    }

    // Get place coordinates from database
    const places = await query<{ LATITUDE: number; LONGITUDE: number; NAME: string }>(
      `SELECT latitude, longitude, name FROM places WHERE id = :placeId AND status = 'active'`,
      { placeId }
    );

    if (places.length === 0) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    const place = places[0];

    if (!place.LATITUDE || !place.LONGITUDE) {
      // If place has no coordinates, allow check-in (graceful fallback)
      console.warn(`[Checkin] Place ${placeId} has no coordinates, allowing check-in`);
    } else {
      // Validate distance
      const distance = haversineDistance(
        userLat, userLng,
        place.LATITUDE, place.LONGITUDE
      );

      const MAX_DISTANCE = 100; // 100 meters

      if (distance > MAX_DISTANCE) {
        const distanceStr = distance >= 1000
          ? `${(distance / 1000).toFixed(1)} km`
          : `${Math.round(distance)} meter`;

        return NextResponse.json(
          {
            error: `Anda berada ${distanceStr} dari ${place.NAME}. Anda harus berada dalam radius 100m untuk check-in.`,
            distance: Math.round(distance),
            maxDistance: MAX_DISTANCE,
          },
          { status: 400 }
        );
      }
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
      { message: 'Check-in berhasil! +50 XP 🎉', id: visitId },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Checkin]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
