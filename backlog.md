# Implementation Backlog: Auto-Generated Sprint/Release Summary in Confluence

Derived from [project_spec.md](project_spec.md). Phasing reflects the following priorities:
- Open Items are resolved first, blocking the rest of Setup.
- Core Features: the Jira generate script is built and validated before the Confluence publish script.
- Testing: unit tests with mocked Jira/Confluence APIs, plus a manual end-to-end check.
- Future Enhancements (§12 of the spec) are intentionally omitted — out of scope for v1.

---

## Phase 1: Setup

### 1.1 Resolve Open Items (blocking — do first)
- [ ] Confirm Jira Cloud vs Server/Data Center for the Staff Augment Project (determines API version/auth). ([GitHub issue #1](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/1)) — Approach 1
- [ ] Obtain Jira project key for the Staff Augment Project. ([GitHub issue #7](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/7)) — Approach 1
- [ ] Obtain Jira board ID to pull sprints from. ([GitHub issue #4](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/4)) — Approach 1
- [ ] Obtain Confluence space key for sprint summary pages. ([GitHub issue #6](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/6)) — Approach 1
- [ ] Obtain Confluence parent page ID under which new sprint pages will be created. ([GitHub issue #3](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/3)) — Approach 1
- [ ] Define the "stale/blocked" threshold for the risks section (e.g., no status change in N business days) and confirm N. ([GitHub issue #5](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/5)) — Approach 1
- [ ] Confirm whether Jira's native "Flagged" field, a label, or both should be used to detect flagged issues. ([GitHub issue #2](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/2)) — Approach 1

### 1.2 Project scaffolding
- [ ] Create `scripts/generate_sprint_summary.py` stub with CLI arg parsing (`--sprint`) following conventions in `scripts/generate_stakeholder_report.py`. ([GitHub issue #13](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/13)) — Approach 3
- [ ] Create `scripts/publish_sprint_summary.py` stub with CLI arg parsing (`--draft`). ([GitHub issue #9](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/9)) — Approach 3
- [ ] Ensure `stakeholder-reports/` directory exists (or is created at runtime) for generated drafts. ([GitHub issue #12](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/12)) — Approach 3
- [ ] Add `python-dotenv` (or equivalent) and `requests` to `requirements.txt`. ([GitHub issue #8](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/8)) — Approach 3
- [ ] Create `.env.example` listing all required variables from spec §8 with placeholder values (no secrets). ([GitHub issue #10](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/10)) — Approach 2
- [ ] Add `.env` to `.gitignore` (verify it isn't already committed). ([GitHub issue #11](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/11)) — Approach 3

### 1.3 Credentials & connectivity
- [ ] Generate a least-privilege Jira API token (read-only, if scoping is supported). ([GitHub issue #14](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/14)) — Approach 1
- [ ] Generate a least-privilege Confluence API token (page-create/edit only, if scoping is supported). ([GitHub issue #15](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/15)) — Approach 1
- [ ] Populate a local `.env` (git-ignored) with real values for dev/testing. ([GitHub issue #16](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/16)) — Approach 1
- [ ] Write a small connectivity smoke-check (manual script or REPL snippet) to confirm Jira Basic Auth works against the configured board. ([GitHub issue #17](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/17)) — Approach 2
- [ ] Write a small connectivity smoke-check to confirm Confluence Basic Auth works against the configured space/parent page. ([GitHub issue #18](https://github.com/swapbpl-bpl/jira-confluence-automation/issues/18)) — Approach 2

---

## Phase 2: Core Features

### 2.1 Jira data-fetch (generate script) — build first
- [ ] Implement config loader that reads and validates all `JIRA_*` env vars, with clear errors for missing values. — Approach 3
- [ ] Implement sprint auto-detection: fetch the most recently **closed** sprint on the configured board. — Approach 3
- [ ] Implement `--sprint` override to look up a sprint by explicit name or ID. — Approach 3
- [ ] Fetch sprint metadata: name, start date, end date, goal. — Approach 3
- [ ] Fetch all issues in the sprint: key, summary, issue type, status, story points, assignee. — Approach 3
- [ ] Compute committed points, completed points, and completion percentage. — Approach 3
- [ ] Identify completed work (issues in a "Done"-category status). — Approach 3
- [ ] Identify carried-over/incomplete work (issues not in "Done"-category status at sprint close). — Approach 3
- [ ] Identify flagged issues (via label and/or Jira "Flagged" field, per 1.1 decision). — Approach 3
- [ ] Identify stuck issues (no status change for N+ business days, per 1.1 threshold). — Approach 3
- [ ] Merge flagged + stuck issues into a single risks/blockers list, with reason per item where available. — Approach 3

### 2.2 Summary content generation
- [ ] Build plain-language executive summary section (no ticket IDs/jargon) from computed outcomes/health. — Approach 3
- [ ] Build velocity/points metrics section (committed, completed, completion %). — Approach 3
- [ ] Build completed-work table (key, summary, type, points). — Approach 3
- [ ] Build carried-over/incomplete-work table. — Approach 3
- [ ] Build risks/blockers section with reasons. — Approach 3
- [ ] Build detailed appendix with full issue-level tables (ticket IDs, technical detail) for internal/PMO use. — Approach 3
- [ ] Assemble all sections into a single Markdown document in spec-defined order (§5). — Approach 3

### 2.3 Local draft output
- [ ] Write generated Markdown to `stakeholder-reports/sprint-summary-<sprint-name>.md` (slugified sprint name). — Approach 3
- [ ] Print a confirmation message with the draft file path after generation. — Approach 3
- [ ] Handle the case where a draft file for the sprint already exists (overwrite prompt or versioned filename). — Approach 3

### 2.4 Confluence publish script — build second
- [ ] Implement config loader that reads and validates all `CONFLUENCE_*` env vars. — Approach 3
- [ ] Implement `--draft` argument to load a specified local Markdown draft file. — Approach 3
- [ ] Implement Markdown-to-Confluence-storage-format conversion for the draft content. — Approach 3
- [ ] Derive Confluence page title using convention `<Project Name> — <Sprint/Release Name> Summary`. — Approach 3
- [ ] Implement Confluence API call to create a new child page under `CONFLUENCE_PARENT_PAGE_ID` in `CONFLUENCE_SPACE_KEY`. — Approach 3
- [ ] Add an explicit human confirmation step before publishing (prompt or required `--confirm` flag) — no auto-publish. — Approach 2
- [ ] Print the resulting Confluence page URL on success. — Approach 3

---

## Phase 3: Integration

- [ ] Wire generate → local review → publish as a two-step workflow per spec §6 (no direct generate-to-publish path). — Approach 3
- [ ] Verify sprint-name slugification is consistent between the generated draft filename and the `--draft` argument used by the publish script. — Approach 3
- [ ] Confirm error handling/messaging is consistent across both scripts (auth failures, missing config, network errors). — Approach 3
- [ ] Validate that re-running the generate script for the same sprint and then publishing produces a **new** Confluence child page each time (preserves history, per spec §4/§6). — Approach 3
- [ ] Cross-check computed metrics (committed/completed points, completion %) against a known sprint in Jira for accuracy. — Approach 2
- [ ] Confirm CLI usage matches spec §9 exactly (`generate_sprint_summary.py`, `--sprint`, `publish_sprint_summary.py --draft`). — Approach 3

---

## Phase 4: Testing

### 4.1 Unit tests (mocked Jira/Confluence APIs)
- [ ] Set up a test framework (e.g., `pytest`) and add it to `requirements.txt` (dev-only if separated). — Approach 3
- [ ] Mock Jira API responses to test sprint auto-detection logic. — Approach 3
- [ ] Mock Jira API responses to test `--sprint` override lookup (by name and by ID). — Approach 3
- [ ] Test completed vs carried-over issue classification against sample issue data. — Approach 3
- [ ] Test flagged/stuck issue detection logic against sample issue data with edge cases (e.g., boundary of N-day threshold). — Approach 3
- [ ] Test velocity/points metric calculations (committed, completed, completion %) including zero/edge cases. — Approach 3
- [ ] Test Markdown draft assembly produces all required sections in the correct order. — Approach 3
- [ ] Mock Confluence API to test page-creation request payload (title convention, storage format, parent page ID). — Approach 3
- [ ] Test Markdown-to-Confluence-storage-format conversion against representative draft content. — Approach 3
- [ ] Test config loader error handling for missing/invalid environment variables (both scripts). — Approach 3

### 4.2 Manual end-to-end verification
- [ ] Run `generate_sprint_summary.py` against a real (or sandbox) closed sprint and manually review the draft for accuracy and readability. — Approach 2
- [ ] Manually edit the local draft to simulate PM review/edits. — Approach 2
- [ ] Run `publish_sprint_summary.py --draft <file>` and confirm the page appears correctly in Confluence under the right parent/space. — Approach 2
- [ ] Verify the published page renders correctly (tables, formatting) in the Confluence UI. — Approach 2
- [ ] Re-run the full flow for a second sprint to confirm multiple summary pages coexist without collision. — Approach 2

---

## Phase 5: Documentation

- [ ] Add/update `README.md` (or a dedicated section) covering: purpose, prerequisites, setup, and CLI usage. — Approach 2
- [ ] Document `.env` configuration using `.env.example` as reference, including where to obtain Jira/Confluence tokens. — Approach 2
- [ ] Add docstrings to all public functions in `generate_sprint_summary.py`. — Approach 3
- [ ] Add docstrings to all public functions in `publish_sprint_summary.py`. — Approach 3
- [ ] Document the two-step generate/review/publish workflow for the PM, including where drafts are saved. — Approach 2
- [ ] Document the "stale/blocked" threshold and flagged-issue detection rules so the PM understands what drives the risks section. — Approach 2
- [ ] Note in documentation that scheduled/automated triggers, notifications, and multi-project rollups are explicitly out of scope for v1. — Approach 2
