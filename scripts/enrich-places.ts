/**
 * Enrich script — Fetch detailed place info from Google Places API (New) Place Details
 * and update the database with missing fields.
 *
 * Usage: npx tsx scripts/enrich-places.ts
 *
 * This script:
 * 1. Gets all places with a google_place_id from the database
 * 2. Calls GET /v1/places/{place_id} for each place
 * 3. Updates operational_hours, price_range, long_description, website_url
 */

import oracledb from 'oracledb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://places.googleapis.com/v1';

function mapPriceLevel(priceLevel?: string): string {
  switch (priceLevel) {
    case 'PRICE_LEVEL_FREE': return 'Gratis';
    case 'PRICE_LEVEL_INEXPENSIVE': return 'Rp 10k - 30k';
    case 'PRICE_LEVEL_MODERATE': return 'Rp 30k - 80k';
    case 'PRICE_LEVEL_EXPENSIVE': return 'Rp 80k - 200k';
    case 'PRICE_LEVEL_VERY_EXPENSIVE': return 'Rp 200k+';
    default: return '';
  }
}

function formatOpeningHours(weekdayDescriptions?: string[]): string {
  if (!weekdayDescriptions || weekdayDescriptions.length === 0) return '';
  // Join all days into a single string, separated by " | "
  return weekdayDescriptions.join(' | ');
}

interface PlaceDetailsResponse {
  regularOpeningHours?: {
    weekdayDescriptions?: string[];
    openNow?: boolean;
  };
  priceLevel?: string;
  editorialSummary?: { text: string };
  websiteUri?: string;
  googleMapsUri?: string;
}

async function getPlaceDetails(placeId: string): Promise<PlaceDetailsResponse | null> {
  const fieldMask = [
    'regularOpeningHours',
    'priceLevel',
    'editorialSummary',
    'websiteUri',
    'googleMapsUri',
  ].join(',');

  try {
    const response = await fetch(`${BASE_URL}/places/${placeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY!,
        'X-Goog-FieldMask': fieldMask,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`  ❌ API error for ${placeId}: ${response.status} ${error.substring(0, 200)}`);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error(`  ❌ Network error for ${placeId}:`, err);
    return null;
  }
}

async function main() {
  console.log('🔄 Wander East — Place Data Enrichment');
  console.log('=======================================\n');

  if (!API_KEY) {
    console.error('❌ GOOGLE_PLACES_API_KEY is not set in .env.local');
    process.exit(1);
  }

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

  // Get all places with google_place_id
  const result = await connection.execute(
    `SELECT id, name, google_place_id, operational_hours, price_range, long_description, website_url
     FROM places
     WHERE google_place_id IS NOT NULL
     ORDER BY id`,
    [],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const places = (result.rows || []) as Array<{
    ID: number;
    NAME: string;
    GOOGLE_PLACE_ID: string;
    OPERATIONAL_HOURS: string | null;
    PRICE_RANGE: string | null;
    LONG_DESCRIPTION: string | null;
    WEBSITE_URL: string | null;
  }>;

  console.log(`📍 Found ${places.length} places to enrich\n`);

  let enrichedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    const progress = `[${i + 1}/${places.length}]`;

    // Fetch details from Google
    const details = await getPlaceDetails(place.GOOGLE_PLACE_ID);

    if (!details) {
      errorCount++;
      console.log(`${progress} ❌ Failed: ${place.NAME}`);
      await new Promise(r => setTimeout(r, 300));
      continue;
    }

    // Determine what to update
    const updates: string[] = [];
    const binds: Record<string, unknown> = { id: place.ID };
    const changes: string[] = [];

    // Operational hours — update if currently missing or only has single day
    const fullHours = formatOpeningHours(details.regularOpeningHours?.weekdayDescriptions);
    if (fullHours) {
      updates.push('operational_hours = :hours');
      binds.hours = fullHours;
      changes.push('hours');
    }

    // Price range — update if currently missing
    if (!place.PRICE_RANGE || place.PRICE_RANGE.trim() === '') {
      const priceRange = mapPriceLevel(details.priceLevel);
      if (priceRange) {
        updates.push('price_range = :price');
        binds.price = priceRange;
        changes.push('price');
      }
    }

    // Long description — update if currently missing
    if (!place.LONG_DESCRIPTION) {
      const longDesc = details.editorialSummary?.text;
      if (longDesc) {
        updates.push('long_description = :longDesc');
        binds.longDesc = longDesc;
        changes.push('desc');
      }
    }

    // Website URL — update if currently missing
    if (!place.WEBSITE_URL) {
      const website = details.websiteUri;
      if (website) {
        updates.push('website_url = :website');
        binds.website = website;
        changes.push('web');
      }
    }

    if (updates.length === 0) {
      skippedCount++;
      console.log(`${progress} ⏭️  No new data: ${place.NAME}`);
    } else {
      try {
        await connection.execute(
          `UPDATE places SET ${updates.join(', ')} WHERE id = :id`,
          binds,
          { autoCommit: true }
        );
        enrichedCount++;
        console.log(`${progress} ✅ ${place.NAME} → [${changes.join(', ')}]`);
      } catch (err) {
        errorCount++;
        console.error(`${progress} ❌ DB error for ${place.NAME}:`, err);
      }
    }

    // Throttle to avoid rate limits (200ms between requests)
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n=======================================`);
  console.log(`🎉 Enrichment complete!`);
  console.log(`   ✅ Enriched: ${enrichedCount}`);
  console.log(`   ⏭️  Skipped (no new data): ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);

  await connection.close();
  console.log('🔌 Oracle connection closed.');
}

main().catch(console.error);
