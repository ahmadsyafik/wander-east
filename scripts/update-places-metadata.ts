import { config } from 'dotenv';
import path from 'path';
// Load .env.local
config({ path: path.join(__dirname, '../.env.local') });

import fs from 'fs';
import { execute, query } from '../lib/db';

async function updateMetadata() {
  const dataPath = path.join(__dirname, 'data/place_updates.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  let updatedCount = 0;
  let notFoundCount = 0;

  console.log(`Starting update for ${data.length} places...`);

  // Fetch all places to match by name
  const dbPlaces = await query<{ ID: number; NAME: string }>('SELECT id, name FROM places');
  console.log(`Found ${dbPlaces.length} places in DB.`);

  for (const item of data) {
    if (!item.name) continue;

    // Normalize strings for matching
    const targetName = item.name.toLowerCase().trim();

    // 1. Exact match
    let matchedPlace = dbPlaces.find(p => p.NAME.toLowerCase().trim() === targetName);
    
    // 2. Partial match (ignoring extra quotes, spaces, etc)
    if (!matchedPlace) {
      const cleanTarget = targetName.replace(/["'()]/g, '');
      matchedPlace = dbPlaces.find(p => {
        const cleanDbName = p.NAME.toLowerCase().trim().replace(/["'()]/g, '');
        return cleanDbName.includes(cleanTarget) || cleanTarget.includes(cleanDbName);
      });
    }

    if (matchedPlace) {
      try {
        await execute(`
          UPDATE places 
          SET operational_hours = :hours, 
              price_range = :price, 
              instagram_url = :instagram, 
              website_url = :website, 
              video_url = :video
          WHERE id = :id
        `, {
          hours: item.hours ? item.hours.substring(0, 100) : null,
          price: item.price ? item.price.substring(0, 100) : null,
          instagram: item.instagram ? item.instagram.substring(0, 500) : null,
          website: item.website ? item.website.substring(0, 500) : null,
          video: item.video ? item.video.substring(0, 500) : null,
          id: matchedPlace.ID
        });
        updatedCount++;
        // console.log(`[SUCCESS] Updated ${matchedPlace.NAME}`);
      } catch (e) {
        console.error(`[ERROR] Updating ${matchedPlace.NAME}:`, e);
      }
    } else {
      console.warn(`[NOT FOUND] No match in DB for: ${item.name}`);
      notFoundCount++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Total processed: ${data.length}`);
  console.log(`Successfully updated: ${updatedCount}`);
  console.log(`Not Found in DB: ${notFoundCount}`);
  
  process.exit(0);
}

updateMetadata().catch(err => {
  console.error(err);
  process.exit(1);
});
