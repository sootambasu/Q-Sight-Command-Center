import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

export async function runMigrations(pool: Pool | null): Promise<void> {
  if (!pool) {
    console.warn('⚠️ Migrations: Database pool is not active. Skipping migrations.');
    return;
  }

  console.log('🔄 Initializing database migration runner...');

  try {
    // 1. Create schema_migrations table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    // 2. Locate the migrations directory (handle both src and dist runtimes)
    let migrationsDir = path.resolve(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      migrationsDir = path.resolve(__dirname, '../../src/db/migrations');
    }

    if (!fs.existsSync(migrationsDir)) {
      console.warn(`⚠️ Migrations: Migrations directory not found at ${migrationsDir}. Skipping.`);
      return;
    }

    // 3. Read and sort migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📂 Found ${files.length} migration files in ${migrationsDir}`);

    // 4. Query already applied migrations
    const { rows } = await pool.query('SELECT version FROM schema_migrations;');
    const appliedVersions = new Set(rows.map((row: any) => row.version));

    // 5. Apply migrations sequentially
    for (const file of files) {
      if (appliedVersions.has(file)) {
        // Already applied, skip
        continue;
      }

      console.log(`⚙️ Applying database migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Start transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN;');
        
        // Execute the SQL
        if (sql.trim().length > 0) {
          await client.query(sql);
        }

        // Record migration as applied
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1);', [file]);
        
        await client.query('COMMIT;');
        console.log(`✅ Successfully applied migration: ${file}`);
      } catch (err: any) {
        await client.query('ROLLBACK;');
        console.error(`❌ Failed to apply migration ${file}:`, err.message || err);
        throw err; // Fail-fast and crash startup in pilot if a migration fails
      } finally {
        client.release();
      }
    }

    console.log('✅ All database migrations up to date.');
  } catch (error: any) {
    console.error('❌ Migration Runner error:', error.message || error);
    throw error;
  }
}
