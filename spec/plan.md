# Implementation Plan: Sprint Summary and Confluence Publishing

- **Feature**: `spec/specification.md`
- **Constitution**: `spec/constitution.md`
- **Clarifications**: `spec/clarify.md`
- **Status**: Draft
**Plan date**: 2026-09-28

## Goal

Deliver a browser-based workflow for selecting a completed Jira sprint, generating and saving a report draft, reviewing/editing the draft, and explicitly publishing a confirmed version as a new Confluence child page. Implementation must follow the constitution and must not invent answers to unresolved requirements.

## Current Repository Baseline

- `apps/api/src/server.ts`, `apps/web/src/App.tsx`, `apps/web/src/main.tsx`, and `packages/contracts/src/index.ts` exist but are empty.
- The API route/service folders and web feature folders contain placeholders only.
- No JavaScript package manifests were found; the Node/React workspace, dependencies, scripts, and CI checks need to be established.
- The root `.env.example` currently documents Jira/Confluence variables for the older Python workflow. Treat these values as a reference only; adapt configuration for the server-side web application and never put secrets in Vite-exposed variables.
- No PostgreSQL schema or migration framework is present in the inspected application paths.

## Delivery Strategy

Build in vertical slices with mocked Atlassian services first. Start work that is independent of product decisions in the foundation phase, but do not implement report semantics, authentication, audience controls, or LLM behavior until the relevant P0 clarifications are accepted. Keep Confluence page creation disabled in local/CI tests unless a deliberate sandbox-only end-to-end run is being performed.

## Phase 0 - Resolve Product and Data Decisions

**Purpose**: Remove decisions that could produce incorrect sprint metrics, expose internal information, or publish duplicate pages.

**Milestone M0: Implementation baseline approved**

- Resolve all P0 findings in `spec/clarify.md`: user identity/authorization; stakeholder versus appendix visibility; Jira/Confluence deployment and authentication; historical sprint membership/status source; point formulas; risk policy; and executive-summary generation method and data handling.
- Resolve P1 decisions needed for architecture: configuration ownership, draft/revision lifecycle, publish idempotency and reconciliation, data retention, Markdown handling, and release scope.
- Update `spec/specification.md` with decisions, acceptance criteria, and any revised scope; update `spec/clarify.md` to mark resolved items with decision references.
- Assign the feature branch and replace `TBD` metadata when implementation is scheduled.

**Exit criteria**: No unresolved P0 decision affects security, report correctness, audience visibility, or publish behavior. Product owner approves the revised requirements and V1 closed-sprint-only scope; release/version reporting remains deferred unless separately specified.

## Phase 1 - Application and Environment Foundation

**Purpose**: Create a reproducible React/Express/PostgreSQL development baseline.

**Milestone M1: Local vertical slice boots**

- Establish the JavaScript workspace/package layout, pinned runtime/dependency versions, and root development/build/test/lint/typecheck scripts.
- Configure React 18 + Vite for `apps/web`, Node.js + Express for `apps/api`, and shared TypeScript/API types in `packages/contracts`.
- Add Docker Compose (or the repository's chosen Docker workflow) for PostgreSQL 15 with persistent local development storage and health checks.
- Add versioned database migration tooling and an initial migration/bootstrap path. Avoid undocumented manual schema changes.
- Implement minimal API and web startup/health paths, environment validation, and a safe `.env.example`; ensure browser-exposed variables contain no credentials.
- Add CI checks for install, typecheck, lint, tests, build, and migration verification.

**Exit criteria**: A clean checkout can start the web app, API, and database using documented commands; health checks succeed; CI passes; no secret is needed or committed for the smoke path.

## Phase 2 - Identity, Configuration, and Atlassian Adapters

**Purpose**: Establish the approved access model and isolate external services behind backend adapters.

**Milestone M2: Secure service connectivity**

- Implement the approved authentication/authorization model, or document and enforce private single-user deployment boundaries if that is the approved choice.
- Implement validated server-side Jira and Confluence configuration, secret loading, redacted logs, and configuration/connection status behavior.
- Add Jira and Confluence service modules under `apps/api/src/services/`; keep credentials and network calls out of the browser.
- Implement bounded timeouts, pagination, rate-limit/transient-error handling, and safe error translation.
- Define and publish versioned API contracts for configuration status and closed-sprint listing, including response and error schemas.
- Add mocked adapter tests and security checks for secret redaction and authorization.

**Exit criteria**: Authorized users can list closed sprints from a mock Jira service; service errors are actionable and non-sensitive; no request bypasses the backend; no live Confluence page can be created from configuration checks.

## Phase 3 - Jira Snapshot and Report Domain Rules

**Purpose**: Make sprint data and report calculations correct and independently testable.

**Milestone M3: Reproducible sprint facts**

- Implement closed-sprint discovery, latest-closed default selection, and explicit selection by sprint ID/name.
- Retrieve all required pages of sprint issues and the history needed to apply the approved sprint-close membership and status rules.
- Normalize Jira responses into domain types and a persisted/source snapshot sufficient to reproduce the report under the approved retention policy.
- Implement completed/incomplete classification, point calculations, completion percentage, and risk detection as pure domain services using the accepted rules.
- Represent missing, ambiguous, or historically unavailable data explicitly; mark incomplete results so the publish gate can enforce the approved policy.
- Add fixtures for estimate changes, missing estimates, zero points, reopened/moved issues, duplicate risk reasons, boundary dates, pagination, and unavailable history.

**Exit criteria**: Domain tests match accepted examples for every metric/classification rule; incomplete source data is surfaced; the same input snapshot produces deterministic domain results.

## Phase 4 - Report Generation and Draft Persistence

**Purpose**: Produce complete, traceable, editable drafts without side effects in Confluence.

**Milestone M4: Generated draft is durable**

- Implement the approved executive-summary method with grounding and data-handling safeguards.
- Generate Markdown sections in the required order: metadata, executive summary, metrics, completed work, incomplete work, risks/blockers, and appendix.
- Apply the approved audience-separation/redaction policy to stakeholder and internal content.
- Add PostgreSQL migrations and repositories for sprint/source snapshots, draft content, revisions, status, and generation metadata.
- Define regeneration behavior, draft identity, version creation, stale-write/concurrent-edit handling, and error recovery per accepted decisions.
- Implement backend report-generation and draft-read/save APIs using shared contracts; generation and saving must not publish.
- Test required sections, output correctness, persistence, regeneration, incomplete-data behavior, and no-publish guarantees with mocks.

**Exit criteria**: A mock Jira sprint generates a durable, reproducible draft with all required sections and metadata; a failed generation preserves prior saved drafts; no Confluence request is made.

## Phase 5 - Review, Edit, Import, and Export Workflow

**Purpose**: Let an authorized Project Manager review and edit the exact content that will be published.

**Milestone M5: Reviewable draft workflow complete**

- Build the React workflow for sprint selection, generation progress, draft status, editing, saving, and source limitations.
- Implement accessible loading, empty, error, success, and incomplete-data states with keyboard-operable controls and clear status feedback.
- Implement Markdown rendering and editing using the approved supported syntax and sanitization rules.
- Implement Markdown download and re-import with size/type validation, draft matching, revision checks, and useful parse errors.
- Ensure the user can compare or identify generated versus edited content and that unsaved/stale edits are not silently lost.
- Add component/API tests for keyboard behavior, accessibility requirements, sanitization, and saved-content fidelity.

**Exit criteria**: A draft can be generated, edited, saved, downloaded, re-imported, and reopened; the persisted revision is the one supplied to the publish confirmation; unsafe content is not executed or silently accepted.

## Phase 6 - Confirmed Confluence Publishing

**Purpose**: Publish the reviewed revision safely and recoverably.

**Milestone M6: New-page publishing is safe to retry**

- Implement Markdown-to-Confluence conversion for the supported syntax and ensure the confirmation preview matches the converted output.
- Build the explicit confirmation step showing destination, title, audience/content, and the exact draft revision.
- Implement the approved page title convention and new child-page creation under the configured space/parent.
- Persist publish operation identity and state before/after external requests; implement idempotent retries and reconciliation for timeout/ambiguous outcomes.
- Preserve previous pages and support a separately confirmed intentional republish as a distinct operation.
- Record successful page ID/title/URL/time and the exact draft revision; record failed/unknown outcomes without claiming success.
- Add mocked tests for cancel-before-publish, confirmed success, authorization failure, conversion errors, timeout-after-create, database failure after remote success, retry, and intentional republish.

**Exit criteria**: No page is created without explicit confirmation; one operation cannot accidentally create duplicate pages; a distinct confirmed republish creates a new page; the app accurately represents success, failure, or uncertain outcome.

## Phase 7 - History, End-to-End Validation, and Release Readiness

**Purpose**: Complete the user workflow and verify operational behavior against the acceptance criteria.

**Milestone M7: V1 acceptance and deployment readiness**

- Implement history listing for drafts, revisions, failed/unknown publish operations, and successful Confluence pages according to the approved history semantics.
- Add end-to-end tests using fixtures and mocked Atlassian services for the full select-generate-review-publish/history flow.
- Run a sandbox-only manual integration test with least-privilege test credentials and a non-production Confluence space; verify page permissions and rendering.
- Validate Docker startup, migration/backup/restore procedure, CI checks, secret handling, log redaction, API pagination, performance targets, accessibility target, and error recovery.
- Update setup, configuration, operator, user, and troubleshooting documentation; record known limitations and approved scope.
- Obtain product/security sign-off and verify every requirement and success criterion against test evidence.

**Exit criteria**: Acceptance criteria pass in CI or documented sandbox validation; no production publish is part of routine tests; deployment and recovery procedures are documented; product owner approves release.

## Cross-Phase Quality Gates

- Every database change has a versioned migration, automated migration test, and rollback/recovery note where supported.
- Every cross-layer behavior change updates the shared API contract and its consumer/provider tests.
- External-service behavior is tested with mocks by default; live credentials are supplied only for deliberate sandbox tests.
- Tests must cover failure and boundary paths, not only success paths; Jira pagination and publish ambiguity are release-blocking.
- No client bundle, persisted report, or log may contain Atlassian credentials or tokens.
- No code path may publish without explicit human confirmation of the destination and exact reviewed revision.
- Any unresolved clarification that affects data correctness, privacy, authorization, or duplicate prevention blocks the dependent milestone.

## Requirement Traceability

| Plan phase | Main specification coverage |
|---|---|
| Phase 0 | Clarifications Needed; Constitution Check; all P0 items in `spec/clarify.md` |
| Phase 1 | FR-001 to FR-005; Dependencies and Constraints |
| Phase 2 | FR-002 to FR-009; User Story 1; Constitution: Secure Atlassian Integration |
| Phase 3 | FR-008 to FR-014; SC-001, SC-003 |
| Phase 4 | FR-015 to FR-019, FR-022; SC-002, SC-004, SC-007 |
| Phase 5 | FR-020 to FR-021; User Story 3; Constitution: Validated and Accessible User Workflows |
| Phase 6 | FR-023 to FR-028; SC-004 to SC-006 |
| Phase 7 | FR-027 to FR-029; SC-001 to SC-008; Constitution: Testable Changes and Development Workflow |

## Risks and Dependencies

- **Historical Jira data**: The integration may not expose enough history to reconstruct sprint-close membership/status. Resolve before domain implementation; otherwise define an explicit limitation and publication gate.
- **Stakeholder visibility**: The detailed appendix may expose internal issue details. Resolve audience and permission requirements before implementing report rendering or publishing.
- **Publish ambiguity**: Confluence may create a page even if the client times out. Resolve operation identity and reconciliation before enabling retries.
- **Summary-generation method**: If an LLM is selected, provider approval, privacy, grounding, and operational cost become dependencies; otherwise define deterministic summary inputs and quality expectations.
- **Repository bootstrap**: Existing web/API entry points are empty and JavaScript manifests are absent, so the initial phase has workspace and CI setup work before feature slices can run.

## Explicitly Excluded from This Plan

- Scheduled or webhook-triggered generation/publication.
- Release/version reporting; deferred unless a separate scope update defines data, selection, metrics, and acceptance criteria.
- Slack/email notifications and multi-project aggregation.
- Production credentials or production Confluence writes in routine development and CI.