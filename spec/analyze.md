# Task Analysis: Staff Augmentation Sprint Dashboard

- **Task source**: `spec/tasks.md`
- **Reviewed against**: `spec/plan.md`, `spec/specification.md`, `spec/clarify.md`, `spec/constitution.md`
- **Analysis date**: 2026-09-29
- **Scope**: 24 implementation tasks, T001-T024
- **Repository baseline note**: The workspace includes the expected contract/API/web directories, but the exact pinning and CI artifacts required by Phase 1 are still missing, so the backend foundation gate remains unfulfilled.

## Summary

The tasks map to the four plan phases and cover the major functional requirements. Complexity is highest in toolchain bootstrapping, database/seed integrity, metric/API behavior, and end-to-end integration. The main sequencing issue is that Phase 3 says features are completed one at a time, but the dependency graph does not enforce that order. CI/test tooling and runtime configuration also need explicit ownership before implementation starts. In the current workspace, the expected directories exist, but the exact package, node version, Docker, and migration/test tooling pins described in the constitution and plan are still not committed, so the entered project state is still pre-implementation.

Complexity is relative: **Low** is bounded and local; **Medium** crosses a small number of modules or needs moderate validation; **High** affects foundational tooling, data integrity, core metrics, or multiple integrated layers.

## Value- and Risk-Aware Execution Order

Use this order to surface useful results early without bypassing prerequisite gates:

1. **T001 is a mandatory readiness gate**, despite its high complexity. Exact versions are required by the constitution; no package installation or application implementation should precede it.
2. **Run T002 and T003 in parallel after T001.** They establish the API/contracts workspace and local PostgreSQL service independently.
3. **Complete T004, then run T005 and T006 in parallel where practical.** The migration schema is required by both the seed and data-backed API contract/health work. These are enabling tasks with high downstream value.
4. **After the Phase 1 exit gate, do T007, then prioritize T008.** T008 is the lowest-risk, visible UI deliverable; follow it with T009 and T010 to connect the contract and accessible component shell.
5. **Deliver Phase 3 as verified vertical slices:** T011 -> T012 -> T013, then T014 -> T015 -> T016, then T017 -> T018, then T019 -> T020. The currently missing dependencies listed below must be added if strict one-feature-at-a-time execution is required.
6. **Finish with T021 -> T022 -> T023 -> T024.** This orders clean-start integration before browser acceptance, accessibility checks, and handoff.

The plan has no implementable task before T001 because of the pinning gate. If the project wants work to begin sooner, only non-implementation activities (for example, confirming package/tool choices) can proceed without weakening the constitution.

## Task-by-Task Assessment

| Task | Complexity | Main risks | Dependencies |
|---|---|---|---|
| T001 - Pin the required toolchain | High | Version incompatibility across React/Vite/Node/Express/PostgreSQL/Docker; package and image digests may be updated inconsistently; acceptance requires a CI job that no task explicitly creates. | None |
| T002 - Bootstrap backend workspace and API skeleton | Medium | Workspace conventions, TypeScript setup, error middleware, and server-only configuration can diverge from the constitution. | T001 |
| T003 - Add PostgreSQL Docker service | Medium | Port exposure, persistent volumes, local credentials, and health-check behavior can make setup insecure or non-reproducible. | T001 |
| T004 - Create migrations for dashboard entities | High | Partial unique index, foreign keys, status/point constraints, and migration ordering affect every later slice. Migration-tool selection is not assigned to a task. | T002, T003 |
| T005 - Implement atomic fictional seed and reset | High | Scope, issue, and burndown totals can diverge; transaction rollback and validation must prevent partial or misleading snapshots. | T004 |
| T006 - Define dashboard API contracts and health endpoint | Medium | Shared schema nullability/errors can drift between Express and React; dashboard route must not return placeholder aggregates. | T002, T004 |
| T007 - Bootstrap React/Vite frontend workspace | Medium | Exact package pins, TS configuration, Vite proxy, and loopback binding must match backend and CI setup. | T001, T006 |
| T008 - Add app shell and dashboard route | Low | Scope creep into selectors/editing or a shell that does not reflect the specified one-page workflow. | T007 |
| T009 - Add shared API client and UI state shell | Medium | Runtime response validation, nullable payloads, and retry/error-state behavior can be implemented inconsistently. | T006, T007, T008 |
| T010 - Add accessible dashboard component skeleton | Medium | Components may duplicate feature logic or omit keyboard/focus/chart alternatives if accessibility is postponed. | T008, T009 |
| T011 - Implement snapshot metric domain services | High | UTC day counting, zero-scope behavior, scope changes, rounding, freshness, and ideal/actual burndown must all use one consistent snapshot. | T004, T005, T006 |
| T012 - Complete dashboard summary and burndown API data | High | Aggregates may not reconcile with persisted issues/snapshots; API can accidentally mix data from different snapshot states. | T006, T011 |
| T013 - Build summary and burndown UI slice | Medium | Chart interpretation, pace labels, nullable metrics, and accessible summaries may diverge from backend calculations. | T009, T012 |
| T014 - Implement status/blocker aggregates and issue response | Medium | Status totals and blocked count can disagree with rows; priority must not be treated as a blocker signal. | T005, T006, T011 |
| T015 - Build issue table and combined filters | Medium | Combined filters, counts, unassigned issues, and empty states can become inconsistent with the complete API issue set. | T009, T014 |
| T016 - Test issue, status, and blocker slice | Medium | Tests may cover individual filters but miss AND-combinations, unknown statuses, or flagged-versus-priority behavior. | T014, T015 |
| T017 - Implement team workload aggregation | Medium | Per-member sums can omit zero-work members, double-count unassigned work, or appear evaluative rather than descriptive. | T005, T011 |
| T018 - Build and test workload UI slice | Medium | UI totals may not reconcile with issue rows; visual encoding could imply ranking despite the non-evaluative requirement. | T009, T017 |
| T019 - Complete freshness and error behavior | Medium | `asOf`, 24-hour threshold, and retryability can be confused; invalid data must not be treated as transient. | T009, T011, T012 |
| T020 - Verify feature-slice integration | High | This is the first full-payload integration point; shared contract drift or inconsistent calculations can affect every dashboard region. | T013, T016, T018, T019 |
| T021 - Run clean-start integration workflow | High | A clean run depends on exact pins, Docker health, migrations, seed behavior, and local network configuration all working together. | T001-T020 |
| T022 - Run end-to-end acceptance tests | High | Browser tests can be flaky or fail to cover no-active/empty/stale/error states and combined filters. | T021 |
| T023 - Verify accessibility and responsive behavior | Medium | Automated checks alone may miss keyboard, chart comprehension, or viewport-specific layout defects. | T013, T015, T018, T022 |
| T024 - Document and hand off the local prototype | Low | Documentation can drift from actual pinned versions, commands, fixture behavior, or scope exclusions. | T001-T023 |

## Cross-Document Gaps and Contradictions

### 1. Phase 3 serial feature rule is not enforced by dependencies

**References**: Phase 3 in `spec/plan.md`; Task Rules and T014, T017, T019 in `spec/tasks.md`.

The plan and task rules require finishing one vertical feature slice before starting the next. However, T014 does not depend on T013, T017 does not depend on T016, and T019 does not depend on T018. Also, T007 can start without the full Phase 1 exit gate, and T011 can start before the Phase 2 exit gate/T010. A scheduler could therefore skip the declared phase and feature order.

**Recommendation**: Add dependencies T014 -> T013, T017 -> T016, and T019 -> T018. If phases are strict gates, make T007 depend on T001-T006 and T011 depend on T007-T010 (or add explicit phase-gate task IDs). Keep T020 dependent on all slice tests. If backend domain work is intentionally allowed in parallel with UI setup, document that exception in the plan instead.

### 2. CI workflow is required but has no owning task

**References**: T001, T002, T004 in `spec/tasks.md`; Phase 1 in `spec/plan.md`; Constitution: Technology and Operational Constraints.

T001 requires a clean CI job to verify pins, T004 requires migration verification in CI, and T002 establishes scripts, but no task explicitly creates or updates the CI workflow that runs those checks.

**Recommendation**: Add a Phase 1 task for the CI workflow, or expand T002/T001 with an explicit workflow file and acceptance criteria for install, lint, typecheck, unit tests, build, and PostgreSQL migration/seed verification.

### 3. Test and migration tooling selection is not assigned

**References**: T001, T004, T006, T016, T022 in `spec/tasks.md`; Plan Phase 1.

The tasks depend on migration tests, contract tests, browser tests, and CI, but no task selects/configures the migration framework, unit/API test runner, or browser test runner. T001's pin acceptance currently lists application/runtime versions but does not explicitly include these tools.

**Recommendation**: Extend T001 to select and pin the migration and test tools, and assign their initial configuration to T002/T004/T007 as appropriate. Record that exact tool versions are included in the lockfile.

### 4. Backend environment configuration is not a task-level deliverable

**References**: T002, T003 in `spec/tasks.md`; FR-021 and Constitution: configuration validation and secret handling.

T003 says database credentials come from server-side environment configuration, but no acceptance criterion requires startup validation or a safe `.env.example`. The prototype has no Jira secrets, but PostgreSQL still needs local credentials.

**Recommendation**: Add acceptance criteria to T002/T003 for validated DB settings, safe placeholder-only `.env.example`, secret redaction, and rejection of invalid/missing configuration without printing secret values.

### 5. Phase 1 API skeleton and Phase 3 API implementation need a clear contract boundary

**References**: T006, T012 in `spec/tasks.md`; API Contracts and FR-018 through FR-027 in `spec/specification.md`.

T006 defines the contract and registers a dashboard route without placeholder metrics; T012 later implements the complete response. This is coherent, but the transitional behavior for calling `/api/v1/dashboard` between those milestones is unspecified.

**Recommendation**: State that the frontend does not consume the dashboard route until T012 is complete, and define a temporary non-success `DASHBOARD_NOT_READY` response or keep the route unregistered until then. Do not return fake metrics.

### 6. API and task acceptance do not explicitly verify blocker summary/list totals

**References**: FR-012 and UI Screens in `spec/specification.md`; T014-T016 in `spec/tasks.md`.

T014 describes flagged-only blocker data and all issue rows, and T015 shows flagged state in the table. No acceptance criterion explicitly reconciles the aggregate blocker count/list against `flagged=true` rows.

**Recommendation**: Add a test criterion asserting the blocked count equals the number of flagged issues and that no priority value alone changes the count.

### 7. Build-time API schema validation versus runtime validation needs an implementation choice

**References**: FR-021; T006, T009, T020 in `spec/tasks.md`; API Contracts in `spec/specification.md`.

The tasks require API and browser response validation, but do not specify whether this uses shared runtime schemas, generated schemas, or TypeScript-only types. TypeScript types alone do not validate runtime payloads.

**Recommendation**: Require one shared runtime schema in `packages/contracts` and use it to validate both Express responses and browser responses; select and pin the schema library/tool in T001.

### 8. No task currently verifies the loopback boundary directly

**References**: FR-025 and SC-010; T002, T003, T007, T021-T023.

Loopback binding is specified for Express, Vite, and PostgreSQL, and T021 checks it generally, but no acceptance criterion inspects the actual listeners/network exposure.

**Recommendation**: Add an integration check that verifies services listen only on `127.0.0.1` and that PostgreSQL is not exposed on a non-loopback interface.

### 9. Complexity/scheduling inputs remain absent

**References**: All tasks in `spec/tasks.md`.

The task list has dependencies and acceptance criteria but no owner, effort estimate, target date, or planned parallelism. This is acceptable for a technical task breakdown, but not sufficient to produce a committed delivery schedule or sprint allocation.

**Recommendation**: Add owner/estimate fields only when the team is ready to schedule the work; preserve the current technical dependencies as the source of order.

## Missing or Unselected Artifacts

| Artifact or decision | Status | Impact |
|---|---|---|
| Exact runtime/dependency/image pins | Explicitly gated by T001 and the constitution | Blocks all implementation until recorded and verified. |
| CI workflow file | No owning task | Pin and migration checks cannot run until a workflow is added. |
| Migration/test/browser runner selection | Not assigned | T004, T006, T016, and T022 lack a concrete executable toolchain. |
| Safe local environment template/config validation | Not explicit in task acceptance | Local database startup and secret hygiene may be inconsistent. |
| API runtime contract schema library | Not selected | Type-only contracts would not satisfy runtime response validation. |
| Test owner/effort/schedule | Not included | Prevents reliable delivery estimates and resource allocation. |

## Dependency and Risk Summary

- **Dependency-aware critical path**: T001 -> (T002 and T003 in parallel) -> T004 -> (T005 and T006 in parallel) -> T007 -> T008 -> T009 -> T010 -> T011 -> T012 -> T013 -> T014 -> T015 -> T016 -> T017 -> T018 -> T019 -> T020 -> T021 -> T022 -> T023 -> T024. This assumes the phase/feature gates recommended above are added; the current task graph does not yet enforce them.
- **Highest complexity/risk**: T001, T004, T005, T011, T012, T020, T021, and T022.
- **Low-risk/high-gain early work**: Once T001 passes, T003 gives early database/network validation; T006 establishes the API contract and health surface; after the Phase 1 gate, T008 produces a visible dashboard shell. Keep these inside their dependency gates.
- **Parallelizable setup**: After T001, T002 and T003 can proceed in parallel. After T004, T005 and T006 can proceed in parallel. Avoid parallelizing Phase 3 feature slices until their dependency edges enforce the stated order.
- **Principal project risk**: absent exact pins and CI/test tooling block reproducible validation before feature work begins.
- **Scope consistency**: The plan/task set matches the prototype spec's loopback-only, fictional-data-only boundary. It correctly uses `flagged` as the sole blocker signal and excludes AES secret encryption because no Jira secrets are present.