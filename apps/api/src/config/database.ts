import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';
import pg from 'pg';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
dotenv.config({ path: path.join(repositoryRoot, '.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL must be configured in the repository .env file.');
}

const { Pool } = pg;

export const databasePool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 10000,
  max: 5,
});