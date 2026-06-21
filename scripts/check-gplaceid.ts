import oracledb from 'oracledb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const connection = await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION_STRING,
  });

  // Check raw google_place_id values
  const res = await connection.execute(
    "SELECT name, google_place_id, LENGTH(google_place_id) FROM places FETCH FIRST 10 ROWS ONLY"
  );
  console.log("google_place_id samples:");
  for (const row of res.rows as any[]) {
    console.log(`  ${row[0]} | gid: [${row[1]}] len=${row[2]}`);
  }

  // Count places from seed-new-cities (the new ones)
  const res2 = await connection.execute(
    "SELECT name, google_place_id FROM places WHERE google_place_id LIKE 'ChIJ%' FETCH FIRST 5 ROWS ONLY"
  );
  console.log("\nPlaces with ChIJ prefix:", (res2.rows as any[]).length);
  for (const row of res2.rows as any[]) {
    console.log(`  ${row[0]} | gid: ${row[1]}`);
  }

  // Count by pattern
  const res3 = await connection.execute("SELECT COUNT(*) FROM places WHERE google_place_id IS NOT NULL AND LENGTH(TRIM(google_place_id)) > 0");
  console.log("\nTotal with google_place_id:", (res3.rows as any[])[0][0]);

  // Count ops hours
  const res4 = await connection.execute("SELECT COUNT(*) FROM places WHERE operational_hours IS NOT NULL AND LENGTH(TRIM(operational_hours)) > 0");
  console.log("Total with operational_hours:", (res4.rows as any[])[0][0]);

  await connection.close();
}
run();
