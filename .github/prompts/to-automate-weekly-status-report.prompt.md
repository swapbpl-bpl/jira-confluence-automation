---
agent: agent
---

Implement end-to-end automation for the weekly stakeholder status report in this repository. Follow `./instructions/create-status-report.agent.md` for report content and `./instructions/main.agent.md` for project conventions.

## Inspect First

- Review `scripts/generate_status_report.py`, its walkthrough, existing reports, and available tests or CI workflows before editing.
- Reuse `scripts/generate_status_report.py`; avoid adding a second report-generation path or unnecessary dependencies.
- Preserve unrelated user changes and keep the implementation within the report automation workflow.

## Required Behavior

- Generate one report for the previous complete Monday-to-Sunday UTC period, with stable boundaries regardless of the runner's local timezone.
- Run automatically every Monday at 09:00 UTC and support manual workflow dispatch.
- Save a dated Markdown report under `status-reports/` and commit only that generated report to the triggering branch.
- Treat Git commit subjects as repository activity, not independently verified delivery claims. Read blockers and next-week plans from a dated weekly notes file under `status-reports/weekly-inputs/`; do not infer missing information.
- Keep the report within 20 lines and use exactly the required `Accomplishments`, `Blockers`, and `Next Week` sections. Handle empty commit periods and missing notes explicitly.
- Document that GitHub Actions sees only repositories checked out on its runner; do not imply that it can access local workspace repositories.
- Keep the existing command-line workflow usable, including its supported filters and output option, unless a demonstrated defect requires a compatible correction.

## Validation and Completion

- Add or update focused tests for date-window boundaries, report formatting, weekly notes, and periods with no commits; cover any other behavior changed.
- Validate the generator and workflow using the repository's available checks. Do not claim that a scheduled run succeeded unless it was actually executed by CI.
- Update the walkthrough or relevant documentation with how to run the generator manually, how to prepare weekly notes, when the scheduled run occurs, and how reports are committed.
- In the completion summary, identify the files changed, the checks run, and any remaining setup or data-source limitation.