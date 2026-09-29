import { Router } from 'express';

import { getDashboardFixture } from '../dashboard.js';

export const dashboardRouter = Router();

dashboardRouter.get('/dashboard', (_req, res) => {
  res.json(getDashboardFixture());
});