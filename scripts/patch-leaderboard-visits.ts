import { oracledb } from '../lib/db';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });

    console.log('Connected to Oracle Database');

    // Disable trigger so XP doesn't double count
    await connection.execute(`ALTER TRIGGER trg_visit_after_insert DISABLE`);

    // Get all users
    const result = await connection.execute(`SELECT id, xp FROM users WHERE role = 'user'`, [], { outFormat: oracledb.OUT_FORMAT_ARRAY });
    const users: any[] = result.rows || [];

    // Get all places
    const placesResult = await connection.execute(`SELECT id FROM places`, [], { outFormat: oracledb.OUT_FORMAT_ARRAY });
    const places: any[] = placesResult.rows || [];

    if (places.length === 0) {
      console.log('No places found in DB');
      return;
    }

    // For each user, if they have XP but no visits
    for (const user of users) {
      const [userId, xp] = user;
      
      const visitsResult = await connection.execute(`SELECT COUNT(*) FROM user_visits WHERE user_id = :id`, [userId], { outFormat: oracledb.OUT_FORMAT_ARRAY });
      const visitCount = (visitsResult.rows as any[])?.[0]?.[0] || 0;

      if (visitCount === 0 && xp > 100) {
        // Calculate a reasonable number of visits, say XP / 150
        let visitsToAdd = Math.floor(xp / 150);
        if (visitsToAdd > 100) visitsToAdd = 100;
        if (visitsToAdd === 0) visitsToAdd = 1;

        console.log(`Adding ${visitsToAdd} visits for user ${userId} with XP ${xp}`);

        for (let i = 0; i < visitsToAdd; i++) {
          const randomPlaceId = places[Math.floor(Math.random() * places.length)][0];
          await connection.execute(
            `INSERT INTO user_visits (user_id, place_id) VALUES (:user_id, :place_id)`,
            [userId, randomPlaceId],
            { autoCommit: false }
          );
        }
      }
    }
    
    await connection.commit();
    console.log('Dummy visits added.');

  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.execute(`ALTER TRIGGER trg_visit_after_insert ENABLE`);
        console.log('Trigger re-enabled');
      } catch (e) {
        console.error('Failed to re-enable trigger', e);
      }
      await connection.close();
    }
  }
}

run();
