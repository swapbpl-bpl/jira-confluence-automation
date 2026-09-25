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
