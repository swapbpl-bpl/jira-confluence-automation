# Instruction Validation Report

- Files processed: 9
- Files with warnings: 2
- Files with failures: 0

## instructions/calculate-compound-interest.agent.md
- SRP: Pass
- Markdown: Pass
- Action items:
  - [ ] Gather principal, annual rate, compound frequency, and years
  - [ ] Ask the user if any value is missing or ambiguous
  - [ ] Run `python tools/compound_interest.py <principal> <annual_rate> <compounds_per_year> <years>`
  - [ ] Report the actual final amount and interest earned

## instructions/create-status-report.agent.md
- SRP: Pass
- Markdown: Pass
- Action items:
  - [ ] Gather accomplishments, blockers, and next-week work
  - [ ] Condense each item into a short bullet
  - [ ] Produce a Markdown report with the required sections

## instructions/creating-instructions.agent.md
- SRP: Warning
- Markdown: Pass
- Action items:
  - [ ] Add a new instruction to the `instructions/` folder
  - [ ] Update `instructions/main.agent.md` with a one-line description
  - [ ] Install the required IDE entry-point files if missing
  - [ ] Create a new prompt or rule wrapper when needed
- Note: This file intentionally covers infrastructure, IDE adapters, and project-wide workflow guidance; it is broader than a single workflow but is treated as an infrastructure exception rather than a failure.

## instructions/fetch.data.agent.md
- SRP: Pass
- Markdown: Pass
- Action items:
  - [ ] Obtain the Jira sprint ID from the user
  - [ ] Validate that required environment variables are set
  - [ ] Run `python tools/fetch_data.py <sprint_number>`
  - [ ] Summarize the sprint metadata and issue list for the user

## instructions/generate-jira-query.agent.md
- SRP: Pass
- Markdown: Pass
- Action items:
  - [ ] Ask or infer the reporting scenario
  - [ ] Produce a single JQL query with context comment
  - [ ] Use standard Jira fields unless a custom field is specified
  - [ ] Return the result in a fenced `jql` code block

## instructions/generate-summary-content.agent.md
- SRP: Pass
- Markdown: Pass
- Action items:
  - [ ] Use the sprint metadata and precomputed metrics as input
  - [ ] Generate the executive summary without ticket IDs or Jira jargon
  - [ ] Build metrics, completed-work, carried-over, and risk sections
  - [ ] Assemble all sections in the fixed required order

## instructions/main.agent.md
- SRP: Pass (catalog exception)
- Markdown: Pass
- Action items:
  - [ ] Keep the catalog up to date for all instruction files
  - [ ] Add entries for new instructions with keywords and context
- Note: This file is intentionally a registry, not a single workflow instruction.

## instructions/validate-instructions.agent.md
- SRP: Pass
- Markdown: Pass
- Action items:
  - [ ] Validate each instruction file for SRP and formatting
  - [ ] Extract action items from the current instruction text
  - [ ] Write the report to `reports/instruction-validation-report.md`
  - [ ] Refine the instruction file if validation findings are inconsistent

## instructions/write-meeting-notes.agent.md
- SRP: Pass
- Markdown: Pass
- Action items:
  - [ ] Read all meeting notes before summarizing
  - [ ] Produce only `## Summary`, `## Decisions`, and `## Action Items`
  - [ ] Use a table for action items with Owner, Action, and Due Date
  - [ ] Use `TBD` when owner or due date is missing

- Files with warnings: 2
- Files with failures: 0
