# Module 10 Completion Report

## Instruction Files
```
    Directory: C:\workspace\hello-genai\instructions


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----        25-09-2026     15:15           1141 create-status-report.agent.md
-a----        25-09-2026     15:29          16696 creating-instructions.agent.md
-a----        25-09-2026     15:29            807 generate-jira-query.agent.md
-a----        25-09-2026     15:36           3783 generate-summary-content.agent.md
-a----        25-09-2026     15:36           2005 main.agent.md
-a----        25-09-2026     15:29            589 write-meeting-notes.agent.md
```

## main.agent.md Contents
```markdown
# Instructions Catalog

Each entry below is an instruction file with a one-line description. Optional sub-fields after `+`:
- Keywords — trigger words/phrases: if user's request matches, load this instruction.
- Target — file glob pattern: if current file or context matches, consider this instruction relevant.
- Exceptions — edge cases or clarifications that don't fit in the one-liner.

---

- [`./instructions/creating-instructions.agent.md`](./creating-instructions.agent.md) — how to create/update instructions, skills, and IDE wrappers in this project.
  + Keywords: create instruction, new instruction, update instruction, creating-instructions, instruction infrastructure
- [`./instructions/create-status-report.agent.md`](./create-status-report.agent.md) — weekly status report with fixed sections (Accomplishments, Blockers, Next Week) and format.
  + Keywords: status report, weekly report, accomplishments, blockers
  + Exceptions: this file is a native VS Code custom agent (frontmatter + tools), kept as-is rather than converted to plain-bullet style.
- [`./instructions/write-meeting-notes.agent.md`](./write-meeting-notes.agent.md) — meeting summary with decisions and action items (owners + due dates).
  + Keywords: meeting notes, meeting summary, action items, minutes
- [`./instructions/generate-jira-query.agent.md`](./generate-jira-query.agent.md) — JQL queries for common reporting scenarios (blockers, stale issues, workload).
  + Keywords: jql, jira query, sprint report, blocked issues, stale issues
- [`./instructions/generate-summary-content.agent.md`](./generate-summary-content.agent.md) — assemble the Markdown sprint/release summary content (exec summary, metrics, completed/carried-over tables, risks, appendix) from fetched Jira sprint data.
  + Keywords: summary content generation, sprint summary, executive summary, velocity metrics, completed work table, risks blockers, appendix
  + Target: `scripts/generate_sprint_summary.py`
```

## Sample Instruction
- File: instructions/generate-summary-content.agent.md
- Contents:
```markdown
- Use this when generating the Markdown summary content for a closed Jira sprint/release, per [`project_spec.md`](../project_spec.md) §5 and backlog item 2.2.
- This instruction covers content assembly only — it runs after Jira data-fetch (backlog 2.1) and before local draft output (backlog 2.3).

## Input Format
- Sprint metadata: `name`, `team`, `start_date`, `end_date`, `goal` (goal may be empty/unset — omit gracefully, do not fabricate).
- Issue list, each item with: `key`, `summary`, `issue_type`, `status`, `story_points`, `assignee`, `flagged` (bool), `last_status_change_date`.
- Precomputed metrics: `committed_points`, `completed_points`, `completion_percent`.
- Classified issue buckets (already split by the fetch step): `completed_issues`, `carried_over_issues`, `risk_issues` (flagged and/or stuck, each with a `reason` string).
- Do not re-derive classification (Done-category, flagged, stuck) in this step — treat the input buckets as authoritative.
- If any required input field is missing, fail loudly with a clear error naming the missing field — do not silently substitute placeholder data.

## Processing Steps
1. Render the sprint/release metadata block first (name, team, dates, goal).
2. Generate the executive summary: plain-language overview of outcomes and overall health, derived only from the computed metrics and risk count — no ticket IDs or Jira jargon.
3. Generate the velocity/points metrics section from `committed_points`, `completed_points`, `completion_percent` (compute completion % only if not already provided; never divide by zero — show `N/A` when `committed_points` is 0).
4. Build the completed-work table from `completed_issues`.
5. Build the carried-over/incomplete-work table from `carried_over_issues`.
6. Build the risks/blockers section from `risk_issues`, including each item's `reason` when available, or `Reason not available` when absent.
7. Build the detailed appendix with full issue-level tables (all fields, all issues) for internal/PMO use — keep this separate from and below the executive-facing sections.
8. Assemble sections in the exact order above — this order is fixed by spec §5 and must not be rearranged.

## Output Format
- Single Markdown document with these headings, in this order:
```markdown
# <Project Name> — <Sprint/Release Name> Summary

## Sprint Overview
- Team: ...
- Dates: ... – ...
- Goal: ...

## Executive Summary
- ...

## Velocity & Points
- Committed: ...
- Completed: ...
- Completion: ...%

## Completed Work
| Key | Summary | Type | Points |
|---|---|---|---|

## Carried Over / Incomplete Work
| Key | Summary | Type | Points | Status |
|---|---|---|---|---|

## Risks & Blockers
- **KEY** — reason

## Appendix: Full Issue Detail
| Key | Summary | Type | Status | Points | Assignee | Flagged | Last Status Change |
|---|---|---|---|---|---|---|---|
```
- Tables use pipe-style Markdown; omit a table entirely (keep the heading, add "None" below it) rather than emitting an empty table when a bucket has zero issues.

## Constraints
- `## Executive Summary` must contain zero ticket IDs, field names, or Jira jargon — written for external/client stakeholders.
- `## Appendix: Full Issue Detail` is the only section allowed to expose full technical/ticket-level detail.
- Do not invent goals, reasons, dates, or metrics not present in the input — omit or mark `TBD`/`N/A` instead of guessing.
- Do not include any of the out-of-scope §12 features (look-ahead preview, notifications, multi-project rollup) in generated content.
- Keep section order fixed as listed in Processing Steps — downstream local draft output (backlog 2.3) and Confluence conversion (backlog 2.4) depend on this order.
```
