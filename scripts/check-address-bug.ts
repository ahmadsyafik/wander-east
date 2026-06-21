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
  const res = await connection.execute("SELECT COUNT(*) as cnt FROM places WHERE address LIKE '%Jalan Ikan Seliding%'");
  console.log('Places with that address:', res.rows);

  const res2 = await connection.execute("SELECT name, address FROM places WHERE name LIKE '%Pelangi%'");
  console.log('Pelangi place:', res2.rows);

  await connection.close();
}
run();
