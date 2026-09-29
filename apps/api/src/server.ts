import express from 'express';

import { dashboardRouter } from './routes/dashboard.route.js';
import { healthRouter } from './routes/health.route.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(express.json());
app.use('/api/v1', healthRouter);
app.use('/api/v1', dashboardRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Unexpected server error';
  res.status(500).json({ error: { code: 'DASHBOARD_DATA_INVALID', message } });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`API listening on http://127.0.0.1:${port}`);
});
