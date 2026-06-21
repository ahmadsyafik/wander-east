/**
 * Seed script — Add all remaining East Java cities + iconic places from Google Places API.
 *
 * Usage: npx tsx scripts/seed-new-cities.ts
 *
 * This script:
 * 1. Inserts 25 new cities into the cities table
 * 2. Fetches 3-5 iconic/legendary places (mixed wisata & kuliner) per city via Google Places API
 * 3. Inserts places, gallery photos, and tags
 */

import oracledb from 'oracledb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://places.googleapis.com/v1';

// ============================================================
// 25 kota/kabupaten Jawa Timur yang BELUM ada di database
// ============================================================
const NEW_CITIES: Array<{
  name: string;
  slug: string;
  description: string;
  // Specific iconic search queries: mix wisata & kuliner
  queries: Array<{ query: string; category: 'wisata' | 'kuliner'; maxResults: number }>;
}> = [
  {
    name: 'Kediri',
    slug: 'kediri',
    description: 'Kota tahu dan Simpang Lima Gumul yang ikonik',
    queries: [
      { query: 'Simpang Lima Gumul Kediri', category: 'wisata', maxResults: 1 },
      { query: 'Gunung Kelud Kediri Jawa Timur', category: 'wisata', maxResults: 1 },
      { query: 'Tahu Takwa Kediri', category: 'kuliner', maxResults: 1 },
      { query: 'Getuk Pisang Kediri', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Blitar',
    slug: 'blitar',
    description: 'Kota Proklamator dengan makam Bung Karno',
    queries: [
      { query: 'Makam Bung Karno Blitar', category: 'wisata', maxResults: 1 },
      { query: 'Candi Penataran Blitar Jawa Timur', category: 'wisata', maxResults: 1 },
      { query: 'Istana Gebang Blitar', category: 'wisata', maxResults: 1 },
      { query: 'Pecel Blitar kuliner khas', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Mojokerto',
    slug: 'mojokerto',
    description: 'Kota Majapahit dengan warisan sejarah kerajaan',
    queries: [
      { query: 'Candi Tikus Mojokerto', category: 'wisata', maxResults: 1 },
      { query: 'Museum Trowulan Mojokerto', category: 'wisata', maxResults: 1 },
      { query: 'Candi Bajang Ratu Mojokerto', category: 'wisata', maxResults: 1 },
      { query: 'Rujak Cingur Mojokerto kuliner', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Madiun',
    slug: 'madiun',
    description: 'Kota Pecel dengan kuliner legendaris dan sejarah kereta api',
    queries: [
      { query: 'Nasi Pecel Madiun kuliner khas', category: 'kuliner', maxResults: 1 },
      { query: 'Brem Madiun kuliner khas', category: 'kuliner', maxResults: 1 },
      { query: 'Taman Bantaran Kali Madiun', category: 'wisata', maxResults: 1 },
      { query: 'Monumen Kresek Madiun', category: 'wisata', maxResults: 1 },
    ],
  },
  {
    name: 'Pasuruan',
    slug: 'pasuruan',
    description: 'Kota wisata Tretes dan Taman Safari Prigen',
    queries: [
      { query: 'Taman Safari Indonesia Prigen Pasuruan', category: 'wisata', maxResults: 1 },
      { query: 'Air Terjun Kakek Bodo Tretes Pasuruan', category: 'wisata', maxResults: 1 },
      { query: 'Kebun Raya Purwodadi Pasuruan', category: 'wisata', maxResults: 1 },
      { query: 'Rawon Nguling Pasuruan kuliner', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Bangkalan',
    slug: 'bangkalan',
    description: 'Gerbang Madura dengan Jembatan Suramadu',
    queries: [
      { query: 'Jembatan Suramadu Bangkalan', category: 'wisata', maxResults: 1 },
      { query: 'Pantai Siring Kemuning Bangkalan Madura', category: 'wisata', maxResults: 1 },
      { query: 'Bebek Sinjay Bangkalan Madura', category: 'kuliner', maxResults: 1 },
      { query: 'Sate Madura Bangkalan', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Bojonegoro',
    slug: 'bojonegoro',
    description: 'Kota minyak dengan Kayangan Api yang legendaris',
    queries: [
      { query: 'Kayangan Api Bojonegoro Jawa Timur', category: 'wisata', maxResults: 1 },
      { query: 'Taman Sariyo Bojonegoro', category: 'wisata', maxResults: 1 },
      { query: 'Ledre Bojonegoro kuliner khas', category: 'kuliner', maxResults: 1 },
      { query: 'Sego Bongooro Bojonegoro', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Bondowoso',
    slug: 'bondowoso',
    description: 'Kota tape dan gerbang wisata Kawah Ijen',
    queries: [
      { query: 'Kawah Ijen Bondowoso Jawa Timur', category: 'wisata', maxResults: 1 },
      { query: 'Air Terjun Tancak Bondowoso', category: 'wisata', maxResults: 1 },
      { query: 'Tape Bondowoso kuliner khas', category: 'kuliner', maxResults: 1 },
      { query: 'Soto Lenthok Bondowoso', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Gresik',
    slug: 'gresik',
    description: 'Kota Wali dan industri dengan wisata religi',
    queries: [
      { query: 'Makam Sunan Giri Gresik', category: 'wisata', maxResults: 1 },
      { query: 'Makam Maulana Malik Ibrahim Gresik', category: 'wisata', maxResults: 1 },
      { query: 'Pulau Bawean Gresik', category: 'wisata', maxResults: 1 },
      { query: 'Nasi Krawu Gresik kuliner', category: 'kuliner', maxResults: 1 },
      { query: 'Pudak Gresik kuliner khas', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Jombang',
    slug: 'jombang',
    description: 'Kota santri dengan pesantren bersejarah',
    queries: [
      { query: 'Makam Gus Dur Jombang', category: 'wisata', maxResults: 1 },
      { query: 'Candi Arimbi Jombang', category: 'wisata', maxResults: 1 },
      { query: 'Soto Jombang kuliner khas', category: 'kuliner', maxResults: 1 },
      { query: 'Pecel Pincuk Jombang', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Lamongan',
    slug: 'lamongan',
    description: 'Wisata Bahari Lamongan dan kuliner laut',
    queries: [
      { query: 'Wisata Bahari Lamongan WBL', category: 'wisata', maxResults: 1 },
      { query: 'Makam Sunan Drajat Lamongan', category: 'wisata', maxResults: 1 },
      { query: 'Waduk Gondang Lamongan', category: 'wisata', maxResults: 1 },
      { query: 'Soto Lamongan kuliner khas', category: 'kuliner', maxResults: 1 },
      { query: 'Tahu Campur Lamongan', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Lumajang',
    slug: 'lumajang',
    description: 'Gerbang Semeru dengan pemandangan alam spektakuler',
    queries: [
      { query: 'Gunung Semeru pendakian Lumajang', category: 'wisata', maxResults: 1 },
      { query: 'Ranu Kumbolo Lumajang', category: 'wisata', maxResults: 1 },
      { query: 'Pura Mandara Giri Semeru Agung Lumajang', category: 'wisata', maxResults: 1 },
      { query: 'Pisang Agung Lumajang kuliner', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Magetan',
    slug: 'magetan',
    description: 'Telaga Sarangan di lereng Gunung Lawu',
    queries: [
      { query: 'Telaga Sarangan Magetan', category: 'wisata', maxResults: 1 },
      { query: 'Gunung Lawu pendakian Magetan', category: 'wisata', maxResults: 1 },
      { query: 'Mojosemi Forest Park Magetan', category: 'wisata', maxResults: 1 },
      { query: 'kuliner khas Magetan Jawa Timur', category: 'kuliner', maxResults: 2 },
    ],
  },
  {
    name: 'Nganjuk',
    slug: 'nganjuk',
    description: 'Kota angin dengan Air Terjun Sedudo yang megah',
    queries: [
      { query: 'Air Terjun Sedudo Nganjuk', category: 'wisata', maxResults: 1 },
      { query: 'Goa Margo Tresno Nganjuk', category: 'wisata', maxResults: 1 },
      { query: 'Nasi Becek Nganjuk kuliner khas', category: 'kuliner', maxResults: 1 },
      { query: 'Bawang Goreng Nganjuk kuliner', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Ngawi',
    slug: 'ngawi',
    description: 'Kota dengan Situs Trinil dan Benteng Van den Bosch',
    queries: [
      { query: 'Benteng Van den Bosch Ngawi', category: 'wisata', maxResults: 1 },
      { query: 'Museum Trinil Ngawi', category: 'wisata', maxResults: 1 },
      { query: 'Waduk Pondok Ngawi', category: 'wisata', maxResults: 1 },
      { query: 'Tepo Ngawi kuliner khas', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Pacitan',
    slug: 'pacitan',
    description: 'Kota 1001 goa dan pantai selatan yang eksotis',
    queries: [
      { query: 'Goa Gong Pacitan', category: 'wisata', maxResults: 1 },
      { query: 'Pantai Klayar Pacitan', category: 'wisata', maxResults: 1 },
      { query: 'Pantai Teleng Ria Pacitan', category: 'wisata', maxResults: 1 },
      { query: 'Tahu Tuna Pacitan kuliner khas', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Pamekasan',
    slug: 'pamekasan',
    description: 'Pusat budaya Madura dan karapan sapi',
    queries: [
      { query: 'Stadion Karapan Sapi Pamekasan', category: 'wisata', maxResults: 1 },
      { query: 'Api Tak Kunjung Padam Pamekasan', category: 'wisata', maxResults: 1 },
      { query: 'Batik Madura Pamekasan', category: 'wisata', maxResults: 1 },
      { query: 'Sate Madura Pamekasan kuliner', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Ponorogo',
    slug: 'ponorogo',
    description: 'Kota Reog dengan seni budaya tradisional',
    queries: [
      { query: 'Telaga Ngebel Ponorogo', category: 'wisata', maxResults: 1 },
      { query: 'Monumen Reog Ponorogo', category: 'wisata', maxResults: 1 },
      { query: 'Sate Ponorogo kuliner khas', category: 'kuliner', maxResults: 1 },
      { query: 'Dawet Jabung Ponorogo', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Sampang',
    slug: 'sampang',
    description: 'Wisata alam Madura dengan pantai tersembunyi',
    queries: [
      { query: 'Air Terjun Toroan Sampang Madura', category: 'wisata', maxResults: 1 },
      { query: 'Pantai Camplong Sampang Madura', category: 'wisata', maxResults: 1 },
      { query: 'Gili Labak Sampang Madura', category: 'wisata', maxResults: 1 },
      { query: 'Madura kuliner khas Sampang', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Sidoarjo',
    slug: 'sidoarjo',
    description: 'Kota udang dan sentra kuliner petis',
    queries: [
      { query: 'Sentra Ikan Bulak Sidoarjo', category: 'wisata', maxResults: 1 },
      { query: 'Candi Pari Sidoarjo', category: 'wisata', maxResults: 1 },
      { query: 'Lontong Kupang Sidoarjo kuliner', category: 'kuliner', maxResults: 1 },
      { query: 'Bandeng Asap Sidoarjo kuliner', category: 'kuliner', maxResults: 1 },
      { query: 'Petis Udang Sidoarjo kuliner', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Situbondo',
    slug: 'situbondo',
    description: 'Pantai Pasir Putih dan gerbang Taman Nasional Baluran',
    queries: [
      { query: 'Taman Nasional Baluran Situbondo', category: 'wisata', maxResults: 1 },
      { query: 'Pantai Pasir Putih Situbondo', category: 'wisata', maxResults: 1 },
      { query: 'kuliner khas Situbondo Jawa Timur', category: 'kuliner', maxResults: 2 },
    ],
  },
  {
    name: 'Sumenep',
    slug: 'sumenep',
    description: 'Keraton Sumenep dan keindahan Gili Labak',
    queries: [
      { query: 'Keraton Sumenep Madura', category: 'wisata', maxResults: 1 },
      { query: 'Gili Labak Sumenep', category: 'wisata', maxResults: 1 },
      { query: 'Pantai Lombang Sumenep', category: 'wisata', maxResults: 1 },
      { query: 'Soto Madura Sumenep kuliner', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Trenggalek',
    slug: 'trenggalek',
    description: 'Pantai Prigi dan goa-goa alam yang menakjubkan',
    queries: [
      { query: 'Pantai Prigi Trenggalek', category: 'wisata', maxResults: 1 },
      { query: 'Goa Lowo Trenggalek', category: 'wisata', maxResults: 1 },
      { query: 'Pantai Pelang Trenggalek', category: 'wisata', maxResults: 1 },
      { query: 'Ayam Lodho Trenggalek kuliner', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Tuban',
    slug: 'tuban',
    description: 'Kota Wali dengan wisata religi dan pantai',
    queries: [
      { query: 'Makam Sunan Bonang Tuban', category: 'wisata', maxResults: 1 },
      { query: 'Pantai Boom Tuban', category: 'wisata', maxResults: 1 },
      { query: 'Goa Akbar Tuban', category: 'wisata', maxResults: 1 },
      { query: 'Lontong Balap Tuban kuliner', category: 'kuliner', maxResults: 1 },
    ],
  },
  {
    name: 'Tulungagung',
    slug: 'tulungagung',
    description: 'Pantai selatan eksotis dan sentra marmer',
    queries: [
      { query: 'Pantai Popoh Tulungagung', category: 'wisata', maxResults: 1 },
      { query: 'Pantai Kedung Tumpang Tulungagung', category: 'wisata', maxResults: 1 },
      { query: 'Candi Dadi Tulungagung', category: 'wisata', maxResults: 1 },
      { query: 'Ayam Lodho Tulungagung kuliner', category: 'kuliner', maxResults: 1 },
    ],
  },
];

// ============================================================
// Helper functions (same pattern as seed-from-google.ts)
// ============================================================

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

async function searchPlaces(queryText: string, maxResults: number): Promise<GooglePlace[]> {
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
      textQuery: queryText,
      maxResultCount: maxResults,
      languageCode: 'id',
      regionCode: 'ID',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`  ❌ Google API error for "${queryText}":`, error);
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

  return [...new Set(mapped)].slice(0, 4);
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log('🌏 Wander East — Seed All East Java Cities');
  console.log('==========================================\n');

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

  const seenPlaceIds = new Set<string>();
  let totalCitiesInserted = 0;
  let totalPlacesInserted = 0;

  for (const city of NEW_CITIES) {
    console.log(`\n📍 Processing: ${city.name}`);
    console.log('─'.repeat(50));

    // 1. Insert city (skip if exists)
    let cityId: number;
    try {
      const result = await connection.execute(
        `INSERT INTO cities (name, slug, description)
         VALUES (:name, :slug, :description)
         RETURNING id INTO :id`,
        {
          name: city.name,
          slug: city.slug,
          description: city.description,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
        { autoCommit: true }
      );
      cityId = (result.outBinds as { id: number[] }).id[0];
      totalCitiesInserted++;
      console.log(`  ✅ City inserted: ${city.name} (ID: ${cityId})`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('unique constraint')) {
        // City exists, get its ID
        const existing = await connection.execute(
          `SELECT id FROM cities WHERE slug = :slug`,
          { slug: city.slug },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        cityId = (existing.rows as any[])?.[0]?.ID;
        console.log(`  ⏭️  City already exists: ${city.name} (ID: ${cityId})`);
      } else {
        console.error(`  ❌ Error inserting city ${city.name}:`, message);
        continue;
      }
    }

    // 2. Search and insert places
    for (const q of city.queries) {
      console.log(`  🔍 Searching: "${q.query}"`);

      const places = await searchPlaces(q.query, q.maxResults);
      console.log(`     Found ${places.length} result(s)`);

      for (const place of places) {
        if (seenPlaceIds.has(place.id)) {
          console.log(`     ⏭️  Skipping duplicate: ${place.displayName?.text}`);
          continue;
        }
        seenPlaceIds.add(place.id);

        const name = place.displayName?.text || 'Unknown';
        const slug = createSlug(name) + '-' + city.slug;
        const description = place.editorialSummary?.text || `${name} di ${city.name}, Jawa Timur`;
        const imageUrl = place.photos?.[0]
          ? getPhotoUrl(place.photos[0].name)
          : '';

        const hours = place.regularOpeningHours?.weekdayDescriptions;
        const operationalHours = hours ? hours[0] || '' : '';

        try {
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
              category: q.category,
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

          // Insert gallery photos (up to 3)
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

          // Insert tags
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
          totalPlacesInserted++;
          console.log(`     ✅ Inserted: ${name} [${q.category}] (ID: ${placeId})`);
        } catch (err: unknown) {
          await connection.rollback();
          const message = err instanceof Error ? err.message : String(err);
          if (message.includes('unique constraint')) {
            console.log(`     ⏭️  Already exists: ${name}`);
          } else {
            console.error(`     ❌ Error inserting ${name}:`, message);
          }
        }
      }

      // Throttle API requests
      await new Promise(r => setTimeout(r, 800));
    }
  }

  console.log(`\n==========================================`);
  console.log(`🎉 Seeding complete!`);
  console.log(`   Cities inserted: ${totalCitiesInserted}`);
  console.log(`   Places inserted: ${totalPlacesInserted}`);

  await connection.close();
  console.log('🔌 Oracle connection closed.');
}

main().catch(console.error);
