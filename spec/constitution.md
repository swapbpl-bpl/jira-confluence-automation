# Jira/Confluence Automation Constitution

Version: 1.0.0
Last updated: 2026-09-28

## Core Principles

### 1. Human-Controlled Publishing
- Generating a summary MUST NOT publish it to Confluence.
- A person MUST be able to review and edit the generated draft before publication.
- Publishing MUST require an explicit user action and clearly identify the destination and content being published.
- Each sprint or release summary MUST be published as a new page so prior reports remain available as history.

### 2. Secure Atlassian Integration
- Jira and Confluence credentials MUST remain on the server and MUST never be sent to or embedded in the browser bundle.
- Secrets MUST be supplied through environment-based configuration or an approved secrets store; committed source, logs, and client-visible errors MUST NOT expose them.
- Integrations MUST use least-privilege credentials and validate configuration before making requests.
- External API errors and user-provided values MUST be handled safely; sensitive response details MUST not be exposed to users.

### 3. Explicit Application Boundaries
- The frontend MUST use React 18 with Vite.
- The backend MUST use Node.js with Express and own all Jira, Confluence, and database access.
- PostgreSQL 15 MUST be the system of record for application-persisted data and MUST run through Docker for local development and reproducible environments.
- Frontend-to-backend communication MUST use documented, versionable HTTP API contracts. The browser MUST NOT call Jira or Confluence directly.

### 4. Accurate, Traceable Reports
- Summary metrics and classifications MUST be derived from fetched Jira data using documented rules, not invented or silently inferred values.
- Missing, stale, or ambiguous source data MUST be represented clearly rather than presented as fact.
- Reports MUST distinguish stakeholder-facing summaries from issue-level detail intended for internal use.
- The application MUST preserve enough metadata to identify the source sprint or release and the time of generation.

### 5. Validated and Accessible User Workflows
- Inputs, API payloads, and persisted data MUST be validated at their boundaries, with actionable errors for recoverable failures.
- The interface MUST support keyboard navigation, clear status feedback, and accessible labels for interactive controls.
- Long-running Jira/Confluence operations MUST expose progress and a clear success or failure outcome; retries MUST not create unintended duplicate pages.

### 6. Testable Changes
- Business rules for report generation and publishing MUST be testable independently of live Atlassian services.
- Automated tests MUST cover important calculations, validation, API behavior, and publish confirmation safeguards.
- Integration tests MUST use isolated test data or mocked external services; routine tests MUST NOT publish to a real Confluence space.
- Changes MUST pass relevant tests and static checks before merge, and database schema changes MUST include a migration and a verification path.

## Technology and Operational Constraints

- Required stack: React 18 + Vite, Node.js + Express, PostgreSQL 15, and Docker.
- Local and CI environments MUST be reproducible from checked-in configuration, excluding secrets and generated data.
- Database changes MUST be managed through versioned migrations; application behavior MUST not depend on undocumented manual database edits.
- Logs MUST support diagnosis of failed operations without recording credentials, tokens, or unnecessary personal data.
- External service calls MUST use bounded timeouts and handle rate limits and transient failures without losing reviewed drafts.

## Development Workflow

- Each feature or fix MUST state its user-visible behavior and acceptance criteria.
- Specifications MUST define the API and data changes needed for cross-layer work before implementation.
- Implementation MUST keep presentation, business rules, external-service adapters, and persistence responsibilities separated.
- Review MUST verify relevant tests, migration safety, security implications, accessibility for changed UI, and preservation of the human-controlled publishing workflow.

## Governance

- This constitution governs project specifications, implementation, tests, and operational documentation.
- Any exception MUST be documented in the relevant specification with its rationale, impact, and a follow-up plan where applicable.
- Amendments MUST be reviewed with affected maintainers, update the version and last-updated date, and identify any specifications or implementation work that must be brought into compliance.
- When another project document conflicts with this constitution, the conflict MUST be resolved explicitly; implementation MUST not silently weaken these principles.