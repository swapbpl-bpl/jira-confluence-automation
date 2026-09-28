# Project Constitution: Staff Augmentation Sprint Dashboard

Version: 1.2.0
Ratified: 2026-09-28
Last amended: 2026-09-28

## Project Identity

- **Project name:** Staff Augmentation Sprint Dashboard.
- **Purpose:** Give a Project Manager and project team a reliable view of active-sprint delivery progress, scope changes, blockers, and assigned versus completed story points.
- **Target users:** The Project Manager managing a 10-person Staff Augment team and the members of that project team. Individual workload is operational context, not a personnel performance measure.

## Core Principles

### 1. Sprint Metrics Must Be Accurate and Explainable
- Story-point totals, completion, scope change, burndown, and workload MUST be calculated from validated issue and sprint data using documented rules.
- Original sprint commitment and current scope MUST remain distinguishable; scope changes MUST NOT be hidden by rewriting the baseline.
- Missing, stale, inconsistent, or unavailable data MUST be identified as such and MUST NOT be silently fabricated or presented as fact.
- Visual forecasts and pace indicators MUST be labeled as signals, not guarantees of sprint delivery.

### 2. Protect People and Project Data
- The dashboard MUST use only the minimum team and issue data needed for sprint planning and delivery visibility.
- Individual point assignments MUST be presented as workload context, not as a performance score, utilization measure, or ranking.
- Secrets, credentials, and private integration configuration MUST remain server-side and MUST NOT appear in browser bundles, API responses, logs, or committed files.
- External service access MUST use least-privilege credentials and safe, non-sensitive error messages.
- Mock or test data MUST be fictional or anonymized; real client, team, and issue data MUST NOT be committed as fixtures.

### 3. Enforce the Mandated Application Stack and Boundaries
- The frontend MUST use React 18.3.x with Vite 6.x.
- The backend MUST use Node.js 22.x LTS with Express 5.x and MUST own database and external Jira access.
- PostgreSQL 15.x MUST be the persistence layer and MUST run through Docker Engine 27.x or later with Docker Compose v2.x for local development and reproducible environments.
- Browser code MUST communicate with the backend through documented, versionable HTTP API contracts; it MUST NOT connect directly to PostgreSQL or Jira.
- Presentation, domain calculations, API handling, external-service adapters, and persistence MUST have clear responsibilities and MUST NOT be collapsed into a single layer.

### 4. Validate at System Boundaries
- User input, Jira responses, API payloads, and persisted data MUST be validated before use.
- Invalid or incomplete data MUST produce actionable feedback without corrupting saved state or misleading users.
- External requests MUST use bounded timeouts and handle pagination, rate limits, and transient failures where applicable.
- Retries MUST NOT cause duplicate or unintended Jira-side effects.

### 5. Make the Dashboard Accessible and Operationally Clear
- Core workflows MUST be usable with a keyboard and expose visible focus, clear labels, and status feedback.
- Charts and status indicators MUST have text alternatives; color MUST NOT be the sole carrier of meaning.
- The interface MUST remain usable across supported desktop and mobile viewports.
- Loading, empty, stale-data, error, and success states MUST be distinct and understandable.

### 6. Keep Changes Testable and Reproducible
- Sprint calculations and domain rules MUST be testable independently of live Jira services.
- Automated tests MUST cover critical calculations, validation, API contracts, and failure paths.
- Integration tests MUST use mocks or isolated test environments; routine tests MUST NOT mutate production Jira data.
- Database schema changes MUST include versioned migrations and a verification path.
- Relevant tests, static checks, and builds MUST pass before changes are considered complete.

## Technology and Operational Constraints

- Required stack and compatibility baseline:

	| Layer | Required version |
	|---|---|
	| UI library | React 18.3.x |
	| Frontend build/dev server | Vite 6.x |
	| Backend runtime | Node.js 22.x LTS |
	| HTTP server | Express 5.x |
	| Database | PostgreSQL 15.x |
	| Container runtime/orchestration | Docker Engine 27.x or later; Docker Compose v2.x |

- Frontend and backend package versions MUST be locked with the repository's package lockfile; CI MUST use the lockfile. Container images MUST use an explicit supported major tag and be updated through reviewed dependency changes.
- The versions in the compatibility table define supported release lines, not exact installation pins. Before implementation begins, the repository MUST pin exact releases: Node.js in `.node-version` or `.nvmrc`; JavaScript dependencies in manifests without floating ranges and in the committed lockfile; PostgreSQL using an exact patch tag and image digest in Docker Compose; and Docker Engine/Compose versions in checked-in toolchain or development-container configuration.
- CI MUST verify the pinned toolchain. A feature MUST NOT be declared implementation-ready while any required runtime, dependency, or database image pin is missing.
- Local and CI environments MUST be reproducible from checked-in configuration, excluding secrets and generated data.
- Database access MUST be server-side. Schema changes MUST use versioned migrations; undocumented manual database edits MUST NOT be required.
- Configuration MUST be validated at startup or before use. Secret values MUST be provided through environment configuration or an approved secret manager.
- Logs MUST support diagnosis without recording credentials, tokens, sensitive issue contents, or unnecessary personal data.
- External Jira connectivity is feature-scoped: a mock-data phase MAY run without Jira credentials, but any live integration MUST follow the server-side boundary and security principles above.

## Repository Structure

- Applications MUST remain separated by deployable responsibility:

	```text
	apps/
		web/src/
			app/                    # application shell, providers, and routing
			components/             # shared, domain-neutral UI components
			features/<feature>/     # feature-owned UI, API client, and tests
			lib/                    # shared frontend utilities
		api/src/
			config/                 # environment and service configuration
			middleware/             # Express middleware
			routes/                 # HTTP route registration and handlers
			services/               # domain workflows and external integrations
			repositories/            # database access
			server.ts                # API composition and startup
	packages/
		contracts/src/             # shared request/response schemas and types
	database/
		migrations/                # ordered, versioned schema changes
		seeds/                     # fictional development/test seed data only
	tests/
		integration/               # cross-layer tests using isolated services
		e2e/                        # browser-level user workflow tests
	```

- Feature-specific code MUST live with its feature; shared folders MUST contain only code used by multiple features.
- Database migrations MUST be stored in `database/migrations/`; test fixtures MUST be stored with their owning tests or under `tests/fixtures/` and MUST contain no production data.
- A feature specification MAY define additional directories when needed, but MUST preserve frontend/backend/contracts/database boundaries and document the deviation.

## Coding Standards

- Application code and shared contracts MUST use TypeScript; JavaScript MAY be used only for scripts or configuration files that do not support TypeScript.
- React component and type names MUST use `PascalCase`; component files MUST use the same `PascalCase` name with `.tsx`.
- Variables, functions, hooks, and non-component modules MUST use `camelCase`; hooks MUST begin with `use`.
- Constants representing fixed configuration values MUST use `UPPER_SNAKE_CASE`. Other values MUST use `camelCase`.
- Directory and feature names MUST use lowercase `kebab-case`; database tables and columns MUST use `snake_case`.
- Express route modules, domain services, and repositories MUST use descriptive names with `.route.ts`, `.service.ts`, and `.repository.ts` suffixes respectively.
- Tests MUST use `*.test.ts` or `*.test.tsx` and be colocated with the unit under test or placed in the corresponding `tests/` subtree for integration and end-to-end coverage.
- Modules MUST have one clear responsibility. Route handlers MUST delegate domain work to services; services MUST use repositories or external-service adapters instead of embedding persistence or network details in UI code.
- Names MUST describe domain intent; unexplained abbreviations, single-letter identifiers, duplicated implementations, and cross-feature imports from another feature's internals MUST be avoided.

## Development Workflow

- Each feature specification MUST state users, behavior, scope, non-goals, and verifiable acceptance criteria.
- Cross-layer features MUST define API contracts, data ownership, and persistence changes before implementation.
- New files MUST follow the repository structure and naming conventions in this constitution; deviations MUST be documented in the feature specification.
- Implementation MUST use the mandated stack. A proposed stack exception requires an explicit constitution amendment before the exception is implemented.
- Changes MUST include focused tests for altered behavior and update relevant setup or operational documentation.
- Review MUST consider data correctness, privacy, security, accessibility, responsive behavior, migration safety, and failure handling.

## Governance

- This constitution governs project specifications, implementation, tests, and operational documentation.
- In case of conflict, this constitution takes precedence over feature specifications. The conflicting specification MUST be reconciled before implementation; code MUST NOT silently follow the lower-level conflicting requirement.
- Exceptions MUST document rationale, impact, approval, and a follow-up plan where applicable. A technology-stack exception requires a constitution amendment.
- Amendments MUST be reviewed with affected maintainers, update the version and last-amended date, and identify specifications or implementation work that must be brought into compliance.