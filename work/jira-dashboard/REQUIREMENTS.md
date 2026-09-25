# Sprint Progress Dashboard — Requirements

## Overview
A "Jira" sprint progress dashboard for the team, built as a static web page (no backend, no build step).

## Data Source
- **Mock/sample data** for now — no live Jira API integration.
- Data lives in a single JSON file (`data.json`) representing a **single sprint snapshot**:
  - Sprint metadata: name, team, start date, end date, "today" reference date.
  - Issues list: id, title, status, story points, assignee, flagged (blocker) flag.
- No daily history file — the snapshot only reflects current state, not day-by-day history.

## Platform / Tech Stack
- **Static HTML/JS/CSS**, opened via a simple local HTTP server (fetch() requires http://, not file://).
- Charts rendered with **Chart.js**, loaded via CDN — no npm install or build tooling.

## Metrics / Widgets
1. **Sprint summary stats** — total points, completed points, % complete, days remaining.
2. **Burndown chart** — ideal burndown line (straight line from total points to 0 across the sprint), plus a single **actual remaining-points marker for "today"** (derived from the snapshot, since there's no daily history).
3. **Status breakdown** — bar chart of issue counts across To Do / In Progress / In Review / Done.
4. **Blockers & flagged issues** — list of issues marked `flagged: true`, showing id, title, status, and assignee.

## File Location
- Lives in `work/jira-dashboard/` (grouped with other task work in the `work/` folder), containing:
  - `index.html` — page structure
  - `styles.css` — dark-themed styling
  - `app.js` — data loading, calculations, and chart rendering
  - `data.json` — editable mock sprint data

## Out of Scope (for now)
- Live Jira REST API integration.
- Historical/day-by-day burndown data.
- Assignee workload view (considered, not selected).
- Authentication, hosting/deployment.

## How to Run
Serve the folder locally (browsers block `fetch()` on `file://`):
```
python -m http.server 8765 --directory work/jira-dashboard
```
Then open `http://localhost:8765`. Edit `data.json` to update sprint data; all stats and charts recalculate automatically on reload.
