import { Pool } from 'pg';
import { runMigrations } from './migrationRunner';

/**
 * Run migrations using the versioned SQL migration workflow.
 */
export async function runDevMigrations(pool: Pool | null): Promise<void> {
  await runMigrations(pool);
}

