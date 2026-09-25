# Status Report

**Project/Team:** Jira Dashboard
**Report Period:** 2026-09-18 – 2026-09-24
**Prepared By:** Swapnil Saxena
**Date Submitted:** 2026-09-24

## Summary

Completed the core dashboard layout and connected it to sample Jira data. Calculator module refactor is done and merged. One risk: the live Jira API integration is still blocked on credentials from IT.

**Overall Status:** 🟡 At Risk

## Accomplishments

- Built the Jira dashboard UI (`app.js`, `index.html`, `styles.css`) with sample data rendering
- Added `multiply` function and additional test coverage to the calculator module
- Wrote initial README and project ideas doc for the module03-task project

## In Progress

| Item | Owner | Status | Target Date |
|------|-------|--------|--------------|
| Live Jira API integration | Swapnil Saxena | Blocked | 2026-10-01 |
| Stakeholder report generator script | Swapnil Saxena | In Progress | 2026-09-28 |
| Dashboard responsive styling | Swapnil Saxena | Not Started | 2026-10-03 |

## Blockers / Risks

| Issue | Impact | Mitigation / Help Needed |
|-------|--------|---------------------------|
| Waiting on Jira API credentials from IT | Can't test live data; dashboard remains sample-data only | Escalated request to IT on 2026-09-22; need approval by 2026-09-26 |

## Metrics

| Metric | This Period | Last Period | Target |
|--------|--------------|-------------|--------|
| Commits | 3 | 5 | — |
| Files changed | 11 | 8 | — |
| Test coverage (calculator) | 85% | 70% | 90% |

## Next Steps

- Follow up with IT on Jira API credentials
- Finish stakeholder report generator script
- Start responsive styling for the dashboard

## Notes

Jira dashboard sample data is in `work/jira-dashboard/data.json`. Requirements tracked in `work/jira-dashboard/REQUIREMENTS.md`.
