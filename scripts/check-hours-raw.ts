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

  // Check what the actual values are - maybe empty strings or whitespace
  const res = await connection.execute(
    "SELECT name, operational_hours, LENGTH(operational_hours), price_range, LENGTH(price_range) FROM places WHERE ROWNUM <= 10",
    [],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  console.log("Raw data (first 10):");
  for (const row of res.rows as any[]) {
    console.log(`  ${row.NAME} | hours: [${row.OPERATIONAL_HOURS}] len=${row['LENGTH(OPERATIONAL_HOURS)']} | price: [${row.PRICE_RANGE}] len=${row['LENGTH(PRICE_RANGE)']}`);
  }

  // Check if seed-from-google fetched any hours
  const res2 = await connection.execute(
    "SELECT name, operational_hours, price_range FROM places WHERE operational_hours IS NOT NULL AND LENGTH(TRIM(operational_hours)) > 0 FETCH FIRST 5 ROWS ONLY"
  );
  console.log("\nPlaces with non-empty trimmed hours:", (res2.rows as any[]).length);
  
  // How many have google_place_id
  const res3 = await connection.execute(
    "SELECT COUNT(*) FROM places WHERE google_place_id IS NOT NULL AND google_place_id != ''"
  );
  console.log("Places with google_place_id:", (res3.rows as any[])[0][0]);

  await connection.close();
}
run();
