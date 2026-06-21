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

  console.log('Connected to Oracle Database');

  // Widen operational_hours from VARCHAR2(100) to VARCHAR2(1000)
  await connection.execute(`ALTER TABLE places MODIFY operational_hours VARCHAR2(1000)`);
  console.log('✅ Widened operational_hours to VARCHAR2(1000)');

  // Also widen website_url just in case
  await connection.execute(`ALTER TABLE places MODIFY website_url VARCHAR2(1000)`);
  console.log('✅ Widened website_url to VARCHAR2(1000)');

  await connection.close();
  console.log('Done.');
}
run();
