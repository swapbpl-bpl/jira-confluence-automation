# Technical Specification: Staff Augmentation Sprint Dashboard

## 1. Overview

Build a standalone dashboard for a Project Manager overseeing a 10-person team on a Staff Augment project. The dashboard helps the PM and project team assess active-sprint delivery confidence and understand assigned versus completed work. Phase one uses fictional local data; it does not connect to Jira.

## 2. Goals

- Show progress and remaining work for one Jira board's active sprint.
- Measure sprint progress primarily with story points.
- Compare completed points with sprint time elapsed and show an ideal-versus-actual burndown trend.
- Show current sprint scope and the original commitment separately so scope changes remain visible.
- Make status, blockers, and assigned/completed points per teammate easy to scan.
- Provide filters for status, assignee, and blocked issues.
- Validate the dashboard locally before deciding on Jira integration or shared hosting.

## 3. Users and Access

- Primary user: Project Manager managing a 10-person Staff Augment team.
- Intended operational audience: PM and project team.
- Phase-one runtime: local browser preview only. The dashboard is not remotely available to the team until a shared hosting option is selected.
- Do not expose individual workload data to client or external stakeholders in phase one.

## 4. Scope

### In Scope

- One team, one Jira board, and its active sprint.
- Fictional but realistic mock data for a 10-person team.
- Desktop-first responsive dashboard with a clean operational visual style.
- Sprint summary, progress-versus-time, burndown, status distribution, blockers, per-person point workload, and issue details.
- Local static web implementation with no authentication or build step.

### Out of Scope for Phase One

- Live Jira API calls, authentication, or automatic refresh.
- Utilization, billable hours, timesheets, client allocation, or cross-project staffing metrics.
- Multiple boards, projects, or sprint selection.
- Editing or transitioning Jira issues from the dashboard.
- Client-facing reporting, access controls, or remote hosting.

## 5. Functional Requirements

### 5.1 Sprint Header and Summary

- Show sprint name/key, team name, project type, sprint goal when available, start/end dates, and an as-of date.
- Show total points in the original sprint commitment and current scope.
- Show completed points and completion percentage relative to current scope.
- Show working days remaining and elapsed sprint days/percentage.
- Compare points completed with elapsed sprint time to expose pace variance; present this as a signal, not a guaranteed delivery forecast.

### 5.2 Scope Tracking

- Preserve the sprint's original committed points as a baseline.
- Track points added or removed after sprint start.
- Show current scope separately from original commitment and make the net scope change visible.
- Calculate completion against current scope while retaining the baseline for context.

### 5.3 Burndown and Risk Signals

- Render ideal and actual remaining-point lines across sprint days.
- Use dated daily snapshots in the mock dataset; do not fabricate history from a single current-state snapshot.
- Ensure the current actual value agrees with the remaining points in the issue dataset.
- Show the progress-versus-time comparison alongside the chart.

### 5.4 Workflow and Blockers

- Display issue counts and points across `To Do`, `In Progress`, `In Review`, and `Done`.
- Treat Jira's flagged/impediment field as the source of truth for blocked issues; do not infer blocked state from issue text.
- Show blocked issue key, summary, status, assignee, and flag in the issue list.

### 5.5 Team Workload

- Show all 10 teammates and each person's assigned total points, completed points, and remaining points for the sprint.
- Do not infer capacity limits, utilization, performance ratings, or over-allocation from story-point totals.
- Use accessible names and text labels so workload is not conveyed only by color or bar length.

### 5.6 Issue List and Filters

- Show issue key, summary, assignee, status, priority, and story points.
- Provide status, assignee, and blocked-only filters.
- Allow filters to be combined and update visible issues and result counts immediately.
- Show an explicit empty state when no issues match.

## 6. Data Model

Use local JSON data loaded by the browser. The schema should keep the eventual Jira adapter separate from rendering logic.

```json
{
  "project": {
    "name": "Staff Augment Project",
    "type": "Staff Augment",
    "teamName": "Platform Team",
    "teamSize": 10
  },
  "sprint": {
    "key": "TEAM-24",
    "name": "Sprint 24",
    "goal": "Example sprint goal",
    "startDate": "2026-09-21",
    "endDate": "2026-10-02",
    "asOf": "2026-09-28",
    "originalCommittedPoints": 72,
    "currentScopePoints": 78,
    "scopeChanges": [
      { "date": "2026-09-24", "points": 6, "direction": "added" }
    ]
  },
  "teamMembers": [
    { "id": "member-1", "name": "Example Teammate" }
  ],
  "issues": [
    {
      "key": "TEAM-123",
      "summary": "Example issue",
      "assigneeId": "member-1",
      "status": "In Progress",
      "priority": "High",
      "storyPoints": 5,
      "flagged": false
    }
  ],
  "burndown": [
    { "date": "2026-09-21", "remainingPoints": 78 }
  ]
}
```

The actual mock dataset must contain 10 distinct team members and enough daily burndown points for the sprint. Aggregate values should be derived from issue records where possible; if a value is explicitly stored, tests or validation must check that it matches the issue data.

## 7. Technical Architecture

- Deliver as a standalone static web app in a separate dashboard directory; do not modify the existing `work/jira-dashboard` prototype.
- Use semantic HTML, CSS, and vanilla JavaScript with JSON loaded via `fetch` from a local HTTP server.
- Render charts using SVG or another dependency-free browser-native approach unless a later requirement justifies a chart library.
- Keep data loading, metric calculation, chart rendering, and filtering in separable functions so the mock data source can later be replaced by a Jira adapter.
- No server-side component, package installation, or build step is required for phase one.
- Document the local run command and supported browser assumptions.

## 8. UX, Accessibility, and Responsive Behavior

- Prioritize an at-a-glance desktop layout suitable for sprint reviews and team check-ins.
- Support narrow mobile viewports without page-level horizontal overflow; horizontally scrolling issue tables are acceptable when necessary.
- Use clear labels, keyboard-accessible native filters, visible focus states, and accessible text alternatives for charts.
- Distinguish status and blocked state with text as well as color.
- Mark all fictional data clearly as sample/demo data.
- Respect reduced-motion preferences and avoid relying on animation to convey information.

## 9. Privacy and Security

- Use fictional data only; do not include actual team member, client, or Jira issue data in the committed mock dataset.
- Do not request, store, or embed Jira credentials in phase one.
- Treat per-person workload as operational context, not a performance score.
- A future hosted or Jira-connected version requires a separate access-control and secret-management design.

## 10. Acceptance Criteria

- The standalone dashboard loads locally and clearly identifies the Staff Augment project and 10-person team.
- The header and summary distinguish original commitment from current scope and show completed points, current-scope completion percentage, elapsed sprint time, and working days remaining.
- The burndown renders ideal and actual daily trends, and its current point value agrees with issue data.
- Status counts and point totals reconcile with the issue list.
- All 10 teammates appear in the workload view with assigned, completed, and remaining points derived from their issues.
- The flagged/impediment marker is the only source of blocked state.
- Combined status, assignee, and blocked-only filters return correct results, update counts, and display an empty state when applicable.
- The layout remains readable on desktop and mobile, with no unintended page-level horizontal overflow.
- The existing `work/jira-dashboard` prototype is left unchanged.

## 11. Validation Plan

- Validate JSON structure and consistency between issue-level and aggregate metrics.
- Test metric calculations for zero points, scope changes, sprint boundary dates, and empty issue/filter results.
- Exercise each filter alone and in combination with browser-level checks.
- Inspect desktop and mobile layouts in a browser and confirm charts render with accessible labels.
- Confirm the dashboard works when served over HTTP from its local directory.

## 12. Assumptions and Future Decisions

- The team's standard Jira status flow maps to `To Do`, `In Progress`, `In Review`, and `Done`.
- Jira's flagged/impediment field is consistently maintained for blocked work.
- Story points are the team's reliable effort measure; time tracking is not in phase-one scope.
- Local preview is sufficient for phase-one validation even though the intended operational audience includes the PM and team.
- Before live integration, confirm Jira Cloud versus Data Center, the board/project identifiers, API field mappings, credentials/authentication, and how work should be refreshed.
- Before team-wide use, choose approved shared hosting and define who may see individual workload data.
