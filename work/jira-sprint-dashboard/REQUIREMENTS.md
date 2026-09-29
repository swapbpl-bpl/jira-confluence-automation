# Sprint Progress Dashboard Requirements

## Purpose

Give the sprint team a clear view of current delivery progress, remaining work, time left, and blockers. The dashboard should support standup and sprint-health conversations without requiring users to inspect Jira issues one by one.

## Audience and Scope

- Primary audience: the whole sprint team.
- Show one team's active sprint and its current scope.
- Build a standalone dashboard separate from the existing `work/jira-dashboard` prototype; leave that prototype unchanged.
- Use fictional mock data for this first version. Do not connect to Jira or require Jira credentials.
- Keep the data source replaceable so a Jira integration can be considered later.

## Sprint Progress

- Make story-point completion the primary progress measure.
- Calculate completion from completed story points divided by the current total sprint scope.
- Show points completed, total current-scope points, and completion percentage.
- Compare sprint time elapsed with work completed so the team can see whether delivery is keeping pace.
- Show working days remaining and the sprint end date.
- Display a burndown chart with ideal and actual remaining points across sprint days. The mock dataset must include daily snapshots so the chart shows a trend, not just a single current value.

## Team and Issue Health

- Show an issue-status breakdown for To Do, In Progress, In Review, and Done.
- Clearly identify blocked issues.
- Show story-point workload by teammate, distinguishing completed points from remaining points.
- Provide an issue list with issue key, summary, assignee, status, priority, and story points.
- Provide filters for status, assignee, and blocked-only issues. Filters should work together and update the visible issue list and result count.
- Show a useful empty state when no issues match the selected filters.

## Design and Accessibility

- Use a clean operational interface that is easy to scan during team discussions.
- Prioritize desktop layouts while keeping the dashboard usable on mobile screens.
- Use clear, consistent visual distinctions for issue states and blockers.
- Keep controls labeled and keyboard accessible; provide accessible names or text alternatives for charts and visual metrics.

## Data Requirements

- Use fictional but realistic sprint, issue, assignee, and burndown data.
- Ensure the sample data is internally consistent: status totals equal the issue count, point totals match the current sprint scope, completed points match the Done issues, and the current burndown value matches remaining points.
- Include enough sprint-day history to render both ideal and actual burndown lines.
- Clearly identify the data as sample/demo data in the interface.

## Out of Scope for This Version

- Jira REST API integration, Jira authentication, or live refresh.
- Combining multiple boards or projects, or selecting among sprints.
- Editing Jira issues from the dashboard.
- Using real team or customer data in the mock dataset.

## Acceptance Criteria

- The dashboard opens as a standalone static HTML/CSS/JavaScript experience using its local sample data.
- A teammate can understand point completion, elapsed sprint time, days remaining, status distribution, workload, and blockers at a glance.
- The burndown chart shows a day-by-day ideal and actual trend, and its current value agrees with the issue data.
- Status, assignee, and blocked-only filters update the issue list correctly, including when more than one filter is active.
- Desktop and mobile layouts remain legible and do not introduce unintended horizontal page overflow.
- The existing `work/jira-dashboard` prototype remains unchanged.

## Future Decisions

- Jira hosting environment and authentication method when live integration begins.
- Which Jira project/board identifiers and issue fields should map to the dashboard data model.
- Whether the first live version should continue to show only the active sprint or later support sprint selection.