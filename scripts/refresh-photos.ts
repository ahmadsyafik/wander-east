/**
 * Refresh Photos Script — Re-fetch photo URLs from Google Places API.
 *
 * Usage: npx tsx scripts/refresh-photos.ts
 *
 * This script:
 * 1. Loads all places that have a google_place_id from Oracle DB
 * 2. Fetches fresh photo references from Google Places API (Place Details)
 * 3. Updates image_url in the `places` table
 * 4. Updates image_url(s) in the `place_gallery` table
 */

import oracledb from 'oracledb';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://places.googleapis.com/v1';

function getPhotoUrl(photoName: string, maxWidth: number = 800): string {
  return `${BASE_URL}/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`;
}

async function fetchPlacePhotos(googlePlaceId: string): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/places/${googlePlaceId}`, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': API_KEY!,
      'X-Goog-FieldMask': 'photos',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`  ❌ Google API error for ${googlePlaceId}:`, error);
    return [];
  }

  const data = await response.json();
  const photos: Array<{ name: string }> = data.photos || [];
  return photos.map((p) => getPhotoUrl(p.name));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔄 Wander East — Photo URL Refresher');
  console.log('=====================================\n');

  if (!API_KEY) {
    console.error('❌ GOOGLE_PLACES_API_KEY is not set in .env.local');
    process.exit(1);
  }

  // Connect to Oracle
  let connection: oracledb.Connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });
    console.log('✅ Connected to Oracle Database\n');
  } catch (err) {
    console.error('❌ Failed to connect to Oracle:', err);
    process.exit(1);
  }

  // Fetch all places with a google_place_id
  const result = await connection.execute<{
    ID: number;
    NAME: string;
    GOOGLE_PLACE_ID: string;
  }>(
    `SELECT id, name, google_place_id
     FROM places
     WHERE google_place_id IS NOT NULL AND status = 'active'
     ORDER BY id`,
    {},
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const places = result.rows || [];
  console.log(`📍 Found ${places.length} places to refresh\n`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    const progress = `[${i + 1}/${places.length}]`;

    console.log(`${progress} Refreshing: ${place.NAME} (${place.GOOGLE_PLACE_ID})`);

    try {
      const photoUrls = await fetchPlacePhotos(place.GOOGLE_PLACE_ID);

      if (photoUrls.length === 0) {
        console.log(`  ⚠️  No photos found, skipping`);
        failed++;
        continue;
      }

      // Update main image_url in places table
      await connection.execute(
        `UPDATE places SET image_url = :image_url WHERE id = :id`,
        { image_url: photoUrls[0], id: place.ID },
        { autoCommit: false }
      );

      // Delete old gallery photos and insert fresh ones
      await connection.execute(
        `DELETE FROM place_gallery WHERE place_id = :place_id`,
        { place_id: place.ID },
        { autoCommit: false }
      );

      const galleryCount = Math.min(photoUrls.length, 5);
      for (let j = 0; j < galleryCount; j++) {
        await connection.execute(
          `INSERT INTO place_gallery (place_id, image_url, sort_order)
           VALUES (:place_id, :image_url, :sort_order)`,
          {
            place_id: place.ID,
            image_url: photoUrls[j],
            sort_order: j,
          },
          { autoCommit: false }
        );
      }

      await connection.commit();
      updated++;
      console.log(`  ✅ Updated (${galleryCount} photos)`);
    } catch (err) {
      await connection.rollback();
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ Error: ${message}`);
      failed++;
    }

    // Throttle requests to avoid hitting API rate limits (~500ms between calls)
    if (i < places.length - 1) {
      await sleep(500);
    }
  }

  console.log(`\n=====================================`);
  console.log(`🎉 Refresh complete!`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ❌ Failed:  ${failed}`);
  console.log(`   📊 Total:   ${places.length}`);

  await connection.close();
  console.log('🔌 Oracle connection closed.');
}

main().catch(console.error);
