/**
 * Seed script — Fetch places from Google Places API and insert into Oracle DB.
 *
 * Usage: npx tsx scripts/seed-from-google.ts
 *
 * This script:
 * 1. Fetches wisata & kuliner data from Google Places API for each city
 * 2. Inserts the data into Oracle Database
 * 3. Inserts associated tags and gallery photos
 */

import oracledb from 'oracledb';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://places.googleapis.com/v1';

// City slugs to seed
const CITY_SLUGS = ['surabaya', 'malang', 'banyuwangi', 'batu', 'jember', 'probolinggo'];
const CITY_NAMES: Record<string, string> = {
  surabaya: 'Surabaya',
  malang: 'Malang',
  banyuwangi: 'Banyuwangi',
  batu: 'Batu',
  jember: 'Jember',
  probolinggo: 'Probolinggo',
};

// Search queries per city
const SEARCH_QUERIES = [
  { template: 'tempat wisata populer di {city}, Jawa Timur', category: 'wisata' },
  { template: 'kuliner terkenal di {city}, Jawa Timur', category: 'kuliner' },
];

interface GooglePlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  priceLevel?: string;
  photos?: Array<{ name: string }>;
  editorialSummary?: { text: string };
  types?: string[];
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

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

function getPhotoUrl(photoName: string, maxWidth: number = 800): string {
  return `${BASE_URL}/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`;
}

async function searchPlaces(query: string): Promise<GooglePlace[]> {
  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.location',
    'places.rating',
    'places.userRatingCount',
    'places.regularOpeningHours',
    'places.priceLevel',
    'places.photos',
    'places.editorialSummary',
    'places.types',
  ].join(',');

  const response = await fetch(`${BASE_URL}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY!,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: 8,
      languageCode: 'id',
      regionCode: 'ID',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Google API error for "${query}":`, error);
    return [];
  }

  const data = await response.json();
  return data.places || [];
}

function mapGoogleTypes(types: string[]): string[] {
  const typeMapping: Record<string, string> = {
    'tourist_attraction': 'Tourism',
    'natural_feature': 'Nature',
    'park': 'Nature',
    'point_of_interest': 'Attraction',
    'restaurant': 'Restaurant',
    'cafe': 'Cafe',
    'bakery': 'Bakery',
    'food': 'Food',
    'beach': 'Beach',
    'museum': 'Museum',
    'church': 'Heritage',
    'hindu_temple': 'Temple',
    'mosque': 'Mosque',
    'zoo': 'Zoo',
    'amusement_park': 'Theme Park',
    'campground': 'Camping',
    'shopping_mall': 'Shopping',
  };

  const mapped = types
    .map(t => typeMapping[t])
    .filter(Boolean);

  // Deduplicate and take max 4 tags
  return [...new Set(mapped)].slice(0, 4);
}

async function main() {
  console.log('🌏 Wander East — Google Places Seeder');
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

  // Load city IDs dynamically from DB
  const cityRows = await connection.execute<{ ID: number; SLUG: string }>(
    'SELECT id, slug FROM cities',
    {},
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const cityMap: Record<string, number> = {};
  for (const row of (cityRows.rows || [])) {
    cityMap[row.SLUG] = row.ID;
  }
  console.log('📍 City ID map:', cityMap, '\n');

  let totalInserted = 0;
  const seenPlaceIds = new Set<string>();

  for (const citySlug of CITY_SLUGS) {
    const cityName = CITY_NAMES[citySlug];
    const cityId = cityMap[citySlug];

    if (!cityId) {
      console.log(`\n⚠️  City "${citySlug}" not found in DB, skipping`);
      continue;
    }

    console.log(`\n📍 Processing city: ${cityName} (ID: ${cityId})`);
    console.log('─'.repeat(40));

    for (const searchQuery of SEARCH_QUERIES) {
      const query = searchQuery.template.replace('{city}', cityName);
      console.log(`  🔍 Searching: "${query}"`);

      const places = await searchPlaces(query);
      console.log(`  📦 Found ${places.length} results`);

      for (const place of places) {
        // Skip if already inserted (avoid duplicates across searches)
        if (seenPlaceIds.has(place.id)) {
          console.log(`  ⏭️  Skipping duplicate: ${place.displayName?.text}`);
          continue;
        }
        seenPlaceIds.add(place.id);

        const name = place.displayName?.text || 'Unknown';
        const slug = createSlug(name) + '-' + citySlug;
        const description = place.editorialSummary?.text || `${name} di ${cityName}, Jawa Timur`;
        const imageUrl = place.photos?.[0]
          ? getPhotoUrl(place.photos[0].name)
          : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';

        // Determine operational hours
        const hours = place.regularOpeningHours?.weekdayDescriptions;
        const operationalHours = hours ? hours[0] || '' : '';

        try {
          // INSERT place
          const result = await connection.execute(
            `INSERT INTO places (
              name, slug, description, category, city_id, image_url,
              rating, review_count, address, latitude, longitude,
              operational_hours, price_range, is_must_visit,
              google_place_id, status
            ) VALUES (
              :name, :slug, :description, :category, :city_id, :image_url,
              :rating, :review_count, :address, :latitude, :longitude,
              :operational_hours, :price_range, :is_must_visit,
              :google_place_id, 'active'
            ) RETURNING id INTO :id`,
            {
              name,
              slug,
              description,
              category: searchQuery.category,
              city_id: cityId,
              image_url: imageUrl,
              rating: place.rating || 0,
              review_count: place.userRatingCount || 0,
              address: place.formattedAddress || '',
              latitude: place.location?.latitude || 0,
              longitude: place.location?.longitude || 0,
              operational_hours: operationalHours,
              price_range: mapPriceLevel(place.priceLevel),
              is_must_visit: (place.rating || 0) >= 4.5 ? 1 : 0,
              google_place_id: place.id,
              id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            },
            { autoCommit: false }
          );

          const placeId = (result.outBinds as { id: number[] }).id[0];

          // INSERT gallery photos (up to 3)
          if (place.photos) {
            for (let i = 0; i < Math.min(place.photos.length, 3); i++) {
              await connection.execute(
                `INSERT INTO place_gallery (place_id, image_url, sort_order)
                 VALUES (:place_id, :image_url, :sort_order)`,
                {
                  place_id: placeId,
                  image_url: getPhotoUrl(place.photos[i].name),
                  sort_order: i,
                },
                { autoCommit: false }
              );
            }
          }

          // INSERT tags
          const tags = mapGoogleTypes(place.types || []);
          for (const tag of tags) {
            await connection.execute(
              `INSERT INTO place_tags (place_id, tag_name)
               VALUES (:place_id, :tag_name)`,
              { place_id: placeId, tag_name: tag },
              { autoCommit: false }
            );
          }

          await connection.commit();
          totalInserted++;
          console.log(`  ✅ Inserted: ${name} (ID: ${placeId}, ${searchQuery.category})`);
        } catch (err: unknown) {
          await connection.rollback();
          const message = err instanceof Error ? err.message : String(err);
          if (message.includes('unique constraint')) {
            console.log(`  ⏭️  Skipping (already exists): ${name}`);
          } else {
            console.error(`  ❌ Error inserting ${name}:`, message);
          }
        }
      }

      // Throttle to avoid hitting API rate limits
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\n=====================================`);
  console.log(`🎉 Seeding complete! Inserted ${totalInserted} places.`);

  await connection.close();
  console.log('🔌 Oracle connection closed.');
}

main().catch(console.error);
