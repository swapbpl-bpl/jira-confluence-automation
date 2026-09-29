import { databasePool } from './config/database.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 4000);
const app = createApp(databasePool);

app.listen(port, '127.0.0.1', () => {
  console.log(`API listening on http://127.0.0.1:${port}`);
});