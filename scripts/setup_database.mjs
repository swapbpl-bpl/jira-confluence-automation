import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';
import pg from 'pg';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(rootDirectory, '.env') });
const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  process.stderr.write('DATABASE_URL must be configured in the repository .env file.\n');
  process.exit(1);
}
const pool = new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 3000 });

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  const migrationDirectory = path.join(rootDirectory, 'database', 'migrations');
  const migrations = (await readdir(migrationDirectory)).filter((name) => name.endsWith('.sql')).sort();

  for (const name of migrations) {
    const existing = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name]);
    if (existing.rowCount) continue;
    const sql = await readFile(path.join(migrationDirectory, name), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  const seed = await readFile(path.join(rootDirectory, 'database', 'seeds', '001_dashboard_seed.sql'), 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(seed);
    const validation = await client.query(`
      WITH scope AS (
        SELECT COALESCE(SUM(story_points), 0) AS points,
               COALESCE(SUM(story_points) FILTER (WHERE status = 'Done'), 0) AS completed
        FROM issues
        WHERE sprint_id = '33333333-3333-4333-8333-333333333333'
      ), changes AS (
        SELECT COALESCE(SUM(CASE WHEN direction = 'added' THEN points ELSE -points END), 0) AS net
        FROM sprint_scope_changes
        WHERE sprint_id = '33333333-3333-4333-8333-333333333333'
      ), latest_snapshot AS (
        SELECT actual_remaining_points
        FROM burndown_snapshots
        WHERE sprint_id = '33333333-3333-4333-8333-333333333333'
        ORDER BY snapshot_date DESC
        LIMIT 1
      )
      SELECT
        (SELECT COUNT(*) = 1 FROM projects) AS one_project,
        (SELECT COUNT(*) = 1 FROM teams) AS one_team,
        (SELECT COUNT(*) = 10 FROM team_members WHERE is_active = TRUE) AS ten_active_members,
        (SELECT COUNT(*) = 1 FROM sprints WHERE state = 'active') AS one_active_sprint,
        (SELECT points = (SELECT original_committed_points FROM sprints WHERE id = '33333333-3333-4333-8333-333333333333') + changes.net FROM scope CROSS JOIN changes) AS scope_reconciles,
        (SELECT actual_remaining_points = scope.points - scope.completed FROM latest_snapshot CROSS JOIN scope) AS latest_snapshot_reconciles,
        (SELECT as_of_at::date = (SELECT MAX(snapshot_date) FROM burndown_snapshots WHERE sprint_id = sprints.id)
         FROM sprints WHERE id = '33333333-3333-4333-8333-333333333333') AS as_of_reconciles
    `);
    const checks = validation.rows[0];
    if (!Object.values(checks).every((value) => value === true)) {
      throw new Error('Seed integrity validation failed.');
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  process.stdout.write('Database migrations and fictional dashboard seed applied.\n');
} catch (error) {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? ` (${String(error.code)})`
    : '';
  const message = error instanceof Error ? error.message : 'Unknown database setup error';
  process.stderr.write(`Database setup failed${code}: ${message}\n`);
  process.exitCode = 1;
} finally {
  await pool.end();
}