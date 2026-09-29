import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import type { Pool } from 'pg';

import { createApp } from '../apps/api/src/app.js';

async function requestWithPool(
  pool: Pool,
  path: string,
  callback: (response: Response) => Promise<void>,
): Promise<void> {
  const server = createApp(pool).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address() as AddressInfo;
  try {
    await callback(await fetch(`http://127.0.0.1:${address.port}${path}`));
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

test('health reports not ready when PostgreSQL is unavailable', async () => {
  const pool = {
    query: async () => { throw new Error('connection refused'); },
  } as unknown as Pool;

  await requestWithPool(pool, '/api/v1/health', async (response) => {
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { status: 'not_ready' });
  });
});

test('dashboard returns the specified active-sprint-not-found error', async () => {
  const client = {
    query: async (query: string) => {
      if (query.includes('FROM projects p')) {
        return {
          rowCount: 1,
          rows: [{ id: 'project-id', teamId: 'team-id', name: 'Example Project', type: 'Staff Augment', teamName: 'Example Team' }],
        };
      }
      if (query.includes('FROM teams ORDER BY')) {
        return { rowCount: 1, rows: [{ id: 'team-id', name: 'Example Team' }] };
      }
      if (query.includes('FROM sprints')) return { rowCount: 0, rows: [] };
      return { rowCount: 0, rows: [] };
    },
    release: () => undefined,
  };
  const pool = { connect: async () => client } as unknown as Pool;

  await requestWithPool(pool, '/api/v1/dashboard', async (response) => {
    assert.equal(response.status, 404);
    const payload = await response.json() as { error: { code: string; message: string; requestId: string } };
    assert.equal(payload.error.code, 'ACTIVE_SPRINT_NOT_FOUND');
    assert.equal(payload.error.message, 'No active sprint is configured.');
    assert.ok(payload.error.requestId.length > 0);
  });
});

test('dashboard returns a safe retryable error when the database connection fails', async () => {
  const pool = { connect: async () => { throw new Error('connection details should not escape'); } } as unknown as Pool;

  await requestWithPool(pool, '/api/v1/dashboard', async (response) => {
    assert.equal(response.status, 503);
    const payload = await response.json() as { error: { code: string; message: string; requestId: string } };
    assert.equal(payload.error.code, 'DATABASE_UNAVAILABLE');
    assert.equal(payload.error.message, 'Dashboard data is temporarily unavailable.');
    assert.ok(payload.error.requestId.length > 0);
    assert.equal(JSON.stringify(payload).includes('connection details'), false);
  });
});