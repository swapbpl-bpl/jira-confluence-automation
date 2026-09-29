# QA Report

Date: 2026-09-29
Application: Staff Augmentation Sprint Dashboard
Environment: Windows, Chrome 154, local development services

## Executive Summary

The application is operational after repairing local PostgreSQL authentication. The dashboard now loads successfully, the primary issue filter works, and the browser console is clean. No form-submission workflow exists in the current application; it is a read-only dashboard with client-side filters.

## Pages Visited

- `http://127.0.0.1:5177/` - Staff Augmentation Sprint Dashboard
- `http://127.0.0.1:4000/api/v1/dashboard` - backend dashboard API

The frontend used port `5177` because ports `5173` through `5176` were already occupied.

## Test Coverage

### Application startup

- Started PostgreSQL with Docker Compose on `127.0.0.1:5432`.
- Started the backend on `http://127.0.0.1:4000`.
- Started the Vite frontend on `http://127.0.0.1:5177/`.
- Verified PostgreSQL became healthy.
- Verified the dashboard API returned HTTP `200` with a dashboard payload.

### Starting page

- Opened the dashboard in Chrome through the Chrome DevTools MCP connection.
- Verified the page displayed:
  - Staff Augment Project
  - Sprint 24 / TEAM-24
  - Sprint summary metrics
  - Burndown chart
  - Status and blockers summary
  - Workload table
  - Scope changes
  - Sprint issue table

### Elements tested

- `Blocked only` checkbox:
  - Before interaction: `11 of 11 issues`.
  - After interaction: `1 of 11 issues`.
  - Filtered result: `TEAM-103`, the flagged environment blocker.
- Status and assignee comboboxes were present and exposed expected options.
- `Clear filters` button was present.

### Forms and submit flow

No required form fields or submit button are present in the current application. The available workflow is read-only dashboard inspection and filtering, so no form submission could be performed.

### Browser diagnostics

- Dashboard request: HTTP `200`.
- No JavaScript errors or warnings in the Chrome console after the fix.
- No failed fetch/XHR requests after the fix.

## Bugs Found

### DATABASE_UNAVAILABLE

Initial dashboard loads displayed `Dashboard unavailable`. The request to `/api/v1/dashboard` returned HTTP `503` with error code `DATABASE_UNAVAILABLE`.

Root cause: the existing PostgreSQL Docker volume had been initialized with a different `app_user` password than the password in the repository `.env` file. The database container itself was healthy, and the schema and seed data were present.

## Fixes Applied

- Synchronized the local PostgreSQL `app_user` password with the repository `.env` value.
- Ran `npm run db:setup` successfully.
- Confirmed migrations and the fictional dashboard seed passed validation.
- Rechecked the backend endpoint and refreshed the dashboard in Chrome.

No application source code changes were required for the database issue.

## Current Status

PASS with limitation.

- Backend: running on port `4000`.
- Frontend: running on port `5177`.
- PostgreSQL: healthy on port `5432`.
- Dashboard API: HTTP `200`.
- Main dashboard: renders successfully.
- Issue filtering: verified successfully.
- Browser console: no errors or warnings.
- Form submission: not applicable; no form or submit workflow exists.

## Residual Risk

The local database password is persisted in the Docker volume and must remain consistent with the ignored repository `.env` file. A newly initialized environment should copy the database settings from `.env.example` before starting Docker Compose.
