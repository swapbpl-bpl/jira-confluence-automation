# Feature Specification: Sprint Summary Generation and Confluence Publishing

- **Feature Branch**: `TBD`
- **Created**: 2026-09-28
- **Status**: Draft
**Input**: Generate a summary from a completed Jira sprint and publish a reviewed summary to Confluence, based on `project_spec.md` and governed by `spec/constitution.md`.

## Summary

Provide a web application for a Project Manager to select a completed Jira sprint, generate a stakeholder-ready summary with an internal issue-level appendix, review and edit the draft, and explicitly publish it as a new child page in Confluence. Generation and publication are separate actions. The application retains report drafts and publication metadata so the workflow is traceable and failed or repeated requests do not silently lose work or create duplicate pages.

V1 supports closed Jira sprints only. Release/version reporting is deferred until its selection flow, source data, metrics, and acceptance criteria are defined in a separate scope update.

The constitution's required stack governs this feature: React 18 with Vite, Node.js with Express, and PostgreSQL 15 via Docker. This replaces the Python CLI implementation described in the older project specification; this feature is a browser-based workflow backed by server APIs.

## User Scenarios & Testing

### User Story 1 - Configure and connect services (Priority: P1)

As a Project Manager, I want the application configured for my Jira board and Confluence destination so that I can generate and publish reports for the correct team.

**Why this priority**: The report cannot be generated or published without valid service configuration and destination details.

**Independent Test**: Start the application with valid server-side configuration, verify that Jira sprint selection loads, and verify that a test Confluence destination can be checked without publishing a page.

#### Acceptance Scenarios

1. **Given** required Jira or Confluence configuration is missing or invalid, **When** the application initializes or the user starts the relevant operation, **Then** it reports which non-secret setting needs attention and does not make an unsafe request.
2. **Given** valid configuration, **When** the user requests available sprints, **Then** the application returns sprints for the configured Jira board and project.
3. **Given** an authentication or connectivity failure, **When** a service request fails, **Then** the UI displays a useful, non-sensitive error and the server logs no credential or token.

### User Story 2 - Generate a sprint summary (Priority: P1)

As a Project Manager, I want to generate a summary for the most recently closed sprint or a selected past sprint so that I can prepare stakeholder reporting without manually compiling Jira issues.

**Why this priority**: Data retrieval and summary generation are the core value of the application.

**Independent Test**: Use mocked Jira responses for a closed sprint and verify sprint selection, issue classification, metrics, report sections, and saved draft metadata without contacting live Atlassian services.

#### Acceptance Scenarios

1. **Given** at least one closed sprint exists on the configured board, **When** the user opens report generation, **Then** the most recently closed sprint is selected by default.
2. **Given** multiple closed sprints exist, **When** the user selects a sprint by name or ID, **Then** the generated report uses that sprint and its associated issues.
3. **Given** Jira returns sprint and issue data, **When** the user generates a report, **Then** the application saves a draft containing all required report sections and the source sprint identity.
4. **Given** Jira data is incomplete or ambiguous, **When** the report is generated, **Then** missing values or limitations are identified and are not presented as verified facts.
5. **Given** a report operation is still in progress, **When** the user views the workflow, **Then** the application communicates progress and prevents accidental duplicate generation requests.

### User Story 3 - Review and edit a draft (Priority: P1)

As a Project Manager, I want to inspect and edit the generated report before publication so that errors and wording can be corrected before stakeholders see it.

**Why this priority**: Human review is a mandatory publishing safeguard.

**Independent Test**: Generate a draft from fixtures, edit its content, save it, reload it, and verify the saved version is the version supplied to the publish flow.

#### Acceptance Scenarios

1. **Given** a draft has been generated, **When** the user opens it, **Then** the application shows its sprint, generation time, report content, and review status.
2. **Given** a draft is open, **When** the user edits and saves it, **Then** the application persists the reviewed content and an updated timestamp.
3. **Given** a draft is ready for local review, **When** the user downloads it, **Then** the application provides a Markdown file that can be reviewed or edited outside the application.
4. **Given** an externally edited Markdown draft, **When** the user returns it to the application, **Then** the content can be loaded into the review workflow and saved before publishing.
5. **Given** a saved draft, **When** the user leaves and later returns, **Then** the saved content and publication state remain available.

### User Story 4 - Explicitly publish a reviewed report (Priority: P1)

As a Project Manager, I want to publish a reviewed draft only after confirming the destination and content so that unreviewed or unintended information is not sent to Confluence.

**Why this priority**: Publishing is the final stakeholder-facing action and must remain under human control.

**Independent Test**: Mock Confluence and verify that no page-creation request occurs before confirmation, that the confirmed payload uses the reviewed content and configured parent, and that a repeated network retry for the same operation does not create a duplicate page.

#### Acceptance Scenarios

1. **Given** a saved draft, **When** the user chooses Publish, **Then** the application presents the destination, page title, and content to be published for explicit confirmation.
2. **Given** the user cancels or has not confirmed, **When** the publish flow is closed, **Then** no Confluence page is created and the draft remains available.
3. **Given** the user confirms publication, **When** Confluence accepts the request, **Then** a new child page is created under the configured parent in the configured space, and the application records its title, URL, and publication time.
4. **Given** the same confirmed request is retried because of a timeout or transient failure, **When** the retry is processed, **Then** the application avoids creating an unintended duplicate page and clearly reports whether publication succeeded.
5. **Given** the user intentionally publishes a report again in a separate confirmed action, **When** Confluence accepts the new action, **Then** a new page is created; previously published pages are not overwritten.

### User Story 5 - Inspect report and publication history (Priority: P2)

As a Project Manager, I want to find drafts and previously published summaries so that I can check report status and revisit prior sprint history.

**Why this priority**: Retaining page history is a project requirement; an application history view makes the workflow traceable.

**Independent Test**: Create multiple drafts and mock successful and failed publishing outcomes, then verify that the history view distinguishes each state and links successful publications to Confluence.

#### Acceptance Scenarios

1. **Given** reports have been generated, **When** the user opens report history, **Then** reports are listed with sprint identity, generation date, and draft or publication status.
2. **Given** a report was successfully published, **When** the user views its history entry, **Then** the Confluence title and page URL are available.
3. **Given** a report is still a draft or publishing failed, **When** the user views its history entry, **Then** it is not represented as successfully published.

## Functional Requirements

### Configuration and Integrations

- **FR-001**: The system MUST use React 18 and Vite for the frontend, Node.js and Express for the backend, and PostgreSQL 15 via Docker for application-persisted data.
- **FR-002**: The backend MUST be the only application component that communicates with Jira, Confluence, or PostgreSQL.
- **FR-003**: The system MUST read Jira and Confluence credentials from server-side environment configuration or an approved secret store; it MUST NOT store credentials in the browser or report database.
- **FR-004**: The system MUST validate required configuration before requesting Jira or Confluence operations and MUST provide actionable errors that do not disclose secret values.
- **FR-005**: The system MUST support a configured Jira site, project, and board, and a configured Confluence site, space, and parent page.
- **FR-006**: Jira credentials SHOULD be read-only where supported. Confluence credentials MUST be limited to the permissions needed to create report pages where supported.
- **FR-007**: Jira and Confluence requests MUST use bounded timeouts and handle authentication failures, rate limits, and transient errors without losing saved drafts.

### Sprint Selection and Jira Data

- **FR-008**: The system MUST list closed sprints available on the configured Jira board and MUST select the most recently closed sprint by default.
- **FR-009**: The user MUST be able to select a specific sprint by name or ID to regenerate a historical report.
- **FR-010**: For each run, the system MUST retrieve sprint name, start date, end date, goal when available, and issue key, summary, issue type, status, story points, and assignee when available.
- **FR-011**: The system MUST classify completed work using Jira's Done status category and MUST identify incomplete work according to the sprint-close state.
- **FR-012**: The system MUST identify risks from issues marked by the configured Jira flag mechanism and from issues with no status change for the configured stale threshold.
- **FR-013**: The system MUST document and apply a consistent rule for point totals and completion percentage. If committed points are zero or unavailable, the completion percentage MUST be shown as unavailable rather than divided by zero or fabricated.
- **FR-014**: The system MUST identify unavailable historical status data or other source-data limitations that prevent a reliable sprint-close classification.

### Draft and Report Content

- **FR-015**: The system MUST generate a Markdown report with sections in this order: sprint metadata; executive summary; velocity and points metrics; completed work; carried-over or incomplete work; risks and blockers; detailed appendix.
- **FR-016**: The executive summary MUST use plain language and MUST omit issue keys and technical jargon. Issue-level details MUST remain in the detailed appendix.
- **FR-017**: The report MUST include committed points, completed points, and completion percentage when source data permits.
- **FR-018**: The completed-work table MUST include issue key, summary, type, and points when available. The incomplete-work table MUST identify issues not completed at sprint close. Risk entries MUST include an available reason.
- **FR-019**: The system MUST save each generated draft and its source sprint identity, generation time, and relevant source data or snapshot needed to explain the generated result.
- **FR-020**: The user MUST be able to review and edit the generated Markdown, save reviewed changes, and download the draft as a Markdown file.
- **FR-021**: The system MUST allow the user to return an externally edited Markdown draft to the review workflow and save that content before publication.
- **FR-022**: Generating or saving a draft MUST NOT publish anything to Confluence.

### Publishing and History

- **FR-023**: The system MUST require an explicit user confirmation immediately before creating a Confluence page and MUST display the destination, title, and content to be published.
- **FR-024**: The system MUST convert the reviewed Markdown into the Confluence representation required by the configured Confluence API.
- **FR-025**: The system MUST create a new child page under the configured parent page in the configured space; it MUST NOT overwrite a previously published report page.
- **FR-026**: The page title MUST follow `<Project Name> - <Sprint Name> Summary` unless the project configures an equivalent title convention.
- **FR-027**: The system MUST record publication status, page title, page URL when available, publication time, and the draft version used for the publish attempt.
- **FR-028**: A retry of one publish operation MUST be idempotent or otherwise checked against its operation identity so transient failures do not create unintended duplicate pages. A separate, newly confirmed publish action MAY create a new page.
- **FR-029**: The system MUST provide a report history view that distinguishes drafts, failed attempts, and successful publications.

## Key Entities

- **Project Configuration**: Non-secret Jira project and board identifiers, Confluence space and parent identifiers, project/team display names, and report policy settings. Credentials are not part of this persisted entity.
- **Sprint**: Jira sprint identifier, name, dates, goal, board association, and lifecycle state used to identify the report period.
- **Issue Snapshot**: The issue attributes used to calculate and render a report, including status and available point, assignee, type, and summary values.
- **Report Draft**: A generated report's Markdown content, source sprint, source snapshot or reference, generation time, review state, and saved revision metadata.
- **Publish Operation**: The confirmed publish request, associated draft revision, operation identity, status, timestamps, and resulting Confluence page details when successful.

## Success Criteria

- **SC-001**: A Project Manager can select the latest closed sprint or a historical sprint and generate a complete draft without manually gathering issue data.
- **SC-002**: Every generated report contains all seven required sections, in the specified order, whenever the required source data is available.
- **SC-003**: In tests with known Jira fixtures, completed/incomplete classification and point metrics match expected results, including missing-point and zero-point cases.
- **SC-004**: No automated generation or draft-save path creates a Confluence page; page creation occurs only after explicit confirmation.
- **SC-005**: A confirmed publish produces a new child page with the expected title and parent, and the application records a working page link when returned by Confluence.
- **SC-006**: Retrying the same publish operation does not create a second page, while a separately confirmed new publish can create a new historical page.
- **SC-007**: Automated tests exercise report rules and publish safeguards without making live Jira or Confluence changes.
- **SC-008**: No secrets appear in client responses, browser assets, persisted report content, or application logs in security tests.

## Assumptions

- The initial primary user is the Project Manager for the 12-person Staff Augment Project team.
- The initial default report period is a closed Jira sprint on one configured board.
- Jira and Confluence are accessed over their REST APIs using server-side credentials.
- The system retains reports and publication metadata in PostgreSQL; Confluence remains the publication destination and history of published pages.
- Markdown is the editable review format. The application provides download and re-import so a user can make edits outside the web interface.
- `spec/constitution.md` is authoritative for the implementation stack and security requirements.

## Out of Scope for V1

- Scheduled, webhook-triggered, or unattended report generation and publication.
- Automatic publication directly from report generation.
- Next-sprint or look-ahead analysis.
- Slack or email notifications.
- Aggregation across multiple Jira projects, boards, or teams.
- Release/version reporting; deferred until its source data, selection flow, metrics, and acceptance criteria are defined.

## Dependencies and Constraints

- React 18 + Vite frontend, Node.js + Express backend, PostgreSQL 15, and Docker are mandatory per `spec/constitution.md`.
- Jira and Confluence service availability, API permissions, and rate limits constrain report generation and publication.
- Schema changes require versioned migrations and a verification path.
- Integration tests MUST use mocks or isolated test data and MUST NOT publish to a real stakeholder space as part of routine test runs.

## Clarifications Needed

| Topic | Current status | Required decision |
|---|---|---|
| Jira deployment | Open | Confirm Cloud versus Server/Data Center; this determines API version and authentication details. |
| Jira project and board | Open | Supply the project key and board ID for the initial deployment. |
| Confluence destination | Open | Supply the space key and parent page ID. |
| Stale/blocked threshold | Open | Define the number of days and whether calendar or business days are counted. |
| Flagged issue detection | Open | Confirm whether to use Jira's native Flagged field, a label, or both. |
| Historical sprint status | Open | Confirm that Jira history/API permissions provide issue status at sprint close; define the visible limitation when unavailable. |
| Release reporting | Resolved for V1 | V1 supports closed Jira sprints only; release/version reporting remains out of scope pending a separate scope update with selection, data, metrics, and acceptance criteria. |
| Configuration administration | Open | Decide whether deployment settings are environment-only or editable by an authorized administrator in the UI. |

## Constitution Check

- The requested stack is specified and replaces the Python CLI design in the older `project_spec.md`.
- Jira/Confluence credentials remain server-side, and the browser communicates only with the application API.
- Draft generation and review are separate from explicit Confluence publishing.
- Tests avoid live service side effects; publication retries and report history are specified.
- No requirement silently chooses values for the unresolved Jira, Confluence, or stale-issue policy decisions above.