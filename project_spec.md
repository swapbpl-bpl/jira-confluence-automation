# Project Spec: Auto-Generated Sprint/Release Summary in Confluence

## 1. Overview
An automation tool that generates a sprint/release summary from Jira data and publishes it as a Confluence page, saving manual compilation effort for the Project Manager (PM).

**Context:** Staff Augment Project, 12-person team, managed by the PM. Summaries are consumed by both external/client stakeholders and internal team/PMO.

## 2. Goals
- Automatically pull sprint/release data from Jira via the REST API.
- Generate a Markdown/Confluence-ready summary combining an executive overview and a detailed appendix.
- Publish the summary as a **new Confluence page per sprint/release**, preserving history.
- Give the PM a local draft to review before anything is published.

## 3. Non-Goals (out of scope for v1)
- Scheduled or webhook-triggered generation (manual run only for v1).
- Next-sprint/look-ahead preview section.
- Slack/email notifications.
- Multi-project or cross-team aggregation.

## 4. Data Source: Jira REST API
- **Access method:** Live Jira REST API (Cloud or Server, Jira REST API v3 recommended for Cloud).
- **Auth:** API token + account email, sent as Basic Auth per Atlassian Cloud convention.
- **Data pulled per run:**
  - Sprint/release metadata: name, start date, end date, goal (if set).
  - Issues in the sprint: key, summary, issue type, status, story points, assignee.
  - Carried-over issues: issues in the sprint not in a "Done"-category status at sprint close.
  - Blockers/risks: issues flagged (via label or Jira "Flagged" field) or stuck for N+ days without a status change.

### Sprint Selection
- **Default:** auto-detect the most recently **closed** sprint on the configured board.
- **Override:** accept an explicit sprint name or ID via CLI argument (e.g. `--sprint "Sprint 24"`), to regenerate summaries for past sprints on demand.

## 5. Summary Content
Each generated summary includes:
1. **Sprint/Release metadata** — name, team, dates, goal.
2. **Executive summary** — plain-language overview of outcomes and overall health (no ticket IDs/jargon).
3. **Velocity/points metrics** — committed points, completed points, completion %.
4. **Completed work** — table of issues moved to Done (key, summary, type, points).
5. **Carried-over/incomplete work** — table of issues not completed, rolled to next sprint.
6. **Risks/blockers** — flagged or stuck issues, with reason if available.
7. **Detailed appendix** — full issue-level tables (ticket IDs, technical detail) for internal/PMO use, separate from the executive section.

## 6. Output & Publishing Workflow
1. **Generate locally:** script produces a Markdown draft file (e.g. `stakeholder-reports/sprint-summary-<sprint-name>.md`) for the PM to review and edit.
2. **Review:** PM reviews/edits the local Markdown draft.
3. **Publish on confirmation:** a separate publish step (or a confirmation prompt) converts the reviewed Markdown to Confluence storage format and creates a **new child page** under a configured parent page in the target Confluence space.
   - Page title convention: `<Project Name> — <Sprint/Release Name> Summary`.
   - No auto-publish directly from generation — publishing is always an explicit, separate action.

## 7. Tech Stack
- **Language:** Python, consistent with existing `scripts/` conventions in this repo (see `scripts/generate_stakeholder_report.py`).
- **Libraries:** `requests` for Jira/Confluence REST calls, `python-dotenv` (or equivalent) for loading local config.
- **Structure:**
  - `scripts/generate_sprint_summary.py` — fetches Jira data, writes local Markdown draft.
  - `scripts/publish_sprint_summary.py` — converts the reviewed Markdown draft and publishes/creates the Confluence page.

## 8. Configuration
Stored as environment variables (git-ignored `.env` file), not committed to source control:

| Variable | Purpose | Notes |
|---|---|---|
| `JIRA_BASE_URL` | Jira site URL | Placeholder — fill in |
| `JIRA_EMAIL` | Jira account email for API auth | Placeholder — fill in |
| `JIRA_API_TOKEN` | Jira API token | Secret — never commit |
| `JIRA_PROJECT_KEY` | Jira project key (Staff Augment Project) | Placeholder — fill in |
| `JIRA_BOARD_ID` | Board ID to pull sprints from | Placeholder — fill in |
| `CONFLUENCE_BASE_URL` | Confluence site URL | Placeholder — fill in |
| `CONFLUENCE_API_TOKEN` | Confluence API token | Secret — never commit |
| `CONFLUENCE_SPACE_KEY` | Target space for summary pages | Placeholder — fill in |
| `CONFLUENCE_PARENT_PAGE_ID` | Parent page under which new sprint pages are created | Placeholder — fill in |

## 9. CLI Usage (planned)
```
# Generate a local draft for the most recently closed sprint
python scripts/generate_sprint_summary.py

# Generate a local draft for a specific sprint
python scripts/generate_sprint_summary.py --sprint "Sprint 24"

# Publish a reviewed draft to Confluence
python scripts/publish_sprint_summary.py --draft stakeholder-reports/sprint-summary-sprint-24.md
```

## 10. Security Considerations
- API tokens stored only in a git-ignored `.env` file; never hardcoded or committed.
- Use least-privilege Jira/Confluence API tokens (read-only for Jira, page-create/edit only for Confluence) where the platform supports scoped tokens.
- No auto-publish step runs without explicit human confirmation, reducing risk of erroneous data reaching stakeholders.

## 11. Open Items (to fill in before implementation)
- [ ] Jira project key and board ID for the Staff Augment Project.
- [ ] Confluence space key and parent page ID for sprint summaries.
- [ ] Definition of "stale/blocked" threshold for risks section (e.g., no status change in 3+ business days).
- [ ] Confirm Jira Cloud vs Server/Data Center (affects API version and auth method).

## 12. Future Enhancements (not in v1)
- Scheduled generation (cron/CI) or Jira sprint-closed webhook trigger.
- Next-sprint look-ahead preview section.
- Slack/email notification on publish.
- Multi-project/release-level rollups.
