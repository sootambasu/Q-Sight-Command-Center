import { Pool } from 'pg';
import { config } from './config';

let pool: Pool | null = null;

if (!config.databaseUrl) {
  console.warn('⚠️ WARNING: DATABASE_URL is not configured. Database features will be unavailable.');
} else {
  try {
    pool = new Pool({
      connectionString: config.databaseUrl,
      // Default connection limits can be configured here if necessary
    });

    pool.on('error', (err) => {
      console.error('⚠️ Unexpected error on idle PostgreSQL client:', err);
    });
  } catch (error) {
    console.error('⚠️ Failed to initialize PostgreSQL Pool:', error);
    pool = null;
  }
}

export { pool };
export default pool;
