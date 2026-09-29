# Checklist Disposition

- **Specification**: [specification.md](specification.md)
- **Reviewed**: 2026-09-29
- **Result**: Every phase-one functional requirement has been implemented and checked against the local fictional PostgreSQL snapshot. No known in-scope implementation blocker remains.

## Functional Requirements

| ID | Disposition | Implementation / verification |
|---|---|---|
| FR-001 | Resolved | The seed runner validates exactly one project/team, 10 active members, and one active sprint; the API rejects invalid counts. A partial unique index prevents multiple active sprints per project. |
| FR-002 | Resolved | Dashboard context displays project/type, team/size, sprint/key/goal/date range, and UTC as-of/freshness in [SprintDashboard.tsx](../apps/web/src/features/sprint-dashboard/SprintDashboard.tsx). |
| FR-003 | Resolved | Summary shows baseline, current/net scope, completed/remaining, completion, elapsed/total/remaining workdays, expected completed points, and pace variance. |
| FR-004 | Resolved | [dashboard.service.ts](../apps/api/src/services/dashboard.service.ts) derives scope and completion from issue estimates, excludes null estimates, and validates remaining-point consistency. |
| FR-005 | Resolved | Completion percentage uses PostgreSQL `ROUND(..., 2)` and is `null` for zero scope; UI renders `Unavailable`. |
| FR-006 | Resolved | Kickoff commitment is stored separately; the seed contains only fixed kickoff estimates and add/remove events. The API is read-only. |
| FR-007 | Resolved | UTC weekday calculations use inclusive sprint bounds; the chart derives the ideal line and includes the virtual day-zero baseline. Weekend, missing, and out-of-period snapshots are rejected. |
| FR-008 | Resolved | Actual points come only from dated database snapshots. Every working day through `asOf` is required and the latest actual must reconcile with current remaining points; invalid data returns `DASHBOARD_DATA_INVALID`. |
| FR-009 | Resolved | Expected points and variance are derived from original commitment and elapsed/total working days; the UI describes pace as a directional signal, not a prediction. |
| FR-010 | Resolved | Unestimated issue count remains visible, null estimates are excluded from totals, and the issue table labels each as `Unestimated`. |
| FR-011 | Resolved | API derives all four status rows, including zero rows, from the current issue set; UI presents counts and point totals. |
| FR-012 | Resolved | The database constrains supported statuses; blocker state comes only from `flagged`, with no summary-text inference. |
| FR-013 | Resolved | Workload is derived per issue for all 10 active members, including zero-point members; unassigned points appear separately only when present. |
| FR-014 | Resolved | Workload is labeled as context and not as utilization, performance, ranking, or over-allocation. |
| FR-015 | Resolved | Issue table includes key, summary, assignee, status, priority, points, and explicit flagged state. |
| FR-016 | Resolved | Status, assignee, and blocked-only controls combine with AND semantics, update the count, support clearing, and show a zero-result empty state. Combined filters and keyboard status selection were exercised in the browser. |
| FR-017 | Resolved | UI provides loading, loaded, stale, no-active-sprint, empty-active-sprint, empty-filter, invalid-data, and retryable error states. |
| FR-018 | Resolved | Browser obtains dashboard data only through the Express API and validates it with the shared runtime contract. |
| FR-019 | Resolved | Express exposes read-only GET routes backed by PostgreSQL; no sprint or issue write route exists. |
| FR-020 | Resolved | Repository reads and domain calculations run in one PostgreSQL `REPEATABLE READ READ ONLY` transaction. |
| FR-021 | Resolved | Shared request/response types and runtime guards are in [packages/contracts/src/index.ts](../packages/contracts/src/index.ts); API validates before responding and the browser validates before rendering. Safe errors include a request ID and no SQL details. |
| FR-022 | Resolved | `asOf` comes from the persisted snapshot timestamp; freshness is computed against the fixed 24-hour threshold. There is no refresh endpoint. |
| FR-023 | Resolved | API reads the sole configured project and active sprint, returns `404 ACTIVE_SPRINT_NOT_FOUND` when absent, and returns an empty issue set for a valid empty sprint. |
| FR-024 | Resolved | One database query returns the complete active-sprint issue set; filtering is client-side. |
| FR-025 | Resolved | API and Vite bind to `127.0.0.1`; desktop/mobile browser checks used loopback. |
| FR-026 | Resolved | Health executes `SELECT 1`, returning `200 {"status":"ready"}` or safe `503 {"status":"not_ready"}`. UI does not use it as a preflight. Both responses are covered by API tests. |
| FR-027 | Resolved | Manual Retry is available only for network failures and HTTP 503. No automatic retry occurs; 404 maps to no active sprint and invalid-data errors are non-retryable. |

## Stories And Success Criteria

| Area | Disposition | Evidence |
|---|---|---|
| User Story 1: Active sprint overview | Resolved | Context, metrics, loading, empty-sprint and no-sprint states are present; live seed page was checked. |
| User Story 2: Pace and scope movement | Resolved | Derived baseline/scope/pace, dated changes, daily actual snapshots, and textual chart description are present and internally validated. |
| User Story 3: Team workload | Resolved | All 10 members and the unassigned group reconcile to issue data; no ranking or utilization inference is shown. |
| User Story 4: Issues, statuses, blockers | Resolved | Full issue table and all three combinable filters work, including zero results and a flagged-vs-summary-text fixture. |
| User Story 5: Data/service recovery | Resolved | Loading, stale, safe errors, no-sprint state, and user-triggered retry are implemented; mocked 503 retry/recovery was exercised in the browser. |
| SC-001 | Resolved | [README.md](../README.md) documents PostgreSQL, migrations/seed, API/web startup, and validation commands. |
| SC-002 | Resolved | Live response reconciles to 78 scope, 42 completed, 36 remaining, 53.85%, and the latest 36-point snapshot. |
| SC-003 | Resolved | UI shows the original 72-point baseline, current 78-point scope, and dated +6-point scope event. |
| SC-004 | Resolved | Chart renders actual end-of-day snapshots and ideal original-baseline pace; service rejects missing or inconsistent snapshots. |
| SC-005 | Resolved | Live UI displays all 10 members and the separate 2-point unassigned group. |
| SC-006 | Resolved | Combined filters, counts, empty state, and keyboard operation were browser-tested. |
| SC-007 | Resolved | Safe API errors, stale label, no fabricated metrics, and retry policy are implemented; boundary tests cover service failures. |
| SC-008 | Resolved | Browser checks at 1425px and 375px showed no page overflow; chart, controls, and contained table scrolling rendered and operated. |
| SC-009 | Resolved | Eight automated tests cover metrics, zero scope, scope/snapshot integrity, readiness, no-active-sprint, and safe database errors. Seed setup also validates fixture consistency transactionally. |
| SC-010 | Resolved | Loopback listeners, live health response, and user-only retry behavior were verified. |
| SC-011 | Resolved | Axe WCAG 2.0/2.1/2.2 A/AA scan reported zero violations at desktop and mobile; visible focus, keyboard filters, named chart, and focusable scroll regions are present. |

## Non-Functional Requirements

| Area | Disposition | Evidence |
|---|---|---|
| Stack, pins, reproducibility | Resolved | Exact Node/npm/React/Vite/Express/PostgreSQL pins and lockfile are used; root commands build contracts and the setup runner applies ordered SQL migrations. |
| Data security | Resolved | Browser has no database/Jira access; DB URL is required via ignored `.env` or environment, Compose requires a local password, and only fictional seed data is committed. |
| Accessibility | Resolved | Axe scan found zero WCAG A/AA violations at desktop/mobile; keyboard focus and text alternatives are included. |
| Responsive layout | Resolved | No page-level overflow at 1425px or 375px; wide tables/chart scroll within named focusable regions. |
| Reliability | Resolved | Repeatable-read transaction, seed integrity gate, response validation, deterministic errors, and zero/missing-estimate behavior are implemented. |
| Maintainability | Resolved | Persistence, metric service, routes, contracts, app shell, and sprint feature have separate ownership boundaries. |

## Out Of Scope

These are intentional phase-one exclusions, not open implementation gaps: live Jira connectivity or credentials; authentication/authorization; remote or public hosting; issue creation/editing/transitions; multiple projects/teams or sprint selectors; pagination and production-scale/load guarantees; roster administration; notifications or forecast guarantees; time tracking, utilization, performance ranking, or over-allocation claims.

## Nice To Have

- Add persistent Playwright/Axe browser regression tests to CI; current filter, retry, viewport, and accessibility checks were run in the browser during this review.
- Repeat manual assistive-technology testing with screen readers and zoom settings; automated WCAG scan and keyboard checks currently pass.

## Verification Run

- `npm run build` — passed for contracts, API, and web.
- `npm test` — 8 passed, 0 failed.
- `npm run db:setup` — migrations and seed applied; transaction integrity checks passed.
- Live health — `200 {"status":"ready"}`.
- Live dashboard — `currentScope=78`, `completed=42`, `remaining=36`, `issues=11`, `workload=11`, `freshness=current`.
- Browser — combined filter returned the flagged unassigned issue; empty-filter returned `0 of 11`; keyboard status selection and mocked 503 retry/recovery passed.
- Axe WCAG A/AA — 0 violations at desktop and mobile. Page overflow — none at either viewport.