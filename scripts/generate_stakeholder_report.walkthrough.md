# Walkthrough: generate_stakeholder_report.py

## Summary

This script helps create a stakeholder-friendly weekly status report in Markdown. It is designed for team updates that need to be readable by non-technical audiences and easy to share with project stakeholders.

The workflow is interactive:

1. It asks for the project name, author, and reporting date range.
2. It prompts for an executive summary and a few key categories:
   - Progress & Highlights
   - Upcoming / Next Steps
   - Risks & Blockers
   - Key Metrics
3. It turns those entries into a structured report with headings and bullet lists.
4. It writes the final result to the `stakeholder-reports/` folder by default.

The script is useful when you want a polished weekly update without manual formatting. It creates sections such as `## Executive Summary`, `## Progress & Highlights`, `## Upcoming / Next Steps`, `## Risks & Blockers`, and `## Key Metrics`.

Key implementation ideas:

- `prompt_bullets()` gathers multi-line bullet data from user input.
- `prompt_metrics()` collects metric name/value pairs in the format `name = value`.
- `build_report()` assembles the final Markdown content.
- `main()` parses CLI options and writes the output file.

Example command:

```bash
python scripts/generate_stakeholder_report.py --project "Project Phoenix" --author "Swapnil Saxena"
```

This generates a report file in the `stakeholder-reports/` folder unless an output path is explicitly provided.

## Quiz

### 1. What folder does the script write to by default?
A. `reports/`
B. `stakeholder-reports/`
C. `status-reports/`
D. `scripts/`

Answer: B. `stakeholder-reports/`

### 2. Which helper collects metric entries like `Throughput = 85`?
A. `prompt_bullets()`
B. `prompt_metrics()`
C. `build_report()`
D. `main()`

Answer: B. `prompt_metrics()`

### 3. What is the purpose of the `build_report()` function?
A. To scan the git repository
B. To parse command-line arguments
C. To assemble the Markdown report content
D. To display the current date

Answer: C. To assemble the Markdown report content

### 4. What is the default value for the project name if no argument is supplied?
A. `Project Phoenix`
B. `Weekly Report`
C. `Project`
D. `Status Update`

Answer: C. `Project`
