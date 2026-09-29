import { Router } from 'express';
import type { Pool } from 'pg';

import { getDashboard } from '../services/dashboard.service.js';

export function createDashboardRouter(pool: Pool) {
  const dashboardRouter = Router();

  dashboardRouter.get('/dashboard', async (_req, res, next) => {
    try {
      res.json(await getDashboard(pool));
    } catch (error) {
      next(error);
    }
  });

  return dashboardRouter;
}
