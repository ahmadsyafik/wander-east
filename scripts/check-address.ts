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
  const res = await connection.execute('SELECT id, name, address FROM places FETCH FIRST 5 ROWS ONLY');
  console.log(res.rows);
  await connection.close();
}
run();
