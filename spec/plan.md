# Implementation Plan: Staff Augmentation Sprint Dashboard

- **Feature**: `spec/specification.md`
- **Constitution**: `spec/constitution.md`
- **Clarification dispositions**: `spec/clarify.md`
- **Status**: Draft
- **Plan date**: 2026-09-28

## Goal

Deliver a PM-operated, loopback-only sprint dashboard using one fictional project, one team of 10 active members, and at most one active sprint. The local application consists of React/Vite, Express, and PostgreSQL 15 via Docker. It is read-only at runtime and does not connect to Jira.

## Current Repository Baseline

- Application directories exist under `apps/web`, `apps/api`, and `packages/contracts`.
- No package manifests, package lockfiles, Node version file, Docker Compose file, or database migration configuration were found during plan preparation.
- The static prototype at `work/jira-sprint-dashboard` is a visual reference only, not the target architecture.
- Exact runtime, dependency, and database image pins are required by the constitution but are not yet recorded.

## Phase 1: Backend Setup (Database and API Skeleton)

**Milestone M1: Local backend foundation boots**

### Work

- Before installing or implementing application dependencies, select exact compatible releases within the constitutional React 18.3.x, Vite 6.x, Node 22.x LTS, Express 5.x, PostgreSQL 15.x, Docker Engine, and Compose baselines. Record Node in `.node-version` or `.nvmrc`, exact JavaScript dependencies in manifests and a committed lockfile, and the PostgreSQL image tag/digest and container-tool versions in checked-in configuration. CI must verify the pins.
- Establish workspace manifests and scripts for `apps/api` and `packages/contracts`.
- Configure TypeScript, Node.js, Express 5, environment validation, and the backend structure required by `spec/constitution.md`.
- Add Docker Compose for PostgreSQL 15 with health checks and loopback-only exposure. Add the selected versioned migration tool and first schema migration.
- Implement atomic seed/reset for exactly one fictional project/team, 10 active team members, at most one active sprint, the four supported statuses, issues, scope changes, and daily burndown snapshots.
- Add the shared API contract for `GET /api/v1/health` and `GET /api/v1/dashboard`. The dashboard response schema includes project/team/sprint metadata, summary and pace metrics, scope changes, status aggregates, workload, burndown, and the complete issue set.
- Implement `GET /api/v1/health`; register the dashboard route and repository/service boundaries without returning placeholder or fabricated metrics before Phase 3.
- Bind Express to `127.0.0.1`; do not configure Jira credentials or external service adapters.

### Exit Criteria

- Exact toolchain pins are committed and CI verifies them.
- A clean database migrates and seeds atomically; invalid cardinality or inconsistent seed data fails without partial writes.
- The API health endpoint returns ready/not-ready as specified, and the dashboard route/contract/error types are defined.
- No live Jira credentials, remote bind address, or secret-encryption utility is introduced for mock-only mode.

## Phase 2: Frontend Setup (UI Skeleton and Routing)

**Milestone M2: Routed dashboard shell renders locally**

### Work

- Establish the React 18.3.x/Vite 6.x workspace in `apps/web` using the exact versions pinned in Phase 1.
- Configure Vite to proxy `/api` to Express; expose only the local route `/` and keep the development server on `127.0.0.1`.
- Create the application shell, dashboard route, shared layout, feature-owned `sprint-dashboard` structure, and API client using the shared contract in `packages/contracts`.
- Add the UI skeleton for the context header, summary area, burndown, status/blockers, team workload, and issue list. At this phase, use typed loading/skeleton states rather than inventing metric values.
- Add accessible primitives for labeled filters, status feedback, focus states, chart text alternatives, and responsive containers.
- Implement the API client response-schema validation and loading, no-active-sprint, empty-active-sprint, stale, and error state shells.

### Exit Criteria

- `/` renders and routing/build checks pass.
- The UI can call the API through the Vite proxy and safely represent loading/error states without placeholder metrics.
- Desktop/mobile layout shell and keyboard-accessible control patterns are in place.

## Phase 3: Feature Implementation (One Feature at a Time)

Each feature is a vertical slice: backend domain rules, API contract/response, React UI, and focused tests are completed together before starting the next feature. The active specification and `packages/contracts` remain the source of truth.

### Feature 3.1 - Sprint Summary, Scope, Pace, and Burndown

**Milestone M3.1: Summary metrics reconcile**

- Implement UTC weekday count, original/current scope, completed/remaining points, completion percentage, expected completed points, pace variance, freshness, and ideal/actual burndown services.
- Use `E/N`, two-decimal rounding, latest complete snapshot, and the exact rules in FR-003 through FR-009 and FR-022.
- Show original commitment, current scope, net changes, date/goal metadata, as-of/freshness, pace, and burndown in the UI.
- Test zero scope, zero estimates, boundaries, scope additions/removals, stale snapshots, and current snapshot reconciliation.

**Exit criteria**: API and UI values match deterministic fixtures; no stale, missing, or inconsistent value is presented as current fact.

### Feature 3.2 - Status, Blockers, Issue List, and Filters

**Milestone M3.2: Issue review workflow works**

- Implement the four allowed status groups, counts/points, flagged-only blocker rule, issue table, and combined client-side status/assignee/blocked filters.
- Keep issue summaries and priorities as display fields; only `flagged=true` determines blocked state. Priority `Blocker` does not imply blocked unless the feature spec is amended.
- Include the dated aggregate add/remove scope-change list; do not add issue-level scope reasons or description storage.
- Test unknown status rejection, unestimated/unassigned issues, empty filters, flagged vs unflagged, and all filter combinations.

**Exit criteria**: Filter results/counts reconcile with the complete sprint issue set; blocker state uses only the specified flag.

### Feature 3.3 - Ten-Person Workload

**Milestone M3.3: Workload is accurate and non-evaluative**

- Derive assigned, completed, and remaining points for all 10 active team members and a separate Unassigned group when needed.
- Display zero-point members and ensure workload is not ranked or described as utilization/performance.
- Test per-member totals against issues, including missing points, zero assignments, and unassigned work.

**Exit Criteria**: All ten members appear and aggregate workload equals the issue-derived totals without performance inferences.

## Phase 4: Integration and Testing

**Milestone M4: Local prototype acceptance complete**

### Work

- Integrate the complete API response with the routed React page and shared contract validation.
- Run the full Docker-backed startup, migration, atomic seed/reset, API, and browser workflow from a clean checkout.
- Exercise `GET /api/v1/health` and `GET /api/v1/dashboard`, including no active sprint (`404`), active-but-empty sprint (`200` with empty values), stale data, unavailable database (`503`), and invalid data (`500`).
- Run metric/domain tests, migration/seed tests, API contract/error tests, and browser tests for each user story and SC-001 through SC-011.
- Verify desktop and mobile viewports, keyboard-only operation, accessible chart text, WCAG 2.2 AA checks, page-level overflow, loopback binding, and absence of secrets/real user data.
- Document pinned tool versions, local start/stop/reset commands, endpoint contracts, fixture semantics, as-of/freshness behavior, and out-of-scope functionality.

### Exit Criteria

- All feature acceptance criteria pass on the exact pinned toolchain.
- A clean local setup is reproducible; the API/UI expose only the fictional single-sprint prototype.
- No live Jira, remote access, authentication, priority-based blocker inference, or production-scale claim is introduced.

## Cross-Phase Quality Gates

- Exact toolchain and image pins are a Phase 1 entry gate.
- Each vertical feature updates shared contracts and includes provider/consumer tests before the next feature begins.
- Database schema changes use versioned migrations; fixture replacement is validated and atomic.
- Metric calculations are tested independently from HTTP and React.
- API and UI errors must not expose SQL, secrets, stack traces, or real client/team data.
- Any feature outside the prototype boundaries requires a specification and clarification update before implementation.

## Requirement Traceability

| Plan phase | Specification coverage |
|---|---|
| Phase 1 | Constitution pinning and architecture; FR-018, FR-019, FR-023, FR-025, FR-026; SC-001, SC-010 |
| Phase 2 | UI Screens; FR-017, FR-021; accessibility and responsive requirements |
| Phase 3.1 | User Stories 1-2; FR-002 through FR-010, FR-020, FR-022; SC-002 through SC-004, SC-007 |
| Phase 3.2 | User Story 4; FR-011, FR-012, FR-015 through FR-017; SC-006 |
| Phase 3.3 | User Story 3; FR-013, FR-014; SC-005 |
| Phase 4 | User Story 5; FR-017 through FR-027; SC-001 through SC-011 |

## Resolved Scope Decisions

- Blocked state is derived only from the issue `flagged` field. `priority=Blocker` is not a blocker rule in the active specification.
- Phase one uses fictional data and no Jira credentials; AES-256-GCM secret encryption and `ENCRYPTION_SECRET` are not needed and are out of scope. If live credentials are introduced later, the specification and security design must be amended first.
- The API endpoint contract is `GET /api/v1/health` and `GET /api/v1/dashboard`; both are defined in `spec/specification.md` and `packages/contracts` is the implementation contract source.
- Shared hosting, auth, live Jira, pagination, and production scaling remain out of scope.