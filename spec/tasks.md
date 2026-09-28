# Implementation Tasks: Sprint Summary and Confluence Publishing

- **Source plan**: `spec/plan.md`
- **Feature specification**: `spec/specification.md`
- **Constitution**: `spec/constitution.md`
- **Status**: Draft
**Task status convention**: All tasks begin as `Not started`; do not start a task whose decision or prerequisite dependencies are unresolved.

## Task Rules

- Task IDs are stable references; do not renumber tasks after work begins. Add new IDs at the end of the relevant phase or update references deliberately.
- Acceptance criteria are required for completion. Link implementation changes, tests, and decisions to these task IDs.
- `Depends on: None` means the task can start without another task in this list; it does not waive product/security review.
- Tasks that depend on unresolved Phase 0 decisions remain blocked until those decisions are recorded in `spec/specification.md`.
- External-service tests use mocks by default. Live integration is restricted to a deliberate non-production sandbox run.

## Phase 0 - Resolve Product and Data Decisions

### T001 - Confirm V1 reporting scope

- **Milestone**: M0
- **Depends on**: None
- **Specification**: Summary; FR-015, FR-026; Out of Scope for V1
- **Acceptance criteria**:
  - Product owner records whether V1 supports closed sprints only or explicitly includes release/version reports.
  - If V1 is sprint-only, release references are removed or clearly marked future scope in the feature spec.
  - If releases are included, selection, data source, metrics, report sections, and acceptance scenarios are added before implementation tasks are unblocked.

### T002 - Decide identity and audience access

- **Milestone**: M0
- **Depends on**: None
- **Specification**: User Stories 1, 3, 4, 5; FR-003, FR-023; constitution principles 1, 2, and 4
- **Acceptance criteria**:
  - The deployment model is recorded as either private single-user or authenticated multi-user.
  - Allowed roles/actions are specified for configuration, viewing, editing, importing, and publishing.
  - The visibility of issue-level appendix content is explicitly approved or a separation/redaction policy is specified.
  - The approved rules are added to the feature spec and cover attribution/auditing for publication actions.

### T003 - Confirm Atlassian platforms and authentication

- **Milestone**: M0
- **Depends on**: None
- **Specification**: FR-003 through FR-007; Clarifications Needed: Jira deployment
- **Acceptance criteria**:
  - Jira and Confluence deployment types and API versions are recorded independently.
  - Authentication methods and least-privilege permissions are documented for both services.
  - Required non-secret configuration values and secret-provisioning/rotation expectations are specified.
  - The configuration and adapter design can be tested without live credentials.

### T004 - Define historical sprint and metric rules

- **Milestone**: M0
- **Depends on**: T003
- **Specification**: FR-010, FR-011, FR-013, FR-014, FR-017, FR-018; SC-003
- **Acceptance criteria**:
  - The authoritative source and as-of rule for sprint membership and status at close are documented.
  - Rules cover issues added/removed after close, reopened issues, estimates changed after commitment, and unavailable changelog data.
  - The estimation field, included issue types, commitment cutoff, completed-point numerator, denominator, rounding, and missing-estimate behavior are specified.
  - At least one example dataset and expected classification/metric result are recorded for tests.

### T005 - Define risk, date, and incomplete-data policies

- **Milestone**: M0
- **Depends on**: T003, T004
- **Specification**: FR-012, FR-014, FR-018; SC-003
- **Acceptance criteria**:
  - Flag detection mechanism and qualifying values are defined.
  - Stale threshold, calendar/business-day basis, timezone, timestamp, and evaluation date are defined.
  - Duplicate risk causes and user-visible reasons have an explicit rendering rule.
  - The spec states when incomplete Jira data blocks publication versus permits it with an explicit warning/override.

### T006 - Select executive-summary generation method

- **Milestone**: M0
- **Depends on**: T002, T004
- **Specification**: Summary; FR-016; SC-002
- **Acceptance criteria**:
  - The method is selected as deterministic generation or an approved LLM-based approach.
  - If an LLM is selected, provider/model, allowed data, privacy constraints, grounding/validation, failure behavior, and cost/availability expectations are recorded.
  - The rules prevent unsupported facts and preserve missing-data indicators for reviewer visibility.
  - The chosen method is reflected in the feature spec and test examples.

### T007 - Define configuration, draft lifecycle, and retention

- **Milestone**: M0
- **Depends on**: T002
- **Specification**: FR-004, FR-005, FR-019 through FR-021, FR-027, FR-029; Key Entities
- **Acceptance criteria**:
  - Configuration ownership is decided: deployment-time environment settings or authorized administration UI.
  - Draft identity, regeneration behavior, revision creation, immutable published revisions, stale/concurrent edit behavior, and imported-file matching are specified.
  - Persisted Jira fields, retention/deletion, report snapshot behavior, and access expectations are documented.
  - The feature spec defines how generation, draft, review, failed publish, and published states relate.

### T008 - Define Markdown and publish recovery behavior

- **Milestone**: M0
- **Depends on**: T002, T003, T007
- **Specification**: FR-020 through FR-028; SC-004 through SC-006
- **Acceptance criteria**:
  - Supported Markdown, safe rendering/sanitization, unsupported syntax, and confirmation-preview fidelity are specified.
  - The page-title convention and title-collision behavior are decided.
  - Publish operation identity, retry/idempotency, uncertain remote outcomes, reconciliation, and recovery after database failure are defined.
  - A new intentional republish is distinguishable from retrying an existing operation.

### T009 - Baseline approved requirements and metadata

- **Milestone**: M0
- **Depends on**: T001 through T008
- **Specification**: All open clarifications; Constitution Check
- **Acceptance criteria**:
  - Accepted decisions are incorporated into `spec/specification.md` with testable acceptance criteria.
  - Resolved items in `spec/clarify.md` link to the corresponding decision or updated requirement.
  - V1 scope and product/security approval are recorded; no P0 item remains open for dependent implementation.
  - Feature branch and status metadata are updated when implementation is scheduled.

## Phase 1 - Application and Environment Foundation

### T010 - Establish JavaScript workspace and toolchain

- **Milestone**: M1
- **Depends on**: T009
- **Specification**: FR-001; plan Phase 1
- **Acceptance criteria**:
  - A package manager, supported Node.js runtime, workspace layout, and dependency version policy are documented and configured.
  - Root scripts provide consistent install, development, build, test, lint, and typecheck entry points.
  - Existing Python tooling remains intact unless a separate approved change says otherwise.

### T011 - Bootstrap React and Vite application

- **Milestone**: M1
- **Depends on**: T010
- **Specification**: FR-001
- **Acceptance criteria**:
  - `apps/web` runs React 18 through Vite using the agreed TypeScript/build conventions.
  - The application has a minimal renderable entry point and a documented local start command.
  - The production build succeeds without exposing server credentials or secrets in browser assets.

### T012 - Bootstrap Express API application

- **Milestone**: M1
- **Depends on**: T010
- **Specification**: FR-001, FR-002
- **Acceptance criteria**:
  - `apps/api` starts an Express server with a consistent error boundary and JSON response conventions.
  - Server startup fails clearly on invalid required settings without printing secret values.
  - The API can be built/tested from the root workspace scripts.

### T013 - Establish shared API contracts

- **Milestone**: M1
- **Depends on**: T010
- **Specification**: Constitution: Explicit Application Boundaries and Development Workflow
- **Acceptance criteria**:
  - `packages/contracts` publishes shared, versionable request/response and error types or schemas.
  - Frontend and API consume the same contract definitions rather than maintaining duplicate shapes.
  - Contract checks run in CI and reject incompatible changes without an explicit version/update path.

### T014 - Add PostgreSQL 15 Docker development service

- **Milestone**: M1
- **Depends on**: T010
- **Specification**: FR-001; Constitution: Technology and Operational Constraints
- **Acceptance criteria**:
  - A documented Docker workflow starts PostgreSQL 15 with a health check and persistent local development storage.
  - Application configuration connects to the service without embedding credentials in source or browser code.
  - A clean local start and stop procedure is documented.

### T015 - Add versioned migration tooling

- **Milestone**: M1
- **Depends on**: T014
- **Specification**: Constitution: Testable Changes and Technology Constraints
- **Acceptance criteria**:
  - A migration tool and scripts are configured for PostgreSQL.
  - A clean database can apply the initial migration path and report its migration state.
  - Migration verification is automated; no application behavior depends on manual schema edits.

### T016 - Add health endpoints and safe environment example

- **Milestone**: M1
- **Depends on**: T011, T012, T014
- **Specification**: FR-003 through FR-005; SC-008
- **Acceptance criteria**:
  - API liveness/readiness behavior distinguishes process health from required dependency readiness.
  - The web application can identify API unavailability without exposing backend configuration.
  - `.env.example` documents required server settings with placeholders only; secret values are not committed or exposed through Vite variables.

### T017 - Add continuous integration quality gates

- **Milestone**: M1
- **Depends on**: T011 through T016
- **Specification**: Constitution: Testable Changes; plan Phase 1
- **Acceptance criteria**:
  - CI installs dependencies reproducibly and runs lint, typecheck, unit tests, and production builds.
  - CI verifies database migrations against a disposable PostgreSQL 15 service.
  - CI requires no live Jira/Confluence credentials and performs no remote page creation.

## Phase 2 - Identity, Configuration, and Atlassian Adapters

### T018 - Enforce approved user access model

- **Milestone**: M2
- **Depends on**: T002, T012, T013, T017
- **Specification**: User Stories 1, 3, 4, 5; FR-002, FR-023
- **Acceptance criteria**:
  - The approved single-user boundary or authentication/role model is enforced on backend routes.
  - Unauthorized users cannot read/edit drafts, change configuration, or publish.
  - Security tests verify access controls and attribution rules without live Atlassian services.

### T019 - Implement server-side configuration and secret loading

- **Milestone**: M2
- **Depends on**: T003, T007, T012, T016
- **Specification**: FR-003 through FR-006; SC-008
- **Acceptance criteria**:
  - Jira and Confluence settings are loaded and validated using the approved configuration ownership model.
  - Missing or invalid settings identify the non-secret field that needs correction.
  - Secrets are never returned to the client, written to report data, or included in logs/errors.

### T020 - Implement Jira service adapter

- **Milestone**: M2
- **Depends on**: T003, T019
- **Specification**: FR-002, FR-005 through FR-010
- **Acceptance criteria**:
  - Jira API requests use the approved endpoint/authentication and required least-privilege credentials.
  - Adapter methods return normalized service results and map expected authentication/not-found/rate-limit failures.
  - Unit tests use mocked Jira responses and verify credentials are not leaked.

### T021 - Implement Confluence service adapter and read-only check

- **Milestone**: M2
- **Depends on**: T003, T019
- **Specification**: FR-002, FR-005 through FR-007; User Story 1
- **Acceptance criteria**:
  - The adapter validates configured site/space/parent access using the approved deployment API.
  - A connectivity/destination check is read-only and cannot create or update a page.
  - Tests verify expected responses and safe mapping of auth, permission, and network failures.

### T022 - Add bounded external request handling

- **Milestone**: M2
- **Depends on**: T020, T021
- **Specification**: FR-007; constitution: external service calls
- **Acceptance criteria**:
  - Jira and Confluence calls use bounded timeouts and approved retry/backoff behavior for transient errors and rate limits.
  - Jira list requests follow all required pagination tokens/pages rather than silently truncating results.
  - Cancellation and partial/failed responses are surfaced according to the approved policy and do not discard saved drafts.

### T023 - Define configuration and sprint-list API routes

- **Milestone**: M2
- **Depends on**: T013, T018, T019, T020, T021
- **Specification**: FR-002, FR-004, FR-005, FR-008; User Story 1
- **Acceptance criteria**:
  - Versioned routes expose only approved non-secret configuration status and closed-sprint selection data.
  - Request/response schemas and errors use shared contracts and validate inputs at the boundary.
  - The browser does not call Jira or Confluence directly.

### T024 - Verify Atlassian adapter security and failures

- **Milestone**: M2
- **Depends on**: T018 through T023
- **Specification**: FR-003 through FR-007; SC-008
- **Acceptance criteria**:
  - Mock tests cover missing config, invalid auth, permission failure, timeout, rate limit, pagination, and sanitized errors.
  - Tests prove no credential appears in logs, client responses, or generated browser assets.
  - The configuration check cannot issue a Confluence page-creation request.

## Phase 3 - Jira Snapshot and Report Domain Rules

### T025 - Implement closed sprint discovery and selection

- **Milestone**: M3
- **Depends on**: T004, T020, T022, T023
- **Specification**: FR-008, FR-009; SC-001
- **Acceptance criteria**:
  - The API returns all closed sprints for the configured board, including identifiers and required dates.
  - The default is the most recently closed sprint using the approved timezone/tie-break rule.
  - A user can select a historical sprint by ID or unambiguous name; invalid/ambiguous selection returns an actionable error.

### T026 - Fetch sprint issues and historical status

- **Milestone**: M3
- **Depends on**: T004, T020, T022, T025
- **Specification**: FR-010, FR-011, FR-014
- **Acceptance criteria**:
  - All required sprint issues and approved history/changelog data are retrieved with complete pagination.
  - Membership/status values are interpreted using the accepted sprint-close rules.
  - Unavailable history or partial Jira responses are marked explicitly and never silently treated as a complete snapshot.

### T027 - Persist normalized Jira source snapshots

- **Milestone**: M3
- **Depends on**: T007, T015, T026
- **Specification**: FR-019; Key Entities: Sprint and Issue Snapshot
- **Acceptance criteria**:
  - A versioned migration adds only the approved minimum snapshot fields and retention metadata.
  - Normalized sprint/issue snapshots retain source identity and capture time sufficient to explain report results.
  - Migration and repository tests verify clean install, persistence, retrieval, and documented recovery behavior.

### T028 - Implement sprint classification and metric rules

- **Milestone**: M3
- **Depends on**: T004, T005, T026
- **Specification**: FR-011 through FR-013, FR-017, FR-018; SC-003
- **Acceptance criteria**:
  - Completed, incomplete, committed points, completed points, and completion percentage follow the accepted rules.
  - Missing estimates, zero commitments, moved/reopened issues, estimate changes, and subtasks follow defined behavior.
  - Pure domain functions return deterministic results for the same normalized input.

### T029 - Represent incomplete and ambiguous report data

- **Milestone**: M3
- **Depends on**: T005, T026, T028
- **Specification**: FR-014; User Story 2 scenario 4
- **Acceptance criteria**:
  - Source limitations and incomplete-data reasons are represented in domain/API output.
  - The approved publish gate blocks or warns/requests override for incomplete data as specified.
  - The UI/API cannot mistake a partial Jira result for a complete sprint result.

### T030 - Add Jira domain fixtures and tests

- **Milestone**: M3
- **Depends on**: T027 through T029
- **Specification**: SC-003, SC-007
- **Acceptance criteria**:
  - Fixtures cover pagination, historical status, membership changes, reopened issues, estimate changes, missing estimates, zero points, risk boundaries, and unavailable history.
  - Expected metrics/classifications are tied to approved examples from T004/T005.
  - Domain and repository tests run without live Jira access.

## Phase 4 - Report Generation and Draft Persistence

### T031 - Implement approved executive summary generator

- **Milestone**: M4
- **Depends on**: T006, T028, T029
- **Specification**: FR-016; SC-002
- **Acceptance criteria**:
  - The selected deterministic or approved LLM method generates a plain-language summary from verified report facts only.
  - Generated content contains no issue keys or unsupported claims and reflects missing/ambiguous source data.
  - Provider/service failure follows the approved fallback and does not lose the source snapshot or existing draft.

### T032 - Render complete ordered Markdown report

- **Milestone**: M4
- **Depends on**: T001, T028, T031
- **Specification**: FR-015 through FR-018; SC-002
- **Acceptance criteria**:
  - Markdown includes all seven required sections in the specified order.
  - Metadata, metrics, completed/incomplete tables, risk reasons, and detailed appendix use the approved field and missing-value rules.
  - Executive summary remains plain-language and issue identifiers remain outside that section.

### T033 - Apply approved audience separation and redaction

- **Milestone**: M4
- **Depends on**: T002, T032
- **Specification**: Constitution principle 4; FR-016, FR-018
- **Acceptance criteria**:
  - The generated and publishable content follows the approved stakeholder/internal visibility policy.
  - Internal-only fields are omitted, redacted, or placed in a separately permissioned output as decided.
  - Tests verify external-facing output cannot include content prohibited by the policy.

### T034 - Persist draft revisions and metadata

- **Milestone**: M4
- **Depends on**: T007, T015, T027
- **Specification**: FR-019, FR-027; Key Entities: Report Draft
- **Acceptance criteria**:
  - Versioned migrations and repositories persist draft content, source sprint/snapshot reference, generation time, status, and revision metadata.
  - Draft reads return the revision and metadata authorized for the caller.
  - Retention and deletion follow the approved policy; migrations are tested from a clean database.

### T035 - Implement draft lifecycle and regeneration rules

- **Milestone**: M4
- **Depends on**: T007, T034
- **Specification**: FR-019 through FR-021
- **Acceptance criteria**:
  - Generation/regeneration creates or updates drafts according to the approved identity/version rules.
  - Published revisions remain immutable; edits and stale concurrent saves follow the approved conflict behavior.
  - Failure during generation preserves previously saved revisions and state accurately.

### T036 - Add report-generation and draft APIs

- **Milestone**: M4
- **Depends on**: T013, T018, T027 through T035
- **Specification**: FR-019 through FR-022; User Stories 2 and 3
- **Acceptance criteria**:
  - Versioned contract routes support report generation and authorized draft retrieval/save.
  - Inputs, payloads, and persisted content are validated and errors use the common non-sensitive format.
  - Generate/save operations have no Confluence side effect and expose operation status/progress as specified.

### T037 - Test report assembly and persistence

- **Milestone**: M4
- **Depends on**: T031 through T036
- **Specification**: SC-002 through SC-004, SC-007
- **Acceptance criteria**:
  - Tests verify section order, output fields, privacy policy, missing-data language, revisions, regeneration, and concurrent/stale edits.
  - Tests verify no Jira/Confluence live calls are required and generation never publishes.
  - Saved and reloaded content matches the generated/reviewed revision exactly.

## Phase 5 - Review, Edit, Import, and Export Workflow

### T038 - Build sprint selection and generation UI

- **Milestone**: M5
- **Depends on**: T023, T025, T036
- **Specification**: User Story 2; FR-008, FR-009; SC-001
- **Acceptance criteria**:
  - UI defaults to the latest closed sprint and permits historical sprint selection.
  - The user can start generation and sees the selected sprint identity before processing.
  - Invalid/empty sprint results provide a useful recoverable state.

### T039 - Implement operation progress and result states

- **Milestone**: M5
- **Depends on**: T036, T038
- **Specification**: User Story 2 scenario 5; Constitution: Validated and Accessible User Workflows
- **Acceptance criteria**:
  - Long-running work exposes progress and distinct success, incomplete, and failure results.
  - Duplicate generation clicks are prevented or safely deduplicated.
  - Status changes are announced accessibly and failures provide a retry path that preserves saved drafts.

### T040 - Build draft review, edit, and save UI

- **Milestone**: M5
- **Depends on**: T033 through T036
- **Specification**: User Story 3; FR-020
- **Acceptance criteria**:
  - User can open an authorized draft and see source sprint, generation time, review status, and content.
  - User can edit and save content; successful save displays the persisted revision/timestamp.
  - Unsaved or conflicting changes are surfaced and cannot be silently discarded.

### T041 - Implement safe Markdown preview and editor behavior

- **Milestone**: M5
- **Depends on**: T008, T032, T040
- **Specification**: FR-020, FR-023, FR-024
- **Acceptance criteria**:
  - Preview supports the approved Markdown subset and sanitizes imported/user-edited content.
  - Unsupported syntax is handled using the accepted policy and does not silently render as executable content.
  - The preview clearly identifies incomplete data and distinguishes stakeholder/internal sections per T033.

### T042 - Implement Markdown download and re-import

- **Milestone**: M5
- **Depends on**: T007, T008, T035, T040, T041
- **Specification**: FR-020, FR-021
- **Acceptance criteria**:
  - A saved revision downloads as a UTF-8 Markdown file with a documented filename/content convention.
  - Import validates file type/size/content and matches it to the correct draft under the approved identity policy.
  - Malformed, stale, or conflicting imports show actionable errors and do not overwrite the current revision silently.

### T043 - Verify accessible review workflow

- **Milestone**: M5
- **Depends on**: T038 through T042
- **Specification**: Constitution: Validated and Accessible User Workflows; SC-008
- **Acceptance criteria**:
  - Review workflow controls are keyboard-operable and have accessible labels/status announcements.
  - Automated component/API tests cover save/reload fidelity, error states, input validation, and unsafe Markdown handling.
  - The agreed accessibility target is checked for the changed workflow.

## Phase 6 - Confirmed Confluence Publishing

### T044 - Convert Markdown and verify publish preview fidelity

- **Milestone**: M6
- **Depends on**: T008, T032, T041
- **Specification**: FR-024; User Story 4
- **Acceptance criteria**:
  - Supported Markdown converts to the configured Confluence representation.
  - Conversion rejects/reports unsupported constructs according to the approved policy.
  - Confirmation preview content corresponds to the content that will be sent to Confluence.

### T045 - Build explicit publish confirmation UI

- **Milestone**: M6
- **Depends on**: T002, T033, T040, T044
- **Specification**: FR-023; SC-004
- **Acceptance criteria**:
  - Publish confirmation identifies destination, page title, audience, exact draft revision, and content preview.
  - Cancel/close performs no publish request and preserves the draft.
  - Confirmation is available only to authorized users and for a saved/eligible reviewed revision.

### T046 - Implement publish-operation identity and recovery

- **Milestone**: M6
- **Depends on**: T008, T015, T034, T044
- **Specification**: FR-027, FR-028; SC-006
- **Acceptance criteria**:
  - A migration stores operation identity, draft revision, state, timestamps, and reconciliation data.
  - Retries reuse the same operation identity; an intentional republish creates a separate confirmed operation.
  - Timeout-after-create and database-failure-after-remote-success cases can be reconciled without blindly creating duplicates.

### T047 - Create Confluence child-page publish API

- **Milestone**: M6
- **Depends on**: T003, T021, T022, T044, T045, T046
- **Specification**: FR-023 through FR-026; SC-005
- **Acceptance criteria**:
  - The backend revalidates authorization, confirmation, draft revision, destination, and publish-operation state before the external create call.
  - A confirmed operation creates a new child page under the configured parent/space with the accepted title convention.
  - Existing pages are never overwritten; errors do not expose tokens or sensitive upstream details.

### T048 - Persist publish outcome and expose status

- **Milestone**: M6
- **Depends on**: T046, T047
- **Specification**: FR-027 through FR-029; SC-005, SC-006
- **Acceptance criteria**:
  - Successful page ID/title/URL/time and exact draft revision are recorded.
  - Failed and unknown outcomes remain distinct from success and have a safe recovery/status path.
  - Status retrieval is authorized and uses the shared versioned API contract.

### T049 - Test publishing safeguards and failure paths

- **Milestone**: M6
- **Depends on**: T044 through T048
- **Specification**: FR-022 through FR-028; SC-004 through SC-007
- **Acceptance criteria**:
  - Mocked tests cover cancellation, no-confirmation API access, success, auth failure, conversion failure, timeout-after-create, persistence failure, retry, and intentional republish.
  - One operation cannot create duplicates; distinct confirmed operations can create separate pages.
  - Routine tests never issue a request to a production Confluence space.

## Phase 7 - History, End-to-End Validation, and Release Readiness

### T050 - Implement report history API

- **Milestone**: M7
- **Depends on**: T007, T034, T035, T048
- **Specification**: FR-027, FR-029; User Story 5
- **Acceptance criteria**:
  - Authorized history results follow the approved units, retention, filtering, ordering, and state semantics.
  - Drafts, revisions, failed/unknown operations, and successful pages are distinguishable.
  - Successful entries include a valid stored Confluence page reference where available.

### T051 - Build report history UI

- **Milestone**: M7
- **Depends on**: T043, T050
- **Specification**: User Story 5; FR-029
- **Acceptance criteria**:
  - User can view history entries with sprint identity, generation time, and accurate draft/publish state.
  - Successful entries link to Confluence; failed/unknown entries are not presented as published.
  - History is keyboard accessible and reports empty/loading/error states clearly.

### T052 - Run mocked end-to-end workflow tests

- **Milestone**: M7
- **Depends on**: T037, T043, T049, T051
- **Specification**: SC-001 through SC-008
- **Acceptance criteria**:
  - Automated tests exercise select, generate, review/edit, save, confirm/cancel, publish status, and history as one workflow.
  - Jira and Confluence are mocked; no live credentials or external page creation are needed.
  - Tests assert security, audience policy, incomplete-data behavior, and reviewed-revision identity.

### T053 - Perform sandbox-only Atlassian end-to-end validation

- **Milestone**: M7
- **Depends on**: T003, T047 through T052
- **Specification**: User Stories 1-5; Dependencies and Constraints
- **Acceptance criteria**:
  - A deliberate manual test uses least-privilege sandbox credentials and a non-production Confluence space.
  - The test verifies sprint retrieval, report accuracy against known data, permissions, rendered conversion, parent page, title, and URL.
  - Test evidence is recorded and cleanup/retention expectations are followed; no production stakeholder page is created.

### T054 - Verify operational and non-functional readiness

- **Milestone**: M7
- **Depends on**: T014, T015, T017, T022, T043, T049, T053
- **Specification**: Constitution: Technology and Operational Constraints; SC-008
- **Acceptance criteria**:
  - Docker startup, migration, backup/restore, secret provisioning/redaction, timeout/rate-limit, and recovery procedures are exercised or verified.
  - Agreed performance, accessibility, supported-client, and concurrency targets pass documented checks.
  - Production and sandbox settings are separated and no production credentials are required for routine CI.

### T055 - Complete documentation and release sign-off

- **Milestone**: M7
- **Depends on**: T009, T050 through T054
- **Specification**: All user stories, FRs, SCs; Constitution: Development Workflow and Governance
- **Acceptance criteria**:
  - Setup, configuration, user workflow, operations, troubleshooting, and known limitations are documented.
  - Each functional requirement and success criterion links to test or sandbox evidence; unresolved items are explicitly listed.
  - Product and security reviewers approve the release scope and evidence before V1 is declared ready.

## Milestone Gates

| Milestone | Required tasks | Gate |
|---|---|---|
| M0 | T001-T009 | Product scope and P0 decisions recorded; dependent implementation may start. |
| M1 | T010-T017 | Clean-checkout web/API/database startup and CI gates work. |
| M2 | T018-T024 | Access model, server config, mocked service adapters, and sprint-list API are secure. |
| M3 | T025-T030 | Sprint snapshots and domain rules are deterministic and tested. |
| M4 | T031-T037 | Complete report drafts persist and generation cannot publish. |
| M5 | T038-T043 | Review/edit/import/export workflow preserves the exact reviewed revision. |
| M6 | T044-T049 | Confirmed publishing creates new pages and retries are recoverable/idempotent. |
| M7 | T050-T055 | History, end-to-end evidence, operations, and sign-off are complete. |

## Cross-Cutting Rules

- Database changes require versioned migrations and verification; tests must cover clean database setup.
- Changes crossing frontend/backend boundaries update `packages/contracts` and verify both producer and consumer behavior.
- No Jira/Confluence credentials may enter browser assets, client responses, report content, or logs.
- Generation and draft saving never publish. Page creation requires backend-enforced confirmation for the exact reviewed revision.
- Live Atlassian writes are limited to T053 in a non-production sandbox; all routine automated tests use mocks.