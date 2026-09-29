# Weekly Status Report Automation

## Generated Report

Run the generator manually from the repository root:

```bash
python scripts/generate_status_report.py
```

By default, it reports on the previous complete Monday-to-Sunday UTC week and writes `status-reports/status-report-<start>-to-<end>.md`. The report contains exactly the `Accomplishments`, `Blockers`, and `Next Week` sections and is limited to 20 lines.

Git commit subjects are listed as repository activity, not independently verified delivery claims. Review them before sharing if the distinction matters to stakeholders. The generator discovers Git repositories beneath the workspace when run locally. The scheduled GitHub Actions workflow sees only repositories checked out on its runner, which by default is this repository.

## Weekly Notes

Before the scheduled run, copy `status-reports/weekly-inputs/weekly-input-template.md` to `status-reports/weekly-inputs/weekly-input-<week-start>.md`, where `<week-start>` is the Monday date in `YYYY-MM-DD` format. Add bullets beneath `## Blockers` and `## Next Week`; write `- None reported.` when a section has no items. Commit the dated input file before Monday at 09:00 UTC. Missing notes are reported as `No weekly notes supplied.` rather than inferred.

## Schedule and Manual Runs

`.github/workflows/weekly-status-report.yml` runs every Monday at 09:00 UTC and can also be started with GitHub Actions' **Run workflow** control. It generates the report for the previous complete week and commits the dated report file to the branch that triggered the workflow. The workflow requires `GITHUB_TOKEN` content write permission and a branch that allows the workflow to push.

The command-line generator also supports `--start-date` and `--end-date` in `YYYY-MM-DD` format, `--days` for a rolling interval, `--author` to filter commits, `--repo` to select one repository, `--notes` to specify a notes file, and `--output` to choose the destination.
