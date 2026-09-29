import { randomUUID } from 'node:crypto';
import express, { type ErrorRequestHandler } from 'express';
import type { Pool } from 'pg';
import type { ApiErrorResponse } from '@hello-genai/contracts';

import { createDashboardRouter } from './routes/dashboard.route.js';
import { createHealthRouter } from './routes/health.route.js';
import { DashboardError } from './services/dashboard.service.js';

export function createApp(pool: Pool) {
  const app = express();
  app.use(express.json());
  app.use((_req, res, next) => {
    res.locals.requestId = randomUUID();
    next();
  });
  app.use('/api/v1', createHealthRouter(pool));
  app.use('/api/v1', createDashboardRouter(pool));

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    const requestId = String(res.locals.requestId ?? 'unknown');
    const sendError = (status: number, code: string, message: string) => {
      const payload: ApiErrorResponse = { error: { code, message, requestId } };
      res.status(status).json(payload);
    };
    if (error instanceof DashboardError) {
      if (error.code === 'ACTIVE_SPRINT_NOT_FOUND') {
        sendError(404, error.code, 'No active sprint is configured.');
        return;
      }
      if (error.code === 'DATABASE_UNAVAILABLE') {
        sendError(503, error.code, 'Dashboard data is temporarily unavailable.');
        return;
      }
    }
    sendError(500, 'DASHBOARD_DATA_INVALID', 'Dashboard data could not be validated. Check the local seed and try again.');
  };

  app.use(errorHandler);
  return app;
}