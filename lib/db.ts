import oracledb from 'oracledb';

// Fetch CLOBs as Strings to avoid circular JSON errors with Lob objects
oracledb.fetchAsString = [oracledb.CLOB];

// Use Thin mode (pure JavaScript, no Oracle Client needed)
// This is the default in oracledb 6+

const globalForDb = globalThis as unknown as {
  oraclePool: oracledb.Pool | undefined;
};

export async function getPool(): Promise<oracledb.Pool> {
  if (!globalForDb.oraclePool) {
    try {
      globalForDb.oraclePool = await oracledb.createPool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECTION_STRING,
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 1,
      });
      console.log('[Oracle] Connection pool created successfully');
    } catch (err) {
      console.error('[Oracle] Failed to create connection pool:', err);
      throw err;
    }
  }
  return globalForDb.oraclePool;
}

/**
 * Execute a query and return results as an array of objects.
 * Automatically handles connection acquisition and release.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  binds: oracledb.BindParameters = {},
  options: oracledb.ExecuteOptions = {}
): Promise<T[]> {
  let connection: oracledb.Connection | undefined;
  try {
    const pool = await getPool();
    connection = await pool.getConnection();

    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...options,
    });

    return (result.rows as T[]) || [];
  } catch (err) {
    console.error('[Oracle] Query error:', err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('[Oracle] Error closing connection:', err);
      }
    }
  }
}

/**
 * Execute a DML statement (INSERT, UPDATE, DELETE) and return the result.
 * Supports RETURNING INTO clause via outBinds.
 */
export async function execute(
  sql: string,
  binds: oracledb.BindParameters = {},
  options: oracledb.ExecuteOptions = {}
): Promise<oracledb.Result<unknown>> {
  let connection: oracledb.Connection | undefined;
  try {
    const pool = await getPool();
    connection = await pool.getConnection();

    const result = await connection.execute(sql, binds, {
      autoCommit: true,
      ...options,
    });

    return result;
  } catch (err) {
    console.error('[Oracle] Execute error:', err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('[Oracle] Error closing connection:', err);
      }
    }
  }
}

/**
 * Execute a PL/SQL procedure.
 */
export async function callProcedure(
  sql: string,
  binds: oracledb.BindParameters = {}
): Promise<oracledb.Result<unknown>> {
  return execute(sql, binds);
}

// Re-export oracledb for type access
export { oracledb };
