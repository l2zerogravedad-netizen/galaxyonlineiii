import { Pool, PoolClient } from 'pg';
import { logger } from '@/utils/logger';

let pool: Pool;
let isConnected: boolean = false;

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  min: number;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

const getDatabaseConfig = (): DatabaseConfig => {
  return {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432'),
    database: process.env['DB_NAME'] || 'destock_space_common',
    user: process.env['DB_USER'] || 'destock_user',
    password: process.env['DB_PASSWORD'] || '',
    ssl: process.env['DB_SSL'] === 'true',
    min: parseInt(process.env['DB_POOL_MIN'] || '2'),
    max: parseInt(process.env['DB_POOL_MAX'] || '10'),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
};

export const connectDatabase = async (): Promise<void> => {
  try {
    const config = getDatabaseConfig();
    
    pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      min: config.min,
      max: config.max,
      idleTimeoutMillis: config.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionTimeoutMillis,
    });

    // Test the connection
    const client = await pool.connect();
    
    // Verify database version and basic connectivity
    const result = await client.query('SELECT version()');
    logger.info('Database connected successfully:', {
      version: result.rows[0].version,
      host: config.host,
      database: config.database
    });
    
    client.release();
    isConnected = true;

    // Handle pool errors
    pool.on('error', (err: Error) => {
      logger.error('Database pool error:', err);
      isConnected = false;
    });

    pool.on('connect', (client) => {
      logger.debug('New database client connected');
    });

    pool.on('remove', (client) => {
      logger.debug('Database client removed');
    });

  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
};

export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDatabase() first.');
  }
  return pool;
};

export const getConnection = async (): Promise<PoolClient> => {
  if (!isConnected) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    logger.error('Failed to get database connection:', error);
    throw error;
  }
};

export const executeQuery = async <T = any>(
  query: string, 
  params?: any[]
): Promise<T[]> => {
  const client = await getConnection();
  
  try {
    const start = Date.now();
    const result = await client.query(query, params);
    const duration = Date.now() - start;
    
    logger.debug('Query executed:', {
      query: query.substring(0, 100),
      params: params?.length || 0,
      rowCount: result.rowCount,
      duration: `${duration}ms`
    });
    
    return result.rows as T[];
  } catch (error) {
    logger.error('Query execution failed:', {
      query: query.substring(0, 100),
      params: params?.length || 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  } finally {
    client.release();
  }
};

export const executeQueryWithTransaction = async <T = any>(
  queries: Array<{ query: string; params?: any[] }>
): Promise<T[]> => {
  const client = await getConnection();
  
  try {
    await client.query('BEGIN');
    
    const results: T[] = [];
    
    for (const { query, params } of queries) {
      const result = await client.query(query, params);
      results.push(result.rows);
    }
    
    await client.query('COMMIT');
    
    logger.debug('Transaction executed successfully:', {
      queryCount: queries.length,
      totalRows: results.reduce((sum, rows) => sum + rows.length, 0)
    });
    
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const executeSingleRowQuery = async <T = any>(
  query: string, 
  params?: any[]
): Promise<T | null> => {
  const rows = await executeQuery<T>(query, params);
  return rows.length > 0 ? rows[0] : null;
};

export const executeInsertQuery = async (
  table: string,
  data: Record<string, any>,
  returning?: string[]
): Promise<any> => {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
  
  const query = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
    ${returning ? `RETURNING ${returning.join(', ')}` : ''}
  `;
  
  const result = await executeQuery(query, values);
  return returning ? result[0] : result;
};

export const executeUpdateQuery = async (
  table: string,
  data: Record<string, any>,
  where: string,
  whereParams?: any[],
  returning?: string[]
): Promise<any> => {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
  
  const queryParams = [...values];
  const whereClauseParams = whereParams || [];
  
  const query = `
    UPDATE ${table}
    SET ${setClause}
    WHERE ${where}
    ${returning ? `RETURNING ${returning.join(', ')}` : ''}
  `;
  
  const result = await executeQuery(query, [...queryParams, ...whereClauseParams]);
  return returning ? result[0] : result;
};

export const executeDeleteQuery = async (
  table: string,
  where: string,
  whereParams?: any[],
  returning?: string[]
): Promise<any> => {
  const queryParams = whereParams || [];
  
  const query = `
    DELETE FROM ${table}
    WHERE ${where}
    ${returning ? `RETURNING ${returning.join(', ')}` : ''}
  `;
  
  const result = await executeQuery(query, queryParams);
  return returning ? result[0] : result;
};

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const result = await executeQuery('SELECT 1 as health_check');
    return result.length > 0;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

export const getDatabaseStats = async (): Promise<any> => {
  try {
    const pool = getPool();
    const totalCount = pool.totalCount;
    const idleCount = pool.idleCount;
    const waitingCount = pool.waitingCount;
    
    const tableStats = await executeQuery(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples
      FROM pg_stat_user_tables
      ORDER BY n_live_tup DESC
      LIMIT 10
    `);
    
    return {
      pool: {
        totalCount,
        idleCount,
        waitingCount
      },
      tables: tableStats
    };
  } catch (error) {
    logger.error('Failed to get database stats:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    if (pool) {
      await pool.end();
      isConnected = false;
      logger.info('Database connections closed');
    }
  } catch (error) {
    logger.error('Error closing database connections:', error);
    throw error;
  }
};

// Database migration helper
export const runMigration = async (migrationName: string, migrationSQL: string): Promise<void> => {
  try {
    // Check if migration already exists
    const existingMigration = await executeSingleRowQuery(
      'SELECT * FROM schema_migrations WHERE name = $1',
      [migrationName]
    );
    
    if (existingMigration) {
      logger.info(`Migration ${migrationName} already applied`);
      return;
    }
    
    // Create schema_migrations table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Run migration
    await executeQueryWithTransaction([
      { query: migrationSQL },
      { 
        query: 'INSERT INTO schema_migrations (name) VALUES ($1)', 
        params: [migrationName] 
      }
    ]);
    
    logger.info(`Migration ${migrationName} applied successfully`);
  } catch (error) {
    logger.error(`Migration ${migrationName} failed:`, error);
    throw error;
  }
};

// Database seeding helper
export const runSeed = async (seedName: string, seedSQL: string): Promise<void> => {
  try {
    // Check if seed already exists
    const existingSeed = await executeSingleRowQuery(
      'SELECT * FROM seed_history WHERE name = $1',
      [seedName]
    );
    
    if (existingSeed) {
      logger.info(`Seed ${seedName} already applied`);
      return;
    }
    
    // Create seed_history table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS seed_history (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Run seed
    await executeQueryWithTransaction([
      { query: seedSQL },
      { 
        query: 'INSERT INTO seed_history (name) VALUES ($1)', 
        params: [seedName] 
      }
    ]);
    
    logger.info(`Seed ${seedName} applied successfully`);
  } catch (error) {
    logger.error(`Seed ${seedName} failed:`, error);
    throw error;
  }
};

export default {
  connectDatabase,
  getPool,
  getConnection,
  executeQuery,
  executeQueryWithTransaction,
  executeSingleRowQuery,
  executeInsertQuery,
  executeUpdateQuery,
  executeDeleteQuery,
  checkDatabaseHealth,
  getDatabaseStats,
  closeDatabase,
  runMigration,
  runSeed
};
