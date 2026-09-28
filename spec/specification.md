# Feature Specification: Staff Augmentation Sprint Dashboard

- **Feature Branch**: `TBD`
- **Created**: 2026-09-28
- **Status**: Draft
- **Input**: `project_spec.md`, governed by `spec/constitution.md`

## Summary

Provide a Project Manager with a read-only local view of one active sprint for a 10-person Staff Augment project. The dashboard uses story points to show completion, scope movement, delivery pace, status, blockers, and assigned-versus-completed work by teammate. The PM is the phase-one operator; team members may observe the dashboard on the PM's local machine but cannot connect remotely.

Phase one uses one fictional project, one team, and one active sprint seeded in PostgreSQL 15. The browser reads data from a Node.js/Express API bound to loopback. There is no live Jira integration, authentication, remote hosting, or Jira credential in phase one. The target stack, folder structure, coding rules, and version-pin gate are defined by `spec/constitution.md`.

## Goals

- Make current sprint delivery progress and remaining work scannable for a Project Manager managing 10 people.
- Preserve original commitment separately from current scope and show scope changes.
- Present an ideal-versus-actual daily burndown and elapsed-time context without claiming a guaranteed forecast.
- Show status distribution, explicitly flagged blockers, and each teammate's assigned, completed, and remaining points.
- Allow status, assignee, and blocked-only filters to be combined.
- Validate the product locally with fictional data before Jira integration or shared hosting is designed.

## User Scenarios & Testing

### User Story 1 - Inspect the Active Sprint (Priority: P1)

As the Project Manager, I want a single overview of the team's active sprint so that I can understand delivery progress and remaining time without manually compiling issue data.

**Why this priority**: Sprint delivery confidence is the primary dashboard purpose.

**Independent Test**: Start the local application with the seed database and verify that the active sprint, team, scope, completion metrics, status distribution, and update date render from the API response.

#### Acceptance Scenarios

1. **Given** the seed database contains one active sprint, **When** the dashboard loads, **Then** it shows the project name/type, team name, sprint key/name, goal, date range, and as-of date.
2. **Given** the active sprint has estimated issues, **When** summary metrics are calculated, **Then** the dashboard shows original commitment, current scope, completed points, remaining points, and completion percentage using the rules in this specification.
3. **Given** the API is loading, **When** the user opens the dashboard, **Then** a labeled loading state is shown without presenting placeholder numbers as real values.
4. **Given** no active sprint is configured, **When** the dashboard loads, **Then** an explicit no-active-sprint state is shown.

### User Story 2 - Understand Pace and Scope Changes (Priority: P1)

As the Project Manager, I want to compare sprint progress with elapsed time and see scope changes against the original commitment so that changing scope does not hide delivery risk.

**Why this priority**: A current-scope-only completion figure can obscure whether the team is delivering its original plan.

**Independent Test**: Seed an original commitment, added and removed scope events, and daily burndown snapshots; verify the displayed baseline, current scope, net change, progress-versus-time signal, and chart values.

#### Acceptance Scenarios

1. **Given** sprint scope changes after sprint start, **When** the overview is rendered, **Then** original commitment and current scope are shown separately with the net change.
2. **Given** daily burndown snapshots exist, **When** the chart is rendered, **Then** actual remaining points follow those snapshots and the ideal line is shown against the original commitment baseline.
3. **Given** the dashboard uses its latest complete snapshot as `asOf`, **When** it shows remaining points, **Then** that value equals current scope minus completed estimated issue points in the same snapshot.
4. **Given** completed points are behind or ahead of the linear original-commitment pace, **When** the pace indicator is displayed, **Then** it is described as a signal and not a promise of completion.
5. **Given** a point estimate is missing, **When** metrics are calculated, **Then** the issue is counted as unestimated and is not silently treated as zero-point work.

### User Story 3 - Review Team Workload (Priority: P1)

As the Project Manager, I want assigned, completed, and remaining points for each teammate so that I can discuss sprint work distribution with the team.

**Why this priority**: The Project Manager manages a 10-person staff-augmentation team and needs team-level allocation context.

**Independent Test**: Seed issues assigned across 10 members, including completed and unestimated work; verify per-person totals against issue data and verify that no performance ranking or utilization inference is produced.

#### Acceptance Scenarios

1. **Given** the team has 10 active members, **When** the workload section renders, **Then** all 10 members appear, including members with no assigned points.
2. **Given** a member has assigned issues, **When** their workload is calculated, **Then** assigned, completed, and remaining points equal the corresponding issue totals.
3. **Given** an issue has no assignee, **When** workload is displayed, **Then** its points appear in an Unassigned group and are not attributed to a teammate.
4. **Given** workload is displayed, **When** a user interprets the visualization, **Then** the UI labels it as workload context and does not rank people or imply utilization/performance.

### User Story 4 - Find Issues, Status, and Blockers (Priority: P1)

As a team member or Project Manager, I want to filter sprint issues by status, assignee, and flagged state so that I can focus on the work requiring attention.

**Why this priority**: The aggregate charts must lead to an actionable view of the issues behind them.

**Independent Test**: Use a fixture with issues across all standard statuses, multiple assignees, flagged and unflagged issues; exercise each filter alone and in combination, including a result set with no matches.

#### Acceptance Scenarios

1. **Given** issues are loaded, **When** the user selects a status, **Then** only issues with that status appear and the visible count updates.
2. **Given** issues are loaded, **When** the user selects an assignee, **Then** only issues assigned to that member appear.
3. **Given** issues are loaded, **When** the user enables Blocked only, **Then** only issues with Jira's flagged/impediment marker set appear.
4. **Given** multiple filters are selected, **When** the issue list updates, **Then** all filters are combined using AND semantics.
5. **Given** no issues match the filters, **When** the results render, **Then** the table is replaced by a clear empty state and the zero result count is shown.
6. **Given** an issue summary contains words such as "blocked", **When** its Jira flag is not set, **Then** it is not classified as blocked.

### User Story 5 - Recover from Data or Service Problems (Priority: P1)

As a dashboard user, I want clear loading, stale, and error states so that I can tell whether displayed sprint data is trustworthy.

**Why this priority**: Misleading or silently stale delivery metrics can lead to poor project decisions.

**Independent Test**: Mock API success, empty sprint, database failure, malformed response, and stale as-of date; verify each UI state and ensure no error reveals SQL or environment secrets.

#### Acceptance Scenarios

1. **Given** the API returns a valid dashboard snapshot, **When** data is shown, **Then** its as-of timestamp is visible.
2. **Given** the API returns an error or invalid payload, **When** the request fails, **Then** the UI shows a useful retryable message and does not render fabricated metrics.
3. **Given** the snapshot is older than the configured freshness threshold, **When** the dashboard renders, **Then** it visibly labels the data as stale.

## Functional Requirements

### Dashboard and Metric Rules

- **FR-001**: The seed database MUST contain exactly one project and one team, with at most one active sprint. The standard demo fixture contains one active sprint; a no-active-sprint fixture is valid for testing the empty state. The API MUST use the seeded records without a project or sprint selector. Multiple projects or active sprints are invalid data.
- **FR-002**: The system MUST show project name/type, team name and size, sprint key/name/goal, start/end dates, and data as-of timestamp.
- **FR-003**: The system MUST show original committed points, current scope points, net scope change, completed points, remaining points, completion percentage, elapsed working days, total working days, working days remaining, expected completed points, and pace variance.
- **FR-004**: Current scope MUST equal the sum of non-null estimates for issues currently in scope in the active sprint. Completed points MUST equal estimates for in-scope issues in `Done`. Remaining points MUST equal current scope minus completed points.
- **FR-005**: Completion percentage MUST be completed points divided by current scope, rounded to two decimal places using PostgreSQL numeric rounding. If current scope is zero, the API MUST return `null` and the UI MUST show completion as unavailable, not as 0%.
- **FR-006**: The original commitment MUST be a frozen value captured at sprint kickoff. Scope events MUST record only issue additions and removals in phase one; estimates MUST NOT be changed after kickoff in the seed data. Current scope MUST NOT overwrite the original commitment.
- **FR-007**: The calendar MUST use UTC dates, Monday-Friday working days, and no holiday calendar. Sprint start/end dates are inclusive. Let `N` be the number of working days in the sprint and `E` the number from sprint start through the as-of date, inclusive and clamped to `0..N`. A sprint MUST contain at least one working day. At each end-of-working-day snapshot, ideal remaining points MUST equal `originalCommittedPoints * (1 - E/N)`, rounded to two decimals. The chart MUST include a virtual start point at `E=0` with the original commitment; that point is not stored as an actual snapshot.
- **FR-008**: The actual burndown MUST use complete dated snapshots and MUST NOT be interpolated or fabricated. The API's `asOf` MUST identify the latest complete snapshot. The latest actual remaining value MUST equal that snapshot's current scope minus completed estimated points. If no valid snapshot exists or those values disagree, the API MUST return `DASHBOARD_DATA_INVALID`.
- **FR-009**: Expected completed points MUST equal `originalCommittedPoints * E/N`, rounded to two decimals. `paceVariancePoints` MUST equal `completedPoints - expectedCompletedPoints`; positive means ahead of ideal pace and negative means behind. Pace MUST be labeled as a directional signal, not a completion prediction.
- **FR-010**: Missing story-point estimates MUST be shown as unestimated and excluded from point sums; their issue count MUST remain visible.
- **FR-011**: Status breakdown MUST show issue counts and estimated points for `To Do`, `In Progress`, `In Review`, and `Done`.
- **FR-012**: An issue MUST be considered blocked only when its `flagged` field is true. Phase-one status values and mappings are exactly `To Do`, `In Progress`, `In Review`, and `Done`; an unknown status makes the seed invalid. Custom Jira statuses and status mapping are out of scope.
- **FR-013**: Per-person workload MUST show assigned, completed, and remaining estimated points for all 10 active team members. Unassigned work MUST be grouped separately.
- **FR-014**: Workload MUST NOT be used to calculate utilization, performance ratings, rankings, or over-allocation.
- **FR-015**: The issue table MUST show issue key, summary, assignee, status, priority, story points, and blocked state.
- **FR-016**: Status, assignee, and blocked-only filters MUST be combinable, update the visible issue count, and provide an empty state when there are no matches.
- **FR-017**: The UI MUST expose loading, success, stale-data, no-active-sprint, empty-filter, and recoverable error states.

### API and Data Flow

- **FR-018**: The React application MUST obtain sprint data only through the Express API; browser code MUST NOT connect directly to PostgreSQL or Jira.
- **FR-019**: Phase one MUST provide read-only dashboard APIs backed by PostgreSQL and MUST NOT expose write endpoints for sprint or issue data.
- **FR-020**: The API MUST derive status counts, workload, completion, remaining points, current scope, expected completed points, and pace variance from one consistent database snapshot rather than trusting client-calculated aggregates.
- **FR-021**: The API and browser MUST validate dashboard responses against the shared schema in `packages/contracts` and return/render safe, actionable errors without SQL details, stack traces, or secrets.
- **FR-022**: `asOf` MUST be the UTC timestamp of the latest complete seed snapshot, not the current wall-clock time or database import time. `freshness` MUST be `current` when that timestamp is no more than 24 hours old and `stale` when older. The threshold is fixed at 24 hours for this prototype. Seed data is immutable at runtime; only editing the fixture and re-seeding atomically can provide a newer snapshot. There is no refresh endpoint.
- **FR-023**: The API MUST read the only seeded project and its only active sprint. If none exists, return `404 ACTIVE_SPRINT_NOT_FOUND`; an active sprint with zero issues returns `200` with empty issue/status data and null completion percentage. The database MUST enforce at most one active sprint per project.
- **FR-024**: The API MUST return every issue in the single active sprint in one response. Client-side filters apply to this full set. Pagination, multi-project scale, and production load guarantees are out of scope for the prototype.
- **FR-025**: Phase-one API and Vite dev server MUST bind to loopback only. Authentication is out of scope because only fictional data is served locally.
- **FR-026**: `GET /api/v1/health` is an operational readiness check and MUST return `200 {"status":"ready"}` when the API and database are ready or `503 {"status":"not_ready"}` otherwise. The UI MUST rely on `/api/v1/dashboard` for user-facing data/error state and MUST NOT call health as a preflight.
- **FR-027**: The UI MUST provide a user-triggered Retry action for transient `503`/network failures. Automatic retry is out of scope. `404 ACTIVE_SPRINT_NOT_FOUND` shows the no-sprint state; `500 DASHBOARD_DATA_INVALID` shows a non-retryable data error.

## API Contracts

All endpoints use the `/api/v1` prefix and JSON. During local development, Vite proxies `/api` requests to Express. Phase one is read-only, bound to `127.0.0.1`, and has no authentication because it uses fictional data only. The project and sprint are fixed by the single seed; there is no selector or configuration API.

| Method and endpoint | Request | Response/data destination |
|---|---|---|
| `GET /api/v1/health` | No body or query parameters. | `200 {"status":"ready"}` or `503 {"status":"not_ready"}`. Operational check only; no SQL or environment details. |
| `GET /api/v1/dashboard` | No body or query parameters. The only seeded project and its active sprint determine the result. | `200` dashboard snapshot assembled from `projects`, `teams`, `team_members`, `sprints`, `sprint_scope_changes`, `issues`, and `burndown_snapshots`; `404 ACTIVE_SPRINT_NOT_FOUND` if no active sprint exists. |

The dashboard response contract is:

```json
{
	"asOf": "2026-09-28T23:59:59Z",
	"freshness": "current",
	"project": {
		"id": "11111111-1111-4111-8111-111111111111",
		"name": "Staff Augment Project",
		"type": "Staff Augment"
	},
	"team": {
		"id": "22222222-2222-4222-8222-222222222222",
		"name": "Platform Team",
		"memberCount": 10
	},
	"sprint": {
		"id": "33333333-3333-4333-8333-333333333333",
		"key": "TEAM-24",
		"name": "Sprint 24",
		"goal": "Example sprint goal",
		"startDate": "2026-09-21",
		"endDate": "2026-10-02",
		"state": "active"
	},
	"summary": {
		"originalCommittedPoints": 72,
		"currentScopePoints": 78,
		"netScopeChangePoints": 6,
		"completedPoints": 42,
		"remainingPoints": 36,
		"completionPercent": 53.85,
		"expectedCompletedPoints": 43.2,
		"paceVariancePoints": -1.2,
		"elapsedWorkingDays": 6,
		"totalWorkingDays": 10,
		"workingDaysRemaining": 4,
		"unestimatedIssueCount": 1
	},
	"scopeChanges": [
		{ "date": "2026-09-24", "direction": "added", "points": 6 }
	],
	"burndown": [
		{ "date": "2026-09-21", "elapsedWorkingDays": 1, "idealRemainingPoints": 64.8, "actualRemainingPoints": 72 },
		{ "date": "2026-09-22", "elapsedWorkingDays": 2, "idealRemainingPoints": 57.6, "actualRemainingPoints": 68 },
		{ "date": "2026-09-23", "elapsedWorkingDays": 3, "idealRemainingPoints": 50.4, "actualRemainingPoints": 64 },
		{ "date": "2026-09-24", "elapsedWorkingDays": 4, "idealRemainingPoints": 43.2, "actualRemainingPoints": 70 },
		{ "date": "2026-09-25", "elapsedWorkingDays": 5, "idealRemainingPoints": 36, "actualRemainingPoints": 54 },
		{ "date": "2026-09-28", "elapsedWorkingDays": 6, "idealRemainingPoints": 28.8, "actualRemainingPoints": 36 }
	],
	"statusBreakdown": [
		{ "status": "To Do", "issueCount": 3, "estimatedPoints": 12 }
	],
	"workload": [
		{
			"assigneeId": "44444444-4444-4444-8444-444444444444",
			"assigneeName": "Example Teammate",
			"assignedPoints": 13,
			"completedPoints": 8,
			"remainingPoints": 5
		}
	],
	"issues": [
		{
			"id": "55555555-5555-4555-8555-555555555555",
			"key": "TEAM-123",
			"summary": "Example issue",
			"assigneeId": "44444444-4444-4444-8444-444444444444",
			"assigneeName": "Example Teammate",
			"status": "In Progress",
			"priority": "High",
			"storyPoints": 5,
			"flagged": false
		}
	]
}
```

The example is illustrative; its arrays show representative entries and MUST be fully populated in actual responses. The `burndown` array contains end-of-working-day snapshots; the UI adds a virtual ideal-only baseline point at elapsed day zero. Internally consistent values MUST be enforced by tests; actual seed totals may differ. `GET /api/v1/dashboard` returns the active-sprint issue set so the browser can apply the three filters together without additional requests. It MUST NOT return credentials, issue descriptions, or unrelated team/project data. UUIDs are serialized as canonical UUID strings.

Response fields `sprint.goal`, issue `assigneeId`, `assigneeName`, `priority`, and `storyPoints`, and `summary.completionPercent` are nullable. `freshness` is exactly `current` or `stale`; `sprint.state` is `active`; issue status is one of the four supported status values. `statusBreakdown` MUST always include all four statuses, including zero-count rows. `workload` MUST include all 10 active team members, including zero-point members, and an Unassigned row only when unassigned points exist.

### API Errors

- `404 ACTIVE_SPRINT_NOT_FOUND`: no active sprint exists for the configured project.
- `503 DATABASE_UNAVAILABLE`: PostgreSQL is unavailable or not ready.
- `500 DASHBOARD_DATA_INVALID`: persisted or computed data fails validation.
- Error response shape: `{ "error": { "code": "...", "message": "...", "requestId": "..." } }`.
- Multiple projects or active sprints in the seed, unsupported statuses, missing burndown history, and inconsistent aggregate values MUST be treated as `500 DASHBOARD_DATA_INVALID`.
- Client messages MUST be actionable and safe. Server logs MAY contain diagnostic context but MUST NOT expose secrets or unnecessary personal data.

## UI Screens

Phase one has one read-only route, `/`, with a single dashboard page operated locally by the PM. It has no separate sprint-selection, configuration, administration, or issue-editing screen. Other team members can observe on the PM's device; remote access is out of scope.

### Sprint Dashboard (`/`)

1. **Context header**: Staff Augment project name/type, team name, active sprint key/name, goal, date range, and as-of/freshness label.
2. **Sprint summary**: original commitment, current scope, net scope change, completed and remaining points, completion percentage, elapsed working days, and working days remaining.
3. **Pace and burndown**: completion relative to elapsed sprint time; ideal and actual remaining-points lines; accessible textual summary of the chart.
4. **Status and blockers**: issue count and point totals by standard status, plus a clearly labeled blocked count/list driven only by the flagged field.
5. **Team workload**: all 10 members with assigned, completed, and remaining points; unassigned points shown separately; no ranking or utilization label.
6. **Issue details**: issue table with key, summary, assignee, status, priority, points, and blocked marker. Status and assignee dropdowns plus a Blocked only toggle apply together and update result count.
7. **Scope changes**: dated aggregate entries showing added/removed direction and points. Reasons and issue-level traceability are not shown in this prototype.

The page MUST provide loading, no-active-sprint, empty-active-sprint, stale-data, recoverable error, empty-filter, and loaded states. If active scope is zero, completion is shown as unavailable. Layout is desktop-first and responsive; the issue table MAY scroll horizontally inside its own container on narrow screens, but the page MUST NOT overflow horizontally. The local seed roster is fixed at 10 active members; roster changes are out of scope.

## Data Model

PostgreSQL is the source of truth for the local dashboard snapshot. The seed process imports fictional JSON fixtures into the relational schema. Field names below are logical names; physical database names MUST use `snake_case` and IDs MUST use UUIDs.

| Entity/table | Fields and types | Constraints and purpose |
|---|---|---|
| `teams` | `id UUID`, `name VARCHAR(120)` | `id` is the primary key; one configured team for phase one. |
| `projects` | `id UUID`, `team_id UUID`, `name VARCHAR(160)`, `project_type VARCHAR(50)` | `id` is the primary key; `team_id` references `teams.id`; exactly one project row exists in the seed; project type is `Staff Augment`. |
| `team_members` | `id UUID`, `team_id UUID`, `display_name VARCHAR(160)`, `is_active BOOLEAN NOT NULL DEFAULT TRUE` | `id` is the primary key; `team_id` references `teams.id`; phase-one seed has exactly 10 active members. Inactive roster handling is out of scope. |
| `sprints` | `id UUID`, `project_id UUID`, `external_key VARCHAR(100)`, `name VARCHAR(160)`, `goal TEXT NULL`, `state VARCHAR(20)`, `start_date DATE`, `end_date DATE`, `as_of_at TIMESTAMPTZ`, `original_committed_points NUMERIC(8,2)` | `id` is the primary key; `project_id` references `projects.id`; a partial unique index permits at most one active sprint per project; sprint key is unique per project; state is constrained to `active`, `future`, or `closed`; points are non-negative; `external_key` may be synthetic in mock data. |
| `sprint_scope_changes` | `id UUID`, `sprint_id UUID`, `effective_at TIMESTAMPTZ`, `direction VARCHAR(10)`, `points NUMERIC(8,2)` | `id` is the primary key; `sprint_id` references `sprints.id`; direction is `added` or `removed`; points are positive and contribute signed points to net scope change. Events are aggregate and not linked to issue IDs; event reasons are out of scope. |
| `issues` | `id UUID`, `sprint_id UUID`, `external_key VARCHAR(100)`, `summary VARCHAR(500)`, `assignee_id UUID NULL`, `status VARCHAR(80)`, `priority VARCHAR(40) NULL`, `story_points NUMERIC(8,2) NULL`, `flagged BOOLEAN NOT NULL DEFAULT FALSE`, `updated_at TIMESTAMPTZ` | `id` is the primary key; `sprint_id` references `sprints.id`; nullable `assignee_id` references `team_members.id`; `(sprint_id, external_key)` is unique; points are nullable/non-negative; status is constrained to the four supported values; `flagged` is the sole blocked indicator. Issue descriptions are not stored. |
| `burndown_snapshots` | `id UUID`, `sprint_id UUID`, `snapshot_date DATE`, `actual_remaining_points NUMERIC(8,2)` | `id` is the primary key; `sprint_id` references `sprints.id`; `(sprint_id, snapshot_date)` is unique; points are non-negative; snapshots are complete end-of-working-day UTC snapshots. Ideal points are derived, not stored. |

### Derived Values and Integrity Rules

- `currentScopePoints` is the sum of non-null estimates for issues currently in the active sprint. In the seed data it MUST equal `originalCommittedPoints + addedPoints - removedPoints` from aggregate scope-change events. The original commitment is frozen at sprint kickoff.
- `completedPoints` is the sum of estimates for issues whose status maps to the `Done` group. `remainingPoints` is current scope minus completed points.
- `completionPercent` is `completedPoints / currentScopePoints * 100`, rounded to two decimals; return `null` when current scope is zero.
- `netScopeChangePoints` is added points minus removed points. It MUST NOT overwrite the original commitment.
- `expectedCompletedPoints` is `originalCommittedPoints * E/N`; `paceVariancePoints` is `completedPoints - expectedCompletedPoints`. Both are rounded to two decimals and returned by the API.
- Per-member workload and status breakdown are derived from `issues`; they are not independently persisted aggregates.
- `as_of_at` is the timestamp of the complete fixture snapshot, not the database import time. All related rows MUST be loaded/replaced atomically. The endpoint uses the latest complete snapshot; it does not substitute the current wall-clock date.
- The latest burndown snapshot MUST equal remaining points for its as-of date. If no snapshot exists, dashboard data is invalid; the API does not interpolate or reuse an older point as current. Historical snapshots MUST be supplied by the fictional fixture.
- Unestimated issues remain in issue/status counts and are excluded from point totals. Unassigned issues remain in sprint totals and are grouped as Unassigned in workload output.
- Mid-sprint estimate changes, issue-level scope-change attribution, event reasons, custom status mapping, and inactive-roster management are out of scope for this prototype.
- Database schema changes MUST be implemented through versioned migrations. Seed/reset MUST validate the full fixture and replace the complete local dataset atomically. The read-only API provides no row deletion or mutation; individual record deletion semantics are out of scope.

## Architecture and Constraints

- **Frontend**: React 18.3.x and Vite 6.x in `apps/web`; feature UI in `apps/web/src/features/sprint-dashboard/`.
- **Backend**: Node.js 22.x LTS and Express 5.x in `apps/api`; routes, services, repositories, and configuration follow `spec/constitution.md`.
- **Database**: PostgreSQL 15.x in Docker; migrations in `database/migrations/`, seed fixtures in `database/seeds/`.
- **Contracts**: shared API types/schema in `packages/contracts/`; API endpoint behavior and validation are tested at the boundary.
- Exact patch versions and image digests MUST be pinned and CI-verified before implementation, per the constitution. This specification does not select unverified patches.
- The seed MUST contain one project, one team with 10 active members, one active sprint, four supported statuses, and at least one complete actual snapshot for its `as_of_at` value. Seed replacement MUST run in one transaction.
- The existing `work/jira-sprint-dashboard` vanilla-JavaScript page is a visual prototype only and MUST NOT be treated as the target architecture. The separate `work/jira-dashboard` prototype remains untouched.
- Phase one has no Jira adapter or credentials. A later Jira integration MUST be implemented in the Express backend and requires a separate clarified scope update.
- Sprint selection UI, project/team selection, remote access/authentication, pagination, production scale, and operational roster changes are out of scope for this local prototype.

## Non-Functional Requirements

- **Security**: local mock mode MUST contain no credentials or real client/team/issue data. Browser code MUST access data only through the API.
- **Accessibility**: interactive controls MUST be keyboard-operable, labeled, and visibly focused. Charts MUST have accessible names/text alternatives; color alone MUST NOT communicate status.
- **Accessibility target**: user-facing behavior MUST meet WCAG 2.2 AA for the implemented dashboard.
- **Responsive design**: desktop is primary; mobile remains usable with no page-level horizontal overflow.
- **Reliability**: malformed data, zero-point scope, missing estimates, missing assignees, absent sprint, and database failure MUST produce deterministic values or explicit states, never fabricated values.
- **Maintainability**: metric rules MUST be in testable domain services, not duplicated in React components and Express route handlers.
- Formal production performance, concurrency, and load-testing targets are out of scope; validation is limited to the local seed dataset.

## Out of Scope for Phase One

- Live Jira API integration, credentials, synchronization, and automatic refresh.
- Authentication, authorization, shared or public hosting, and client-facing access.
- Editing, transitioning, or creating Jira issues.
- Utilization, billable hours, time tracking, client allocation, performance ranking, or over-allocation claims.
- Multiple projects/boards, sprint selection, or cross-team aggregation.
- Notifications, forecasting guarantees, or automated recommendations.

## Success Criteria

- **SC-001**: A clean local setup can start React/Vite, Express, and PostgreSQL 15 through documented Docker configuration and display seeded dashboard data.
- **SC-002**: Dashboard summary values are derived from the API and reconcile with issue, scope-change, and burndown records.
- **SC-003**: The page presents original commitment and current scope separately, including a dated aggregate add/remove scope-change list.
- **SC-004**: The burndown displays end-of-working-day actual snapshots and an ideal line `original * (1 - E/N)`; the latest actual equals current remaining points for the same snapshot.
- **SC-005**: All 10 active team members appear with correct assigned/completed/remaining point totals; unassigned work is distinct.
- **SC-006**: Status, assignee, and flagged-only filters work independently and in combination and show an accurate result count and empty state.
- **SC-007**: API errors and unavailable/stale data are visible and do not expose SQL, secrets, or fabricated metrics.
- **SC-008**: Desktop and mobile browser checks confirm chart rendering, keyboard-accessible filters, readable layouts, and no page-level horizontal overflow.
- **SC-009**: Automated tests cover metric calculation, scope changes, data integrity, API validation/errors, and fixture consistency without contacting Jira.
- **SC-010**: The local preview listens only on loopback, returns the specified health states, and uses a user-triggered Retry action only for transient API/network failures.
- **SC-011**: Accessibility checks target WCAG 2.2 AA; prototype validation covers the local seed at desktop and mobile viewports, not production-scale performance or concurrency.

## Assumptions and Clarifications Needed

| Topic | Resolution for prototype |
|---|---|
| Project/sprint selection | Exactly one seeded project and one active sprint; no selectors. Missing active sprint returns `404`; invalid multiple-project/active-sprint seed fails validation. |
| Access | PM-operated loopback preview only. Remote team access, authentication, authorization, and client access are out of scope. |
| Calendar | UTC, Monday-Friday, no holidays; sprint date boundaries inclusive; snapshots represent end-of-working-day UTC. |
| Freshness | `as_of_at` is the last complete fixture snapshot time. Older than 24 hours is `stale`; seed changes replace the entire snapshot atomically. No runtime refresh. |
| Scope changes | Baseline frozen at kickoff; aggregate additions/removals supported and shown by date. Mid-sprint re-estimation and issue-level reasons/attribution are out of scope. |
| Pace | Expected completed = original commitment × elapsed working days / total working days; variance = actual completed - expected completed. Positive is ahead. |
| Statuses | Exact four statuses only; unknown status invalidates seed. Custom Jira status mapping is out of scope. |
| Missing estimates | Excluded from point totals, included in issue counts, labeled unestimated; completion is null when current scope is zero. |
| Pagination/scale | Full issue set returned for the single prototype sprint. Pagination, live Jira volumes, and production load targets are out of scope. |
| Exact stack pins | Constitution remains authoritative: choose and commit exact runtime/dependency/image pins before implementation; this spec does not invent patch versions. |
| Jira deployment and mapping | Live integration, credentials, project/board identifiers, Jira field mapping, and refresh are out of scope for the prototype. |

## Constitution Check

- The specification uses the constitution's React/Vite, Node/Express, PostgreSQL, and Docker boundaries.
- Jira access is deferred; when introduced, it belongs behind the Express API.
- Database entities, derived metrics, API payloads, and UI states are defined before implementation.
- The 10-person staff-augmentation context and individual-workload privacy constraints are explicit.
- Exact patch versions remain an implementation-readiness gate, not an implicit assumption.