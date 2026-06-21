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

  const total = await connection.execute("SELECT COUNT(*) FROM places");
  console.log("Total places:", (total.rows as any[])[0][0]);

  const checks = [
    ["operational_hours IS NULL OR operational_hours = ''", "Missing operational_hours"],
    ["price_range IS NULL OR price_range = ''", "Missing price_range"],
    ["estimated_duration IS NULL OR estimated_duration = ''", "Missing estimated_duration"],
    ["difficulty IS NULL OR difficulty = ''", "Missing difficulty"],
    ["long_description IS NULL", "Missing long_description"],
    ["address IS NULL OR address = ''", "Missing address"],
    ["latitude IS NULL OR latitude = 0", "Missing coordinates"],
    ["operational_hours IS NOT NULL AND operational_hours != ''", "HAS operational_hours"],
    ["price_range IS NOT NULL AND price_range != ''", "HAS price_range"],
  ];

  for (const [cond, label] of checks) {
    const res = await connection.execute(`SELECT COUNT(*) FROM places WHERE ${cond}`);
    console.log(`${label}: ${(res.rows as any[])[0][0]}`);
  }

  // Sample a few places with hours
  const sample = await connection.execute(
    "SELECT name, operational_hours, price_range FROM places WHERE operational_hours IS NOT NULL AND operational_hours != '' FETCH FIRST 5 ROWS ONLY"
  );
  console.log("\nSample places WITH hours:");
  for (const row of sample.rows as any[]) {
    console.log(`  ${row[0]} | hours: ${row[1]} | price: ${row[2]}`);
  }

  // Sample a few places WITHOUT hours
  const sample2 = await connection.execute(
    "SELECT name, operational_hours, price_range FROM places WHERE operational_hours IS NULL OR operational_hours = '' FETCH FIRST 5 ROWS ONLY"
  );
  console.log("\nSample places WITHOUT hours:");
  for (const row of sample2.rows as any[]) {
    console.log(`  ${row[0]} | hours: ${row[1]} | price: ${row[2]}`);
  }

  await connection.close();
}
run();
