# Implementation Tasks: Staff Augmentation Sprint Dashboard

- **Plan**: `spec/plan.md`
- **Specification**: `spec/specification.md`
- **Constitution**: `spec/constitution.md`
- **Status**: Draft
- **Task status convention**: All tasks begin as `Not started`.

## Task Rules

- Task IDs are stable; append new IDs rather than reusing completed IDs.
- A task is complete only when every listed acceptance criterion is met and relevant test evidence is recorded.
- Tasks within Phase 3 are vertical feature slices. Complete the domain/API/UI/tests for one feature before starting the next feature.
- Do not start application implementation until T001 exact-version pins are committed and verified.
- Keep the prototype loopback-only and fictional-data-only. Do not add live Jira, authentication, remote hosting, or credentials.
- Blocked state is derived only from `flagged`; priority `Blocker` is not a blocker rule. AES secret encryption is not needed for mock-only phase one.

## Phase 1: Backend Setup (Database and API Skeleton)

### T001 - Pin the required toolchain

- **Description**: Select and record exact compatible versions for the frontend, backend, database image, and container tooling before any application implementation begins.
- **Milestone**: M1
- **Dependencies**: None
- **Specification**: Constitution: Technology and Operational Constraints; Plan Phase 1
- **Status**: Not started
- **Acceptance criteria**:
  - Exact React, Vite, Node.js, Express, PostgreSQL image, Docker Engine, and Docker Compose versions are selected within constitutional compatibility baselines.
  - The exact Node version is recorded in `.node-version` or `.nvmrc`; JavaScript dependencies are exact-pinned in manifests and a committed lockfile.
  - Docker Compose uses an exact PostgreSQL patch tag and image digest; Docker/Compose tool versions are recorded in checked-in toolchain or development-container configuration.
  - A clean CI job verifies all pins. No later task starts if a required pin is missing.

### T002 - Bootstrap backend workspace and API skeleton

- **Description**: Create the TypeScript Express workspace, shared contract package, server composition, and foundational API structure.
- **Milestone**: M1
- **Dependencies**: T001
- **Specification**: Constitution: Repository Structure and Coding Standards; Plan Phase 1
- **Status**: Not started
- **Acceptance criteria**:
  - `apps/api` has a pinned Node/Express TypeScript package with the required config, middleware, routes, services, repositories, and `server.ts` organization.
  - `packages/contracts` has shared request/response and error schemas/types.
  - Express binds only to `127.0.0.1`, parses JSON safely, and has a common non-sensitive error boundary.
  - Root scripts can install, build, typecheck, lint, and test the API workspace using locked dependencies.

### T003 - Add PostgreSQL Docker service

- **Description**: Configure the pinned PostgreSQL service for reproducible, loopback-only local development.
- **Milestone**: M1
- **Dependencies**: T001
- **Specification**: FR-019, FR-025, SC-001; Constitution: Technology and Operational Constraints
- **Status**: Not started
- **Acceptance criteria**:
  - Docker Compose starts the pinned PostgreSQL 15 image with a health check and persistent local development storage.
  - Database network exposure is local-only; credentials are loaded from server-side environment configuration and are not committed or Vite-exposed.
  - Documented start/stop commands work from a clean checkout.

### T004 - Create migrations for dashboard entities

- **Description**: Add versioned PostgreSQL migrations and integrity constraints for the dashboard's project, sprint, team, issue, scope-change, and burndown data.
- **Milestone**: M1
- **Dependencies**: T002, T003
- **Specification**: Data Model; FR-001, FR-004, FR-006, FR-023; Constitution: versioned migrations
- **Status**: Not started
- **Acceptance criteria**:
  - Versioned migrations create `teams`, `projects`, `team_members`, `sprints`, `sprint_scope_changes`, `issues`, and `burndown_snapshots` with the specified types and foreign keys.
  - Constraints enforce supported statuses, non-negative point values, unique issue/sprint keys, unique project sprint keys, and at most one active sprint per project.
  - A clean database applies migrations successfully; migration verification runs in CI.
  - Runtime API has no create/update/delete endpoints for these records.

### T005 - Implement atomic fictional seed and reset

- **Description**: Create and validate the fictional 10-person sprint fixture and provide a transactional seed/reset path.
- **Milestone**: M1
- **Dependencies**: T004
- **Specification**: Data Model and Derived Values; FR-001, FR-008, SC-002
- **Status**: Not started
- **Acceptance criteria**:
  - Seed data contains exactly one Staff Augment project, one team with 10 active members, one active sprint, the four supported statuses, and fictional issues/scope changes/burndown snapshots.
  - Seed data covers missing estimates, unassigned issues, flagged/unflagged issues, members with no work, and scope additions/removals.
  - The original commitment, scope ledger, current issue estimates, completed points, and latest burndown value reconcile under the specified formulas.
  - Seed validation rejects unsupported statuses, multiple active sprints/projects, missing snapshots, and inconsistent totals before changes are committed.
  - Reset/reseed replaces the fixture atomically; a failed seed leaves the prior database state intact.

### T006 - Define dashboard API contracts and health endpoint

- **Description**: Define shared health/dashboard schemas and implement the API readiness endpoint plus dashboard route boundaries.
- **Milestone**: M1
- **Dependencies**: T002, T004
- **Specification**: API Contracts; FR-018, FR-019, FR-021, FR-026
- **Status**: Not started
- **Acceptance criteria**:
  - Shared contracts define `GET /api/v1/health` and `GET /api/v1/dashboard`, including nullable fields, enums, freshness, errors, and all dashboard arrays.
  - `GET /api/v1/health` returns the specified ready/not-ready payload without exposing database connection details.
  - The dashboard route and service/repository boundaries are registered; until Phase 3 implements calculations, it MUST NOT return placeholder metrics.
  - Contract tests verify the declared schema and error response shape.

### Phase 1 Exit Gate: Backend Foundation

- T001 through T006 are complete.
- A clean checkout can pin/install the toolchain, start PostgreSQL, apply migrations, seed data, start Express, and call the health endpoint.
- No application feature proceeds without exact pins and a valid seed fixture.

## Phase 2: Frontend Setup (UI Skeleton and Routing)

### T007 - Bootstrap React/Vite frontend workspace

- **Description**: Create the pinned React/Vite TypeScript application and local API proxy configuration.
- **Milestone**: M2
- **Dependencies**: T001, T006
- **Specification**: Architecture and Constraints; Constitution: Repository Structure and Coding Standards
- **Status**: Not started
- **Acceptance criteria**:
  - `apps/web` uses the pinned React 18/Vite versions and TypeScript conventions.
  - Root scripts build, typecheck, lint, and test the frontend from the committed lockfile.
  - Vite proxies `/api` to Express and binds to `127.0.0.1`.

### T008 - Add app shell and dashboard route

- **Description**: Build the single-page application shell and `/` route for the local sprint dashboard.
- **Milestone**: M2
- **Dependencies**: T007
- **Specification**: UI Screens; FR-002, FR-017
- **Status**: Not started
- **Acceptance criteria**:
  - The single route `/` renders the Staff Augmentation dashboard shell with page title, project/team context, and responsive layout regions.
  - No sprint selector, project selector, configuration view, edit controls, or remote-access workflow is added.
  - The page remains usable at desktop and narrow mobile viewport sizes.

### T009 - Add shared API client and UI state shell

- **Description**: Connect the frontend to shared API contracts and add loading, empty, stale, and recoverable error states.
- **Milestone**: M2
- **Dependencies**: T006, T007, T008
- **Specification**: FR-017, FR-018, FR-021, FR-027
- **Status**: Not started
- **Acceptance criteria**:
  - API client consumes `packages/contracts` and validates received dashboard responses before rendering.
  - Loading, no-active-sprint, empty-active-sprint, stale, and recoverable-error shells are present without fabricated metrics.
  - A user-triggered Retry control is available for transient network/503 failures; no automatic retries are made.

### T010 - Add accessible dashboard component skeleton

- **Description**: Establish accessible feature components for the dashboard's major content regions before wiring real metrics.
- **Milestone**: M2
- **Dependencies**: T008, T009
- **Specification**: UI Screens; Non-Functional Requirements; SC-008, SC-011
- **Status**: Not started
- **Acceptance criteria**:
  - Feature-owned components/regions exist for summary, burndown, status/blockers, workload, scope changes, and issue details.
  - Controls have labels, keyboard operation, and visible focus; chart regions have text alternatives.
  - Status and blocked state are not conveyed by color alone; skeleton placeholders are not presented as real data.

### Phase 2 Exit Gate: Frontend Shell

- T007 through T010 are complete.
- `/` builds and renders through the local Vite proxy with correct loading/error shells and no page-level horizontal overflow.

## Phase 3: Feature Implementation (One Feature at a Time)

Complete each feature's backend rule, API response, React UI, and tests before starting the next feature.

### Feature 3.1 - Sprint Summary, Scope, Pace, and Burndown

#### T011 - Implement snapshot metric domain services

- **Description**: Implement and unit-test the deterministic sprint scope, pace, freshness, and burndown calculations.
- **Milestone**: M3.1
- **Dependencies**: T004, T005, T006
- **Specification**: FR-003 through FR-010, FR-020, FR-022; Derived Values
- **Status**: Not started
- **Acceptance criteria**:
  - Pure services implement UTC weekday count, current/original scope, completion, remaining points, expected completion, pace variance, freshness, and ideal/actual burndown.
  - `E/N`, rounding, snapshot selection, zero-scope, and missing-estimate rules match the spec exactly.
  - Unit tests cover pre-start, as-of, sprint-end, zero working days, zero scope, missing snapshot, stale snapshot, additions/removals, and inconsistent totals.

#### T012 - Complete dashboard summary and burndown API data

- **Description**: Assemble the validated database snapshot and calculated summary/burndown values into the dashboard API response.
- **Milestone**: M3.1
- **Dependencies**: T006, T011
- **Specification**: API Contracts; FR-002 through FR-009, FR-018 through FR-023
- **Status**: Not started
- **Acceptance criteria**:
  - `GET /api/v1/dashboard` reads one consistent database snapshot and returns metadata, summary/pace fields, scope events, burndown, and safe error states.
  - The latest actual burndown reconciles with current scope minus completed points for that same snapshot.
  - API behavior covers no active sprint, empty active sprint, invalid data, and stale data as specified.

#### T013 - Build summary and burndown UI slice

- **Description**: Render sprint context, scope, pace, and ideal/actual burndown using the tested dashboard API response.
- **Milestone**: M3.1
- **Dependencies**: T009, T012
- **Specification**: UI Screens items 1-3 and 7; SC-002 through SC-004
- **Status**: Not started
- **Acceptance criteria**:
  - UI shows metadata, original/current scope, net scope change, completion, expected completion, pace variance, elapsed/remaining working days, and dated scope events.
  - Ideal line uses the original commitment; actual line uses only stored daily snapshots; the baseline point is ideal-only.
  - Values and accessible chart summary match the API data; missing/stale values remain explicit.

### Feature 3.2 - Status, Blockers, Issue List, and Filters

#### T014 - Implement status/blocker aggregates and issue response

- **Description**: Add issue-derived status counts, estimated-point totals, and flagged-only blocker data to the dashboard response.
- **Milestone**: M3.2
- **Dependencies**: T005, T006, T011
- **Specification**: FR-011, FR-012, FR-015, FR-020; API Contracts
- **Status**: Not started
- **Acceptance criteria**:
  - API returns counts and points for all four statuses, including zero-count groups, and all issues in the sprint.
  - Only `flagged=true` marks an issue blocked; priority does not determine blocked state.
  - Unknown statuses invalidate seed data; descriptions are not persisted or returned.

#### T015 - Build issue table and combined filters

- **Description**: Render sprint issues and implement combined status, assignee, and blocked-only filtering in the browser.
- **Milestone**: M3.2
- **Dependencies**: T009, T014
- **Specification**: User Story 4; FR-015, FR-016; SC-006
- **Status**: Not started
- **Acceptance criteria**:
  - Issue table shows key, summary, assignee, status, priority, points, and flagged state.
  - Status, assignee, and Blocked only filters combine with AND semantics and update visible row/result counts.
  - Empty filter result shows an explicit empty state; all controls are keyboard operable.

#### T016 - Test issue, status, and blocker slice

- **Description**: Verify status grouping, blocked semantics, issue edge cases, and combined filter results.
- **Milestone**: M3.2
- **Dependencies**: T014, T015
- **Specification**: FR-010 through FR-016; SC-006
- **Status**: Not started
- **Acceptance criteria**:
  - Tests cover all supported statuses, zero-count status groups, unknown status rejection, missing estimate, unassigned issue, and flagged/unflagged cases.
  - Browser tests cover each filter and their combinations, including zero matches.

### Feature 3.3 - Ten-Person Workload

#### T017 - Implement team workload aggregation

- **Description**: Calculate assigned, completed, and remaining points for every seeded teammate and the unassigned group.
- **Milestone**: M3.3
- **Dependencies**: T005, T011
- **Specification**: FR-013, FR-014, SC-005
- **Status**: Not started
- **Acceptance criteria**:
  - API derives assigned, completed, and remaining points for every active team member from in-scope issues.
  - All 10 members appear, including members with zero points; unassigned points are grouped separately.
  - No ranking, utilization, over-allocation, or performance metric is derived.

#### T018 - Build and test workload UI slice

- **Description**: Display per-member point workload accessibly and verify every value against issue-level data.
- **Milestone**: M3.3
- **Dependencies**: T009, T017
- **Specification**: UI Screens item 5; User Story 3; SC-005
- **Status**: Not started
- **Acceptance criteria**:
  - Workload visualization displays assigned/completed/remaining point totals and labels the data as workload context.
  - Component and browser tests reconcile every displayed total with fixture issue records.
  - Visual meaning is accessible without relying on color or ranking.

### Feature 3.4 - Freshness, Errors, and Prototype Boundary

#### T019 - Complete freshness and error behavior

- **Description**: Apply snapshot freshness rules and map API/network errors to the specified user states and manual retry behavior.
- **Milestone**: M3.4
- **Dependencies**: T009, T011, T012
- **Specification**: FR-017, FR-021, FR-022, FR-026, FR-027; SC-007, SC-010
- **Status**: Not started
- **Acceptance criteria**:
  - API and UI distinguish current/stale snapshots using the specified 24-hour rule and UTC `asOf` timestamp.
  - API errors map to no-sprint, retryable network/503, or non-retryable invalid-data states as specified.
  - Manual retry does not trigger mutation or automatic retry; sensitive diagnostics remain server-side.

#### T020 - Verify feature-slice integration

- **Description**: Confirm all completed feature slices use one consistent snapshot and shared contracts without duplicated calculations.
- **Milestone**: M3.4
- **Dependencies**: T013, T016, T018, T019
- **Specification**: FR-020, FR-021; SC-002 through SC-007
- **Status**: Not started
- **Acceptance criteria**:
  - Complete API payload renders without duplicate metric calculations in React.
  - Summary, burndown, statuses, blockers, workload, filters, and errors all derive from the same fixture snapshot.
  - Contract checks catch missing/nullable/invalid payload fields before the UI renders them.

### Phase 3 Exit Gate: Feature Slices Complete

- T011 through T020 are complete in order, one vertical feature slice at a time.
- Domain/API/UI results reconcile against fixtures, and each slice has focused unit/API/browser tests.

## Phase 4: Integration and Testing

### T021 - Run clean-start integration workflow

- **Description**: Validate the full Docker-backed migration, seed, API, and frontend startup from a clean checkout.
- **Milestone**: M4
- **Dependencies**: T001 through T020
- **Specification**: SC-001, SC-002, SC-007, SC-010
- **Status**: Not started
- **Acceptance criteria**:
  - A clean checkout starts pinned Docker/PostgreSQL, runs migrations/seeds, starts API and frontend, and reaches the dashboard using documented commands.
  - `GET /api/v1/health` and `GET /api/v1/dashboard` return the specified response/error behavior.
  - The process binds only to loopback and uses only fictional data; no external Jira calls occur.

### T022 - Run end-to-end acceptance tests

- **Description**: Exercise the dashboard's user stories and API outcomes as complete browser workflows using fictional data.
- **Milestone**: M4
- **Dependencies**: T021
- **Specification**: User Stories 1-5; SC-001 through SC-011
- **Status**: Not started
- **Acceptance criteria**:
  - Browser tests cover loaded, no-active, active-empty, stale, error, and empty-filter states.
  - Tests cover scope/pace/burndown consistency, all 10 team members, flagged blockers, and filter combinations.
  - Tests run without Jira credentials, real user data, remote access, or external writes.

### T023 - Verify accessibility and responsive behavior

- **Description**: Verify WCAG 2.2 AA interaction requirements and desktop/mobile layout acceptance criteria.
- **Milestone**: M4
- **Dependencies**: T013, T015, T018, T022
- **Specification**: Non-Functional Requirements; SC-008, SC-011
- **Status**: Not started
- **Acceptance criteria**:
  - WCAG 2.2 AA checks cover labels, keyboard navigation, focus, chart text alternatives, and color-independent states.
  - Desktop and mobile checks show no page-level horizontal overflow; only the issue table may scroll internally.

### T024 - Document and hand off the local prototype

- **Description**: Document pinned tool versions, local operation, seed lifecycle, endpoint behavior, and explicit prototype exclusions.
- **Milestone**: M4
- **Dependencies**: T001 through T023
- **Specification**: SC-001, SC-007, SC-010; Constitution: Development Workflow
- **Status**: Not started
- **Acceptance criteria**:
  - Documentation includes pinned tool versions, local start/stop/reset steps, API endpoints, seed snapshot semantics, and troubleshooting.
  - Explicitly documents no Jira integration, no authentication/remote access, no pagination/production-scale promise, and the flagged-only blocker rule.
  - No task adds AES encryption or an `ENCRYPTION_SECRET`; no actual credential is used in the mock-only prototype.

## Milestone Gates

| Milestone | Tasks | Gate |
|---|---|---|
| M1 - Backend setup | T001-T006 | Exact pins, database, migrations/seed, API contracts, and health endpoint work locally. |
| M2 - Frontend setup | T007-T010 | React/Vite route and accessible UI shell build and call the local API proxy. |
| M3 - Feature slices | T011-T020 | Summary, issue/filter, workload, freshness, and error slices pass focused tests in order. |
| M4 - Integration/testing | T021-T024 | Clean local workflow and all prototype acceptance checks pass. |

## Cross-Phase Quality Gates

- Exact runtime/dependency/image pins are required before backend implementation proceeds.
- Database changes use versioned migrations; fixture validation and reset are atomic.
- Cross-layer changes update `packages/contracts` and test both backend and browser validation.
- Business calculations are tested independently from HTTP and React.
- Routine tests use only fictional seed data and make no Jira/Confluence calls.
- Changes beyond the prototype scope require an approved specification/clarification update before implementation.