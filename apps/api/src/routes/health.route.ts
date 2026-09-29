import { Router } from 'express';
import type { Pool } from 'pg';

export function createHealthRouter(pool: Pool) {
  const healthRouter = Router();

  healthRouter.get('/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'not_ready' });
    }
  });

  return healthRouter;
}
