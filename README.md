# Staff Augmentation Sprint Dashboard

Local, read-only sprint dashboard using fictional data. The API and Vite server bind to loopback; no Jira connection or remote access is configured.

## Local setup

1. Add the PostgreSQL settings from `.env.example` to the root `.env` file without replacing any existing settings. Keep the password and `DATABASE_URL` values consistent; `.env` is ignored by Git.
2. Start PostgreSQL 15 with `docker compose up -d db` and wait until `docker compose ps` reports the database healthy.
3. Apply versioned migrations and atomically seed the fictional sprint with `npm run db:setup`.
4. Start the API with `npm run dev:api` and the web application with `npm run dev:web` in separate terminals.
5. Open `http://127.0.0.1:5173/`.

The API exposes `GET /api/v1/health` for readiness and `GET /api/v1/dashboard` for the complete sprint snapshot. No write endpoints are provided. Re-running `npm run db:setup` replaces only the dashboard fixture rows in one seed transaction.

## Verification

- `npm run build` builds the contracts package, API, and web application.
- `npm test` runs the domain metric and data-integrity tests.
- `npm run db:setup` applies pending SQL migrations and replaces the local fictional seed atomically.